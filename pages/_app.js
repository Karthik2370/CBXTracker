import "../styles/globals.css";
import Head from "next/head";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p className="text-red-600 text-lg">An error occurred: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <title>CBX Logistics Tracker</title>
        <meta
          name="description"
          content="Track your shipments in real-time with CBX Logistics. Enter your job number or PO number to get the latest status."
        />
        <meta
          name="keywords"
          content="CBX Logistics, shipment tracking, job number, PO number, logistics, shipping"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Google Analytics Script with Updated Measurement ID */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-L26JJRP35S`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-L26JJRP35S');
        `}
      </Script>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="w-8 h-8 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <Component {...pageProps} />
      )}
      {process.env.NODE_ENV === "production" && <SpeedInsights />}
    </>
  );
}

export default MyApp;
