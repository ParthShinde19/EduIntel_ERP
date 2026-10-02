import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await API.get("/gallery/all");
      setGalleryItems(res.data || []);
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

          {/* Center Title */}
          <div className="text-center flex-1 px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Watumull Institute of
            </h1>

            <h2 className="text-2xl md:text-4xl font-semibold text-blue-500 whitespace-nowrap">
              Engineering & Technology
            </h2>

            <p className="mt-3 text-slate-400 text-lg">
              Campus Gallery & Memories
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

      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto p-8">

        {galleryItems.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">

            {galleryItems.map((item) => (
              <div
                key={item._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-blue-500 transition"
              >
                {item.image_url && (
                  <img
                    src={`http://localhost:5000/${item.image_url}`}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                )}

                <div className="p-5">
                  <h2 className="text-xl font-bold text-white mb-3">
                    {item.title}
                  </h2>

                  <p className="text-slate-300 leading-7">
                    {item.description || "No description available."}
                  </p>
                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-xl">
            No gallery items available.
          </div>
        )}

      </div>
    </div>
  );
};

export default Gallery;

