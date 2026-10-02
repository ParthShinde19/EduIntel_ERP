import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admission_admin"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/admin/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      const role = res.data.role;

      if (role === "super_admin") navigate("/admin-dashboard");
      else if (role === "admission_admin") navigate("/admission-dashboard");
      else if (role === "library_admin") navigate("/library-dashboard");
      else if (role === "nss_admin") navigate("/nss-dashboard");
      else if (role === "placement_admin") navigate("/placement-dashboard");
      else if (role === "placement_student") navigate("/placement-portal");
      else if (role === "exam_admin") navigate("/exam-dashboard");
      else if (role === "teacher") navigate("/teacher-dashboard");
      else navigate("/");

    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">
          Login Portal
        </h1>

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded-lg bg-slate-800"
        >
          <option value="super_admin">Super Admin</option>
          <option value="admission_admin">Admission Admin</option>
          <option value="exam_admin">Exam Admin (Department)</option>
          <option value="teacher">Faculty / Teacher</option>
          <option value="library_admin">Library Admin</option>
          <option value="nss_admin">NSS Admin</option>
          <option value="placement_admin">Placement Admin</option>
          <option value="placement_student">Placement Student</option>
        </select>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded-lg bg-slate-800"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-6 p-3 rounded-lg bg-slate-800"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;