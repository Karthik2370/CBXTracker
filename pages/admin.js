import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc, deleteDoc, getDocs, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [completedSearchQuery, setCompletedSearchQuery] = useState("");
  const [adminName, setAdminName] = useState("Admin");
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [jobHistories, setJobHistories] = useState({});
  const [editingJobId, setEditingJobId] = useState(null);
  const [editingJobData, setEditingJobData] = useState({});
  const [selectedJobs, setSelectedJobs] = useState([]); // For bulk deletion
  const [selectAllCompleted, setSelectAllCompleted] = useState(false); // For "Select All" in completed jobs
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const router = useRouter();

  const goToHome = () => router.push("/");

  useEffect(() => {
    const fetchAdminData = async () => {
      const user = auth.currentUser ;
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

  const handleToggleHistory = async (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
      if (!jobHistories[jobId]) {
        const jobHistoryRef = collection(db, "jobs", jobId, "history");
        const snapshot = await getDocs(jobHistoryRef);
        const historyData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setJobHistories((prevHistories) => ({ ...prevHistories, [jobId]: historyData }));
      }
    }
  };

  const handleRemoveEmployee = async (id) => {
    try {
      await deleteDoc(doc(db, "roles", id));
      alert("Employee removed successfully!");
    } catch (error) {
      console.error("Error removing employee:", error.message);
      alert("Failed to remove employee.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleEditJob = (job) => {
    setEditingJobId(job.id);
    setEditingJobData({ ...job });
  };

  const handleSaveJob = async () => {
    try {
      const jobRef = doc(db, "jobs", editingJobId);
      await updateDoc(jobRef, { ...editingJobData, lastUpdated: new Date().toISOString() });
      alert("Job updated successfully!");
      setEditingJobId(null);
    } catch (error) {
      console.error("Error updating job:", error.message);
      alert("Failed to update job.");
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this job and its history? This action cannot be undone.");
    if (confirmDelete) {
      try {
        const historyRef = collection(db, "jobs", jobId, "history");
        const historySnapshot = await getDocs(historyRef);
        const deleteHistoryPromises = historySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deleteHistoryPromises);

        await deleteDoc(doc(db, "jobs", jobId));

        alert("Job and its history deleted successfully!");
      } catch (error) {
        console.error("Error deleting job:", error.message);
        alert("Failed to delete job.");
      }
    }
  };

  // Filter jobs based on search queries and sort by lastUpdated in descending order
  const filteredJobs = jobs
    .filter((job) =>
      (job.jobNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) &&
      job.status !== "Completed"
    )
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)); // Sort by lastUpdated descending

  const completedJobs = jobs
    .filter((job) =>
      (job.jobNumber || "").toLowerCase().includes(completedSearchQuery.toLowerCase()) &&
      job.status === "Completed"
    )
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)); // Sort by lastUpdated descending

  // Pagination Logic
  const indexOfLastJob = currentPage * entriesPerPage;
  const indexOfFirstJob = indexOfLastJob - entriesPerPage;
  const currentActiveJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const currentCompletedJobs = completedJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Handle entries per page change
  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing entries per page
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle "Select All" for completed jobs
  const handleSelectAllCompleted = () => {
    if (selectAllCompleted) {
      setSelectedJobs([]); // Deselect all
    } else {
      setSelectedJobs(completedJobs.map((job) => job.id)); // Select all
    }
    setSelectAllCompleted(!selectAllCompleted); // Toggle "Select All" state
  };

  // Bulk deletion handler
  const handleBulkDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete the selected jobs and their histories? This action cannot be undone.");
    if (confirmDelete) {
      try {
        const deletePromises = selectedJobs.map(async (jobId) => {
          const historyRef = collection(db, "jobs", jobId, "history");
          const historySnapshot = await getDocs(historyRef);
          const deleteHistoryPromises = historySnapshot.docs.map((doc) => deleteDoc(doc.ref));
          await Promise.all(deleteHistoryPromises);
          await deleteDoc(doc(db, "jobs", jobId));
        });
        await Promise.all(deletePromises);
        alert("Selected jobs and their histories deleted successfully!");
        setSelectedJobs([]); // Clear selected jobs after deletion
      } catch (error) {
        console.error("Error deleting jobs:", error.message);
        alert("Failed to delete selected jobs.");
      }
    }
  };

  // Render job item with checkbox for bulk deletion
  const renderJobItem = (job) => (
    <li key={job.id} className="border p-3 rounded bg-white shadow-sm">
      {editingJobId === job.id ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Job Number"
            value={editingJobData.jobNumber}
            onChange={(e) => setEditingJobData({ ...editingJobData, jobNumber: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Status"
            value={editingJobData.status}
            onChange={(e) => setEditingJobData({ ...editingJobData, status: e.target.value })}
            className="border p-2 rounded"
          />
          <textarea
            placeholder="Description"
            value={editingJobData.description}
            onChange={(e) => setEditingJobData({ ...editingJobData, description: e.target.value })}
            className="border p-2 rounded col-span-2"
          />
          <input
            type="text"
            placeholder="Weight"
            value={editingJobData.weight}
            onChange={(e) => setEditingJobData({ ...editingJobData, weight: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Number of Packages"
            value={editingJobData.numPackages}
            onChange={(e) => setEditingJobData({ ...editingJobData, numPackages: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="PO Number"
            value={editingJobData.poNumber}
            onChange={(e) => setEditingJobData({ ...editingJobData, poNumber: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Transit Point"
            value={editingJobData.transitPoint}
            onChange={(e) => setEditingJobData({ ...editingJobData, transitPoint: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="date"
            placeholder="Planning Date"
            value={editingJobData.planningDate}
            onChange={(e) => setEditingJobData({ ...editingJobData, planningDate: e.target.value })}
            className="border p-2 rounded"
          />
          <div className="col-span-2 flex justify-end space-x-4">
            <button onClick={handleSaveJob} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Save
            </button>
            <button onClick={() => setEditingJobId(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <strong>Job:</strong> {job.jobNumber} <br />
            <strong>Status:</strong> {job.status} <br />
            <strong>Last Updated:</strong> {new Date(job.lastUpdated).toLocaleString()}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleToggleHistory(job.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              {expandedJobId === job.id ? "Hide History" : "View History"}
            </button>
            <button
              onClick={() => handleEditJob(job)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteJob(job.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {expandedJobId === job.id && (
        <div className="mt-4 p-3 border-t bg-gray-50">
          {jobHistories[job.id]?.length > 0 ? (
            <ul className="space-y-2">
              {jobHistories[job.id].map((history) => (
                <li key={history.id} className="p-2 bg-white rounded shadow">
                  <strong>Updated By:</strong> {history.updatedBy} <br />
                  <strong>Status:</strong> {history.status} <br />
                  <strong>Updated At:</strong> {new Date(history.updatedAt).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No history available.</p>
          )}
        </div>
      )}
    </li>
  );

  return (
    <div className="p-4 sm:p-6 bg-blue-50 min-h-screen">
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

      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Hello, {adminName}!</h2>

      {/* Manage Employees Section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Manage Employees</h2>
        <ul className="space-y-2">
          {employees.map((emp) => (
            <li key={emp.id} className="border p-3 rounded flex flex-col sm:flex-row justify-between items-center bg-white shadow-sm">
              <span>{emp.name} ({emp.email}) - <strong>{emp.role}</strong></span>
              <button onClick={() => handleRemoveEmployee(emp.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 mt-2 sm:mt-0">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Active Jobs Section */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Manage Jobs</h2>
        <input
          type="text"
          placeholder="Search Active Jobs by Job Number"
          className="border p-2 rounded w-full mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="mb-4">
          <label htmlFor="entriesPerPage" className="mr-2">Show:</label>
          <select
            id="entriesPerPage"
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            className="border p-2 rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </div>
        {currentActiveJobs.length > 0 ? (
          <ul className="space-y-2">
            {currentActiveJobs.map(renderJobItem)}
          </ul>
        ) : (
          <p>No active jobs found.</p>
        )}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={indexOfLastJob >= filteredJobs.length}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>

      {/* Completed Jobs Section */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Completed Jobs</h2>
        <input
          type="text"
          placeholder="Search Completed Jobs by Job Number"
          className="border p-2 rounded w-full mb-4"
          value={completedSearchQuery}
          onChange={(e) => setCompletedSearchQuery(e.target.value)}
        />
        <div className="flex justify-between items-center mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectAllCompleted}
              onChange={handleSelectAllCompleted}
              className="mr-2"
            />
            Select All
          </label>
          <button
            onClick={handleBulkDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            disabled={selectedJobs.length === 0}
          >
            Delete Selected
          </button>
        </div>
        {currentCompletedJobs.length > 0 ? (
          <ul className="space-y-2">
            {currentCompletedJobs.map(renderJobItem)}
          </ul>
        ) : (
          <p>No completed jobs found.</p>
        )}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={indexOfLastJob >= completedJobs.length}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
