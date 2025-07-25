import React from 'react'
import DashboardLayout from '../../compnents/layouts/DashboardLayout.jsx'
import { useUserAuth } from '../../hooks/useUserAuth.jsx';

const Home = () => {
  useUserAuth();
  return (
   <DashboardLayout activeMenu = "Dashboard">
    <div className='my-5 mx-auto'>
      home
    </div>
   </DashboardLayout>
  )
}

export default Home
