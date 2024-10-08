import React from 'react';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500 pb-2">
          Pricing Plans
        </h2>
        <p className="mt-4 text-xl text-center text-gray-700">
          Choose the plan that fits your needs. Upgrade anytime as your needs
          grow.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
          {/* Individual Plan */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 transform hover:scale-105 transition-transform duration-300">
            <div className="p-8">
              <h3 className="text-3xl font-bold text-gray-800">Individual</h3>
              <p className="mt-4 text-lg text-gray-500">
                Great for solo explorers
              </p>
              <div className="mt-6">
                <p className="text-xl font-medium text-gray-800">Features:</p>
                <ul className="mt-4 space-y-3 text-gray-600">
                  <li>✔️ 15GB storage</li>
                  <li>✔️ Analyze geospatial data</li>
                  <li>✔️ Create and publish 50 maps</li>
                </ul>
              </div>
              <div className="mt-6">
                <p className="text-2xl font-bold text-gray-800">$39/month</p>
              </div>
            </div>
          </div>

          {/* Team Plan */}
          <div className="bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-lg rounded-lg overflow-hidden border border-gray-200 transform hover:scale-105 transition-transform duration-300">
            <div className="p-8">
              <h3 className="text-3xl font-bold">Team</h3>
              <p className="mt-4 text-lg">For advanced users and teams</p>
              <div className="mt-6">
                <p className="text-xl font-medium">Features:</p>
                <ul className="mt-4 space-y-3">
                  <li>
                    ✔️ 15GB individual storage and 25GB team storage per user
                  </li>
                  <li>✔️ Analyze geospatial data</li>
                  <li>✔️ Create and publish unlimited maps</li>
                </ul>
              </div>
              <div className="mt-6">
                <p className="text-2xl font-bold">$49/month</p>
                <p className="text-sm">Minimum 2 users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Self-Hosting and Support */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
            Need something more?
          </h3>
          <p className="mt-4 text-xl text-gray-700">
            Contact us for self-hosting options and additional support services.
          </p>
          <a href="mailto:zachflanders@gmail.com">
            <button className="mt-8 px-8 py-4 bg-blue-500  text-white rounded-lg hover:bg-blue-400 transition-colors duration-300">
              Contact Us
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
