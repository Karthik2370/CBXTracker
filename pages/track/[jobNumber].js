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
    "Completed",  // Removed "Delayed" from the main stages
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

  return (
    <div className="flex flex-col items-center p-6 min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-primary mb-4">Track Your Shipment</h1>

      {jobData ? (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Job Number: <span className="text-primary">{jobNumber}</span>
            </h2>
            <span className={`px-4 py-2 rounded ${jobData.status === 'Delayed' ? 'bg-red-400' : getStatusColor(jobData.status)}`}>
              {jobData.status}
            </span>
          </div>

          {/* Shipment Progress */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Shipment Progress</h3>

            <div className="relative flex items-center">
              {/* Line Background */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 transform -translate-y-1/2 z-0"></div>

              {/* Stages */}
              {stages.map((stage, index) => (
                <div key={index} className="flex-1 flex flex-col items-center relative z-10">
                  {/* Circle */}
                  <div className={`w-6 h-6 rounded-full ${getStatusColor(stage)}`}></div>

                  {/* Label */}
                  <span className={`text-sm mt-2 text-center ${getLabelColor(stage)}`}>
                    {stage}
                  </span>

                  {/* Fill Line */}
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
            <h3 className="text-lg font-medium mb-2">Shipment Description</h3>
            <p className="text-gray-700">{jobData.description || "No description provided."}</p>
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
