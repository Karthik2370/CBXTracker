import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, doc, getDoc, deleteDoc, getDocs, updateDoc, query, where, limit } from "firebase/firestore";
import { useRouter } from "next/router";

// Define stages here, matching the structure from [jobNumber].js
const stages = [
  "Pending",
  "Initiated",
  "Port of Loading",
  "Port of Discharge",
  "In Transit",
  "Completed",
  "Delayed",
];

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
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [error, setError] = useState(null); // New error state
  const router = useRouter();

  const goToHome = () => router.push("/");

  useEffect(() => {
    let unsubscribeEmployees, unsubscribeJobs;

    const fetchAdminData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "roles", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setAdminName(docSnap.data().name || "Admin");
          }
        }
      } catch (err) {
        setError(`Error fetching admin data: ${err.message}`);
      } finally {
        setIsLoading(false); // Stop loading after fetching admin data
      }
    };

    fetchAdminData();

    // Use query for employees if real-time updates aren't critical
    const employeesQuery = query(collection(db, "roles"), limit(50)); // Limit to prevent excessive reads
    unsubscribeEmployees = onSnapshot(employeesQuery, (snapshot) => {
      try {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEmployees(data);
      } catch (err) {
        setError(`Error fetching employees: ${err.message}`);
      }
    }, (err) => setError(`Snapshot error for employees: ${err.message}`));

    // Use query for jobs with limit for performance
    const jobsQuery = query(collection(db, "jobs"), limit(100)); // Adjust limit as needed
    unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      try {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setJobs(data);
      } catch (err) {
        setError(`Error fetching jobs: ${err.message}`);
      }
    }, (err) => setError(`Snapshot error for jobs: ${err.message}`));

    return () => {
      unsubscribeEmployees?.();
      unsubscribeJobs?.();
    };
  }, []);

  const handleToggleHistory = async (jobId) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
      if (!jobHistories[jobId]) {
        try {
          const jobHistoryRef = collection(db, "jobs", jobId, "history");
          const snapshot = await getDocs(jobHistoryRef);
          const historyData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setJobHistories((prevHistories) => ({ ...prevHistories, [jobId]: historyData }));
        } catch (err) {
          setError(`Error fetching job history for job ${jobId}: ${err.message}`);
        }
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
      setError(`Error removing employee: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
      setError(`Error logging out: ${error.message}`);
    }
  };

  const handleEditJob = (job) => {
    setEditingJobId(job.id);
    setEditingJobData({ ...job });
  };

  const handleSaveJob = async () => {
    try {
      // Validate job data before saving
      if (!editingJobData.jobNumber || !editingJobData.status) {
        setError("Job number and status are required.");
        return;
      }

      // Ensure status is one of the allowed stages
      if (!stages.includes(editingJobData.status)) {
        setError("Invalid status selected. Please choose a valid stage.");
        return;
      }

      const jobRef = doc(db, "jobs", editingJobId);
      await updateDoc(jobRef, { 
        ...editingJobData, 
        lastUpdated: new Date().toISOString(),
        jobNumber: editingJobData.jobNumber, // Ensure jobNumber is preserved
      });
      alert("Job updated successfully!");
      setEditingJobId(null);
      setError(null); // Clear error after success
    } catch (error) {
      console.error("Error updating job:", error.message);
      setError(`Failed to update job: ${error.message}`);
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
        setError(`Failed to delete job: ${error.message}`);
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

  // Bulk deletion handler with confirmation
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
        setError(`Failed to delete selected jobs: ${error.message}`);
      }
    }
  };

  // Render job item with checkbox for bulk deletion and accessibility improvements
  const renderJobItem = (job) => (
    <li key={job.id} className="border p-3 rounded bg-white shadow-sm" role="listitem">
      <input
        type="checkbox"
        checked={selectedJobs.includes(job.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedJobs([...selectedJobs, job.id]);
          } else {
            setSelectedJobs(selectedJobs.filter((id) => id !== job.id));
          }
        }}
        className="mr-2"
        disabled={job.status !== "Completed"}
        aria-label={`Select job ${job.jobNumber} for bulk deletion`}
      />
      {editingJobId === job.id ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Job Number"
            value={editingJobData.jobNumber || ""}
            onChange={(e) => setEditingJobData({ ...editingJobData, jobNumber: e.target.value })}
            className="border p-2 rounded"
            readOnly // Make job number read-only since it's the document ID
            aria-label="Job number (read-only)"
          />
          <select
            value={editingJobData.status || ""}
            onChange={(e) => setEditingJobData({ ...editingJobData, status: e.target.value })}
            className="border p-2 rounded"
            required
            aria-required="true"
            aria-label="Job status"
          >
            <option value="">Select Status</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          <textarea
            placeholder="Description"
            value={editingJobData.description || ""}
            onChange={(e) => setEditingJobData({ ...editingJobData, description: e.target.value })}
            className="border p-2 rounded col-span-2"
            aria-label="Job description"
          />
          <input
            type="text"
            placeholder="Weight"
            value={editingJobData.weight || ""}
            onChange={(e) => setEditingJobData({ ...editingJobData, weight: e.target.value })}
            className="border p-2 rounded"
            aria-label="Job weight"
          />
          <input
            type="number"
            placeholder="Number of Packages"
            value={editingJobData.numPackages || ""}
            onChange={(e) => setEditingJobData({ ...editingJobData, numPackages: e.target.value })}
            className="border p-2 rounded"
            aria-label="Number of packages"
          />
          <input
            type="text"
            placeholder="PO Number"
            value={editingJobData.poNumber || ""}
            onChange={(e) => setEditingJobData({ ...editingJobData, poNumber: e.target.value })}
            className="border p-2 rounded"
            aria-label="PO number"
          />
          <input
            type="text"
            placeholder="Transit Point"
            value={editingJobData.transitPoint || ""}
            onChange={(e) => setEditingJobData({ ...editingJobData, transitPoint: e.target.value })}
            className="border p-2 rounded"
            aria-label="Transit point"
          />
          <input
            type="date"
            placeholder="Planning Date"
            value={editingJobData.planningDate || ""}
            onChange={(e) => setEditingJobData({ ...editingJobData, planningDate: e.target.value })}
            className="border p-2 rounded"
            aria-label="Planning date"
          />
          <div className="col-span-2 flex justify-end space-x-4">
            <button
              onClick={handleSaveJob}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              aria-label="Save job edits"
            >
              Save
            </button>
            <button
              onClick={() => setEditingJobId(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              aria-label="Cancel job edits"
            >
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
              aria-label={expandedJobId === job.id ? "Hide job history" : "View job history"}
            >
              {expandedJobId === job.id ? "Hide History" : "View History"}
            </button>
            <button
              onClick={() => handleEditJob(job)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              aria-label="Edit job"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteJob(job.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
              aria-label="Delete job"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {expandedJobId === job.id && (
        <div className="mt-4 p-3 border-t bg-gray-50" role="region" aria-label={`History for job ${job.jobNumber}`}>
          {jobHistories[job.id]?.length > 0 ? (
            <ul className="space-y-2">
              {jobHistories[job.id].map((history) => (
                <li key={history.id} className="p-2 bg-white rounded shadow" role="listitem">
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

  // Sorting function for jobs and employees
  const sortOptions = [
    { label: "Last Updated (Newest)", value: "lastUpdatedDesc" },
    { label: "Last Updated (Oldest)", value: "lastUpdatedAsc" },
    { label: "Job Number (A-Z)", value: "jobNumberAsc" },
    { label: "Job Number (Z-A)", value: "jobNumberDesc" },
  ];
  const [sortBy, setSortBy] = useState("lastUpdatedDesc");

  const sortedEmployees = [...employees].sort((a, b) => {
    switch (sortBy) {
      case "lastUpdatedAsc":
        return a.lastUpdated ? new Date(a.lastUpdated) - new Date(b.lastUpdated) : -1;
      case "lastUpdatedDesc":
        return b.lastUpdated ? new Date(b.lastUpdated) - new Date(a.lastUpdated) : -1;
      case "jobNumberAsc":
        return (a.jobNumber || "").localeCompare(b.jobNumber || "");
      case "jobNumberDesc":
        return (b.jobNumber || "").localeCompare(a.jobNumber || "");
      default:
        return 0;
    }
  });

  const sortedFilteredJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "lastUpdatedAsc":
        return new Date(a.lastUpdated) - new Date(b.lastUpdated);
      case "lastUpdatedDesc":
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      case "jobNumberAsc":
        return (a.jobNumber || "").localeCompare(b.jobNumber || "");
      case "jobNumberDesc":
        return (b.jobNumber || "").localeCompare(a.jobNumber || "");
      default:
        return 0;
    }
  });

  const sortedCompletedJobs = [...completedJobs].sort((a, b) => {
    switch (sortBy) {
      case "lastUpdatedAsc":
        return new Date(a.lastUpdated) - new Date(b.lastUpdated);
      case "lastUpdatedDesc":
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      case "jobNumberAsc":
        return (a.jobNumber || "").localeCompare(b.jobNumber || "");
      case "jobNumberDesc":
        return (b.jobNumber || "").localeCompare(a.jobNumber || "");
      default:
        return 0;
    }
  });

  return (
    <div className="p-4 sm:p-6 bg-blue-50 min-h-screen" role="main" aria-label="Admin Dashboard">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-8 h-8 border-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-3xl w-full mt-4">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            aria-label="Close error message"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 p-3 rounded shadow-md mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-0">Admin Dashboard</h1>
            <div className="space-y-2 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
              <button
                onClick={goToHome}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto"
                aria-label="Go to home page"
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
                aria-label="Log out"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Greeting */}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 bg-black bg-opacity-50 p-2 rounded" aria-label="Admin greeting">
            Hello, {adminName}!
          </h2>

          {/* Sorting Dropdown */}
          <div className="mb-4">
            <label htmlFor="sortBy" className="mr-2">Sort By:</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border p-2 rounded"
              aria-label="Sort options"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Manage Employees Section */}
          <div className="mt-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Manage Employees</h2>
            {sortedEmployees.length > 0 ? (
              <ul className="space-y-2">
                {sortedEmployees.map((emp) => (
                  <li
                    key={emp.id}
                    className="border p-3 rounded flex flex-col sm:flex-row justify-between items-center bg-white shadow-sm"
                    role="listitem"
                  >
                    <span>{emp.name} ({emp.email}) - <strong>{emp.role}</strong></span>
                    <button
                      onClick={() => handleRemoveEmployee(emp.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 mt-2 sm:mt-0"
                      aria-label={`Remove employee ${emp.name}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No employees found.</p>
            )}
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
              aria-label="Search active jobs"
            />
            <div className="mb-4">
              <label htmlFor="entriesPerPage" className="mr-2">Show:</label>
              <select
                id="entriesPerPage"
                value={entriesPerPage}
                onChange={handleEntriesPerPageChange}
                className="border p-2 rounded"
                aria-label="Entries per page"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            {sortedFilteredJobs.length > 0 ? (
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
                aria-label="Previous page"
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={indexOfLastJob >= sortedFilteredJobs.length}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                aria-label="Next page"
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
              aria-label="Search completed jobs"
            />
            <div className="flex justify-between items-center mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAllCompleted}
                  onChange={handleSelectAllCompleted}
                  className="mr-2"
                  aria-label="Select all completed jobs"
                />
                Select All
              </label>
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={selectedJobs.length === 0}
                aria-label="Delete selected jobs"
              >
                Delete Selected
              </button>
            </div>
            {sortedCompletedJobs.length > 0 ? (
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
                aria-label="Previous page"
              >
                Previous
              </button>
              <span>Page {currentPage}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={indexOfLastJob >= sortedCompletedJobs.length}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
