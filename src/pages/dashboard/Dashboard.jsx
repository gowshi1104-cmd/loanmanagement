import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Users,
  UserCog,
  ShieldCheck,
  HandCoins,
  Clock3,
  CheckCircle,
  XCircle,
  Activity,
  CircleCheckBig,
  IndianRupee,
  WalletCards,
  CircleDollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ClipboardList,
  UserRoundCheck,
  UserRoundX,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  BellRing,
  BadgeCheck,
} from "lucide-react";

import RecentLoansTable from "../../components/tables/RecentLoansTable";

import { getDashboardStats } from "../../services/dashboardService";

import useAuth from "../../hooks/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  // =========================================================
  // NAVIGATION
  // =========================================================

  // Change these 3 paths only if your actual routes are different.

  const dashboardRoutes = {
    loans: "/loans",
    team: "/settings/users",
    payments: "/payments",
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const data = await getDashboardStats();

      console.log("Admin Dashboard Data:", data);

      setDashboard(data);
    } catch (error) {
      console.error("Admin Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REFRESH DASHBOARD
  // =========================================================

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);

      const data = await getDashboardStats();

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // =========================================================
  // AUTO REFRESH EVERY 10 SECONDS
  // =========================================================

  useEffect(() => {
    loadDashboard();

    const intervalId = setInterval(() => {
      refreshDashboard();
    }, 10000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
      dashboard?.adminName ||
      "Admin"
    );
  };

  const firstName = getUserName().split(" ")[0];

  // =========================================================
  // NUMBERS
  // =========================================================

  const totalLoans = Number(dashboard.totalLoans || 0);

  const pendingLoans = Number(dashboard.pendingLoans || 0);

  const approvedLoans = Number(dashboard.approvedLoans || 0);

  const rejectedLoans = Number(dashboard.rejectedLoans || 0);

  const activeLoans = Number(dashboard.activeLoans || 0);

  const completedLoans = Number(dashboard.completedLoans || 0);

  const totalCustomers = Number(dashboard.totalCustomers || 0);

  const totalStaff = Number(dashboard.totalStaff || 0);

  const totalManagers = Number(dashboard.totalManagers || 0);

  const totalCollected = Number(dashboard.totalCollected || 0);

  const successfulPayments =
    Number(dashboard.successfulPayments || 0);

  const pendingPayments =
    Number(dashboard.pendingPayments || 0);

  const failedPayments =
    Number(dashboard.failedPayments || 0);

  const paymentTotal =
    successfulPayments +
    pendingPayments +
    failedPayments;

  // =========================================================
  // PERCENTAGES
  // =========================================================

  const percentage = (value, total) => {
    if (!total || total <= 0) return 0;

    return Math.min(
      100,
      Math.round((value / total) * 100)
    );
  };

  const pendingPercentage =
    percentage(pendingLoans, totalLoans);

  const approvedPercentage =
    percentage(approvedLoans, totalLoans);

  const activePercentage =
    percentage(activeLoans, totalLoans);

  const completedPercentage =
    percentage(completedLoans, totalLoans);

  const successfulPaymentPercentage =
    percentage(successfulPayments, paymentTotal);

  // =========================================================
  // TODAY
  // =========================================================

  const today = new Date();

  const formattedDate =
    today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

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
      title: "Pending Loan Applications",
      value: pendingLoans,
      description: "Need review",
      icon: Clock3,
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      route: dashboardRoutes.loans,
    },
    {
      title: "Pending Payments",
      value: pendingPayments,
      description: "Awaiting verification",
      icon: WalletCards,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      route: dashboardRoutes.payments,
    },
    {
      title: "Failed Payments",
      value: failedPayments,
      description: "Need attention",
      icon: AlertCircle,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      route: dashboardRoutes.payments,
    },
  ];

  const recentLoans = dashboard.recentLoans || [];

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
  // ORGANIZATION CARDS
  // =========================================================

  const organizationStats = [
    {
      title: "Customers",
      value: totalCustomers,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      description: "Registered customers",
    },
    {
      title: "Staff",
      value: totalStaff,
      icon: UserCog,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      description: "Team members",
    },
    {
      title: "Managers",
      value: totalManagers,
      icon: ShieldCheck,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      description: "Management team",
    },
    {
      title: "Loans",
      value: totalLoans,
      icon: HandCoins,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      description: "Total applications",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* =====================================================
          WELCOME HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg">
        {/* Decorative background */}

        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5" />

        <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-blue-500/10" />

        <div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            {/* Admin badge */}

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

              Admin Control Center
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting}, {firstName} 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Welcome back, {getUserName()}.
              Monitor everything across your loan operations,
              team performance, applications and collections from one place.
            </p>

            {/* Monitoring line */}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />

                Organization monitoring active
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />

                Management overview
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

              <span className="flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />

                Collection monitoring
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
          ORGANIZATION SNAPSHOT
      ====================================================== */}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Organization Snapshot
            </h2>

            <p className="text-xs text-slate-500">
              Your organization at a glance
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            Live overview
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {organizationStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          MAIN MONITORING GRID
      ====================================================== */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* ===================================================
            LOAN PIPELINE
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Loan Pipeline
                  </h2>

                  <p className="text-xs text-slate-400">
                    Application lifecycle
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

          {/* Pipeline bar */}

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

          {/* Pipeline items */}

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

        {/* ===================================================
            QUICK ATTENTION
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                  <BellRing className="h-4 w-4 text-red-600" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Needs Attention
                  </h2>

                  <p className="text-xs text-slate-400">
                    Items requiring action
                  </p>
                </div>
              </div>
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
                  className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left ${item.bg} transition duration-200 hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200`}
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
          PAYMENT + TEAM MONITOR
      ====================================================== */}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* ===================================================
            COLLECTION MONITOR
        ==================================================== */}

        <button
          type="button"
          onClick={() => navigate(dashboardRoutes.payments)}
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Collection Monitor
                </h2>

                <p className="text-xs text-slate-400">
                  Payment performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                Live
              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500" />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium text-slate-400">
              Total collected
            </p>

            <div className="mt-1 flex items-end justify-between">
              <p className="text-3xl font-bold tracking-tight text-slate-800">
                {formatAmount(totalCollected)}
              </p>

              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <ArrowUpRight className="h-4 w-4" />

                Successful
              </div>
            </div>
          </div>

          {/* Payment progress */}

          <div className="mt-6">
            <div className="mb-2 flex justify-between">
              <span className="text-xs font-medium text-slate-500">
                Payment success rate
              </span>

              <span className="text-xs font-bold text-slate-700">
                {successfulPaymentPercentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${successfulPaymentPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />

                <span className="text-[10px] font-medium text-slate-500">
                  Success
                </span>
              </div>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {successfulPayments}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3">
              <div className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-amber-600" />

                <span className="text-[10px] font-medium text-slate-500">
                  Pending
                </span>
              </div>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {pendingPayments}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <div className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-red-600" />

                <span className="text-[10px] font-medium text-slate-500">
                  Failed
                </span>
              </div>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {failedPayments}
              </p>
            </div>
          </div>
        </button>

        {/* ===================================================
            TEAM MONITOR
        ==================================================== */}

        <button
          type="button"
          onClick={() => navigate(dashboardRoutes.team)}
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <UserRoundCheck className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  Team Monitor
                </h2>

                <p className="text-xs text-slate-400">
                  Staff & management overview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-emerald-500" />

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Staff */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                    <UserCog className="h-4 w-4 text-purple-600" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Staff
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Employees
                    </p>
                  </div>
                </div>

                <span className="text-lg font-bold text-slate-800">
                  {totalStaff}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{
                    width: `${totalStaff > 0 ? 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Managers */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Managers
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Management
                    </p>
                  </div>
                </div>

                <span className="text-lg font-bold text-slate-800">
                  {totalManagers}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{
                    width: `${totalManagers > 0 ? 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />

              <p className="text-[11px] text-slate-500">
                Organization monitoring is active.
              </p>
            </div>

            <span className="text-[10px] font-semibold text-indigo-500">
              View team
            </span>
          </div>
        </button>
      </section>

      {/* =====================================================
          LOAN STATUS MINI GRID
      ====================================================== */}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Loan Status
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
                Latest activity across the organization
              </p>
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-slate-300" />
        </div>

        <RecentLoansTable
          loans={recentLoans}
        />
      </section>
    </div>
  );
};

export default Dashboard;