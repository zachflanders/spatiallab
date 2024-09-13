'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { getCookie } from './auth';
import api from '../api';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    setCsrfToken(getCookie('csrftoken') || '');
  }, [setCsrfToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await api.post(
        '/token/',
        {
          email,
          password,
        },
        {
          headers: {
            'X-CSRFToken': csrfToken || '',
          },
        },
      );
      if (response.status === 200) {
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white"
    >
      <h1 className="text-xl font-bold mb-4">Login</h1>
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
        <label className="block text-gray-700 font-bold mb-2">Password:</label>
        <Input
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          required
        />
      </div>
      <Button type="submit">Login</Button>
    </form>
  );
};

export default LoginForm;
