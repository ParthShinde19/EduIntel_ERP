import React, { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const About = () => {
  const [aboutContent, setAboutContent] = useState("");

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await API.get("/content/about");
      setAboutContent(res.data.content || "");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <Navbar />

      
{/* Hero Section */}
<section className="w-full py-20 px-8 border-b border-slate-800">
  <div className="max-w-7xl mx-auto flex items-center justify-between">

    {/* Left Logo */}
    <div className="w-1/4 flex justify-start">
      <img
        src="/assets/w_logo.png"
        alt="WIET Logo"
        className="w-48 h-48 object-contain"
      />
    </div>

    {/* Center Content */}
    <div className="w-2/4 text-center px-6">
      <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
        Watumull Institute of
      </h1>

      <h1 className="w-full text-center text-2xl md:text-3xl lg:text-4xl font-bold text-blue-500 mt-2 whitespace-nowrap">
        Engineering & Technology
      </h1>

      <p className="mt-4 text-slate-400 text-lg tracking-wide">
        Building excellence in education, innovation and leadership
      </p>
    </div>

    {/* Right Logo */}
    <div className="w-1/4 flex justify-end">
      <img
        src="/assets/hsnc.png"
        alt="HSNC Logo"
        className="w-48 h-48 object-contain"
      />
    </div>

  </div>
</section>


{/* Content Section */}
<section className="max-w-6xl mx-auto py-16 px-8">
  <div className="bg-slate-900 rounded-3xl shadow-lg p-10 border border-slate-800">

    <h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">
      College Overview
    </h2>

    <div className="text-slate-300 leading-9 text-lg whitespace-pre-line">
      {aboutContent || "No content available yet."}
    </div>

  </div>
</section>




      {/* Vision & Mission */}
      <section className="px-16 py-20 bg-slate-900 border-t border-slate-800">
        <div className="grid md:grid-cols-2 gap-10">

          <div className="p-8 bg-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              Our Vision
            </h3>
            <p className="text-slate-300 leading-8">
              “To be a premier institution for developing professional engineers with the blend of competence and integrity.”
            </p>
          </div>

          <div className="p-8 bg-slate-800 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              Our Mission
            </h3>
            <p className="text-slate-300 leading-8">
             “To provide high quality technical education so that our engineers develop innovative research capabilities and become leaders and decision makers.”
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center bg-black text-slate-400">
        © 2026 Smart Campus ERP | All Rights Reserved
      </footer>
    </div>
  );
};

export default About;

