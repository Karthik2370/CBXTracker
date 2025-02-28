import "../styles/globals.css";
import Head from "next/head";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect, useState } from "react"; // Added for optional loading/error handling
import { auth } from "../firebaseConfig"; // Optional: Add if you want to integrate Firebase Auth
import { onAuthStateChanged } from "firebase/auth"; // Optional: For authentication
import Script from "next/script"; // Import Script for Google Analytics

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(false); // Optional: Global loading state
  const [error, setError] = useState(null); // Optional: Global error state
  const [user, setUser] = useState(null); // Optional: Authentication state

  // Optional: Handle global loading or errors (e.g., for Firestore or routing issues)
  useEffect(() => {
    setIsLoading(true);
    // Simulate some initial loading (remove or customize as needed)
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Optional: Firebase Authentication listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false); // Stop loading when auth state is determined
    });
    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Optional: Error boundary for uncaught errors
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
        {/* Use your PNG favicon */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <title>CBX Logistics Tracker</title>
        {/* Add SEO meta tags */}
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

      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=G-L26J3RP3P5`} // Replace with your Measurement ID
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-L26J3RP3P5'); // Replace with your Measurement ID
        `}
      </Script>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="w-8 h-8 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        <Component {...pageProps} />
      )}
      {/* Conditionally render SpeedInsights in production only */}
      {process.env.NODE_ENV === "production" && <SpeedInsights />}
    </>
  );
}

export default MyApp;
