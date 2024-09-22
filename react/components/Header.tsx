'use client';
import React, { useRef } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { checkAuth, logout, getCookie } from '@/app/accounts/auth';
import { useAuth } from '../app/AuthContext'; // Adjust the import path as necessary
import Image from 'next/image';
import { UserIcon } from '@heroicons/react/24/outline';
interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, setIsAuthenticated, isLoading, setIsLoading, user } =
    useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = async () => {
    setIsLoading(true);
    logout();
    router.push('/');
    const isAuth = await checkAuth();
    setIsAuthenticated(isAuth ? true : false);
    setIsLoading(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      userButtonRef.current &&
      !userButtonRef.current.contains(event.target as Node)
    ) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const Menu = () => {
    console.log(user);
    return (
      <div
        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
        ref={menuRef}
      >
        <div className="flex flex-col">
          <div className="p-4 border-b">{user && user.email}</div>
          {user && !user.is_verified && (
            <div
              className="px-4 py-2 text-sm border-b bg-yellow-100 hover:bg-yellow-200 cursor-pointer"
              onClick={() => {
                router.push('/verify');
              }}
            >
              Please verify your email.
            </div>
          )}
          <div
            onClick={handleLogout}
            className="p-4 hover:bg-gray-100 cursor-pointer"
          >
            Logout
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className={`${className} p-4 border-b relative z-10`}>
      <div
        className="flex justify-between items-center"
        style={{ minHeight: 40 }}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/spatiallab-logo.png"
            alt="SpatialLab"
            width={40}
            height={40}
          />
          <span className="text-2xl font-bold">Spatial Lab</span>
        </Link>
        {isLoading ? (
          <span></span>
        ) : !isAuthenticated ? (
          <div>
            <div className="hidden md:flex space-x-4 items-center">
              <Button
                type="button"
                className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold"
                onClick={() => {
                  router.push('/blog');
                }}
              >
                Blog
              </Button>
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
            <div className="md:hidden">
              <button
                onClick={toggleSidebar}
                className="text-black focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="hidden md:flex space-x-4 items-center">
              <Button
                type="button"
                className={`py-2 px-4 relative rounded  hover:bg-gray-100 text-bold mr-1${
                  pathname.includes('/data') ? ' bg-gray-100' : ''
                }`}
                onClick={() => {
                  router.push('/data');
                }}
              >
                Data
              </Button>
              <Button
                type="button"
                className={`py-2 px-4 rounded hover:bg-gray-100 text-bold mr-1${
                  pathname.includes('/projects') ? ' bg-gray-100' : ''
                }`}
                onClick={() => {
                  router.push('/projects');
                }}
              >
                Projects
              </Button>
              <div className="relative inline-block text-left">
                <button
                  ref={userButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                  className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold"
                >
                  <UserIcon className="h-5 w-5" />
                </button>
                {menuOpen && <Menu />}
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={toggleSidebar}
                className="text-black focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-md p-4 z-50">
            <button
              onClick={toggleSidebar}
              className="text-black focus:outline-none mb-4"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            {isAuthenticated ? (
              <>
                <Button
                  type="button"
                  className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold w-full text-left"
                  onClick={() => {
                    router.push('/data');
                    toggleSidebar();
                  }}
                >
                  Data
                </Button>
                <span className="border-t border-gray-400 my-2"></span>
                <Button
                  type="button"
                  className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold w-full text-left"
                  onClick={() => {
                    router.push('/projects');
                    toggleSidebar();
                  }}
                >
                  Projects
                </Button>
                <Button
                  type="button"
                  className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold w-full text-left"
                  onClick={handleLogout}
                >
                  logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold w-full text-left"
                  onClick={() => {
                    router.push('/pricing');
                    toggleSidebar();
                  }}
                >
                  Pricing
                </Button>
                <span className="border-t border-gray-400 my-2"></span>
                <Button
                  type="button"
                  className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold w-full text-left"
                  onClick={() => {
                    router.push('/login');
                    toggleSidebar();
                  }}
                >
                  Login
                </Button>
                <Button
                  type="button"
                  className="py-2 px-4 rounded bg-black bg-opacity-0 hover:bg-opacity-5 text-bold w-full text-left"
                  onClick={() => {
                    router.push('/signup');
                    toggleSidebar();
                  }}
                >
                  Signup
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
