const Income = require('../models/Income');
const Expense = require('../models/Expense');

const {isValidObjectId, Types} = require('mongoose');

//Dashboard data
exports.getDashboardData = async (req, res) => {

    try{
         console.log("✅ Dashboard controller hit");
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        const totalIncome = await Income.aggregate([
            {
                $match: {userId: userObjectId}
            },
            {
                $group: {
                    _id: null,
                    total: {$sum: '$amount'}
                }
            }
        ]);
        console.log("Total Income:", {totalIncome, userId: isValidObjectId(userId)});

        const totalExpense = await Expense.aggregate([
            {
                $match: {userId: userObjectId}
            },
            {
                $group: {
                    _id: null,
                    total: {$sum: '$amount'}
                }
            }
        ]);
        const last60daysincometransactions = await Income.find({
            userId,
            date: {$gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)},
        }).sort({date: -1});

        const incomelast60days = last60daysincometransactions.reduce((sum,transaction) => sum + transaction.amount, 0);

        const last30daysexpensetransactions = await Expense.find({
            userId,
            date: {$gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)},
        }).sort({date: -1});
        const expenselast30days = last30daysexpensetransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

        const lasttransactions = [
            ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map(
                (txn)=> ({...txn.toObject(), type: 'income'})
            ),
            ...(await Expense.find({ userId }).sort({ date: -1 }).limit(5)).map(
                (txn)=> ({...txn.toObject(), type: 'expense'})
            )
        ].sort((a, b) => (b.date - a.date));

        res.json({
            totalbalance:
            (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            last30daysexpense: {
                total: expenselast30days,
                transactions: last30daysexpensetransactions
            },
            last60daysincome: {
                total: incomelast60days,
                transactions: last60daysincometransactions
            },
            recenttransactions: lasttransactions,
        });
    } catch (error) {
       console.error("❌ Dashboard error:", error);
        res.status(500).json({ message: "Server error" });
    }
}
