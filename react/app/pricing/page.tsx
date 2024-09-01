import React from 'react';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">
          Pricing Plans
        </h2>
        <p className="mt-4 text-lg text-gray-600 text-center">
          Choose the plan that fits your needs. Upgrade anytime as your needs
          grow.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {/* Free Plan */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900">Free</h3>
              <p className="mt-4 text-gray-600">Perfect for getting started</p>
              <div className="mt-6">
                <p className="text-lg font-medium text-gray-900">Features:</p>
                <ul className="mt-4 space-y-2">
                  <li>✔️ Upload up to 3 layers</li>
                  <li>✔️ 500MB storage</li>
                  <li>✔️ Analyze geospatial data</li>
                  <li>✔️ Create and publish 3 maps</li>
                </ul>
              </div>
              <div className="mt-6">
                <p className="text-lg font-medium text-gray-900">$0/month</p>
              </div>
            </div>
          </div>

          {/* Basic Plan */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900">Basic</h3>
              <p className="mt-4 text-gray-600">Great for small projects</p>
              <div className="mt-6">
                <p className="text-lg font-medium text-gray-900">Features:</p>
                <ul className="mt-4 space-y-2">
                  <li>✔️ Upload up to 100 layers</li>
                  <li>✔️ 50GB storage</li>
                  <li>✔️ Analyze geospatial data</li>
                  <li>✔️ Create and publish 50 maps</li>
                </ul>
              </div>
              <div className="mt-6">
                <p className="text-lg font-medium text-gray-900">$19/month</p>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-2xl font-semibold text-gray-900">Pro</h3>
              <p className="mt-4 text-gray-600">For advanced users and teams</p>
              <div className="mt-6">
                <p className="text-lg font-medium text-gray-900">Features:</p>
                <ul className="mt-4 space-y-2">
                  <li>✔️ Unlimited layers</li>
                  <li>✔️ 250GB storage</li>
                  <li>✔️ Analyze geospatial data</li>
                  <li>✔️ Create and publish unlimited maps</li>
                </ul>
              </div>
              <div className="mt-6">
                <p className="text-lg font-medium text-gray-900">$49/month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Self-Hosting and Support */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-gray-900">
            Need something more?
          </h3>
          <p className="mt-4 text-lg text-gray-600">
            Contact us for self-hosting options and additional support services.
          </p>
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
