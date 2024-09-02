'use client';
import React from 'react';
import FileUploadForm from '@/components/FileUploadForm';
import { useAuth } from '../AuthContext';

const PricingPage: React.FC = () => {
  const { isAuthenticated, setIsAuthenticated, isLoading } = useAuth();

  return (
    <div className="py-24">
      {isAuthenticated && !isLoading && (
        <div className="max-w-3xl mx-auto">
          <FileUploadForm />
        </div>
      )}
    </div>
  );
};

export default PricingPage;
