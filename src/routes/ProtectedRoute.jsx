import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import { hasPermission } from "../utils/auth";

const ProtectedRoute = ({
    children,
    permission,
}) => {

    const {
        user,
        loading,
    } = useAuth();


    // =========================================================
    // DEBUG
    // =========================================================

    console.log(
        "========================================"
    );

    console.log(
        "PROTECTED ROUTE"
    );

    console.log(
        "Permission:",
        permission
    );

    console.log(
        "User:",
        user
    );

    console.log(
        "Loading:",
        loading
    );


    // =========================================================
    // AUTH LOADING
    // =========================================================
    // Important:
    // Permission check should NOT happen while auth is loading.
    // Otherwise login/refresh time-la false permission varalam.
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
    // Do this BEFORE permission checking.
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
    // NO PERMISSION REQUIRED
    // =========================================================
    // If route doesn't specify a permission,
    // authenticated user can access it.
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

        permissionResult =
            hasPermission(permission);

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
    // ACCESS DENIED
    // =========================================================

    if (!permissionResult) {

        console.log(
            "PROTECTED ROUTE: ACCESS DENIED"
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