import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const Contact = () => {
  const [contact, setContact] = useState({});

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const res = await API.get("/content/contact");
      setContact(res.data || {});
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Header Section */}
      <section className="w-full py-16 px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Left Logo */}
          <img
            src="/assets/w_logo.png"
            alt="WIET Logo"
            className="w-24 h-28 object-contain"
          />

          {/* College Name */}
          <div className="text-center flex-1 px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Watumull Institute of
            </h1>

            <h2 className="text-2xl md:text-3xl font-bold text-blue-500 mt-2 whitespace-nowrap">
              Engineering & Technology
            </h2>

            <p className="mt-4 text-slate-400 text-lg">
              Reach us for any academic or administrative support
            </p>
          </div>

          {/* Right Logo */}
          <img
            src="/assets/hsnc.png"
            alt="HSNC Logo"
            className="w-24 h-28 object-contain"
          />
        </div>
      </section>

      {/* Contact Content */}
      <section className="max-w-6xl mx-auto px-8 py-16">
        <div className="bg-slate-900 rounded-3xl shadow-lg border border-slate-800 p-10">

          <h2 className="text-3xl font-bold text-white mb-8 border-b border-slate-700 pb-4">
            Contact Information
          </h2>

          <div className="space-y-8 text-lg text-slate-300">

            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Address</h3>
              <p>{contact.address || "Address not updated yet."}</p>
            </div>

            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Phone</h3>
              <p>{contact.phone || "Phone not updated yet."}</p>
            </div>

            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Email</h3>
              <p>{contact.email || "Email not updated yet."}</p>
            </div>

            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Office Hours</h3>
              <p>{contact.office_hours || "Office timings not updated yet."}</p>
            </div>

            {/* Map Section */}
            {contact.map_location && (
              <div className="mt-10">
                <h3 className="text-blue-400 font-semibold mb-4">
                  Campus Location
                </h3>

                <div className="overflow-hidden rounded-2xl border border-slate-700">
                  <iframe
                    src={contact.map_location}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    className="w-full"
                    title="Campus Location"
                  ></iframe>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;