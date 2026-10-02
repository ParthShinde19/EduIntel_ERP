import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ShieldCheck, ShieldAlert, Award, User, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost:5000/api";

const StudentQRVerify = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/qr/verify/${token}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or Expired Digital Identity QR");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm font-medium">Verifying Digital Student Identity Signature...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-slate-400 text-sm mb-6">{error || "The scanned QR code is invalid or has expired."}</p>
          <Link to="/" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition">
            Return to Smart Campus Portal
          </Link>
        </div>
      </div>
    );
  }

  const { student, academic_risk_badge } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Verification Header Banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 p-4 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Officially Verified Student ID
          </div>
          <p className="text-[11px] text-slate-400">Authentic Institutional Digital Identity Record</p>
        </div>

        {/* Body Profile */}
        <div className="p-6 text-center">
          <div className="relative inline-block mb-4">
            {student.photo ? (
              <img src={student.photo} alt="Student" className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-700 shadow-md mx-auto" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <User className="w-12 h-12" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-white">{student.first_name} {student.surname}</h2>
          <p className="text-indigo-400 font-semibold text-sm mt-0.5">{student.course} - {student.department}</p>
          <p className="text-xs text-slate-400 mt-1">Year {student.current_year} Student</p>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-left mt-6 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Admission No</span>
              <span className="font-bold text-slate-200">{student.admission_no}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">PNR Number</span>
              <span className="font-bold text-slate-200">{student.pnr_no}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Status</span>
              <span className="font-bold text-emerald-400 uppercase">{student.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Valid Upto</span>
              <span className="font-bold text-slate-200">
                {student.valid_upto ? new Date(student.valid_upto).toLocaleDateString() : "Active Academic Term"}
              </span>
            </div>
          </div>

          {/* Risk Badge if available */}
          {academic_risk_badge && (
            <div className="mt-6 bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl text-left flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Academic Risk Standing</span>
                <span className="text-sm font-bold text-white">Risk Level: {academic_risk_badge.risk_level}</span>
              </div>
              <span className="text-xl font-extrabold px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {academic_risk_badge.risk_score}
              </span>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition">
              Smart Campus Management System &copy; 2026
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentQRVerify;
