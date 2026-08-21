import { Link } from "react-router-dom";
import PaymentsTable from "../../components/tables/PaymentsTable";
import { hasPermission } from "../../utils/auth";

const Payments = () => {
  const canAdd = hasPermission("ADD_PAYMENT");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-slate-500 mt-1">
            Manage all payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Payment History */}
          <Link
            to="/payments/history"
            className="bg-slate-700 text-white px-5 py-3 rounded-xl hover:bg-slate-800 transition"
          >
            Payment History
          </Link>

          {/* Add Payment */}
          {canAdd && (
            <Link
              to="/payments/add"
              className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              + Add Payment
            </Link>
          )}
        </div>
      </div>

      <PaymentsTable />
    </div>
  );
};

export default Payments;