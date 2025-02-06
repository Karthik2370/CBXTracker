import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [jobNumber, setJobNumber] = useState("");
  const router = useRouter();

  const handleTrack = (e) => {
    e.preventDefault(); // Prevent page reload on Enter key
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
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.open("http://cbxlogistics.com", "_blank")}>
          <img src="/logo.png" alt="CBX Logistics Logo" className="h-12 w-auto" />
          <h1 className="text-xl sm:text-2xl font-bold text-white">CBX Logistics</h1>
        </div>
        
        {/* Buttons */}
        <div className="flex space-x-2 mt-3 sm:mt-0">
          <button
            onClick={() => navigateTo('/login?role=employee')}
            className="bg-yellow-400 text-white px-3 sm:px-4 py-2 rounded hover:bg-yellow-500"
          >
            Employee Login
          </button>
          <button
            onClick={() => navigateTo('/login?role=admin')}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700"
          >
            Admin Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow pt-24 px-4 bg-black bg-opacity-40">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Job Tracker</h2>
        <p className="text-lg sm:text-xl text-gray-200 mb-6">Track your shipment in real-time</p>

        {/* Form to handle Enter key submission */}
        <form onSubmit={handleTrack} className="flex w-full max-w-md">
          <input
            type="text"
            placeholder="Enter Job Number"
            value={jobNumber}
            onChange={(e) => setJobNumber(e.target.value)}
            className="p-3 border border-gray-300 rounded-l-md focus:outline-none w-full"
          />
          <button
            type="submit"  // This allows the Enter key to trigger the form submission
            className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700"
          >
            Track
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 flex flex-col sm:flex-row justify-between items-center">
        
        {/* Copyright */}
        <div className="text-center sm:text-left mb-2 sm:mb-0">
          &copy; {new Date().getFullYear()} CBX Logistics. All rights reserved. Made by Karthik
        </div>

        {/* About CBX */}
        <div className="relative group cursor-pointer mb-2 sm:mb-0">
          <span className="hover:underline">About CBX</span>
          <div className="absolute left-1/2 sm:left-0 transform sm:translate-x-0 -translate-x-1/2 bottom-full mb-2 bg-white text-black p-4 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 w-72">
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

        {/* Contact Us */}
        <div>
          <a
            href="mailto:info@cbxlogistics.com"
            className="hover:underline text-blue-400"
          >
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
}
