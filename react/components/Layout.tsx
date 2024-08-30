'use client';
import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import { useRouter } from 'next/router';

import Header from './Header';

export const metadata: Metadata = {
  title: 'SpatialLab',
  description: 'GIS tools for the web',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  if (isLoading) {
    return <main>Loading...</main>;
  }

  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}
