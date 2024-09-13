import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 */}
          <div>
            <h4 className="text-lg font-semibold text-white">About Us</h4>
            <p className="mt-4 text-gray-400">
              We provide powerful geospatial solutions that help you manage,
              analyze, and share your data with ease.
            </p>
            <p className="mt-4 text-gray-400">Made with ❤️ in Kansas City.</p>
          </div>

          {/* Column 2 */}
          <div></div>

          {/* Column 3 */}
          <div></div>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Spatial Lab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
