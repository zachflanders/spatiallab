"use client";
import { useState, useEffect } from "react";
import type { Metadata } from "next";
import { useRouter } from "next/router";


import Header from "./Header";

export const metadata: Metadata = {
    title: "SpatialLab",
    description: "GIS tools for the web",
  };

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/accounts/is_authenticated/");
        const data = await response.json();          
        setIsAuthenticated(data.is_authenticated);
      } catch (error) {
        console.error("There was an error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/accounts/logout/");
      if (response.ok) {
        setIsAuthenticated(false);
        router.push('/').then(() => {
            window.location.reload();
        });
      }
    } catch (error) {
      console.error("There was an error logging out:", error);
    }
  };

  if (isLoading) {
    return <main>Loading...</main>;
  }

  return (
    <div>
      <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <main>{children}</main>
    </div>
  );
};

