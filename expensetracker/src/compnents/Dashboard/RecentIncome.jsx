
import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

const RecentIncome = ({ transactions, onSeeMore }) => {
  console.log("RecentIncome transactions:", transactions);
  return (
    <div className='card'>
        <div className='flex items-center justify-between '>
            <h5 className='text-lg font-semibold'>Income sources</h5>
            <button
            onClick={onSeeMore}
            className='card-btn'>See All
            <LuArrowRight className='text-base'/>
            </button>
        </div>
      <div className='mt-5'>
        {transactions && transactions.length > 0 ? (
          transactions.slice(0,5).map((item)=>(
            <TransactionInfoCard
            key={item._id}
            title = {item.source}
            icon = {item.icon}
            date = {moment(item.date).format("DD MMM, YYYY")}
            amount = {item.amount}
            type = "income"
            hideDeleteBtn
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">No recent income transactions found.</p>
        )}
      </div>
    </div>
  );
};

export default RecentIncome
