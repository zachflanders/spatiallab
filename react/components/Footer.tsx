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
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-lg font-semibold text-white">Stay Connected</h4>
            <ul className="mt-4 flex space-x-4">
              <li>
                <a href="#" aria-label="Twitter" className="hover:text-white">
                  <svg
                    className="w-6 h-6 text-gray-400 hover:text-white"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.933 4.933 0 0 0 2.165-2.723 9.865 9.865 0 0 1-3.127 1.195 4.916 4.916 0 0 0-8.379 4.482A13.94 13.94 0 0 1 1.671 3.149 4.918 4.918 0 0 0 3.149 9.72 4.903 4.903 0 0 1 .965 9.333v.062a4.914 4.914 0 0 0 3.946 4.808 4.902 4.902 0 0 1-2.212.084 4.917 4.917 0 0 0 4.587 3.41A9.867 9.867 0 0 1 0 21.544a13.937 13.937 0 0 0 7.548 2.212c9.057 0 14.01-7.512 14.01-14.01 0-.213-.005-.425-.014-.637A10.004 10.004 0 0 0 24 4.557z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" aria-label="LinkedIn" className="hover:text-white">
                  <svg
                    className="w-6 h-6 text-gray-400 hover:text-white"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.451 20.451h-3.742v-5.569c0-1.331-.026-3.044-1.855-3.044-1.857 0-2.141 1.449-2.141 2.944v5.669H8.971V9h3.593v1.561h.05c.501-.952 1.724-1.955 3.551-1.955 3.801 0 4.504 2.504 4.504 5.761v6.084zM5.337 7.433a2.165 2.165 0 1 1 0-4.33 2.165 2.165 0 0 1 0 4.33zm-1.874 13.018h3.748V9h-3.748v11.451zM22.225 0H1.771C.792 0 0 .771 0 1.729v20.542C0 23.229.792 24 1.771 24h20.451c.979 0 1.779-.771 1.779-1.729V1.729C24 .771 23.204 0 22.225 0z" />
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" aria-label="GitHub" className="hover:text-white">
                  <svg
                    className="w-6 h-6 text-gray-400 hover:text-white"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.724-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.243 1.838 1.243 1.07 1.835 2.809 1.304 3.495.998.108-.774.418-1.305.762-1.605-2.665-.304-5.466-1.334-5.466-5.93 0-1.31.47-2.38 1.235-3.22-.123-.303-.535-1.524.118-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.98-.399 3.003-.404 1.021.005 2.046.138 3.003.404 2.289-1.552 3.296-1.23 3.296-1.23.655 1.651.243 2.872.119 3.175.767.84 1.234 1.91 1.234 3.22 0 4.608-2.805 5.623-5.475 5.921.429.37.824 1.103.824 2.222v3.293c0 .319.217.694.825.577C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} SpatialLab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
