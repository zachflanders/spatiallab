"use client";
import { useState, useEffect } from "react";
import SignupForm from "../app/accounts/SignupForm";
import { useRouter } from "next/router";
import Header from "../components/Header";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/accounts/is_authenticated/");
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setIsAuthenticated(data.is_authenticated);
        }
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
      }
    } catch (error) {
      console.error("There was an error logging out:", error);
    }
  }


  if (isLoading) {
    return <main>Loading...</main>;
  }

  return (
    <main>
      <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      {!isAuthenticated ? (
        <div className="m-8">
          <SignupForm onSuccess={() => router.push('/').then(() => {
            window.location.reload();
        })} />
        </div>
      ) : (
        <div>
        </div>

      )}
    </main>
  );
}
