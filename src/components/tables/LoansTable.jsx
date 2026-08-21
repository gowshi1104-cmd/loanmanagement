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
      <div className="text-center py-10 text-gray-500">
        Loading Loans...
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="bg-white rounded-2xl shadow p-6">

      {/* SEARCH */}

      <div className="flex justify-between items-center mb-5">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
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
            className="border rounded-lg pl-10 pr-4 py-2 w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="border-b bg-slate-50">

            <tr className="text-left">

              {/* S.NO */}

              <th className="py-3 px-2">
                S.no
              </th>

              {/* LOAN ID */}

              <th className="px-2">
                Loan ID
              </th>

              {/* CUSTOMER ID */}

              <th className="px-2">
                Customer ID
              </th>

              {/* CUSTOMER */}

              <th className="px-2">
                Customer
              </th>

              {/* AMOUNT */}

              <th className="px-2">
                Loan Amount
              </th>

              {/* INTEREST */}

              <th className="px-2">
                Interest
              </th>

              {/* TENURE */}

              <th className="px-2">
                Tenure
              </th>

              {/* DISBURSAL */}

              <th className="px-2">
                Disbursal Date
              </th>

              {/* STATUS */}

              <th className="px-2">
                Status
              </th>

              {/* ACTION */}

              <th className="px-2">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {currentLoans.map(
              (loan, index) => (

                <tr
                  key={loan.id}
                  className="border-b hover:bg-slate-50"
                >

                  {/* SERIAL */}

                  <td className="py-4 px-2">
                    {firstIndex +
                      index +
                      1}
                  </td>

                  {/* LOAN ID */}

                  <td className="px-2 font-semibold text-blue-700">
                    {loan.loanId ||
                      "-"}
                  </td>

                  {/* CUSTOMER ID */}

                  <td className="px-2 font-semibold text-blue-700">
                    {loan.customerId ||
                      "-"}
                  </td>

                  {/* CUSTOMER */}

                  <td className="px-2 font-medium">
                    {loan.customerName ||
                      "-"}
                  </td>

                  {/* AMOUNT */}

                  <td className="px-2">
                    ₹
                    {Number(
                      loan.loanAmount ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  {/* INTEREST */}

                  <td className="px-2">
                    {loan.interestRate}%
                  </td>

                  {/* TENURE */}

                  <td className="px-2">
                    {loan.tenureMonths}{" "}
                    Months
                  </td>

                  {/* DISBURSAL */}

                  <td className="px-2">
                    {loan.disbursalExpectedDate ||
                      "-"}
                  </td>

                  {/* STATUS */}

                  <td className="px-2">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        loan.status ===
                        "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : loan.status ===
                            "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : loan.status ===
                            "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : loan.status ===
                            "DISBURSED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {loan.status}
                    </span>

                  </td>

                  {/* ACTION */}

                  <td className="px-2">

                    <div className="flex items-center gap-3">

                      {/* VIEW */}

                      {canView && (

                        <Link
                          to={`/loans/${loan.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>

                      )}

                      {/* EDIT */}

                      {canEdit && (

                        <Link
                          to={`/loans/${loan.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-700"
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
                          className="text-red-600 hover:text-red-700"
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

          <p className="text-center text-slate-500 py-8">
            No loans found
          </p>

        )}

      </div>

      {/* PAGINATION */}

      {filteredLoans.length > 0 && (

        <div className="flex justify-between items-center mt-6">

          <p className="text-sm text-gray-500">

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

          <div className="flex gap-2">

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
              className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
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
                  className={`w-10 h-10 rounded-lg ${
                    currentPage ===
                    i + 1
                      ? "bg-blue-600 text-white"
                      : "border hover:bg-gray-100"
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
              className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
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