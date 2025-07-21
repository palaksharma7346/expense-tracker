const User = require("../models/User");
const Expense = require("../models/Expense");
const ExcelJS = require("exceljs");
const fs = require('fs');
const path = require('path');
// add expense user
exports.addExpense = async (req, res) => {
    const userId = req.user.id;
    console.log("🔥 req.user:", req.user);
    try{
        const { icon, category, amount, date } = req.body;

        // Check if all fields are filled
        if (!icon || !category || !amount) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        const newExpense = new Expense({
            userId,
            icon,
            amount,
            category,
            date:  date ? new Date(date) : Date.now() // Use provided date or current date
        });
        await newExpense.save();
        res.status(201).json({ newExpense });

    }
    catch (error) {
        console.error("Error in addExpense:", error);
        res.status(500).json({ message: "Server error" });
    }
}
// Get all expense source
exports.getAllExpenses = async (req, res) => {
    const userId = req.user.id;
    try {
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.error("Error in getAllIncomes:", error);
        res.status(500).json({ message: "Server error" });
    }

}
// Delete an expense entry
exports.deleteExpense = async (req, res) => {
 
    try {
         await Expense.findOneAndDelete({ _id: req.params.id });

         res.json({ message: "Expense deleted successfully" });

        } 
        catch (error) {
        
        res.status(500).json({ message: "Server error" });
    }
}
// Download expense data as Excel file
exports.downloadExpenseReport = async (req, res) => {
  const userId = req.user.id;

  try {
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Expense');

    // Define columns
    worksheet.columns = [
      { header: 'Category', key: 'category', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    // Add data rows
    expenses.forEach((item) => {
      worksheet.addRow({
        category: item.category,
        amount: item.amount,
        date: item.date.toLocaleDateString(),
      });
    });

    // Temp file path
    const filePath = path.join(__dirname, '../uploads/expense_details.xlsx');
    // Write the file
    await workbook.xlsx.writeFile(filePath);

    // Send the file
    res.download(filePath, 'expense_details.xlsx', (err) => {
      if (err) {
        console.error('❌ Error sending file:', err.message);
        res.status(500).json({ message: 'File download failed' });
      }

      // Optional: delete file after sending
      // fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error("❌ Error generating Excel:", err.message);
    res.status(500).json({ message: "Server error while generating Excel file" });
  }
};
        // Create a buffer for the Excel file
    

