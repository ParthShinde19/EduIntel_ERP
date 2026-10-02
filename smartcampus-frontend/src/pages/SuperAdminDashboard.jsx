import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
const [contentOpen, setContentOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admission_admin"
  });

  const [contentForm, setContentForm] = useState({
    about: "",
    principalDesk: "",
    notice: "",
    event: "",
    gallery: "",
    contact: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchAdmins = async () => {
    try {
      const res = await API.get("/admin/admins");
      setAdmins(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleContentChange = (e) => {
    setContentForm({
      ...contentForm,
      [e.target.name]: e.target.value
    });
  };

  const createAdmin = async (e) => {
    e.preventDefault();

    try {
      await API.post("/admin/create-admin", form);

      alert("Admin created successfully");

      setForm({
        name: "",
        email: "",
        password: "",
        role: "admission_admin"
      });

      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating admin");
    }
  };

  const deleteAdmin = async (id) => {
  try {
    await API.delete(`/admin/delete-admin/${id}`);

    alert("Admin deleted successfully");

    fetchAdmins();
  } catch (err) {
    alert(err.response?.data?.message || "Error deleting admin");
  }
};

  const saveWebsiteContent = async (e) => {
    e.preventDefault();

    try {
      await API.post("/content/save", contentForm);
      alert("Website content updated successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const inputStyle =
  "w-full p-4 bg-white text-slate-800 placeholder:text-slate-500 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  return (
    <div className="min-h-screen bg-slate-100 flex">

      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-white p-6 shadow-xl">

        <div className="flex items-center gap-4 mb-10">
         <img
  src="/assets/w_logo.png"
  alt="WIET Logo"
  className="w-20 h-24 object-contain"
/>
          <div>
            <h1 className="font-bold text-sm leading-tight">
              WATUMULL INSTITUTE
            </h1>
            <p className="text-xs text-slate-400">
              OF ENGINEERING & TECHNOLOGY
            </p>
          </div>
        </div>

        <nav className="space-y-4">
  <button
    onClick={() => setActiveTab("dashboard")}
className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
  activeTab === "dashboard"
    ? "bg-blue-600 text-white"
    : "text-slate-300 hover:bg-slate-800 hover:text-white"
}`}  >
    Dashboard
  </button>

  <button
    onClick={() => setActiveTab("admins")}
    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
  activeTab === "admins"
    ? "bg-blue-600 text-white"
    : "text-slate-300 hover:bg-slate-800 hover:text-white"
}`}
  >
    Manage Admins
  </button>

  <div>
    <button
      onClick={() => setContentOpen(!contentOpen)}
      className="w-full flex justify-between items-center px-4 py-3 rounded-lg hover:bg-slate-800 transition"
    >
      <span>Website Content</span>
      <span>{contentOpen ? "▼" : "▶"}</span>
    </button>

    {contentOpen && (
      <div className="ml-4 mt-2 space-y-2 border-l border-slate-700 pl-4">
        <button
          onClick={() => navigate("/content-management/about")}
          className="block w-full text-left py-2 text-slate-300 hover:text-white"
        >
          About
        </button>

        <button
          onClick={() => navigate("/content-management/principal-desk")}
          className="block w-full text-left py-2 text-slate-300 hover:text-white"
        >
          Principal Desk
        </button>

        <button
          onClick={() => navigate("/content-management/notices")}
          className="block w-full text-left py-2 text-slate-300 hover:text-white"
        >
          Notices
        </button>

        <button
          onClick={() => navigate("/content-management/events")}
          className="block w-full text-left py-2 text-slate-300 hover:text-white"
        >
          Events
        </button>

        <button
          onClick={() => navigate("/content-management/gallery")}
          className="block w-full text-left py-2 text-slate-300 hover:text-white"
        >
          Gallery
        </button>

        <button
          onClick={() => navigate("/content-management/calendar")}
          className="block w-full text-left py-2 text-slate-300 hover:text-white"
        >
          Academic Calendar
        </button>

        <button
          onClick={() => navigate("/content-management/contact")}
          className="block w-full text-left py-2 text-slate-300 hover:text-white"
        >
          Contact
        </button>

        <button
          onClick={() => navigate("/content-management/settings")}
          className="block w-full text-left py-2 text-slate-300 hover:text-white"
        >
          Settings
        </button>
      </div>
    )}
  </div>

  <button
    onClick={() => setActiveTab("logs")}
    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
  activeTab === "logs"
    ? "bg-blue-600 text-white"
    : "text-slate-300 hover:bg-slate-800 hover:text-white"
}`}
  >
    System Logs
  </button>

  <button
    onClick={() => setActiveTab("settings")}
   className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
  activeTab === "settings"
    ? "bg-blue-600 text-white"
    : "text-slate-300 hover:bg-slate-800 hover:text-white"
}`}
  >
    Settings
  </button>
</nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">

        {/* Topbar */}
        <div className="bg-white rounded-2xl shadow-md px-8 py-5 mb-8 flex justify-between items-center">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Super Admin Dashboard
            </h2>
            <p className="text-slate-500">
              Smart Campus Central Management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <h4 className="font-semibold text-slate-800">
                {user?.name || "Super Admin"}
              </h4>
              <p className="text-sm text-slate-500">
                {user?.email}
              </p>
            </div>

            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || "S"}
            </div>
          </div>

        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-slate-500">Total Admins</h3>
              <p className="text-3xl font-bold mt-2 text-slate-800">{admins.length}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-slate-500">Departments</h3>
             <p className="text-3xl font-bold mt-2 text-slate-800">4</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h3 className="text-slate-500">System Status</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                Active
              </p>
            </div>
          </div>
        )}

        {/* Manage Admins */}
        {activeTab === "admins" && (
          <>
            <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <h3 className="text-xl font-semibold mb-6 text-slate-800">
                Create New Admin
              </h3>

              <form
                onSubmit={createAdmin}
                className="grid md:grid-cols-2 gap-5"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputStyle}
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  className={inputStyle}
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Temporary Password"
                    value={form.password}
                    onChange={handleChange}
                    className={inputStyle}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                   className={`${inputStyle} text-slate-800`}
                >
                  <option value="admission_admin">Admission Admin</option>
                  <option value="exam_admin">Exam Admin (Department)</option>
                  <option value="teacher">Faculty / Teacher</option>
                  <option value="library_admin">Library Admin</option>
                  <option value="nss_admin">NSS Admin</option>
                  <option value="placement_admin">Placement Admin</option>
                </select>

                <button className="md:col-span-2 bg-blue-600 text-white py-4 rounded-xl">
                  Create Administrator
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8">
  <h3 className="text-xl font-semibold mb-6 text-slate-800">
    Registered Administrators
  </h3>

  <div className="overflow-x-auto">
    <table className="w-full border-collapse">

      <thead>
        <tr className="border-b border-slate-300 text-slate-700">
          <th className="py-4 text-left">Name</th>
          <th className="py-4 text-left">Email</th>
          <th className="py-4 text-left">Role</th>
          <th className="py-4 text-left">Action</th>
        </tr>
      </thead>

      <tbody>
        {admins.length > 0 ? (
          admins.map((admin) => (
            <tr
              key={admin._id}
              className="border-b border-slate-200 hover:bg-slate-50 transition"
            >
              <td className="py-4 font-medium text-slate-900">
                {admin.name}
              </td>

              <td className="py-4 text-slate-700">
                {admin.email}
              </td>

              <td className="py-4">
                <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium capitalize">
                  {admin.role.replace(/_/g, " ")}
                </span>
              </td>

              <td className="py-4">
                <button
                  onClick={() => deleteAdmin(admin._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="4"
              className="text-center py-6 text-slate-500"
            >
              No admins found
            </td>
          </tr>
        )}
      </tbody>

    </table>
  </div>
</div>
          </>
        )}

        {/* Website Content */}
        {activeTab === "content" && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-xl font-semibold mb-6">
              Manage Homepage Content
            </h3>

            <form onSubmit={saveWebsiteContent} className="space-y-5">
              {Object.keys(contentForm).map((field) => (
                <textarea
                  key={field}
                  name={field}
                  value={contentForm[field]}
                  onChange={handleContentChange}
                  placeholder={field}
                  className={inputStyle}
                />
              ))}

              <button className="bg-green-600 text-white px-8 py-3 rounded-xl">
                Save Content
              </button>
            </form>
          </div>
        )}

        {/* Logs */}
        {activeTab === "logs" && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-xl font-bold mb-4">System Logs</h3>
            <p className="text-slate-500">
              Activity logs will appear here.
            </p>
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-xl font-bold mb-4">Settings</h3>
            <p className="text-slate-500">
              Configure system-wide settings here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;