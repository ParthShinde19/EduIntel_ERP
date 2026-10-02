import { useState } from "react";

const Placement = () => {
  const [companies, setCompanies] = useState([
    {
      name: "TCS",
      role: "Software Engineer",
      package: "7 LPA",
      status: "Open"
    },
    {
      name: "Infosys",
      role: "System Engineer",
      package: "6 LPA",
      status: "Closed"
    }
  ]);

  const [students] = useState([
    {
      name: "Parth Shinde",
      branch: "Computer Engineering",
      cgpa: "8.9"
    }
  ]);

  const [applications] = useState([
    {
      student: "Parth Shinde",
      company: "TCS",
      status: "Shortlisted"
    }
  ]);

  const [form, setForm] = useState({
    company: "",
    role: "",
    package: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const addCompany = (e) => {
    e.preventDefault();

    if (!form.company || !form.role || !form.package) {
      alert("Please fill all fields");
      return;
    }

    setCompanies([
      ...companies,
      {
        name: form.company,
        role: form.role,
        package: form.package,
        status: "Open"
      }
    ]);

    setForm({
      company: "",
      role: "",
      package: ""
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-white shadow-2xl">
        <div className="p-8 border-b border-slate-800">
          <h1 className="text-3xl font-bold tracking-wide">
            Placement Cell
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Corporate Relations Portal
          </p>
        </div>

        <nav className="p-6 space-y-4">
          {["Dashboard", "Companies", "Students", "Applications"].map(
            (item, index) => (
              <button
                key={index}
                className={`w-full text-left px-5 py-4 rounded-xl transition-all ${
                  index === 0
                    ? "bg-blue-600 shadow-lg"
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
              Placement Dashboard
            </h2>
            <p className="text-slate-500 mt-2">
              Monitor drives, recruiters and student applications.
            </p>
          </div>

          <div className="px-6 py-3 rounded-full bg-green-100 text-green-700 font-semibold">
            System Active
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Companies", value: companies.length },
            { title: "Students", value: students.length },
            { title: "Applications", value: applications.length },
            {
              title: "Open Drives",
              value: companies.filter((c) => c.status === "Open").length
            }
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

        {/* Add Drive */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8 mb-10">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Create New Placement Drive
          </h3>

          <form
            onSubmit={addCompany}
            className="grid md:grid-cols-3 gap-5"
          >
            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={form.company}
              onChange={handleChange}
              className="p-4 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="role"
              placeholder="Job Role"
              value={form.role}
              onChange={handleChange}
              className="p-4 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="package"
              placeholder="Package Offered"
              value={form.package}
              onChange={handleChange}
              className="p-4 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="md:col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition"
            >
              Create Drive
            </button>
          </form>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8 mb-10">
          <h3 className="text-2xl font-bold mb-6 text-slate-800">
            Recruiting Companies
          </h3>

          <table className="w-full text-slate-800">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="text-left py-4">Company</th>
                <th className="text-left">Role</th>
                <th className="text-left">Package</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-slate-50 text-slate-800"
                >
                  <td className="py-5 font-medium">{company.name}</td>
                  <td>{company.role}</td>
                  <td>{company.package}</td>
                  <td>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        company.status === "Open"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {company.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Students */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8 mb-10">
          <h3 className="text-2xl font-bold mb-6 text-slate-800">
            Eligible Students
          </h3>

          <table className="w-full text-slate-800">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="text-left py-4">Name</th>
                <th className="text-left">Branch</th>
                <th className="text-left">CGPA</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-slate-50 text-slate-800"
                >
                  <td className="py-5">{student.name}</td>
                  <td>{student.branch}</td>
                  <td>{student.cgpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Applications */}
        <div className="bg-white rounded-3xl shadow-md border border-slate-200 p-8">
          <h3 className="text-2xl font-bold mb-6 text-slate-800">
            Applications Status
          </h3>

          <table className="w-full text-slate-800">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="text-left py-4">Student</th>
                <th className="text-left">Company</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((app, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-slate-50 text-slate-800"
                >
                  <td className="py-5">{app.student}</td>
                  <td>{app.company}</td>
                  <td>
                    <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                      {app.status}
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

export default Placement;