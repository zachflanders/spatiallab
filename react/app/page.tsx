'use client';
import SignupForm from './accounts/SignupForm';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import FileUploadForm from '@/components/FileUploadForm';
import Footer from '@/components/Footer';

export default function Home() {
  const { isAuthenticated, setIsAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleSuccess = () => {
    setIsAuthenticated(true);
    router.push('/');
  };

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </main>
    );
  }

  return (
    <main className="bg-transparent">
      {!isAuthenticated ? (
        <div>
          <div className="space-y-24 py-24 mb-0">
            <div
              className="text-center"
              style={{ marginTop: 130, marginBottom: 150 }}
            >
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 pb-6">
                GIS you'll{' '}
                <u
                  className="underline decoration-4 decoration-blue-300"
                  style={{
                    textUnderlineOffset: '0.3rem',
                  }}
                >
                  love
                </u>
                !
              </h1>
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
                  Your data in the cloud.
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Store, manage, and share your geospatial data effortlessly.
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
                  Analyze geospatial data.
                </h2>
                <p className="mt-4 text-lg text-gray-600 text-right">
                  Unlock insights with powerful analysis tools.
                </p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="flex flex-col justify-center">
                <h2 className="text-4xl font-semibold text-gray-800">
                  Publish and Share Maps.
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Create beautiful maps and share them with the world.
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

            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <SignupForm onSuccess={handleSuccess} />
              </div>
            </div>
          </div>
          <Footer />
        </div>
      ) : (
        <div className="py-24">
          <div className="max-w-3xl mx-auto">
            <FileUploadForm />
          </div>
        </div>
      )}
    </main>
  );
}
