import { useEffect, useMemo, useState } from "react";

import {
  Eye,
  Wallet,
  CheckCircle,
  IndianRupee,
  Percent,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getMyLoans } from "../../services/customerService";

const MyLoans = () => {
  const navigate = useNavigate();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);

      const response = await getMyLoans();

      setLoans(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("My Loans Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SUMMARY VALUES
  // =========================================================

  const summary = useMemo(() => {
    const totalLoans = loans.length;

    const approvedLoans = loans.filter(
      (loan) =>
        String(loan.status || "").toUpperCase() ===
        "APPROVED",
    ).length;

    const totalLoanAmount = loans.reduce(
      (total, loan) =>
        total + Number(loan.loanAmount || 0),
      0,
    );

    const averageInterest =
      totalLoans > 0
        ? loans.reduce(
            (total, loan) =>
              total +
              Number(loan.interestRate || 0),
            0,
          ) / totalLoans
        : 0;

    return {
      totalLoans,
      approvedLoans,
      totalLoanAmount,
      averageInterest,
    };
  }, [loans]);

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "APPROVED":
        return "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400";

      case "REJECTED":
        return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";

      case "COMPLETED":
      case "CLOSED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";

      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const StatusIcon = ({ status }) => {
    const normalized = String(
      status || "",
    ).toUpperCase();

    if (normalized === "APPROVED") {
      return <CheckCircle size={13} />;
    }

    return null;
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
    )}`;
  };

  // =========================================================
  // EMI SCHEDULE
  // =========================================================

  const openEmiSchedule = (loan) => {
    if (!loan.id) {
      console.error(
        "EMI Schedule: Database loan ID is missing",
        loan,
      );
      return;
    }

    console.log(
      "Opening EMI Schedule for DB Loan ID:",
      loan.id,
    );

    navigate(`/loan/emi-schedule/${loan.id}`);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50 px-4 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-7 w-7 animate-spin text-blue-600 dark:text-blue-400" />

          <p className="text-sm font-medium">
            Loading loans...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="w-full min-w-0 bg-slate-50 dark:bg-slate-950">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:h-12 sm:w-12 dark:bg-blue-950/60">
            <Wallet
              size={22}
              className="text-blue-600 sm:h-7 sm:w-7 dark:text-blue-400"
            />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl dark:text-slate-100">
              My Loans
            </h1>

            <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
              View and track all your loan details.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadLoans}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] sm:w-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL LOANS */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-sm">
                Total Loans
              </p>

              <p className="mt-1.5 text-xl font-bold text-slate-800 sm:mt-2 sm:text-2xl dark:text-slate-100">
                {summary.totalLoans}
              </p>
            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:flex dark:bg-blue-950/60">
              <Wallet
                size={21}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
          </div>
        </div>

        {/* APPROVED LOANS */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-sm">
                Approved Loans
              </p>

              <p className="mt-1.5 text-xl font-bold text-green-600 sm:mt-2 sm:text-2xl dark:text-green-400">
                {summary.approvedLoans}
              </p>
            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 sm:flex dark:bg-green-950/60">
              <CheckCircle
                size={21}
                className="text-green-600 dark:text-green-400"
              />
            </div>
          </div>
        </div>

        {/* TOTAL LOAN AMOUNT */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-sm">
                Total Loan Amount
              </p>

              <p className="mt-1.5 truncate text-lg font-bold text-blue-600 sm:mt-2 sm:text-2xl dark:text-blue-400">
                {formatCurrency(
                  summary.totalLoanAmount,
                )}
              </p>
            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 sm:flex dark:bg-purple-950/60">
              <IndianRupee
                size={21}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
          </div>
        </div>

        {/* AVERAGE INTEREST */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:text-sm">
                Average Interest
              </p>

              <p className="mt-1.5 text-xl font-bold text-orange-600 sm:mt-2 sm:text-2xl dark:text-orange-400">
                {summary.averageInterest.toFixed(2)}%
              </p>
            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 sm:flex dark:bg-orange-950/60">
              <Percent
                size={21}
                className="text-orange-600 dark:text-orange-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          LOAN TABLE / CARDS
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5 dark:border-slate-700">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-800 sm:text-lg dark:text-slate-100">
              Loan Details
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              {loans.length > 0
                ? `Showing ${loans.length} loan${
                    loans.length > 1 ? "s" : ""
                  }`
                : "No loan records available"}
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 sm:h-10 sm:w-10 dark:bg-blue-950/50">
            <TrendingUp
              size={18}
              className="text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400"
            />
          </div>
        </div>

        {loans.length === 0 ? (
          <div className="px-5 py-16 text-center sm:py-20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Wallet
                size={30}
                className="text-slate-400 dark:text-slate-500"
              />
            </div>

            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              No loans found
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
              You currently don't have any loan
              records.
            </p>
          </div>
        ) : (
          <>
            {/* =================================================
                MOBILE LOAN CARDS
            ================================================= */}

            <div className="divide-y divide-slate-100 sm:hidden dark:divide-slate-800">
              {loans.map((loan) => {
                const status = String(
                  loan.status || "",
                ).toUpperCase();

                return (
                  <div
                    key={loan.id || loan.loanId}
                    className="p-4 transition active:bg-slate-50 dark:active:bg-slate-800/60"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Loan ID
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-blue-600 dark:text-blue-400">
                          {loan.loanId || "-"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${getStatusClass(
                          loan.status,
                        )}`}
                      >
                        <StatusIcon
                          status={loan.status}
                        />
                        {loan.status || "-"}
                      </span>
                    </div>

                    {/* Card Details */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Loan Amount
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                          {formatCurrency(
                            loan.loanAmount,
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Interest
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                          {loan.interestRate ?? 0}%
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Tenure
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                          {loan.tenureMonths ?? 0}{" "}
                          months
                        </p>
                      </div>

                      <div className="rounded-xl bg-blue-50/70 p-3 dark:bg-blue-950/20">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-blue-600/70 dark:text-blue-400/70">
                          Status
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {loan.status || "-"}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <button
                      type="button"
                      onClick={() => openEmiSchedule(loan)}
                      disabled={!loan.id}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/60"
                    >
                      <Wallet size={16} />
                      EMI Schedule
                    </button>
                  </div>
                );
              })}
            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[850px]">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Loan ID
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Loan Amount
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Interest
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Tenure
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loans.map((loan) => (
                    <tr
                      key={loan.id || loan.loanId}
                      className="border-b border-slate-200 transition last:border-b-0 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                    >
                      {/* LOAN ID */}
                      <td className="px-6 py-5 font-semibold text-blue-600 dark:text-blue-400">
                        {loan.loanId || "-"}
                      </td>

                      {/* LOAN AMOUNT */}
                      <td className="px-6 py-5 font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(
                          loan.loanAmount,
                        )}
                      </td>

                      {/* INTEREST */}
                      <td className="px-6 py-5 text-slate-700 dark:text-slate-300">
                        {loan.interestRate ?? 0}%
                      </td>

                      {/* TENURE */}
                      <td className="px-6 py-5 text-slate-700 dark:text-slate-300">
                        {loan.tenureMonths ?? 0}{" "}
                        months
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                            loan.status,
                          )}`}
                        >
                          <StatusIcon
                            status={loan.status}
                          />

                          {loan.status || "-"}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() =>
                            openEmiSchedule(loan)
                          }
                          disabled={!loan.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/60"
                        >
                          <Wallet size={16} />
                          EMI Schedule
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          PORTFOLIO SUMMARY
      ===================================================== */}

      {loans.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
          {/* LOAN OVERVIEW */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/60">
                <Wallet
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>

              <div className="min-w-0">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                  Loan Overview
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Your current loan portfolio
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Total Loans
                </span>

                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {summary.totalLoans}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Approved Loans
                </span>

                <span className="font-semibold text-green-600 dark:text-green-400">
                  {summary.approvedLoans}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Total Sanctioned Amount
                </span>

                <span className="truncate text-right font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(
                    summary.totalLoanAmount,
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* APPROVAL PROGRESS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/60">
                <CheckCircle
                  size={20}
                  className="text-green-600 dark:text-green-400"
                />
              </div>

              <div className="min-w-0">
                <h2 className="font-semibold text-slate-800 dark:text-slate-100">
                  Loan Status
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Approval overview
                </p>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Approved
              </span>

              <span className="font-semibold text-green-600 dark:text-green-400">
                {summary.totalLoans > 0
                  ? Math.round(
                      (summary.approvedLoans /
                        summary.totalLoans) *
                        100,
                    )
                  : 0}
                %
              </span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${
                    summary.totalLoans > 0
                      ? Math.min(
                          100,
                          (summary.approvedLoans /
                            summary.totalLoans) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <p className="mt-4 text-sm leading-5 text-slate-500 dark:text-slate-400">
              {summary.approvedLoans} of{" "}
              {summary.totalLoans} loan
              {summary.totalLoans !== 1 ? "s" : ""}{" "}
              approved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLoans;