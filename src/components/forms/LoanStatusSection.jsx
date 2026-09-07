import { CheckCircle2, Clock3 } from "lucide-react";

const LoanStatusSection = ({
  loan,
  handleChange,
  canChangeLoanStatus,
  hasExistingLoan,
  isEditMode,
  statusOptions,
  userRole,
  isAdmin,
  isManager,
}) => {
  const isDisabled = hasExistingLoan && !isEditMode;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Application Status
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Current status of this loan application
          </p>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
            loan.status === "APPROVED"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : loan.status === "REJECTED"
              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          }`}
        >
          {loan.status === "APPROVED" ? (
            <CheckCircle2 size={14} />
          ) : (
            <Clock3 size={14} />
          )}

          {loan.status || "PENDING"}
        </div>
      </div>

      <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        Status
      </label>

      {canChangeLoanStatus ? (
        <select
          name="status"
          value={loan.status}
          onChange={handleChange}
          disabled={isDisabled}
          className={`w-full h-11 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm outline-none transition ${
            isDisabled
              ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/50"
          }`}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            type="text"
            value="PENDING"
            disabled
            className="w-full h-11 border border-slate-200 dark:border-slate-700 rounded-xl px-4 pr-10 text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-not-allowed font-medium"
          />

          <Clock3
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 dark:text-amber-400"
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Role:{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {userRole || "STAFF"}
          </span>
        </p>

        {!canChangeLoanStatus && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Staff → PENDING only
          </span>
        )}
      </div>

      {isAdmin && (
        <div className="mt-3 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Admin:</span>{" "}
            You can change the loan application status.
          </p>
        </div>
      )}

      {isManager && (
        <div className="mt-3 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Manager:</span>{" "}
            You can change the loan application status.
          </p>
        </div>
      )}

      {!canChangeLoanStatus && (
        <div className="mt-3 rounded-xl border border-amber-100 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Staff users can create loans only with PENDING status.
          </p>
        </div>
      )}
    </div>
  );
};

export default LoanStatusSection;