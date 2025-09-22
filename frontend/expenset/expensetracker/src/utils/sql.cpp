#include <bits/stdc++.h>
using namespace std;
#include <optional>
using std::optional;
/* ================================
   Tokenizer: Converts SQL input
   into a sequence of tokens
================================ */
enum class TokType {
    // Keywords
    SELECT, FROM, WHERE, AS, AND, OR, LIKE, IN,
    INSERT, INTO, VALUES, UPDATE, SET, DELETE,
    // Symbols
    STAR, COMMA, DOT, LPAREN, RPAREN, SEMI, EQ, NEQ, LT, LTE, GT, GTE,
    // Others
    IDENT, NUMBER, STRING,
    END, INVALID
};

// Token structure
struct Token {
    TokType type;  // type of token
    string lex;    // lexeme (text)
    int pos;       // position in input
    int line, col; // line and column
};

// Keyword map
static unordered_map<string, TokType> KW = {
    {"SELECT", TokType::SELECT}, {"FROM", TokType::FROM}, {"WHERE", TokType::WHERE},
    {"AS", TokType::AS}, {"AND", TokType::AND}, {"OR", TokType::OR},
    {"LIKE", TokType::LIKE}, {"IN", TokType::IN},
    {"INSERT", TokType::INSERT}, {"INTO", TokType::INTO}, {"VALUES", TokType::VALUES},
    {"UPDATE", TokType::UPDATE}, {"SET", TokType::SET}, {"DELETE", TokType::DELETE}
};

/* ================================
   Lexer Class
   - Reads input string
   - Generates tokens
================================ */
struct Lexer {
    string s;        // input string
    int i=0, n=0;    // current index, length
    int line=1, col=1;

    Lexer(const string& in): s(in), n((int)in.size()) {}

    bool done() const { return i>=n; }
    char peek(int k=0) const { return (i+k<n? s[i+k] : '\0'); }

    // advance one character
    void bump() {
        if (done()) return;
        if (s[i]=='\n') { line++; col=1; }
        else col++;
        i++;
    }

    // check identifier start / char
    static bool is_ident_start(char c){ return isalpha((unsigned char)c) || c=='_'; }
    static bool is_ident_char(char c){ return isalnum((unsigned char)c) || c=='_'; }

    // helper to make token
    Token make(TokType t, int start, int l, int c, string lex=""){
        if (lex.empty()) lex = s.substr(start, i-start);
        return Token{t, lex, start, l, c};
    }

    // parse string literal
    Token string_lit(){
        int start=i, l=line, c=col;
        bump(); // consume opening '
        string out;
        bool closed=false;
        while(!done()){
            char ch=peek();
            bump();
            if (ch=='\''){
                if (peek()=='\''){ out.push_back('\''); bump(); } 
                else { closed=true; break; }
            } else out.push_back(ch);
        }
        if(!closed) return Token{TokType::INVALID, "Unterminated string literal", start, l, c};
        return Token{TokType::STRING, out, start, l, c};
    }

    // parse number literal
    Token number(){
        int start=i, l=line, c=col;
        bool dot=false;
        while(isdigit((unsigned char)peek()) || (!dot && peek()=='.')){
            if (peek()=='.') dot=true;
            bump();
        }
        return make(TokType::NUMBER, start, l, c);
    }

    // parse identifier or keyword
    Token ident_or_kw(){
        int start=i, l=line, c=col;
        bump();
        while(is_ident_char(peek())) bump();
        string raw = s.substr(start, i-start);
        string up = raw;
        for (auto &ch: up) ch = (char)toupper((unsigned char)ch);
        auto it = KW.find(up);
        if (it!=KW.end()) return Token{it->second, raw, start, l, c};
        return Token{TokType::IDENT, raw, start, l, c};
    }

    // next token
    Token next(){
        while(isspace((unsigned char)peek())) bump();
        int start=i, l=line, c=col;
        if (done()) return Token{TokType::END, "", i, line, col};
        char ch = peek();

        // multi-char operators
        if (ch=='!' && peek(1)=='='){ bump(); bump(); return make(TokType::NEQ, start, l, c); }
        if (ch=='<' && peek(1)=='='){ bump(); bump(); return make(TokType::LTE, start, l, c); }
        if (ch=='>' && peek(1)=='='){ bump(); bump(); return make(TokType::GTE, start, l, c); }

        // single-char symbols
        switch(ch){
            case '*': bump(); return make(TokType::STAR, start, l, c);
            case ',': bump(); return make(TokType::COMMA, start, l, c);
            case '.': bump(); return make(TokType::DOT, start, l, c);
            case '(': bump(); return make(TokType::LPAREN, start, l, c);
            case ')': bump(); return make(TokType::RPAREN, start, l, c);
            case ';': bump(); return make(TokType::SEMI, start, l, c);
            case '=': bump(); return make(TokType::EQ, start, l, c);
            case '<': bump(); return make(TokType::LT, start, l, c);
            case '>': bump(); return make(TokType::GT, start, l, c);
            case '\'': return string_lit();
        }

        if (isdigit((unsigned char)ch)) return number();
        if (is_ident_start(ch)) return ident_or_kw();

        bump();
        return Token{TokType::INVALID, string(1, ch), start, l, c};
    }

    // tokenize entire input
    vector<Token> tokenize(){
        vector<Token> toks;
        for(;;){
            Token t = next();
            toks.push_back(t);
            if (t.type==TokType::END) break;
        }
        return toks;
    }
};

/* ================================
   AST Definitions
================================ */
struct Expr { string kind, value; vector<Expr> children; };

struct SelectItem { vector<string> path; bool isStar=false; string alias; };
struct TableRef { vector<string> path; string alias; };

struct InsertQuery { string table; vector<string> cols; vector<string> values; };
struct UpdateQuery { string table; vector<pair<string,string>> setList; optional<Expr> where; };
struct DeleteQuery { string table; optional<Expr> where; };

struct Query {
    string type; // SELECT/INSERT/UPDATE/DELETE
    vector<SelectItem> selectItems;
    vector<TableRef> from;
    optional<Expr> where;
    optional<InsertQuery> insertStmt;
    optional<UpdateQuery> updateStmt;
    optional<DeleteQuery> deleteStmt;
};

/* ================================
   Parser
   - Recursive descent parser
   - Supports SELECT, INSERT, UPDATE, DELETE
================================ */
struct ParseError : std::exception { 
    string msg; int line,col; 
    ParseError(string m,int l,int c):msg(m),line(l),col(c){} 
    const char* what() const noexcept override{ return msg.c_str(); } 
};

struct Parser {
    const vector<Token>& T; int k=0; const string& input;
    Parser(const vector<Token>& toks, const string& in): T(toks), input(in) {}
    
    const Token& peek(int d=0){ return T[min((int)T.size()-1,k+d)]; }
    bool match(TokType tt){ if(peek().type==tt){k++; return true;} return false; }
    const Token& expect(TokType tt,const string& label){ 
        if(peek().type==tt) return T[k++]; 
        auto tok=peek(); 
        throw ParseError("Expected "+label+" but found '"+tok.lex+"'",tok.line,tok.col); 
    }
    
    /* Dispatch based on first token */
    Query parseQuery(){
        const Token& t = peek();
        if(t.type==TokType::SELECT) return parseSelectQuery();
        if(t.type==TokType::INSERT) return parseInsertQuery();
        if(t.type==TokType::UPDATE) return parseUpdateQuery();
        if(t.type==TokType::DELETE) return parseDeleteQuery();
        throw ParseError("Unknown statement type: '"+t.lex+"'", t.line,t.col);
    }

    /* ===== SELECT parsing ===== */
    Query parseSelectQuery(){
        Query q; q.type="SELECT";
        expect(TokType::SELECT,"SELECT");
        if(match(TokType::STAR)) q.selectItems.push_back(SelectItem{{},true,""});
        else { q.selectItems.push_back(parseSelectItem()); while(match(TokType::COMMA)) q.selectItems.push_back(parseSelectItem()); }
        expect(TokType::FROM,"FROM");
        q.from.push_back(parseTableRef());
        while(match(TokType::COMMA)) q.from.push_back(parseTableRef());
        if(match(TokType::WHERE)) q.where=parseDisjunction();
        if(match(TokType::SEMI));
        if(peek().type!=TokType::END) { auto tok=peek(); throw ParseError("Unexpected token '"+tok.lex+"'",tok.line,tok.col); }
        return q;
    }

    SelectItem parseSelectItem(){
        SelectItem si; si.isStar=false; si.path=parseIdentPath();
        if(match(TokType::AS)){ const Token& id=expect(TokType::IDENT,"alias"); si.alias=id.lex; } 
        else if(peek().type==TokType::IDENT){ si.alias=peek().lex;k++; }
        return si;
    }
    TableRef parseTableRef(){ 
        TableRef tr; tr.path=parseIdentPath(); 
        if(match(TokType::AS)){ const Token& id=expect(TokType::IDENT,"table alias"); tr.alias=id.lex;} 
        else if(peek().type==TokType::IDENT){ tr.alias=peek().lex;k++;} 
        return tr; 
    }
    vector<string> parseIdentPath(){ const Token& first=expect(TokType::IDENT,"identifier"); vector<string> path{first.lex}; while(match(TokType::DOT)){ const Token& part=expect(TokType::IDENT,"identifier"); path.push_back(part.lex);} return path; }

    /* ===== Expression parsing for WHERE ===== */
    Expr parseDisjunction(){ Expr left=parseConjunction(); while(peek().type==TokType::OR){k++; Expr right=parseConjunction(); left={"bin","OR",{left,right}};} return left;}
    Expr parseConjunction(){ Expr left=parseCondition(); while(peek().type==TokType::AND){k++; Expr right=parseCondition(); left={"bin","AND",{left,right}};} return left;}
    Expr parseCondition(){ const Token& tok=peek(); if(tok.type==TokType::LPAREN){k++; Expr e=parseDisjunction(); expect(TokType::RPAREN,")"); return e;} Expr left=parseOperand(); const Token& op=peek(); if(op.type==TokType::EQ||op.type==TokType::NEQ||op.type==TokType::LT||op.type==TokType::LTE||op.type==TokType::GT||op.type==TokType::GTE||op.type==TokType::LIKE||op.type==TokType::IN){k++; Expr right=parseOperand(); return {"bin",op.lex,{left,right}};} throw ParseError("Expected condition operator",tok.line,tok.col);}
    Expr parseOperand(){ const Token& tok=peek(); if(tok.type==TokType::IDENT){k++; return {"ident",tok.lex,{}};} if(tok.type==TokType::NUMBER){k++; return {"number",tok.lex,{}};} if(tok.type==TokType::STRING){k++; return {"string",tok.lex,{}};} throw ParseError("Expected operand",tok.line,tok.col); }

    /* ===== INSERT parsing ===== */
    Query parseInsertQuery(){
        Query q; q.type="INSERT"; InsertQuery ins;
        expect(TokType::INSERT,"INSERT"); expect(TokType::INTO,"INTO");
        const Token& tbl=expect(TokType::IDENT,"table name"); ins.table=tbl.lex;
        if(match(TokType::LPAREN)){
            ins.cols.push_back(expect(TokType::IDENT,"column name").lex);
            while(match(TokType::COMMA)) ins.cols.push_back(expect(TokType::IDENT,"column name").lex);
            expect(TokType::RPAREN,")");
        }
        expect(TokType::VALUES,"VALUES"); expect(TokType::LPAREN,"(");
        ins.values.push_back(parseValue());
        while(match(TokType::COMMA)) ins.values.push_back(parseValue());
        expect(TokType::RPAREN,")");
        if(match(TokType::SEMI));
        q.insertStmt=ins;
        return q;
    }
    string parseValue(){ const Token& t=peek(); if(t.type==TokType::STRING||t.type==TokType::NUMBER){k++; return t.lex;} throw ParseError("Expected value",t.line,t.col); }

    /* ===== UPDATE parsing ===== */
    Query parseUpdateQuery(){
        Query q; q.type="UPDATE"; UpdateQuery up;
        expect(TokType::UPDATE,"UPDATE");
        const Token& tbl=expect(TokType::IDENT,"table name"); up.table=tbl.lex;
        expect(TokType::SET,"SET");
        string col=expect(TokType::IDENT,"column name").lex;
        expect(TokType::EQ,"=");
        string val=parseValue();
        up.setList.push_back({col,val});
        while(match(TokType::COMMA)){
            string c=expect(TokType::IDENT,"column name").lex;
            expect(TokType::EQ,"=");
            string v=parseValue();
            up.setList.push_back({c,v});
        }
        if(match(TokType::WHERE)) up.where=parseDisjunction();
        if(match(TokType::SEMI));
        q.updateStmt=up;
        return q;
    }

    /* ===== DELETE parsing ===== */
    Query parseDeleteQuery(){
        Query q; q.type="DELETE"; DeleteQuery del;
        expect(TokType::DELETE,"DELETE"); expect(TokType::FROM,"FROM");
        const Token& tbl=expect(TokType::IDENT,"table name"); del.table=tbl.lex;
        if(match(TokType::WHERE)) del.where=parseDisjunction();
        if(match(TokType::SEMI));
        q.deleteStmt=del;
        return q;
    }
};

/* ================================
   Main Function
================================ */
int main(){
    string sql;
    cout << "Enter SQL query:\n";
    getline(cin,sql);
    
    Lexer lex(sql);
    vector<Token> toks = lex.tokenize();

    Parser parser(toks,sql);
    try{
        Query q = parser.parseQuery();
        cout << "SQL parsed successfully. Statement type: " << q.type << endl;
    } catch(ParseError &e){
        cout << "Parse error at line " << e.line << " col " << e.col << ": " << e.msg << endl;
    }
}
