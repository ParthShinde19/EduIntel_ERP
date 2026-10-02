import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="w-full min-h-screen relative flex items-center justify-center">

        {/* Background Image Overlay */}
        <div className="absolute inset-0">
          <img
            src="/assets/college1.jpg"
            alt="College Campus"
            className="w-full h-full object-cover opacity-25"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950"></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-10 max-w-5xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6">
            Stage 3 • Intelligent Student ERP
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Welcome to
            <span className="block text-indigo-400 mt-2">
              Intelligent Student ERP
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-10 max-w-3xl mx-auto">
            Academic Record Analysis & Explainable Risk Prediction — Bridging operational multi-semester ERP data (academics, attendance drops, KT backlogs, fee/library flags) with an explainable ML inference pipeline (SHAP) surfaced through a unified QR digital identity.
          </p>

          <div className="flex justify-center gap-6 flex-wrap">
            <Link
              to="/risk-dashboard"
              className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              Explore Risk AI Dashboard
            </Link>

            <Link
              to="/notices"
              className="px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold transition"
            >
              View Notices
            </Link>
          </div>
        </div>
      </section>

      {/* Core ERP Highlights Grid */}
      <section className="px-8 md:px-16 py-20 bg-slate-900 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Core ERP Architecture Pillars</h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Unified operational data streams powering predictive academic insights and automated campus workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="p-8 bg-slate-800/90 border border-slate-700/60 rounded-2xl hover:border-indigo-500/50 transition shadow-lg">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                01
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Explainable Risk AI (SHAP)
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Decomposes multi-semester SGPA drops, active KTs, and 30-day rolling attendance drops into transparent factor contributions with prescribed interventions.
              </p>
            </div>

            <div className="p-8 bg-slate-800/90 border border-slate-700/60 rounded-2xl hover:border-indigo-500/50 transition shadow-lg">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                02
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Dynamic QR Identity
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Cryptographically signed 30-day dynamic identity tokens enabling role-aware public verification and digital campus access pass rendering.
              </p>
            </div>

            <div className="p-8 bg-slate-800/90 border border-slate-700/60 rounded-2xl hover:border-indigo-500/50 transition shadow-lg">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                03
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Longitudinal Academics
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Multi-semester SGPA/CGPA history, subject-level performance metrics, active/resolved KT backlog tracking, and attendance logs.
              </p>
            </div>

            <div className="p-8 bg-slate-800/90 border border-slate-700/60 rounded-2xl hover:border-indigo-500/50 transition shadow-lg">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                04
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Placements & Career
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Campus recruitment drives, company eligibility matching, application tracking, and student placement portal integration.
              </p>
            </div>

            <div className="p-8 bg-slate-800/90 border border-slate-700/60 rounded-2xl hover:border-indigo-500/50 transition shadow-lg">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                05
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                NSS Volunteer Hub
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Volunteer registration, logged activity service hours, event coordination, and automated PDF appreciation certificate generation.
              </p>
            </div>

            <div className="p-8 bg-slate-800/90 border border-slate-700/60 rounded-2xl hover:border-indigo-500/50 transition shadow-lg">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                06
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Institutional CMS
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Super Admin content management for official notices, academic circulars, event galleries, calendar events, and principal updates.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
        &copy; 2026 Intelligent Student ERP for Academic Record Analysis and Explainable Risk Prediction | All Rights Reserved
      </footer>
    </div>
  );
};

export default Landing;