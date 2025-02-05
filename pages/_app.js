import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Use your PNG favicon */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <title>CBX Logistics Tracker</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
