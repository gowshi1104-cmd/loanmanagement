import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

import Login from "../pages/auth/Login";

import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
// =========================================================
// ADMIN DASHBOARD
// =========================================================

import Dashboard from "../pages/dashboard/Dashboard";

// =========================================================
// MANAGER DASHBOARD
// =========================================================

import ManagerDashboard from "../pages/manager/ManagerDashboard";

// =========================================================
// STAFF DASHBOARD
// =========================================================

import StaffDashboard from "../pages/staff/StaffDashboard";

// =========================================================
// MEMBERS
// =========================================================

import Members from "../pages/members/Members";
import AddMember from "../pages/members/AddMember";
import ViewMember from "../pages/members/ViewMember";
import EditMember from "../pages/members/EditMember";
import MemberHistory from "../pages/members/MemberHistory";

// =========================================================
// LOANS
// =========================================================

import Loans from "../pages/loans/Loans";
import AddLoan from "../pages/loans/AddLoan";
import EditLoan from "../pages/loans/EditLoan";
import ViewLoan from "../pages/loans/ViewLoan";

// =========================================================
// GROUPS
// =========================================================

import Groups from "../pages/groups/Groups";
import AddGroup from "../pages/groups/AddGroup";
import EditGroup from "../pages/groups/EditGroup";
import ViewGroup from "../pages/groups/ViewGroup";
import GroupMembers from "../pages/groups/GroupMembers";

// =========================================================
// PAYMENTS
// =========================================================

import Payments from "../pages/payments/Payments";
import AddPayment from "../pages/payments/AddPayment";
import EditPayment from "../pages/payments/EditPayment";
import ViewPayment from "../pages/payments/ViewPayment";
import PaymentHistory from "../pages/Payments/PaymentHistory";
import CashfreeReturn from "../pages/Payments/CashfreeReturn";

// =========================================================
// REPORTS
// =========================================================

import Reports from "../pages/reports/Reports";

// =========================================================
// SETTINGS
// =========================================================

import Settings from "../pages/settings/Settings";
import Profile from "../pages/settings/Profile";
import ChangePassword from "../pages/settings/ChangePassword";

// =========================================================
// USER MANAGEMENT
// =========================================================

import Users from "../pages/settings/Users";
import AddUser from "../pages/settings/AddUser";
import EditUser from "../pages/settings/EditUser";
import ViewUser from "../pages/settings/ViewUser";

// =========================================================
// ROLES & PERMISSIONS
// =========================================================

import Roles from "../pages/settings/Roles";
import AddRole from "../pages/settings/AddRole";
import EditRole from "../pages/settings/EditRole";
import ViewRole from "../pages/settings/ViewRole";

// =========================================================
// CUSTOMER
// =========================================================

import CustomerDashboard from "../pages/customer/CustomerDashboard";
import MyLoans from "../pages/customer/MyLoans";
import EmiSchedule from "../pages/customer/EmiSchedule";
import MyPaymentHistory from "../pages/customer/MyPaymentHistory";
import MyProfile from "../pages/customer/MyProfile";

// =========================================================
// ROUTE / AUTH
// =========================================================

import ProtectedRoute from "./ProtectedRoute";
import useAuth from "../hooks/useAuth";

// ============================================================================
// ROLE NORMALIZER
// ============================================================================

const normalizeRole = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/^ROLE_/, "")
    .toUpperCase()
    .trim();
};

// ============================================================================
// HOME REDIRECT
// ============================================================================
//
// ADMIN
//      -> Dashboard.jsx
//
// STAFF
//      -> StaffDashboard.jsx
//
// MANAGER
//      -> ManagerDashboard.jsx
//
// MEMBER
//      -> CustomerDashboard.jsx
//
// ============================================================================

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">Loading...</div>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // =========================================================
  // ROLE
  // =========================================================

  const role = normalizeRole(user.role);

  // =========================================================
  // MEMBER
  // =========================================================

  if (role === "MEMBER") {
    return <Navigate to="/customer/dashboard" replace />;
  }

  // =========================================================
  // MANAGER
  // =========================================================

  if (role === "MANAGER") {
    return <Navigate to="/manager/dashboard" replace />;
  }

  // =========================================================
  // STAFF
  // =========================================================

  if (role === "STAFF") {
    return <Navigate to="/staff/dashboard" replace />;
  }

  // =========================================================
  // ADMIN
  // =========================================================

  return (
    <ProtectedRoute permission="VIEW_DASHBOARD">
      <Dashboard />
    </ProtectedRoute>
  );
};

// ============================================================================
// MANAGER ONLY ROUTE
// ============================================================================

const ManagerOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">Loading...</div>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // =========================================================
  // ROLE
  // =========================================================

  const role = normalizeRole(user.role);

  // =========================================================
  // MANAGER ONLY
  // =========================================================

  if (role !== "MANAGER") {
    return <Navigate to="/" replace />;
  }

  // =========================================================
  // MANAGER ALLOWED
  // =========================================================

  return children;
};

// ============================================================================
// STAFF ONLY ROUTE
// ============================================================================
//
// ONLY STAFF
//
// ADMIN
// MANAGER
// MEMBER
//      -> redirected to Home
//
// ============================================================================

const StaffOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">Loading...</div>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // =========================================================
  // ROLE
  // =========================================================

  const role = normalizeRole(user.role);

  // =========================================================
  // STAFF ONLY
  // =========================================================

  if (role !== "STAFF") {
    return <Navigate to="/" replace />;
  }

  // =========================================================
  // STAFF ALLOWED
  // =========================================================

  return children;
};

// ============================================================================
// APP ROUTES
// ============================================================================

const AppRoutes = () => {
  return (
    <Routes>
      {/* =====================================================
          LOGIN
      ====================================================== */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      {/* =====================================================
          PROTECTED APPLICATION
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* =================================================
            HOME
        ================================================= */}

        <Route path="/" element={<HomeRedirect />} />

        {/* =================================================
            STAFF DASHBOARD
        ================================================= */}

        <Route
          path="/staff/dashboard"
          element={
            <StaffOnlyRoute>
              <StaffDashboard />
            </StaffOnlyRoute>
          }
        />

        {/* =================================================
            MEMBERS
        ================================================= */}

        <Route
          path="/members"
          element={
            <ProtectedRoute permission="VIEW_MEMBERS">
              <Members />
            </ProtectedRoute>
          }
        />

        <Route
          path="/members/add"
          element={
            <ProtectedRoute permission="ADD_MEMBER">
              <AddMember />
            </ProtectedRoute>
          }
        />

        <Route
          path="/members/:id"
          element={
            <ProtectedRoute permission="VIEW_MEMBERS">
              <ViewMember />
            </ProtectedRoute>
          }
        />

        <Route
          path="/members/:id/edit"
          element={
            <ProtectedRoute permission="EDIT_MEMBER">
              <EditMember />
            </ProtectedRoute>
          }
        />

        <Route
          path="/members/:customerId/history"
          element={<MemberHistory />}
        />

        {/* =================================================
            LOANS
        ================================================= */}

        <Route
          path="/loans"
          element={
            <ProtectedRoute permission="VIEW_LOANS">
              <Loans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans/add"
          element={
            <ProtectedRoute permission="ADD_LOAN">
              <AddLoan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans/:id"
          element={
            <ProtectedRoute permission="VIEW_LOANS">
              <ViewLoan />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans/:id/edit"
          element={
            <ProtectedRoute permission="EDIT_LOAN">
              <EditLoan />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            GROUPS
        ================================================= */}

        <Route
          path="/groups"
          element={
            <ProtectedRoute permission="VIEW_GROUPS">
              <Groups />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/add"
          element={
            <ProtectedRoute permission="ADD_GROUP">
              <AddGroup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/:id"
          element={
            <ProtectedRoute permission="VIEW_GROUPS">
              <ViewGroup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/:id/edit"
          element={
            <ProtectedRoute permission="EDIT_GROUP">
              <EditGroup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/groups/:id/members"
          element={
            <ProtectedRoute permission="VIEW_GROUPS">
              <GroupMembers />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            PAYMENTS
        ================================================= */}

        <Route
          path="/payments"
          element={
            <ProtectedRoute permission="VIEW_PAYMENTS">
              <Payments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments/add"
          element={
            <ProtectedRoute permission="ADD_PAYMENT">
              <AddPayment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments/:id"
          element={
            <ProtectedRoute permission="VIEW_PAYMENTS">
              <ViewPayment />
            </ProtectedRoute>
          }
        />

        <Route path="/payments/cashfree-return" element={<CashfreeReturn />} />

        <Route
          path="/payments/:id/edit"
          element={
            <ProtectedRoute permission="EDIT_PAYMENT">
              <EditPayment />
            </ProtectedRoute>
          }
        />

        <Route path="/payments/history" element={<PaymentHistory />} />

        {/* =================================================
            REPORTS
        ================================================= */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute permission="VIEW_REPORTS">
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            MANAGER DASHBOARD
        ================================================= */}

        <Route
          path="/manager/dashboard"
          element={
            <ManagerOnlyRoute>
              <ManagerDashboard />
            </ManagerOnlyRoute>
          }
        />

        {/* =================================================
            CUSTOMER PORTAL
        ================================================= */}

        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute permission="VIEW_CUSTOMER_DASHBOARD">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/loans"
          element={
            <ProtectedRoute permission="VIEW_MY_LOANS">
              <MyLoans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/emi-schedule"
          element={
            <ProtectedRoute permission="VIEW_EMI_SCHEDULE">
              <EmiSchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/payment-history"
          element={
            <ProtectedRoute permission="VIEW_MY_PAYMENT_HISTORY">
              <MyPaymentHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute permission="VIEW_PROFILE">
              <MyProfile />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute permission="VIEW_SETTINGS">
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute permission="VIEW_PROFILE">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/change-password"
          element={
            <ProtectedRoute permission="CHANGE_PASSWORD">
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            USER MANAGEMENT
        ================================================= */}

        <Route
          path="/settings/users"
          element={
            <ProtectedRoute permission="VIEW_USERS">
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/users/add"
          element={
            <ProtectedRoute permission="ADD_USER">
              <AddUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/users/:id"
          element={
            <ProtectedRoute permission="VIEW_USERS">
              <ViewUser />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/users/:id/edit"
          element={
            <ProtectedRoute permission="EDIT_USER">
              <EditUser />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            ROLES & PERMISSIONS
        ================================================= */}

        <Route
          path="/settings/roles"
          element={
            <ProtectedRoute permission="VIEW_ROLES">
              <Roles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/roles/add"
          element={
            <ProtectedRoute permission="ADD_ROLE">
              <AddRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/roles/:id"
          element={
            <ProtectedRoute permission="VIEW_ROLES">
              <ViewRole />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/roles/:id/edit"
          element={
            <ProtectedRoute permission="EDIT_ROLE">
              <EditRole />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* =====================================================
          UNKNOWN ROUTE
      ====================================================== */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
