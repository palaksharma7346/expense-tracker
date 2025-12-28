import React, { useEffect, useState } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../compnents/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import ExpenseOverview from '../../compnents/Expense/ExpenseOverview';
import AddExpenseForm from '../../compnents/Expense/AddExpenseForm';
import Modal from '../../compnents/Modal';
import ExpenseList from '../../compnents/Expense/ExpenseList';
import DeleteAlert from '../../compnents/DeleteAlert';

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
    const response = await axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`);
    console.log("GET_ALL_EXPENSE response:", response.data);
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

//delete expense

const deleteExpense = async (id)=>{
  try{
  await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
  setOpenDeleteAlert({show:false,data:null});
  toast.success("Expense deleted successfully");
  fetchExpenseDetails();
}
catch(error){
  console.error("something went wrong. Please try again ",error.response?.data?.message || error.message);
}
};

//handle download expense data

const handleDownloadExpenseDetails = async ()=>{
  try{
    const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expense_data.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
  catch(error){
    console.error("something went wrong. Please try again ",error);
    toast.error("Failed to download expense data. Please try again.");
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
              onExpenseIncome = {()=>setOpenAddExpenseModal(true)}/>
            </div>
            <ExpenseList
            transactions={expenseData}
            onDelete = {(id)=>{setOpenDeleteAlert({show:true, data:id});}}
            onDownload = {handleDownloadExpenseDetails}/>
          </div>
          <Modal
          isOpen={openAddExpenseModal}
          onClose={()=>setOpenAddExpenseModal(false)}
          title="Add Expense">
            <AddExpenseForm
            onAddExpense={handleAddExpense}/>

          </Modal>
           <Modal
      isOpen = {openDeleteAlert.show}
      onClose = {()=> setOpenDeleteAlert({show:false,data:null})}
      title = "Delete Expense">
        <DeleteAlert
        content = "Are you sure you want to delete this expense?"
        onDelete = {()=> deleteExpense(openDeleteAlert.data)}
        />
      </Modal>
        </div>
      </DashboardLayout>
    </div>
  )
}

export default Expense
