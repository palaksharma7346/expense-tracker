const User = require("../models/User");
const Income = require("../models/Income");
const ExcelJS = require("exceljs");
const fs = require('fs');
const path = require('path');
// add income user
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    console.log("🔥 req.user:", req.user);
    try{
        const { icon, amount, source, date } = req.body;

        // Check if all fields are filled
        if (!icon || !amount || !source) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        const newIncome = new Income({
            userId,
            icon,
            amount,
            source,
            date:  date ? new Date(date) : Date.now() // Use provided date or current date
        });
        await newIncome.save();
        res.status(201).json({ newIncome });

    }
    catch (error) {
        console.error("Error in addIncome:", error);
        res.status(500).json({ message: "Server error" });
    }
}
// Get all incomes source
exports.getAllIncomes = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await Income.find({ userId }).sort({ date: -1 });
        res.json(income);
    } catch (error) {
        console.error("Error in getAllIncomes:", error);
        res.status(500).json({ message: "Server error" });
    }

}
// Delete an income entry
exports.deleteIncome = async (req, res) => {
 
    try {
         await Income.findOneAndDelete({ _id: req.params.id });

         res.json({ message: "Income deleted successfully" });

        } 
        catch (error) {
        
        res.status(500).json({ message: "Server error" });
    }
}
// Download income data as Excel file
exports.downloadIncomeExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const incomes = await Income.find({ userId }).sort({ date: -1 });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Income');

    // Define columns
    worksheet.columns = [
      { header: 'Source', key: 'source', width: 30 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
    ];

    // Add data rows
    incomes.forEach((item) => {
      worksheet.addRow({
        source: item.source,
        amount: item.amount,
        date: item.date.toLocaleDateString(),
      });
    });

    // Temp file path
    const filePath = path.join(__dirname, '../uploads/income_details.xlsx');
    // Write the file
    await workbook.xlsx.writeFile(filePath);

    // Send the file
    res.download(filePath, 'income_details.xlsx', (err) => {
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
    

