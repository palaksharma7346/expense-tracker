import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import moment from 'moment'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
const RecentTransactions = ({ transactions = [], onSeeMore }) => {
  return (
    <div className='card'>
        <div className='flex justify-between items-center '>
            <h5 className='text-lg font-medium text-gray-800'>Recent Transactions</h5>
            <button className='card-btn' onClick={onSeeMore}>
                See All <LuArrowRight className='text-base' />
            </button>
        </div>
        <div className='mt-6'>
          {transactions && transactions.length > 0 ? (
          transactions?.slice(0,5).map((item)=>(
            <TransactionInfoCard
              key={item.id} 
              title = {item.type == 'expense' ? item.category : item.source}
              icon = {item.icon}
              date = {moment(item.date).format("DD MMM YYYY")}
              amount = {item.amount}
              type = {item.type}
              hideDeleteBtn 
               />
          ))
        ) : (
          <p className='text-sm text-gray-500'>No recent transactions found.</p>
        )}

        </div>

    </div>
  )
}

export default RecentTransactions
