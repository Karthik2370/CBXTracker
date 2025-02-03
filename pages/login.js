import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");  // Success message for password reset
  const router = useRouter();
  const { role } = router.query;

  const handleLogin = async (e) => {
    e.preventDefault();  // Prevent page refresh on form submit
    setError("");  
    setMessage("");  

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
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleResetPassword = async () => {
    setError("");  
    setMessage("");  

    if (!email) {
      setError("Please enter your email to reset the password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error("Error sending reset email:", err);
      setError("Failed to send reset email. Make sure the email is correct.");
    }
  };

  const goToHome = () => {
    router.push("/");  
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96 relative">

        {/* Home Button */}
        <button
          onClick={goToHome}
          className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Home
        </button>

        <h2 className="text-2xl font-bold mb-4 text-primary">
          Login as {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
        </h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}
        {message && <p className="text-green-500 mb-3">{message}</p>}

        {/* Wrap inputs inside a form for Enter key functionality */}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Login Button */}
          <button
            type="submit"  // This enables the Enter key submission
            className="bg-primary text-white w-full py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        {/* Reset Password Link */}
        <div className="text-center mt-4">
          <button
            onClick={handleResetPassword}
            className="text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
