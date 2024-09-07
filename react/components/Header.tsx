'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { checkAuth, logout } from '@/app/accounts/auth';
import { useAuth } from '../app/AuthContext'; // Adjust the import path as necessary

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, isLoading, setIsLoading } =
    useAuth();

  const handleLogout = async () => {
    setIsLoading(true);
    logout();
    const isAuth = await checkAuth();
    setIsAuthenticated(isAuth);
    setIsLoading(false);
  };

  return (
    <header className={`${className} p-4 shadow-md`}>
      <div
        className="container mx-auto flex justify-between items-center"
        style={{ minHeight: 40 }}
      >
        <Link href="/">
          <span className="text-2xl font-bold">SpatialLab</span>
        </Link>
        {isLoading ? (
          <span></span>
        ) : !isAuthenticated ? (
          <div>
            <Button
              type="button"
              className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold"
              onClick={() => {
                router.push('/pricing');
              }}
            >
              Pricing
            </Button>
            <span className="border-l border-gray-400 h-6 mx-2"></span>
            <Button
              type="button"
              className="py-2 px-4 rounded mr-1 bg-black bg-opacity-0 hover:bg-opacity-5 text-bold"
              onClick={() => {
                router.push('/login');
              }}
            >
              Login
            </Button>
            <Button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              onClick={() => {
                router.push('/signup');
              }}
            >
              Signup
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold mr-1"
              onClick={() => {
                router.push('/projects');
              }}
            >
              Projects
            </Button>
            <Button
              type="button"
              className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold mr-1"
              onClick={() => {
                router.push('/data');
              }}
            >
              Data
            </Button>
            <Button
              type="button"
              className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold mr-1"
              onClick={() => {
                router.push('/upload');
              }}
            >
              Upload
            </Button>
            <Button
              type="button"
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
