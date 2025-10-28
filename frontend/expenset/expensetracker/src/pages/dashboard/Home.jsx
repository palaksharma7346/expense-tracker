import React from 'react'
import DashboardLayout from '../../compnents/layouts/DashboardLayout.jsx'
import { useUserAuth } from '../../hooks/useUserAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_PATHS } from '../../utils/apiPaths.js';
import { useEffect } from 'react';
import InfoCard from '../../compnents/Cards/InfoCard.jsx';
import { IoMdCard } from 'react-icons/io';
import { addThousandsSeparator } from '../../utils/helper.js';
import { LuHandCoins,LuWalletMinimal } from 'react-icons/lu';
import RecentTransactions from '../../compnents/Dashboard/RecentTransactions.jsx';
import FinanceOverview from '../../compnents/Dashboard/FinanceOverview.jsx';
import Last30DaysExpenses from '../../compnents/Dashboard/last30DaysExpenses.jsx';
import RecentIncomeWithChart from '../../compnents/Dashboard/RecentIncomeWithChart.jsx';
import ExpenseTransactions from '../../compnents/Dashboard/ExpenseTransactions.jsx';
const Home = () => {
  useUserAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading,setLoading] = useState(false);

  const fetchDashboardData = async ()=>{
    if(loading) return;
    setLoading(true);
    try{
      const response = await axiosInstance.get(`${API_PATHS.DASHBOARD.GET_DATA}`);
      if(response.data){
        setDashboardData(response.data);
      }
    }
    catch(error){
      console.log("something went wrong. Please try again ",error)
    }
    finally{
      setLoading(false);
    }
  };
  useEffect(()=>{
    fetchDashboardData();
    return ()=>{};
  },[]);

  return (
   <DashboardLayout activeMenu = "Dashboard">
    <div className='my-5 mx-auto'>
      <div className='grid grid-cols-1 md:grid-cols-3  gap-4'>
        <InfoCard
        icon = {<IoMdCard />}
        label = "Total Balance"
        value = {addThousandsSeparator(dashboardData?.totalbalance || 0)}
        color = "bg-purple-500"
      />
      <InfoCard
        icon = {<LuWalletMinimal/>}
        label = "Total Income"
        value = {addThousandsSeparator(dashboardData?.totalIncome || 0)}
        color = "bg-orange-500"
      />
      <InfoCard
        icon = {<LuHandCoins />}
        label = "Total Expense"
        value = {addThousandsSeparator(dashboardData?.totalExpense || 0)}
        color = "bg-red-500"
      />

      </div>
      <div className='grid grid-cols-1 md:grid-cols-2  gap-4 mt-6'>
        {/* <RecentTransactions
        transactions = {dashboardData?.recenttransactions }
        onSeeMore = {()=>navigate("/expense")}
        />
        <FinanceOverview
        totalbalance = {dashboardData?.totalbalance || 0}
        totalIncome = {dashboardData?.totalIncome || 0}
        totalExpense = {dashboardData?.totalExpense || 0}
        /> */}
        <ExpenseTransactions
        transactions = {dashboardData?.last30DaysExpenses?.transactions || []}
        onSeeMore = {()=>navigate("/expense")}
        />
        <Last30DaysExpenses
        data = {dashboardData?.last30DaysExpenses?.data || []}
        />
        {/* <RecentIncomeWithChart
        data = {dashboardData?.last30DaysIncome?.transactions.slice(0,4) || []}
        totalIncome = {dashboardData.totalIncome || 0} /> */}

      </div>
    </div>
   </DashboardLayout>
  )
}

export default Home
