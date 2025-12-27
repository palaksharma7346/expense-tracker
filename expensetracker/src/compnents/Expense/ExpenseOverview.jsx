import React, { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import CustomLineChart from '../Charts/CustomLineChart';
import { prepareExpenseLineChartData } from '../../utils/helper';
const ExpenseOverview = ({transactions, onExpenseIncome}) => {
    const [chartData, setChartData] = useState([]);

    useEffect(()=>{
        const result = prepareExpenseLineChartData(transactions);
        setChartData(result);
        return ()=>{};
    }, [transactions]);
  return (
    <div className='card'>
      <div className='flex items-center justify-between '>
        <div className=''>
            <h5 className='text-lg'>Expense Overview</h5>
            <p className='text-xs text-gray-500 mt-0.5'>
                Track your spending trends over time and gain insights into your financial habits.
            </p>
        </div>
        <button className='add-btn' onClick={onExpenseIncome}>
            <LuPlus className='text-lg'/>
        </button>
      </div>
      <div className='mt-10'>
        <CustomLineChart data = {chartData}/>
      </div>
    </div>
  )
}

export default ExpenseOverview
