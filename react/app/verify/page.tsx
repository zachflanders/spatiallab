'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../AuthContext';
import axios from 'axios';

import { checkAuth } from '../accounts/auth';
import Button from '@/components/Button';
import { error } from 'console';
import Input from '@/components/Input';

const Verify = () => {
  const router = useRouter();
  const uid = useSearchParams().get('uid');
  const token = useSearchParams().get('token');
  const { setIsAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailResent, setEmailResent] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    try {
      fetch(
        `${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_API_URL}/accounts/activate/${uid}/${token}/`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setIsSuccess(true);
            setIsLoading(false);
          } else {
            setIsSuccess(false);
            setIsLoading(false);
          }
        });
    } catch (error) {
      console.error('Error:', error);
    }
  }, [token, uid]);

  const resend_email = async (emai: string) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_PROTOCOL}://${process.env.NEXT_PUBLIC_API_URL}/accounts/resend_activation/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );

      if (response.data.success) {
        setEmailResent(true);
        setMessage(response.data.message);
      } else {
        setEmailResent(false);
        setMessage(response.data.message);
      }
      setEmailResent(true);
    } catch (error) {
      if ((error as any).response.data) {
        setMessage((error as any).response.data.message);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resend_email(email);
  };

  const error_html = (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white"
    >
      <div className="mb-4">
        Unable to verify email. Please enter your email to resend the
        verification email.
      </div>
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
      <div>
        <Button type="submit">Resend Verification Email</Button>
      </div>
    </form>
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="m-8">
        {message}
        {isLoading
          ? 'Verifying email...'
          : isSuccess
            ? 'Email verified.'
            : error_html}
      </div>
    </Suspense>
  );
};

export default Verify;
