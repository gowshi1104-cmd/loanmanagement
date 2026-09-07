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
import Loans from "../pages/loans/loans";
import AddLoan from "../pages/loans/AddLoan";
import EditLoan from "../pages/loans/EditLoan";
import ViewLoan from "../pages/loans/ViewLoan";
import ActiveLoans from "../pages/loans/ActiveLoans";
import ClosedLoans from "../pages/loans/ClosedLoans";
import LoanEmiSchedule from "../pages/loans/LoanEmiSchedule";
import ApprovedLoans from "../pages/loans/ApprovedLoans";
import CompletedLoans from "../pages/loans/CompletedLoans";

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
// HELP & SUPPORT
// =========================================================
import HelpSupport from "../pages/HelpSupport";
import SupportTicketManagementPage from "../pages/SupportTicketManagementPage";

// =========================================================
// FEATURE MANAGEMENT
// =========================================================
import FeatureManagement from "../pages/settings/FeatureManagement";

// =========================================================
// CUSTOMER
// =========================================================
import CustomerDashboard from "../pages/customer/CustomerDashboard";
import MyLoans from "../pages/customer/MyLoans";
import MyPaymentHistory from "../pages/customer/MyPaymentHistory";
import EmiSchedule from "../pages/customer/EmiSchedule";

// =========================================================
// ROUTE / AUTH
// =========================================================
import ProtectedRoute from "./ProtectedRoute";
import useAuth from "../hooks/useAuth";

// =========================================================
// ROLE NORMALIZER
// =========================================================
const normalizeRole = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/^ROLE_/i, "")
    .toUpperCase()
    .trim();
};

// =========================================================
// FORCE PASSWORD ROUTE
// =========================================================
const ForcePasswordRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);

  const mustChangePassword =
    user.mustChangePassword === true || user.forcePasswordChange === true;

  if ((role === "CUSTOMER" || role === "MEMBER") && mustChangePassword) {
    return <Navigate to="/settings/change-password" replace />;
  }

  return children;
};

// =========================================================
// HOME REDIRECT
// =========================================================
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);

  if (role === "MEMBER" || role === "CUSTOMER") {
    return <Navigate to="/customer/dashboard" replace />;
  }

  if (role === "MANAGER") {
    return <Navigate to="/manager/dashboard" replace />;
  }

  if (role === "STAFF") {
    return <Navigate to="/staff/dashboard" replace />;
  }

  return (
    <ProtectedRoute permission="VIEW_DASHBOARD" feature="DASHBOARD">
      <Dashboard />
    </ProtectedRoute>
  );
};

// =========================================================
// MANAGER ONLY ROUTE
// =========================================================
const ManagerOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);

  if (role !== "MANAGER") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// =========================================================
// STAFF ONLY ROUTE
// =========================================================
const StaffOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);

  if (role !== "STAFF") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// =========================================================
// ADMIN ONLY ROUTE
// =========================================================
const AdminOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">Loading...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(user.role);

  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

// =========================================================
// APP ROUTES
// =========================================================
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

        <Route
          path="/"
          element={
            <ForcePasswordRoute>
              <HomeRedirect />
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    STAFF DASHBOARD
                ================================================= */}

        <Route
          path="/staff/dashboard"
          element={
            <ForcePasswordRoute>
              <StaffOnlyRoute>
                <StaffDashboard />
              </StaffOnlyRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    MEMBERS
                ================================================= */}

        <Route
          path="/members"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_MEMBERS" feature="CUSTOMERS">
                <Members />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/members/add"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="ADD_MEMBER" feature="CUSTOMERS">
                <AddMember />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/members/:id/edit"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="EDIT_MEMBER" feature="CUSTOMERS">
                <EditMember />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/members/:customerId/history"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute feature="CUSTOMERS">
                <MemberHistory />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/members/:id"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_MEMBERS" feature="CUSTOMERS">
                <ViewMember />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    LOANS
                ================================================= */}

        <Route
          path="/loans"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute
                permission="VIEW_LOANS"
                feature="LOAN_APPLICATIONS"
              >
                <Loans />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/loans/approved"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_LOANS" feature="APPROVED_LOANS">
                <ApprovedLoans />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/loans/active"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_LOANS" feature="ACTIVE_LOANS">
                <ActiveLoans />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/loans/completed"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_LOANS" feature="COMPLETED_LOANS">
                <CompletedLoans />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/loans/closed"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_LOANS" feature="CLOSED_LOANS">
                <ClosedLoans />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    LOAN EMI SCHEDULE
                ================================================= */}

        <Route
          path="/loans/:id/emi-schedule"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_LOANS" feature="ACTIVE_LOANS">
                <LoanEmiSchedule />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/loans/add"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="ADD_LOAN" feature="ADD_LOAN">
                <AddLoan />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/loans/:id/edit"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute
                permission="EDIT_LOAN"
                feature="LOAN_APPLICATIONS"
              >
                <EditLoan />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/loans/:id"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute
                permission="VIEW_LOANS"
                feature="LOAN_APPLICATIONS"
              >
                <ViewLoan />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    GROUPS
                ================================================= */}

        <Route
          path="/groups"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_GROUPS" feature="GROUPS">
                <Groups />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/groups/add"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="ADD_GROUP" feature="ADD_GROUP">
                <AddGroup />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/groups/:id/edit"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="EDIT_GROUP" feature="EDIT_GROUP">
                <EditGroup />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/groups/:id/members"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_GROUPS" feature="GROUPS">
                <GroupMembers />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/groups/:id"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_GROUPS" feature="GROUPS">
                <ViewGroup />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    FEATURE MANAGEMENT
                ================================================= */}

        <Route
          path="/settings/features"
          element={
            <ForcePasswordRoute>
              <AdminOnlyRoute>
                <FeatureManagement />
              </AdminOnlyRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    PAYMENTS
                ================================================= */}

        <Route
          path="/payments"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_PAYMENTS">
                <Payments />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/payments/add"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="ADD_PAYMENT" feature="ADD_PAYMENT">
                <AddPayment />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/payments/cashfree-return"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_PAYMENTS">
                <CashfreeReturn />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/payments/history"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute
                permission="VIEW_PAYMENTS"
                feature="PAYMENT_HISTORY"
              >
                <PaymentHistory />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/payments/:id/edit"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute
                permission="EDIT_PAYMENT"
                feature="PAYMENT_HISTORY"
              >
                <EditPayment />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/payments/:id"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute
                permission="VIEW_PAYMENTS"
                feature="PAYMENT_HISTORY"
              >
                <ViewPayment />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    REPORTS
                ================================================= */}

        <Route
          path="/reports"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_REPORTS" feature="REPORTS">
                <Reports />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    MANAGER DASHBOARD
                ================================================= */}

        <Route
          path="/manager/dashboard"
          element={
            <ForcePasswordRoute>
              <ManagerOnlyRoute>
                <ManagerDashboard />
              </ManagerOnlyRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    CUSTOMER PORTAL
                ================================================= */}

        <Route
          path="/customer/dashboard"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_CUSTOMER_DASHBOARD">
                <CustomerDashboard />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/customer/loans"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_MY_LOANS">
                <MyLoans />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/customer/emi-schedule"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_EMI_SCHEDULE">
                <EmiSchedule />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/customer/payment-history"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_MY_PAYMENT_HISTORY">
                <MyPaymentHistory />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    SETTINGS
                ================================================= */}

        <Route
          path="/settings"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_SETTINGS">
                <Settings />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/settings/profile"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_PROFILE">
                <Profile />
              </ProtectedRoute>
            </ForcePasswordRoute>
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
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_USERS" feature="USERS">
                <Users />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/settings/users/add"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="ADD_USER" feature="ADD_USER">
                <AddUser />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/settings/users/:id/edit"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="EDIT_USER" feature="EDIT_USER">
                <EditUser />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/settings/users/:id"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_USERS" feature="USERS">
                <ViewUser />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    SUPPORT TICKETS
                ================================================= */}

        <Route
          path="/support-tickets"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute
                feature="SUPPORT_TICKETS"
                permission="VIEW_SUPPORT_TICKETS"
              >
                <SupportTicketManagementPage />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    ROLES & PERMISSIONS
                ================================================= */}

        <Route
          path="/settings/roles"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_ROLES">
                <Roles />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/settings/roles/add"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="ADD_ROLE">
                <AddRole />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/settings/roles/:id/edit"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="EDIT_ROLE">
                <EditRole />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        <Route
          path="/settings/roles/:id"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute permission="VIEW_ROLES">
                <ViewRole />
              </ProtectedRoute>
            </ForcePasswordRoute>
          }
        />

        {/* =================================================
                    HELP & SUPPORT
                ================================================= */}

        <Route
          path="/help-support"
          element={
            <ForcePasswordRoute>
              <ProtectedRoute feature="HELP_SUPPORT">
                <HelpSupport />
              </ProtectedRoute>
            </ForcePasswordRoute>
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
