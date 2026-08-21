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

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

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
      } else if (
        Array.isArray(response?.data)
      ) {
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
      <div className="bg-white rounded-2xl shadow p-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex justify-between items-center mb-5">

          <input
            type="text"
            placeholder="Search payment..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(
                e.target.value
              );

              setCurrentPage(1);
            }}
            className="
              border
              rounded-lg
              px-4
              py-2
              w-72
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="border-b">

              <tr className="text-left">

                <th className="py-3">
                  S.no
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Date
                </th>

                <th>
                  Mode
                </th>

                <th>
                  Status
                </th>

                <th>
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
                      hover:bg-slate-50
                    "
                  >

                    {/* S.NO */}

                    <td className="py-4">
                      {firstIndex +
                        index +
                        1}
                    </td>

                    {/* CUSTOMER */}

                    <td className="font-medium">
                      {payment.customerName ||
                        "-"}
                    </td>

                    {/* AMOUNT */}

                    <td>
                      ₹
                      {Number(
                        payment.amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    {/* DATE */}

                    <td>
                      {payment.paymentDate ||
                        "-"}
                    </td>

                    {/* MODE */}

                    <td>
                      {payment.paymentMode ||
                        "-"}
                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-sm
                          font-medium

                          ${
                            payment.status ===
                            "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : payment.status ===
                                "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }
                        `}
                      >
                        {payment.status ||
                          "UNKNOWN"}
                      </span>

                    </td>

                    {/* ACTION */}

                    <td className="px-2">

                      <div className="flex items-center gap-3">

                        {/* VIEW */}

                        {canView && (
                          <Link
                            to={`/payments/${payment.id}`}
                            className="
                              text-blue-600
                              hover:text-blue-800
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
                              hover:text-yellow-700
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
                              hover:text-red-700
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

            <p className="text-center text-slate-500 py-6">
              No payments found
            </p>

          )}

        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {filteredPayments.length > 0 && (

          <div className="flex justify-between items-center mt-6">

            <p className="text-sm text-gray-500">

              Showing{" "}
              {firstIndex + 1} -{" "}
              {Math.min(
                lastIndex,
                filteredPayments.length
              )}{" "}
              of{" "}
              {filteredPayments.length}

            </p>

            <div className="flex items-center gap-2">

              {/* PREVIOUS */}

              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (p) => p - 1
                  )
                }
                className="
                  px-4
                  py-2
                  border
                  rounded-lg
                  disabled:opacity-40
                  hover:bg-gray-100
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
                      w-10
                      h-10
                      rounded-lg

                      ${
                        currentPage ===
                        i + 1
                          ? "bg-blue-600 text-white"
                          : "border hover:bg-gray-100"
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
                  px-4
                  py-2
                  border
                  rounded-lg
                  disabled:opacity-40
                  hover:bg-gray-100
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