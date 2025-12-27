import React, { useEffect, useState } from 'react'
import CustomPieChart from '../Charts/CustomPieChart'
const COLORS = ['#FFBB28', '#FF8042', '#00C49F', '#0088FE', '#AF19FF', '#FF4560'];
const RecentIncomeWithChart = ({ data, totalIncome }) => {
   console.log("RAW chart data:", data);
  console.log("RAW chart data length:", data?.length);
  const [charData, setCharData] = useState([]);
  const prepareChartData = () => {
  if (!data || data.length === 0) {
    setCharData([]);
    return;
  }

  const grouped = {};

  data.forEach((item) => {
    const key = item.source || "Unknown";
    const amount = Number(item.amount);

    if (!isNaN(amount) && amount > 0) {
      grouped[key] = (grouped[key] || 0) + amount;
    }
  });

  const finalData = Object.keys(grouped).map(key => ({
  name: key,
  amount: grouped[key],
}));

  console.log("FINAL pie data:", finalData);
  setCharData(finalData);
};

  useEffect(() => {
    prepareChartData();
    return () => {};
  }, [data]);
  return (
    <div className='card min-h-[300px]'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg font-semibold'>Last 60 days Income</h5>
      </div>
      {charData.length > 0 ? (
        <CustomPieChart data={charData} label="total Income" totalAmount={`$${totalIncome}`} showTextAnchor colors={COLORS} />
      ) : (
        <p className="text-sm text-gray-500 mt-4">No recent income data to display.</p>
      )}
    </div>
  )
}

export default RecentIncomeWithChart
