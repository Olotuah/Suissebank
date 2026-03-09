import { useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { ArrowLeft, FileText, Download, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Statement() {
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const todayStr = today.toISOString().split("T")[0];
  const firstDayOfMonthStr = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const [form, setForm] = useState({
    from: firstDayOfMonthStr,
    to: todayStr,
    accountName: "",
  });

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const setPresetRange = (preset) => {
    const now = new Date();
    let fromDate;

    if (preset === "7d") {
      fromDate = new Date();
      fromDate.setDate(now.getDate() - 7);
    } else if (preset === "30d") {
      fromDate = new Date();
      fromDate.setDate(now.getDate() - 30);
    } else if (preset === "3m") {
      fromDate = new Date();
      fromDate.setMonth(now.getMonth() - 3);
    } else if (preset === "1y") {
      fromDate = new Date(now.getFullYear(), 0, 1);
    } else {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    setForm((prev) => ({
      ...prev,
      from: fromDate.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    }));
  };

  const validateDates = () => {
    if (!form.from || !form.to) {
      toast.error("Please select both from and to dates.");
      return false;
    }

    if (form.from > form.to) {
      toast.error("From date cannot be later than To date.");
      return false;
    }

    return true;
  };

  const buildParams = () => {
    const params = new URLSearchParams({
      from: form.from,
      to: form.to,
    });

    if (form.accountName) {
      params.append("accountName", form.accountName);
    }

    return params;
  };

  const fetchPreview = async () => {
    if (!validateDates()) return;

    setLoadingPreview(true);
    try {
      const params = buildParams();
      const res = await api.get(`/statements/preview?${params.toString()}`);
      setPreview(res.data);
      toast.success("Statement preview loaded");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const generatePdf = async () => {
    if (!validateDates()) return;

    setLoadingPdf(true);
    try {
      const params = buildParams();

      const res = await api.get(`/statements/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `SwissBankasi-statement-${form.from}-${form.to}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Statement downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate statement PDF");
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT PANEL */}
          <div className="xl:col-span-1 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <FileText className="text-indigo-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Statement of Account</h1>
                <p className="text-slate-400 text-sm">
                  Preview and download your SwissBankasi statement.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPresetRange("7d")}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm"
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setPresetRange("30d")}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm"
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => setPresetRange("3m")}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm"
              >
                Last 3 Months
              </button>
              <button
                type="button"
                onClick={() => setPresetRange("1y")}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm"
              >
                This Year
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">From Date</label>
                <input
                  type="date"
                  name="from"
                  value={form.from}
                  onChange={handleChange}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">To Date</label>
                <input
                  type="date"
                  name="to"
                  value={form.to}
                  onChange={handleChange}
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Account Scope (optional)
              </label>
              <select
                name="accountName"
                value={form.accountName}
                onChange={handleChange}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700"
              >
                <option value="">All Accounts</option>
                <option value="Main Account">Main Account</option>
                <option value="Savings">Savings</option>
                <option value="Dollar Wallet">Dollar Wallet</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
              <button
                onClick={fetchPreview}
                disabled={loadingPreview}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 transition text-white font-semibold p-3 rounded-2xl disabled:opacity-60"
              >
                <Search size={18} />
                {loadingPreview ? "Loading Preview..." : "Preview Statement"}
              </button>

              <button
                onClick={generatePdf}
                disabled={loadingPdf}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold p-3 rounded-2xl disabled:opacity-60"
              >
                <Download size={18} />
                {loadingPdf ? "Generating PDF..." : "Download Statement PDF"}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="xl:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8">
            {!preview ? (
              <div className="h-full min-h-[400px] flex items-center justify-center text-center text-slate-400">
                <div>
                  <FileText className="mx-auto mb-3 text-slate-500" size={40} />
                  <p className="text-lg font-semibold text-slate-300">No preview loaded yet</p>
                  <p className="text-sm mt-1">
                    Select your date range and click <span className="font-semibold">Preview Statement</span>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SummaryCard
                    title="Opening Balance"
                    value={formatCurrency(preview.openingBalance)}
                  />
                  <SummaryCard
                    title="Total Credits"
                    value={formatCurrency(preview.totalCredits)}
                  />
                  <SummaryCard
                    title="Total Debits"
                    value={formatCurrency(preview.totalDebits)}
                  />
                  <SummaryCard
                    title="Closing Balance"
                    value={formatCurrency(preview.closingBalance)}
                  />
                </div>

                {/* META */}
                <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4 text-sm text-slate-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <p>
                      <span className="text-slate-400">Account Holder:</span>{" "}
                      <span className="font-semibold">{preview.user?.fullName || "N/A"}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Email:</span>{" "}
                      <span className="font-semibold">{preview.user?.email || "N/A"}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Account Number:</span>{" "}
                      <span className="font-semibold">{preview.user?.accountNumber || "N/A"}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Scope:</span>{" "}
                      <span className="font-semibold">{preview.accountScope || "All Accounts"}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">From:</span>{" "}
                      <span className="font-semibold">{preview.from}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">To:</span>{" "}
                      <span className="font-semibold">{preview.to}</span>
                    </p>
                  </div>
                </div>

                {/* TABLE */}
                <div className="rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800 text-slate-300">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold min-w-[180px]">Date</th>
                          <th className="text-left px-4 py-3 font-semibold">Description</th>
                          <th className="text-left px-4 py-3 font-semibold">Account</th>
                          <th className="text-left px-4 py-3 font-semibold">Type</th>
                          <th className="text-right px-4 py-3 font-semibold">Amount</th>
                          <th className="text-right px-4 py-3 font-semibold">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.transactions?.length ? (
                          preview.transactions.map((tx) => (
                            <tr key={tx._id} className="border-t border-slate-800">
                              <td className="px-4 py-3 text-slate-300 whitespace-nowrap min-w-[180px]">
                                {formatDate(tx.timestamp)}
                              </td>
                              <td className="px-4 py-3 text-slate-200">
                                {tx.description || "-"}
                              </td>
                              <td className="px-4 py-3 text-slate-300">
                                {tx.fromAccount || "Main Account"}
                              </td>
                              <td
                                className={`px-4 py-3 font-semibold ${
                                  tx.type === "Credit" ? "text-emerald-400" : "text-rose-400"
                                }`}
                              >
                                {tx.type}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-200">
                                {tx.type === "Credit" ? "+" : "-"}
                                {formatCurrency(tx.amount)}
                              </td>
                              <td className="px-4 py-3 text-right text-slate-200 font-semibold">
                                {formatCurrency(tx.runningBalance)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                              No transactions found for the selected date range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
}

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).replace(",", "");
}
