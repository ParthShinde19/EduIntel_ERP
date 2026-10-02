import React, { useState, useEffect } from "react";
import API from "../../services/api";

const GalleryCMS = () => {
  const [galleryData, setGalleryData] = useState({
    title: "",
    description: "",
    image: null
  });

  const [gallery, setGallery] = useState([]);

  const fetchGallery = async () => {
    const res = await API.get("/gallery/all");
    setGallery(res.data);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const uploadGallery = async () => {
    const formData = new FormData();

    formData.append("title", galleryData.title);
    formData.append("description", galleryData.description);
    formData.append("image", galleryData.image);

    await API.post("/gallery/upload", formData);

    fetchGallery();
  };

  const deleteGallery = async (id) => {
    await API.delete(`/gallery/delete/${id}`);
    fetchGallery();
  };

  return (
    <div className="p-8">
      <div className="bg-white p-8 rounded-2xl shadow-md">

        <input
          type="text"
          placeholder="Event Name"
          className="w-full p-4 text-black border rounded-xl"
          onChange={(e) =>
            setGalleryData({
              ...galleryData,
              title: e.target.value
            })
          }
        />

        <textarea
          placeholder="Event Description"
          className="w-full mt-4 h-40 p-4 text-black border rounded-xl"
          onChange={(e) =>
            setGalleryData({
              ...galleryData,
              description: e.target.value
            })
          }
        />

        <input
          type="file"
          className="w-full mt-4 text-black"
          onChange={(e) =>
            setGalleryData({
              ...galleryData,
              image: e.target.files[0]
            })
          }
        />

        <button
          onClick={uploadGallery}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Upload Gallery
        </button>

      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {gallery.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow-md">

            <img
              src={`http://localhost:5000/${item.image_url}`}
              alt={item.title}
              className="w-full h-56 object-cover"
            />

            <div className="p-4">
              <h3 className="text-black font-bold">{item.title}</h3>
              <p className="text-slate-700">{item.description}</p>

              <button
                onClick={() => deleteGallery(item._id)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-xl"
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryCMS;