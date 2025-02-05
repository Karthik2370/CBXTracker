import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminName, setAdminName] = useState("Admin");
  const router = useRouter();

  const goToHome = () => router.push("/");

  // Fetch Admin Name, Employees, and Jobs
  useEffect(() => {
    const fetchAdminData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "roles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdminName(docSnap.data().name || "Admin");
        }
      }
    };

    fetchAdminData();

    const unsubscribeEmployees = onSnapshot(collection(db, "roles"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEmployees(data);
    });

    const unsubscribeJobs = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(data);
    });

    return () => {
      unsubscribeEmployees();
      unsubscribeJobs();
    };
  }, []);

  // Remove Employee
  const handleRemoveEmployee = async (id) => {
    try {
      await deleteDoc(doc(db, "roles", id));
      alert("Employee removed successfully!");
    } catch (error) {
      console.error("Error removing employee:", error.message);
      alert("Failed to remove employee.");
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Filter Jobs Based on Search Query
  const filteredJobs = jobs.filter((job) =>
    (job.jobNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 bg-blue-50 min-h-screen">
      {/* Taskbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 p-3 rounded shadow-md mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-0">Admin Dashboard</h1>
        <div className="space-y-2 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
          <button onClick={goToHome} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto">
            Home
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto">
            Logout
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-6">Hello, {adminName}!</h2>

      {/* Employee Management Section (Only View & Remove) */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Manage Employees</h2>

        {/* List of Employees */}
        <ul className="space-y-2">
          {employees.map((emp) => (
            <li key={emp.id} className="border p-3 rounded flex flex-col sm:flex-row justify-between items-center bg-white shadow-sm">
              <span>{emp.name} ({emp.email}) - <strong>{emp.role}</strong></span>
              <button
                onClick={() => handleRemoveEmployee(emp.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 mt-2 sm:mt-0"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Job Management Section */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">View Jobs</h2>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by Job Number"
          className="border p-2 rounded w-full mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Display All Jobs */}
        {filteredJobs.length > 0 ? (
          <ul className="space-y-2">
            {filteredJobs.map((job) => (
              <li key={job.id} className="border p-3 rounded bg-white shadow-sm">
                <strong>Job:</strong> {job.jobNumber} <br />
                <strong>Status:</strong> {job.status} <br />
                <strong>Description:</strong> {job.description || "N/A"} <br />
                <strong>Weight:</strong> {job.weight || "N/A"} <br />
                <strong>No. of Packages:</strong> {job.numPackages || "N/A"} <br />
                <strong>PO Number:</strong> {job.poNumber || "N/A"} <br />
                <strong>Transit Point:</strong> {job.transitPoint || "N/A"} <br />
                <strong>Planning Date:</strong> {job.planningDate || "N/A"} <br />
                <strong>Last Updated:</strong> {new Date(job.lastUpdated).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No jobs found.</p>
        )}
      </div>
    </div>
  );
}
