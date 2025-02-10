import { useState } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";

export default function Home() {
  const [jobNumber, setJobNumber] = useState("");
  const router = useRouter();

  const handleTrack = (e) => {
    e.preventDefault();
    if (jobNumber.trim() !== "") {
      router.push(`/track/${jobNumber}`);
    } else {
      alert("Please enter a job number.");
    }
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/background.jpg')" }}>

      {/* Navigation Bar */}
      <nav className="bg-gray-800 bg-opacity-80 shadow-md p-4 flex flex-col sm:flex-row sm:justify-between items-center fixed w-full top-0 z-50">
        <div className="flex items-center space-x-3 cursor-pointer relative">
          <a href="http://cbxlogistics.com" target="_blank" rel="noopener noreferrer">
  <img src="/logo.png" alt="CBX Logistics Logo" className="h-12 w-auto hover:drop-shadow-glow transition-transform duration-300 ease-in-out hover:scale-105" />
          </a>

          {/* CBX Logistics with Hover Effect */}
          <div className="relative group">
            <h1 className="text-xl sm:text-2xl font-bold text-white group-hover:underline">
              CBX Logistics
            </h1>
            <div className="absolute left-0 mt-2 bg-white text-black p-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 w-80">
              CBX Logistics is established in the year 2001, which is formed by a group of international logistical professionals.
            </div>
          </div>
        </div>

        {/* Buttons with Hover Effects */}
        <div className="flex space-x-2 mt-3 sm:mt-0">
          <button
            onClick={() => navigateTo('/login?role=employee')}
            className="bg-yellow-400 text-white px-3 sm:px-4 py-2 rounded hover:bg-yellow-500 hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            Employee Login
          </button>
          <button
            onClick={() => navigateTo('/login?role=admin')}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            Admin Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow pt-24 px-4 bg-black bg-opacity-40">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Job Tracker</h2>
        <p className="text-lg sm:text-xl text-gray-200 mb-6">Track your shipment in real-time</p>

        {/* Form */}
        <form onSubmit={handleTrack} className="flex w-full max-w-md">
          <input
            type="text"
            placeholder="Enter Job Number"
            value={jobNumber}
            onChange={(e) => setJobNumber(e.target.value)}
            className="p-3 border border-gray-300 rounded-l-md focus:outline-none w-full"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 hover:scale-105 transition-transform duration-300 ease-in-out"
          >
            Track
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 flex justify-between items-center">
        {/* Copyright */}
        <div className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} CBX Logistics. All rights reserved.
        </div>

        {/* Contact Us with Hover Info */}
        <div className="relative group flex items-center space-x-4">
          {/* Social Media Icons on the Right */}
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

          {/* Contact Us Hover Effect */}
          <div className="relative group">
            <a href="mailto:info@cbxlogistics.com" className="hover:underline cursor-pointer">
              Contact Us
            </a>
            <div className="absolute right-0 bottom-full mb-2 bg-white text-black p-4 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 w-72 pointer-events-none">
              <p className="font-semibold">CBX Logistics</p>
              <p>D-2123, Oberoi Garden Estate,<br />
                Chandivali Farm Road, Sakinaka,<br />
                Andheri (E), Mumbai - 400 072, India.
              </p>
              <p className="mt-2">
                <strong>Telephone:</strong> +91-(0)22-42215221<br />
                <strong>Email:</strong> info@cbxlogistics.com
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Tailwind Custom Styles */}
      <style jsx global>{`
        .hover\\:drop-shadow-glow:hover {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.5));
        }
      `}</style>
    </div>
  );
}
