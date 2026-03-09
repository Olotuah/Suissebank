import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../services/authService";
import { toast, Toaster } from "react-hot-toast";
import {
  ShieldCheck,
  CreditCard,
  LineChart,
  Lock,
  Eye,
  EyeOff,
  BadgeAlert,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(form);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen font-sans">
      <Toaster position="top-right" />

      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold font-heading">SwissBankasi</h1>
          <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
            <BadgeAlert size={14} />
            Demo banking experience only
          </p>
        </div>

        <div className="space-x-6 hidden md:block">
          <a href="#" className="hover:text-blue-400">Personal</a>
          <a href="#" className="hover:text-blue-400">Business</a>
          <a href="#" className="hover:text-blue-400">Invest</a>
          <a href="#" className="hover:text-blue-400">Loans</a>
          <Link
            to="/login"
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </Link>
        </div>
      </nav>

      <section className="grid md:grid-cols-2 gap-12 px-8 py-20 items-center">
        {/* LEFT */}
        <div>
          <h2 className="text-5xl font-bold leading-tight mb-6 font-heading">
            Open Your Digital Banking Space.
          </h2>

          <p className="text-gray-400 text-lg mb-8">
            Create your account to explore a modern demo banking interface with
            internal transfers, statement generation, dashboards, and account controls.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-green-400" />
              <span>Secure demo authentication flow</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="text-blue-400" />
              <span>Multi-account wallet experience</span>
            </div>
            <div className="flex items-center gap-3">
              <LineChart className="text-purple-400" />
              <span>Interactive statements and dashboard previews</span>
            </div>
          </div>

          <div className="mt-10 p-4 rounded-xl bg-amber-500/10 border border-amber-400/20">
            <p className="text-sm text-amber-200 font-medium">
              Notice
            </p>
            <p className="text-sm text-slate-300 mt-1">
              SwissBankasi is a demo banking interface built for simulation,
              UI experience, and portfolio presentation. It is not a real bank.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10">
          <h3 className="text-3xl font-semibold mb-2 text-center font-heading">
            Open Account
          </h3>
          <p className="text-sm text-center text-gray-400 mb-6">
            Create your profile to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full p-4 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full p-4 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-4 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-semibold"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>

          <div className="mt-6 flex justify-center text-gray-400 text-sm items-center gap-2">
            <Lock size={16} />
            Demo • Secured & Encrypted
          </div>
        </div>
      </section>

      <footer className="px-8 py-10 border-t border-white/10 text-gray-500 text-sm text-center">
        © {new Date().getFullYear()} SwissBankasi. Demo banking experience only.
      </footer>
    </div>
  );
}
