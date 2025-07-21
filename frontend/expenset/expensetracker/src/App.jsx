import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Income from './pages/dashboard/Income'
import Expense from './pages/dashboard/Expense'
import Home from './pages/dashboard/Home'
import UserProvider from './context/UserContext.jsx'

const Root = () => {
  //check if token exists in localStorage
  const isAuthenticated = !!localStorage.getItem('token');
  //redirect to dashboard if authenticated, otherwise redirect to login
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <UserProvider>
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/signup" exact element={<Signup />} />
           <Route path="/dashboard" exact element={<Home />} />
          <Route path="/income" exact element={<Income />} />
          <Route path="/expense" exact element={<Expense />} />
        </Routes>
      </Router>
    </div>
    </UserProvider>
  );
};

export default App;

