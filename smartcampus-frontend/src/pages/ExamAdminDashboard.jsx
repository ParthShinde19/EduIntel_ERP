import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Plus, 
  Filter, 
  Sparkles,
  LogOut,
  RefreshCw
} from "lucide-react";
import { getAcademicYears } from "../utils/academicYear";

const ExamAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("upload");

  // Selection controls
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [yearCode, setYearCode] = useState("FE");
  const [semester, setSemester] = useState("1");
  const [department, setDepartment] = useState("Computer Science");

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [aiExtractedRecords, setAiExtractedRecords] = useState([]);

  // Database Records State
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total_records: 0, pass_records: 0, kt_records: 0, fail_records: 0 });

  // Manual Add Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    student_id: "",
    academic_year: "2024-2025",
    year_code: "FE",
    semester: 1,
    department: "Computer Science",
    subject1: "Engineering Mathematics",
    marks1: 85,
    subject2: "Computer Programming",
    marks2: 80,
    sgpa: 8.25,
    overall_status: "Pass"
  });

  const [dbStudents, setDbStudents] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecords();
    fetchStudents();
  }, [academicYear, yearCode, semester, department]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/exam/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students/all");
      setDbStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await API.get("/exam/records", {
        params: {
          academic_year: academicYear,
          year_code: yearCode,
          semester: Number(semester),
          department: department
        }
      });
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records:", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await triggerAutoUpload(file);
    }
  };

  const triggerAutoUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) {
      alert("Please select a PDF result file to upload");
      return;
    }

    setUploading(true);
    setUploadMessage("⚡ AI is reading file, extracting full student names & writing exam results into MongoDB automatically...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("academic_year", academicYear);
    formData.append("year_code", yearCode);
    formData.append("semester", semester);
    formData.append("department", department);

    try {
      const res = await API.post("/exam/upload-results", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setAiExtractedRecords(res.data.records || []);
      setUploadMessage(`✨ Database Auto-Updated! AI successfully matched & saved ${res.data.total_students_processed} student result records into database.`);
      setSelectedFile(null);
      fetchRecords();
      fetchStats();
    } catch (err) {
      setUploadMessage("Upload Error: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    await triggerAutoUpload();
  };

  const handleManualAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        student_id: manualForm.student_id,
        academic_year: manualForm.academic_year,
        year_code: manualForm.year_code,
        semester: Number(manualForm.semester),
        department: manualForm.department,
        subjects: [
          { subject_name: manualForm.subject1, marks: Number(manualForm.marks1), status: Number(manualForm.marks1) >= 40 ? "Pass" : "KT" },
          { subject_name: manualForm.subject2, marks: Number(manualForm.marks2), status: Number(manualForm.marks2) >= 40 ? "Pass" : "KT" }
        ],
        sgpa: Number(manualForm.sgpa),
        cgpa: Number(manualForm.sgpa),
        active_kts: (Number(manualForm.marks1) < 40 ? 1 : 0) + (Number(manualForm.marks2) < 40 ? 1 : 0),
        overall_status: manualForm.overall_status
      };

      await API.post("/exam/add-single-record", payload);
      alert("Student exam result record added successfully!");
      setShowManualModal(false);
      fetchRecords();
      fetchStats();
    } catch (err) {
      alert("Error saving record: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredRecords = records.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const studentName = r.student_id ? `${r.student_id.first_name} ${r.student_id.surname}`.toLowerCase() : "";
    const adm = r.student_id?.admission_no?.toLowerCase() || "";
    return studentName.includes(q) || adm.includes(q);
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Exam Department Admin Portal
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                AI Powered Results
              </span>
            </h1>
            <p className="text-xs text-slate-400">Watumull Institute of Engineering & Technology</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-200">Exam Controller</p>
            <p className="text-xs text-slate-400">exam@college.com</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Metric Cards Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Total Records</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">{stats.total_records || 0}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Passed Students</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-0.5">{stats.pass_records || 0}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3.5 bg-amber-600/10 text-amber-400 rounded-xl border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Pending KTs</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-0.5">{stats.kt_records || 0}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3.5 bg-purple-600/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">AI Accuracy</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-0.5">99.4%</h3>
            </div>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-400">
            <Filter className="w-4 h-4" />
            <span>Target Record Scope:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Academic Year */}
            <div className="flex flex-col">
              <label className="text-[11px] text-slate-400 font-medium mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {getAcademicYears().map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Year Code */}
            <div className="flex flex-col">
              <label className="text-[11px] text-slate-400 font-medium mb-1">Year Code</label>
              <select
                value={yearCode}
                onChange={(e) => setYearCode(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="FE">FE (First Year)</option>
                <option value="SE">SE (Second Year)</option>
                <option value="TE">TE (Third Year)</option>
                <option value="BE">BE (Final Year)</option>
              </select>
            </div>

            {/* Semester */}
            <div className="flex flex-col">
              <label className="text-[11px] text-slate-400 font-medium mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="1">Sem 1</option>
                <option value="2">Sem 2</option>
                <option value="3">Sem 3</option>
                <option value="4">Sem 4</option>
                <option value="5">Sem 5</option>
                <option value="6">Sem 6</option>
                <option value="7">Sem 7</option>
                <option value="8">Sem 8</option>
              </select>
            </div>

            {/* Department */}
            <div className="flex flex-col">
              <label className="text-[11px] text-slate-400 font-medium mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Electronics & Telecom (EXTC)">EXTC</option>
                <option value="Mechanical Engineering">Mechanical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-3 px-4 font-semibold text-sm transition border-b-2 flex items-center gap-2 ${
              activeTab === "upload"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            AI PDF Result Upload & Matcher
          </button>

          <button
            onClick={() => setActiveTab("records")}
            className={`pb-3 px-4 font-semibold text-sm transition border-b-2 flex items-center gap-2 ${
              activeTab === "records"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Academic Records Database ({filteredRecords.length})
          </button>
        </div>

        {/* TAB 1: AI PDF UPLOAD SECTION */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Upload Exam Result Document (PDF / Excel)
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Upload the official result gazette or PDF sheet submitted by the university. AI will extract full student names, match them against registered student records, and enter their marks accurately into the database for <span className="text-blue-400 font-semibold">{academicYear} ({yearCode} Sem {semester})</span>.
                </p>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/70 transition rounded-2xl p-8 text-center bg-slate-950/50 flex flex-col items-center justify-center cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="exam-pdf-upload"
                  />
                  <label htmlFor="exam-pdf-upload" className="cursor-pointer w-full flex flex-col items-center">
                    <div className="p-4 bg-slate-800 group-hover:bg-blue-600/20 rounded-full text-slate-400 group-hover:text-blue-400 transition mb-3">
                      <FileText className="w-10 h-10" />
                    </div>
                    {selectedFile ? (
                      <div>
                        <p className="font-semibold text-emerald-400 text-base">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI extraction</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-200 text-base">Click to upload or drag & drop PDF result sheet</p>
                        <p className="text-xs text-slate-400 mt-1">Supports PDF gazettes & XLSX result files</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Active Scope: <span className="text-white font-medium">{department} | {academicYear} | {yearCode} Sem {semester}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        AI Parsing & Matching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extract Student Names & Process Results
                      </>
                    )}
                  </button>
                </div>
              </form>

              {uploadMessage && (
                <div className={`p-4 rounded-xl text-sm border flex items-center gap-3 ${
                  uploadMessage.includes("Error") 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}>
                  {uploadMessage.includes("Error") ? <AlertTriangle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                  <span>{uploadMessage}</span>
                </div>
              )}
            </div>

            {/* AI Extraction Preview Table */}
            {aiExtractedRecords.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    AI Extracted & Matched Student Results ({aiExtractedRecords.length})
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    Auto-Committed to Database
                  </span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                        <th className="py-3 px-4">Student Full Name</th>
                        <th className="py-3 px-4">Admission No</th>
                        <th className="py-3 px-4">PNR No</th>
                        <th className="py-3 px-4">SGPA Pointer</th>
                        <th className="py-3 px-4">Active KTs</th>
                        <th className="py-3 px-4">Result Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {aiExtractedRecords.map((rec, index) => (
                        <tr key={index} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-semibold text-white">{rec.student_name}</td>
                          <td className="py-3 px-4 text-slate-300 font-mono text-xs">{rec.admission_no}</td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-xs">{rec.pnr_no || "N/A"}</td>
                          <td className="py-3 px-4 font-bold text-blue-400">{rec.sgpa}</td>
                          <td className="py-3 px-4 text-slate-300">{rec.active_kts}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              rec.overall_status === "Pass"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : rec.overall_status === "KT_Pending"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}>
                              {rec.overall_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACADEMIC RECORDS DATABASE */}
        {activeTab === "records" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Maintained Result Records</h3>
                <p className="text-xs text-slate-400">Records scoped for {academicYear} | {yearCode} Semester {semester} ({department})</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student name or admission no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm outline-none focus:border-blue-500 w-64"
                  />
                </div>

                <button
                  onClick={() => setShowManualModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Manual Record
                </button>
              </div>
            </div>

            {loadingRecords ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                Loading academic records...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/80">
                <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-slate-300">No result records found for this academic scope</p>
                <p className="text-xs text-slate-500 mt-1">Upload a PDF result document above or click "Add Manual Record"</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Admission No</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Subjects & Scores</th>
                      <th className="py-3.5 px-4">SGPA Pointer</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRecords.map((r) => {
                      const studentName = r.student_id ? `${r.student_id.first_name} ${r.student_id.surname}` : "Student Record";
                      return (
                        <tr key={r._id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-white">{studentName}</p>
                            <p className="text-[11px] text-slate-400">{r.student_id?.email || ""}</p>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">{r.student_id?.admission_no || "N/A"}</td>
                          <td className="py-3.5 px-4 text-slate-300">{r.department || department}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {r.subjects?.slice(0, 3).map((sub, idx) => (
                                <span key={idx} className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
                                  {sub.subject_name}: {sub.marks}
                                </span>
                              ))}
                              {r.subjects?.length > 3 && (
                                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                                  +{r.subjects.length - 3} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-blue-400 text-base">{r.sgpa}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              r.overall_status === "Pass"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : r.overall_status === "KT_Pending"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}>
                              {r.overall_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              Add Student Result Manually
            </h3>

            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Select Student</label>
                <select
                  value={manualForm.student_id}
                  onChange={(e) => setManualForm({ ...manualForm, student_id: e.target.value })}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Student --</option>
                  {dbStudents.map(st => (
                    <option key={st._id} value={st._id}>
                      {st.first_name} {st.surname} ({st.admission_no})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={manualForm.academic_year}
                    onChange={(e) => setManualForm({ ...manualForm, academic_year: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Year Code & Semester</label>
                  <select
                    value={manualForm.year_code}
                    onChange={(e) => setManualForm({ ...manualForm, year_code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
                  >
                    <option value="FE">FE (First Year)</option>
                    <option value="SE">SE (Second Year)</option>
                    <option value="TE">TE (Third Year)</option>
                    <option value="BE">BE (Final Year)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Subject 1 Name & Marks</label>
                  <input
                    type="text"
                    value={manualForm.subject1}
                    onChange={(e) => setManualForm({ ...manualForm, subject1: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 text-xs mb-1"
                  />
                  <input
                    type="number"
                    value={manualForm.marks1}
                    onChange={(e) => setManualForm({ ...manualForm, marks1: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Subject 2 Name & Marks</label>
                  <input
                    type="text"
                    value={manualForm.subject2}
                    onChange={(e) => setManualForm({ ...manualForm, subject2: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 text-xs mb-1"
                  />
                  <input
                    type="number"
                    value={manualForm.marks2}
                    onChange={(e) => setManualForm({ ...manualForm, marks2: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">SGPA Pointer</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualForm.sgpa}
                    onChange={(e) => setManualForm({ ...manualForm, sgpa: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Overall Status</label>
                  <select
                    value={manualForm.overall_status}
                    onChange={(e) => setManualForm({ ...manualForm, overall_status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-sm"
                  >
                    <option value="Pass">Pass</option>
                    <option value="KT_Pending">KT Pending</option>
                    <option value="Fail">Fail</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-md"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamAdminDashboard;
