import React from "react";

const LoanDetailsSection = ({
  loan,
  loanAmountOptions,
  tenureOptions,
  handleChange,
  setLoan,
  setIsDirty,
  isDirtyRef,
  hasExistingLoan,
  isEditMode,
}) => {
  const disabled = hasExistingLoan && !isEditMode;

  const handleLoanAmountSelect = (e) => {
    const value = e.target.value;

    setLoan((prev) => ({
      ...prev,
      loanAmount: value,
    }));

    setIsDirty(true);
    isDirtyRef.current = true;
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Loan Details
        </h3>

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Enter the loan amount, interest and repayment details
        </p>
      </div>

      {/* Fields */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
        {/* Loan Amount */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            Loan Amount
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div className="flex gap-3">
            <select
              value={
                loanAmountOptions.includes(
                  Number(loan.loanAmount)
                )
                  ? loan.loanAmount
                  : ""
              }
              disabled={disabled}
              onChange={handleLoanAmountSelect}
              className={`w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 outline-none transition ${
                disabled
                  ? "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
              }`}
            >
              <option value="">Select Amount</option>

              {loanAmountOptions.map((amount) => (
                <option key={amount} value={amount}>
                  ₹ {amount.toLocaleString("en-IN")}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="loanAmount"
              value={loan.loanAmount}
              onChange={handleChange}
              disabled={disabled}
              placeholder="Or type amount"
              className={`w-1/2 rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition ${
                disabled
                  ? "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-white dark:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
              }`}
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            Monthly Interest Rate
          </label>

          <input
            type="text"
            value="2%"
            disabled
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 outline-none"
          />
        </div>

        {/* Tenure */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            Tenure (Months)
            <span className="text-red-500 ml-1">*</span>
          </label>

          <select
            name="tenureMonths"
            value={loan.tenureMonths}
            onChange={handleChange}
            disabled={disabled}
            className={`w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 outline-none transition ${
              disabled
                ? "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
            }`}
          >
            <option value="">Select Tenure</option>

            {tenureOptions.map((months) => (
              <option key={months} value={months}>
                {months} Months
              </option>
            ))}
          </select>
        </div>

        {/* EMI Amount */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            EMI Amount
          </label>

          <input
            type="text"
            value={
              loan.emiAmount
                ? `₹ ${Number(
                    loan.emiAmount
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : ""
            }
            disabled
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 outline-none"
          />
        </div>

        {/* Loan Date */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            Loan Date
          </label>

          <input
            type="date"
            name="loanDate"
            value={loan.loanDate}
            onChange={handleChange}
            disabled={disabled}
            className={`w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none transition ${
              disabled
                ? "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-white dark:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
            }`}
          />
        </div>

        {/* Disbursal Expected Date */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            Disbursal Expected Date
          </label>

          <input
            type="date"
            value={loan.disbursalExpectedDate}
            disabled
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 outline-none"
          />
        </div>

        {/* First EMI Date */}
        <div>
          <label className="block mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            First EMI Date
          </label>

          <input
            type="date"
            value={loan.nextEmiDate}
            disabled
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsSection;