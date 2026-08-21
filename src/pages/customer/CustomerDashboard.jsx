import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  CreditCard,
  IndianRupee,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Receipt,
  UserCircle,
  FileText,
} from "lucide-react";

import { getCustomerDashboard } from "../../services/customerService";

const CustomerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCustomerDashboard();

        console.log("CUSTOMER DASHBOARD RESPONSE:", data);

        if (mounted) {
          setDashboard(data);
        }
      } catch (err) {
        console.error("Customer Dashboard Error:", err);

        if (mounted) {
          if (err.response?.status === 403) {
            setError(
              "You do not have permission to view the customer dashboard."
            );
          } else if (err.response?.status === 401) {
            setError(
              "Your session has expired. Please login again."
            );
          } else {
            setError("Unable to load customer dashboard.");
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  // ===========================================================
  // LOADING
  // ===========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ===========================================================
  // ERROR
  // ===========================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">Unable to load dashboard</p>

          <p className="mt-1 text-sm">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ===========================================================
  // SAFE VALUES
  // ===========================================================

  const totalLoans = dashboard?.totalLoans ?? 0;

  const activeLoans = dashboard?.activeLoans ?? 0;

  const totalPaid = Number(
    dashboard?.totalPaidAmount ?? 0
  );

  const outstandingAmount = Number(
    dashboard?.outstandingAmount ?? 0
  );

  const nextEmi = dashboard?.nextEmi;

  // ===========================================================
  // FORMAT MONEY
  // ===========================================================

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ===========================================================
  // LOAN TOTAL + PROGRESS
  // ===========================================================

  const totalLoanValue =
    totalPaid + outstandingAmount;

  const paymentProgress =
    totalLoanValue > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (totalPaid / totalLoanValue) * 100
          )
        )
      : 0;

  // ===========================================================
  // EMI DATE
  // ===========================================================

  const emiDate = nextEmi?.date || null;

  const getDaysRemaining = () => {
    if (!emiDate) {
      return null;
    }

    const today = new Date();

    const dueDate = new Date(emiDate);

    if (Number.isNaN(dueDate.getTime())) {
      return null;
    }

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const difference =
      dueDate.getTime() - today.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  };

  const daysRemaining = getDaysRemaining();

  const formattedEmiDate = emiDate
    ? new Date(emiDate).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "-";

  // ===========================================================
  // DASHBOARD
  // ===========================================================

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Wallet size={23} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Customer Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Overview of your loans and payments
              </p>
            </div>

          </div>
        </div>

        <Link
          to="/customer/loans"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          View My Loans
          <ArrowRight size={17} />
        </Link>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL LOANS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Loans
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {totalLoans}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Total loan accounts
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <CreditCard size={21} />
            </div>

          </div>

        </div>

        {/* ACTIVE LOANS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Loans
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {activeLoans}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600">
                <CheckCircle2 size={13} />
                Currently active
              </div>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <TrendingUp size={21} />
            </div>

          </div>

        </div>

        {/* TOTAL PAID */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Paid
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {formatMoney(totalPaid)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Amount paid so far
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <IndianRupee size={21} />
            </div>

          </div>

        </div>

        {/* OUTSTANDING */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Outstanding Amount
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                {formatMoney(outstandingAmount)}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Amount remaining
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Wallet size={21} />
            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ===================================================
            NEXT EMI
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

          <div className="border-b border-slate-100 p-5">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Next EMI
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your upcoming EMI payment
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <CalendarDays size={21} />
              </div>

            </div>

          </div>

          {nextEmi ? (

            <div className="p-5">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                {/* LOAN */}

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Loan ID
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    {nextEmi.loanId || "-"}
                  </p>

                </div>

                {/* AMOUNT */}

                <div className="rounded-xl bg-blue-50 p-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                    EMI Amount
                  </p>

                  <p className="mt-2 text-xl font-bold text-blue-700">
                    {formatMoney(nextEmi.amount)}
                  </p>

                </div>

                {/* DATE */}

                <div className="rounded-xl bg-orange-50 p-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-orange-500">
                    Due Date
                  </p>

                  <p className="mt-2 font-bold text-orange-700">
                    {formattedEmiDate}
                  </p>

                </div>

              </div>

              {/* DAYS LEFT */}

              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600">
                    <Clock3 size={19} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      {daysRemaining !== null
                        ? daysRemaining > 0
                          ? `${daysRemaining} days remaining`
                          : daysRemaining === 0
                          ? "Due today"
                          : "Payment date passed"
                        : "Upcoming payment"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Keep your EMI payments up to date.
                    </p>

                  </div>

                </div>

                <Link
                  to="/customer/emi-schedule"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  View Schedule
                  <ArrowRight size={16} />
                </Link>

              </div>

            </div>

          ) : (

            <div className="p-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={26} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No Upcoming EMI
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                You currently have no upcoming EMI payment.
              </p>

            </div>

          )}

        </div>

        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4">

            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Access your account quickly
            </p>

          </div>

          <div className="space-y-3">

            <Link
              to="/customer/loans"
              className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <CreditCard size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    My Loans
                  </p>

                  <p className="text-xs text-slate-500">
                    View loan details
                  </p>
                </div>

              </div>

              <ArrowRight
                size={17}
                className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />

            </Link>

            <Link
              to="/customer/emi-schedule"
              className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-purple-200 hover:bg-purple-50"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    EMI Schedule
                  </p>

                  <p className="text-xs text-slate-500">
                    View upcoming EMIs
                  </p>
                </div>

              </div>

              <ArrowRight
                size={17}
                className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-purple-600"
              />

            </Link>

            <Link
              to="/customer/payment-history"
              className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-green-200 hover:bg-green-50"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <Receipt size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Payment History
                  </p>

                  <p className="text-xs text-slate-500">
                    View your payments
                  </p>
                </div>

              </div>

              <ArrowRight
                size={17}
                className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-green-600"
              />

            </Link>

            <Link
              to="/customer/profile"
              className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-orange-200 hover:bg-orange-50"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <UserCircle size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    My Profile
                  </p>

                  <p className="text-xs text-slate-500">
                    View profile details
                  </p>
                </div>

              </div>

              <ArrowRight
                size={17}
                className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-600"
              />

            </Link>

          </div>

        </div>

      </div>

      {/* =====================================================
          LOAN PAYMENT PROGRESS
      ====================================================== */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Loan Payment Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of the amount you have paid and the remaining balance.
            </p>

          </div>

          <div className="text-left sm:text-right">

            <p className="text-2xl font-bold text-blue-600">
              {paymentProgress.toFixed(1)}%
            </p>

            <p className="text-xs text-slate-500">
              Paid
            </p>

          </div>

        </div>

        {/* PROGRESS BAR */}

        <div className="mt-5">

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{
                width: `${paymentProgress}%`,
              }}
            />

          </div>

        </div>

        {/* PROGRESS DETAILS */}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl bg-slate-50 p-4">

            <div className="flex items-center gap-2">

              <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />

              <p className="text-sm text-slate-500">
                Total Loan Value
              </p>

            </div>

            <p className="mt-2 font-bold text-slate-900">
              {formatMoney(totalLoanValue)}
            </p>

          </div>

          <div className="rounded-xl bg-green-50 p-4">

            <div className="flex items-center gap-2">

              <div className="h-2.5 w-2.5 rounded-full bg-green-500" />

              <p className="text-sm text-slate-500">
                Paid Amount
              </p>

            </div>

            <p className="mt-2 font-bold text-green-700">
              {formatMoney(totalPaid)}
            </p>

          </div>

          <div className="rounded-xl bg-orange-50 p-4">

            <div className="flex items-center gap-2">

              <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />

              <p className="text-sm text-slate-500">
                Remaining
              </p>

            </div>

            <p className="mt-2 font-bold text-orange-700">
              {formatMoney(outstandingAmount)}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          ACCOUNT OVERVIEW
      ====================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* LOAN STATUS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Loan Status
              </h2>

              <p className="text-sm text-slate-500">
                Current account status
              </p>
            </div>

          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-green-50 p-4">

            <div>
              <p className="text-xs text-slate-500">
                Active Loans
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {activeLoans}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
              <CheckCircle2 size={14} />
              ACTIVE
            </span>

          </div>

        </div>

        {/* ACCOUNT SUPPORT */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <FileText size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Account Overview
              </h2>

              <p className="text-sm text-slate-500">
                Manage your loan account
              </p>
            </div>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">

            <Link
              to="/customer/profile"
              className="rounded-xl border border-slate-200 p-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Profile
            </Link>

            <Link
              to="/customer/payment-history"
              className="rounded-xl border border-slate-200 p-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Payments
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CustomerDashboard;