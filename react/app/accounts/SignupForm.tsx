'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { getCookie } from './auth';
import api from '../api';

interface SignupFormProps {
  onSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [csrfToken, setCsrfToken] = useState<string>('');

  useEffect(() => {
    const csrftoken = getCookie('csrftoken');
    setCsrfToken(csrftoken || '');
  }, [setCsrfToken]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      console.error('Passwords do not match');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password1', password);
      formData.append('password2', passwordConfirm);
      const response = await api.post('/accounts/signup/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrfToken || '',
        },
      });
      onSuccess();
      // Handle successful signup
    } catch (error) {
      // Handle signup error
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white"
    >
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Email:</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">Password:</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Confirm Password:
        </label>
        <Input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Sign Up</Button>
    </form>
  );
};

export default SignupForm;
