"use client";
import { useState, useEffect } from "react";
import SignupForm from "./accounts/SignupForm";
import { useRouter } from "next/navigation";
import { checkAuth, logout } from "./accounts/auth";
import {useAuth} from "./AuthContext";

export default function Home() {

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter()




  const handleLogout = async () => {
    logout();
    const isAuth = await checkAuth();
    setIsAuthenticated(isAuth);
  }
   

  if (isLoading) {
    return <main>Loading...</main>;
  }

  return (
    
    <main>
      
      {!isAuthenticated ? (
        <div className="m-8">
          <SignupForm />
        </div>
      ) : (
        <div>
        </div>

      )}
    </main>
  );
}
