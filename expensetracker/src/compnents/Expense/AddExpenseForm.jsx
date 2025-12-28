import React, { useState } from 'react'
import Input from '../inputs/Input';
const AddExpenseForm = ({onAddExpense}) => {
    const [income, setIncome] = useState({
        category: '',
        amount: '',
        date: '',
    });
    const handleChange = (key,value)=>
        setIncome({ ...income, [key]: value });
    
  return (
    <div>
      <Input
        label="Category"
        type="text"
        placeholder="e.g. Food, Transport"
        value={income.category}
        onChange={({target}) => handleChange('category', target.value)}
      />
      <Input
        label="Amount"
        type="number"
        placeholder=""
        value={income.amount}
        onChange={({target}) => handleChange('amount', target.value)}
      />
      <Input
        label="Date"
        type="date"
        placeholder=""
        value={income.date}
        onChange={({target}) => handleChange('date', target.value)}
      />
      <div className='flex justify-end mt-4'>
        <button
        type = "button"
        className='add-btn add-btn-fill'
        onClick={()=>{ console.log('AddExpenseForm Add clicked'); 
            onAddExpense(income); }}
        >
            Add Expense
        </button>
      </div>
    </div>
  )
}

export default AddExpenseForm
