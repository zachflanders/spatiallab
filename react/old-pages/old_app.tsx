import '../styles/globals.css'; // Import global styles
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';

function SpatialLab({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default SpatialLab;