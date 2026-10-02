import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  Users,
  Award,
  BookOpen,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
  Save,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Layers,
  LogOut,
  RefreshCw,
  Search,
  UserCheck
} from "lucide-react";
import { getAcademicYears } from "../utils/academicYear";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  // Role Setup State
  const [roleType, setRoleType] = useState("Class Teacher");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [yearCode, setYearCode] = useState("FE");
  const [semester, setSemester] = useState(1);
  const [department, setDepartment] = useState("Computer Science");
  const [division, setDivision] = useState("A");

  // Committee State
  const [belongsToCommittee, setBelongsToCommittee] = useState(false);
  const [committeeName, setCommitteeName] = useState("Students");
  const [committeeRole, setCommitteeRole] = useState("Member");

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState("marks_attendance");

  // Data States
  const [students, setStudents] = useState([]);
  const [assessments, setAssessments] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // File Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSubject, setUploadSubject] = useState("General Engineering");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [aiParsedResults, setAiParsedResults] = useState([]);

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  useEffect(() => {
    fetchClassData();
  }, [academicYear, yearCode, semester, department, division]);

  const fetchTeacherProfile = async () => {
    try {
      const res = await API.get("/teacher/profile");
      if (res.data?.teacher_info) {
        const info = res.data.teacher_info;
        setRoleType(info.role_type || "Class Teacher");
        setAcademicYear(info.academic_year || "2024-2025");
        setYearCode(info.year_code || "FE");
        setSemester(info.semester || 1);
        setDepartment(info.department || "Computer Science");
        setDivision(info.division || "A");
        setBelongsToCommittee(Boolean(info.belongs_to_committee));
        setCommitteeName(info.committee_name || "Students");
        setCommitteeRole(info.committee_role || "Member");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const saveRoleSetup = async () => {
    try {
      const payload = {
        role_type: roleType,
        academic_year: academicYear,
        year_code: yearCode,
        semester: Number(semester),
        department,
        division,
        belongs_to_committee: belongsToCommittee,
        committee_name: belongsToCommittee ? committeeName : "",
        committee_role: belongsToCommittee ? committeeRole : ""
      };

      await API.post("/teacher/profile-role", payload);
      setStatusMessage("Teacher coordination role & committee configuration updated!");
      setTimeout(() => setStatusMessage(""), 4000);
      fetchClassData();
    } catch (err) {
      alert("Error saving setup: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchClassData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students in assigned Class & Division
      const studRes = await API.get("/teacher/students", {
        params: { department, year_code: yearCode, academic_year: academicYear, division, semester }
      });
      setStudents(studRes.data || []);

      // 2. Fetch Existing Assessments
      const assRes = await API.get("/teacher/assessments", {
        params: { department, year_code: yearCode, academic_year: academicYear, division, semester }
      });

      const map = {};
      (assRes.data || []).forEach(item => {
        const studId = item.student_id?._id || item.student_id;
        if (studId) {
          map[studId] = {
            ia1_marks: item.ia1_marks || 0,
            ia2_marks: item.ia2_marks || 0,
            lecture_attendance_present: item.lecture_attendance_present || 0,
            lecture_attendance_total: item.lecture_attendance_total || 40,
            practical_attendance_present: item.practical_attendance_present || 0,
            practical_attendance_total: item.practical_attendance_total || 20
          };
        }
      });

      setAssessments(map);
    } catch (err) {
      console.error("Error fetching class data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentChange = (studentId, field, value) => {
    setAssessments(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: Number(value)
      }
    }));
  };

  const handleSaveAllAssessments = async () => {
    setSaving(true);
    try {
      const payload = students.map(s => {
        const ass = assessments[s._id] || {};
        return {
          student_id: s._id,
          academic_year: academicYear,
          year_code: yearCode,
          semester: Number(semester),
          department,
          division,
          subject_name: "Coordination Subject",
          ia1_marks: Number(ass.ia1_marks || 0),
          ia2_marks: Number(ass.ia2_marks || 0),
          lecture_attendance_present: Number(ass.lecture_attendance_present || 0),
          lecture_attendance_total: Number(ass.lecture_attendance_total || 40),
          practical_attendance_present: Number(ass.practical_attendance_present || 0),
          practical_attendance_total: Number(ass.practical_attendance_total || 20)
        };
      });

      await API.post("/teacher/update-assessment", { assessments: payload });
      setStatusMessage("IA Marks & Daily/Practical Attendance saved successfully without mixups!");
      setTimeout(() => setStatusMessage(""), 4000);
      fetchClassData();
    } catch (err) {
      alert("Error updating assessment: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleTeacherFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      await triggerTeacherAutoUpload(file);
    }
  };

  const triggerTeacherAutoUpload = async (fileToUpload) => {
    const file = fileToUpload || uploadFile;
    if (!file) {
      alert("Please select a document or image file (PDF, XLS, JPEG, PNG)");
      return;
    }

    setUploadingFile(true);
    setStatusMessage("⚡ AI is parsing PDF/XLS/Image file and writing student IA marks & attendance directly into MongoDB...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("academic_year", academicYear);
    formData.append("year_code", yearCode);
    formData.append("semester", semester);
    formData.append("department", department);
    formData.append("division", division);
    formData.append("subject_name", uploadSubject);

    try {
      const res = await API.post("/teacher/upload-assessment-file", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setAiParsedResults(res.data.records || []);
      setStatusMessage(`✨ Database Auto-Updated! AI successfully matched & saved ${res.data.total_students_processed} student assessment records into database.`);
      setUploadFile(null);
      fetchClassData();
    } catch (err) {
      setStatusMessage("Upload Error: " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileUploadSubmit = async (e) => {
    e.preventDefault();
    await triggerTeacherAutoUpload();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Teacher & Coordinator Dashboard
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {roleType}
              </span>
            </h1>
            <p className="text-xs text-slate-400">Watumull Institute Academic Coordination Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {belongsToCommittee && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-medium">
              <Award className="w-4 h-4 text-purple-400" />
              <span>{committeeName} Committee ({committeeRole})</span>
            </div>
          )}

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Status Notification */}
        {statusMessage && (
          <div className={`p-4 rounded-xl text-sm border flex items-center gap-3 shadow-lg ${
            statusMessage.includes("Error") 
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}>
            {statusMessage.includes("Error") ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{statusMessage}</span>
          </div>
        )}

        {/* PANEL 1: ROLE SELECTION & COMMITTEE ASSIGNMENT */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Coordination Scope & Role Selection
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your active Class Teacher/Subject Teacher role, academic year, semester, class, division, and committee credentials.
              </p>
            </div>

            <button
              onClick={saveRoleSetup}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Teacher Role Type */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Teacher Role</label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="Class Teacher">Class Teacher</option>
                <option value="Subject Teacher">Subject Teacher</option>
                <option value="Batch Coordinator">Batch Coordinator</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                {getAcademicYears().map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Year Code (FE, SE, TE, BE) */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Year Code</label>
              <select
                value={yearCode}
                onChange={(e) => setYearCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="FE">FE (First Year)</option>
                <option value="SE">SE (Second Year)</option>
                <option value="TE">TE (Third Year)</option>
                <option value="BE">BE (Final Year)</option>
              </select>
            </div>

            {/* Semester (Always selectable) */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value={1}>Sem 1</option>
                <option value={2}>Sem 2</option>
                <option value={3}>Sem 3</option>
                <option value={4}>Sem 4</option>
                <option value={5}>Sem 5</option>
                <option value={6}>Sem 6</option>
                <option value={7}>Sem 7</option>
                <option value={8}>Sem 8</option>
              </select>
            </div>

            {/* Class / Department */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Class / Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Tech</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="Electronics & Telecom (EXTC)">EXTC</option>
                <option value="Mechanical Engineering">Mechanical</option>
              </select>
            </div>

            {/* Division */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Division</label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
                <option value="D">Division D</option>
              </select>
            </div>
          </div>

          {/* COMMITTEE INVOLVEMENT OPTION */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="committee-toggle"
                checked={belongsToCommittee}
                onChange={(e) => setBelongsToCommittee(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <label htmlFor="committee-toggle" className="text-sm font-semibold text-slate-200 cursor-pointer">
                Do you belong to any Institutional Committee?
              </label>
            </div>

            {belongsToCommittee && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Select Committee:</span>
                  <select
                    value={committeeName}
                    onChange={(e) => setCommitteeName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-purple-500"
                  >
                    <option value="Students">Students Committee</option>
                    <option value="Cultural">Cultural Committee</option>
                    <option value="CSI">CSI (Computer Society of India)</option>
                    <option value="E-Cell">E-Cell (Entrepreneurship)</option>
                    <option value="NSS">NSS (National Service Scheme)</option>
                    <option value="Sports">Sports Committee</option>
                    <option value="R&D">R&D Committee</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Role:</span>
                  <select
                    value={committeeRole}
                    onChange={(e) => setCommitteeRole(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-purple-500"
                  >
                    <option value="Head">Head / Coordinator</option>
                    <option value="Member">Faculty Member</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SUB-TABS: IA MARKS & ATTENDANCE vs FILE UPLOAD */}
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab("marks_attendance")}
            className={`pb-3 px-4 font-semibold text-sm transition border-b-2 flex items-center gap-2 ${
              activeTab === "marks_attendance"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Student Coordination Sheet ({students.length} Students)
          </button>

          <button
            onClick={() => setActiveTab("file_upload")}
            className={`pb-3 px-4 font-semibold text-sm transition border-b-2 flex items-center gap-2 ${
              activeTab === "file_upload"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload PDF / XLS / JPEG Attendance & IA Sheet
          </button>
        </div>

        {/* SUB-TAB 1: INTERACTIVE STUDENT MARKS & ATTENDANCE SHEET */}
        {activeTab === "marks_attendance" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Student IA Marks (IA1, IA2) & Daily Attendance Updates
                </h3>
                <p className="text-xs text-slate-400">
                  Class: {department} Div {division} | Academic Year {academicYear} | Year Code {yearCode} Sem {semester}
                </p>
              </div>

              <button
                onClick={handleSaveAllAssessments}
                disabled={saving || students.length === 0}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All IA Marks & Attendance
                  </>
                )}
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
                Fetching student coordination records...
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/80">
                <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-slate-300">No students currently registered under this class & division</p>
                <p className="text-xs text-slate-500 mt-1">Select another department, year code, or division above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Admission No</th>
                      <th className="py-3.5 px-4 text-center">IA 1 (Max 20)</th>
                      <th className="py-3.5 px-4 text-center">IA 2 (Max 20)</th>
                      <th className="py-3.5 px-4 text-center">Lecture Attendance</th>
                      <th className="py-3.5 px-4 text-center">Practical Attendance</th>
                      <th className="py-3.5 px-4 text-center">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {students.map((st) => {
                      const record = assessments[st._id] || {
                        ia1_marks: 0,
                        ia2_marks: 0,
                        lecture_attendance_present: 0,
                        lecture_attendance_total: 40,
                        practical_attendance_present: 0,
                        practical_attendance_total: 20
                      };

                      const totalLec = record.lecture_attendance_total || 40;
                      const presLec = record.lecture_attendance_present || 0;
                      const totalPrac = record.practical_attendance_total || 20;
                      const presPrac = record.practical_attendance_present || 0;

                      const attPct = (((presLec + presPrac) / (totalLec + totalPrac)) * 100).toFixed(1);

                      return (
                        <tr key={st._id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-white">
                              <span className="font-mono text-indigo-400 font-bold mr-1.5">[{st.admission_no}]</span>
                              {st.first_name} {st.surname}
                            </p>
                            <p className="text-[11px] text-slate-400">{st.email || "No email"}</p>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">{st.admission_no}</td>

                          {/* IA 1 Marks */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={record.ia1_marks}
                              onChange={(e) => handleAssessmentChange(st._id, "ia1_marks", e.target.value)}
                              className="w-16 bg-slate-800 border border-slate-700 text-white rounded-lg p-1.5 text-center text-sm font-semibold outline-none focus:border-indigo-500"
                            />
                          </td>

                          {/* IA 2 Marks */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={record.ia2_marks}
                              onChange={(e) => handleAssessmentChange(st._id, "ia2_marks", e.target.value)}
                              className="w-16 bg-slate-800 border border-slate-700 text-white rounded-lg p-1.5 text-center text-sm font-semibold outline-none focus:border-indigo-500"
                            />
                          </td>

                          {/* Lecture Attendance */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max={totalLec}
                                value={record.lecture_attendance_present}
                                onChange={(e) => handleAssessmentChange(st._id, "lecture_attendance_present", e.target.value)}
                                className="w-14 bg-slate-800 border border-slate-700 text-white rounded-lg p-1.5 text-center text-sm outline-none focus:border-indigo-500"
                              />
                              <span className="text-slate-500 text-xs">/</span>
                              <input
                                type="number"
                                value={totalLec}
                                onChange={(e) => handleAssessmentChange(st._id, "lecture_attendance_total", e.target.value)}
                                className="w-14 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg p-1.5 text-center text-xs outline-none"
                              />
                            </div>
                          </td>

                          {/* Practical Attendance */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max={totalPrac}
                                value={record.practical_attendance_present}
                                onChange={(e) => handleAssessmentChange(st._id, "practical_attendance_present", e.target.value)}
                                className="w-14 bg-slate-800 border border-slate-700 text-white rounded-lg p-1.5 text-center text-sm outline-none focus:border-indigo-500"
                              />
                              <span className="text-slate-500 text-xs">/</span>
                              <input
                                type="number"
                                value={totalPrac}
                                onChange={(e) => handleAssessmentChange(st._id, "practical_attendance_total", e.target.value)}
                                className="w-14 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg p-1.5 text-center text-xs outline-none"
                              />
                            </div>
                          </td>

                          {/* Attendance Percentage Badge */}
                          <td className="py-3.5 px-4 text-center font-bold">
                            <span className={`px-2.5 py-1 rounded-full text-xs ${
                              attPct >= 75
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : attPct >= 60
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}>
                              {attPct}%
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

        {/* SUB-TAB 2: UPLOAD DOCUMENT / IMAGE (PDF, XLS, JPEG, PNG) */}
        {activeTab === "file_upload" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Upload IA Marks & Daily Attendance File (PDF, XLS, JPEG, PNG)
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Upload attendance or IA marksheets in <strong>PDF, XLS/XLSX, or JPEG/PNG image</strong> format. The AI parser will automatically extract complete student names, roll numbers, IA marks, and lecture/practical attendance, updating student records without mixing up.
                </p>
              </div>

              <form onSubmit={handleFileUploadSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={uploadSubject}
                    onChange={(e) => setUploadSubject(e.target.value)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm outline-none focus:border-indigo-500"
                    placeholder="e.g. Applied Mathematics / Database Management"
                  />
                </div>

                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 transition rounded-2xl p-8 text-center bg-slate-950/50 flex flex-col items-center justify-center cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.jpg,.jpeg,.png"
                    onChange={handleTeacherFileChange}
                    className="hidden"
                    id="teacher-file-upload"
                  />
                  <label htmlFor="teacher-file-upload" className="cursor-pointer w-full flex flex-col items-center">
                    <div className="p-4 bg-slate-800 group-hover:bg-indigo-600/20 rounded-full text-slate-400 group-hover:text-indigo-400 transition mb-3">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                    {uploadFile ? (
                      <div>
                        <p className="font-semibold text-emerald-400 text-base">{uploadFile.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{(uploadFile.size / 1024).toFixed(1)} KB • File format accepted</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-slate-200 text-base">Click to upload or drag & drop PDF, XLS, or JPEG/PNG Image</p>
                        <p className="text-xs text-slate-400 mt-1">Supports PDF documents, Excel spreadsheets, & scanned Marksheet Images</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Class Target: <strong className="text-white">{department} Div {division} ({academicYear} {yearCode} Sem {semester})</strong>
                  </span>

                  <button
                    type="submit"
                    disabled={uploadingFile || !uploadFile}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition"
                  >
                    {uploadingFile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        AI OCR & Match Parsing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Process & Match Student File
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* AI PARSED RESULTS DISPLAY */}
            {aiParsedResults.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    AI Extracted Student Assessment & Attendance ({aiParsedResults.length})
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    Updated Accurately in DB
                  </span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-950/40">
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Admission No</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">IA1 Marks</th>
                        <th className="py-3 px-4">IA2 Marks</th>
                        <th className="py-3 px-4">Lec Attendance</th>
                        <th className="py-3 px-4">Prac Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {aiParsedResults.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-semibold text-white">
                            <span className="font-mono text-indigo-400 font-bold mr-1.5">[{r.admission_no}]</span>
                            {r.student_name}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300 text-xs">{r.admission_no}</td>
                          <td className="py-3 px-4 text-slate-300">{r.subject_name}</td>
                          <td className="py-3 px-4 font-bold text-indigo-400">{r.ia1_marks}/20</td>
                          <td className="py-3 px-4 font-bold text-purple-400">{r.ia2_marks}/20</td>
                          <td className="py-3 px-4 text-slate-300">{r.lecture_attendance_present}/{r.lecture_attendance_total}</td>
                          <td className="py-3 px-4 text-slate-300">{r.practical_attendance_present}/{r.practical_attendance_total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
