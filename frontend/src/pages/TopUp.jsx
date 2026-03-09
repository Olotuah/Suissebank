import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function TopUp() {
  const [amount, setAmount] = useState("");

  const submit = (e) => {
    e.preventDefault();
    toast.success(`Top-Up initiated for $${amount || 0}`);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <Toaster position="top-right" />
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">Top-Up</h1>
        <p className="text-slate-400 text-sm mt-1">Add money to your SwissBankasi account (simulation).</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700"
            placeholder="Enter amount"
            required
          />
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 transition rounded-xl p-3 font-semibold">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
