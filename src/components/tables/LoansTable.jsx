import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import {
  Search,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import DeleteModal from "../common/DeleteModal";

import {
  getLoans,
  deleteLoan,
} from "../../services/loanService";

import toast from "react-hot-toast";

import { hasPermission } from "../../utils/auth";

const LoansTable = () => {
  const [loans, setLoans] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [selectedLoanId, setSelectedLoanId] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const recordsPerPage = 10;

  // =========================================================
  // LOAD
  // =========================================================

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      const response = await getLoans();

      setLoans(response.data);
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to load loans"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    try {
      await deleteLoan(
        selectedLoanId
      );

      toast.success(
        "Loan Deleted Successfully"
      );

      setIsDeleteOpen(false);

      setSelectedLoanId(null);

      loadLoans();
    } catch (error) {
      console.error(error);

      toast.error(
        "Delete Failed"
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredLoans =
    loans.filter((loan) => {
      const value =
        searchTerm.toLowerCase();

      return (
        loan.id
          ?.toString()
          .includes(value) ||

        loan.loanId
          ?.toLowerCase()
          .includes(value) ||

        loan.customerId
          ?.toLowerCase()
          .includes(value) ||

        loan.customerName
          ?.toLowerCase()
          .includes(value) ||

        loan.status
          ?.toLowerCase()
          .includes(value) ||

        loan.loanAmount
          ?.toString()
          .includes(value)
      );
    });

  // =========================================================
  // PAGINATION
  // =========================================================

  const lastIndex =
    currentPage *
    recordsPerPage;

  const firstIndex =
    lastIndex -
    recordsPerPage;

  const currentLoans =
    filteredLoans.slice(
      firstIndex,
      lastIndex
    );

  const totalPages =
    Math.ceil(
      filteredLoans.length /
        recordsPerPage
    );

  // =========================================================
  // PERMISSIONS
  // =========================================================

  const canView =
    hasPermission(
      "VIEW_LOANS"
    );

  const canEdit =
    hasPermission(
      "EDIT_LOAN"
    );

  const canDelete =
    hasPermission(
      "DELETE_LOAN"
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="px-4 py-10 text-center text-gray-500 dark:text-slate-400 sm:px-0">
        Loading Loans...
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="w-full min-w-0 rounded-2xl border border-transparent bg-white p-4 shadow dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 sm:p-6">

      {/* SEARCH */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="relative w-full sm:w-auto">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400 dark:text-slate-500"
          />

          <input
            type="text"
            placeholder="Search loan ID, customer ID, customer, status, amount..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(
                e.target.value
              );

              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 sm:w-96"
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="mb-2 block text-xs text-slate-400 sm:hidden">
        Swipe left/right to view the complete table
      </div>

      <div className="w-full min-w-0 overflow-x-auto">

        <table className="w-full min-w-[1100px]">

          <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70">

            <tr className="text-left text-slate-700 dark:text-slate-300">

              {/* S.NO */}

              <th className="whitespace-nowrap px-2 py-3">
                S.no
              </th>

              {/* LOAN ID */}

              <th className="whitespace-nowrap px-2">
                Loan ID
              </th>

              {/* CUSTOMER ID */}

              <th className="whitespace-nowrap px-2">
                Customer ID
              </th>

              {/* CUSTOMER */}

              <th className="whitespace-nowrap px-2">
                Customer
              </th>

              {/* AMOUNT */}

              <th className="whitespace-nowrap px-2">
                Loan Amount
              </th>

              {/* INTEREST */}

              <th className="whitespace-nowrap px-2">
                Interest
              </th>

              {/* TENURE */}

              <th className="whitespace-nowrap px-2">
                Tenure
              </th>

              {/* DISBURSAL */}

              <th className="whitespace-nowrap px-2">
                Disbursal Date
              </th>

              {/* STATUS */}

              <th className="whitespace-nowrap px-2">
                Status
              </th>

              {/* ACTION */}

              <th className="whitespace-nowrap px-2">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {currentLoans.map(
              (loan, index) => (

                <tr
                  key={loan.id}
                  className="border-b border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/70"
                >

                  {/* SERIAL */}

                  <td className="whitespace-nowrap px-2 py-4">
                    {firstIndex +
                      index +
                      1}
                  </td>

                  {/* LOAN ID */}

                  <td className="whitespace-nowrap px-2 font-semibold text-blue-700 dark:text-blue-400">
                    {loan.loanId ||
                      "-"}
                  </td>

                  {/* CUSTOMER ID */}

                  <td className="whitespace-nowrap px-2 font-semibold text-blue-700 dark:text-blue-400">
                    {loan.customerId ||
                      "-"}
                  </td>

                  {/* CUSTOMER */}

                  <td className="whitespace-nowrap px-2 font-medium text-slate-800 dark:text-slate-200">
                    {loan.customerName ||
                      "-"}
                  </td>

                  {/* AMOUNT */}

                  <td className="whitespace-nowrap px-2 text-slate-700 dark:text-slate-300">
                    ₹
                    {Number(
                      loan.loanAmount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  {/* INTEREST */}

                  <td className="whitespace-nowrap px-2">
                    {loan.interestRate}%
                  </td>

                  {/* TENURE */}

                  <td className="whitespace-nowrap px-2">
                    {loan.tenureMonths}{" "}
                    Months
                  </td>

                  {/* DISBURSAL */}

                  <td className="whitespace-nowrap px-2">
                    {loan.disbursalExpectedDate ||
                      "-"}
                  </td>

                  {/* STATUS */}

                  <td className="whitespace-nowrap px-2">

                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                        loan.status ===
                        "APPROVED"
                          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                          : loan.status ===
                            "PENDING"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300"
                          : loan.status ===
                            "REJECTED"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          : loan.status ===
                            "DISBURSED"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {loan.status}
                    </span>

                  </td>

                  {/* ACTION */}

                  <td className="whitespace-nowrap px-2">

                    <div className="flex min-w-max items-center gap-3">

                      {/* VIEW */}

                      {canView && (

                        <Link
                          to={`/loans/${loan.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>

                      )}

                      {/* EDIT */}

                      {canEdit && (

                        <Link
                          to={`/loans/${loan.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </Link>

                      )}

                      {/* DELETE */}

                      {canDelete && (

                        <button
                          onClick={() => {
                            setSelectedLoanId(
                              loan.id
                            );

                            setIsDeleteOpen(
                              true
                            );
                          }}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

        {/* NO DATA */}

        {filteredLoans.length ===
          0 && (

          <p className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
            No loans found
          </p>

        )}

      </div>

      {/* PAGINATION */}

      {filteredLoans.length > 0 && (

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <p className="text-center text-sm text-gray-500 dark:text-slate-400 sm:text-left">

            Showing{" "}

            {firstIndex + 1}

            {" - "}

            {Math.min(
              lastIndex,
              filteredLoans.length
            )}

            {" of "}

            {filteredLoans.length}

          </p>

          <div className="flex w-full flex-wrap justify-center gap-2 sm:w-auto sm:justify-end">

            {/* PREVIOUS */}

            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (p) => p - 1
                )
              }
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-gray-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Previous
            </button>

            {/* PAGE NUMBERS */}

            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, i) => (

                <button
                  key={i}
                  onClick={() =>
                    setCurrentPage(
                      i + 1
                    )
                  }
                  className={`h-10 w-10 rounded-lg ${
                    currentPage ===
                    i + 1
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 text-slate-700 hover:bg-gray-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {i + 1}
                </button>

              )
            )}

            {/* NEXT */}

            <button
              disabled={
                currentPage ===
                  totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage(
                  (p) => p + 1
                )
              }
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-gray-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Next
            </button>

          </div>

        </div>

      )}

      {/* DELETE MODAL */}

      <DeleteModal
        isOpen={
          isDeleteOpen
        }
        title="Delete Loan"
        message="Are you sure you want to delete this loan?"
        onClose={() => {
          setIsDeleteOpen(
            false
          );

          setSelectedLoanId(
            null
          );
        }}
        onConfirm={
          handleDelete
        }
      />

    </div>
  );
};

export default LoansTable;