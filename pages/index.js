import { useState } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faRobot } from "@fortawesome/free-solid-svg-icons"; 

export default function Home() {
  const [jobNumber, setJobNumber] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hello! How can I assist you?", sender: "bot" }]);
  const [easterEggActive, setEasterEggActive] = useState(false); // State to handle easter egg visibility
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

  const predefinedQA = [
    { question: "How do I track my shipment?", answer: "Enter your job number and click 'Track' to see the status." },
    { question: "I can't find my job number, Why?", answer: "Kindly recheck your job number and try again. If it is still absent, mail a query at <a href='mailto:info@cbxlogistics.com'>info@cbxlogistics.com</a>" },
    { question: "How do I contact support?", answer: "You can email us at <a href='mailto:info@cbxlogistics.com'>info@cbxlogistics.com</a> or call +91-(0)22-42215221." },
    { question: "Incorrect details in the tracking page?", answer: "Kindly mail us at <a href='mailto:info@cbxlogistics.com'>info@cbxlogistics.com</a> and we will fix the issue as soon as possible." },
  ];

  // Easter egg activation when the word "owner" is typed
  const handleInputChange = (e) => {
    setJobNumber(e.target.value);
    if (e.target.value.toLowerCase() === "owner") {
      setEasterEggActive(true); // Activate Easter egg
    } else {
      setEasterEggActive(false); // Deactivate Easter egg if input is not "owner"
    }
  };

  const handleQuestionClick = (question, answer) => {
    setMessages((prev) => [...prev, { text: question, sender: "user" }, { text: answer, sender: "bot" }]);
  };

  return (
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
          <button onClick={() => navigateTo('/login?role=employee')} className="bg-yellow-400 text-white px-3 sm:px-4 py-2 rounded hover:bg-yellow-500 hover:scale-105 transition-transform duration-300 ease-in-out">
            Employee Login
          </button>
          <button onClick={() => navigateTo('/login?role=admin')} className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 hover:scale-105 transition-transform duration-300 ease-in-out">
            Admin Login
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow pt-24 px-4 bg-black bg-opacity-40">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Job Tracker</h2>
        <p className="text-lg sm:text-xl text-gray-200 mb-6">Track your shipment in real-time</p>

        <form onSubmit={handleTrack} className="flex w-full max-w-md">
          <input
            type="text"
            placeholder="Enter Job Number"
            value={jobNumber}
            onChange={handleInputChange} // Use the new handleInputChange
            className="p-3 border border-gray-300 rounded-l-md focus:outline-none w-full"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-r-md hover:bg-blue-700 hover:scale-105 transition-transform duration-300 ease-in-out">
            Track
          </button>
        </form>

       {/* Easter Egg Message */}
        {easterEggActive && (
        <div className="mt-4 p-4 bg-yellow-500 text-black rounded shadow-lg">
        <p className="font-bold">The owner and creator of this website is Mr. Karthik Nambiar.</p>
        <p>Contact me at <a href="mailto:ramachandrankarthik7@gmail.com" className="text-blue-700 hover:underline">ramachandrankarthik7@gmail.com</a></p>
        </div>
       )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} CBX Logistics. All rights reserved.
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

      {/* Chatbot */}
<div className={`fixed bottom-24 right-5 transition-all opacity-100 ${isChatOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ zIndex: 100 }}>
  <button className="bg-blue-600 text-white px-5 py-5 rounded-full shadow-lg hover:bg-blue-700 transition flex justify-center items-center"
    onClick={() => setIsChatOpen(!isChatOpen)}
    style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 100 }}
  >
    <FontAwesomeIcon icon={faRobot} className="text-3xl" />
  </button>

  {isChatOpen && (
    <div className="bg-white w-80 shadow-lg rounded-lg fixed bottom-16 right-5 p-4 border transform transition-all" style={{ zIndex: 100 }}>
      
      {/* Chatbot Header - Avatar on Left, Text on Right */}
      <div className="flex items-center bg-blue-600 text-white p-3 rounded-t-lg">
        <FontAwesomeIcon icon={faRobot} className="text-2xl mr-2" /> 
        <h3 className="text-lg font-bold">I am CBXpert</h3>
      </div>
      
      {/* Chat Messages */}
      <div className="h-40 overflow-y-auto p-2 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 rounded ${msg.sender === "bot" ? "bg-blue-500 text-white" : "bg-gray-300 text-black text-right"}`}>
            {msg.sender === "bot" && (
              <span className="inline-block font-bold">CBXpert: </span>
            )}
            <div dangerouslySetInnerHTML={{ __html: msg.text }} />
          </div>
        ))}
      </div>
      
      {/* Predefined Questions */}
      <div className="mt-2 space-y-2">
        {predefinedQA.map((qa, index) => (
          <button key={index} className="bg-gray-200 px-3 py-2 rounded w-full text-left hover:bg-gray-300 transition"
            onClick={() => handleQuestionClick(qa.question, qa.answer)}
          >
            {qa.question}
          </button>
        ))}
      </div>
    </div>
  )}
</div>


      {/* Tailwind Custom Styles */}
      <style jsx global>{`
        .transform {
          transition: transform 0.3s ease-out, opacity 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
