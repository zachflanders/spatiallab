'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuth, getCookie } from './accounts/auth'; // Adjust the import path as necessary
import { set } from 'ol/transform';

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAuthStatus = async () => {
    const authStatus = await checkAuth();
    setIsAuthenticated(authStatus ? true : false);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAuthStatus();
  }, [setIsAuthenticated, setIsLoading]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, isLoading, setIsLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
