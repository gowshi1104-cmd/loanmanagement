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
  UserCircle,
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
  },

  {
    title: "Members",
    path: "/members",
    icon: Users,
    permission: "VIEW_MEMBERS",
  },

  {
    title: "Groups",
    path: "/groups",
    icon: Building2,
    permission: "VIEW_GROUPS",
  },

  {
    title: "Loans",
    path: "/loans",
    icon: Wallet,
    permission: "VIEW_LOANS",
  },

  {
    title: "Payments",
    path: "/payments",
    icon: CreditCard,
    permission: "VIEW_PAYMENTS",
  },

  {
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
    permission: "VIEW_REPORTS",
  },

  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    permission: "VIEW_SETTINGS",
  },

  // =========================================================
  // CUSTOMER PORTAL
  // =========================================================

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

  {
    title: "My Profile",
    path: "/settings/profile",
    icon: UserCircle,
    permission: "VIEW_PROFILE",
  },

  {
    title: "Change Password",
    path: "/settings/change-password",
    icon: Settings,
    permission: "CHANGE_PASSWORD",
  },
];