import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  Search,
  RefreshCw,
  Eye,
  Loader2,
  CheckCircle2,
  ArrowRightCircle,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getLoansByStatus,
  updateLoan,
} from "../../services/loanService";

const ApprovedLoans = () => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disbursingId, setDisbursingId] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // =========================================================
  // FETCH APPROVED LOANS
  // =========================================================

  const fetchApprovedLoans = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getLoansByStatus("APPROVED");

      const data = Array.isArray(response?.data)
        ? response.data
        : [];

      // =====================================================
      // APPROVED LOANS ONLY
      // =====================================================

      const approved = data.filter((loan) => {
        const status = String(loan?.status || "")
          .trim()
          .toUpperCase();

        return status === "APPROVED";
      });

      setLoans(approved);
      setFilteredLoans(approved);

      if (showToast) {
        toast.success("Approved loans refreshed");
      }
    } catch (error) {
      console.error(
        "Failed to fetch approved loans:",
        error
      );

      if (error.response?.status === 403) {
        toast.error(
          error.response?.data ||
            "You don't have permission to view approved loans"
        );
      } else {
        toast.error("Failed to load approved loans");
      }

      setLoans([]);
      setFilteredLoans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchApprovedLoans();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

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

  // =========================================================
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = (amount) => {
    if (
      amount === null ||
      amount === undefined ||
      amount === ""
    ) {
      return "₹0.00";
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return "₹0.00";
    }

    return `₹${numericAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = () => {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
  };

  // =========================================================
  // OPEN DISBURSE CONFIRMATION
  // =========================================================

  const openDisburseConfirmation = (loan) => {
    setSelectedLoan(loan);
  };

  // =========================================================
  // CLOSE DISBURSE CONFIRMATION
  // =========================================================

  const closeDisburseConfirmation = () => {
    if (disbursingId) return;

    setSelectedLoan(null);
  };

  // =========================================================
  // DISBURSE LOAN
  // APPROVED -> ACTIVE
  // =========================================================

  const handleDisburseLoan = async () => {
    if (!selectedLoan) return;

    const loanId = selectedLoan.id;

    if (!loanId) {
      toast.error("Loan database ID is missing");
      return;
    }

    try {
      setDisbursingId(loanId);

      // =====================================================
      // KEEP ALL EXISTING LOAN DATA
      // ONLY CHANGE STATUS TO ACTIVE
      // =====================================================

      const updatedLoan = {
        ...selectedLoan,
        status: "ACTIVE",
      };

      await updateLoan(loanId, updatedLoan);

      toast.success(
        `${selectedLoan.loanId || "Loan"} is now ACTIVE`
      );

      setSelectedLoan(null);

      // =====================================================
      // REMOVE UPDATED LOAN FROM APPROVED LIST
      // =====================================================

      setLoans((previousLoans) =>
        previousLoans.filter(
          (loan) => loan.id !== loanId
        )
      );

      setFilteredLoans((previousLoans) =>
        previousLoans.filter(
          (loan) => loan.id !== loanId
        )
      );
    } catch (error) {
      console.error(
        "Failed to disburse loan:",
        error
      );

      if (error.response?.status === 403) {
        toast.error(
          error.response?.data ||
            "You don't have permission to disburse this loan"
        );
      } else if (error.response?.status === 400) {
        toast.error(
          error.response?.data ||
            "Invalid loan data"
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            error.response?.data ||
            "Failed to activate loan"
        );
      }
    } finally {
      setDisbursingId(null);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen w-full min-w-0 bg-slate-50 p-3 dark:bg-slate-950 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
              Approved Loans
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              View all loans approved by Admin or Manager
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchApprovedLoans(true)}
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
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

        {/* =====================================================
            SEARCH + COUNT
        ====================================================== */}

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:mb-5 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
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
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-blue-900"
              />
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400 md:shrink-0">
              Showing{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {filteredLoans.length}
              </span>{" "}
              approved loan
              {filteredLoans.length !== 1
                ? "s"
                : ""}
            </div>
          </div>
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center px-4 sm:min-h-[300px]">
              <div className="flex items-center gap-3 text-center text-sm text-slate-500 dark:text-slate-400">
                <Loader2
                  size={20}
                  className="shrink-0 animate-spin text-blue-600"
                />

                <span>Loading approved loans...</span>
              </div>
            </div>
          ) : filteredLoans.length === 0 ? (
            /* EMPTY */

            <div className="flex min-h-[260px] flex-col items-center justify-center px-4 text-center sm:min-h-[300px] sm:px-6">
              <div className="mb-3 rounded-full bg-emerald-50 p-4 dark:bg-emerald-950/40">
                <CheckCircle2
                  size={28}
                  className="text-emerald-500 dark:text-emerald-400"
                />
              </div>

              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                No approved loans found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                There are no approved loans matching your search.
              </p>
            </div>
          ) : (
            /* TABLE */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Loan ID
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Customer
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Loan Amount
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Tenure
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      EMI
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Approved Date
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLoans.map((loan) => {
                    const isDisbursing =
                      disbursingId === loan.id;

                    return (
                      <tr
                        key={
                          loan.id ||
                          loan.loanId
                        }
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        {/* LOAN ID */}

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {loan.loanId || "-"}
                          </span>

                          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Loan Date:{" "}
                            {formatDate(
                              loan.loanDate
                            )}
                          </div>
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">
                          <div className="whitespace-nowrap font-medium text-slate-800 dark:text-slate-100">
                            {loan.customerName ||
                              "-"}
                          </div>

                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {loan.customerId ||
                              "-"}
                          </div>
                        </td>

                        {/* LOAN AMOUNT */}

                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                          {formatAmount(
                            loan.loanAmount
                          )}
                        </td>

                        {/* TENURE */}

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {loan.tenureMonths
                            ? `${loan.tenureMonths} months`
                            : "-"}
                        </td>

                        {/* EMI */}

                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700 dark:text-slate-200">
                          {formatAmount(
                            loan.emiAmount
                          )}
                        </td>

                        {/* APPROVED DATE */}

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(
                            loan.approvedDate ||
                              loan.updatedAt ||
                              loan.loanDate
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle()}`}
                          >
                            <CheckCircle2
                              size={14}
                            />

                            APPROVED
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            {/* VIEW */}

                            <Link
                              to={`/loans/${loan.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                            >
                              <Eye size={15} />
                              View
                            </Link>

                            {/* DISBURSE */}

                            <button
                              type="button"
                              onClick={() =>
                                openDisburseConfirmation(
                                  loan
                                )
                              }
                              disabled={
                                isDisbursing ||
                                disbursingId !== null
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isDisbursing ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <ArrowRightCircle
                                  size={15}
                                />
                              )}

                              Disburse
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================
          DISBURSE CONFIRMATION MODAL
      ======================================================== */}

      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-3 sm:p-4">
          <div className="my-auto w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-700 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Disburse Loan
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Change approved loan to active
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeDisburseConfirmation
                }
                disabled={
                  disbursingId !== null
                }
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="px-4 py-5 sm:px-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/40 sm:p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-300">
                  Loan ID
                </div>

                <div className="mt-1 break-words text-base font-bold text-slate-800 dark:text-slate-100">
                  {selectedLoan.loanId ||
                    "-"}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Customer
                    </div>

                    <div className="mt-1 break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {selectedLoan.customerName ||
                        "-"}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Loan Amount
                    </div>

                    <div className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {formatAmount(
                        selectedLoan.loanAmount
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to disburse this loan?
              </div>

              <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                Once disbursed, the loan status will change from{" "}
                <strong>APPROVED</strong> to{" "}
                <strong>ACTIVE</strong>.
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
              <button
                type="button"
                onClick={
                  closeDisburseConfirmation
                }
                disabled={
                  disbursingId !== null
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDisburseLoan}
                disabled={
                  disbursingId !== null
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {disbursingId !== null ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Disbursing...
                  </>
                ) : (
                  <>
                    <ArrowRightCircle
                      size={16}
                    />
                    Confirm Disbursement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedLoans;