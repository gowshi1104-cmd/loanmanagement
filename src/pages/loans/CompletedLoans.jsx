import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  Search,
  RefreshCw,
  Eye,
  Loader2,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getLoans,
  generateNoc,
  closeLoan,
} from "../../services/loanService";

const CompletedLoans = () => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingNocId, setGeneratingNocId] = useState(null);
  const [closingLoanId, setClosingLoanId] = useState(null);

  // =========================================================
  // FETCH COMPLETED LOANS
  // =========================================================

  const fetchCompletedLoans = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getLoans();

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const completed = data.filter((loan) => {
        const status = String(loan?.status || "")
          .trim()
          .toUpperCase();

        return status === "COMPLETED";
      });

      setLoans(completed);
      setFilteredLoans(completed);

      if (showToast) {
        toast.success("Completed loans refreshed");
      }
    } catch (error) {
      console.error(
        "Failed to fetch completed loans:",
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
        toast.error("Failed to load completed loans");
      }

      setLoans([]);
      setFilteredLoans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompletedLoans();
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
          .includes(value) ||
        String(loan?.nocNumber || "")
          .toLowerCase()
          .includes(value) ||
        String(loan?.nocStatus || "")
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
    if (amount === null || amount === undefined) {
      return "₹0.00";
    }

    return `₹${Number(amount).toLocaleString("en-IN", {
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
  // CHECK NOC STATUS
  // =========================================================

  const getNocStatus = (loan) => {
    return String(loan?.nocStatus || "PENDING")
      .trim()
      .toUpperCase();
  };

  // =========================================================
  // GENERATE NOC
  // =========================================================

  const handleGenerateNoc = async (loan) => {
    const loanId = loan?.id;

    if (!loanId) {
      toast.error("Loan ID not found");
      return;
    }

    try {
      setGeneratingNocId(loanId);

      const response = await generateNoc(loanId);
      const updatedLoan = response.data;

      setLoans((prevLoans) =>
        prevLoans.map((item) =>
          item.id === loanId
            ? updatedLoan
            : item
        )
      );

      toast.success("NOC generated successfully");
    } catch (error) {
      console.error(
        "Failed to generate NOC:",
        error
      );

      const message =
        error.response?.data ||
        "Failed to generate NOC";

      toast.error(message);
    } finally {
      setGeneratingNocId(null);
    }
  };

  // =========================================================
  // CLOSE LOAN
  // =========================================================

  const handleCloseLoan = async (loan) => {
    const loanId = loan?.id;

    if (!loanId) {
      toast.error("Loan ID not found");
      return;
    }

    try {
      setClosingLoanId(loanId);

      await closeLoan(loanId);

      // CLOSED loans should no longer appear
      // in Completed Loans.

      setLoans((prevLoans) =>
        prevLoans.filter(
          (item) => item.id !== loanId
        )
      );

      toast.success("Loan closed successfully");
    } catch (error) {
      console.error(
        "Failed to close loan:",
        error
      );

      const message =
        error.response?.data ||
        "Failed to close loan";

      toast.error(message);
    } finally {
      setClosingLoanId(null);
    }
  };

  // =========================================================
  // NOC STATUS BADGE
  // =========================================================

  const renderNocStatus = (loan) => {
    const status = getNocStatus(loan);

    if (status === "GENERATED") {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 size={14} />
          GENERATED
        </span>
      );
    }

    if (status === "AVAILABLE") {
      return (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
          <FileCheck2 size={14} />
          AVAILABLE
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        <Loader2 size={14} />
        PENDING
      </span>
    );
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
              Completed Loans
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              View all loans that have been fully completed
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchCompletedLoans(true)}
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
            SEARCH
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
                placeholder="Search Loan ID, Customer ID, Name or NOC..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-blue-900"
              />
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400 md:shrink-0">
              Showing{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {filteredLoans.length}
              </span>{" "}
              completed loan
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

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center px-4 sm:min-h-[300px]">
              <div className="flex items-center gap-3 text-center text-sm text-slate-500 dark:text-slate-400">
                <Loader2
                  size={20}
                  className="shrink-0 animate-spin text-blue-600"
                />

                Loading completed loans...
              </div>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-4 text-center sm:min-h-[300px] sm:px-6">

              <div className="mb-3 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <CheckCircle2
                  size={28}
                  className="text-slate-400 dark:text-slate-500"
                />
              </div>

              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                No completed loans found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                There are no completed loans matching your search.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1500px] text-left">

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
                      Completed Date
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      NOC Eligible Date
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      NOC Status
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      NOC Details
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
                    const nocStatus =
                      getNocStatus(loan);

                    const isGenerating =
                      generatingNocId === loan.id;

                    const isClosing =
                      closingLoanId === loan.id;

                    const canGenerateNoc =
                      nocStatus === "AVAILABLE";

                    const nocGenerated =
                      nocStatus === "GENERATED";

                    return (
                      <tr
                        key={loan.id || loan.loanId}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >

                        {/* LOAN ID */}

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {loan.loanId || "-"}
                          </span>

                          <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {formatDate(
                              loan.loanDate
                            )}
                          </div>
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-4">
                          <div className="whitespace-nowrap font-medium text-slate-800 dark:text-slate-100">
                            {loan.customerName || "-"}
                          </div>

                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {loan.customerId || "-"}
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

                        {/* COMPLETED DATE */}

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(
                            loan.completedDate ||
                              loan.completionDate ||
                              loan.updatedAt
                          )}
                        </td>

                        {/* NOC ELIGIBLE DATE */}

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                            {formatDate(
                              loan.nocEligibleDate
                            )}
                          </div>

                          {loan.nocEligibleDate && (
                            <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                              5 working days
                            </div>
                          )}
                        </td>

                        {/* NOC STATUS */}

                        <td className="px-5 py-4">
                          {renderNocStatus(loan)}
                        </td>

                        {/* NOC DETAILS */}

                        <td className="px-5 py-4">
                          {nocGenerated ? (
                            <div className="min-w-[130px]">
                              <div className="whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {loan.nocNumber || "-"}
                              </div>

                              <div className="mt-1 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                Generated:{" "}
                                {formatDate(
                                  loan.nocGeneratedDate
                                )}
                              </div>
                            </div>
                          ) : canGenerateNoc ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleGenerateNoc(
                                  loan
                                )
                              }
                              disabled={isGenerating}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isGenerating ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <FileCheck2
                                  size={15}
                                />
                              )}

                              {isGenerating
                                ? "Generating..."
                                : "Generate NOC"}
                            </button>
                          ) : (
                            <span className="whitespace-nowrap text-xs text-slate-400 dark:text-slate-500">
                              Not eligible yet
                            </span>
                          )}
                        </td>

                        {/* LOAN STATUS */}

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <CheckCircle2
                              size={14}
                            />

                            {loan.status ||
                              "COMPLETED"}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">

                            <Link
                              to={`/loans/${loan.id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                            >
                              <Eye size={15} />
                              View
                            </Link>

                            {nocGenerated && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCloseLoan(
                                    loan
                                  )
                                }
                                disabled={isClosing}
                                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
                              >
                                {isClosing ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <LockKeyhole
                                    size={15}
                                  />
                                )}

                                {isClosing
                                  ? "Closing..."
                                  : "Close Loan"}
                              </button>
                            )}

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
    </div>
  );
};

export default CompletedLoans;