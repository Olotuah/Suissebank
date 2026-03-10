import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import MarketCharts from "../components/MarketCharts";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  PiggyBank,
  Landmark,
  TrendingUp,
  MapPin,
  Smartphone,
  RefreshCcw,
  Settings,
  Bell,
  LifeBuoy,
  ReceiptText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { getStoredUser, logout as doLogout } from "../services/authService";
import { toast, Toaster } from "react-hot-toast";
import api from "../utils/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [hideBalance, setHideBalance] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ define user ONCE
  const [user, setUser] = useState(() => getStoredUser());
  const isAdmin = !!user?.isAdmin || !!user?.admin;
  const firstName = user?.fullName?.split?.(" ")?.[0] || "there";

  const fadeIn = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  const handleLogout = () => {
    doLogout();
    toast.success("Logged out");
    navigate("/login");
  };

  const shortcuts = [
    { icon: <ArrowDownLeft size={18} />, label: "Transfer", to: "/transfer" },
    { icon: <Smartphone size={18} />, label: "Top-Up", to: "/topup" },
    { icon: <RefreshCcw size={18} />, label: "FX Sales", to: "/fx" },
    { icon: <MapPin size={18} />, label: "Near Me", to: "/near-me" },
    { icon: <ArrowUpRight size={18} />, label: "Buy Data", to: "/buy-data" },
    { icon: <CreditCard size={18} />, label: "Cards", to: "/cards" },
  ];

  // ✅ ONE function to load dashboard (used by auto refresh + manual refresh)
  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) setLoading(true);
        if (silent) setRefreshing(true);

        const [accRes, txRes] = await Promise.all([
          api.get("/accounts"),
          api.get("/transactions"),
        ]);

        setAccounts(accRes.data || []);
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error(err);

        const status = err?.response?.status;

        // ✅ if token expired, logout + redirect
        if (status === 401) {
          doLogout();
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          return;
        }

        toast.error("Failed to load dashboard data");
      } finally {
        if (!silent) setLoading(false);
        if (silent) setRefreshing(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
  const onStorage = (e) => {
    if (e.key === "user") {
      try {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      } catch {}
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, []);

  // ✅ Load once + auto refresh every 10 seconds
  useEffect(() => {
    loadDashboard({ silent: false });

    const interval = setInterval(() => {
      loadDashboard({ silent: true });
    }, 10000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const mainAccount = accounts.find((a) => a.name === "Main Account");
  const savings = accounts.find((a) => a.name === "Savings");
  const dollar = accounts.find((a) => a.name === "Dollar Wallet");

  const recentTx = transactions.slice(0, 6);

  const monthSpent = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    return transactions
      .filter((t) => {
        const d = new Date(t.timestamp || t.createdAt || Date.now());
        return d.getMonth() === m && d.getFullYear() === y && t.type === "Debit";
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const monthIncome = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();

    return transactions
      .filter((t) => {
        const d = new Date(t.timestamp || t.createdAt || Date.now());
        return d.getMonth() === m && d.getFullYear() === y && t.type === "Credit";
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.55 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {firstName} 👋</h1>
              <p className="text-slate-400">Here’s your financial overview</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                className="px-3 py-2 rounded-2xl border border-slate-700 hover:bg-slate-800 transition inline-flex items-center gap-2"
                onClick={() => toast("Notifications coming soon")}
              >
                <Bell size={18} />
                <span className="text-sm">Alerts</span>
              </button>

              {/* ✅ manual refresh */}
              <button
                onClick={() => loadDashboard({ silent: true })}
                className="px-3 py-2 rounded-2xl border border-slate-700 hover:bg-slate-800 transition inline-flex items-center gap-2"
                title="Refresh dashboard"
              >
                <RefreshCcw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="text-sm">
                  {refreshing ? "Refreshing" : "Refresh"}
                </span>
              </button>

              {/* ✅ admin button in header (cleaner than placing alone) */}
              {isAdmin && (
                <Link
                  to="/admin/transfers"
                  className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 transition"
                >
                  Admin
                </Link>
              )}

              <Link
                to="/profile"
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-2xl border border-slate-700 hover:bg-slate-800 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>


        {/* BALANCE + LIMIT ALERT */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.1, duration: 0.55 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* BALANCE CARD */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-slate-400">Total Balance</p>
                <h2 className="text-3xl font-bold">
                  {loading
                    ? "Loading..."
                    : hideBalance
                    ? "••••••••"
                    : `$${totalBalance.toLocaleString()}`}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {mainAccount ? "Main Account • Auto-updating" : "No accounts found"}
                </p>
              </div>

              <button
                onClick={() => setHideBalance((v) => !v)}
                className="p-2 rounded-full hover:bg-slate-800 transition"
                title={hideBalance ? "Show balance" : "Hide balance"}
              >
                {hideBalance ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SmallAccountCard label="Main" value={mainAccount?.balance ?? 0} hide={hideBalance} />
              <SmallAccountCard label="Savings" value={savings?.balance ?? 0} hide={hideBalance} />
              <SmallAccountCard label="Dollar" value={dollar?.balance ?? 0} hide={hideBalance} />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">

              <Link
  to="/statement"
  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-sm font-semibold"
>
  Generate Statement
</Link>
              <Link
                to="/account-details"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-sm"
              >
                View Account Details
              </Link>
              <Link
                to="/fund-account"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition text-sm"
              >
                Fund Account
              </Link>
            </div>
          </div>

          {/* LIMIT CARD */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/25 to-rose-500/25 border border-amber-400/30 shadow-xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Need Higher Limits?</h3>
                <p className="text-sm text-slate-200/80 mt-1">
                  Adjust limits in your profile settings.
                </p>
              </div>
              <Settings className="opacity-80" />
            </div>

            <Link
              to="/profile?tab=limits"
              className="inline-flex items-center justify-center bg-white text-slate-900 hover:bg-slate-200 px-4 py-2 rounded-2xl transition text-sm font-semibold"
            >
              Adjust Limits
            </Link>

            <div className="pt-2 text-xs text-slate-200/80 space-y-1">
              <p>• Daily limit: Unlimited</p>
              <p>• Single transfer: Unlimited</p>
              <p>• Upgrade your profile for more</p>
            </div>
          </div>
        </motion.div>

        {/* TOP METRICS STRIP */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.05, duration: 0.55 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="This Month Income" value={hideBalance ? "••••" : `$${monthIncome.toLocaleString()}`} hint="Credits" />
            <MetricCard title="This Month Spent" value={hideBalance ? "••••" : `$${monthSpent.toLocaleString()}`} hint="Debits" />
            <MetricCard title="Security Status" value="Protected" hint="Encrypted sessions" icon={<ShieldCheck className="text-emerald-400" />} />
          </div>
        </motion.div>

        {/* SHORTCUTS */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.16, duration: 0.55 }}>
          <div className="flex items-end justify-between gap-3 mb-4">
            <h2 className="text-2xl font-bold">Shortcuts</h2>
            <p className="text-sm text-slate-400">Quick actions you’ll use daily</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {shortcuts.map((item, index) => (
              <Link key={index} to={item.to}>
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer shadow-lg hover:border-indigo-500/60 transition"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                    {item.icon}
                  </div>
                  <span className="text-sm">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ✅ ONE MarketCharts */}
        <MarketCharts />

        {/* MORE REAL BANK ACTIVITIES BELOW */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.22, duration: 0.55 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Recent Activity</h3>
                <Link to="/transactions" className="text-sm text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1">
                  View all <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-800">
                {loading ? (
                  <p className="text-slate-400 py-4">Loading transactions...</p>
                ) : recentTx.length === 0 ? (
                  <p className="text-slate-400 py-4">No transactions yet.</p>
                ) : (
                  recentTx.map((t) => (
                    <div key={t._id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{t.description}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(t.timestamp || t.createdAt || Date.now()).toLocaleString()}
                          {" • "}
                          <span
  className={`capitalize ${
    String(t.status).toLowerCase() === "rejected"
      ? "text-rose-300 font-semibold"
      : "text-slate-300"
  }`}
>
  {t.status || "Completed"}
</span>
                        </p>
                      </div>

                      <div className={`font-semibold ${t.type === "Credit" ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.type === "Credit" ? "+" : "-"}${Number(t.amount || 0).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bills / Scheduled */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-6 space-y-4">
              <h3 className="text-lg font-bold">Bills & Scheduled</h3>

              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Data Subscription</p>
                  <ReceiptText size={18} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Due in 3 days</p>
                <p className="text-sm mt-2">{hideBalance ? "••••" : "$10.00"}</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Electricity</p>
                  <ReceiptText size={18} className="text-slate-300" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Due next week</p>
                <p className="text-sm mt-2">{hideBalance ? "••••" : "$25.00"}</p>
              </div>

              <Link
                to="/bills"
                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 transition py-2 text-sm font-semibold"
              >
                Manage Bills
              </Link>
            </div>
          </div>
        </motion.div>

        {/* INVESTMENTS */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.28, duration: 0.55 }}>
          <h2 className="text-2xl font-bold mb-4">Investments</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <InvestCard icon={<TrendingUp className="text-green-400" />} title="Wealth Portfolio" desc="Curated investments for long-term growth." cta="Open Account" />
            <InvestCard icon={<PiggyBank className="text-amber-300" />} title="Savings Plan" desc="Automate savings and track goals." cta="Start Saving" />
            <InvestCard icon={<Landmark className="text-sky-300" />} title="Pension" desc="Secure retirement contributions & tracking." cta="Link Accounts" />
          </div>
        </motion.div>

        {/* Support / Help Center */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.34, duration: 0.55 }}>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600/20 to-slate-900 border border-indigo-500/20 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Need help?</h3>
              <p className="text-sm text-slate-200/80">
                Visit SwissBankasi support, FAQs, or chat with an agent.
              </p>
            </div>
            <button
  onClick={() => navigate("/support")}
  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-200 transition text-sm font-semibold"
>
  <LifeBuoy size={18} />
  Support Center
</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, hint, icon }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{hint}</p>
        </div>
        {icon ? <div>{icon}</div> : null}
      </div>
    </div>
  );
}

function SmallAccountCard({ label, value, hide }) {
  return (
    <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xl font-semibold">
        {hide ? "••••" : `$${Number(value || 0).toLocaleString()}`}
      </p>
    </div>
  );
}

function InvestCard({ icon, title, desc, cta }) {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-6 space-y-3 hover:border-indigo-500/40 transition">
      {icon}
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-slate-400">{desc}</p>
      <button
        onClick={() => toast("Feature coming soon")}
        className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 transition text-sm"
      >
        {cta}
      </button>
    </div>
  );
}
