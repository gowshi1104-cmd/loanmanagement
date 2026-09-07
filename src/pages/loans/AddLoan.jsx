import { createLoan } from "../../services/loanService";
import LoanForm from "../../components/forms/LoanForm";

const AddLoan = () => {
  const handleCreateLoan = async (loan) => {
    const response = await createLoan(loan);
    return response;
  };

  return (
    <div className="w-full min-w-0">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
        Add Loan
      </h1>

      <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400 sm:mb-6 sm:text-base">
        Create a new loan for a customer.
      </p>

      <div className="w-full min-w-0">
        <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
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