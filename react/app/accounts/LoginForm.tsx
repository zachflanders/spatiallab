'use client';
import React, { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import api from '../api';
import Link from 'next/link';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post('/token/', {
        email,
        password,
      });
      if (response.status === 200) {
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        onLoginSuccess();
      }
    } catch (error) {
      setErrorMessage(
        `Login failed. ${(error as any).response?.data?.detail + '.' || ''}`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="p-6 border border-gray-300 rounded-lg shadow-md bg-white"
      >
        <h1 className="text-xl font-bold mb-4">Login</h1>
        {errorMessage && (
          <div className="mb-4 text-red-500">{errorMessage}</div>
        )}
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
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Password:
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <div className="text-sm mt-2">
        <Link href="/reset-password" className="text-blue-500 underline ">
          Forgot password?
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
