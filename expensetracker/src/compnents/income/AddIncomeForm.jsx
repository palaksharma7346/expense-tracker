import React, {  useState } from 'react'
import Input from '../inputs/Input.jsx';
const AddIncomeForm = ({ onAddIncome }) => {
    const [income,setIncome] =   useState({
        source:"",
        amount:"",
        date:""
        
    });

    const handleChange = (key,value)=> setIncome({...income,[key]:value});
  return (
    <div>
      <Input
      value={income.source}
      onChange = {({target}) => handleChange("source",target.value)}
        label = "Income Source"
        placeholder = "e.g Salary, Freelancing"
        type = "text"
      />
      <Input
        value={income.amount}
        onChange = {({target}) => handleChange("amount",target.value)}
        label = "Amount"
        placeholder = "e.g 5000"
        type = "number"
      />
      <Input
        value={income.date}
        onChange = {({target}) => handleChange("date",target.value)}
        label = "Date"
        placeholder = ""
        type = "date"
      />
     <div className='flex justify-end mt-4'>
        <button
            type="button"
            className='add-btn add-btn-fill'
            onClick={() => {
    console.log("BUTTON CLICKED!");
    onAddIncome(income);}}
        >
            Add Income
        </button>
     </div>
    </div>
  )
}

export default AddIncomeForm
