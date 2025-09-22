// sql.cpp  — C++11 mini SQL parser (SELECT / INSERT / UPDATE / DELETE)
// Compile:  g++ -std=gnu++11 sql.cpp -o sql

#include <iostream>
#include <string>
#include <vector>
#include <stdexcept>
#include <cctype>
#include <algorithm>
#include <utility>

using namespace std;

/* ================================
   Tokens & Lexer
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

struct Token {
    TokType type;
    string  lex;
    int     pos;
    int     line, col;
    Token(TokType t=TokType::END, const string& lx="", int p=0, int ln=1, int cl=1)
        : type(t), lex(lx), pos(p), line(ln), col(cl) {}
};

static TokType kw_or_ident(const string& up) {
    if (up == "SELECT") return TokType::SELECT;
    if (up == "FROM")   return TokType::FROM;
    if (up == "WHERE")  return TokType::WHERE;
    if (up == "AS")     return TokType::AS;
    if (up == "AND")    return TokType::AND;
    if (up == "OR")     return TokType::OR;
    if (up == "LIKE")   return TokType::LIKE;
    if (up == "IN")     return TokType::IN;
    if (up == "INSERT") return TokType::INSERT;
    if (up == "INTO")   return TokType::INTO;
    if (up == "VALUES") return TokType::VALUES;
    if (up == "UPDATE") return TokType::UPDATE;
    if (up == "SET")    return TokType::SET;
    if (up == "DELETE") return TokType::DELETE;
    return TokType::IDENT;
}

struct Lexer {
    string s; int i, n; int line, col;
    Lexer(const string& in) : s(in), i(0), n((int)in.size()), line(1), col(1) {}

    bool done() const { return i>=n; }
    char peek(int k=0) const { return (i+k<n)? s[i+k] : '\0'; }

    void bump() {
        if (done()) return;
        if (s[i] == '\n') { line++; col = 1; }
        else col++;
        i++;
    }

    static bool is_ident_start(char c){ return isalpha((unsigned char)c) || c=='_'; }
    static bool is_ident_char (char c){ return isalnum((unsigned char)c) || c=='_'; }

    Token make(TokType t, int start, int l, int c, const string& lex=""){
        if (lex.empty()) return Token(t, s.substr(start, i-start), start, l, c);
        return Token(t, lex, start, l, c);
    }

    Token string_lit(){
        int start=i, l=line, c=col;
        bump(); // consume opening '
        string out;
        bool closed=false;
        while(!done()){
            char ch = peek();
            bump();
            if (ch=='\''){
                if (peek()=='\''){ // escaped '
                    out.push_back('\''); bump();
                } else { closed=true; break; }
            } else {
                out.push_back(ch);
            }
        }
        if(!closed) return Token(TokType::INVALID, "Unterminated string literal", start, l, c);
        return Token(TokType::STRING, out, start, l, c);
    }

    Token number(){
        int start=i, l=line, c=col;
        bool dot=false;
        while (isdigit((unsigned char)peek()) || (!dot && peek()=='.')) {
            if (peek()=='.') dot=true;
            bump();
        }
        return make(TokType::NUMBER, start, l, c);
    }

    Token ident_or_kw(){
        int start=i, l=line, c=col;
        bump(); // consume first ident char
        while (is_ident_char(peek())) bump();
        string raw = s.substr(start, i-start);
        string up = raw; 
        for (size_t k=0;k<up.size();++k) up[k] = (char)toupper((unsigned char)up[k]);
        TokType tt = kw_or_ident(up);
        return Token(tt, raw, start, l, c);
    }

    Token next(){
        while (isspace((unsigned char)peek())) bump();
        int start=i, l=line, c=col;
        if (done()) return Token(TokType::END, "", i, line, col);
        char ch = peek();

        // multi-char ops
        if (ch=='!' && peek(1)=='='){ bump(); bump(); return make(TokType::NEQ, start, l, c); }
        if (ch=='<' && peek(1)=='='){ bump(); bump(); return make(TokType::LTE, start, l, c); }
        if (ch=='>' && peek(1)=='='){ bump(); bump(); return make(TokType::GTE, start, l, c); }

        // single-char
        switch(ch){
            case '*': bump(); return make(TokType::STAR,  start, l, c);
            case ',': bump(); return make(TokType::COMMA, start, l, c);
            case '.': bump(); return make(TokType::DOT,   start, l, c);
            case '(': bump(); return make(TokType::LPAREN,start, l, c);
            case ')': bump(); return make(TokType::RPAREN,start, l, c);
            case ';': bump(); return make(TokType::SEMI,  start, l, c);
            case '=': bump(); return make(TokType::EQ,    start, l, c);
            case '<': bump(); return make(TokType::LT,    start, l, c);
            case '>': bump(); return make(TokType::GT,    start, l, c);
            case '\'': return string_lit();
        }

        if (isdigit((unsigned char)ch)) return number();
        if (is_ident_start(ch))         return ident_or_kw();

        // unknown char -> invalid token
        bump();
        return Token(TokType::INVALID, string(1, ch), start, l, c);
    }

    vector<Token> tokenize(){
        vector<Token> out;
        for(;;){
            Token t = next();
            out.push_back(t);
            if (t.type == TokType::END) break;
        }
        return out;
    }
};

/* ================================
   AST
================================ */
struct Expr {
    string kind;        // "ident" | "number" | "string" | "bin"
    string value;       // op or literal
    vector<Expr*> kids; // for binary/compound nodes

    Expr(const string& k="", const string& v="") : kind(k), value(v), kids() {}
    ~Expr(){ for (size_t i=0;i<kids.size();++i) delete kids[i]; }
};

struct SelectItem {
    vector<string> path; // e.g. ["users","id"] or ["name"]
    bool isStar;
    string alias;
    SelectItem(): isStar(false) {}
};

struct TableRef {
    vector<string> path; // table or schema.table
    string alias;
};

struct InsertQuery {
    string table;
    vector<string> cols;
    vector<string> values; // as raw lexemes (already stripped for strings)
};

struct UpdateQuery {
    string table;
    vector<pair<string,string> > setList; // (col, value)
    Expr* where;
    UpdateQuery(): where(nullptr) {}
    ~UpdateQuery(){ delete where; }
};

struct DeleteQuery {
    string table;
    Expr* where;
    DeleteQuery(): where(nullptr) {}
    ~DeleteQuery(){ delete where; }
};

struct Query {
    string type;                 // "SELECT" | "INSERT" | "UPDATE" | "DELETE"
    // SELECT
    vector<SelectItem> selectItems;
    vector<TableRef>   from;
    Expr* where;                 // for SELECT
    // Other statements
    InsertQuery* insertStmt;
    UpdateQuery* updateStmt;
    DeleteQuery* deleteStmt;

    Query(): where(nullptr), insertStmt(nullptr), updateStmt(nullptr), deleteStmt(nullptr) {}
    ~Query(){
        delete where;
        delete insertStmt;
        delete updateStmt;
        delete deleteStmt;
    }
};

/* ================================
   Parser
================================ */
struct ParseError : std::runtime_error {
    int line, col;
    ParseError(const string& msg, int l, int c) : std::runtime_error(msg), line(l), col(c) {}
};

struct Parser {
    const vector<Token>& T;
    int k;
    const string& input;

    Parser(const vector<Token>& toks, const string& in) : T(toks), k(0), input(in) {}

    const Token& peek(int d=0) const {
        int idx = k + d;
        if (idx >= (int)T.size()) return T.back();
        return T[idx];
    }
    bool match(TokType tt){
        if (peek().type == tt){ k++; return true; }
        return false;
    }
    const Token& expect(TokType tt, const string& name){
        if (peek().type == tt) return T[k++];
        const Token& t = peek();
        throw ParseError("Expected " + name + " but found '" + t.lex + "'", t.line, t.col);
    }

    Query parseQuery(){
        const Token& t = peek();
        if (t.type == TokType::SELECT) return parseSelect();
        if (t.type == TokType::INSERT) return parseInsert();
        if (t.type == TokType::UPDATE) return parseUpdate();
        if (t.type == TokType::DELETE) return parseDelete();
        throw ParseError("Unknown statement start token '"+t.lex+"'", t.line, t.col);
    }

    // ---------- SELECT ----------
    Query parseSelect(){
        Query q; q.type = "SELECT";
        expect(TokType::SELECT, "SELECT");
        if (match(TokType::STAR)) {
            SelectItem si; si.isStar = true; q.selectItems.push_back(si);
        } else {
            q.selectItems.push_back(parseSelectItem());
            while (match(TokType::COMMA)) q.selectItems.push_back(parseSelectItem());
        }
        expect(TokType::FROM, "FROM");
        q.from.push_back(parseTableRef());
        while (match(TokType::COMMA)) q.from.push_back(parseTableRef());
        if (match(TokType::WHERE)) q.where = parseDisjunction();
        if (match(TokType::SEMI)) { /* optional ; */ }
        // allow END only after statement
        if (peek().type != TokType::END) {
            const Token& t = peek();
            throw ParseError("Unexpected token '"+t.lex+"'", t.line, t.col);
        }
        return q;
    }

    SelectItem parseSelectItem(){
        SelectItem si; si.isStar=false;
        si.path = parseIdentPath();
        if (match(TokType::AS)) {
            const Token& a = expect(TokType::IDENT, "alias");
            si.alias = a.lex;
        } else if (peek().type == TokType::IDENT) {
            si.alias = peek().lex; k++;
        }
        return si;
    }

    TableRef parseTableRef(){
        TableRef tr;
        tr.path = parseIdentPath();
        if (match(TokType::AS)) {
            const Token& a = expect(TokType::IDENT, "table alias");
            tr.alias = a.lex;
        } else if (peek().type == TokType::IDENT) {
            tr.alias = peek().lex; k++;
        }
        return tr;
    }

    vector<string> parseIdentPath(){
        const Token& first = expect(TokType::IDENT, "identifier");
        vector<string> path; path.push_back(first.lex);
        while (match(TokType::DOT)) {
            const Token& p = expect(TokType::IDENT, "identifier");
            path.push_back(p.lex);
        }
        return path;
    }

    // ---------- Expressions (WHERE) ----------
    Expr* parseDisjunction(){
        Expr* left = parseConjunction();
        while (peek().type == TokType::OR) {
            k++;
            Expr* right = parseConjunction();
            Expr* node = new Expr("bin", "OR");
            node->kids.push_back(left);
            node->kids.push_back(right);
            left = node;
        }
        return left;
    }
    Expr* parseConjunction(){
        Expr* left = parseCondition();
        while (peek().type == TokType::AND) {
            k++;
            Expr* right = parseCondition();
            Expr* node = new Expr("bin", "AND");
            node->kids.push_back(left);
            node->kids.push_back(right);
            left = node;
        }
        return left;
    }
    Expr* parseCondition(){
        const Token& t = peek();
        if (t.type == TokType::LPAREN){
            k++;
            Expr* e = parseDisjunction();
            expect(TokType::RPAREN, ")");
            return e;
        }
        Expr* left = parseOperand();
        const Token& op = peek();
        if (op.type==TokType::EQ || op.type==TokType::NEQ || op.type==TokType::LT ||
            op.type==TokType::LTE || op.type==TokType::GT  || op.type==TokType::GTE ||
            op.type==TokType::LIKE || op.type==TokType::IN) {
            k++;
            Expr* right = parseOperand();
            Expr* node = new Expr("bin", op.lex.empty()? op_to_string(op.type) : op.lex);
            node->kids.push_back(left);
            node->kids.push_back(right);
            return node;
        }
        throw ParseError("Expected condition operator", t.line, t.col);
    }

    static string op_to_string(TokType t){
        switch(t){
            case TokType::EQ:  return "=";
            case TokType::NEQ: return "!=";
            case TokType::LT:  return "<";
            case TokType::LTE: return "<=";
            case TokType::GT:  return ">";
            case TokType::GTE: return ">=";
            case TokType::LIKE:return "LIKE";
            case TokType::IN:  return "IN";
            default: return "?";
        }
    }

    Expr* parseOperand(){
        const Token& t = peek();
        if (t.type == TokType::IDENT) { k++; return new Expr("ident", t.lex); }
        if (t.type == TokType::NUMBER){ k++; return new Expr("number", t.lex); }
        if (t.type == TokType::STRING){ k++; return new Expr("string", t.lex); }
        throw ParseError("Expected operand", t.line, t.col);
    }

    // ---------- INSERT ----------
    Query parseInsert(){
        Query q; q.type = "INSERT";
        InsertQuery* ins = new InsertQuery();

        expect(TokType::INSERT, "INSERT");
        expect(TokType::INTO,   "INTO");
        ins->table = expect(TokType::IDENT, "table name").lex;

        if (match(TokType::LPAREN)) {
            ins->cols.push_back(expect(TokType::IDENT, "column name").lex);
            while (match(TokType::COMMA))
                ins->cols.push_back(expect(TokType::IDENT, "column name").lex);
            expect(TokType::RPAREN, ")");
        }

        expect(TokType::VALUES, "VALUES");
        expect(TokType::LPAREN, "(");
        ins->values.push_back(parseValue());
        while (match(TokType::COMMA)) ins->values.push_back(parseValue());
        expect(TokType::RPAREN, ")");

        if (match(TokType::SEMI)) { /* optional ; */ }
        q.insertStmt = ins;
        return q;
    }

    string parseValue(){
        const Token& t = peek();
        if (t.type == TokType::NUMBER || t.type == TokType::STRING) { k++; return t.lex; }
        throw ParseError("Expected value (number or string)", t.line, t.col);
    }

    // ---------- UPDATE ----------
    Query parseUpdate(){
        Query q; q.type = "UPDATE";
        UpdateQuery* up = new UpdateQuery();

        expect(TokType::UPDATE, "UPDATE");
        up->table = expect(TokType::IDENT, "table name").lex;
        expect(TokType::SET, "SET");

        // first assignment
        string col = expect(TokType::IDENT, "column name").lex;
        expect(TokType::EQ, "=");
        string val = parseValue();
        up->setList.push_back(std::make_pair(col, val));

        // more assignments
        while (match(TokType::COMMA)) {
            string c = expect(TokType::IDENT, "column name").lex;
            expect(TokType::EQ, "=");
            string v = parseValue();
            up->setList.push_back(std::make_pair(c, v));
        }

        if (match(TokType::WHERE)) up->where = parseDisjunction();
        if (match(TokType::SEMI)) { /* optional ; */ }
        q.updateStmt = up;
        return q;
    }

    // ---------- DELETE ----------
    Query parseDelete(){
        Query q; q.type = "DELETE";
        DeleteQuery* del = new DeleteQuery();

        expect(TokType::DELETE, "DELETE");
        expect(TokType::FROM,   "FROM");
        del->table = expect(TokType::IDENT, "table name").lex;

        if (match(TokType::WHERE)) del->where = parseDisjunction();
        if (match(TokType::SEMI)) { /* optional ; */ }
        q.deleteStmt = del;
        return q;
    }
};

/* ================================
   Pretty printing (simple)
================================ */
static void print_expr(const Expr* e){
    if (!e) { cout << "(null)"; return; }
    if (e->kind=="bin"){
        cout << "(";
        if (e->kids.size()>=1) print_expr(e->kids[0]);
        cout << " " << e->value << " ";
        if (e->kids.size()>=2) print_expr(e->kids[1]);
        cout << ")";
    } else {
        cout << e->value;
    }
}

static void print_query(const Query& q){
    cout << "Parsed: " << q.type << "\n";
    if (q.type=="SELECT"){
        cout << "  SELECT: ";
        for (size_t i=0;i<q.selectItems.size();++i){
            if (i) cout << ", ";
            const SelectItem& si = q.selectItems[i];
            if (si.isStar) cout << "*";
            else {
                for (size_t p=0;p<si.path.size();++p){
                    if (p) cout << ".";
                    cout << si.path[p];
                }
                if (!si.alias.empty()) cout << " AS " << si.alias;
            }
        }
        cout << "\n  FROM: ";
        for (size_t i=0;i<q.from.size();++i){
            if (i) cout << ", ";
            const TableRef& tr = q.from[i];
            for (size_t p=0;p<tr.path.size();++p){
                if (p) cout << ".";
                cout << tr.path[p];
            }
            if (!tr.alias.empty()) cout << " AS " << tr.alias;
        }
        cout << "\n";
        if (q.where){
            cout << "  WHERE: ";
            print_expr(q.where);
            cout << "\n";
        }
    } else if (q.type=="INSERT" && q.insertStmt){
        cout << "  INTO " << q.insertStmt->table << " (";
        for (size_t i=0;i<q.insertStmt->cols.size();++i){
            if (i) cout << ", ";
            cout << q.insertStmt->cols[i];
        }
        cout << ") VALUES (";
        for (size_t i=0;i<q.insertStmt->values.size();++i){
            if (i) cout << ", ";
            cout << q.insertStmt->values[i];
        }
        cout << ")\n";
    } else if (q.type=="UPDATE" && q.updateStmt){
        cout << "  TABLE " << q.updateStmt->table << "\n  SET ";
        for (size_t i=0;i<q.updateStmt->setList.size();++i){
            if (i) cout << ", ";
            cout << q.updateStmt->setList[i].first << " = " << q.updateStmt->setList[i].second;
        }
        cout << "\n";
        if (q.updateStmt->where){
            cout << "  WHERE: ";
            print_expr(q.updateStmt->where);
            cout << "\n";
        }
    } else if (q.type=="DELETE" && q.deleteStmt){
        cout << "  FROM " << q.deleteStmt->table << "\n";
        if (q.deleteStmt->where){
            cout << "  WHERE: ";
            print_expr(q.deleteStmt->where);
            cout << "\n";
        }
    }
}

/* ================================
   main
================================ */
int main(){
    cout << "Enter one SQL statement (end with Enter). ';' is optional.\n";
    string sql;
    if (!std::getline(cin, sql)) return 0;

    try{
        Lexer lex(sql);
        vector<Token> toks = lex.tokenize();
        // Quick invalid token check
        for (size_t i=0;i<toks.size();++i){
            if (toks[i].type == TokType::INVALID){
                throw ParseError("Invalid token: "+toks[i].lex, toks[i].line, toks[i].col);
            }
        }

        Parser parser(toks, sql);
        Query q = parser.parseQuery();
        print_query(q);
    }catch(const ParseError& e){
        // show caret under the error
        cerr << "Parse error at line " << e.line << ", col " << e.col << ": " << e.what() << "\n";
        cerr << sql << "\n";
        if (e.col >= 1){
            for (int i=1;i<e.col;i++) cerr << ' ';
            cerr << "^\n";
        }
        return 1;
    }catch(const std::exception& e){
        cerr << "Error: " << e.what() << "\n";
        return 1;
    }
    return 0;
}
