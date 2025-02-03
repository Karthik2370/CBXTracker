import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [jobNumber, setJobNumber] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");  // New description state
  const [shipments, setShipments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
        description,  // Add description to Firestore
        lastUpdated: new Date().toISOString(),
      });

      alert("Shipment status updated!");
      setJobNumber("");
      setStatus("");
      setDescription("");  // Reset description field
    } catch (error) {
      console.error("Error updating shipment:", error.message);
      alert("Failed to update shipment.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Navigate to Home Page
  const goToHome = () => {
    router.push("/");  // Redirect to the main tracking page
  };

  return (
    <div className="p-6">
      {/* Taskbar */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Employee Dashboard</h1>
        <div className="flex space-x-4">
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

      {/* Update Job Status */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Update Job Status</h2>
        <input
          type="text"
          placeholder="Enter Job Number"
          className="border p-2 rounded w-full my-2"
          value={jobNumber}
          onChange={(e) => setJobNumber(e.target.value)}
        />
        <select
          className="border p-2 rounded w-full my-2"
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
          className="border p-2 rounded w-full my-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <button
          onClick={handleUpdate}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Update Status
        </button>
      </div>

      {/* Display All Shipments */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">All Shipments</h2>
        {shipments.length > 0 ? (
          <ul>
            {shipments.map((shipment) => (
              <li key={shipment.id} className="border-b py-2">
                <strong>Job:</strong> {shipment.jobNumber} - 
                <strong>Status:</strong> {shipment.status} - 
                <strong>Description:</strong> {shipment.description || "N/A"} - 
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
