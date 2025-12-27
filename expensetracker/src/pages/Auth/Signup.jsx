import React,{useContext, useState} from 'react'
import AuthLayout from '../../compnents/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../compnents/inputs/Input';
import { validateEmail } from '../../utils/helper';
import Profilepic from '../../compnents/inputs/Profilepic';
import { motion } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';
import uploadImage from '../../utils/uploadImage';
const Signup = () => {
  const [profilepic, setProfilepic] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const handleSignup = async (e)=>{
    e.preventDefault();
    let profileImageUrl = "";
    if(!name){
      setError('Please enter your full name');
      return;
    }
    if(!validateEmail(email)){
      setError('Please enter a valid email address');
      return;
    }
    if(!password){
      setError('Please enter your password');
      return;
    }
    setError("");

    //signup api call
    try{
      if(profilepic) {
       const imageuploads = await uploadImage(profilepic);
        profileImageUrl = imageuploads.imageUrl || "";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName:name,
        email,
        password,
        profileImageUrl
       
      });
      const { token, user } = response.data;
      if(token){
        localStorage.setItem('token', token);
        updateUser(user); // Update user context with the signed-up user data
        navigate('/dashboard'); // Redirect to dashboard after successful signup
      }
    }
    catch(error){
      if(error.response && error.response.data.message) {
        setError(error.response.data.message );
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

   
    <div className='lg:w-[90%] h-auto ml-4 mt-2 rounded-xl flex flex-col items-center justify-center bg-[#FAEDCD]'>
      <h3 className='text-2xl font-bold mt-5 text-black'>Create an account</h3>
      <p className='text-xs text-gray-600 mt-[5px] mb-6'>join us today by entring your details</p>
      <form onSubmit={handleSignup}>
        <div className='   '>
        <Profilepic image = {profilepic} setImage = {setProfilepic}/>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
       
        <Input 
          value={name}
          onChange={({target})=>setName(target.value)} 
          label="Full Name"
          placeholder="Enter your full name"
          type='text'/>
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
        </div>
         {error && <p className='text-red-500 text-sm pb-2.5 flex items-center justify-center'>{error}</p>}
         <div className='flex justify-center'>
                  <button type='submit' className='btn-primary'>
                    Signup
                  </button>
                  </div>
                  <p className='text-[13px] text-slate-800 mb-4 mt-3 px-2'>Already have an account? {""}
                    <Link to="/login" className='text-primary font-semibold underline'>Log in</Link>
                  </p>
      </form>
      
    </div>
  
}
</motion.div>
 </AuthLayout>
  )
}

export default Signup
