'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignupForm from '../accounts/SignupForm';
import { useAuth } from '../AuthContext';

const Signup = () => {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();

  const handleSuccess = () => {
    setIsAuthenticated(true);
    router.push('/');
  };

  return (
    <div className="m-8">
      <SignupForm onSuccess={handleSuccess} />
    </div>
  );
};

export default Signup;
