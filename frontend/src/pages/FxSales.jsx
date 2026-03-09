import { toast, Toaster } from "react-hot-toast";
import { useState } from "react";

export default function FxSales() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("NGN");
  const [amount, setAmount] = useState("");

  const submit = (e) => {
    e.preventDefault();
    toast.success(`FX exchange requested: ${amount} ${from} → ${to}`);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <Toaster position="top-right" />
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">FX Sales</h1>
        <p className="text-slate-400 text-sm mt-1">Swap currencies inside SwissBankasi (simulation).</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <option>USD</option><option>EUR</option><option>GBP</option><option>NGN</option>
            </select>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="p-3 rounded-xl bg-slate-800 border border-slate-700">
              <option>NGN</option><option>USD</option><option>EUR</option><option>GBP</option>
            </select>
          </div>

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
            placeholder="Amount"
            required
          />

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 transition rounded-xl p-3 font-semibold">
            Exchange
          </button>
        </form>
      </div>
    </div>
  );
}
