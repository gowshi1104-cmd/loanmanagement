import LoansTable from "../../components/tables/LoansTable";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Loans = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canAdd = hasPermission("ADD_LOAN");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Loans</h1>
          <p className="text-slate-500 mt-1">Manage all loan records</p>
        </div>

        {canAdd && (
          <button
            onClick={() => navigate("/loans/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
          >
            + Add Loan
          </button>
        )}
      </div>

      <LoansTable />
    </div>
  );
};

export default Loans;
