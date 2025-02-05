import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";

export default function JobTracking() {
  const router = useRouter();
  const { jobNumber } = router.query;
  const [jobData, setJobData] = useState(null);

  const stages = [
    "Pending",
    "Initiated",
    "Port of Loading",
    "Port of Discharge",
    "In Transit",
    "Completed",
  ];

  useEffect(() => {
    if (jobNumber) {
      fetchJobData(jobNumber);
    }
  }, [jobNumber]);

  const fetchJobData = async (jobNumber) => {
    try {
      const jobRef = doc(db, "jobs", jobNumber);
      const jobDoc = await getDoc(jobRef);

      if (jobDoc.exists()) {
        setJobData(jobDoc.data());
      } else {
        setJobData({ status: "Not Found" });
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
    }
  };

  const getStatusColor = (stage) => {
    const stageIndex = stages.indexOf(stage);
    const currentStageIndex = stages.indexOf(jobData?.status);

    if (stageIndex < currentStageIndex) return "bg-green-400";
    if (stageIndex === currentStageIndex) return "bg-blue-400";
    return "bg-gray-300";
  };

  const getLabelColor = (stage) => {
    const stageIndex = stages.indexOf(stage);
    const currentStageIndex = stages.indexOf(jobData?.status);

    if (stageIndex === currentStageIndex) return "text-blue-500 font-bold";
    if (stageIndex < currentStageIndex) return "text-green-500";
    return "text-gray-500";
  };

  const goToHome = () => {
    router.push("/");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 min-h-screen bg-gray-100">
      {/* Home Button */}
      <div className="w-full flex justify-between mb-4 print:hidden">
        <button
          onClick={goToHome}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Home
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Print
        </button>
      </div>

      {/* Header with Logo */}
      <div className="flex items-center justify-center mb-4">
        <img src="/logo.png" alt="CBX Logistics Logo" className="h-12 w-auto mr-2" />
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">CBX Logistics</h1>
      </div>

      {/* Remove "Track Your Shipment" only during print */}
      <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4 print:hidden">
        Track Your Shipment
      </h2>

      {jobData ? (
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full max-w-3xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-0">
              Job Number: <span className="text-primary">{jobNumber}</span>
            </h3>
            <span
              className={`px-4 py-2 rounded ${
                jobData.status === "Delayed"
                  ? "bg-red-400"
                  : getStatusColor(jobData.status)
              }`}
            >
              {jobData.status}
            </span>
          </div>

          {/* Shipment Progress */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium mb-4">Shipment Progress</h4>
            <div className="relative flex items-center overflow-x-auto sm:overflow-visible">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 transform -translate-y-1/2 z-0"></div>
              {stages.map((stage, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center relative z-10 min-w-[70px]"
                >
                  <div className={`w-6 h-6 rounded-full ${getStatusColor(stage)}`}></div>
                  <span className={`text-xs sm:text-sm mt-2 text-center ${getLabelColor(stage)}`}>
                    {stage}
                  </span>
                  {index < stages.length - 1 && (
                    <div
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-1 w-full ${
                        stages.indexOf(jobData.status) > index ? "bg-green-400" : "bg-transparent"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delayed Indicator */}
          {jobData.status === "Delayed" && (
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-red-500"></div>
                <span className="text-red-500 font-bold">Delayed</span>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-2">Shipment Description</h4>
            <p className="text-gray-700">
              {jobData.description || "No description provided."}
            </p>
          </div>

          {/* Transit Point & Planning Date */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-lg font-medium">Transit Point:</h4>
              <p className="text-gray-700">{jobData.transitPoint || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-lg font-medium">Planning Date:</h4>
              <p className="text-gray-700">
                {jobData.planningDate ? new Date(jobData.planningDate).toLocaleDateString() : "Not specified"}
              </p>
            </div>
          </div>

          {/* Cargo Details */}
          <div className="mt-6">
            <h4 className="text-lg font-medium mb-2">Cargo Details:</h4>
            <ul className="list-disc list-inside text-gray-700">
              <li>Weight: {jobData.weight || "N/A"}</li>
              <li>Number of Packages: {jobData.numPackages || "N/A"}</li>
              <li>PO Number: {jobData.poNumber || "N/A"}</li>
            </ul>
          </div>

          {/* Last Updated */}
          {jobData.lastUpdated && (
            <p className="text-sm text-gray-600 mt-4">
              Last Updated: <strong>{new Date(jobData.lastUpdated).toLocaleString()}</strong>
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">Loading shipment details...</p>
      )}
    </div>
  );
}
