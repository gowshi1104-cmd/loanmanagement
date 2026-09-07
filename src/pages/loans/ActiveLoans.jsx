import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  Search,
  RefreshCw,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";

const ActiveLoans = () => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveLoans = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      /**
       * IMPORTANT:
       * Use the backend status endpoints instead of only /loans.
       *
       * /loans/status/{status} already synchronizes EMI progress
       * before returning the requested status.
       *
       * This makes sure:
       * ACTIVE -> COMPLETED
       * when all EMIs are successfully paid.
       */
      const [activeResponse, overdueResponse] =
        await Promise.all([
          api.get("/loans/status/ACTIVE"),
          api.get("/loans/status/OVERDUE"),
        ]);

      const activeLoans = Array.isArray(activeResponse.data)
        ? activeResponse.data
        : [];

      const overdueLoans = Array.isArray(overdueResponse.data)
        ? overdueResponse.data
        : [];

      /**
       * Combine only currently ACTIVE / OVERDUE loans.
       *
       * APPROVED loans are intentionally excluded.
       *
       * APPROVED -> Disburse -> ACTIVE
       */
      const loanMap = new Map();

      [...activeLoans, ...overdueLoans].forEach((loan) => {
        const key = loan?.id ?? loan?.loanId;

        if (key !== undefined && key !== null) {
          loanMap.set(String(key), loan);
        }
      });

      const active = Array.from(loanMap.values()).filter(
        (loan) => {
          const status = String(loan?.status || "")
            .trim()
            .toUpperCase();

          return (
            status === "ACTIVE" ||
            status === "OVERDUE"
          );
        }
      );

      setLoans(active);
      setFilteredLoans(active);

      if (showToast) {
        toast.success("Active loans refreshed");
      }
    } catch (error) {
      console.error(
        "Failed to fetch active loans:",
        error
      );

      if (error.response?.status === 401) {
        toast.error(
          "Authentication required. Please login again."
        );
      } else if (error.response?.status === 403) {
        toast.error(
          error.response?.data ||
            "You don't have permission to view loans"
        );
      } else {
        toast.error(
          "Failed to load active loans"
        );
      }

      setLoans([]);
      setFilteredLoans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setFilteredLoans(loans);
      return;
    }

    const result = loans.filter((loan) => {
      return (
        String(loan?.loanId || "")
          .toLowerCase()
          .includes(value) ||
        String(loan?.customerId || "")
          .toLowerCase()
          .includes(value) ||
        String(loan?.customerName || "")
          .toLowerCase()
          .includes(value) ||
        String(loan?.status || "")
          .toLowerCase()
          .includes(value)
      );
    });

    setFilteredLoans(result);
  }, [search, loans]);

  const formatAmount = (amount) => {
    if (
      amount === null ||
      amount === undefined
    ) {
      return "₹0.00";
    }

    return `₹${Number(amount).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusStyle = (status) => {
    const value = String(
      status || ""
    ).toUpperCase();

    if (value === "OVERDUE") {
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800";
    }

    if (value === "ACTIVE") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    }

    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
  };

  const getStatusIcon = (status) => {
    const value = String(
      status || ""
    ).toUpperCase();

    if (value === "OVERDUE") {
      return <AlertCircle size={14} />;
    }

    if (value === "ACTIVE") {
      return <CheckCircle2 size={14} />;
    }

    return <CheckCircle2 size={14} />;
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-slate-50 p-3 dark:bg-slate-950 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl min-w-0">

        {/* Header */}
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
              Active Loans
            </h1>

            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              View all currently disbursed and active loans
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchActiveLoans(true)
            }
            disabled={refreshing}
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-800
              sm:w-auto
            "
          >
            {refreshing ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={17} />
            )}

            Refresh
          </button>
        </div>

        {/* Search + Count */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">

            <div className="relative w-full md:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search Loan ID, Customer ID or Name..."
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  py-2.5
                  pl-10
                  pr-4
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-blue-500
                  focus:bg-white
                  focus:ring-2
                  focus:ring-blue-100
                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-slate-100
                  dark:placeholder:text-slate-500
                  dark:focus:bg-slate-800
                  dark:focus:ring-blue-900
                "
              />
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400 sm:text-center md:text-right">
              Showing{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {filteredLoans.length}
              </span>{" "}
              active loan
              {filteredLoans.length !== 1
                ? "s"
                : ""}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center px-4">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Loader2
                  size={20}
                  className="animate-spin text-blue-600"
                />
                Loading active loans...
              </div>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center sm:px-6">
              <div className="mb-3 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <CheckCircle2
                  size={28}
                  className="text-slate-400 dark:text-slate-500"
                />
              </div>

              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                No active loans found
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                There are no disbursed, active or overdue loans matching your search.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                      Loan ID
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                      Customer
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                      Loan Amount
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                      Tenure
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                      EMI
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                      Next EMI
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5 dark:text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLoans.map(
                    (loan) => (
                      <tr
                        key={
                          loan.id ||
                          loan.loanId
                        }
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        {/* Loan ID */}
                        <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {loan.loanId || "-"}
                          </span>

                          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {formatDate(
                              loan.loanDate
                            )}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-4 sm:px-5">
                          <div className="whitespace-nowrap font-medium text-slate-800 dark:text-slate-100">
                            {loan.customerName || "-"}
                          </div>

                          <div className="mt-1 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                            {loan.customerId || "-"}
                          </div>
                        </td>

                        {/* Loan Amount */}
                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800 sm:px-5 dark:text-slate-100">
                          {formatAmount(
                            loan.loanAmount
                          )}
                        </td>

                        {/* Tenure */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 sm:px-5 dark:text-slate-300">
                          {loan.tenureMonths
                            ? `${loan.tenureMonths} months`
                            : "-"}
                        </td>

                        {/* EMI */}
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700 sm:px-5 dark:text-slate-200">
                          {formatAmount(
                            loan.emiAmount
                          )}
                        </td>

                        {/* Next EMI */}
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600 sm:px-5 dark:text-slate-300">
                          {formatDate(
                            loan.nextEmiDate
                          )}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              loan.status
                            )}`}
                          >
                            {getStatusIcon(
                              loan.status
                            )}

                            {loan.status || "-"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 sm:px-5">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Loan */}
                            <Link
                              to={`/loans/${loan.id}`}
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                whitespace-nowrap
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-700
                                transition
                                hover:border-blue-200
                                hover:bg-blue-50
                                hover:text-blue-700
                                dark:border-slate-700
                                dark:bg-slate-900
                                dark:text-slate-200
                                dark:hover:border-blue-800
                                dark:hover:bg-blue-950/40
                                dark:hover:text-blue-300
                              "
                            >
                              <Eye size={15} />
                              View
                            </Link>

                            {/* EMI Schedule */}
                            <Link
                              to={`/loans/${loan.id}/emi-schedule`}
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                whitespace-nowrap
                                rounded-lg
                                border
                                border-blue-200
                                bg-blue-50
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-blue-700
                                transition
                                hover:bg-blue-100
                                dark:border-blue-800
                                dark:bg-blue-950/40
                                dark:text-blue-300
                                dark:hover:bg-blue-900/50
                              "
                            >
                              <CalendarDays size={15} />
                              EMI Schedule
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveLoans;