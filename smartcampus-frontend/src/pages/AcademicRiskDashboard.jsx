import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingDown, 
  TrendingUp, 
  UserCheck, 
  ShieldAlert, 
  Award, 
  BookOpen, 
  FileText,
  Search,
  Activity,
  QrCode,
  Layers,
  Users
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const DEMO_STUDENTS = [
  {
    _id: "demo_student_1",
    first_name: "Parth",
    surname: "Shinde",
    admission_no: "ADM2024001",
    course: "B.Tech Engineering",
    department: "Computer Science"
  },
  {
    _id: "demo_student_2",
    first_name: "Rahul",
    surname: "Sharma",
    admission_no: "ADM2024002",
    course: "B.Tech Engineering",
    department: "Computer Science"
  },
  {
    _id: "demo_student_3",
    first_name: "Priya",
    surname: "Patel",
    admission_no: "ADM2024003",
    course: "B.Tech Engineering",
    department: "Information Technology"
  },
  {
    _id: "demo_student_4",
    first_name: "Amit",
    surname: "Verma",
    admission_no: "ADM2024004",
    course: "B.Tech Engineering",
    department: "Electronics & Telecom"
  }
];

const DEMO_RISK_MAP = {
  demo_student_1: {
    student: {
      id: "demo_student_1",
      name: "Rahul Sharma",
      admission_no: "ADM202401",
      course: "B.Tech",
      department: "Computer Science",
      current_year: 3
    },
    assessment: {
      risk_score: 58.5,
      risk_level: "High",
      last_assessed: new Date().toISOString(),
      feature_snapshot: {
        current_cgpa: 6.1,
        active_kts: 2,
        attendance_percentage: 71.5,
        sgpa_drop: 1.1,
        rolling_30day_attendance_drop: 12.0,
        fee_defaulter_flag: 0,
        library_overdue_flag: 0
      },
      shap_factors: [
        {
          feature: "active_kts",
          label: "Unresolved KT Backlogs",
          impact: 29.0,
          direction: "risk_increase",
          explanation: "2 active backlog(s) registered in recent term."
        },
        {
          feature: "sgpa_drop",
          label: "SGPA Drop Between Semesters",
          impact: 17.6,
          direction: "risk_increase",
          explanation: "Significant drop of 1.10 SGPA points compared to previous term."
        },
        {
          feature: "attendance_percentage",
          label: "Overall Attendance %",
          impact: 8.5,
          direction: "risk_increase",
          explanation: "Attendance at 71.5%, below 75% mandatory threshold."
        },
        {
          feature: "current_cgpa",
          label: "Current CGPA",
          impact: -4.0,
          direction: "risk_decrease",
          explanation: "Moderate cumulative CGPA of 6.10."
        }
      ],
      interventions: [
        "Enroll in mandatory remedial tutorial sessions for 2 pending KT subjects.",
        "Schedule 1-on-1 Academic Counseling session to analyze exam performance dip.",
        "Issue official Attendance Warning & mandate weekly sign-off."
      ]
    }
  },
  demo_student_2: {
    student: {
      id: "demo_student_2",
      name: "Priya Patel",
      admission_no: "ADM202402",
      course: "B.Tech",
      department: "Information Technology",
      current_year: 3
    },
    assessment: {
      risk_score: 84.0,
      risk_level: "Critical",
      last_assessed: new Date().toISOString(),
      feature_snapshot: {
        current_cgpa: 5.0,
        active_kts: 4,
        attendance_percentage: 55.0,
        sgpa_drop: 1.8,
        rolling_30day_attendance_drop: 25.0,
        fee_defaulter_flag: 1,
        library_overdue_flag: 1
      },
      shap_factors: [
        {
          feature: "active_kts",
          label: "Unresolved KT Backlogs",
          impact: 58.0,
          direction: "risk_increase",
          explanation: "4 active backlogs causing critical academic standing."
        },
        {
          feature: "rolling_30day_attendance_drop",
          label: "30-Day Rolling Attendance Drop",
          impact: 22.5,
          direction: "risk_increase",
          explanation: "Sharp drop of 25.0% in recent 30-day class attendance."
        },
        {
          feature: "fee_defaulter_flag",
          label: "Pending Tuition Fee Status",
          impact: 12.0,
          direction: "risk_increase",
          explanation: "Unpaid fee status active - administrative risk flag."
        }
      ],
      interventions: [
        "Urgent Faculty Board Review required.",
        "Initiate Student Welfare check regarding recent 30-day absenteeism spike.",
        "Contact Accounts Department to resolve fee installment plan."
      ]
    }
  },
  demo_student_3: {
    student: {
      id: "demo_student_3",
      name: "Amit Verma",
      admission_no: "ADM202403",
      course: "B.Tech",
      department: "Electronics",
      current_year: 4
    },
    assessment: {
      risk_score: 12.0,
      risk_level: "Low",
      last_assessed: new Date().toISOString(),
      feature_snapshot: {
        current_cgpa: 8.8,
        active_kts: 0,
        attendance_percentage: 92.0,
        sgpa_drop: 0.0,
        rolling_30day_attendance_drop: 1.0,
        fee_defaulter_flag: 0,
        library_overdue_flag: 0
      },
      shap_factors: [
        {
          feature: "current_cgpa",
          label: "Current CGPA",
          impact: -11.2,
          direction: "risk_decrease",
          explanation: "Strong cumulative CGPA of 8.80 providing academic buffer."
        },
        {
          feature: "attendance_percentage",
          label: "Overall Attendance %",
          impact: -5.1,
          direction: "risk_decrease",
          explanation: "Healthy attendance level at 92.0%."
        },
        {
          feature: "active_kts",
          label: "Unresolved KT Backlogs",
          impact: -10.0,
          direction: "risk_decrease",
          explanation: "Zero active backlogs maintaining academic standing."
        }
      ],
      interventions: [
        "Maintain current study routine and target semester honors distinction."
      ]
    }
  }
};

const AcademicRiskDashboard = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState(null);
  const [analytics, setAnalytics] = useState({
    total_students_assessed: 3,
    average_risk_score: 51,
    risk_distribution: { Low: 1, Medium: 0, High: 1, Critical: 1 },
    top_risk_drivers: [
      { label: "Unresolved KT Backlogs", count: 2 },
      { label: "SGPA Drop Between Semesters", count: 2 },
      { label: "30-Day Rolling Attendance Drop", count: 1 }
    ]
  });
  const [qrModal, setQrModal] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : null;

  useEffect(() => {
    fetchBatches();
    fetchStudents();
    fetchAnalytics();
  }, []);

  const fetchBatches = async () => {
    if (authConfig) {
      try {
        const res = await axios.get(`${API_BASE}/batches/all`, authConfig);
        setBatches(res.data || []);
      } catch (err) {
        console.warn("Could not fetch batches", err);
      }
    }
  };

  const fetchStudents = async () => {
    if (authConfig) {
      try {
        const res = await axios.get(`${API_BASE}/students/all`, authConfig);
        if (res.data && res.data.length > 0) {
          setStudents(res.data);
          setSelectedStudentId(res.data[0]._id);
          fetchStudentRisk(res.data[0]._id);
          return;
        }
      } catch (err) {
        console.warn("Using demo student catalog (unauthenticated or offline backend)");
      }
    }
    // Fallback Demo Students
    setStudents(DEMO_STUDENTS);
    setSelectedStudentId(DEMO_STUDENTS[0]._id);
    setRiskData(DEMO_RISK_MAP[DEMO_STUDENTS[0]._id]);
  };

  const filteredStudents = students.filter((s) => {
    if (selectedBatch === "all" || !selectedBatch) return true;
    if (s.batch_id === selectedBatch || s.batch_name === selectedBatch) return true;

    const targetBatch = batches.find(b => b._id === selectedBatch || b.batch_name === selectedBatch);
    if (targetBatch) {
      const deptMatch = !s.department || !targetBatch.department || 
        s.department.toLowerCase().includes(targetBatch.department.toLowerCase()) || 
        targetBatch.department.toLowerCase().includes(s.department.toLowerCase());
      const yearMatch = !s.year_code || !targetBatch.year_code || s.year_code === targetBatch.year_code;
      return deptMatch && yearMatch;
    }
    return true;
  });

  const handleBatchChange = (batchVal) => {
    setSelectedBatch(batchVal);
    const matching = students.filter((s) => {
      if (batchVal === "all" || !batchVal) return true;
      if (s.batch_id === batchVal || s.batch_name === batchVal) return true;
      const targetBatch = batches.find(b => b._id === batchVal || b.batch_name === batchVal);
      if (targetBatch) {
        const deptMatch = !s.department || !targetBatch.department || 
          s.department.toLowerCase().includes(targetBatch.department.toLowerCase()) || 
          targetBatch.department.toLowerCase().includes(s.department.toLowerCase());
        const yearMatch = !s.year_code || !targetBatch.year_code || s.year_code === targetBatch.year_code;
        return deptMatch && yearMatch;
      }
      return true;
    });

    if (matching.length > 0) {
      setSelectedStudentId(matching[0]._id);
      fetchStudentRisk(matching[0]._id);
    } else {
      setSelectedStudentId("");
      setRiskData(null);
    }
  };

  const fetchAnalytics = async () => {
    if (authConfig) {
      try {
        const res = await axios.get(`${API_BASE}/risk/analytics/dashboard`, authConfig);
        if (res.data) setAnalytics(res.data);
      } catch (err) {
        console.warn("Using baseline analytics summary");
      }
    }
  };

  const fetchStudentRisk = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");

    if (id.startsWith("demo_student")) {
      setRiskData(DEMO_RISK_MAP[id] || DEMO_RISK_MAP.demo_student_1);
      setLoading(false);
      return;
    }

    if (authConfig) {
      try {
        const res = await axios.get(`${API_BASE}/risk/student/${id}`, authConfig);
        setRiskData(res.data);
        setLoading(false);
        return;
      } catch (err) {
        console.warn("Falling back to demo student risk details");
      }
    }

    setRiskData(DEMO_RISK_MAP.demo_student_1);
    setLoading(false);
  };

  const generateStudentQR = async (id) => {
    if (authConfig && !id.startsWith("demo_student")) {
      try {
        const res = await axios.get(`${API_BASE}/qr/generate/${id}`, authConfig);
        setQrModal(res.data);
        return;
      } catch (err) {
        console.warn("Generating client fallback QR");
      }
    }

    // Demo QR payload
    const demoToken = "demo_jwt_token_" + id;
    setQrModal({
      admission_no: riskData?.student?.admission_no || "ADM202401",
      qr_token: demoToken,
      verify_url: `http://localhost:5173/verify/student/${demoToken}`,
      qr_image: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`http://localhost:5173/verify/student/${demoToken}`)}`
    });
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "Critical": return "bg-red-500 text-white border-red-600";
      case "High": return "bg-orange-500 text-white border-orange-600";
      case "Medium": return "bg-amber-500 text-white border-amber-600";
      default: return "bg-emerald-500 text-white border-emerald-600";
    }
  };

  const getRiskBadgeStyle = (level) => {
    switch (level) {
      case "Critical": return "bg-red-100 text-red-800 border-red-300";
      case "High": return "bg-orange-100 text-orange-800 border-orange-300";
      case "Medium": return "bg-amber-100 text-amber-800 border-amber-300";
      default: return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Activity className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Explainable Academic Risk Intelligence
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            AI-Driven Multi-Semester Academic & Behavioral Risk Prediction with SHAP Factor Explanations
          </p>
        </div>

        {/* Batch Filter & Student Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          {/* Filter by Batch */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-indigo-300 whitespace-nowrap flex items-center gap-1">
              <Layers className="w-4 h-4 text-indigo-400" /> Filter Batch:
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => handleBatchChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
            >
              <option value="all">All Batches ({students.length} Students)</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.batch_name} ({b.academic_year})
                </option>
              ))}
            </select>
          </div>

          {/* Select Student */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-300 whitespace-nowrap flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-400" /> Select Student:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                fetchStudentRisk(e.target.value);
              }}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
            >
              {filteredStudents.length === 0 ? (
                <option value="">No students in selected batch</option>
              ) : (
                filteredStudents.map((s) => (
                  <option key={s._id} value={s._id}>
                    [{s.admission_no || "ADM"}] - {s.first_name} {s.surname}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      {analytics && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Assessed</p>
            <h3 className="text-3xl font-extrabold text-white mt-2">{analytics.total_students_assessed}</h3>
            <span className="text-xs text-slate-400">Students across all departments</span>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Institute Risk</p>
            <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">{analytics.average_risk_score} / 100</h3>
            <span className="text-xs text-slate-400">Campus-wide weighted baseline</span>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Critical / High Risk</p>
            <h3 className="text-3xl font-extrabold text-red-400 mt-2">
              {(analytics.risk_distribution.Critical || 0) + (analytics.risk_distribution.High || 0)}
            </h3>
            <span className="text-xs text-slate-400">Requires immediate counselor intervention</span>
          </div>

          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-xl p-5 shadow-lg">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Low Risk / Safe</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
              {analytics.risk_distribution.Low || 0}
            </h3>
            <span className="text-xs text-slate-400">Maintaining strong academic standing</span>
          </div>
        </div>
      )}

      {/* Main Student Assessment Details */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Student Profile & Risk Dial */}
        {riskData && (
          <div className="lg:col-span-1 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-indigo-400 font-mono">[{riskData.student.admission_no}]</span>
                    {riskData.student.name}
                  </h2>
                  <p className="text-sm text-slate-400">Admission No: {riskData.student.admission_no}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{riskData.student.course} - {riskData.student.department}</p>
                </div>
                <button
                  onClick={() => generateStudentQR(riskData.student.id)}
                  className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  <QrCode className="w-4 h-4" /> Dynamic QR
                </button>
              </div>

              {/* Risk Score Dial Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 text-center mb-6 relative overflow-hidden">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Predictive Risk Index</p>
                <div className="inline-flex items-center justify-center my-3">
                  <span className={`text-5xl font-black px-6 py-2 rounded-2xl border-2 ${getRiskColor(riskData.assessment.risk_level)}`}>
                    {riskData.assessment.risk_score}
                  </span>
                </div>
                <p className="text-sm font-semibold tracking-wide text-slate-300 mt-1">
                  Risk Level: <span className={`px-2 py-0.5 rounded text-xs border ${getRiskBadgeStyle(riskData.assessment.risk_level)}`}>
                    {riskData.assessment.risk_level}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 mt-3">
                  Last Assessed: {new Date(riskData.assessment.last_assessed).toLocaleDateString()}
                </p>
              </div>

              {/* Feature Input Snapshot */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">Operational ERP Snapshot</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-slate-400">Current CGPA</span>
                    <p className="text-sm font-bold text-white">{riskData.assessment.feature_snapshot.current_cgpa}</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-slate-400">Active KTs</span>
                    <p className="text-sm font-bold text-amber-400">{riskData.assessment.feature_snapshot.active_kts}</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-slate-400">Overall Attendance</span>
                    <p className="text-sm font-bold text-white">{riskData.assessment.feature_snapshot.attendance_percentage}%</p>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-slate-400">SGPA Drop</span>
                    <p className="text-sm font-bold text-rose-400">{riskData.assessment.feature_snapshot.sgpa_drop}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: SHAP Factor Attribution & Interventions */}
        {riskData && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* SHAP Factor Breakdown Widget */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" />
                    SHAP Factor Contribution Analysis
                  </h3>
                  <p className="text-xs text-slate-400">Explainable decomposition of academic & behavioral risk factors</p>
                </div>
              </div>

              <div className="space-y-4">
                {riskData.assessment.shap_factors.map((factor, idx) => {
                  const isRiskIncrease = factor.direction === "risk_increase";
                  return (
                    <div key={idx} className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 transition hover:border-slate-600">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <span className="text-sm font-bold text-white">{factor.label}</span>
                          <p className="text-xs text-slate-400 mt-0.5">{factor.explanation}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                          isRiskIncrease ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {isRiskIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isRiskIncrease ? `+${factor.impact}% Risk` : `${factor.impact}% Risk`}
                        </span>
                      </div>

                      {/* Visual Bar representation */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mt-2">
                        <div 
                          className={`h-2 rounded-full ${isRiskIncrease ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(Math.abs(factor.impact) * 4, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prescriptive Interventions */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Recommended Faculty & Counselor Interventions
              </h3>
              <ul className="space-y-2.5">
                {riskData.assessment.interventions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-slate-900/90 border border-slate-700/50 p-3 rounded-xl text-sm text-slate-200">
                    <span className="bg-indigo-600/30 text-indigo-400 font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </div>

      {/* Dynamic QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center relative shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Dynamic Digital Identity QR</h3>
            <p className="text-xs text-slate-400 mb-4">Admission No: {qrModal.admission_no}</p>

            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img src={qrModal.qr_image} alt="Student QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Scan with camera to access public identity verification route <br />
              <span className="text-indigo-400 break-all">{qrModal.verify_url}</span>
            </p>

            <button
              onClick={() => setQrModal(null)}
              className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-5 py-2 rounded-lg text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicRiskDashboard;
