import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

const ExpenseTransactions = ({ transactions, onSeeMore }) => {
  return (
    <div className='card'>
      <div className='flex justify-between items-center '>
        <h5 className='text-lg font-semibold'>Expenses</h5>
        <button
         onClick={onSeeMore}
         className='card-btn'>See All <LuArrowRight className='text-base'/>
         </button>
      </div>
        <div className='mt-5'>
            {transactions && transactions.length > 0 ? (
              transactions.slice(0, 5).map((expense) => (
                <TransactionInfoCard
                    key={expense._id}
                    title={expense.category}
                    icon={expense.icon}
                    date={moment(expense.date).format("DD MMM, YYYY")}
                    type="expense"
                    hideDeleteBtn
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent expense transactions found.</p>
            )}
        </div>
    </div>
  )
}

export default ExpenseTransactions
