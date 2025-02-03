import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signOut, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, onSnapshot, doc, deleteDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [employees, setEmployees] = useState([]);
  const [jobNumber, setJobNumber] = useState("");
  const [jobs, setJobs] = useState([]);
  const router = useRouter();

  // Navigate to Home (Main Tracking Page)
  const goToHome = () => {
    router.push("/");
  };

  // Fetch employees from Firestore
  useEffect(() => {
    const fetchEmployees = async () => {
      const querySnapshot = await getDocs(collection(db, "roles"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(data);
    };

    fetchEmployees();

    // Real-time job updates
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(data);
    });

    return () => unsubscribe();
  }, []);

  // Add new employee (Firebase Auth + Firestore + Password Reset)
  const handleAddEmployee = async () => {
    if (!email || !role) {
      alert("Please fill in both email and role.");
      return;
    }

    try {
      const existingUsersSnapshot = await getDocs(collection(db, "roles"));
      const existingUser = existingUsersSnapshot.docs.find(doc => doc.data().email === email);

      if (existingUser) {
        alert("This email is already registered.");
        return;
      }

      const defaultPassword = "TempPassword123!";
      const userCredential = await createUserWithEmailAndPassword(auth, email, defaultPassword);
      const user = userCredential.user;

      await setDoc(doc(db, "roles", user.uid), { email, role });

      await sendPasswordResetEmail(auth, email);

      alert(`Employee added successfully! A password reset email has been sent to ${email}.`);

      setEmail("");
      setRole("employee");

    } catch (error) {
      console.error("Error adding employee:", error.code, error.message);
      
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email format. Please enter a valid email.");
      } else if (error.code === "auth/operation-not-allowed") {
        alert("Email/password sign-up is disabled in Firebase settings.");
      } else {
        alert("Failed to add employee. Check console for details.");
      }
    }
  };

  // Remove employee (from Firestore)
  const handleRemoveEmployee = async (id) => {
    try {
      await deleteDoc(doc(db, "roles", id));
      alert("Employee removed from Firestore. You may need to remove them manually from Firebase Authentication.");
    } catch (error) {
      console.error("Error removing employee:", error.message);
      alert("Failed to remove employee.");
    }
  };

  // Create a new job
  const handleCreateJob = async () => {
    if (!jobNumber) return alert("Enter a Job Number");

    try {
      await setDoc(doc(db, "jobs", jobNumber), {
        jobNumber,
        status: "Pending", 
        lastUpdated: new Date(),
      });
      alert("Job created successfully!");
      setJobNumber(""); 
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job.");
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="p-6">
      
      {/* Taskbar with Home and Logout buttons */}
      <div className="flex justify-between items-center mb-4 bg-gray-800 p-3 rounded shadow-md">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={goToHome}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Home
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Employee Management Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Manage Employees</h2>

        {/* Add Employee */}
        <div className="mb-6">
          <input
            type="email"
            placeholder="Enter Employee Email"
            className="border p-2 rounded w-full my-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="border p-2 rounded w-full my-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleAddEmployee}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            Add Employee
          </button>
        </div>

        {/* Display Existing Employees */}
        <ul>
          {employees.map((emp) => (
            <li key={emp.id} className="border-b py-2 flex justify-between items-center">
              <span>{emp.email} - <strong>{emp.role}</strong></span>
              <button
                onClick={() => handleRemoveEmployee(emp.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Job Management Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Manage Jobs</h2>

        {/* Create Job */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Enter Job Number"
            className="border p-2 rounded w-full my-2"
            value={jobNumber}
            onChange={(e) => setJobNumber(e.target.value)}
          />
          <button
            onClick={handleCreateJob}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
          >
            Create Job
          </button>
        </div>

        {/* Display Existing Jobs */}
        <ul>
          {jobs.map((job) => (
            <li key={job.id} className="border-b py-2">
              <span><strong>Job Number:</strong> {job.jobNumber} - <strong>Status:</strong> {job.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

