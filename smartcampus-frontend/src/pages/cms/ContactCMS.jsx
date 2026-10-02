import React, { useEffect, useState } from "react";
import API from "../../services/api";

const ContactCMS = () => {
  const [contactData, setContactData] = useState({
    address: "",
    phone: "",
    email: "",
    office_hours: "",
    map_location: ""
  });

  const inputStyle =
    "w-full p-4 bg-white text-slate-900 placeholder-slate-500 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500";

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const res = await API.get("/content/contact");

      setContactData({
        address: res.data.address || "",
        phone: res.data.phone || "",
        email: res.data.email || "",
        office_hours: res.data.office_hours || "",
        map_location: res.data.map_location || ""
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setContactData({
      ...contactData,
      [e.target.name]: e.target.value
    });
  };

  const saveContact = async () => {
    try {
      await API.post("/content/contact", contactData);

      alert("Contact details updated successfully");
    } catch (err) {
      console.log(err);
      alert("Failed to update contact details");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="bg-white p-8 rounded-2xl shadow-md">

        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Manage Contact Information
        </h1>

        <textarea
          name="address"
          value={contactData.address}
          onChange={handleChange}
          placeholder="College Address"
          className={`${inputStyle} h-32`}
        />

        <input
          type="text"
          name="phone"
          value={contactData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className={`${inputStyle} mt-4`}
        />

        <input
          type="email"
          name="email"
          value={contactData.email}
          onChange={handleChange}
          placeholder="Official Email Address"
          className={`${inputStyle} mt-4`}
        />

        <input
          type="text"
          name="office_hours"
          value={contactData.office_hours}
          onChange={handleChange}
          placeholder="Office Hours"
          className={`${inputStyle} mt-4`}
        />

        <input
          type="text"
          name="map_location"
          value={contactData.map_location}
          onChange={handleChange}
          placeholder="Paste Google Maps Embed Link / GPS Location URL"
          className={`${inputStyle} mt-4`}
        />

        <button
          onClick={saveContact}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
        >
          Save Contact Details
        </button>

      </div>
    </div>
  );
};

export default ContactCMS;