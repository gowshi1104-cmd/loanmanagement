import { useMemo, useState } from "react";
import {
    ReceiptText,
    Search,
    CheckCircle2,
    XCircle,
    Clock3,
    IndianRupee,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const PaymentHistoryTable = ({ payments = [] }) => {

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const recordsPerPage = 5;

    // =========================================================
    // CURRENCY
    // =========================================================

    const formatCurrency = (value) => {
        const amount = Number(value || 0);

        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // =========================================================
    // STATUS
    // =========================================================

    const getStatusClass = (status) => {

        switch (status) {

            case "SUCCESS":
                return "bg-green-100 text-green-700";

            case "FAILED":
                return "bg-red-100 text-red-700";

            case "PENDING":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusIcon = (status) => {

        switch (status) {

            case "SUCCESS":
                return <CheckCircle2 size={14} />;

            case "FAILED":
                return <XCircle size={14} />;

            case "PENDING":
                return <Clock3 size={14} />;

            default:
                return <Clock3 size={14} />;
        }
    };

    // =========================================================
    // PAYMENT SUMMARY
    // =========================================================

    const summary = useMemo(() => {

        const successPayments = payments.filter(
            (payment) =>
                payment.status === "SUCCESS"
        );

        const pendingPayments = payments.filter(
            (payment) =>
                payment.status === "PENDING"
        );

        const failedPayments = payments.filter(
            (payment) =>
                payment.status === "FAILED"
        );

        const totalPaid = successPayments.reduce(
            (total, payment) =>
                total + Number(payment.amount || 0),
            0
        );

        return {
            total: payments.length,
            success: successPayments.length,
            pending: pendingPayments.length,
            failed: failedPayments.length,
            totalPaid,
        };

    }, [payments]);

    // =========================================================
    // FILTER
    // =========================================================

    const filteredPayments = useMemo(() => {

        const searchValue =
            search.trim().toLowerCase();

        return payments.filter((payment) => {

            const matchesSearch =
                !searchValue ||
                payment.paymentId
                    ?.toString()
                    .toLowerCase()
                    .includes(searchValue) ||

                payment.paymentMode
                    ?.toString()
                    .toLowerCase()
                    .includes(searchValue) ||

                payment.transactionReference
                    ?.toString()
                    .toLowerCase()
                    .includes(searchValue) ||

                payment.receiptNumber
                    ?.toString()
                    .toLowerCase()
                    .includes(searchValue) ||

                payment.amount
                    ?.toString()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "ALL" ||
                payment.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });

    }, [payments, search, statusFilter]);

    // =========================================================
    // PAGINATION
    // =========================================================

    const totalPages = Math.ceil(
        filteredPayments.length /
        recordsPerPage
    );

    const safeCurrentPage =
        totalPages === 0
            ? 1
            : Math.min(
                currentPage,
                totalPages
            );

    const firstIndex =
        (safeCurrentPage - 1) *
        recordsPerPage;

    const lastIndex =
        firstIndex + recordsPerPage;

    const currentPayments =
        filteredPayments.slice(
            firstIndex,
            lastIndex
        );

    // =========================================================
    // SEARCH CHANGE
    // =========================================================

    const handleSearch = (e) => {

        setSearch(e.target.value);

        setCurrentPage(1);
    };

    // =========================================================
    // STATUS CHANGE
    // =========================================================

    const handleStatusChange = (e) => {

        setStatusFilter(e.target.value);

        setCurrentPage(1);
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="space-y-5">

            {/* =====================================================
                PAYMENT SUMMARY
            ===================================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* Total Payments */}

                <div className="rounded-xl border bg-white p-4">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                            <ReceiptText size={20} />
                        </div>

                        <div>

                            <p className="text-xs text-gray-500">
                                Total Payments
                            </p>

                            <p className="text-lg font-semibold text-gray-900">
                                {summary.total}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Successful */}

                <div className="rounded-xl border bg-white p-4">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-green-100 p-2 text-green-600">
                            <CheckCircle2 size={20} />
                        </div>

                        <div>

                            <p className="text-xs text-gray-500">
                                Successful
                            </p>

                            <p className="text-lg font-semibold text-gray-900">
                                {summary.success}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Pending */}

                <div className="rounded-xl border bg-white p-4">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-yellow-100 p-2 text-yellow-600">
                            <Clock3 size={20} />
                        </div>

                        <div>

                            <p className="text-xs text-gray-500">
                                Pending
                            </p>

                            <p className="text-lg font-semibold text-gray-900">
                                {summary.pending}
                            </p>

                        </div>

                    </div>

                </div>

                {/* Total Paid */}

                <div className="rounded-xl border bg-white p-4">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                            <IndianRupee size={20} />
                        </div>

                        <div>

                            <p className="text-xs text-gray-500">
                                Successful Amount
                            </p>

                            <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(
                                    summary.totalPaid
                                )}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* =====================================================
                FILTERS
            ===================================================== */}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                {/* Search */}

                <div className="relative w-full md:w-80">

                    <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        placeholder="Search payment..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                </div>

                {/* Status */}

                <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                    <option value="ALL">
                        All Status
                    </option>

                    <option value="SUCCESS">
                        Success
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="FAILED">
                        Failed
                    </option>

                </select>

            </div>

            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="overflow-x-auto rounded-xl border">

                <table className="w-full min-w-[950px] text-left">

                    <thead className="bg-gray-50">

                        <tr className="border-b text-xs uppercase text-gray-500">

                            <th className="px-5 py-3">
                                Payment ID
                            </th>

                            <th className="px-5 py-3">
                                Date
                            </th>

                            <th className="px-5 py-3">
                                Amount
                            </th>

                            <th className="px-5 py-3">
                                Mode
                            </th>

                            <th className="px-5 py-3">
                                Status
                            </th>

                            <th className="px-5 py-3">
                                Transaction
                            </th>

                            <th className="px-5 py-3">
                                Receipt
                            </th>

                        </tr>

                    </thead>

                    <tbody className="divide-y">

                        {currentPayments.map(
                            (payment) => (

                                <tr
                                    key={
                                        payment.paymentId
                                    }
                                    className="hover:bg-gray-50"
                                >

                                    {/* Payment ID */}

                                    <td className="px-5 py-4">

                                        <span className="font-medium text-gray-900">
                                            {payment.paymentId ||
                                                "-"}
                                        </span>

                                    </td>

                                    {/* Date */}

                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        {payment.paymentDate ||
                                            "-"}
                                    </td>

                                    {/* Amount */}

                                    <td className="px-5 py-4">

                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(
                                                payment.amount
                                            )}
                                        </span>

                                    </td>

                                    {/* Mode */}

                                    <td className="px-5 py-4">

                                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                            {payment.paymentMode ||
                                                "-"}
                                        </span>

                                    </td>

                                    {/* Status */}

                                    <td className="px-5 py-4">

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                                payment.status
                                            )}`}
                                        >
                                            {getStatusIcon(
                                                payment.status
                                            )}

                                            {payment.status ||
                                                "UNKNOWN"}
                                        </span>

                                    </td>

                                    {/* Transaction */}

                                    <td className="max-w-[220px] truncate px-5 py-4 text-sm text-gray-600">
                                        {payment.transactionReference ||
                                            "-"}
                                    </td>

                                    {/* Receipt */}

                                    <td className="px-5 py-4">

                                        {payment.receiptNumber ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                                <ReceiptText
                                                    size={14}
                                                />

                                                {
                                                    payment.receiptNumber
                                                }
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                -
                                            </span>
                                        )}

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {currentPayments.length === 0 && (

                    <div className="py-12 text-center">

                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <ReceiptText size={22} />
                        </div>

                        <p className="font-medium text-gray-700">
                            No payments found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            No payment records match your search.
                        </p>

                    </div>

                )}

            </div>

            {/* =====================================================
                PAGINATION
            ===================================================== */}

            {filteredPayments.length > 0 && (

                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-gray-500">

                        Showing{" "}

                        {firstIndex + 1}

                        {" - "}

                        {Math.min(
                            lastIndex,
                            filteredPayments.length
                        )}

                        {" of "}

                        {filteredPayments.length}

                    </p>

                    <div className="flex items-center gap-2">

                        <button
                            disabled={
                                safeCurrentPage === 1
                            }
                            onClick={() =>
                                setCurrentPage(
                                    (page) =>
                                        page - 1
                                )
                            }
                            className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        <span className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                            {safeCurrentPage}
                        </span>

                        <button
                            disabled={
                                safeCurrentPage >=
                                totalPages
                            }
                            onClick={() =>
                                setCurrentPage(
                                    (page) =>
                                        page + 1
                                )
                            }
                            className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
};

export default PaymentHistoryTable;