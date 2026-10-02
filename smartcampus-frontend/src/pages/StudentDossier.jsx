import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { 
  User, 
  BookOpen, 
  Award, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Edit3, 
  Activity, 
  QrCode,
  FileSpreadsheet,
  Clock,
  Layers
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const StudentDossier = () => {
  const { studentId: paramStudentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [activeTab, setActiveTab] = useState("admission"); // "admission", "exam", "library", "attendance", "risk"
  const [loading, setLoading] = useState(true);
  const [editParentsModal, setEditParentsModal] = useState(false);
  const [parentForm, setParentForm] = useState({ parent_phone: "", parent_address: "" });
  const [updateMsg, setUpdateMsg] = useState("");
  const [qrModal, setQrModal] = useState(null);

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : null;

  // If param not present, get first student or current student id
  useEffect(() => {
    fetchProfile();
  }, [paramStudentId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let idToUse = paramStudentId;
      if (!idToUse) {
        // Fetch student catalog to get first student ID
        const resList = await axios.get(`${API_BASE}/students/all`);
        if (resList.data && resList.data.length > 0) {
          idToUse = resList.data[0]._id;
        }
      }

      if (idToUse) {
        const res = await axios.get(`${API_BASE}/student-profile/${idToUse}`);
        setStudentData(res.data);
        setParentForm({
          parent_phone: res.data.student.parent_phone || "",
          parent_address: res.data.student.parent_address || ""
        });
      }
    } catch (err) {
      console.error("Failed to load student dossier", err);
    } finally {
      setLoading(false);
    }
  };

  const handleParentUpdate = async (e) => {
    e.preventDefault();
    try {
      const id = studentData?.student?.id;
      const res = await axios.put(`${API_BASE}/student-profile/update-parents/${id}`, parentForm);
      setStudentData(prev => ({
        ...prev,
        student: {
          ...prev.student,
          parent_phone: res.data.parent_phone,
          parent_address: res.data.parent_address
        }
      }));
      setUpdateMsg("Parents' contact details updated successfully!");
      setTimeout(() => setUpdateMsg(""), 3000);
      setEditParentsModal(false);
    } catch (err) {
      alert("Failed to update parents' details");
    }
  };

  const generateQR = async () => {
    try {
      const id = studentData?.student?.id;
      const res = await axios.get(`${API_BASE}/qr/generate/${id}`, authConfig);
      setQrModal(res.data);
    } catch (err) {
      alert("Failed to generate QR signature");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm font-medium">Loading Student ERP Dossier & AI Profile...</p>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Student Dossier Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">No student record matching this identifier could be located.</p>
          <Link to="/" className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-sm font-bold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { student, admission_section, exam_section, library_section, attendance_section, risk_section } = studentData;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="relative">
              {student.photo ? (
                <img src={student.photo} alt={student.name} className="w-28 h-28 rounded-2xl object-cover border-2 border-slate-700 shadow-md" />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400">
                  <User className="w-14 h-14" />
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-indigo-400">
                {admission_section.year_code}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1 justify-center sm:justify-start">
                <h1 className="text-3xl font-extrabold text-white">{student.name}</h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {admission_section.status}
                </span>
              </div>
              <p className="text-indigo-400 font-semibold text-sm">{admission_section.course} - {admission_section.department}</p>
              <p className="text-xs text-slate-400 mt-1">
                Batch: <span className="text-slate-200 font-medium">{admission_section.batch_name}</span> | Academic Year: <span className="text-slate-200 font-medium">{admission_section.academic_year}</span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={generateQR}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              <QrCode className="w-4 h-4" /> Dynamic Identity QR
            </button>
          </div>
        </div>

        {updateMsg && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl text-sm font-semibold text-center">
            {updateMsg}
          </div>
        )}

        {/* Permanent Student Info Grid */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-indigo-400" />
            Permanent Student Details & Emergency Records
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Date of Birth</span>
                <p className="font-bold text-white">{new Date(student.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Gender</span>
                <p className="font-bold text-white">{student.gender || "N/A"}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Blood Group</span>
                <p className="font-bold text-rose-400">{student.blood_group}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Student Contact Phone</span>
                <p className="font-bold text-white">{student.phone}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Email Address</span>
                <p className="font-bold text-white">{student.email}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Emergency Contact</span>
                <p className="font-bold text-amber-400">{student.emergency_contact}</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-indigo-400 uppercase font-bold">Editable Parent Contact</span>
                <button
                  onClick={() => setEditParentsModal(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Details
                </button>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Parents' Phone</span>
                <p className="font-bold text-white">{student.parent_phone}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Permanent Parents' Address</span>
                <p className="font-bold text-slate-300 text-xs">{student.parent_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Sections Nav Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("admission")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "admission" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" /> Admission Department
          </button>

          <button
            onClick={() => setActiveTab("exam")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "exam" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" /> Exam Department (Results)
          </button>

          <button
            onClick={() => setActiveTab("library")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "library" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Library Department
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "attendance" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" /> Attendance Department
          </button>

          <button
            onClick={() => setActiveTab("risk")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === "risk" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" /> Explainable Risk AI
          </button>
        </div>

        {/* Tab 1: Admission Department */}
        {activeTab === "admission" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-800 pb-3">
              Admission Records & Academic Batch Classification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-xs block">Admission Number</span>
                <p className="text-lg font-extrabold text-white mt-1">{admission_section.admission_no}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-xs block">PNR Registration Number</span>
                <p className="text-lg font-extrabold text-white mt-1">{admission_section.pnr_no}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-xs block">GR Number</span>
                <p className="text-lg font-extrabold text-white mt-1">{admission_section.gr_no}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-400 text-xs block">Annual Auto-Promotion Stage</span>
                <p className="text-lg font-extrabold text-indigo-400 mt-1">
                  {admission_section.year_code} (Year {admission_section.current_year})
                </p>
                <span className="text-[10px] text-slate-500">Auto-promotes every July 10th</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Exam Department */}
        {activeTab === "exam" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Exam Department Marksheets & AI Parsed Results</span>
              <span className="text-xs font-normal text-slate-400">Semester-wise Grade Sheets</span>
            </h3>

            {exam_section.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No exam result sheets uploaded for this student yet.
              </div>
            ) : (
              <div className="space-y-6">
                {exam_section.map((rec, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3 mb-4">
                      <div>
                        <span className="text-base font-bold text-white">Semester {rec.semester} Marksheet</span>
                        <p className="text-xs text-slate-400">SGPA: <span className="text-indigo-400 font-bold">{rec.sgpa}</span> | CGPA: <span className="text-indigo-400 font-bold">{rec.cgpa}</span></p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        rec.overall_status === "Pass" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}>
                        {rec.overall_status}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 text-slate-400 uppercase font-semibold">
                          <tr>
                            <th className="p-2.5 rounded-l-lg">Subject Name</th>
                            <th className="p-2.5">Marks Obtained</th>
                            <th className="p-2.5 rounded-r-lg">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {rec.subjects.map((sub, sIdx) => (
                            <tr key={sIdx}>
                              <td className="p-2.5 font-medium text-white">{sub.subject_name}</td>
                              <td className="p-2.5 font-bold text-indigo-300">{sub.marks} / 100</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  sub.status === "Pass" ? "text-emerald-400" : "text-rose-400"
                                }`}>
                                  {sub.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Library Department */}
        {activeTab === "library" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Library Department Book Transactions</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                library_section.eligible_to_borrow ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}>
                {library_section.eligible_to_borrow ? "Eligible to Issue New Book" : "Issue Hold: Borrow Limit Reached or Book Overdue"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">Currently Borrowed</span>
                <p className="text-2xl font-extrabold text-white mt-1">{library_section.currently_borrowed} / {library_section.max_limit}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-slate-400 block font-semibold">Overdue Status</span>
                <p className={`text-2xl font-extrabold mt-1 ${library_section.has_overdue ? "text-rose-400" : "text-emerald-400"}`}>
                  {library_section.has_overdue ? "Yes (Overdue)" : "Clear"}
                </p>
              </div>
            </div>

            {library_section.records.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No library borrowing records available.</p>
            ) : (
              <div className="space-y-3">
                {library_section.records.map((bor, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white">{bor.book_id?.title || "Book"}</h4>
                      <p className="text-slate-400 mt-0.5">Author: {bor.book_id?.author || "Library Catalog"}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full font-bold ${
                        bor.status === "Returned" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {bor.status}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">Due: {new Date(bor.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Attendance Department */}
        {activeTab === "attendance" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              Lecture-wise Attendance Progress
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Classes Taught</span>
                <h4 className="text-4xl font-black text-white mt-2">{attendance_section.total_classes}</h4>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Classes Attended</span>
                <h4 className="text-4xl font-black text-emerald-400 mt-2">{attendance_section.present_classes}</h4>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Attendance %</span>
                <h4 className={`text-4xl font-black mt-2 ${attendance_section.attendance_percentage >= 75 ? "text-emerald-400" : "text-rose-400"}`}>
                  {attendance_section.attendance_percentage}%
                </h4>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
                <span>Mandatory Threshold (75%)</span>
                <span>{attendance_section.attendance_percentage}% Total Attendance</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full ${attendance_section.attendance_percentage >= 75 ? "bg-emerald-500" : "bg-rose-500"}`}
                  style={{ width: `${Math.min(attendance_section.attendance_percentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Explainable Risk AI */}
        {activeTab === "risk" && risk_section && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                SHAP Factor Risk Assessment
              </h3>
              <span className="text-xl font-extrabold px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Risk Score: {risk_section.risk_score}
              </span>
            </div>

            <div className="space-y-3">
              {risk_section.shap_factors.map((fact, fIdx) => (
                <div key={fIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white">{fact.label}</h5>
                    <p className="text-slate-400 mt-0.5">{fact.explanation}</p>
                  </div>
                  <span className={`font-bold px-2.5 py-1 rounded-full ${
                    fact.direction === "risk_increase" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {fact.impact > 0 ? `+${fact.impact}%` : `${fact.impact}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Edit Parents Modal */}
      {editParentsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Edit Parents' Contact Information</h3>
            <form onSubmit={handleParentUpdate} className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Parents' Phone Number</label>
                <input
                  type="text"
                  value={parentForm.parent_phone}
                  onChange={(e) => setParentForm({ ...parentForm, parent_phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Permanent Parents' Address</label>
                <textarea
                  value={parentForm.parent_address}
                  onChange={(e) => setParentForm({ ...parentForm, parent_address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditParentsModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Save Parents' Info
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center relative shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Dynamic Digital Identity QR</h3>
            <p className="text-xs text-slate-400 mb-4">Admission No: {qrModal.admission_no}</p>

            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={qrModal.qr_image} alt="Student QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Scan with camera to open verified digital profile <br />
              <span className="text-indigo-400 break-all">{qrModal.verify_url}</span>
            </p>

            <button
              onClick={() => setQrModal(null)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-5 py-2 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDossier;
