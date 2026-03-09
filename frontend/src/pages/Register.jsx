import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { register } from "../services/authService";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(form); // ✅ uses authService (stores token + user)
      toast.success("Registration successful!");
      navigate("/login"); // ✅ take user straight inside
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white font-sans px-4">
      <Toaster position="top-right" />

      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-8 rounded-xl space-y-4 w-full max-w-md border border-white/10 shadow-xl"
      >
       <h2 className="text-3xl font-heading font-bold">Register for SwissBankasi</h2>
       <p className="text-sm text-gray-300 font-sans font-normal">
        Create an account to access your dashboard.
       </p>

        <input
          type="text"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-600"
          required
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-600"
          required
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-3 rounded bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-600"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-heading font-semibold disabled:opacity-60 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
