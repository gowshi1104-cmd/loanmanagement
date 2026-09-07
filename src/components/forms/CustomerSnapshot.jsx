import {
  AlertTriangle,
  Search,
  UserRound,
} from "lucide-react";

const CustomerSnapshot = ({
  loan,
  existingLoans,
  monthlyIncome,
  principalAmount,
  formatCurrency,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <UserRound
            size={18}
            className="text-blue-600 dark:text-blue-400"
          />
          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            Customer Snapshot
          </h3>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Instant customer overview
        </p>
      </div>

      <div className="p-5">
        {loan.customerName ? (
          <>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                {loan.customerName
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate font-bold text-slate-900 dark:text-slate-100">
                  {loan.customerName}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {loan.customerId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Monthly Income
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                  ₹{" "}
                  {monthlyIncome
                    ? formatCurrency(monthlyIncome)
                    : "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Existing Loans
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {existingLoans.length}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Application Amount
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                  ₹{" "}
                  {principalAmount
                    ? formatCurrency(principalAmount)
                    : "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Status
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {loan.status}
                </p>
              </div>
            </div>

            {existingLoans.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <div className="flex gap-2">
                  <AlertTriangle
                    size={17}
                    className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                  />

                  <div>
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                      Existing Loan Found
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
                      This customer has existing loan records.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Search
                size={23}
                className="text-slate-400 dark:text-slate-500"
              />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Search Customer
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter Customer ID to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSnapshot;