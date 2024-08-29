'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../accounts/LoginForm';
import { useAuth } from '../AuthContext';

const Login = () => {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    router.push('/');
  }
  

  return (
   <div className="m-8">
        <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default Login;