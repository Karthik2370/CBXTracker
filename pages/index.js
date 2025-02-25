import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faTwitter, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link"; // Import Link for client-side navigation
import Head from "next/head"; // Import Head for SEO meta tags (added from previous updates)

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState("poNumber"); // Changed default to "poNumber"
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hello! How can I assist you?", sender: "bot" }]);
  const [userInput, setUserInput] = useState(""); // New state for custom input
  const [isBotTyping, setIsBotTyping] = useState(false); // New state for typing indicator
  const [easterEggActive, setEasterEggActive] = useState(false);
  const router = useRouter();

  const messagesEndRef = useRef(null); // Ref for the end of the messages div to scroll to

  const handleTrack = (e) => {
    e.preventDefault();
    if (searchValue.trim() !== "") {
      // Route to /track/jobNumber with query parameters for type and id
      router.push(`/track/jobNumber?type=${searchType}&id=${searchValue}`);
    } else {
      alert("Please enter a job number or PO number.");
    }
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  const predefinedQA = [
    { question: "How do I track my shipment?", answer: "Select 'Job Number' or 'PO Number', enter your number, and click 'Track' to see the status." },
    { question: "I can't find my job number, Why?", answer: "Kindly recheck your job number or PO number and try again. If it is still absent, mail a query at <a href='mailto:info@cbxlogistics.com'>info@cbxlogistics.com</a>" },
    { question: "How do I contact support?", answer: "You can email us at <a href='mailto:info@cbxlogistics.com'>info@cbxlogistics.com</a> or call +91-(0)22-42215221." },
    { question: "Incorrect details in the tracking page?", answer: "Kindly mail us at <a href='mailto:info@cbxlogistics.com'>info@cbxlogistics.com</a> and we will fix the issue as soon as possible." },
  ];

  // Easter egg activation when the word "owner" is typed
  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
    if (e.target.value.toLowerCase() === "owner") {
      setEasterEggActive(true);
    } else {
      setEasterEggActive(false);
    }
  };

  const handleQuestionClick = (question, answer) => {
    handleSendMessage(question, answer); // Use the new handleSendMessage for consistency
  };

  const handleSendMessage = (question = null, answer = null) => {
    const messageText = question || userInput;
    if (messageText.trim() === "") return;

    setMessages((prev) => [...prev, { text: messageText, sender: "user" }]);
    setUserInput(""); // Clear input after sending

    // Simulate bot response with typing indicator and auto-scroll
    setIsBotTyping(true);
    setTimeout(() => {
      let botResponse;
      const lowerCaseInput = messageText.toLowerCase();

      // Respond to greetings
      if (lowerCaseInput === "hi" || lowerCaseInput === "hello" || lowerCaseInput === "hey") {
        botResponse = "Hello! Welcome to CBX Logistics. How can I assist you today?";
      }
      // Respond to ":help" keyword
      else if (lowerCaseInput.includes("help") || lowerCaseInput.includes("talent")) {
        botResponse = "Here’s how I can help: Ask me about tracking shipments, logging in, contacting support, or reporting issues. Type any of these keywords or use the predefined questions below!";
      }
      // Hidden feature: Respond to queries about the maker of the website
      else if (lowerCaseInput.includes("maker") || lowerCaseInput.includes("creator") || lowerCaseInput.includes("owner") || lowerCaseInput.includes("made") || lowerCaseInput.includes("built")) {
        botResponse = "The owner and creator of this website is Mr. Karthik Nambiar. Contact me at <a href='mailto:ramachandrankarthik7@gmail.com'>ramachandrankarthik7@gmail.com</a>";
      }
      // Existing keyword-based responses
      else if (lowerCaseInput.includes("track") || lowerCaseInput.includes("shipment")) {
        botResponse = "To track your shipment, select 'Job Number' or 'PO Number', enter your number, and click 'Track' on the homepage.";
      } else if (lowerCaseInput.includes("login") || lowerCaseInput.includes("access")) {
        botResponse = "You can log in as an employee or admin using the buttons at the top of the page. Visit the login page for more details.";
      } else if (lowerCaseInput.includes("contact") || lowerCaseInput.includes("support")) {
        botResponse = "You can email us at <a href='mailto:info@cbxlogistics.com'>info@cbxlogistics.com</a> or call +91-(0)22-42215221.";
      } else if (lowerCaseInput.includes("error") || lowerCaseInput.includes("problem")) {
        botResponse = "Sorry to hear that! Please email <a href='mailto:info@cbxlogistics.com'>info@cbxlogistics.com</a> with details, and we’ll assist you.";
      } else {
        botResponse = "Sorry, I couldn’t understand that. Try asking a predefined question or contact support at <a href='mailto:info@cbxlogistics.com'>info@cbxlogistics.com</a>";
      }

      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
      setIsBotTyping(false);
    }, 1000); // 1-second delay to simulate typing
  };

  // Auto-scroll to the bottom when messages or isBotTyping change
  useEffect(() => {
    if (!isBotTyping) { // Only scroll when the bot is done typing
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100); // Small delay to ensure DOM updates
      return () => clearTimeout(timer);
    }
  }, [messages, isBotTyping]); // Trigger on messages or typing state change

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  return (
    <>
      <Head>
        <title>CBX Tracker - Real-Time Shipment Tracking</title>
        <meta name="description" content="Track your shipments in real-time with CBX Tracker. Enter your Job Number or PO Number to check status for Air Cargo and Sea Cargo." />
        <meta name="keywords" content="CBX Tracker, shipment tracking, job number, PO number, air cargo, sea cargo, logistics tracking" />
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

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center flex-grow pt-24 px-4 bg-black bg-opacity-40">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Job Tracker</h2>
          <p className="text-lg sm:text-xl text-gray-200 mb-6">Track your shipment in real-time</p>

          <form onSubmit={handleTrack} className="flex w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-blue-200">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="p-4 border-r border-blue-200 rounded-l-xl focus:outline-none bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors duration-300 appearance-none"
            >
              <option value="jobNumber">Job Number</option>
              <option value="poNumber">PO Number</option>
            </select>
            <input
              type="text"
              placeholder="Enter Job or PO Number"
              value={searchValue}
              onChange={handleInputChange}
              className="p-4 border-r border-blue-200 focus:outline-none w-full bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-600 transition-colors duration-300"
            />
            <button type="submit" className="bg-blue-600 text-white px-8 py-4 rounded-r-xl hover:bg-blue-700 hover:scale-105 transition-transform duration-300 ease-in-out shadow-md">
              Track
            </button>
          </form>

          {/* Easter Egg Message */}
          {easterEggActive && (
            <div className="mt-4 p-4 bg-yellow-500 text-black rounded-xl shadow-lg">
              <p className="font-bold">The owner and creator of this website is Mr. Karthik Nambiar.</p>
              <p>Contact me at <a href="mailto:ramachandrankarthik7@gmail.com" className="text-blue-700 hover:underline">ramachandrankarthik7@gmail.com</a></p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} CBX Logistics. All rights reserved.
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
        <div className={`fixed bottom-24 right-5 transition-all opacity-100 ${isChatOpen ? 'translate-y-0' : 'translate-y-full'}`} style={{ zIndex: 50 }}>
          <button
            className="bg-blue-600 text-white px-5 py-5 rounded-full shadow-lg hover:bg-blue-700 transition flex justify-center items-center"
            onClick={() => setIsChatOpen(!isChatOpen)}
            style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 100 }}
          >
            <FontAwesomeIcon icon={faRobot} className="text-3xl" />
          </button>

          {isChatOpen && (
            <div className="bg-white w-80 shadow-lg rounded-lg fixed bottom-16 right-5 p-4 border transform transition-all" style={{ zIndex: 100 }}>
              {/* Chatbot Header */}
              <div className="flex items-center bg-blue-600 text-white p-3 rounded-t-lg">
                <FontAwesomeIcon icon={faRobot} className="text-2xl mr-2" />
                <h3 className="text-lg font-bold">I am CBXpert</h3>
              </div>

              {/* Chat Messages with Auto-Scroll */}
              <div className="h-40 overflow-y-auto p-2 space-y-2" ref={messagesEndRef}>
                {messages.map((msg, index) => (
                  <div key={index} className={`p-2 rounded ${msg.sender === "bot" ? "bg-blue-500 text-white" : "bg-gray-300 text-black text-right"}`}>
                    {msg.sender === "bot" && (
                      <span className="inline-block font-bold">CBXpert: </span>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </div>
                ))}
                {isBotTyping && (
                  <div className="p-2 text-gray-500">CBXpert is typing...</div>
                )}
              </div>

              {/* Predefined Questions Dropdown */}
              <div className="mt-2">
                <select
                  onChange={(e) => {
                    const selectedQuestion = e.target.value;
                    if (selectedQuestion) {
                      const qa = predefinedQA.find(q => q.question === selectedQuestion);
                      handleSendMessage(qa.question, qa.answer);
                      e.target.value = ""; // Reset dropdown after selection
                    }
                  }}
                  className="border p-2 rounded w-full mb-2"
                >
                  <option value="">Select a Question</option>
                  {predefinedQA.map((qa, index) => (
                    <option key={index} value={qa.question}>
                      {qa.question}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Input with Enter Key Support */}
              <div className="flex mt-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="border p-2 rounded-l-md w-full"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="bg-blue-600 text-white px-3 py-2 rounded-r-md hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
