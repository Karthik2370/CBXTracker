import { useState, useCallback } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); // Success message for password reset
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const router = useRouter();
  const { role } = router.query;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6; // Minimum 6 characters for Firebase default
  };

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userDocRef = doc(db, "roles", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userRole = userDoc.data().role;

        if (role && userRole === role) {
          router.push(role === "admin" ? "/admin" : "/dashboard");
        } else {
          setError("Unauthorized access for this role.");
        }
      } else {
        setError("No role data found for this user.");
      }
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;
        case "auth/too-many-requests":
          setError("Too many login attempts. Please try again later.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, password, role, router]);

  const handleResetPassword = useCallback(async () => {
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email to reset the password.");
      setIsLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => setMessage(""), 5000); // Clear message after 5 seconds
    } catch (err) {
      console.error("Error sending reset email:", err);
      setError("Failed to send reset email. Make sure the email is correct.");
      setTimeout(() => setError(""), 5000); // Clear error after 5 seconds
    } finally {
      setIsLoading(false);
    }
  }, [email, router]);

  const goToHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-96 max-w-md">
        {/* Home Button */}
        <button
          onClick={goToHome}
          className="absolute top-2 right-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Home
        </button>

        <h2 className="text-3xl font-bold mb-6 text-blue-600 text-center">
          Login as {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
        </h2>

        {error && <p className="text-red-500 mb-4 text-center fade-in">{error}</p>}
        {message && <p className="text-green-500 mb-4 text-center fade-in">{message}</p>}

        {/* Wrap inputs inside a form for Enter key functionality */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-blue-300 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-blue-300 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-500 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Login Button with Loading State */}
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>

        {/* Reset Password Link with Loading State */}
        <div className="text-center mt-4">
          <button
            onClick={handleResetPassword}
            className="text-blue-500 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Forgot Password?"}
          </button>
        </div>
      </div>
    </div>
  );
}
