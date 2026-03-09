import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../services/authService";
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

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed. Check your credentials.");
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
            to="/register"
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Open Account
          </Link>
        </div>
      </nav>

      <section className="grid md:grid-cols-2 gap-12 px-8 py-20 items-center">
        {/* LEFT */}
        <div>
          <h2 className="text-5xl font-bold leading-tight mb-6 font-heading">
            Banking Without Limits.
          </h2>

          <p className="text-gray-400 text-lg mb-8">
            Experience a next-generation demo banking interface with internal transfers,
            account dashboards, statements, and financial controls.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-green-400" />
              <span>Secure demo authentication flow</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="text-blue-400" />
              <span>Virtual account and wallet experience</span>
            </div>
            <div className="flex items-center gap-3">
              <LineChart className="text-purple-400" />
              <span>Statement previews and smart banking dashboard</span>
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
            Secure Login
          </h3>
          <p className="text-sm text-center text-gray-400 mb-6">
            Access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => toast("Forgot password flow coming soon")}
                className="text-sm text-blue-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 font-semibold"
            >
              {loading ? "Authenticating..." : "Log In"}
            </button>
          </form>

          <p className="text-sm text-center mt-5 text-gray-400">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:underline">
              Register
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
