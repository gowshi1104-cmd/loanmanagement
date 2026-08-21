import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Wallet,
  CheckCircle,
  IndianRupee,
  Percent,
  TrendingUp,
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
        "APPROVED"
    ).length;

    const totalLoanAmount = loans.reduce(
      (total, loan) =>
        total + Number(loan.loanAmount || 0),
      0
    );

    const averageInterest =
      totalLoans > 0
        ? loans.reduce(
            (total, loan) =>
              total + Number(loan.interestRate || 0),
            0
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
    switch (
      String(status || "").toUpperCase()
    ) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "COMPLETED":
      case "CLOSED":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500">
        Loading loans...
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Wallet
              size={28}
              className="text-blue-600"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              My Loans
            </h1>

            <p className="text-slate-500">
              View and track all your loan details.
            </p>
          </div>

        </div>

        <button
          onClick={loadLoans}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Refresh
        </button>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">

        {/* TOTAL LOANS */}

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Loans
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-800">
                {summary.totalLoans}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <Wallet
                size={21}
                className="text-blue-600"
              />
            </div>

          </div>

        </div>

        {/* APPROVED LOANS */}

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Approved Loans
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {summary.approvedLoans}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
              <CheckCircle
                size={21}
                className="text-green-600"
              />
            </div>

          </div>

        </div>

        {/* TOTAL LOAN AMOUNT */}

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div className="min-w-0">

              <p className="text-sm text-slate-500">
                Total Loan Amount
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600 truncate">
                ₹
                {summary.totalLoanAmount.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </p>

            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100">
              <IndianRupee
                size={21}
                className="text-purple-600"
              />
            </div>

          </div>

        </div>

        {/* AVERAGE INTEREST */}

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Average Interest
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                {summary.averageInterest.toFixed(2)}%
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
              <Percent
                size={21}
                className="text-orange-600"
              />
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          LOAN TABLE
      ===================================================== */}

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Loan Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loans.length > 0
                ? `Showing ${loans.length} loan${
                    loans.length > 1 ? "s" : ""
                  }`
                : "No loan records available"}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <TrendingUp
              size={20}
              className="text-blue-600"
            />
          </div>

        </div>

        {loans.length === 0 ? (

          <div className="py-20 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Wallet
                size={30}
                className="text-slate-400"
              />
            </div>

            <h3 className="text-lg font-semibold text-slate-700">
              No loans found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              You currently don't have any loan records.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 border-b">

                <tr>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Loan ID
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Loan Amount
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Interest
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Tenure
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Status
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {loans.map((loan) => (

                  <tr
                    key={
                      loan.id ||
                      loan.loanId
                    }
                    className="border-b last:border-b-0 hover:bg-slate-50 transition"
                  >

                    {/* LOAN ID */}

                    <td className="px-6 py-5 font-semibold text-blue-600">
                      {loan.loanId || "-"}
                    </td>

                    {/* LOAN AMOUNT */}

                    <td className="px-6 py-5 font-medium text-slate-700">
                      ₹
                      {Number(
                        loan.loanAmount || 0
                      ).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </td>

                    {/* INTEREST */}

                    <td className="px-6 py-5 text-slate-700">
                      {loan.interestRate ?? 0}%
                    </td>

                    {/* TENURE */}

                    <td className="px-6 py-5 text-slate-700">
                      {loan.tenureMonths ?? 0} months
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-5">

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusClass(
                          loan.status
                        )}`}
                      >

                        {String(
                          loan.status || ""
                        ).toUpperCase() ===
                          "APPROVED" && (
                          <CheckCircle
                            size={13}
                          />
                        )}

                        {loan.status || "-"}

                      </span>

                    </td>

                    {/* ACTION */}

                    <td className="px-6 py-5">

                      <button
                        onClick={() =>
                          navigate(
                            `/customer/loans/${
                              loan.id ||
                              loan.loanId
                            }`
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-blue-600 hover:bg-blue-100 transition"
                      >

                        <Eye size={16} />

                        View

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          PORTFOLIO SUMMARY
      ===================================================== */}

      {loans.length > 0 && (

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* LOAN OVERVIEW */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Wallet
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-slate-800">
                  Loan Overview
                </h2>

                <p className="text-sm text-slate-500">
                  Your current loan portfolio
                </p>
              </div>

            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Total Loans
                </span>

                <span className="font-semibold text-slate-800">
                  {summary.totalLoans}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Approved Loans
                </span>

                <span className="font-semibold text-green-600">
                  {summary.approvedLoans}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Total Sanctioned Amount
                </span>

                <span className="font-semibold text-blue-600">
                  ₹
                  {summary.totalLoanAmount.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>

              </div>

            </div>

          </div>

          {/* APPROVAL PROGRESS */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle
                  size={20}
                  className="text-green-600"
                />
              </div>

              <div>
                <h2 className="font-semibold text-slate-800">
                  Loan Status
                </h2>

                <p className="text-sm text-slate-500">
                  Approval overview
                </p>
              </div>

            </div>

            <div className="mb-3 flex items-center justify-between">

              <span className="text-sm text-slate-500">
                Approved
              </span>

              <span className="font-semibold text-green-600">
                {summary.totalLoans > 0
                  ? Math.round(
                      (summary.approvedLoans /
                        summary.totalLoans) *
                        100
                    )
                  : 0}
                %
              </span>

            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${
                    summary.totalLoans > 0
                      ? Math.min(
                          100,
                          (summary.approvedLoans /
                            summary.totalLoans) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />

            </div>

            <p className="mt-4 text-sm text-slate-500">
              {summary.approvedLoans} of{" "}
              {summary.totalLoans} loan
              {summary.totalLoans !== 1
                ? "s"
                : ""}{" "}
              approved.
            </p>

          </div>

        </div>

      )}

    </div>
  );
};

export default MyLoans;