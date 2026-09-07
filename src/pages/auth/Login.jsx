import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { login as loginApi } from "../../services/authService";
import useAuth from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  // =========================================================
  // ROLE NORMALIZER
  // =========================================================

  const normalizeRole = (role) => {
    return String(role || "")
      .replace(/^ROLE_/i, "")
      .trim()
      .toUpperCase();
  };

  // =========================================================
  // ROLE BASED REDIRECT
  // =========================================================

  const redirectByRole = (
    role,
    mustChangePassword = false
  ) => {
    const normalizedRole = normalizeRole(role);

    // -------------------------------------------------------
    // CUSTOMER MUST CHANGE PASSWORD
    // -------------------------------------------------------

    if (
      (normalizedRole === "CUSTOMER" ||
        normalizedRole === "MEMBER") &&
      mustChangePassword === true
    ) {
      navigate("/settings/change-password", {
        replace: true,
      });

      return;
    }

    // -------------------------------------------------------
    // NORMAL ROLE REDIRECT
    // -------------------------------------------------------

    switch (normalizedRole) {
      case "MEMBER":
      case "CUSTOMER":
        navigate("/customer/dashboard", {
          replace: true,
        });
        break;

      case "ADMIN":
      case "MANAGER":
      case "STAFF":
        navigate("/", {
          replace: true,
        });
        break;

      default:
        navigate("/", {
          replace: true,
        });
        break;
    }
  };

  // =========================================================
  // LOGIN SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const username = credentials.username.trim();
    const password = credentials.password;

    // -------------------------------------------------------
    // FRONTEND VALIDATION
    // -------------------------------------------------------

    if (!username) {
      setErrorMessage("Please enter your username.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await loginApi({
        username,
        password,
        rememberMe,
      });

      const loginData = response?.data;

      console.log("================================");
      console.log("LOGIN RESPONSE:");
      console.log(loginData);
      console.log("================================");

      // -------------------------------------------------------
      // VALIDATE RESPONSE
      // -------------------------------------------------------

      if (!loginData) {
        throw new Error("Invalid server response.");
      }

      if (!loginData.token) {
        throw new Error(
          "Authentication token was not received."
        );
      }

      // -------------------------------------------------------
      // SAVE LOGIN THROUGH AUTH CONTEXT
      // -------------------------------------------------------

      login(loginData, rememberMe);

      // -------------------------------------------------------
      // CUSTOMER FORCE PASSWORD CHANGE
      // -------------------------------------------------------

      redirectByRole(
        loginData.role ||
          loginData.roleName ||
          loginData.userRole,
        Boolean(
          loginData.mustChangePassword ??
            loginData.forcePasswordChange
        )
      );
    } catch (error) {
      console.error("Login Error:", error);

      const status = error?.response?.status;

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error;

      if (status === 401) {
        setErrorMessage(
          "Invalid username or password."
        );
      } else if (status === 403) {
        setErrorMessage(
          "Your account does not have permission to login."
        );
      } else if (backendMessage) {
        setErrorMessage(backendMessage);
      } else if (error?.message === "Network Error") {
        setErrorMessage(
          "Unable to connect to the server. Please try again."
        );
      } else {
        setErrorMessage(
          "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 lg:flex">

          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/5 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight text-white">
                  Loan Management System
                </p>

                <p className="text-xs text-slate-400">
                  Secure financial operations
                </p>
              </div>
            </div>

            {/* Main content */}

            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Secure Workspace
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                Manage your loan operations
                <span className="text-blue-400">
                  {" "}with confidence.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-slate-400">
                Access your assigned workspace,
                monitor loan applications, manage
                customers and track financial
                activity from one secure platform.
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-lg font-bold text-white">
                    Secure
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    JWT authentication
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-lg font-bold text-white">
                    Smart
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Role-based access
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-lg font-bold text-white">
                    Reliable
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Centralized monitoring
                  </p>
                </div>

              </div>
            </div>

            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} Loan Management System
            </p>

          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE - LOGIN
        ====================================================== */}

        <div className="flex items-center justify-center bg-slate-100 px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* Mobile logo */}

            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>

              <div>
                <p className="text-lg font-bold text-slate-900">
                  Loan Management System
                </p>

                <p className="text-xs text-slate-500">
                  Secure financial operations
                </p>
              </div>

            </div>

            {/* Login Card */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">

              {/* Header */}

              <div className="mb-8">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <LockKeyhole className="h-6 w-6 text-blue-600" />
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to access your Loan
                  Management System workspace.
                </p>

              </div>

              {/* Error */}

              {errorMessage && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-700">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Username */}

                <div>

                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Username
                  </label>

                  <div className="relative">

                    <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      autoComplete="username"
                      autoFocus
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                  </div>

                </div>

                {/* Password */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                    >
                      Forgot password?
                    </Link>

                  </div>

                  <div className="relative">

                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>

                  </div>

                </div>

                {/* Remember Me */}

                <div className="flex items-center">

                  <label className="flex cursor-pointer items-center gap-2.5">

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(
                          e.target.checked
                        )
                      }
                      disabled={loading}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed"
                    />

                    <span className="text-sm text-slate-600">
                      Remember me
                    </span>

                  </label>

                </div>

                {/* Login button */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !credentials.username.trim() ||
                    !credentials.password
                  }
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

              </form>

              {/* Security note */}

              <div className="mt-7 flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">

                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                <p className="text-[11px] leading-5 text-slate-500">
                  Your session is protected using
                  secure authentication and
                  role-based access control.
                </p>

              </div>

            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              Authorized users only
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;