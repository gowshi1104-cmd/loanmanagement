import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage(
        "Please enter your email address."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setMessage("");

      const response = await forgotPassword(
        normalizedEmail
      );

      setMessage(
        response?.data?.message ||
          "If an account exists with this email, a password reset link has been sent."
      );
    } catch (error) {
      console.error(
        "Forgot Password Error:",
        error
      );

      setMessage(
        "If an account exists with this email, a password reset link has been sent."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">

        {/* =====================================================
            BACKGROUND DECORATION
        ====================================================== */}

        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/5 blur-3xl" />

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="relative z-10 w-full max-w-md">

          {/* ===================================================
              LOGO
          ==================================================== */}

          <div className="mb-7 flex items-center justify-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
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

          {/* ===================================================
              CARD
          ==================================================== */}

          <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">

            {/* =================================================
                BACK BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mb-7 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to login
            </button>

            {/* =================================================
                HEADER
            ================================================== */}

            <div className="mb-8">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Forgot password?
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your registered email address
                and we'll send you a password reset
                link.
              </p>

            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {errorMessage && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================== */}

            {message && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-sm font-medium text-emerald-700">
                  {message}
                </p>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (errorMessage) {
                        setErrorMessage("");
                      }
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send reset link
                  </>
                )}
              </button>

            </form>

            {/* =================================================
                SECURITY NOTE
            ================================================== */}

            <div className="mt-7 flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">

              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

              <p className="text-[11px] leading-5 text-slate-500">
                Your password reset request is
                protected by secure authentication
                mechanisms.
              </p>

            </div>

          </div>

          {/* ===================================================
              FOOTER
          ==================================================== */}

          <p className="mt-5 text-center text-xs text-slate-500">
            Authorized users only
          </p>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;