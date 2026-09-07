import { ShieldCheck } from "lucide-react";

const EligibilityCheck = ({
  eligibilityScore,
  getEligibilityClasses,
  getEligibilityLabel,
  monthlyIncome,
  emiBurden,
  documents,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={18}
            className="text-emerald-600 dark:text-emerald-400"
          />

          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            Eligibility Check
          </h3>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Application eligibility overview
        </p>
      </div>

      <div className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {eligibilityScore}%
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Eligibility Score
            </p>
          </div>

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full border ${getEligibilityClasses()}`}
          >
            <span className="text-sm font-bold">
              {eligibilityScore}
            </span>
          </div>
        </div>

        <div
          className={`mb-4 rounded-xl border p-3 ${getEligibilityClasses()}`}
        >
          <p className="text-sm font-bold">
            {getEligibilityLabel()}
          </p>

          <p className="mt-1 text-xs opacity-80">
            Based on available application information
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Income Verification
            </span>

            <span
              className={
                monthlyIncome > 0
                  ? "font-semibold text-emerald-600 dark:text-emerald-400"
                  : "font-semibold text-slate-400 dark:text-slate-500"
              }
            >
              {monthlyIncome > 0
                ? "Available"
                : "Pending"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              EMI Burden
            </span>

            <span
              className={`font-semibold ${
                emiBurden > 0 && emiBurden <= 40
                  ? "text-emerald-600 dark:text-emerald-400"
                  : emiBurden > 40
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {emiBurden
                ? `${emiBurden.toFixed(2)}%`
                : "-"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Required Documents
            </span>

            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {
                [
                  documents.aadhaar,
                  documents.pan,
                  documents.rationCard,
                  documents.photo,
                ].filter(Boolean).length
              }
              /4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EligibilityCheck;