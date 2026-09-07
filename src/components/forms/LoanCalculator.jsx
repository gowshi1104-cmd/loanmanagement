import { Calculator } from "lucide-react";

const LoanCalculator = ({
  monthlyEmi,
  principalAmount,
  totalInterest,
  totalPayable,
  formatCurrency,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <div className="border-b border-slate-100 dark:border-slate-700 bg-blue-50 dark:bg-blue-950/30 px-5 py-4">
        <div className="flex items-center gap-2">
          <Calculator
            size={18}
            className="text-blue-600 dark:text-blue-400"
          />

          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            Loan Calculator
          </h3>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Real-time EMI & summary
        </p>
      </div>

      <div className="p-5">
        <div className="rounded-xl bg-slate-900 dark:bg-slate-950 p-4">
          <p className="text-xs text-slate-400">
            Monthly EMI
          </p>

          <p className="mt-1 text-2xl font-bold text-white">
            ₹ {formatCurrency(monthlyEmi)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Estimated monthly repayment
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Principal Amount
            </span>

            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              ₹ {formatCurrency(principalAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Total Interest
            </span>

            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              ₹ {formatCurrency(totalInterest)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Total Payable
            </span>

            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              ₹ {formatCurrency(totalPayable)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;