'use client';
import React, { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import api from '../api';

interface SignupFormProps {
  onSuccess: () => void;
}

interface ErrorProps {
  response: {
    data: {
      detail: string;
      error: string;
      errors: { [key: string]: string[] };
    };
  };
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.post('/accounts/signup/', {
        email: email,
        password1: password,
        password2: passwordConfirm,
        code: code,
      });
      if (response.status === 201) {
        try {
          const response = await api.post('/token/', {
            email,
            password,
          });
          if (response.status === 200) {
            const { access, refresh } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
          }
        } catch (error) {
          setErrorMessage(
            `Signup Complete. Login failed. ${(error as any).response?.data?.detail + '.' || ''} Please try logging in.`,
          );
        }
      }
      onSuccess();
      setIsLoading(false);
    } catch (error: unknown) {
      let errorMsg = 'Signup failed. ';
      const err = error as ErrorProps;
      if (err.response && err.response.data && err.response.data.detail) {
        errorMsg += err.response.data.detail;
      }
      if (err.response && err.response.data && err.response.data.error) {
        errorMsg += err.response.data.error;
      }
      if (err.response && err.response.data && err.response.data.errors) {
        const errors = err.response.data.errors;
        for (const key in errors) {
          if (errors.hasOwnProperty(key)) {
            errors[key].forEach((msg: string) => {
              errorMsg += `${msg} `;
            });
          }
        }
      }
      setErrorMessage(errorMsg.trim());
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white"
    >
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>
      {errorMessage && <div className="mb-4 text-red-500">{errorMessage}</div>}
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
      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Early Access Code:
        </label>
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing up...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default SignupForm;
