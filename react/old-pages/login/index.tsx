// pages/login.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LoginForm from '../../app/accounts/LoginForm';

const Login = () => {
  const router = useRouter();
  
  

  return (
   <div className="m-8">
        <LoginForm onLoginSuccess={()=>router.push('/')} />
    </div>
  );
};

export default Login;