import React, { useState } from 'react'
import {FaRegEye, FaRegEyeSlash} from 'react-icons/fa'
const Input = ({ value, onChange, label, placeholder, type }) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword =()=>{
        setShowPassword(!showPassword);
    }
  return (
    <div>
      <label className='text-lg text-slate-800  block w-full text-center'>{label}</label>
      <div className='input-box'>
        <input
        type={type === 'password' ? showPassword ? 'text' :'password': type}
        placeholder={placeholder}
        value={value}
        onChange={(e)=>onChange(e)} 
        className='w-40 bg-transparent outline-none '
      />
      {type === 'password' && (
        <>
        {showPassword ? (
          <FaRegEye 
          size={20}
          className='cursor-pointer text-primary'
          onClick={toggleShowPassword} />
        ) : (
          <FaRegEyeSlash 
          size={20}
          className='cursor-pointer text-slate-400'
          onClick={toggleShowPassword} />
        )}
        </>
        )}
      </div>
    </div>
  )
}

export default Input
