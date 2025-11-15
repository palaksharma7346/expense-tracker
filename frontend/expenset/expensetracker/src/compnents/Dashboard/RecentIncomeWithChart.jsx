import React, { useEffect, useState } from 'react'
import CustomPieChart from '../Charts/CustomPieChart'
const COLORS = ['#FFBB28', '#FF8042', '#00C49F', '#0088FE', '#AF19FF', '#FF4560'];
const RecentIncomeWithChart = ({ data, totalIncome }) => {
  const [charData, setCharData] = useState([]);
  const prepareChartData = () => {
    const dataArray = data?.map((item) => ({
      name: item?.source,
      amount: item?.amount,
    })) || [];
    setCharData(dataArray);
  };
  useEffect(() => {
    prepareChartData();
    return () => {};
  }, [data]);
  return (
    <div className='card'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg font-semibold'>Recent Income</h5>
      </div>
      <CustomPieChart data={charData} label="total Income" totalAmount = {`$${totalIncome}`} showTextAnchor colors={COLORS} />
    </div>
  )
}

export default RecentIncomeWithChart
