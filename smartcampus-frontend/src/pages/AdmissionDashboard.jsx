import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  PlusCircle, 
  Upload, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  DollarSign, 
  FileSpreadsheet,
  Users,
  Search
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const AdmissionDashboard = () => {
  const [activeSection, setActiveSection] = useState("batches"); // "batches", "fees", "students"
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [feeFilter, setFeeFilter] = useState("all"); // "all", "Paid", "Pending"

  // Batch Form State
  const [batchForm, setBatchForm] = useState({
    academic_year: "2024-2025",
    department: "Computer Science",
    year_code: "FE",
    section: "A"
  });

  // Bulk Upload File
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");

  // Fee Update State
  const [feeModal, setFeeModal] = useState(null);
  const [feeUpdateForm, setFeeUpdateForm] = useState({ paid_amount: 50000, status: "Paid" });

  // Status Feedback
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : null;

  useEffect(() => {
    fetchBatches();
    fetchStudents();
    fetchFees();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/batches/all`, authConfig);
      setBatches(res.data || []);
    } catch (err) {
      console.warn("Error fetching batches", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/students/all`, authConfig);
      setStudents(res.data || []);
    } catch (err) {
      console.warn("Error fetching students", err);
    }
  };

  const fetchFees = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fees/all`, authConfig);
      setFees(res.data || []);
    } catch (err) {
      console.warn("Error fetching fees", err);
    }
  };

  // Create Year-Wise Academic Batch
  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/batches/create`, batchForm, authConfig);
      setStatusMsg(`Success: Created batch ${res.data.batch.batch_name}`);
      fetchBatches();
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  // Bulk Upload Excel / PDF / CSV File with Automatic DB Ingestion
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await executeAutoUpload(file);
    }
  };

  const executeAutoUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) {
      alert("Please select a spreadsheet or PDF student record file first.");
      return;
    }

    setLoading(true);
    setStatusMsg(`⚡ Auto-Ingesting file '${file.name}' into database...`);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("batch_id", selectedBatchId);
    formData.append("academic_year", batchForm.academic_year);
    formData.append("year_code", batchForm.year_code);
    formData.append("department", batchForm.department);

    try {
      const res = await axios.post(`${API_BASE}/batches/upload-students`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setStatusMsg(`✨ Database Auto-Updated! Successfully ingested ${res.data.total_processed} student records directly into database.`);
      fetchStudents();
      fetchBatches();
      setSelectedFile(null);
      setTimeout(() => setStatusMsg(""), 5000);
    } catch (err) {
      alert(err.response?.data?.message || "Error processing student batch upload");
      setStatusMsg("Upload error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    await executeAutoUpload();
  };

  // Trigger Annual July 10th Promotion Engine
  const handleTriggerPromotion = async () => {
    if (!window.confirm("Run July 10th Annual Batch Promotion? (FE -> SE -> TE -> BE)")) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/batches/promote-now`, {}, authConfig);
      setStatusMsg(`Annual Promotion Complete! Promoted: ${res.data.result.promoted_students}, Graduated: ${res.data.result.graduated_students}`);
      fetchStudents();
      fetchBatches();
    } catch (err) {
      alert("Error triggering promotion engine");
    } finally {
      setLoading(false);
    }
  };

  // Set / Update Fee Dues for Student
  const handleUpdateFee = async (e) => {
    e.preventDefault();
    if (!feeModal) return;

    try {
      await axios.post(`${API_BASE}/fees/set-fee-dues`, {
        student_id: feeModal.student_id,
        total_amount: 50000,
        paid_amount: Number(feeUpdateForm.paid_amount),
        status: feeUpdateForm.status
      }, authConfig);

      setStatusMsg("Tuition fee record updated successfully!");
      fetchFees();
      setFeeModal(null);
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      alert("Failed to update fee record");
    }
  };

  // Filtered Students for Fee Section
  const filteredStudents = students.filter((s) => {
    const feeRec = fees.find(f => (f.student_id?._id === s._id || f.student_id === s._id));
    const status = feeRec ? feeRec.status : "Pending";
    const matchesFilter = feeFilter === "all" || status === feeFilter;
    const matchesSearch = searchQuery === "" || 
      `${s.first_name} ${s.surname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.admission_no && s.admission_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.pnr_no && s.pnr_no.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  // Calculate Fee Statistics
  const totalStudentsCount = students.length;
  const paidCount = students.filter(s => {
    const f = fees.find(fee => fee.student_id?._id === s._id || fee.student_id === s._id);
    return f && f.status === "Paid";
  }).length;
  const defaulterCount = totalStudentsCount - paidCount;
  const totalCollected = fees.reduce((acc, f) => acc + (f.paid_amount || 0), 0);
  const totalPending = (totalStudentsCount * 50000) - totalCollected;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                Admission Administration
              </span>
              <span className="text-xs text-slate-400">Academic Year 2024–2025</span>
            </div>
            <h1 className="text-3xl font-bold text-white mt-1">Batch Creation & Fee Status Portal</h1>
            <p className="text-slate-400 text-xs mt-1">Manage year-wise batches (FE/SE/TE/BE), bulk Excel student ingestion, annual July 10th promotions, and tuition fee clearance.</p>
          </div>

          <button
            onClick={handleTriggerPromotion}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition border border-indigo-400/30"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Run July 10th Promotion Engine
          </button>
        </div>

        {statusMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {statusMsg}
          </div>
        )}

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Active Batches</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{batches.length}</div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="text-indigo-400 font-bold">FE &bull; SE &bull; TE &bull; BE</span> Divisions
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Enrolled Students</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{students.length}</div>
            <p className="text-[11px] text-slate-400">Total institutional enrollment</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Tuition Fee Cleared</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{paidCount} <span className="text-xs text-slate-400 font-normal">/ {students.length}</span></div>
            <p className="text-[11px] text-emerald-400 font-semibold">₹{totalCollected.toLocaleString()} Collected</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
              <span>Fee Defaulters</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-extrabold text-rose-400">{defaulterCount}</div>
            <p className="text-[11px] text-rose-400 font-semibold">₹{totalPending.toLocaleString()} Pending Dues</p>
          </div>

        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection("batches")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === "batches" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" /> Academic Batches & Ingestion
          </button>

          <button
            onClick={() => setActiveSection("fees")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === "fees" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-4 h-4" /> Tuition Fee & Defaulter Status
          </button>

          <button
            onClick={() => setActiveSection("students")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeSection === "students" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" /> Student Catalog ({students.length})
          </button>
        </div>

        {/* Section 1: Academic Batches & Bulk Student Ingestion */}
        {activeSection === "batches" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Create Batch Form */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-400" /> Create Academic Year Batch
                </h3>
                <span className="text-[11px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">Annual FE &rarr; SE Engine</span>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Academic Year</label>
                  <select
                    value={batchForm.academic_year}
                    onChange={(e) => setBatchForm({ ...batchForm, academic_year: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Department</label>
                  <select
                    value={batchForm.department}
                    onChange={(e) => setBatchForm({ ...batchForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Telecom">Electronics & Telecom</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold font-bold text-indigo-300">Engineering Year Stage</label>
                    <select
                      value={batchForm.year_code}
                      onChange={(e) => setBatchForm({ ...batchForm, year_code: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-300"
                    >
                      <option value="FE">F.E. (First Year Engineering)</option>
                      <option value="SE">S.E. (Second Year Engineering)</option>
                      <option value="TE">T.E. (Third Year Engineering)</option>
                      <option value="BE">B.E. (Final Year Engineering)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Section / Division</label>
                    <input
                      type="text"
                      value={batchForm.section}
                      onChange={(e) => setBatchForm({ ...batchForm, section: e.target.value })}
                      placeholder="A"
                      className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-3 rounded-xl transition text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" /> Create Academic Year Batch
                </button>
              </form>
            </div>

            {/* Bulk Upload Spreadsheet */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" /> Bulk Student Spreadsheet Ingestion (.xlsx)
              </h3>

              <form onSubmit={handleBulkUpload} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Target Batch (Optional)</label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Auto-create batch from spreadsheet metadata</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.batch_name} ({b.academic_year})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Select Excel / PDF Student File (Auto-Uploads Instantly)</label>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .pdf, .csv"
                    onChange={handleFileChange}
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">⚡ Instant Ingestion: Database auto-updates as soon as file is selected!</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-xl transition text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" /> {loading ? "Ingesting Database..." : "Auto-Ingest Student Batch"}
                </button>
              </form>
            </div>

            {/* Active Batches Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>Active Institutional Batches ({batches.length})</span>
                <span className="text-xs text-indigo-400 font-normal">Auto-Promotes Annually on July 10th</span>
              </h3>

              {batches.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No academic year batches created yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Batch Name</th>
                        <th className="p-3">Academic Year</th>
                        <th className="p-3">Stage</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Section</th>
                        <th className="p-3">Students</th>
                        <th className="p-3">Auto-Promotion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {batches.map((b) => (
                        <tr key={b._id} className="hover:bg-slate-850/50 transition">
                          <td className="p-3 font-bold text-white">{b.batch_name}</td>
                          <td className="p-3">{b.academic_year}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[11px]">
                              {b.year_code}
                            </span>
                          </td>
                          <td className="p-3">{b.department}</td>
                          <td className="p-3 font-semibold text-slate-300">{b.section || "A"}</td>
                          <td className="p-3 font-bold text-emerald-400">{b.student_count || 0}</td>
                          <td className="p-3 text-slate-400">
                            {b.last_promoted ? (
                              <span className="text-emerald-400 font-semibold">Promoted ({new Date(b.last_promoted).toLocaleDateString()})</span>
                            ) : (
                              <span className="text-indigo-400 font-semibold">Scheduled July 10th</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Section 2: Fee Status & Defaulters */}
        {activeSection === "fees" && (
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" /> Student Tuition Fee Status & Defaulters
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Standard Institutional Annual Fee: <span className="text-emerald-400 font-bold">₹50,000</span> per student.</p>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, ADM, PNR..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 pl-9 pr-3 py-1.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setFeeFilter("all")}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      feeFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({students.length})
                  </button>
                  <button
                    onClick={() => setFeeFilter("Paid")}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      feeFilter === "Paid" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Paid ({paidCount})
                  </button>
                  <button
                    onClick={() => setFeeFilter("Pending")}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      feeFilter === "Pending" ? "bg-rose-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Defaulters ({defaulterCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Students Fee Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Admission No</th>
                    <th className="p-3">Stage & Dept</th>
                    <th className="p-3">Total Fee</th>
                    <th className="p-3">Paid Amount</th>
                    <th className="p-3">Pending Dues</th>
                    <th className="p-3">Fee Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-slate-400 text-xs">
                        No student fee records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const feeRec = fees.find(f => (f.student_id?._id === s._id || f.student_id === s._id));
                      const status = feeRec ? feeRec.status : "Pending";
                      const paid = feeRec ? feeRec.paid_amount : 0;
                      const pending = feeRec ? feeRec.pending_amount : 50000;

                      return (
                        <tr key={s._id} className="hover:bg-slate-850/50 transition">
                          <td className="p-3 font-bold text-white">
                            {s.first_name} {s.surname}
                          </td>
                          <td className="p-3 font-mono text-slate-400">{s.admission_no}</td>
                          <td className="p-3">
                            <span className="text-indigo-400 font-bold">{s.year_code || "FE"}</span> &bull; <span className="text-slate-300">{s.department || "Computer Science"}</span>
                          </td>
                          <td className="p-3 font-semibold text-slate-300">₹50,000</td>
                          <td className="p-3 text-emerald-400 font-bold">₹{paid.toLocaleString()}</td>
                          <td className="p-3 text-rose-400 font-bold">₹{pending.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              status === "Paid" 
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            }`}>
                              {status === "Paid" ? "Paid (Cleared)" : "Defaulter (Pending)"}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => {
                                setFeeModal({ student_id: s._id, name: `${s.first_name} ${s.surname}` });
                                setFeeUpdateForm({ paid_amount: paid, status: status });
                              }}
                              className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 text-[11px]"
                            >
                              Update Fee
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: Student Catalog */}
        {activeSection === "students" && (
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Enrolled Student Roster ({students.length})</span>
              <span className="text-xs text-slate-400 font-normal">Click any card to inspect full Dossier</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {students.map((s) => (
                <div key={s._id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 hover:border-indigo-500/40 transition">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-base">{s.first_name} {s.surname}</h4>
                    <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md font-bold text-[10px]">
                      {s.year_code || "FE"}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-400 text-xs">
                    <p>Admission No: <span className="text-slate-200 font-semibold">{s.admission_no}</span></p>
                    <p>PNR: <span className="text-slate-200 font-semibold">{s.pnr_no || "N/A"}</span></p>
                    <p>Department: <span className="text-slate-200 font-semibold">{s.department || "Computer Science"}</span></p>
                    <p>Parents Contact: <span className="text-slate-200 font-semibold">{s.parent_phone || "N/A"}</span></p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center">
                    <span className="text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {s.status || "active"}
                    </span>
                    <a href={`/student-profile/${s._id}`} className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 text-xs">
                      View AI Dossier &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Update Fee Modal */}
      {feeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Update Tuition Fee Status</h3>
              <p className="text-xs text-slate-400">Student: <span className="text-indigo-300 font-semibold">{feeModal.name}</span></p>
            </div>

            <form onSubmit={handleUpdateFee} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={feeUpdateForm.paid_amount}
                  onChange={(e) => setFeeUpdateForm({ ...feeUpdateForm, paid_amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-emerald-400 text-sm"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">Total Fee: ₹50,000 | Pending: ₹{Math.max(0, 50000 - Number(feeUpdateForm.paid_amount)).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Fee Payment Clearance Status</label>
                <select
                  value={feeUpdateForm.status}
                  onChange={(e) => setFeeUpdateForm({ ...feeUpdateForm, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="Paid">Paid (Fully Cleared)</option>
                  <option value="Pending">Pending (Defaulter / Partial)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setFeeModal(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  Save Fee Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionDashboard;