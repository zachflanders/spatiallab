// pages/login.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import SignupForm from '../../app/accounts/SignupForm';

const Signup = () => {

  const router = useRouter();
  return (
   <div className="m-8">
        <SignupForm onSuccess={() => router.push('/').then(() => {
            window.location.reload();
        })} />
    </div>
  );
};

export default Signup;