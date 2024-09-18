'use client';
import { Suspense, useEffect, useState } from 'react';
import SignupForm from './accounts/SignupForm';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import Footer from '@/components/Footer';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { getCookie } from './accounts/auth';
import api from './api';
import {
  CloudIcon,
  GlobeAmericasIcon,
  Cog8ToothIcon,
} from '@heroicons/react/24/outline';
import { set } from 'ol/transform';

export default function Home() {
  const { isAuthenticated, setIsAuthenticated, isLoading, setIsLoading } =
    useAuth();
  const [hasToken, setHasToken] = useState(false);
  const [checkedToken, setCheckedToken] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [subscribe, setSubscribe] = useState(true);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setCheckedToken(true);
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
  const handleInputFocus = () => {
    setShowForm(true);
  };
  const handleInputBlur = () => {
    if (!email) {
      setShowForm(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handleSubscribeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubscribe(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      alert('Please fill in all required fields.');
      return;
    }
    setEmailSending(true);
    setShowForm(false);
    if (!role) {
      setRole('other');
    }
    try {
      const csrfToken = getCookie('csrftoken');
      const response = await api.post(
        '/accounts/waitlist/',
        {
          email: email,
          role: role,
          subscribe: subscribe,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken || '',
          },
        },
      );
      if (response.status === 201) {
        setSignupSuccess(true);
      } else {
        setSignupError(true);
      }
    } catch (error) {}
  };

  return (
    <main className="bg-transparent">
      {!hasToken && checkedToken ? (
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
                  onFocus={handleInputFocus}
                  onChange={handleEmailChange}
                  onBlur={handleInputBlur}
                  value={email}
                />
                {showForm && (
                  <div className="mt-4">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label htmlFor="role" className="text-gray-700">
                          Industry
                        </label>
                        <select
                          id="role"
                          value={role}
                          onChange={handleRoleChange}
                          className="mt-2 block w-full pl-3 pr-10 py-3 text-lg border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="">Select an industry</option>
                          <option value="local-government">
                            Local Government
                          </option>
                          <option value="urban-planning">Urban Planning</option>
                          <option value="nonprofit-organization">
                            Nonprofit Organization
                          </option>
                          <option value="environmental-services">
                            Environmental Services
                          </option>
                          <option value="transportation-and-infrastructure">
                            Transportation and Infrastructure
                          </option>
                          <option value="real-estate-development">
                            Real Estate Development
                          </option>
                          <option value="public-safety-and-emergency-management">
                            Public Safety and Emergency Management
                          </option>
                          <option value="agriculture-and-forestry">
                            Agriculture and Forestry
                          </option>
                          <option value="utilities-water-gas-electric">
                            Utilities (Water, Gas, Electric)
                          </option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={subscribe}
                          onChange={handleSubscribeChange}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Subscribe to our newsletter
                        </label>
                      </div>
                      <div className="mt-4 text-right">
                        <Button
                          type="submit"
                          className=" bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                        >
                          Join Waitlist
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                {emailSending && !signupSuccess && !signupError && (
                  <p className="text-gray-600 mt-4">
                    Adding you to the waitlist...
                  </p>
                )}
                {signupSuccess && (
                  <div>
                    <p className="text-green-600 mt-4">
                      Thank you for joining the waitlist!
                    </p>
                    <p className="text-gray-600 mt-4">
                      I sent you an email from zachflanders@gmail.com. We will
                      notify you when Spatial Lab is available.
                    </p>
                  </div>
                )}
                {signupError && (
                  <p className="text-red-600 mt-4">
                    There was an error joining the waitlist. Please try again.
                  </p>
                )}
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
                <div
                  className="rounded-lg shadow-lg bg-gray-100 border border-gray-300 flex items-center justify-center"
                  style={{ height: 400, width: 600 }}
                >
                  <CloudIcon className="h-48 w-48 text-gray-400 mx-auto" />
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div
                className="rounded-lg shadow-lg bg-gray-100 border border-gray-300 flex items-center justify-center"
                style={{ height: 400, width: 600 }}
              >
                <Cog8ToothIcon className="h-48 w-48 text-gray-400 mx-auto" />
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
              <div
                className="rounded-lg shadow-lg bg-gray-100 border border-gray-300 flex items-center justify-center"
                style={{ height: 400, width: 600 }}
              >
                <GlobeAmericasIcon className="h-48 w-48 text-gray-400 mx-auto" />
              </div>
            </div>
          </div>
          <Footer />
        </div>
      ) : checkedToken && isAuthenticated ? (
        <Suspense>
          <div className="p-3 pt-8 flex items-center space-x-8 w-full ">
            <div
              className="p-8 bg-white border rounded-lg shadow-lg cursor-pointer hover:bg-gray-100 transition"
              onClick={() => {
                router.push('/data');
              }}
            >
              <h3 className="text-xl font-semibold">Data Catalog</h3>
              <p className="text-gray-500 text-sm">
                View and organize your data.
              </p>
            </div>
            <div
              className="p-8 bg-white border rounded-lg shadow-lg cursor-pointer hover:bg-gray-100 transition"
              onClick={() => {
                router.push('/projects');
              }}
            >
              <h3 className="text-xl font-semibold">Projects</h3>
              <p className="text-gray-500 text-sm">
                Analyze data; create and publish maps.
              </p>
            </div>
          </div>
        </Suspense>
      ) : !checkedToken ? (
        <></>
      ) : (
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      )}
    </main>
  );
}
