import { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

import { hasPermission } from "../utils/auth";

import { checkFeatureAccess } from "../services/featureService";

const ProtectedRoute = ({ children, permission, feature }) => {
  const { user, loading } = useAuth();

  const [featureLoading, setFeatureLoading] = useState(
    Boolean(feature)
  );

  const [featureAllowed, setFeatureAllowed] = useState(true);

  // =========================================================
  // NORMALIZE ROLE
  // =========================================================
  const normalizedRole = String(user?.role || "")
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();

  const isAdmin = normalizedRole === "ADMIN";

  // =========================================================
  // DEBUG
  // =========================================================
  console.log("========================================");
  console.log("PROTECTED ROUTE");
  console.log("Permission:", permission);
  console.log("Feature:", feature);
  console.log("User:", user);
  console.log("Role:", normalizedRole);
  console.log("Is Admin:", isAdmin);
  console.log("Loading:", loading);

  // =========================================================
  // FEATURE ACCESS CHECK
  // =========================================================
  useEffect(() => {
    let mounted = true;

    const checkFeature = async () => {
      // -------------------------------------------------------
      // NO FEATURE RESTRICTION
      // -------------------------------------------------------
      if (!feature) {
        if (mounted) {
          setFeatureAllowed(true);
          setFeatureLoading(false);
        }

        return;
      }

      // -------------------------------------------------------
      // WAIT FOR AUTHENTICATION
      // -------------------------------------------------------
      if (loading) {
        return;
      }

      // -------------------------------------------------------
      // USER NOT LOGGED IN
      // -------------------------------------------------------
      if (!user) {
        if (mounted) {
          setFeatureAllowed(false);
          setFeatureLoading(false);
        }

        return;
      }

      // -------------------------------------------------------
      // ADMIN BYPASS
      // -------------------------------------------------------
      // ADMIN always has access to every feature.
      // No feature API call is required for ADMIN.
      // -------------------------------------------------------
      const currentRole = String(user?.role || "")
        .replace(/^ROLE_/i, "")
        .trim()
        .toUpperCase();

      if (currentRole === "ADMIN") {
        console.log(
          "PROTECTED ROUTE: ADMIN FEATURE BYPASS"
        );

        if (mounted) {
          setFeatureAllowed(true);
          setFeatureLoading(false);
        }

        return;
      }

      // -------------------------------------------------------
      // CHECK FEATURE FOR NON-ADMIN USERS
      // -------------------------------------------------------
      try {
        if (mounted) {
          setFeatureLoading(true);
        }

        const response = await checkFeatureAccess(feature);

        const data = response?.data;

        console.log(
          "FEATURE ACCESS RESPONSE:",
          data
        );

        let allowed = false;

        // =====================================================
        // RESPONSE FORMAT 1
        // true / false
        // =====================================================
        if (typeof data === "boolean") {
          allowed = data;
        }

        // =====================================================
        // RESPONSE FORMAT 2
        // "true" / "false"
        // =====================================================
        else if (typeof data === "string") {
          allowed = data.toLowerCase() === "true";
        }

        // =====================================================
        // RESPONSE FORMAT 3
        // OBJECT
        // =====================================================
        else if (
          data &&
          typeof data === "object"
        ) {
          const accessValue =
            data.allowed ??
            data.enabled ??
            data.hasAccess ??
            data.access ??
            data.featureEnabled ??
            data.isEnabled;

          // Boolean
          if (typeof accessValue === "boolean") {
            allowed = accessValue;
          }

          // String boolean
          else if (typeof accessValue === "string") {
            allowed =
              accessValue.toLowerCase() === "true";
          }

          // Number 1 / 0
          else if (typeof accessValue === "number") {
            allowed = accessValue === 1;
          }
        }

        console.log(
          "FEATURE:",
          feature
        );

        console.log(
          "FEATURE ALLOWED:",
          allowed
        );

        if (mounted) {
          setFeatureAllowed(allowed);
        }
      } catch (error) {
        console.error(
          "ProtectedRoute Feature Access Error:",
          error
        );

        /*
         * Fail closed for non-admin users.
         *
         * If feature checking fails, access is denied.
         */
        if (mounted) {
          setFeatureAllowed(false);
        }
      } finally {
        if (mounted) {
          setFeatureLoading(false);
        }
      }
    };

    checkFeature();

    return () => {
      mounted = false;
    };
  }, [feature, loading, user]);

  // =========================================================
  // AUTH LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />

          <p className="text-sm text-slate-500">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NOT LOGGED IN
  // =========================================================
  if (!user) {
    console.log(
      "PROTECTED ROUTE: User not authenticated"
    );

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // =========================================================
  // FEATURE LOADING
  // =========================================================
  if (feature && featureLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />

          <p className="text-sm text-slate-500">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // FEATURE ACCESS DENIED
  // =========================================================
  if (feature && !featureAllowed) {
    console.log(
      "PROTECTED ROUTE: FEATURE ACCESS DENIED"
    );

    console.log(
      "Required Feature:",
      feature
    );

    console.log(
      "========================================"
    );

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl">
              🔒
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            You don&apos;t have access to this feature.
            Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO PERMISSION REQUIRED
  // =========================================================
  if (!permission) {
    console.log(
      "PROTECTED ROUTE: No permission required"
    );

    console.log(
      "========================================"
    );

    return children;
  }

  // =========================================================
  // PERMISSION CHECK
  // =========================================================
  let permissionResult = false;

  try {
    permissionResult = hasPermission(permission);
  } catch (error) {
    console.error(
      "ProtectedRoute Permission Error:",
      error
    );

    permissionResult = false;
  }

  console.log(
    "HAS PERMISSION RESULT:",
    permissionResult
  );

  // =========================================================
  // PERMISSION ACCESS DENIED
  // =========================================================
  if (!permissionResult) {
    console.log(
      "PROTECTED ROUTE: PERMISSION ACCESS DENIED"
    );

    console.log(
      "Required Permission:",
      permission
    );

    console.log(
      "========================================"
    );

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl">
              🔒
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800">
            Access Denied
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ACCESS GRANTED
  // =========================================================
  console.log(
    "PROTECTED ROUTE: ACCESS GRANTED"
  );

  console.log(
    "========================================"
  );

  return children;
};

export default ProtectedRoute;