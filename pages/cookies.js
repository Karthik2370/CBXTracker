import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faFacebookF, faLinkedinIn } from "@fortawesome/free-brands-svg-icons"; // Updated to free-brands-svg-icons
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"; // Correctly import faArrowLeft from free-solid-svg-icons
import Link from "next/link";

export default function CookiePolicy() {
  return (
    <>
      <Head>
        <title>CBX Tracker - Cookie Policy | Understand Our Cookie Usage</title>
        <meta
          name="description"
          content="Learn how CBX Tracker uses cookies to enhance your experience and improve our site. Review our Cookie Policy for details on analytics and privacy under Indian law."
        />
        <meta name="keywords" content="CBX Tracker, cookie policy, cookies, privacy, shipment tracking, Google Analytics, logistics, India" />
        <meta name="robots" content="index, follow" />
      </Head>
      <div className="min-h-screen flex flex-col justify-between bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/background.jpg')" }}>
        {/* Navigation Bar */}
        <nav className="bg-gray-800 bg-opacity-80 shadow-md p-4 flex flex-col sm:flex-row sm:justify-between items-center fixed w-full top-0 z-50">
          <div className="flex items-center space-x-3 cursor-pointer relative">
            <a href="http://cbxlogistics.com" target="_blank" rel="noopener noreferrer">
              <img src="/logo.png" alt="CBX Logistics Logo" className="h-12 w-auto hover:drop-shadow-glow transition-transform duration-300 ease-in-out hover:scale-105" />
            </a>
            <div className="relative group">
              <h1 className="text-xl sm:text-2xl font-bold text-white group-hover:underline">CBX Logistics</h1>
              <div className="absolute left-0 mt-2 bg-white text-black p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 w-80">
                CBX Logistics is established in the year 2001, which is formed by a group of international logistical professionals.
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mt-3 sm:mt-0">
            <Link href="/login?role=employee">
              <button className="bg-yellow-400 text-white px-3 sm:px-4 py-2 rounded hover:bg-yellow-500 hover:scale-105 transition-transform duration-300 ease-in-out">
                Employee Login
              </button>
            </Link>
            <Link href="/login?role=admin">
              <button className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 transition-transform duration-300 ease-in-out">
                Admin Login
              </button>
            </Link>
          </div>
        </nav>

        {/* Responsive "Back to Home" Button (Hidden on Mobile, Visible on Desktop) */}
        <div className="hidden sm:block fixed top-20 left-4 z-50">
          <Link href="/" legacyBehavior>
            <a className="flex items-center px-4 py-2 bg-white rounded-lg shadow-md text-blue-600 font-semibold hover:bg-blue-100 hover:shadow-lg transition-all duration-300 ease-in-out">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Home
            </a>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center flex-grow pt-24 px-4 bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
            <h1 className="text-3xl font-bold mb-4 text-blue-600">Cookie Policy</h1>
            <p className="text-gray-700 mb-4">Last Updated: March 1, 2025</p>
            <p className="text-gray-700 mb-4">This Cookie Policy explains how CBX Logistics uses cookies and similar technologies on the CBX Tracker website to enhance your experience and ensure compliance with privacy laws in India.</p>
            <h2 className="text-2xl font-semibold mt-4 text-blue-600">1. What Are Cookies?</h2>
            <p className="text-gray-700 mb-4">Cookies are small text files stored on your device to enhance your browsing experience, provide analytics, and personalize content. They help us understand how you use CBX Tracker and improve our services.</p>
            <h2 className="text-2xl font-semibold mt-4 text-blue-600">2. Cookies We Use</h2>
            <p className="text-gray-700 mb-4">We use cookies for the following purposes:</p>
            <ul className="list-disc ml-6 text-gray-700 mb-4">
              <li><strong>Analytics:</strong> We use Google Analytics to track website traffic, user behavior, and site performance, anonymizing IP addresses to protect your privacy.</li>
              <li><strong>Functional:</strong> Cookies ensure features like shipment tracking and login functionality work smoothly across sessions.</li>
              <li><strong>Preferences:</strong> Cookies store user preferences to enhance your experience on CBX Tracker.</li>
            </ul>
            <h2 className="text-2xl font-semibold mt-4 text-blue-600">3. Managing Cookies</h2>
            <p className="text-gray-700 mb-4">You can manage cookie preferences in your browser settings, disable cookies, or contact us at <a href="mailto:info@cbxlogistics.com" className="text-blue-700 hover:underline">info@cbxlogistics.com</a> for assistance. You may also opt out of Google Analytics tracking by visiting <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">Google’s opt-out page</a>.</p>
            <h2 className="text-2xl font-semibold mt-4 text-blue-600">4. Your Rights</h2>
            <p className="text-gray-700 mb-4">Under the Digital Personal Data Protection Act, 2023 (DPDP Act) in India, you have the right to access, correct, restrict, or delete personal data, including cookies stored by CBX Tracker. You can also withdraw consent for data processing at any time. Contact us at <a href="mailto:info@cbxlogistics.com" className="text-blue-700 hover:underline">info@cbxlogistics.com</a> to exercise these rights or for more information.</p>
            <h2 className="text-2xl font-semibold mt-4 text-blue-600">5. Contact Us</h2>
            <p className="text-gray-700 mb-4">For cookie-related questions, email us at <a href="mailto:info@cbxlogistics.com" className="text-blue-700 hover:underline">info@cbxlogistics.com</a> or call +91-(0)22-42215221. We’re here to assist with any privacy concerns related to CBX Tracker.</p>
            <p className="text-gray-700 mt-4">Version 1.1 - March 1, 2025</p>
          </div>
        </div>

        <footer className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} CBX Logistics. All rights reserved. | <Link href="/privacy" legacyBehavior><a className="hover:underline">Privacy Policy</a></Link> | <Link href="/terms" legacyBehavior><a className="hover:underline">Terms of Use</a></Link> | <Link href="/cookies" legacyBehavior><a className="hover:underline">Cookie Policy</a></Link> | <Link href="/disclaimer" legacyBehavior><a className="hover:underline">Disclaimer</a></Link>
          </div>
          <div className="relative group flex items-center space-x-4">
            <div className="flex space-x-4 text-white">
              <a href="https://twitter.com/CBX_Logistics" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTwitter} className="text-xl hover:scale-110 transition-transform duration-300 ease-in-out" />
              </a>
              <a href="https://www.facebook.com/pages/CBX-Logistics/727157680639503" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebookF} className="text-xl hover:scale-110 transition-transform duration-300 ease-in-out" />
              </a>
              <a href="https://www.linkedin.com/company/cbx-logistics" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedinIn} className="text-xl hover:scale-110 transition-transform duration-300 ease-in-out" />
              </a>
            </div>
            <div className="relative group">
              <a href="mailto:info@cbxlogistics.com" className="hover:underline cursor-pointer">Contact Us</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}