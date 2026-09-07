import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  CreditCard,
  BarChart3,
  Settings,
  CalendarDays,
  History,
  HelpCircle,
  Ticket,
  Settings2,
} from "lucide-react";

export const navigation = [
  // =========================================================
  // EXISTING ADMIN / STAFF PORTAL
  // =========================================================

  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    permission: "VIEW_DASHBOARD",
    feature: "DASHBOARD",
  },

  {
    title: "Members",
    path: "/members",
    icon: Users,
    permission: "VIEW_MEMBERS",
    feature: "CUSTOMERS",
  },

  {
    title: "Groups",
    path: "/groups",
    icon: Building2,
    permission: "VIEW_GROUPS",
    feature: "GROUPS",
  },

  // =========================================================
  // LOANS
  // =========================================================

  {
    title: "Loans",
    path: "/loans",
    icon: Wallet,
    permission: "VIEW_LOANS",
    feature: "LOAN_APPLICATIONS",

    children: [
      {
        title: "Loan Applications",
        path: "/loans",
        permission: "VIEW_LOANS",
        feature: "LOAN_APPLICATIONS",
      },

      {
        title: "Approved Loans",
        path: "/loans/approved",
        permission: "VIEW_LOANS",
        feature: "APPROVED_LOANS",
      },

      {
        title: "Active Loans",
        path: "/loans/active",
        permission: "VIEW_LOANS",
        feature: "ACTIVE_LOANS",
      },

      {
        title: "Completed Loans",
        path: "/loans/completed",
        permission: "VIEW_LOANS",
        feature: "COMPLETED_LOANS",
      },

      {
        title: "Closed Loans",
        path: "/loans/closed",
        permission: "VIEW_LOANS",
        feature: "CLOSED_LOANS",
      },
    ],
  },

  // =========================================================
  // PAYMENTS
  // =========================================================

  {
    title: "Payments",
    path: "/payments",
    icon: CreditCard,
    permission: "VIEW_PAYMENTS",
  },

  // =========================================================
  // REPORTS
  // =========================================================

  {
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
    permission: "VIEW_REPORTS",
    feature: "REPORTS",
  },

  // =========================================================
  // CUSTOMER PORTAL
  // =========================================================
  // No feature keys exist in current DB for these.
  // Permission system remains unchanged.

  {
    title: "My Dashboard",
    path: "/customer/dashboard",
    icon: LayoutDashboard,
    permission: "VIEW_CUSTOMER_DASHBOARD",
  },

  {
    title: "My Loans",
    path: "/customer/loans",
    icon: Wallet,
    permission: "VIEW_MY_LOANS",
  },

  {
    title: "EMI Schedule",
    path: "/customer/emi-schedule",
    icon: CalendarDays,
    permission: "VIEW_EMI_SCHEDULE",
  },

  {
    title: "Payment History",
    path: "/customer/payment-history",
    icon: History,
    permission: "VIEW_MY_PAYMENT_HISTORY",
  },

  // =========================================================
  // FEATURE MANAGEMENT
  // ADMIN ONLY
  // =========================================================

  {
    title: "Feature Management",
    name: "Feature Management",
    path: "/settings/features",
    icon: Settings2,
    roles: ["ADMIN"],
  },

  // =========================================================
  // SETTINGS
  // =========================================================
  // No SETTINGS feature key exists in current DB.

  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    permission: "VIEW_SETTINGS",
  },

  // =========================================================
  // SUPPORT TICKETS
  // =========================================================

  {
    title: "Support Tickets",
    label: "Support Tickets",
    path: "/support-tickets",
    icon: Ticket,
    permission: "VIEW_SUPPORT_TICKETS",
    feature: "SUPPORT_TICKETS",
  },

  // =========================================================
  // HELP & SUPPORT
  // =========================================================

  {
    title: "Help & Support",
    label: "Help & Support",
    path: "/help-support",
    icon: HelpCircle,
    feature: "HELP_SUPPORT",
  },
];
