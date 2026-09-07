import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";

import toast from "react-hot-toast";

import { changePassword } from "../../services/userService";

import useAuth from "../../hooks/useAuth";

const ChangePassword = () => {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);

  const [showNew, setShowNew] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [errors, setErrors] = useState({});

  // Track unsaved changes
  const [isDirty, setIsDirty] = useState(false);

  // Leave confirmation modal
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // =========================================================
  // BROWSER BACK BUTTON
  // =========================================================
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (isDirty) {
        setShowLeaveModal(true);

        window.history.pushState(null, "", window.location.href);
      } else {
        navigate("/settings");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, navigate]);

  // =========================================================
  // PASSWORD STRENGTH
  // =========================================================
  const getStrength = () => {
    if (newPassword.length === 0) {
      return {
        width: "0%",
        color: "",
        text: "",
      };
    }

    if (newPassword.length < 6) {
      return {
        width: "30%",
        color: "bg-red-500",
        text: "Weak Password",
      };
    }

    if (newPassword.length < 8) {
      return {
        width: "60%",
        color: "bg-yellow-500",
        text: "Medium Password",
      };
    }

    return {
      width: "100%",
      color: "bg-green-500",
      text: "Strong Password",
    };
  };

  const strength = getStrength();

  // =========================================================
  // VALIDATION
  // =========================================================
  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword =
        "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      currentPassword &&
      newPassword &&
      currentPassword === newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully");

      // Password is successfully changed.
      // Customer no longer needs forced password change.
      setIsDirty(false);

      setShowModal(true);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setErrors({});
    } catch (err) {
      if (
        err.response?.status === 400 ||
        err.response?.status === 401
      ) {
        setErrors({
          currentPassword: "Current password is incorrect",
        });
      }

      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================
  const handleCancel = () => {
    if (!isDirty) {
      navigate("/settings");
      return;
    }

    setShowLeaveModal(true);
  };

  // =========================================================
  // CONFIRM LEAVE
  // =========================================================
  const handleConfirmLeave = () => {
    setShowLeaveModal(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setErrors({});
    setIsDirty(false);

    navigate("/settings");
  };

  // =========================================================
  // GO TO LOGIN AFTER PASSWORD UPDATE
  // =========================================================
  const handleGoToLogin = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="mx-auto w-full max-w-2xl min-w-0 py-4 sm:py-6 md:py-8">
      <div className="rounded-2xl bg-white p-4 shadow-lg sm:p-6 md:p-8 dark:border dark:border-slate-700 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl dark:text-slate-100">
            Change Password
          </h2>

          <p className="mt-2 text-sm text-gray-500 sm:text-base dark:text-slate-400">
            Update your account password securely.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6"
        >
          {/* CURRENT PASSWORD */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 sm:text-base dark:text-slate-300">
              Current Password
            </label>

            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    currentPassword: "",
                  }));

                  setIsDirty(true);
                }}
                disabled={loading}
                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none focus:ring-2 sm:text-base dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 ${
                  errors.currentPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-slate-700"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 dark:text-slate-300"
              >
                {showOld ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.currentPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 sm:text-base dark:text-slate-300">
              New Password
            </label>

            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    newPassword: "",
                  }));

                  setIsDirty(true);
                }}
                disabled={loading}
                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none focus:ring-2 sm:text-base dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 ${
                  errors.newPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-slate-700"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 dark:text-slate-300"
              >
                {showNew ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.newPassword}
              </p>
            )}

            {/* Password Strength */}
            <div className="mt-3">
              <div className="h-2 rounded bg-gray-200 dark:bg-slate-700">
                <div
                  className={`h-2 rounded ${strength.color}`}
                  style={{
                    width: strength.width,
                  }}
                />
              </div>

              {strength.text && (
                <p
                  className={`mt-2 text-sm ${
                    strength.color === "bg-red-500"
                      ? "text-red-600 dark:text-red-400"
                      : strength.color === "bg-yellow-500"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {strength.text}
                </p>
              )}
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 sm:text-base dark:text-slate-300">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "",
                  }));

                  setIsDirty(true);
                }}
                disabled={loading}
                className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm outline-none focus:ring-2 sm:text-base dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-slate-700"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(!showConfirm)
                }
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 dark:text-slate-300"
              >
                {showConfirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword}
              </p>
            )}

            {confirmPassword &&
              confirmPassword === newPassword && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  ✓ Passwords match
                </p>
              )}
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-6 py-3 hover:bg-gray-100 disabled:opacity-50 sm:w-auto dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !isDirty}
              className={`w-full rounded-lg px-6 py-3 font-semibold text-white transition sm:w-auto ${
                loading || !isDirty
                  ? "cursor-not-allowed bg-slate-300 dark:bg-slate-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          LEAVE WITHOUT SAVE MODAL
      ====================================================== */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-4 sm:px-6">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-4 sm:p-6 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Leave without saving?
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                You have unsaved changes.
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                If you go back now, all the changes you
                made will be discarded.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 rounded-b-2xl bg-slate-50 p-4 sm:flex-row sm:justify-end sm:px-6 sm:py-4 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="w-full rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Stay & Edit
              </button>

              <button
                type="button"
                onClick={handleConfirmLeave}
                className="w-full rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 sm:w-auto"
              >
                Yes, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS MODAL
      ====================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4 py-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 text-center shadow-lg sm:p-6 dark:border dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 text-xl font-bold text-slate-800 dark:text-slate-100">
              Password Updated
            </h3>

            <p className="mb-6 text-sm leading-6 text-gray-600 sm:text-base dark:text-slate-400">
              Your password has been updated
              successfully. Please login again
              with your new password.
            </p>

            <button
              onClick={handleGoToLogin}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 sm:w-auto"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;