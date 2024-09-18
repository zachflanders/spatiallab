'use client';
import React, { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import api from '../api';

const PasswordResetRequestForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const response = await api.post('/accounts/password-reset/', { email });
      if (response.status === 200) {
        setMessage('Password reset email sent. Please check your inbox.');
      }
    } catch (error) {
      setErrorMessage(
        `Password reset request failed. ${(error as any).response?.data?.detail + '.' || ''}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white mt-8"
    >
      <h1 className="text-xl font-bold mb-4">Password Reset</h1>
      {message && <div className="mb-4 text-green-500">{message}</div>}
      {errorMessage && <div className="mb-4 text-red-500">{errorMessage}</div>}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Email:</label>
        <Input
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Password Reset Email'}
      </Button>
    </form>
  );
};

export default PasswordResetRequestForm;
