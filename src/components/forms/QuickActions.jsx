import {
  Download,
  RefreshCw,
} from "lucide-react";

const QuickActions = ({
  loan,
  downloadLoanApplicationPdf,
  fetchCustomer,
  toast,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100">
          Quick Actions
        </h3>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Application shortcuts
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            if (!loan.customerName) {
              toast.error("Please select customer first");
              return;
            }

            downloadLoanApplicationPdf(loan, {
              customerId: loan.customerId,
              name: loan.customerName,
            });
          }}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center transition hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          <Download
            size={18}
            className="text-blue-600 dark:text-blue-400"
          />

          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Generate PDF
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!loan.customerId) {
              toast.error("Please enter Customer ID first");
              return;
            }

            fetchCustomer(loan.customerId);
          }}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center transition hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        >
          <RefreshCw
            size={18}
            className="text-emerald-600 dark:text-emerald-400"
          />

          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Refresh Customer
          </span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;