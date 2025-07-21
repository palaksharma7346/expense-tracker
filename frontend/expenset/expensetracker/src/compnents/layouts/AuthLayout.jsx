import React from 'react';
import img1 from '../../assets/images/img1.jpg';
import { LuTrendingUpDown } from 'react-icons/lu';
import { motion } from 'framer-motion';
import bg from '../../assets/images/bg.jpg';
const StatsInfoCard = ({ icon, label, value }) => {
  return (
    <div className='flex gap-4 bg-white p-3 mt-6 rounded-xl shadow-md shadow-[#FEFAEO]/20 border border-gray-200/50 z-10'>
      <div className='w-12 h-12 flex items-center justify-center text-[26px] text-white bg-[#D4A373] rounded-full drop-shadow-xl'>
        {icon}
      </div>
      <h6 className='text-s text-gray-500'>{label}</h6>
      <span className='text-[20px] text-gray-800'>${value}</span>
    </div>
  );
};

const AuthLayout = ({ children }) => {
  return (
    <div className="relative w-screen min-h-screen overflow-y-auto">
  <img
    src={bg}
    alt="background"
    className="absolute inset-0 w-full h-full object-cover z-0"
  />

    <div className='flex relative z-0'>
      <div className='w-screen min-h-screen md:w-[60vw] px-4 pt-4 pb-12 overflow-y-auto'>
        <h2 className='text-xl font-semibold text-[#6B3E1F]'>Expense Tracker</h2>
        {children}
      </div>

<motion.div
  initial={{ x: '100vw', opacity: 0 }}      // Start off-screen to the right
  animate={{ x: 0, opacity: 1 }}            // Animate to center
  transition={{ type: 'spring', stiffness: 45, damping: 15 }} // Smooth motion
  className='lg:w-[40%] h-auto ml-4  rounded-xl flex flex-col items-center justify-center bg-[#FAEDCD]'
>
  {/* Your login content */

      <div className='hidden md:block w-[40vw] h-screen bg-[#FAEDCD] bg-auth-bg-img bg-cover bg-no-repeat bg-center overflow-hidden p-4 relative'>
        <div className='w-48 h-48 rounded-[40px] bg-[#D4A373] absolute -top-7 -left-5'></div>
        <div className='w-48 h-48 rounded-[40px] border-[20px] border-[#D4A373] absolute top-[30%] -right-[10%]'></div>
        <div className='w-48 h-48 rounded-[40px] bg-[#D4A373] absolute -bottom-7 -right-5'></div>
        <div className='grid grid-cols-1 z-20'>
          <StatsInfoCard
            icon={<LuTrendingUpDown />}
            label="Track your income and expenses"
            value="430,000"
          />
        </div>
        <img
          src={img1}
          alt="illustration"
          className='h-80 w-60 lg:w-[90%] absolute mb-4 bottom-10 shadow-lg shadow-[#FFA9A9]/20'
        />
      </div>
}</motion.div>
    </div>
    </div>
  );
};

export default AuthLayout;
