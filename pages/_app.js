import "../styles/globals.css";
import Head from "next/head";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Script from "next/script";
import { CookieConsent } from "react-cookie-consent"; // Import CookieConsent
import Link from "next/link"; // Import Link for JSX

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [hasConsent, setHasConsent] = useState(false); // Track cookie consent

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
        {/* Favicon Links Matching Your Files */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32" /> {/* Optional, if needed */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="CBX Tracker" />
        <link rel="manifest" href="/site.webmanifest" />

        <title>CBX Logistics Tracker</title>
        <meta
          name="description"
          content="Track your shipments in real-time with CBX Logistics. Enter your job number or PO number to get the latest status."
        />
        <meta
          name="keywords"
          content="CBX Logistics, shipment tracking, job number, PO number, logistics, shipping, India, DPDP Act"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Conditionally load Google Analytics based on consent */}
      {hasConsent && (
        <>
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
        </>
      )}

      {/* Cookie Consent Banner with Proper Link Handling */}
      <CookieConsent
        enableDeclineButton
        onAccept={() => setHasConsent(true)}
        onDecline={() => setHasConsent(false)}
        buttonText="Accept"
        declineButtonText="Decline"
        cookieName="cbxTrackerConsent"
        style={{ background: '#2d3748', color: '#fff', padding: '1rem' }} // Gray background, white text, Tailwind-like padding
        buttonStyle={{ background: '#48bb78', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.375rem' }} // Green button, white text, rounded
        declineButtonStyle={{ background: '#e53e3e', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.375rem' }} // Red decline button, white text, rounded
      >
        We use cookies to enhance your experience and analyze traffic. By clicking "Accept" or "Decline," you agree to our <Link href="/cookies" passHref legacyBehavior><a className="text-blue-500 hover:underline">Cookie Policy</a></Link>. You can manage your preferences in your browser settings or on this page if you initially declined.
      </CookieConsent>

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