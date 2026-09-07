const ApplicationSummary = ({
  loan,
  initialData,
  formatDate,
  formatCurrency,
}) => {
  const status = String(
    loan?.status || "PENDING"
  )
    .toUpperCase()
    .trim();

  const statusClass =
    status === "APPROVED"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      : status === "REJECTED"
      ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
      : status === "ACTIVE"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
      : status === "OVERDUE"
      ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
      : status === "COMPLETED"
      ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
      : status === "CLOSED"
      ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 dark:text-blue-400"
            >
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <rect
                width="18"
                height="18"
                x="3"
                y="4"
                rx="2"
              />
              <path d="M3 10h18" />
              <path d="M8 14h.01" />
              <path d="M12 14h.01" />
              <path d="M16 14h.01" />
              <path d="M8 18h.01" />
              <path d="M12 18h.01" />
            </svg>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100">
              Application Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Quick overview of the current application
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold ${statusClass}`}
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-4 dark:divide-slate-700">
        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Application ID
          </p>

          <p className="mt-2 font-bold text-slate-800 dark:text-slate-200">
            {initialData?.loanId ||
              initialData?.id ||
              "Auto Generated"}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Customer
          </p>

          <p className="mt-2 truncate font-bold text-slate-800 dark:text-slate-200">
            {loan?.customerName || "-"}
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {loan?.customerId ||
              "Customer not selected"}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Created Date
          </p>

          <p className="mt-2 font-bold text-slate-800 dark:text-slate-200">
            {formatDate(loan?.loanDate)}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Loan Amount
          </p>

          <p className="mt-2 font-bold text-slate-800 dark:text-slate-200">
            ₹ {formatCurrency(loan?.loanAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSummary;