import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../services/authService";
import { toast, Toaster } from "react-hot-toast";
import { ShieldCheck, CreditCard, LineChart, Lock } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password }); // ✅ stores token + user
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen font-manrope">
      <Toaster position="top-right" />

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/10">
        <h1 className="text-2xl font-bold">SwissBankasi</h1>
        <div className="space-x-6 hidden md:block">
          <a href="#" className="hover:text-blue-400">Personal</a>
          <a href="#" className="hover:text-blue-400">Business</a>
          <a href="#" className="hover:text-blue-400">Invest</a>
          <a href="#" className="hover:text-blue-400">Loans</a>
          <Link to="/register" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition">
            Open Account
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="grid md:grid-cols-2 gap-12 px-8 py-20 items-center">
        {/* LEFT SIDE */}
        <div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Banking Without Limits.
          </h2>

          <p className="text-gray-400 text-lg mb-8">
            Experience next-generation digital banking with real-time internal transfers,
            intelligent fraud monitoring, and complete financial control.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-green-400" />
              <span>256-bit Encryption & Fraud Detection</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="text-blue-400" />
              <span>Virtual Cards & Multi-Currency Wallets</span>
            </div>
            <div className="flex items-center gap-3">
              <LineChart className="text-purple-400" />
              <span>Smart Spending Analytics</span>
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <Link
              to="/register"
              className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Open Account
            </Link>
            <button className="border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* RIGHT SIDE LOGIN CARD */}
        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-white/10">
          <h3 className="text-3xl font-semibold mb-6 text-center">Secure Login</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-lg bg-white/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
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
            Secured & Encrypted
          </div>
        </div>
      </section>

      {/* FINANCIAL PRODUCTS SECTION */}
      <section className="px-8 py-16 bg-gray-900">
        <h3 className="text-3xl font-bold text-center mb-12">
          Financial Solutions Built for You
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:scale-105 transition">
            <h4 className="text-xl font-semibold mb-2">Personal Banking</h4>
            <p className="text-gray-400">
              Manage savings, transfers, and daily spending with ease.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:scale-105 transition">
            <h4 className="text-xl font-semibold mb-2">Business Accounts</h4>
            <p className="text-gray-400">
              Corporate financial tools for scaling modern enterprises.
            </p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:scale-105 transition">
            <h4 className="text-xl font-semibold mb-2">Smart Investments</h4>
            <p className="text-gray-400">
              Simulated investment insights and portfolio tracking.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-10 border-t border-white/10 text-gray-500 text-sm text-center">
        © {new Date().getFullYear()} SwissBankasi. All rights reserved.
      </footer>
    </div>
  );
}
