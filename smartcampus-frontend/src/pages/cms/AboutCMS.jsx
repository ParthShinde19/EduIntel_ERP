import React, { useState, useEffect } from "react";
import API from "../../services/api";

const AboutCMS = () => {
  const [about, setAbout] = useState("");

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await API.get("/content/about");
      setAbout(res.data.content || "");
    } catch (err) {
      console.log(err);
    }
  };

  const saveAbout = async () => {
    try {
      await API.post("/content/about", {
        content: about
      });

      alert("About content saved successfully");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="bg-white p-8 rounded-2xl shadow-md">

        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Manage About Section
        </h1>

        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="Write about college..."
          className="w-full h-72 p-4 bg-white text-black placeholder:text-slate-500 border border-slate-300 rounded-xl"
        />

        <button
          onClick={saveAbout}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Save About Content
        </button>

      </div>
    </div>
  );
};

export default AboutCMS;