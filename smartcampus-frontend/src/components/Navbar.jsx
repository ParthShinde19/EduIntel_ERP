import { Link, useLocation } from "react-router-dom";
import { Activity } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Notices", path: "/notices" },
    { name: "Events", path: "/events" },
    { name: "Gallery", path: "/gallery" },
    { name: "Calendar", path: "/calendar" },
    { name: "Profile Dossier", path: "/student-profile" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-xl tracking-tight flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <span>Smart Campus <span className="text-indigo-400">ERP</span></span>
        </Link>

        {/* Navigation Links (Centered Alignment) */}
        <div className="flex items-center gap-5 md:gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors duration-150 hover:text-white ${
                  isActive ? "text-indigo-400 font-semibold border-b-2 border-indigo-500 pb-0.5" : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Explainable Risk AI Badge Link */}
          <Link
            to="/risk-dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold text-xs hover:bg-indigo-500/30 transition shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Risk AI
          </Link>
        </div>

        {/* Action Buttons (Right Aligned) */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-md shadow-indigo-600/20"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;