const EmiDetailsCard = ({ loan }) => {
  if (
    !loan.loanAmount ||
    !loan.tenureMonths ||
    !loan.emiAmount
  ) {
    return null;
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            EMI Schedule
          </h3>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Loan repayment summary
          </p>
        </div>

        <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          EMI Details
        </span>
      </div>

      {/* Details */}

      <div className="p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Loan Amount */}

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Loan Amount
            </p>

            <p className="mt-2 text-base font-semibold text-slate-800 dark:text-slate-200">
              ₹{" "}
              {Number(
                loan.loanAmount
              ).toLocaleString("en-IN")}
            </p>
          </div>

          {/* Monthly EMI */}

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Monthly EMI
            </p>

            <p className="mt-2 text-base font-semibold text-slate-800 dark:text-slate-200">
              ₹{" "}
              {Number(
                loan.emiAmount
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Disbursal Expected */}

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Disbursal Expected
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {loan.disbursalExpectedDate || "-"}
            </p>
          </div>

          {/* First EMI */}

          <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              First EMI
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              {loan.nextEmiDate || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmiDetailsCard;