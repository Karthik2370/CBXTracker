import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, doc, getDoc, onSnapshot, setDoc, addDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [jobNumber, setJobNumber] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [numPackages, setNumPackages] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [transitPoint, setTransitPoint] = useState("");
  const [planningDate, setPlanningDate] = useState("");
  const [shipments, setShipments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [isExistingJob, setIsExistingJob] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setShipments(data);
    });

    const fetchEmployeeName = async () => {
      const user = auth.currentUser ;
      if (user) {
        const userDoc = await getDoc(doc(db, "roles", user.uid));
        if (userDoc.exists()) {
          setEmployeeName(userDoc.data().name || "Employee");
        }
      }
    };

    fetchEmployeeName();

    return () => unsubscribe();
  }, []);

  const handleJobNumberChange = async (e) => {
    const inputJobNumber = e.target.value;
    setJobNumber(inputJobNumber);

    if (inputJobNumber.trim()) {
      const jobRef = doc(db, "jobs", inputJobNumber);
      const jobDoc = await getDoc(jobRef);

      if (jobDoc.exists()) {
        const jobData = jobDoc.data();
        setIsExistingJob(true);
        setStatus(jobData.status || "");
        setDescription(jobData.description || "");
        setWeight(jobData.weight || "");
        setNumPackages(jobData.numPackages || "");
        setPoNumber(jobData.poNumber || "");
        setTransitPoint(jobData.transitPoint || "");
        setPlanningDate(jobData.planningDate || "");
      } else {
        setIsExistingJob(false);
        resetFormFields();
        setJobNumber(inputJobNumber);
      }
    }
  };

  const handleUpdate = async () => {
    if (!jobNumber || !status) {
      alert("Please fill in Job Number and Status.");
      return;
    }

    const user = auth.currentUser ;
    const jobRef = doc(db, "jobs", jobNumber);
    const historyRef = collection(jobRef, "history");

    try {
      const updateData = isExistingJob
        ? {
            status,
            description,
            planningDate,
            lastUpdated: new Date().toISOString(),
          }
        : {
            jobNumber,
            status,
            description,
            weight,
            numPackages,
            poNumber,
            transitPoint,
            planningDate,
            lastUpdated: new Date().toISOString(),
          };

      await setDoc(jobRef, updateData, { merge: true });

      await addDoc(historyRef, {
        updatedBy: employeeName,
        updatedAt: new Date().toISOString(),
        status,
        description,
        planningDate,
      });

      alert("Shipment status updated!");
      resetFormFields();
    } catch (error) {
      console.error("Error updating shipment:", error.message);
      alert("Failed to update shipment.");
    }
  };

  const resetFormFields = () => {
    setStatus("");
    setDescription("");
    setWeight("");
    setNumPackages("");
    setPoNumber("");
    setTransitPoint("");
    setPlanningDate("");
    setIsExistingJob(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const goToHome = () => {
    router.push("/");
  };

  const filteredShipments = shipments.filter((shipment) =>
    (shipment.jobNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort shipments by lastUpdated in descending order
  const sortedShipments = filteredShipments.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

  // Pagination Logic
  const indexOfLastShipment = currentPage * entriesPerPage;
  const indexOfFirstShipment = indexOfLastShipment - entriesPerPage;
  const currentShipments = sortedShipments.slice(indexOfFirstShipment, indexOfLastShipment);

  return (
    <div className="p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4 bg-gray-800 p-4 rounded shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Employee Dashboard</h1>
        <div className="flex space-x-4">
          <button onClick={goToHome} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Home
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>

      {/* Greeting */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Hello, {employeeName}!</h2>

      {/* Update Job Status Form */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Update Job Status</h2>
        <input
          type="text"
          placeholder="Enter Job Number"
          className="border p-2 rounded w-full mb-4"
          value={jobNumber}
          onChange={handleJobNumberChange}
        />
        <select className="border p-2 rounded w-full mb-4" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Select Status</option>
          <option value="Pending">Pending</option>
          <option value="Initiated">Initiated</option>
          <option value="Port of Loading">Port of Loading</option>
          <option value="Port of Discharge">Port of Discharge</option>
          <option value="In Transit">In Transit</option>
          <option value="Delayed">Delayed</option>
          <option value="Completed">Completed</option>
        </select>
        <textarea
          placeholder="Enter Description"
          className="border p-2 rounded w-full mb-4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <input
          type="text"
          placeholder="Enter Weight"
          className="border p-2 rounded w-full mb-4"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          readOnly={isExistingJob}
        />
        <input
          type="number"
          placeholder="Enter Number of Packages"
          className="border p-2 rounded w-full mb-4"
          value={numPackages}
          onChange={(e) => setNumPackages(e.target.value)}
          readOnly={isExistingJob}
        />
        <input
          type="text"
          placeholder="Enter PO Number"
          className="border p-2 rounded w-full mb-4"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          readOnly={isExistingJob}
        />
        <input
          type="text"
          placeholder="Enter Transit Point"
          className="border p-2 rounded w-full mb-4"
          value={transitPoint}
          onChange={(e) => setTransitPoint(e.target.value)}
          readOnly={isExistingJob}
        />
        
        {/* Planning Date with Label */}
        <label className="block text-gray-700 font-medium mb-1">Select Planning Date</label>
        <input
          type="date"
          className="border p-2 rounded w-full mb-4"
          value={planningDate}
          onChange={(e) => setPlanningDate(e.target.value)}
        />

        <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
          Update Status
        </button>
      </div>

      {/* Divider */}
      <div className="my-8 border-t-2 border-gray-300"></div>

      {/* Search Shipments Section */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Search Shipments</h2>
        <input
          type="text"
          placeholder="Search by Job Number"
          className="border p-2 rounded w-full mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Display All Shipments */}
      <div className="mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">All Shipments</h2>
        {currentShipments.length > 0 ? (
          <ul className="space-y-2">
            {currentShipments.map((shipment) => (
              <li key={shipment.id} className="border p-3 rounded bg-gray-50">
                <strong>Job:</strong> {shipment.jobNumber} <br />
                <strong>Status:</strong> {shipment.status} <br />
                <strong>Description:</strong> {shipment.description || "N/A"} <br />
                <strong>Weight:</strong> {shipment.weight || "N/A"} <br />
                <strong>No. of Packages:</strong> {shipment.numPackages || "N/A"} <br />
                <strong>PO Number:</strong> {shipment.poNumber || "N/A"} <br />
                <strong>Transit Point:</strong> {shipment.transitPoint || "N/A"} <br />
                <strong>Planning Date:</strong> {shipment.planningDate || "N/A"} <br />
                <strong>Last Updated:</strong> {new Date(shipment.lastUpdated).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No shipments found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastShipment >= sortedShipments.length}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
