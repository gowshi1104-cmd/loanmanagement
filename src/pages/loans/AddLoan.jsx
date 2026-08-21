import { createLoan } from "../../services/loanService";
import LoanForm from "../../components/forms/LoanForm";

const AddLoan = () => {
  const handleCreateLoan = async (loan) => {
    const response = await createLoan(loan);
    return response;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-800">
        Add Loan
      </h1>

      <p className="text-slate-500 mt-1 mb-6">
        Create a new loan for a customer.
      </p>

      <div className="max-w-6xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <LoanForm
            initialData={null}
            onSubmit={handleCreateLoan}
            buttonText="Save Loan"
            successMessage="Loan added successfully!"
          />
        </div>
      </div>
    </div>
  );
};

export default AddLoan;