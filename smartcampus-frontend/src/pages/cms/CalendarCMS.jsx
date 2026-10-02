import { useState } from "react";
import API from "../../services/api";

const CalendarCMS = () => {
  const [academicFile, setAcademicFile] = useState(null);
  const [regularFile, setRegularFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUploadAndSync = async () => {
    if (!academicFile || !regularFile) {
      alert("Please stage BOTH files (Academic PDF and Regular Calendar) to perform a master sync.");
      return;
    }

    try {
      setUploading(true);

      // Create separate multipart payloads to post both structural sources to the API
      const academicData = new FormData();
      academicData.append("file", academicFile);
      academicData.append("calendar_type", "academic");

      const regularData = new FormData();
      regularData.append("file", regularFile);
      regularData.append("calendar_type", "regular");

      // Post both requests simultaneously to compile a synced timeline
      const [academicRes, regularRes] = await Promise.all([
        API.post("/calendar/upload", academicData, { headers: { "Content-Type": "multipart/form-data" } }),
        API.post("/calendar/upload", regularData, { headers: { "Content-Type": "multipart/form-data" } })
      ]);

      if (academicRes.data?.success && regularRes.data?.success) {
        alert("Both files successfully processed, synchronized, and mapped into the Master Calendar!");
        // Clear all states
        setAcademicFile(null);
        setRegularFile(null);
        document.getElementById("academic-input").value = "";
        document.getElementById("regular-input").value = "";
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Network Sync Error";
      alert(`Sync failed: ${errMsg}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-xl w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Master Calendar Sync</h1>
        <p className="text-slate-500 mb-6 text-sm">
          Stage both required templates below. The engine will merge dates, festivals, and university terms.
        </p>

        {/* File Slot 1: Academic Schedule */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
            1. Mumbai University Academic Term PDF
          </label>
          <input
            id="academic-input"
            type="file"
            accept=".pdf"
            onChange={(e) => setAcademicFile(e.target.files[0])}
            disabled={uploading}
            className="w-full border p-3 rounded-xl text-slate-900 bg-slate-50 text-sm"
          />
          {academicFile && <p className="text-green-600 text-xs mt-1">✓ Academic PDF Staged</p>}
        </div>

        {/* File Slot 2: Regular Calendar / Holidays */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
            2. Regular Holiday / Reference Document
          </label>
          <input
            id="regular-input"
            type="file"
            accept=".pdf,.xlsx,.xls"
            onChange={(e) => setRegularFile(e.target.files[0])}
            disabled={uploading}
            className="w-full border p-3 rounded-xl text-slate-900 bg-slate-50 text-sm"
          />
          {regularFile && <p className="text-green-600 text-xs mt-1">✓ Reference Calendar Staged</p>}
        </div>

        {/* Master Action Button */}
        <button
          onClick={handleUploadAndSync}
          disabled={uploading}
          className={`w-full text-white font-medium px-6 py-4 rounded-xl transition ${
            !academicFile || !regularFile 
              ? "bg-slate-300 cursor-not-allowed text-slate-500" 
              : uploading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
          }`}
        >
          {uploading ? "Processing & Syncing Timelines..." : "Upload & Sync Master Calendar"}
        </button>
      </div>
    </div>
  );
};

export default CalendarCMS;