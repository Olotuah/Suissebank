import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast, Toaster } from "react-hot-toast";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { logout as doLogout } from "../services/authService";

export default function FundAccount() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const targetAccount = useMemo(
    () => accounts.find((a) => a._id === targetId),
    [accounts, targetId]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/accounts");
        const list = res.data || [];
        setAccounts(list);
        setTargetId(list?.[0]?._id || "");
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          doLogout();
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          return;
        }
        toast.error("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();

    const amt = Number(amount);
    if (!targetId) return toast.error("Pick an account to fund");
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");

    try {
      // ✅ 1) create a credit transaction (for history)
      await api.post("/transactions", {
        type: "Credit",
        amount: amt,
        description: note || `Funded ${targetAccount?.name || "account"}`,
        status: "Completed",
      });

      // ✅ 2) update account balance (needs a backend route — see note below)
      await api.post(`/accounts/${targetId}/fund`, { amount: amt });

      toast.success("Account funded successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Funding failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <Toaster position="top-right" />
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
            <ArrowLeft size={18} /> Back
          </Link>
          <h1 className="text-2xl font-bold">Fund Account</h1>
          <div />
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-6">
          {loading ? (
            <p className="text-slate-400">Loading accounts...</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Choose Account</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                >
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} (Balance: ${Number(a.balance || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300">Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                  placeholder="e.g. 500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-slate-300">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                  placeholder="e.g. Salary top-up"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 transition py-3 font-semibold inline-flex items-center justify-center gap-2"
              >
                <PlusCircle size={18} />
                Fund Now
              </button>

              <p className="text-xs text-slate-400 mt-2">
                * This is a funding flow for SwissBankasi.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
