'use client';
import { Suspense, useEffect, useState } from 'react';
import SignupForm from './accounts/SignupForm';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import Footer from '@/components/Footer';
import Input from '@/components/Input';

export default function Home() {
  const { isAuthenticated, setIsAuthenticated, isLoading, setIsLoading } =
    useAuth();
  const [hasToken, setHasToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setHasToken(true);
    }
    // if (!isLoading && !isAuthenticated) {
    //   setHasToken(false);
    // }
    setIsLoading(false);
  }, []);

  const handleSuccess = () => {
    setIsAuthenticated(true);
    router.push('/');
  };

  return (
    <main className="bg-transparent">
      {!hasToken ? (
        <div>
          <div className="space-y-24 py-24 mb-0 p-4">
            <div
              className="text-center"
              style={{ marginTop: 130, marginBottom: 150 }}
            >
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 pb-16">
                GIS you&apos;ll{' '}
                <u
                  className="underline decoration-4 decoration-blue-300"
                  style={{
                    textUnderlineOffset: '0.3rem',
                    textDecorationThickness: '0.15rem',
                  }}
                >
                  love
                </u>
                !
              </h1>
              <div className="text-lg text-gray-600 max-w-lg mx-auto text-left">
                <h2>Join the Waitlist:</h2>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  onChange={() => console.log('add email')}
                  value=""
                />
              </div>
            </div>

            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col justify-center">
                <img
                  src="/app.png"
                  alt="Data in the cloud"
                  className="rounded-lg shadow-xl bg-slate-100 border border-gray-300"
                  height={450}
                />
              </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                <h2 className="text-4xl font-semibold text-gray-800">
                  Collaborate with your team.
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  With your data in the cloud you can store, manage, and share
                  your geospatial data effortlessly accross your entire team.
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src="/placeholder-image.png"
                  alt="Data in the cloud"
                  className="rounded-lg shadow-lg bg-slate-100 border border-gray-300"
                  height={400}
                  width={600}
                />
              </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex justify-center order-2 md:order-1">
                <img
                  src="/placeholder-image.png"
                  alt="Analyze geospatial data"
                  className="rounded-lg shadow-lg bg-slate-100 border border-gray-300"
                  height={400}
                  width={600}
                />
              </div>
              <div className="flex flex-col justify-center order-1 md:order-2">
                <h2 className="text-4xl font-semibold text-gray-800 text-right">
                  The tools you need.
                </h2>
                <p className="mt-4 text-lg text-gray-600 text-right">
                  Analyze your data and unlock insights with powerful analysis
                  tools.
                </p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                <h2 className="text-4xl font-semibold text-gray-800">
                  Share with your community.
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Create beautiful maps and share them with the world with our
                  easy publishing tools.
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src="/placeholder-image.png"
                  alt="Publish and share maps"
                  className="rounded-lg shadow-lg bg-slate-100 border border-gray-300"
                  height={400}
                  width={600}
                />
              </div>
            </div>
          </div>
          <Footer />
        </div>
      ) : (
        <Suspense>
          <div className="py-24">
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                  className="p-8 bg-white border rounded-lg shadow-lg cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => {
                    router.push('/upload');
                  }}
                >
                  <h3 className="text-2xl font-semibold text-green-800">
                    Upload Data
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Add data to your data catalog.
                  </p>
                </div>
                <div
                  className="p-8 bg-white border rounded-lg shadow-lg cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => {
                    router.push('/data');
                  }}
                >
                  <h3 className="text-2xl font-semibold text-blue-800">
                    Data Catalog
                  </h3>
                  <p className="text-gray-500 text-sm">
                    View and organize your data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Suspense>
      )}
    </main>
  );
}
