'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import SignupForm from '../accounts/SignupForm';
import { useAuth } from '../AuthContext';
import { SparklesIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const Signup = () => {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();

  const handleSuccess = () => {
    window.location.href = '/';
  };

  return (
    <div className="m-8">
      <div
        className="max-w-md mx-auto text-center bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4"
        role="alert"
      >
        <span className="block sm:inline">
          <SparklesIcon className="h-5 w-5 inline-block mr-2" />
          Signups are limited to early access beta testers.{' '}
          <Link href="/" className="underline">
            Join the waitlist
          </Link>
          .
        </span>
      </div>
      <SignupForm onSuccess={handleSuccess} />
    </div>
  );
};

export default Signup;
