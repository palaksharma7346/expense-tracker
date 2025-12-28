import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../compnents/layouts/DashboardLayout'
import IncomeOverview from '../../compnents/income/IncomeOverview'
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Modal from '../../compnents/Modal';
import AddIncomeForm from '../../compnents/income/AddIncomeForm';
import toast from 'react-hot-toast';
import IncomeList from '../../compnents/income/IncomeList';
import DeleteAlert from '../../compnents/DeleteAlert';
import { useUserAuth } from '../../hooks/useUserAuth';


const Income = () => {
  useUserAuth();
  const [incomeData,setIncomeData] = useState([]);
  const [loading,setLoading] = useState(false); 
  const [openDeleteAlert,setOpenDeleteAlert]= useState({show: false, data: null});
  const [openAddIncomeModal,setOpenAddIncomeModal]= useState(false);

//get all income details

const fetchIncomeDetails = async ()=>{
  if(loading) return;
  setLoading(true);

  try{
    const response = await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`);
    console.log("GET_ALL_INCOME response:", response.data);
    if(response.data){
      setIncomeData(response.data);
    }
  }
  catch(error){
    console.log("something went wrong. Please try again ",error)
  }
  finally{
    setLoading(false);
  }
};

//handle add income

const handleAddIncome = async (income)=>{
  console.log("Payload being sent:", income); 
  const {source, amount, date,} = income;
  if(!source.trim()){
    toast.error("Income source is required");
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
    await axiosInstance.post(`${API_PATHS.INCOME.ADD_INCOME}`,{
      source,
      amount,
      date
    });
    setOpenAddIncomeModal(false);
    toast.success("Income added successfully");
    fetchIncomeDetails();
  }
  catch(error){
    console.log("something went wrong. Please try again ",error.response?.data);
  }
};

//delete income

const deleteIncome = async (id)=>{
  try{
  await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
  setOpenDeleteAlert({show:false,data:null});
  toast.success("Income deleted successfully");
  fetchIncomeDetails();
}
catch(error){
  console.error("something went wrong. Please try again ",error.response?.data?.message || error.message);
}
};

//handle dowmnload income data

const handleDownloadIncomeDetails = async ()=>{
  try{
    const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'income_data.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
  catch(error){
    console.error("something went wrong. Please try again ",error);
    toast.error("Failed to download income data. Please try again.");
  }
};



useEffect(()=>{
  fetchIncomeDetails();
  return ()=>{};
},[]);
  return (
   <DashboardLayout activeMenu = "Income">
    <div className='my-5 mx-auto'>
      <div className='grid grid-cols-1 gap-6'>
        <div className=''>
          <IncomeOverview
          transactions = {incomeData}
          onAddIncome = {()=> setOpenAddIncomeModal(true)}
          />
        </div>
        <IncomeList
        transactions = {incomeData}
        onDelete = {(id)=> {console.log("Setting delete alert for id:", id); setOpenDeleteAlert({show:true,data: id})}}
        onDownload = {handleDownloadIncomeDetails}
        />
      </div>
      <Modal 
      isOpen = {openAddIncomeModal}
      onClose = {()=> setOpenAddIncomeModal(false)}
      title = "Add Income"
      >
     <AddIncomeForm onAddIncome ={handleAddIncome}  />
      </Modal>
      <Modal
      isOpen = {openDeleteAlert.show}
      onClose = {()=> setOpenDeleteAlert({show:false,data:null})}
      title = "Delete Income">
        <DeleteAlert
        content = "Are you sure you want to delete this income?"
        onDelete = {()=> deleteIncome(openDeleteAlert.data)}
        />
      </Modal>
    </div>
    </DashboardLayout>
  )
}

export default Income
