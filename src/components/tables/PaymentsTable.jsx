import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import DeleteModal from "../common/DeleteModal";

import {
  getPayments,
  deletePayment,
} from "../../services/paymentService";

import { hasPermission } from "../../utils/auth";

const PaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  // =========================================================
  // LOAD PAYMENTS
  // =========================================================

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await getPayments();

      console.log(
        "Payments API Response:",
        response
      );

      // Service already returns array
      if (Array.isArray(response)) {
        setPayments(response);
      } else if (Array.isArray(response?.data)) {
        setPayments(response.data);
      } else {
        console.warn(
          "Unexpected payments response:",
          response
        );

        setPayments([]);
      }
    } catch (error) {
      console.error(
        "Failed to load payments:",
        error
      );

      setPayments([]);

      if (error.response?.status === 403) {
        toast.error(
          "You don't have permission to view payments"
        );
      } else {
        toast.error(
          "Failed to load payments"
        );
      }
    }
  };

  // =========================================================
  // DELETE PAYMENT
  // =========================================================

  const handleDelete = async () => {
    if (!selectedId) {
      return;
    }

    try {
      await deletePayment(selectedId);

      toast.success(
        "Payment Deleted Successfully"
      );

      setIsDeleteOpen(false);
      setSelectedId(null);

      await loadPayments();
    } catch (error) {
      console.error(
        "Delete payment error:",
        error
      );

      toast.error("Delete Failed");
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredPayments = Array.isArray(payments)
    ? payments.filter((payment) => {
        const value =
          searchTerm.toLowerCase().trim();

        if (!value) {
          return true;
        }

        return (
          payment.id
            ?.toString()
            .toLowerCase()
            .includes(value) ||
          payment.customerName
            ?.toLowerCase()
            .includes(value) ||
          payment.paymentMode
            ?.toLowerCase()
            .includes(value) ||
          payment.status
            ?.toLowerCase()
            .includes(value) ||
          payment.amount
            ?.toString()
            .includes(value)
        );
      })
    : [];

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.ceil(
    filteredPayments.length /
      recordsPerPage
  );

  const lastIndex =
    currentPage * recordsPerPage;

  const firstIndex =
    lastIndex - recordsPerPage;

  const currentPayments =
    filteredPayments.slice(
      firstIndex,
      lastIndex
    );

  // =========================================================
  // PERMISSIONS
  // =========================================================

  const canView =
    hasPermission("VIEW_PAYMENTS");

  const canEdit =
    hasPermission("EDIT_PAYMENT");

  const canDelete =
    hasPermission("DELETE_PAYMENT");

  // =========================================================
  // PAGE SAFETY
  // =========================================================

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }

    if (
      totalPages === 0 &&
      currentPage !== 1
    ) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div className="w-full min-w-0 rounded-2xl bg-white p-4 shadow dark:bg-slate-900 sm:p-6">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search payment..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="
              w-full
              rounded-lg
              border
              px-4
              py-2
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200
              dark:placeholder:text-slate-500
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              sm:w-72
            "
          />
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b dark:border-slate-700">
              <tr className="text-left text-slate-700 dark:text-slate-300">
                <th className="whitespace-nowrap py-3">
                  S.no
                </th>

                <th className="whitespace-nowrap">
                  Customer
                </th>

                <th className="whitespace-nowrap">
                  Amount
                </th>

                <th className="whitespace-nowrap">
                  Date
                </th>

                <th className="whitespace-nowrap">
                  Mode
                </th>

                <th className="whitespace-nowrap">
                  Status
                </th>

                <th className="whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {currentPayments.map(
                (payment, index) => (
                  <tr
                    key={payment.id}
                    className="
                      border-b
                      text-slate-700
                      dark:border-slate-700
                      dark:text-slate-300
                      hover:bg-slate-50
                      dark:hover:bg-slate-800
                    "
                  >
                    {/* S.NO */}

                    <td className="whitespace-nowrap py-4">
                      {firstIndex +
                        index +
                        1}
                    </td>

                    {/* CUSTOMER */}

                    <td className="whitespace-nowrap font-medium text-slate-800 dark:text-slate-200">
                      {payment.customerName ||
                        "-"}
                    </td>

                    {/* AMOUNT */}

                    <td className="whitespace-nowrap">
                      ₹
                      {Number(
                        payment.amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* DATE */}

                    <td className="whitespace-nowrap">
                      {payment.paymentDate ||
                        "-"}
                    </td>

                    {/* MODE */}

                    <td className="whitespace-nowrap">
                      {payment.paymentMode ||
                        "-"}
                    </td>

                    {/* STATUS */}

                    <td className="whitespace-nowrap">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-3
                          py-1
                          text-sm
                          font-medium
                          ${
                            payment.status ===
                            "SUCCESS"
                              ? "bg-green-100 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : payment.status ===
                                "PENDING"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          }
                        `}
                      >
                        {payment.status ||
                          "UNKNOWN"}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td className="px-2">
                      <div className="flex min-w-max items-center gap-3">
                        {/* VIEW */}

                        {canView && (
                          <Link
                            to={`/payments/${payment.id}`}
                            className="
                              text-blue-600
                              dark:text-blue-400
                              hover:text-blue-800
                              dark:hover:text-blue-300
                            "
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                        )}

                        {/* EDIT */}

                        {canEdit && (
                          <Link
                            to={`/payments/${payment.id}/edit`}
                            className="
                              text-yellow-600
                              dark:text-yellow-400
                              hover:text-yellow-700
                              dark:hover:text-yellow-300
                            "
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </Link>
                        )}

                        {/* DELETE */}

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(
                                payment.id
                              );

                              setIsDeleteOpen(
                                true
                              );
                            }}
                            className="
                              text-red-600
                              dark:text-red-400
                              hover:text-red-700
                              dark:hover:text-red-300
                            "
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

          {/* ===================================================
              EMPTY
          =================================================== */}

          {filteredPayments.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              No payments found
            </p>
          )}
        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {filteredPayments.length > 0 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Showing{" "}
              {firstIndex + 1} -{" "}
              {Math.min(
                lastIndex,
                filteredPayments.length
              )}{" "}
              of{" "}
              {filteredPayments.length}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {/* PREVIOUS */}

              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(
                    (p) => p - 1
                  )
                }
                className="
                  rounded-lg
                  border
                  px-4
                  py-2
                  disabled:opacity-40
                  hover:bg-gray-100
                  dark:border-slate-700
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
              >
                Previous
              </button>

              {/* PAGE NUMBERS */}

              {Array.from(
                {
                  length: totalPages,
                },
                (_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() =>
                      setCurrentPage(
                        i + 1
                      )
                    }
                    className={`
                      h-10
                      w-10
                      rounded-lg
                      ${
                        currentPage ===
                        i + 1
                          ? "bg-blue-600 text-white"
                          : "border dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 dark:text-slate-300"
                      }
                    `}
                  >
                    {i + 1}
                  </button>
                )
              )}

              {/* NEXT */}

              <button
                type="button"
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
                className="
                  rounded-lg
                  border
                  px-4
                  py-2
                  disabled:opacity-40
                  hover:bg-gray-100
                  dark:border-slate-700
                  dark:text-slate-300
                  dark:hover:bg-slate-800
                "
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          DELETE MODAL
      ======================================================= */}

      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete Payment"
        message="Are you sure you want to delete this payment?"
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedId(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default PaymentsTable;