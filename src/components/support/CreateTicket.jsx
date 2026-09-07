import React, { useState } from "react";
import {
  X,
  Send,
  Ticket,
  AlertCircle,
} from "lucide-react";

const CreateTicket = ({ onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    issueType: "",
    subject: "",
    description: "",
    priority: "MEDIUM",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.issueType ||
      !form.subject.trim() ||
      !form.description.trim()
    ) {
      return;
    }

    await onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-3 py-4 sm:p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[95vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
              <Ticket
                size={18}
                className="text-slate-700 dark:text-slate-300"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                Raise a Support Ticket
              </h2>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tell us what you need help with.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(95vh-65px)] overflow-y-auto p-4 sm:p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Issue Type
              </label>

              <select
                name="issueType"
                value={form.issueType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800"
              >
                <option value="">Select issue</option>
                <option value="LOAN">Loan</option>
                <option value="PAYMENT">Payment</option>
                <option value="EMI">EMI</option>
                <option value="CUSTOMER">Customer</option>
                <option value="ACCOUNT">Account</option>
                <option value="DOCUMENT">Document</option>
                <option value="TECHNICAL">Technical</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Priority
              </label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Subject
            </label>

            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              maxLength={150}
              placeholder="Briefly describe your issue"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Explain the issue in detail..."
              className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800"
            />
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2.5">
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400"
            />

            <p className="text-[11px] leading-4 text-slate-500 dark:text-slate-400">
              Our support team will review your ticket and update its
              status when work begins.
            </p>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Send size={14} />

              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;