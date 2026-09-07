import { Link } from "react-router-dom";

import PaymentsTable from "../../components/tables/PaymentsTable";

import { hasPermission } from "../../utils/auth";

const Payments = () => {
  const canAdd = hasPermission("ADD_PAYMENT");

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
            Payments
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 sm:text-base">
            Manage all payments.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full sm:w-auto sm:flex-row sm:items-center">
          {/* Payment History */}
          <Link
            to="/payments/history"
            className="w-full sm:w-auto bg-slate-700 text-white px-5 py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition text-center"
          >
            Payment History
          </Link>

          {/* Add Payment */}
          {canAdd && (
            <Link
              to="/payments/add"
              className="w-full sm:w-auto bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition text-center"
            >
              + Add Payment
            </Link>
          )}
        </div>
      </div>

      <div className="w-full min-w-0">
        <PaymentsTable />
      </div>
    </div>
  );
};

export default Payments;