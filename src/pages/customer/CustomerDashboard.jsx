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
  Banknote,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CircleDollarSign,
} from "lucide-react";
import { getCustomerDashboard } from "../../services/customerService";
import useAuth from "../../hooks/useAuth";

const CustomerDashboard = () => {
  const { user } = useAuth();

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
            setError("Your session has expired. Please login again.");
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
      <div className="flex min-h-[500px] w-full items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />

          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
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
      <div className="w-full min-w-0 bg-slate-50 p-3 sm:p-4 md:p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 sm:p-6 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 sm:h-11 sm:w-11 dark:bg-red-900/50">
              <AlertCircle size={22} />
            </div>

            <div className="min-w-0">
              <p className="font-semibold">
                Unable to load dashboard
              </p>

              <p className="mt-1 break-words text-sm">
                {error}
              </p>
            </div>
          </div>
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
  // CUSTOMER NAME
  // ===========================================================

  const customerName =
    dashboard?.customerName ||
    dashboard?.customer?.name ||
    dashboard?.name ||
    user?.name ||
    user?.fullName ||
    user?.customerName ||
    user?.username ||
    "Customer";

  // ===========================================================
  // GREETING
  // ===========================================================

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 17
      ? "Good Afternoon"
      : "Good Evening";

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
  // EMI STATUS
  // ===========================================================

  const getEmiStatus = () => {
    if (!nextEmi) {
      return "COMPLETED";
    }

    if (daysRemaining === null) {
      return "UPCOMING";
    }

    if (daysRemaining < 0) {
      return "OVERDUE";
    }

    if (daysRemaining === 0) {
      return "DUE TODAY";
    }

    return "UPCOMING";
  };

  const emiStatus = getEmiStatus();

  const getEmiStatusClasses = () => {
    if (emiStatus === "OVERDUE") {
      return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
    }

    if (emiStatus === "DUE TODAY") {
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300";
    }

    if (emiStatus === "COMPLETED") {
      return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300";
    }

    return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300";
  };

  // ===========================================================
  // DAYS MESSAGE
  // ===========================================================

  const getDaysMessage = () => {
    if (daysRemaining === null) {
      return "Upcoming payment";
    }

    if (daysRemaining < 0) {
      const overdueDays = Math.abs(daysRemaining);

      return `${overdueDays} ${
        overdueDays === 1 ? "day" : "days"
      } overdue`;
    }

    if (daysRemaining === 0) {
      return "Your EMI is due today";
    }

    if (daysRemaining === 1) {
      return "1 day remaining";
    }

    return `${daysRemaining} days remaining`;
  };

  // ===========================================================
  // DASHBOARD
  // ===========================================================

  return (
    <div className="min-h-full w-full min-w-0 overflow-x-hidden bg-slate-50 p-3 sm:p-4 md:p-6 dark:bg-slate-950">

      {/* =====================================================
          WELCOME HEADER
      ====================================================== */}

      <div className="mb-4 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 shadow-sm sm:mb-6 dark:border-blue-900/60">
        <div className="relative p-4 sm:p-5 md:p-6">

          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />

          <div className="absolute -bottom-14 right-20 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">

            <div className="flex min-w-0 items-center gap-3 sm:gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm sm:h-14 sm:w-14">
                <Sparkles size={23} className="sm:h-[25px] sm:w-[25px]" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-blue-100">
                  {greeting}
                </p>

                <h1 className="mt-0.5 break-words text-2xl font-bold text-white sm:text-3xl">
                  {customerName}
                </h1>

                <p className="mt-1 break-words text-xs leading-5 text-blue-100 sm:text-sm">
                  Welcome back! Here&apos;s your loan account overview.
                </p>
              </div>
            </div>

            <Link
              to="/customer/loans"
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 sm:w-auto"
            >
              View My Loans
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">

        {/* TOTAL LOANS */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Loans
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                {totalLoans}
              </p>

              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Total loan accounts
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <CreditCard size={21} />
            </div>
          </div>
        </div>

        {/* ACTIVE LOANS */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Active Loans
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {activeLoans}
              </p>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <CheckCircle2 size={13} />
                Currently active
              </div>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400">
              <TrendingUp size={21} />
            </div>
          </div>
        </div>

        {/* TOTAL PAID */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Paid
              </p>

              <p className="mt-2 break-words text-xl font-bold text-blue-600 sm:text-2xl dark:text-blue-400">
                {formatMoney(totalPaid)}
              </p>

              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Amount paid so far
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <IndianRupee size={21} />
            </div>
          </div>
        </div>

        {/* OUTSTANDING */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Outstanding
              </p>

              <p className="mt-2 break-words text-xl font-bold text-orange-600 sm:text-2xl dark:text-orange-400">
                {formatMoney(outstandingAmount)}
              </p>

              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Amount remaining
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
              <Wallet size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          NEXT EMI + QUICK ACTIONS
      ====================================================== */}

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-3">

        {/* NEXT EMI */}

        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 xl:col-span-2">

          <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-slate-700">
            <div className="flex min-w-0 items-start justify-between gap-3">

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Next EMI
                  </h2>

                  {nextEmi && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${getEmiStatusClasses()}`}
                    >
                      {emiStatus}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
                  Your next scheduled EMI payment
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 sm:h-11 sm:w-11 dark:bg-blue-950/60 dark:text-blue-400">
                <CalendarDays size={20} />
              </div>
            </div>
          </div>

          {nextEmi ? (
            <div className="p-4 sm:p-5">

              {/* EMI MAIN HIGHLIGHT */}

              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5 dark:border-blue-900/50 dark:from-blue-950/40 dark:to-indigo-950/30">

                <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                      EMI Amount
                    </p>

                    <p className="mt-1 break-words text-2xl font-bold text-blue-700 sm:text-3xl dark:text-blue-300">
                      {formatMoney(nextEmi.amount)}
                    </p>

                    <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 sm:text-sm dark:text-slate-300">

                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <CalendarDays size={15} className="shrink-0" />
                        <span>{formattedEmiDate}</span>
                      </span>

                      {nextEmi.loanId && (
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                          <CreditCard size={15} className="shrink-0" />
                          <span className="break-all">
                            Loan #{nextEmi.loanId}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PAY NOW */}

                  <Link
                    to="/payments/add"
                    className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition sm:w-auto ${
                      emiStatus === "OVERDUE"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <Banknote size={18} />
                    Pay Now
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* EMI DETAILS */}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="min-w-0 rounded-xl bg-slate-50 p-3.5 sm:p-4 dark:bg-slate-800">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Loan ID
                  </p>

                  <p className="mt-2 break-all font-bold text-slate-900 dark:text-slate-100">
                    {nextEmi.loanId || "-"}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl bg-blue-50 p-3.5 sm:p-4 dark:bg-blue-950/40">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-500 dark:text-blue-400">
                    EMI Amount
                  </p>

                  <p className="mt-2 break-words text-lg font-bold text-blue-700 dark:text-blue-300">
                    {formatMoney(nextEmi.amount)}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl bg-orange-50 p-3.5 sm:p-4 dark:bg-orange-950/40">
                  <p className="text-xs font-medium uppercase tracking-wide text-orange-500 dark:text-orange-400">
                    Due Date
                  </p>

                  <p className="mt-2 break-words font-bold text-orange-700 dark:text-orange-300">
                    {formattedEmiDate}
                  </p>
                </div>
              </div>

              {/* DAYS LEFT */}

              <div
                className={`mt-4 flex min-w-0 flex-col gap-4 rounded-xl border p-3.5 sm:p-4 sm:flex-row sm:items-center sm:justify-between ${
                  emiStatus === "OVERDUE"
                    ? "border-red-100 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30"
                    : emiStatus === "DUE TODAY"
                    ? "border-orange-100 bg-orange-50 dark:border-orange-900/60 dark:bg-orange-950/30"
                    : "border-blue-100 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/30"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      emiStatus === "OVERDUE"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300"
                        : emiStatus === "DUE TODAY"
                        ? "bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300"
                        : "bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                    }`}
                  >
                    {emiStatus === "OVERDUE" ? (
                      <AlertCircle size={19} />
                    ) : (
                      <Clock3 size={19} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`break-words text-sm font-semibold ${
                        emiStatus === "OVERDUE"
                          ? "text-red-700 dark:text-red-300"
                          : emiStatus === "DUE TODAY"
                          ? "text-orange-700 dark:text-orange-300"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {getDaysMessage()}
                    </p>

                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Keep your EMI payments up to date.
                    </p>
                  </div>
                </div>

                <Link
                  to="/customer/emi-schedule"
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:w-auto dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
                >
                  View Schedule
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center sm:p-10">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400">
                <CheckCircle2 size={29} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
                All EMIs Are Up to Date
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm leading-5 text-slate-500 dark:text-slate-400">
                You currently have no upcoming EMI payment. Your loan account is up to date.
              </p>

              <Link
                to="/customer/emi-schedule"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                View EMI Schedule
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* ===================================================
            QUICK ACTIONS
        ==================================================== */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">

          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2">

              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Quick Actions
              </h2>

              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                MY ACCOUNT
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Access your account quickly
            </p>
          </div>

          <div className="space-y-3">

            {/* MY LOANS */}

            <Link
              to="/customer/loans"
              className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
            >
              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <CreditCard size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    My Loans
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    View loan details
                  </p>
                </div>
              </div>

              <ArrowRight
                size={17}
                className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400"
              />
            </Link>

            {/* EMI SCHEDULE */}

            <Link
              to="/customer/emi-schedule"
              className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-purple-200 hover:bg-purple-50 dark:border-slate-700 dark:hover:border-purple-800 dark:hover:bg-purple-950/30"
            >
              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <CalendarDays size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    EMI Schedule
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    View upcoming EMIs
                  </p>
                </div>
              </div>

              <ArrowRight
                size={17}
                className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-purple-600 dark:text-slate-500 dark:group-hover:text-purple-400"
              />
            </Link>

            {/* PAYMENT HISTORY */}

            <Link
              to="/customer/payment-history"
              className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-green-200 hover:bg-green-50 dark:border-slate-700 dark:hover:border-green-800 dark:hover:bg-green-950/30"
            >
              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400">
                  <Receipt size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Payment History
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    View your payments
                  </p>
                </div>
              </div>

              <ArrowRight
                size={17}
                className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-green-600 dark:text-slate-500 dark:group-hover:text-green-400"
              />
            </Link>

            {/* PROFILE */}

            <Link
              to="/settings/profile"
              className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-orange-200 hover:bg-orange-50 dark:border-slate-700 dark:hover:border-orange-800 dark:hover:bg-orange-950/30"
            >
              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
                  <UserCircle size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    My Profile
                  </p>

                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    View profile details
                  </p>
                </div>
              </div>

              <ArrowRight
                size={17}
                className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-orange-600 dark:text-slate-500 dark:group-hover:text-orange-400"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          LOAN PAYMENT PROGRESS
      ====================================================== */}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-5 dark:border-slate-700 dark:bg-slate-900">

        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">

              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Loan Payment Progress
              </h2>

              <ShieldCheck
                size={18}
                className="text-green-600 dark:text-green-400"
              />
            </div>

            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500 dark:text-slate-400">
              Overview of the amount you have paid and the remaining balance.
            </p>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {paymentProgress.toFixed(1)}%
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paid
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}

        <div className="mt-5">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{
                width: `${paymentProgress}%`,
              }}
            />
          </div>
        </div>

        {/* PROGRESS DETAILS */}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4">

          <div className="min-w-0 rounded-xl bg-slate-50 p-3.5 sm:p-4 dark:bg-slate-800">
            <div className="flex items-center gap-2">

              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Loan Value
              </p>
            </div>

            <p className="mt-2 break-words font-bold text-slate-900 dark:text-slate-100">
              {formatMoney(totalLoanValue)}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-green-50 p-3.5 sm:p-4 dark:bg-green-950/30">
            <div className="flex items-center gap-2">

              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500" />

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Paid Amount
              </p>
            </div>

            <p className="mt-2 break-words font-bold text-green-700 dark:text-green-400">
              {formatMoney(totalPaid)}
            </p>
          </div>

          <div className="min-w-0 rounded-xl bg-orange-50 p-3.5 sm:p-4 dark:bg-orange-950/30">
            <div className="flex items-center gap-2">

              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Remaining
              </p>
            </div>

            <p className="mt-2 break-words font-bold text-orange-700 dark:text-orange-400">
              {formatMoney(outstandingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          ACCOUNT OVERVIEW
      ====================================================== */}

      <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:mt-6 sm:gap-6 md:grid-cols-2">

        {/* LOAN STATUS */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-400">
              <CheckCircle2 size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">
                Loan Status
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current account status
              </p>
            </div>
          </div>

          <div className="mt-5 flex min-w-0 items-center justify-between gap-3 rounded-xl bg-green-50 p-3.5 sm:p-4 dark:bg-green-950/30">

            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active Loans
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                {activeLoans}
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1.5 text-[11px] font-semibold text-green-700 sm:px-3 dark:bg-green-900/60 dark:text-green-300">
              <CheckCircle2 size={14} />
              ACTIVE
            </span>
          </div>
        </div>

        {/* ACCOUNT OVERVIEW */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <FileText size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">
                Account Overview
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your loan account
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">

            <Link
              to="/settings/profile"
              className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 p-3 text-center text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:gap-2 sm:text-sm dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <UserCircle size={16} className="shrink-0" />
              Profile
            </Link>

            <Link
              to="/customer/payment-history"
              className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 p-3 text-center text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:gap-2 sm:text-sm dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Receipt size={16} className="shrink-0" />
              Payments
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          FOOTER ACCOUNT SUMMARY
      ====================================================== */}

      <div className="mt-5 flex min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900">

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <CircleDollarSign size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Stay on top of your repayments
            </p>

            <p className="break-words text-xs leading-5 text-slate-500 dark:text-slate-400">
              Review your EMI schedule regularly to avoid missed payments.
            </p>
          </div>
        </div>

        <Link
          to="/customer/emi-schedule"
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 sm:w-auto dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Check EMI Schedule
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default CustomerDashboard;