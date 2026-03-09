// src/pages/Transfer.jsx
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CreditCard,
  Loader2,
  Lock,
  Send,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import api from "../utils/api";

export default function Transfer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fromAccount: "Main Account",
    toAccount: "",
    amount: "",
    note: "",
  });

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ me state (from backend)
  const [me, setMe] = useState(null);

  // ✅ cached user state (from localStorage) — used as fallback
  const [storedUser, setStoredUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // ✅ derived pin flag (for UI hints)
  const hasTransferPin = !!(me?.hasTransferPin || storedUser?.hasTransferPin);

  // ✅ PIN modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");

  // ✅ no pin prompt modal
  const [showNoPinModal, setShowNoPinModal] = useState(false);

  const [successState, setSuccessState] = useState(null); // null | "pending"

  // ✅ load accounts
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/accounts");
        setAccounts(res.data || []);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load accounts");
      }
    };
    load();
  }, []);

  // ✅ helper: refresh user from backend + localStorage
  const refreshUser = async () => {
    // 1) refresh localStorage snapshot
    try {
      const raw = localStorage.getItem("user");
      setStoredUser(raw ? JSON.parse(raw) : null);
    } catch {}

    // 2) refresh from backend
    try {
      const res = await api.get("/users/me", {
        headers: { "Cache-Control": "no-cache" },
      });

      // support both {user: {...}} or {...}
      const data = res.data?.user ? res.data.user : res.data;

      setMe(data || null);

      // keep localStorage synced
      if (data) {
        const currentRaw = localStorage.getItem("user");
        const current = currentRaw ? JSON.parse(currentRaw) : {};
        const merged = { ...current, ...data };
        localStorage.setItem("user", JSON.stringify(merged));
        setStoredUser(merged);
      }

      return data || null;
    } catch (e) {
      return null;
    }
  };

  // ✅ load current user on mount
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ refresh when user returns to tab (after setting pin in Profile)
  useEffect(() => {
    const onFocus = () => refreshUser();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ refresh when localStorage changes (another tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "user") {
        try {
          setStoredUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fromAccountObj = useMemo(() => {
    return accounts.find((a) => a.name === form.fromAccount);
  }, [accounts, form.fromAccount]);

  const availableBalance = Number(fromAccountObj?.balance || 0);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateBeforeAuth = () => {
    const to = form.toAccount.trim();
    const amt = Number(form.amount);

    if (!to) return "Recipient is required.";
    if (!amt || amt <= 0) return "Enter a valid amount.";
    if (amt > availableBalance) return "Insufficient balance in selected account.";

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
    const isAcct = /^[A-Za-z0-9\-]{6,30}$/.test(to);
    if (!isEmail && !isAcct) return "Enter a valid email or account number.";

    return null;
  };

  // ✅ FIXED: do NOT use stale hasTransferPin after awaiting refreshUser
  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validateBeforeAuth();
    if (err) return toast.error(err);

    // 🔥 get fresh server truth
    const latest = await refreshUser();

    const pinExists =
      !!latest?.hasTransferPin ||
      !!storedUser?.hasTransferPin ||
      !!me?.hasTransferPin;

    if (!pinExists) {
      setShowNoPinModal(true);
      return;
    }

    setShowPinModal(true);
  };

  const verifyPinAndSubmit = async () => {
  if (submitting || loading) return; // ✅ hard block double clicks

  const pin = pinInput.trim();
  if (!/^\d{4}$/.test(pin) && !/^\d{6}$/.test(pin)) {
    toast.error("Enter your 4 or 6 digit transfer PIN.");
    return;
  }

  setSubmitting(true);
  setLoading(true);

  try {
    await api.post("/users/verify-pin", { pin });

    await api.post("/transfers", {
      fromAccountName: form.fromAccount,
      toAccount: form.toAccount.trim(),
      amount: Number(form.amount),
      note: form.note?.trim(),
    });

    setShowPinModal(false);
    setPinInput("");
    setForm({ fromAccount: "Main Account", toAccount: "", amount: "", note: "" });

    try {
      const res = await api.get("/accounts");
      setAccounts(res.data || []);
    } catch {}

    setSuccessState("pending");
    toast.success("Transfer submitted!");
    setTimeout(() => navigate("/dashboard"), 1200);
  } catch (error) {
    console.error(error);
    toast.error(error?.response?.data?.message || "Transfer failed");
  } finally {
    setLoading(false);
    setSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <Toaster position="top-right" />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 w-[92%] max-w-sm text-center">
            <Loader2 className="animate-spin mx-auto mb-3" />
            <p className="text-lg font-semibold">Processing transfer…</p>
            <p className="text-sm text-slate-400 mt-1">Please don’t close this page</p>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {successState === "pending" && (
        <div className="fixed inset-0 bg-emerald-600/90 flex items-center justify-center z-50">
          <div className="text-center px-6">
            <BadgeCheck className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Transfer Submitted</h2>
            <p className="text-sm mt-2 opacity-95">
              Status: <span className="font-semibold">PENDING APPROVAL</span>
            </p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <Link to="/dashboard" className="text-sm text-slate-300 hover:text-white transition">
            SwissBankasi Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Transfer Funds</h1>
              <p className="text-slate-400 mt-1">
                Send money to another SwissBankasi user by{" "}
                <span className="text-slate-200">account number</span> or{" "}
                <span className="text-slate-200">email</span>.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800/60 border border-slate-700 px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="text-emerald-400" size={18} />
                <span className="font-semibold">Secure Transfer</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <Lock size={14} />
                PIN verification enabled
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">From account</label>
                  <select
                    name="fromAccount"
                    value={form.fromAccount}
                    onChange={handleChange}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Main Account</option>
                    <option>Savings</option>
                    <option>Dollar Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Available balance</label>
                  <div className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700">
                    <span className="text-lg font-semibold">
                      ${availableBalance.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">({form.fromAccount})</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Recipient (Account number or email)
                </label>
                <div className="flex items-center gap-2 w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                  <Building2 className="text-slate-400" size={18} />
                  <input
                    type="text"
                    name="toAccount"
                    value={form.toAccount}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none"
                    placeholder="e.g. SB123456 or user@email.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Amount (USD)</label>
                  <div className="flex items-center gap-2 w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500">
                    <CreditCard className="text-slate-400" size={18} />
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      className="w-full bg-transparent outline-none"
                      placeholder="Enter amount"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Note (optional)</label>
                  <input
                    type="text"
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Rent, Gift, School fees"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold p-3 rounded-2xl disabled:opacity-60"
                disabled={loading}
              >
                <Send size={18} />
                Continue
              </button>
            </form>
          </div>

          {/* Side Panel */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-bold">Transfer Summary</h3>

            <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4 space-y-2">
              <p className="text-xs text-slate-400">From</p>
              <p className="font-semibold">{form.fromAccount}</p>

              <p className="text-xs text-slate-400 pt-2">Recipient</p>
              <p className="font-semibold break-words">{form.toAccount || "—"}</p>

              <p className="text-xs text-slate-400 pt-2">Amount</p>
              <p className="font-semibold">
                {form.amount ? `$${Number(form.amount).toLocaleString()}` : "—"}
              </p>
            </div>

            {!hasTransferPin && (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-400/30 p-4">
                <p className="text-sm font-semibold text-amber-200">Transfer PIN required</p>
                <p className="text-xs text-slate-300 mt-1">
                  Set your PIN in <span className="font-semibold">Profile → Security</span> before transferring.
                </p>
                <button
                  onClick={() => navigate("/profile?tab=security")}
                  className="mt-3 w-full px-4 py-2 rounded-2xl bg-amber-400 text-slate-900 hover:bg-amber-300 transition text-sm font-semibold"
                >
                  Go to Security
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NO PIN Modal */}
      {showNoPinModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="text-amber-300" />
              <h3 className="text-xl font-bold">Set your Transfer PIN</h3>
            </div>
            <p className="text-sm text-slate-400">
              You must set a transfer PIN before you can send money.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNoPinModal(false)}
                className="px-4 py-2 rounded-2xl border border-slate-700 hover:bg-slate-800 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate("/profile?tab=security")}
                className="px-4 py-2 rounded-2xl bg-amber-400 text-slate-900 hover:bg-amber-300 transition text-sm font-semibold"
              >
                Go to Security
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="text-indigo-300" />
              <h3 className="text-xl font-bold">Enter Transfer PIN</h3>
            </div>

            <p className="text-sm text-slate-400">
              Enter your transfer PIN to authorize this transfer.
            </p>

            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter PIN"
              maxLength={6}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput("");
                }}
                className="px-4 py-2 rounded-2xl border border-slate-700 hover:bg-slate-800 transition text-sm"
              >
                Cancel
              </button>

              <button
  onClick={verifyPinAndSubmit}
  disabled={loading || submitting}
  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
>
  <BadgeCheck size={18} />
  {submitting ? "Submitting..." : "Verify & Submit"}
</button>
            </div>

            <div className="text-xs text-slate-500 pt-1 flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={16} />
              Secure verification • PIN required
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
