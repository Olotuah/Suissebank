import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Support() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Subject and message are required.");
      return;
    }

    if (sending) return;
    setSending(true);

    try {
      await api.post("/support/ticket", {
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      toast.success("Support message sent!");
      setForm({ subject: "", message: "" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <Toaster position="top-right" />

      <div className="max-w-xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-6">
        <h1 className="text-2xl font-bold">Support Center</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tell us what’s wrong and our team will respond.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            name="subject"
            value={form.subject}
            onChange={onChange}
            placeholder="Subject (e.g. Transfer pending too long)"
            className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700"
          />

          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            rows={6}
            placeholder="Describe your issue..."
            className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700"
          />

          <button
            disabled={sending}
            className="w-full p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 font-semibold"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full p-3 rounded-2xl border border-slate-700 hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </form>

        <div className="mt-6 text-xs text-slate-400">
          Or email: <span className="text-slate-200 font-semibold"></span>
        </div>
      </div>
    </div>
  );
}
