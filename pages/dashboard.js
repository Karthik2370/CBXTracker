import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [jobNumber, setJobNumber] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [shipments, setShipments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setShipments(data);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    if (!jobNumber || !status) {
      alert("Please fill in Job Number, Status, and Description.");
      return;
    }

    try {
      const jobRef = doc(db, "jobs", jobNumber);
      await setDoc(jobRef, {
        jobNumber,
        status,
        description,
        lastUpdated: new Date().toISOString(),
      });

      alert("Shipment status updated!");
      setJobNumber("");
      setStatus("");
      setDescription("");
    } catch (error) {
      console.error("Error updating shipment:", error.message);
      alert("Failed to update shipment.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const goToHome = () => {
    router.push("/");
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Taskbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 sm:mb-0">Employee Dashboard</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button onClick={goToHome} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto">
            Home
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto">
            Logout
          </button>
        </div>
      </div>

      {/* Update Job Status */}
      <div className="mt-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Update Job Status</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter Job Number"
            className="border p-2 rounded w-full"
            value={jobNumber}
            onChange={(e) => setJobNumber(e.target.value)}
          />
          <select
            className="border p-2 rounded w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
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
            className="border p-2 rounded w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <button onClick={handleUpdate} className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
            Update Status
          </button>
        </div>
      </div>

      {/* Display All Shipments */}
      <div className="mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">All Shipments</h2>
        {shipments.length > 0 ? (
          <ul className="space-y-2">
            {shipments.map((shipment) => (
              <li key={shipment.id} className="border p-3 rounded">
                <strong>Job:</strong> {shipment.jobNumber} <br />
                <strong>Status:</strong> {shipment.status} <br />
                <strong>Description:</strong> {shipment.description || "N/A"} <br />
                <strong>Last Updated:</strong> {new Date(shipment.lastUpdated).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No shipments found.</p>
        )}
      </div>
    </div>
  );
}
