import React, { useState, useContext } from 'react'
import AuthLayout from '../../compnents/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../compnents/inputs/Input';
import { validateEmail } from '../../utils/helper';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext.jsx';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const{updateUser}= useContext(UserContext);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    console.log("Login request being sent:");
console.log("URL:", API_PATHS.AUTH.LOGIN);
console.log("Email:", email);
console.log("Password:", password);

    e.preventDefault()

    if(!validateEmail(email)){
      setError('Please enter a valid email address');
      return;
    }
    if(!password){
      setError('Please enter your password');
      return;
    }

    setError(null);

    //login api call
    try{
      console.log("BASE_URL from axiosInstance:", axiosInstance.defaults.baseURL);
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password
      });
      const { token, user } = response.data;
      if(token){
        localStorage.setItem('token', token);
        updateUser(user); // Update user context with the logged-in user data
        navigate('/dashboard'); // Redirect to dashboard after successful login
      }
      
    }
    catch(error){
      if(error.response && error.response.data) {
        setError(error.response.data.message || 'Login failed. Please try again.');
      }
      else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }



  }

  return (
    <AuthLayout>
    <motion.div
  initial={{ x: '-100vw', opacity: 0 }}   // Start off-screen to the left
  animate={{ x: 0, opacity: 1 }}          // Animate to center
  transition={{ type: 'spring', stiffness: 60, damping: 15 }} // Smooth bounce
  className='lg:w-[100%] h-auto ml-4 mt-2 rounded-xl flex flex-col items-center justify-center bg-[#FAEDCD]'
>
  {/* Your login content */

    
   
      <div className='lg:w-[90%] h-auto mt-10 ml-4 flex flex-col items-center rounded-xl justify-center bg-[#FAEDCD]'>
        <h3 className='text-2xl mt-4 font-semibold text-black'>Welcome back</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>Please enter your credentials to continue.</p>
        <form onSubmit={handleLogin}>
          <Input 
          value ={email}
          onChange ={({target})=>setEmail(target.value)} 
          label="Email address"
          placeholder="Enter your email"
          type = 'text'
          />
          <Input
          value ={password}
          onChange ={({target})=>setPassword(target.value)} 
          label="Password"
          placeholder="Enter your password"
          type = 'password'
          />
          {error && <p className='text-red-500 text-sm pb-2.5'>{error}</p>}
          <button type='submit' className='btn-primary'>
            Login
          </button>
          <p className='text-[13px] text-slate-800 mb-4 mt-3'>Don't have an account? {""}
            <Link to="/signup" className='text-primary font-semibold underline'>Sign up</Link>
          </p>
        </form>
      </div>
    
  }
</motion.div>
</AuthLayout>
  )
}

export default Login
