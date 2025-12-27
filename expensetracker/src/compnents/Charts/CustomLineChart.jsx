import React from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,Area, AreaChart } from 'recharts';
const CustomLineChart = ({ data }) => {
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
          return (
            <div className='bg-white shadow-md rounded-lg p-3 border border-gray-200'>
                <p className=' text-xs font-semibold mb-1'> {payload[0].payload.category}</p>
                <p className=' text-sm text-gray-700'> 
                    Amount : <span className='text-sm text-gray-700 font-bold'>${payload[0].payload.amount}</span>
                </p>
            </div>
            );
        }
        return null;
    };
  return (
    <div className='bg-white'>
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart
            data={data}>
                <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid stroke = "none"/>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8884d8" }} stroke='none'/>
                <YAxis tick={{ fontSize: 12, fill: "#8884d8" }} stroke='none'/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="amount" stroke="#8884d8"  fill="url(#incomeGradient)" strokeWidth={3} dot = {{r:3, fill:"#8884d8"}} />
            </AreaChart>
            </ResponsiveContainer>
      
    </div>
  )
}

export default CustomLineChart
