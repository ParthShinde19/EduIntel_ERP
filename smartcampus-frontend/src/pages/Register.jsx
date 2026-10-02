import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "placement_student"
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // Restriction message
    if (
      value !== "placement_student" &&
      value !== "super_admin" &&
      name === "role"
    ) {
      setMessage(
        "Only Super Admin can create admin accounts."
      );
    } else {
      setMessage("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Frontend restriction
    if (
      formData.role !== "placement_student" &&
      formData.role !== "super_admin"
    ) {
      alert("Admin accounts can only be created by Super Admin.");
      return;
    }

    try {
      const res = await API.post(
        "/admin/register",
        formData
      );

      alert(res.data.message);
      navigate("/login");

    } catch (error) {
      alert(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-slate-900 p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-8 text-center">
          Create Account
        </h1>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded-lg bg-slate-800"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded-lg bg-slate-800"
        >
          <option value="placement_student">
            Placement Student
          </option>

          <option value="super_admin">
            Super Admin
          </option>

          <option value="admission_admin">
            Admission Admin
          </option>

          <option value="library_admin">
            Library Admin
          </option>

          <option value="nss_admin">
            NSS Admin
          </option>

          <option value="placement_admin">
            Placement Admin
          </option>
        </select>

        {message && (
          <p className="text-red-400 mb-4 text-sm">
            {message}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full mb-4 p-3 rounded-lg bg-slate-800"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full mb-6 p-3 rounded-lg bg-slate-800"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 p-3 rounded-lg font-semibold"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;