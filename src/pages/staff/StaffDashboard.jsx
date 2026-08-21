import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  HandCoins,
  Clock3,
  CheckCircle,
  XCircle,
  Activity,
  CircleCheckBig,
  IndianRupee,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  UserRound,
  WalletCards,
  AlertCircle,
  TrendingUp,
  FileText,
} from "lucide-react";

import RecentLoansTable from "../../components/tables/RecentLoansTable";
import { getStaffDashboardStats } from "../../services/staffDashboardService";
import useAuth from "../../hooks/useAuth";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const dashboardRoutes = {
    loans: "/loans",
    addLoan: "/loans/add",
    payments: "/payments",
    customers: "/members",
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  const loadDashboard = useCallback(async () => {
    try {
      const data = await getStaffDashboardStats();

      console.log("Staff Dashboard Data:", data);

      setDashboard(data);
    } catch (error) {
      console.error("Staff Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // REFRESH DASHBOARD
  // =========================================================

  const refreshDashboard = useCallback(async () => {
    try {
      setRefreshing(true);

      const data = await getStaffDashboardStats();

      console.log("Staff Dashboard Refresh Data:", data);

      setDashboard(data);
    } catch (error) {
      console.error("Staff Dashboard Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH EVERY 10 SECONDS
  // =========================================================

  useEffect(() => {
    // Initial API call
    loadDashboard();

    // Automatically trigger refresh button action every 10 seconds
    const refreshInterval = setInterval(() => {
      refreshDashboard();
    }, 10000);

    // Cleanup when leaving dashboard
    return () => {
      clearInterval(refreshInterval);
    };
  }, [loadDashboard, refreshDashboard]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-3xl bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 rounded-2xl bg-slate-200"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="h-72 rounded-2xl bg-slate-200 xl:col-span-2" />
          <div className="h-72 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (!dashboard) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-700">
          Unable to load dashboard
        </h2>

        <p className="mt-1 text-sm text-red-600">
          Please refresh the page and try again.
        </p>

        <button
          onClick={loadDashboard}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  // =========================================================
  // HELPERS
  // =========================================================

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const getUserName = () => {
    return (
      user?.fullName ||
      user?.name ||
      user?.username ||
      dashboard?.staffName ||
      "Staff"
    );
  };

  const firstName = getUserName().split(" ")[0];

  // =========================================================
  // DASHBOARD NUMBERS
  // =========================================================

  const totalLoans = Number(dashboard.totalLoans || 0);
  const pendingLoans = Number(dashboard.pendingLoans || 0);
  const approvedLoans = Number(dashboard.approvedLoans || 0);
  const rejectedLoans = Number(dashboard.rejectedLoans || 0);
  const activeLoans = Number(dashboard.activeLoans || 0);
  const completedLoans = Number(dashboard.completedLoans || 0);

  const totalLoanAmount = Number(
    dashboard.totalLoanAmount || 0
  );

  const approvedLoanAmount = Number(
    dashboard.approvedLoanAmount || 0
  );

  const activeLoanAmount = Number(
    dashboard.activeLoanAmount || 0
  );

  const recentLoans = dashboard.recentLoans || [];

  // =========================================================
  // PERCENTAGE
  // =========================================================

  const percentage = (value, total) => {
    if (!total || total <= 0) return 0;

    return Math.min(
      100,
      Math.round((value / total) * 100)
    );
  };

  const pendingPercentage = percentage(
    pendingLoans,
    totalLoans
  );

  const approvedPercentage = percentage(
    approvedLoans,
    totalLoans
  );

  const activePercentage = percentage(
    activeLoans,
    totalLoans
  );

  const completedPercentage = percentage(
    completedLoans,
    totalLoans
  );

  // =========================================================
  // TODAY
  // =========================================================

  const today = new Date();

  const formattedDate = today.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const hour = today.getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
        ? "Good Afternoon"
        : "Good Evening";

  // =========================================================
  // ATTENTION ITEMS
  // =========================================================

  const attentionItems = [
    {
      title: "Pending Applications",
      value: pendingLoans,
      description: "Applications awaiting review",
      icon: Clock3,
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      route: dashboardRoutes.loans,
    },
    {
      title: "Approved Loans",
      value: approvedLoans,
      description: "Loans approved by management",
      icon: CheckCircle,
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      route: dashboardRoutes.loans,
    },
    {
      title: "Rejected Loans",
      value: rejectedLoans,
      description: "Applications rejected",
      icon: AlertCircle,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      route: dashboardRoutes.loans,
    },
  ];

  // =========================================================
  // LOAN PIPELINE
  // =========================================================

  const pipeline = [
    {
      label: "Pending",
      value: pendingLoans,
      percentage: pendingPercentage,
      icon: Clock3,
      color: "amber",
    },
    {
      label: "Approved",
      value: approvedLoans,
      percentage: approvedPercentage,
      icon: CheckCircle,
      color: "emerald",
    },
    {
      label: "Active",
      value: activeLoans,
      percentage: activePercentage,
      icon: Activity,
      color: "blue",
    },
    {
      label: "Completed",
      value: completedLoans,
      percentage: completedPercentage,
      icon: CircleCheckBig,
      color: "slate",
    },
  ];

  // =========================================================
  // STAFF SNAPSHOT
  // =========================================================

  const staffStats = [
    {
      title: "My Loans",
      value: totalLoans,
      icon: HandCoins,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      description: "Loans created by you",
      route: dashboardRoutes.loans,
    },
    {
      title: "Pending",
      value: pendingLoans,
      icon: Clock3,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      description: "Awaiting management review",
      route: dashboardRoutes.loans,
    },
    {
      title: "Approved",
      value: approvedLoans,
      icon: CheckCircle,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      description: "Approved applications",
      route: dashboardRoutes.loans,
    },
    {
      title: "Active",
      value: activeLoans,
      icon: Activity,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      description: "Currently active loans",
      route: dashboardRoutes.loans,
    },
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6 pb-8">

      {/* =====================================================
          WELCOME HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg">

        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5" />

        <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-blue-500/10" />

        <div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          <div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">

              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

              Staff Workspace

            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting}, {firstName} 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Welcome back, {getUserName()}.
              Manage your loan applications, track approval status
              and monitor your assigned loan activity from one place.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">

              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                Staff monitoring active
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

              <span className="flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5 text-blue-400" />
                Loan application tracking
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

              <span className="flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
                Loan amount monitoring
              </span>

            </div>
          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CalendarDays className="h-4 w-4" />
                Today
              </div>

              <p className="mt-1 text-sm font-semibold">
                {formattedDate}
              </p>

            </div>

            {/* MANUAL REFRESH BUTTON */}

            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition hover:bg-white/15 disabled:opacity-60"
              title="Refresh dashboard"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
            </button>

          </div>
        </div>
      </section>

      {/* =====================================================
          STAFF SNAPSHOT
      ====================================================== */}

      <section>

        <div className="mb-3 flex items-center justify-between">

          <div>
            <h2 className="text-base font-bold text-slate-800">
              My Work Snapshot
            </h2>

            <p className="text-xs text-slate-500">
              Your loan activity at a glance
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            Live overview
          </span>

        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

          {staffStats.map((item) => {

            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => navigate(item.route)}
                className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >

                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${item.iconColor}`}
                    />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />

                </div>

                <div className="mt-4">

                  <p className="text-2xl font-bold tracking-tight text-slate-800">
                    {item.value.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-700">
                    {item.title}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {item.description}
                  </p>

                </div>

              </button>
            );
          })}

        </div>
      </section>

      {/* =====================================================
          MAIN MONITORING GRID
      ====================================================== */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* LOAN PIPELINE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">

          <div className="flex items-start justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    My Loan Pipeline
                  </h2>

                  <p className="text-xs text-slate-400">
                    Your application lifecycle
                  </p>
                </div>

              </div>

            </div>

            <div className="text-right">

              <p className="text-2xl font-bold text-slate-800">
                {totalLoans}
              </p>

              <p className="text-[11px] text-slate-400">
                Total loans
              </p>

            </div>

          </div>

          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-slate-100">

            {pendingPercentage > 0 && (
              <div
                className="bg-amber-400"
                style={{
                  width: `${pendingPercentage}%`,
                }}
              />
            )}

            {approvedPercentage > 0 && (
              <div
                className="bg-emerald-500"
                style={{
                  width: `${approvedPercentage}%`,
                }}
              />
            )}

            {activePercentage > 0 && (
              <div
                className="bg-blue-500"
                style={{
                  width: `${activePercentage}%`,
                }}
              />
            )}

            {completedPercentage > 0 && (
              <div
                className="bg-slate-500"
                style={{
                  width: `${completedPercentage}%`,
                }}
              />
            )}

          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

            {pipeline.map((item) => {

              const Icon = item.icon;

              const colorMap = {
                amber: {
                  bg: "bg-amber-50",
                  icon: "text-amber-600",
                  dot: "bg-amber-400",
                },
                emerald: {
                  bg: "bg-emerald-50",
                  icon: "text-emerald-600",
                  dot: "bg-emerald-500",
                },
                blue: {
                  bg: "bg-blue-50",
                  icon: "text-blue-600",
                  dot: "bg-blue-500",
                },
                slate: {
                  bg: "bg-slate-100",
                  icon: "text-slate-600",
                  dot: "bg-slate-500",
                },
              };

              const colors = colorMap[item.color];

              return (
                <div
                  key={item.label}
                  className="rounded-xl bg-slate-50 p-3"
                >

                  <div className="flex items-center justify-between">

                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors.bg}`}
                    >
                      <Icon
                        className={`h-4 w-4 ${colors.icon}`}
                      />
                    </div>

                    <span
                      className={`h-2 w-2 rounded-full ${colors.dot}`}
                    />

                  </div>

                  <p className="mt-3 text-xl font-bold text-slate-800">
                    {item.value}
                  </p>

                  <p className="text-xs font-medium text-slate-600">
                    {item.label}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {item.percentage}% of total
                  </p>

                </div>
              );
            })}

          </div>
        </div>

        {/* NEEDS ATTENTION */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>

            <div>

              <h2 className="text-sm font-bold text-slate-800">
                My Loan Status
              </h2>

              <p className="text-xs text-slate-400">
                Current application status
              </p>

            </div>

          </div>

          <div className="mt-5 space-y-2">

            {attentionItems.map((item) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left ${item.bg} transition duration-200 hover:-translate-y-0.5 hover:shadow-sm`}
                >

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
                  >
                    <Icon
                      className={`h-4 w-4 ${item.iconColor}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-xs font-semibold text-slate-700">
                      {item.title}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {item.description}
                    </p>

                  </div>

                  <span className="text-lg font-bold text-slate-800">
                    {item.value}
                  </span>

                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />

                </button>
              );
            })}

          </div>
        </div>

      </section>

      {/* =====================================================
          LOAN AMOUNT + QUICK ACTIONS
      ====================================================== */}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* LOAN AMOUNT MONITOR */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>

              <div>

                <h2 className="text-sm font-bold text-slate-800">
                  Loan Amount Monitor
                </h2>

                <p className="text-xs text-slate-400">
                  Your loan portfolio value
                </p>

              </div>

            </div>

            <WalletCards className="h-5 w-5 text-slate-300" />

          </div>

          <div className="mt-6">

            <p className="text-xs font-medium text-slate-400">
              Total loan amount
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
              {formatAmount(totalLoanAmount)}
            </p>

          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-emerald-50 p-3">

              <div className="flex items-center gap-1.5">

                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />

                <span className="text-[10px] font-medium text-slate-500">
                  Approved Amount
                </span>

              </div>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {formatAmount(approvedLoanAmount)}
              </p>

            </div>

            <div className="rounded-xl bg-blue-50 p-3">

              <div className="flex items-center gap-1.5">

                <Activity className="h-3.5 w-3.5 text-blue-600" />

                <span className="text-[10px] font-medium text-slate-500">
                  Active Amount
                </span>

              </div>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {formatAmount(activeLoanAmount)}
              </p>

            </div>

          </div>
        </div>

        {/* QUICK ACTIONS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>

            <div>

              <h2 className="text-sm font-bold text-slate-800">
                Quick Actions
              </h2>

              <p className="text-xs text-slate-400">
                Common staff actions
              </p>

            </div>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={() => navigate(dashboardRoutes.addLoan)}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500" />

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-700">
                Create Loan
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Add new application
              </p>

            </button>

            <button
              type="button"
              onClick={() => navigate(dashboardRoutes.loans)}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                  <HandCoins className="h-4 w-4 text-emerald-600" />
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500" />

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-700">
                My Loans
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                View your applications
              </p>

            </button>

            <button
              type="button"
              onClick={() => navigate(dashboardRoutes.customers)}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
                  <UserRound className="h-4 w-4 text-indigo-600" />
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" />

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-700">
                Customers
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Manage customers
              </p>

            </button>

            <button
              type="button"
              onClick={() => navigate(dashboardRoutes.payments)}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                  <WalletCards className="h-4 w-4 text-purple-600" />
                </div>

                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-purple-500" />

              </div>

              <p className="mt-3 text-xs font-semibold text-slate-700">
                Payments
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Payment activity
              </p>

            </button>

          </div>
        </div>

      </section>

      {/* =====================================================
          LOAN STATUS
      ====================================================== */}

      <section>

        <div className="mb-3 flex items-center justify-between">

          <div>

            <h2 className="text-base font-bold text-slate-800">
              My Loan Status
            </h2>

            <p className="text-xs text-slate-500">
              Current portfolio distribution
            </p>

          </div>

          <HandCoins className="h-5 w-5 text-slate-300" />

        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

          {[
            {
              title: "Pending",
              value: pendingLoans,
              icon: Clock3,
              bg: "bg-amber-50",
              iconColor: "text-amber-600",
            },
            {
              title: "Approved",
              value: approvedLoans,
              icon: CheckCircle,
              bg: "bg-emerald-50",
              iconColor: "text-emerald-600",
            },
            {
              title: "Rejected",
              value: rejectedLoans,
              icon: XCircle,
              bg: "bg-red-50",
              iconColor: "text-red-600",
            },
            {
              title: "Active",
              value: activeLoans,
              icon: Activity,
              bg: "bg-blue-50",
              iconColor: "text-blue-600",
            },
            {
              title: "Completed",
              value: completedLoans,
              icon: CircleCheckBig,
              bg: "bg-slate-100",
              iconColor: "text-slate-600",
            },
          ].map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
                >
                  <Icon
                    className={`h-4 w-4 ${item.iconColor}`}
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-[11px] font-medium text-slate-400">
                    {item.title}
                  </p>

                  <p className="text-xl font-bold text-slate-800">
                    {item.value}
                  </p>

                </div>

              </div>
            );
          })}

        </div>
      </section>

      {/* =====================================================
          RECENT LOANS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>

            <div>

              <h2 className="text-sm font-bold text-slate-800">
                Recent Loan Applications
              </h2>

              <p className="text-xs text-slate-400">
                Latest loans created by you
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() => navigate(dashboardRoutes.loans)}
            className="group flex items-center gap-1"
          >

            <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600">
              View all
            </span>

            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600" />

          </button>

        </div>

        <RecentLoansTable loans={recentLoans} />

      </section>

    </div>
  );
};

export default StaffDashboard;