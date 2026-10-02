import { useState } from "react";

const NSS = () => {
  const [activities, setActivities] = useState([
    {
      title: "Tree Plantation Drive",
      date: "12 July 2026",
      volunteers: 42,
      status: "Completed"
    },
    {
      title: "Blood Donation Camp",
      date: "25 July 2026",
      volunteers: 60,
      status: "Upcoming"
    }
  ]);

  const [form, setForm] = useState({
    title: "",
    date: "",
    volunteers: ""
  });

  const [certificates] = useState([
    {
      name: "Parth Shinde",
      event: "Cleanliness Drive"
    }
  ]);

  const [attendance] = useState([
    {
      student: "Parth Shinde",
      present: "Yes"
    },
    {
      student: "Afifah Walvatkar",
      present: "Yes"
    }
  ]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const addActivity = (e) => {
    e.preventDefault();

    if (!form.title || !form.date || !form.volunteers) {
      alert("Please fill all fields");
      return;
    }

    setActivities([
      ...activities,
      {
        title: form.title,
        date: form.date,
        volunteers: form.volunteers,
        status: "Upcoming"
      }
    ]);

    setForm({
      title: "",
      date: "",
      volunteers: ""
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-white shadow-2xl">
        <div className="p-8 border-b border-slate-800">
          <h1 className="text-3xl font-bold tracking-wide">
            NSS Portal
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            National Service Scheme Unit
          </p>
        </div>

        <nav className="p-6 space-y-4">
          {["Dashboard", "Activities", "Attendance", "Certificates"].map(
            (item, index) => (
              <button
                key={index}
                className={`w-full text-left px-5 py-4 rounded-xl transition-all ${
                  index === 0
                    ? "bg-orange-600 shadow-lg"
                    : "hover:bg-slate-800"
                }`}
              >
                {item}
              </button>
            )
          )}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10">

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8 mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-800">
              NSS Dashboard
            </h2>
            <p className="text-slate-500 mt-2">
              Manage activities, volunteers, attendance and certificates.
            </p>
          </div>

          <div className="px-6 py-3 rounded-full bg-orange-100 text-orange-700 font-semibold">
            Unit Active
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Activities", value: activities.length },
            { title: "Volunteers", value: 102 },
            { title: "Certificates", value: certificates.length },
            { title: "Attendance", value: attendance.length }
          ].map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-md border border-slate-200 p-6"
            >
              <p className="text-slate-500">{card.title}</p>
              <h3 className="text-4xl font-bold text-slate-800 mt-4">
                {card.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Add Activity */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8 mb-10">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Create New Activity
          </h3>

          <form
            onSubmit={addActivity}
            className="grid md:grid-cols-3 gap-5"
          >
            <input
              type="text"
              name="title"
              placeholder="Activity Title"
              value={form.title}
              onChange={handleChange}
              className="p-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 placeholder-slate-400"
            />

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="p-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
            />

            <input
              type="number"
              name="volunteers"
              placeholder="Expected Volunteers"
              value={form.volunteers}
              onChange={handleChange}
              className="p-4 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 placeholder-slate-400"
            />

            <button
              type="submit"
              className="md:col-span-3 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-semibold transition"
            >
              Add Activity
            </button>
          </form>
        </div>

        {/* Activities Table */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8 mb-10">
          <h3 className="text-2xl font-bold mb-6 text-slate-800">
            NSS Activities
          </h3>

          <table className="w-full text-slate-700">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="text-left py-4">Activity</th>
                <th className="text-left">Date</th>
                <th className="text-left">Volunteers</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((activity, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="py-5 font-medium text-slate-800">
                    {activity.title}
                  </td>
                  <td>{activity.date}</td>
                  <td>{activity.volunteers}</td>
                  <td>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        activity.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Certificates */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8 mb-10">
          <h3 className="text-2xl font-bold mb-6 text-slate-800">
            Certificate Records
          </h3>

          <table className="w-full text-slate-700">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="text-left py-4">Student Name</th>
                <th className="text-left">Event</th>
              </tr>
            </thead>

            <tbody>
              {certificates.map((cert, index) => (
                <tr key={index} className="border-b hover:bg-slate-50">
                  <td className="py-5">{cert.name}</td>
                  <td>{cert.event}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attendance */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8">
          <h3 className="text-2xl font-bold mb-6 text-slate-800">
            Volunteer Attendance
          </h3>

          <table className="w-full text-slate-700">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="text-left py-4">Student</th>
                <th className="text-left">Present</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((student, index) => (
                <tr key={index} className="border-b hover:bg-slate-50">
                  <td className="py-5">{student.student}</td>
                  <td>
                    <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      {student.present}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};

export default NSS;