import React, { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu'
import CustomBarChart from '../Charts/CustomBarChart'
import { prepareIncomeBarChartData } from '../../utils/helper'
const IncomeOverview = ({ transactions, onAddIncome }) => {
    const [chartData, setChartData] = useState([])

    useEffect(() => {
        const result = prepareIncomeBarChartData(transactions);
        setChartData(result);
    }, [transactions]);
  return (
    <div className='card'>
        <div className='flex justify-between items-center'>
            <div className=''>
            <h5 className='text-lg font-semibold'> Income Overview </h5>
                <p className='text-sm text-gray-600 mt-0.5'>
                    Track Your Earning Overtime and analyse your trends
                </p>
        </div>
        <button
        onClick={onAddIncome}
        className='add-btn'>
        <LuPlus className='text-lg' />
        Add Income
        </button>
    </div>
    <div className='mt-10'>
<CustomBarChart data={chartData} />
    </div>
    </div>
  )
}

export default IncomeOverview
