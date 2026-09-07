import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  UserCog,
  Users,
  HandCoins,
  Clock3,
  CheckCircle,
  XCircle,
  Activity,
  IndianRupee,
  WalletCards,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  ClipboardList,
  UserRoundCheck,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  BellRing,
  BadgeCheck,
  Target,
  UserRoundX,
} from "lucide-react";

import RecentLoansTable from "../../components/tables/RecentLoansTable";

import { getManagerDashboard } from "../../services/managerDashboardService";

import useAuth from "../../hooks/useAuth";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =========================================================
  // ROUTES
  // =========================================================

  const dashboardRoutes = {
    loans: "/loans",
    team: "/settings/users",
    payments: "/payments",
  };

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {
    loadDashboard();

    // AUTO REFRESH - EVERY 10 SECONDS
    const interval = setInterval(() => {
      refreshDashboard();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response = await getManagerDashboard();

      console.log("Manager Dashboard Data:", response);

      const data = response?.data ?? response;

      setDashboard(data || null);
    } catch (error) {
      console.error("Manager Dashboard Error:", error);
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);

      const response = await getManagerDashboard();

      const data = response?.data ?? response;

      setDashboard(data || null);
    } catch (error) {
      console.error("Manager dashboard refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Hero */}
        <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />

        {/* Snapshot */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 xl:col-span-2" />

          <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (!dashboard) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
          Unable to load manager dashboard
        </h2>

        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          Please refresh the page and try again.
        </p>

        <button
          type="button"
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

  const getManagerName = () => {
    return (
      user?.fullName ||
      user?.name ||
      user?.username ||
      dashboard?.managerName ||
      "Manager"
    );
  };

  const managerName = getManagerName();
  const firstName = managerName.split(" ")[0];

  // =========================================================
  // NUMBERS
  // =========================================================

  const totalLoans = Number(dashboard.totalLoans || 0);

  const pendingLoans = Number(dashboard.pendingLoans || 0);

  const approvedLoans = Number(dashboard.approvedLoans || 0);

  const rejectedLoans = Number(dashboard.rejectedLoans || 0);

  const activeLoans = Number(dashboard.activeLoans || 0);

  const completedLoans = Number(dashboard.completedLoans || 0);

  // Team only
  const totalTeamMembers = Number(
    dashboard.totalTeamMembers ??
      dashboard.totalStaff ??
      dashboard.teamSize ??
      0
  );

  const activeTeamMembers = Number(
    dashboard.activeTeamMembers ?? dashboard.activeStaff ?? 0
  );

  const inactiveTeamMembers = Number(
    dashboard.inactiveTeamMembers ?? dashboard.inactiveStaff ?? 0
  );

  // Customers belonging to manager's team
  const totalCustomers = Number(dashboard.totalCustomers || 0);

  // Collection
  const totalCollected = Number(dashboard.totalCollected || 0);

  const successfulPayments = Number(
    dashboard.successfulPayments || 0
  );

  const pendingPayments = Number(
    dashboard.pendingPayments || 0
  );

  const failedPayments = Number(
    dashboard.failedPayments || 0
  );

  const paymentTotal =
    successfulPayments +
    pendingPayments +
    failedPayments;

  // =========================================================
  // PERCENTAGE
  // =========================================================

  const percentage = (value, total) => {
    if (!total || total <= 0) {
      return 0;
    }

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

  const successfulPaymentPercentage = percentage(
    successfulPayments,
    paymentTotal
  );

  // =========================================================
  // TODAY
  // =========================================================

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-IN", {
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
  // TEAM PERFORMANCE
  // =========================================================

  const teamPerformance =
    dashboard.teamPerformance ||
    dashboard.staffPerformance ||
    [];

  // =========================================================
  // ACTIVE STAFF
  // =========================================================

  const activeStaffList = teamPerformance.filter((staff) => {
    const status = String(
      staff?.status ||
        staff?.userStatus ||
        ""
    ).toUpperCase();

    return (
      staff?.enabled === true ||
      staff?.active === true ||
      status === "ACTIVE" ||
      status === "ENABLED"
    );
  });

  // =========================================================
  // ATTENTION ITEMS
  // =========================================================

  const attentionItems = [
    {
      title: "Pending Loan Applications",
      value: pendingLoans,
      description: "Team applications need review",
      icon: Clock3,
      bg: "bg-amber-50 dark:bg-amber-950/30",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      route: dashboardRoutes.loans,
    },
    {
      title: "Pending Payments",
      value: pendingPayments,
      description: "Awaiting verification",
      icon: WalletCards,
      bg: "bg-blue-50 dark:bg-blue-950/30",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
      route: dashboardRoutes.payments,
    },
    {
      title: "Failed Payments",
      value: failedPayments,
      description: "Need team attention",
      icon: AlertCircle,
      bg: "bg-red-50 dark:bg-red-950/30",
      iconBg: "bg-red-100 dark:bg-red-900/50",
      iconColor: "text-red-600 dark:text-red-400",
      route: dashboardRoutes.payments,
    },
  ];

  // =========================================================
  // RECENT LOANS
  // =========================================================

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
      icon: CheckCircle,
      color: "slate",
    },
  ];

  // =========================================================
  // TEAM SNAPSHOT
  // =========================================================

  const teamStats = [
    {
      title: "Team Members",
      value: totalTeamMembers,
      icon: Users,
      iconBg:
        "bg-indigo-100 dark:bg-indigo-950",
      iconColor:
        "text-indigo-600 dark:text-indigo-400",
      description: "Assigned to your team",
    },
    {
      title: "Active Staff",
      value: activeTeamMembers,
      icon: UserRoundCheck,
      iconBg:
        "bg-emerald-100 dark:bg-emerald-950",
      iconColor:
        "text-emerald-600 dark:text-emerald-400",
      description: "Currently active",
    },
    {
      title: "Customers",
      value: totalCustomers,
      icon: Users,
      iconBg:
        "bg-blue-100 dark:bg-blue-950",
      iconColor:
        "text-blue-600 dark:text-blue-400",
      description: "Handled by your team",
    },
    {
      title: "Team Loans",
      value: totalLoans,
      icon: HandCoins,
      iconBg:
        "bg-purple-100 dark:bg-purple-950",
      iconColor:
        "text-purple-600 dark:text-purple-400",
      description: "Team loan applications",
    },
  ];

  // =========================================================
  // GET STAFF DETAILS
  // =========================================================

  const getStaffId = (staff) => {
    return (
      staff?.staffId ||
      staff?.userId ||
      staff?.id ||
      staff?.user?.id ||
      null
    );
  };

  const getStaffName = (staff, index) => {
    return (
      staff?.staffName ||
      staff?.name ||
      staff?.fullName ||
      staff?.user?.fullName ||
      `Staff ${index + 1}`
    );
  };

  // =========================================================
  // OPEN STAFF
  // =========================================================

  const openStaff = (staff) => {
    const staffId = getStaffId(staff);

    if (!staffId) {
      navigate(dashboardRoutes.team);
      return;
    }

    navigate(
      `${dashboardRoutes.team}?userId=${staffId}`
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6 pb-8 text-slate-900 dark:text-slate-100">

      {/* =====================================================
          WELCOME HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg">

        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5" />

        <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-indigo-500/10" />

        <div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Team Management Center
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting}, {firstName} 👋
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Welcome back, {managerName}. Monitor your team,
              team loan activity, applications and collections
              from one place.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">

              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                Team monitoring active
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

              <span className="flex items-center gap-1.5">
                <UserCog className="h-3.5 w-3.5 text-blue-400" />
                Staff performance
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />

              <span className="flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
                Team collections
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
              type="button"
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
          TEAM SNAPSHOT
      ====================================================== */}

      <section>
        <div className="mb-3 flex items-center justify-between">

          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              Team Snapshot
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your assigned team at a glance
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Team overview
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

          {teamStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <div className="flex items-start justify-between">

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${item.iconColor}`}
                    />
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
                </div>

                <div className="mt-4">

                  <p className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
                    {item.value.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {item.title}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    {item.description}
                  </p>

                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* =====================================================
          MAIN MONITORING
      ====================================================== */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* ===================================================
            LOAN PIPELINE
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">

          <div className="flex items-start justify-between">

            <div>
              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    Team Loan Pipeline
                  </h2>

                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Loan lifecycle handled by your team
                  </p>
                </div>

              </div>
            </div>

            <div className="text-right">

              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                {totalLoans}
              </p>

              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Team loans
              </p>

            </div>

          </div>

          <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

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
                  bg: "bg-amber-50 dark:bg-amber-950/40",
                  icon: "text-amber-600 dark:text-amber-400",
                  dot: "bg-amber-400",
                },

                emerald: {
                  bg: "bg-emerald-50 dark:bg-emerald-950/40",
                  icon: "text-emerald-600 dark:text-emerald-400",
                  dot: "bg-emerald-500",
                },

                blue: {
                  bg: "bg-blue-50 dark:bg-blue-950/40",
                  icon: "text-blue-600 dark:text-blue-400",
                  dot: "bg-blue-500",
                },

                slate: {
                  bg: "bg-slate-100 dark:bg-slate-800",
                  icon: "text-slate-600 dark:text-slate-300",
                  dot: "bg-slate-500",
                },
              };

              const colors = colorMap[item.color];

              return (
                <div
                  key={item.label}
                  className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
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

                  <p className="mt-3 text-xl font-bold text-slate-800 dark:text-white">
                    {item.value}
                  </p>

                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {item.label}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                    {item.percentage}% of team loans
                  </p>
                </div>
              );
            })}

          </div>
        </div>

        {/* ===================================================
            NEEDS ATTENTION
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-center justify-between">

            <div>
              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40">
                  <BellRing className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    Needs Attention
                  </h2>

                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Team items requiring action
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
                  className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 ${item.bg}`}
                >

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
                  >
                    <Icon
                      className={`h-4 w-4 ${item.iconColor}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {item.title}
                    </p>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {item.description}
                    </p>

                  </div>

                  <span className="text-lg font-bold text-slate-800 dark:text-white">
                    {item.value}
                  </span>

                  <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-400" />

                </button>
              );
            })}

          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTION + TEAM
      ====================================================== */}

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* ===================================================
            TEAM COLLECTION MONITOR
        ==================================================== */}

        <button
          type="button"
          onClick={() => navigate(dashboardRoutes.payments)}
          className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800 dark:focus:ring-emerald-900"
        >

          <div className="flex items-start justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950">
                <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  Team Collection Monitor
                </h2>

                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Collection performance of your team
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2">

              <div className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                Live
              </div>

              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-500 dark:text-slate-600" />

            </div>
          </div>

          <div className="mt-6">

            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Team total collected
            </p>

            <div className="mt-1 flex items-end justify-between">

              <p className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
                {formatAmount(totalCollected)}
              </p>

              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-4 w-4" />
                Successful
              </div>

            </div>
          </div>

          <div className="mt-6">

            <div className="mb-2 flex justify-between">

              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Payment success rate
              </span>

              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {successfulPaymentPercentage}%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${successfulPaymentPercentage}%`,
                }}
              />

            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">

            <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">

              <div className="flex items-center gap-1.5">

                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />

                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Success
                </span>

              </div>

              <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
                {successfulPayments}
              </p>

            </div>

            <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/40">

              <div className="flex items-center gap-1.5">

                <Clock3 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />

                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Pending
                </span>

              </div>

              <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
                {pendingPayments}
              </p>

            </div>

            <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/40">

              <div className="flex items-center gap-1.5">

                <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />

                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Failed
                </span>

              </div>

              <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
                {failedPayments}
              </p>

            </div>

          </div>
        </button>

        {/* ===================================================
            TEAM MONITOR
        ==================================================== */}

        <div className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800">

          <div className="flex items-start justify-between">

            <button
              type="button"
              onClick={() => navigate(dashboardRoutes.team)}
              className="flex items-center gap-3 text-left"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
                <UserRoundCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div>

                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  My Team
                </h2>

                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Staff performance overview
                </p>

              </div>

            </button>

            <div className="flex items-center gap-2">

              <BadgeCheck className="h-5 w-5 text-emerald-500" />

              <button
                type="button"
                onClick={() => navigate(dashboardRoutes.team)}
                className="text-slate-300 transition hover:text-indigo-500 dark:text-slate-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

            </div>

          </div>

          {/* ACTIVE STAFF */}

          <div className="mt-6">

            <div className="mb-2 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
                  <UserRoundCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Active Staff
                  </p>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Click a staff member to view details
                  </p>

                </div>

              </div>

              <span className="text-lg font-bold text-slate-800 dark:text-white">
                {activeTeamMembers}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${
                    totalTeamMembers > 0
                      ? percentage(
                          activeTeamMembers,
                          totalTeamMembers
                        )
                      : 0
                  }%`,
                }}
              />

            </div>

            {/* ACTIVE STAFF LIST */}

            <div className="mt-4 space-y-2">

              {activeStaffList.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800">

                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    No active staff details available.
                  </p>

                </div>
              ) : (
                activeStaffList.map((staff, index) => {

                  const staffId = getStaffId(staff);

                  const staffName = getStaffName(
                    staff,
                    index
                  );

                  return (
                    <button
                      key={
                        staffId ||
                        `${staffName}-${index}`
                      }
                      type="button"
                      onClick={() => openStaff(staff)}
                      className="group/staff flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        {staffName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-xs font-semibold text-slate-700 group-hover/staff:text-indigo-700 dark:text-slate-200 dark:group-hover/staff:text-indigo-300">
                          {staffName}
                        </p>

                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Active staff
                        </p>

                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover/staff:translate-x-0.5 group-hover/staff:text-indigo-500 dark:text-slate-600" />

                    </button>
                  );
                })
              )}

            </div>
          </div>

          {/* INACTIVE STAFF */}

          <div className="mt-5">

            <div className="mb-2 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
                  <UserRoundX className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>

                <div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Inactive Staff
                  </p>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Currently inactive
                  </p>

                </div>

              </div>

              <span className="text-lg font-bold text-slate-800 dark:text-white">
                {inactiveTeamMembers}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

              <div
                className="h-full rounded-full bg-red-400"
                style={{
                  width: `${
                    totalTeamMembers > 0
                      ? percentage(
                          inactiveTeamMembers,
                          totalTeamMembers
                        )
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800">

            <div className="flex items-center gap-2">

              <Activity className="h-4 w-4 text-emerald-500" />

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Your team monitoring is active.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(dashboardRoutes.team)
              }
              className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View team
            </button>

          </div>
        </div>
      </section>

      {/* =====================================================
          TEAM PERFORMANCE
      ====================================================== */}

      <section>

        <div className="mb-3 flex items-center justify-between">

          <div>

            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              Team Performance
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Staff-wise activity and loan performance
            </p>

          </div>

          <Target className="h-5 w-5 text-slate-300 dark:text-slate-600" />

        </div>

        {teamPerformance.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <UserCog className="mx-auto h-9 w-9 text-slate-300 dark:text-slate-600" />

            <h3 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              No team performance data
            </h3>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Staff activity will appear here when available.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">

            {teamPerformance.map((staff, index) => {

              const staffName =
                staff?.staffName ||
                staff?.name ||
                staff?.fullName ||
                `Staff ${index + 1}`;

              const staffLoans = Number(
                staff?.totalLoans ||
                staff?.loanCount ||
                0
              );

              const staffApproved = Number(
                staff?.approvedLoans ||
                staff?.approvedCount ||
                0
              );

              const staffCollected = Number(
                staff?.totalCollected ||
                staff?.collection ||
                0
              );

              return (
                <div
                  key={
                    staff?.staffId ||
                    staff?.id ||
                    index
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
                        <UserCog className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-slate-800 dark:text-white">
                          {staffName}
                        </p>

                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          Team staff
                        </p>

                      </div>

                    </div>

                    <BadgeCheck className="h-4 w-4 text-emerald-500" />

                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">

                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">

                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Loans
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
                        {staffLoans}
                      </p>

                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">

                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Approved
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {staffApproved}
                      </p>

                    </div>

                    <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/40">

                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Collected
                      </p>

                      <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatAmount(staffCollected)}
                      </p>

                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* =====================================================
          LOAN STATUS
      ====================================================== */}

      <section>

        <div className="mb-3 flex items-center justify-between">

          <div>

            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              Team Loan Status
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current loan distribution for your team
            </p>

          </div>

          <HandCoins className="h-5 w-5 text-slate-300 dark:text-slate-600" />

        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

          {[
            {
              title: "Pending",
              value: pendingLoans,
              icon: Clock3,
              bg: "bg-amber-50 dark:bg-amber-950/40",
              iconColor:
                "text-amber-600 dark:text-amber-400",
            },
            {
              title: "Approved",
              value: approvedLoans,
              icon: CheckCircle,
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
              iconColor:
                "text-emerald-600 dark:text-emerald-400",
            },
            {
              title: "Rejected",
              value: rejectedLoans,
              icon: XCircle,
              bg: "bg-red-50 dark:bg-red-950/40",
              iconColor:
                "text-red-600 dark:text-red-400",
            },
            {
              title: "Active",
              value: activeLoans,
              icon: Activity,
              bg: "bg-blue-50 dark:bg-blue-950/40",
              iconColor:
                "text-blue-600 dark:text-blue-400",
            },
            {
              title: "Completed",
              value: completedLoans,
              icon: CheckCircle,
              bg: "bg-slate-100 dark:bg-slate-800",
              iconColor:
                "text-slate-600 dark:text-slate-300",
            },
          ].map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg}`}
                >
                  <Icon
                    className={`h-4 w-4 ${item.iconColor}`}
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {item.title}
                  </p>

                  <p className="text-xl font-bold text-slate-800 dark:text-white">
                    {item.value}
                  </p>

                </div>
              </div>
            );
          })}

        </div>
      </section>

      {/* =====================================================
          RECENT TEAM LOANS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="mb-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div>

              <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                Recent Team Loan Applications
              </h2>

              <p className="text-xs text-slate-400 dark:text-slate-500">
                Latest loan activity handled by your team
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(dashboardRoutes.loans)
            }
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </button>

        </div>

        <RecentLoansTable loans={recentLoans} />

      </section>

    </div>
  );
};

export default ManagerDashboard;