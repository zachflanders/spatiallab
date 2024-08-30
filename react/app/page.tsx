'use client';
import { useState, useEffect } from 'react';
import SignupForm from './accounts/SignupForm';
import { useRouter } from 'next/navigation';
import { checkAuth, logout } from './accounts/auth';
import { useAuth } from './AuthContext';
import FileUploadForm from '@/components/FileUploadForm';

export default function Home() {
  const { isAuthenticated, setIsAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleSuccess = () => {
    setIsAuthenticated(true);
    router.push('/');
  };

  if (isLoading) {
    return <main>Loading...</main>;
  }

  return (
    <main>
      {!isAuthenticated ? (
        <div className="m-8">
          <SignupForm onSuccess={handleSuccess} />
        </div>
      ) : (
        <div className="m-8">
          <FileUploadForm />
        </div>
      )}
    </main>
  );
}
