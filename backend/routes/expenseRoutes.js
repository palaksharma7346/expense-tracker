const express = require("express");
const {
    addExpense,
    getAllExpenses,
    deleteExpense,
    downloadExpenseReport
} = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/add", protect, addExpense);
router.get("/get", protect, getAllExpenses);
router.delete("/:id", protect, deleteExpense);
router.get("/download", protect, downloadExpenseReport);

module.exports = router;