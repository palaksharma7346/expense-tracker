import React, { useEffect, useState } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../compnents/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import ExpenseOverview from '../../compnents/Expense/ExpenseOverview';

const Expense = () => {
  useUserAuth();
  
  const[expenseData,setExpenseData]= useState([]);
  const[loading,setLoading]= useState(false);
  const[openDeleteAlert,setOpenDeleteAlert]= useState({show:false, data:null});
  const[openAddExpenseModal,setOpenAddExpenseModal]= useState(false);

  // get all expense details
  const fetchExpenseDetails = async ()=>{
  if(loading) return;
  setLoading(true);

  try{
    const response = await axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSES}`);
    console.log("GET_ALL_EXPENSES response:", response.data);
    if(response.data){
      setExpenseData(response.data);
    }
  }
  catch(error){
    console.log("something went wrong. Please try again ",error)
  }
  finally{
    setLoading(false);
  }
};

//handle add expense

const handleAddExpense = async (expense)=>{
  console.log("Payload being sent:", expense); 
  const {category, amount, date,} = expense;
  if(!category.trim()){
    toast.error("Expense category is required");
    return; 
  }
  if(!amount || isNaN(amount) || Number(amount)<=0){
    toast.error("Please enter a valid amount");
    return;
  }
  if(!date){
    toast.error("Please select a valid date");
    return;
  }
  try{
    await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
      category,
      amount,
      date
    });
    setOpenAddExpenseModal(false);
    toast.success("Expense added successfully");
    fetchExpenseDetails();
  }
  catch(error){
    console.log("something went wrong. Please try again ",error.response?.data);
  }
};

useEffect(()=>{
  fetchExpenseDetails();
  return ()=>{};
},[]);

  return (
    <div>
      <DashboardLayout
      activeMenu="Expense">
        <div className='my-5 mx-auto'>
          <div className=' grid grid-cols-1 gap-6'>
            <div className=''>
              <ExpenseOverview
              transactions = {expenseData}
              onExpenseIncome = {()=>setOpenAddExpenseModal}/>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </div>
  )
}

export default Expense
