import React, { useState } from "react";

const NoticesCMS = () => {
  const [notice, setNotice] = useState({
    title: "",
    text: "",
    dueDate: ""
  });

  const calculateExpiry = (dueDate) => {
    const date = new Date(dueDate);
    date.setHours(date.getHours() + 60);
    return date;
  };

  const handleSave = () => {
    const expiryDate = calculateExpiry(notice.dueDate);

    const finalNotice = {
      ...notice,
      expiresAt: expiryDate
    };

    console.log(finalNotice);
    alert("Notice saved with auto-expiry");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          Manage Notices
        </h1>

        <input
          type="text"
          placeholder="Notice Title"
          value={notice.title}
          onChange={(e) =>
            setNotice({ ...notice, title: e.target.value })
          }
          className="w-full p-4 mb-4 bg-white text-slate-900 border rounded-xl"
        />

        <textarea
          placeholder="Notice Content"
          value={notice.text}
          onChange={(e) =>
            setNotice({ ...notice, text: e.target.value })
          }
          className="w-full h-40 p-4 mb-4 bg-white text-slate-900 border rounded-xl"
        />

        <input
          type="file"
          accept=".pdf"
          className="w-full p-4 mb-4 bg-white text-slate-900 border rounded-xl"
        />

        <input
          type="datetime-local"
          value={notice.dueDate}
          onChange={(e) =>
            setNotice({ ...notice, dueDate: e.target.value })
          }
          className="w-full p-4 mb-4 bg-white text-slate-900 border rounded-xl"
        />

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Save Notice
        </button>
      </div>
    </div>
  );
};

export default NoticesCMS;