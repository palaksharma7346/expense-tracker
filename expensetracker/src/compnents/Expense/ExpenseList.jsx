import React from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

const ExpenseList = ({transactions, onDelete, onDownload}) => {
  return (
    <div className='card'>
        <div className='flex items-center justify-between'>
            <h5 className='text-lg'>All Expenses</h5>
            <button
            className='card-btn'
            onClick={onDownload}>
                <LuDownload className='text-base'/>
                Download</button>
             </div>
             <div className='grid grid-cols-1 md:grid-cols-2'>
            {transactions && transactions.length > 0 ? (
                transactions.map((expense) => (
                    <TransactionInfoCard
                    key={expense._id}
                    title ={expense.category}
                    amount={expense.amount}
                    date={moment(expense.date).format('DD-MM-YYYY')}
                    type = "expense" 
                    onDelete = {() => onDelete(expense._id)}    />
                ))
            ) : (
                <p className='text-center w-full mt-4'>No expenses found.</p>
            )}

             </div>
      
    </div>
  )
}

export default ExpenseList
