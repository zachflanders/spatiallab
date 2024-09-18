'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import api from '../../../api';

interface PageProps {
  params: {
    token: string;
    uid: string;
  };
}

const PasswordResetForm: React.FC<PageProps> = ({ params }) => {
  const uid = params.uid;
  const token = params.token;
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setMessage(null);
    setErrorMessage(null);
    try {
      const response = await api.post(
        `/accounts/password-reset-confirm/${uid}/${token}/`,
        {
          password,
        },
      );
      if (response.status === 200) {
        setMessage(
          'Password has been reset successfully. Redirecting to login page...',
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push('/login');
      }
    } catch (error) {
      setErrorMessage(
        `Password reset failed. ${(error as any).response?.data?.detail + '.' || ''}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white"
    >
      <h1 className="text-xl font-bold mb-4">Reset Password</h1>
      {message && <div className="mb-4 text-green-500">{message}</div>}
      {errorMessage && <div className="mb-4 text-red-500">{errorMessage}</div>}
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          New Password:
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Confirm Password:
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
};

export default PasswordResetForm;
