const express = require("express");
const {addIncome, getAllIncomes, downloadIncomeExcel, deleteIncome} = require("../controllers/incomeController");
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addIncome);
router.get("/get", protect, getAllIncomes);
router.get("/downloadexcel", protect, downloadIncomeExcel);
router.delete("/:id", protect, deleteIncome);

module.exports = router;
