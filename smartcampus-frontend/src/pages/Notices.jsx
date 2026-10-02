import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const Notices = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await API.get("/notices/live");
      setNotices(res.data.notices || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      
{/* College Branding Section */}
<section className="w-full py-10 px-8 border-b border-slate-800">
  <div className="max-w-7xl mx-auto flex items-center justify-between">

    {/* Left Logo */}
    <img
      src="/assets/w_logo.png"
      alt="WIET Logo"
      className="w-24 h-24 object-contain"
    />

    {/* Center College Name */}
    <div className="text-center flex-1 px-6">
      <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
        Watumull Institute of
      </h1>

      <h2 className="text-3xl md:text-4xl font-semibold text-blue-500 whitespace-nowrap">
        Engineering & Technology
      </h2>

      <p className="mt-3 text-slate-400 text-lg">
        Official Notice Board
      </p>
    </div>

    {/* Right Logo */}
    <img
      src="/assets/hsnc.png"
      alt="HSNC Logo"
      className="w-24 h-24 object-contain"
    />

  </div>
</section>



      {/* Header */}
      <div className="py-16 text-center border-b border-slate-800">
        <h1 className="text-5xl font-bold mb-4">
          Latest Notices
        </h1>
        <p className="text-slate-400 text-lg">
          Important updates, circulars and announcements
        </p>
      </div>

      {/* Notices Section */}
      <div className="max-w-6xl mx-auto p-8">

        {notices.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">

            {notices.map((notice) => (
              <div
                key={notice._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-blue-500 transition"
              >
                <h2 className="text-2xl font-bold text-white mb-3">
                  {notice.title}
                </h2>

                <p className="text-slate-300 mb-4 leading-7">
                  {notice.description}
                </p>

                <p className="text-sm text-slate-400 mb-2">
                  Posted: {new Date(notice.createdAt).toLocaleDateString()}
                </p>

                <p className="text-sm text-slate-400 mb-4">
                  Due Date: {new Date(notice.due_date).toLocaleDateString()}
                </p>

                {notice.pdf && (
                  <a
                    href={`http://localhost:5000/${notice.pdf}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
                  >
                    View PDF
                  </a>
                )}
              </div>
            ))}

          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-xl">
            No active notices available.
          </div>
        )}

      </div>
    </div>
  );
};

export default Notices;

