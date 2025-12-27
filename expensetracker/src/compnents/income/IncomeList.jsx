import moment from 'moment'
import React from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'

const IncomeList = ({transactions, onDelete, onDownload}) => {
  return (
    <div className="card">
      <div className='flex items-center justify-between'>
        <h5 className='text-lg'>Income Sources</h5>
        <button className="card-btn" onClick={onDownload}>
            <LuDownload className="text-base" /> Download
            </button>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
            {transactions && transactions.length > 0 ? (
                transactions.map((income) =>(
                <TransactionInfoCard
                key={income._id}
                title={income.source}
                amount={income.amount}
                date={moment(income.date).format("DD MMM, YYYY")}
                type="income"
                onDelete = {()=> {console.log("Delete icon clicked for income:", income._id); onDelete(income._id)}}
                />
            ))
            ) : (
                <p className='text-sm text-gray-500 mt-4'> No income added yet. </p>
            )}
            </div>
    </div>
  )
}

export default IncomeList
