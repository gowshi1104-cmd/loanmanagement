import LoansTable from "../../components/tables/LoansTable";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Loans = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canAdd = hasPermission("ADD_LOAN");

  return (
    <div className="w-full min-w-0">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
            Loans
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Manage all loan records
          </p>
        </div>

        {canAdd && (
          <button
            onClick={() => navigate("/loans/add")}
            className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 sm:w-auto"
          >
            + Add Loan
          </button>
        )}
      </div>

      <div className="w-full min-w-0">
        <LoansTable />
      </div>
    </div>
  );
};

export default Loans;