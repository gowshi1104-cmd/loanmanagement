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

  // ============================================
  // BROWSER BACK BUTTON
  // ============================================

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (isDirty) {
        setShowLeaveModal(true);

        // Stay on current page
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

  // ============================================
  // PASSWORD STRENGTH
  // ============================================

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

  // ============================================
  // VALIDATION
  // ============================================

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword =
        "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword =
        "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword =
        "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      toast.success("Password updated successfully");

      // No unsaved changes after successful update
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
          currentPassword:
            "Current password is incorrect",
        });
      }

      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CANCEL
  // ============================================

  const handleCancel = () => {
    if (!isDirty) {
      navigate("/settings");
      return;
    }

    setShowLeaveModal(true);
  };

  // ============================================
  // CONFIRM LEAVE
  // ============================================

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);

    // Discard changes
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({});
    setIsDirty(false);

    navigate("/settings");
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">
            Change Password
          </h2>

          <p className="text-gray-500 mt-2">
            Update your account password securely.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ============================================
              CURRENT PASSWORD
          ============================================ */}

          <div>
            <label className="block font-medium mb-2">
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
                className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 outline-none ${
                  errors.currentPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowOld(!showOld)
                }
                className="absolute right-4 top-3"
              >
                {showOld ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.currentPassword && (
              <p className="text-red-600 text-sm mt-2">
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* ============================================
              NEW PASSWORD
          ============================================ */}

          <div>
            <label className="block font-medium mb-2">
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
                className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 outline-none ${
                  errors.newPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowNew(!showNew)
                }
                className="absolute right-4 top-3"
              >
                {showNew ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.newPassword && (
              <p className="text-red-600 text-sm mt-2">
                {errors.newPassword}
              </p>
            )}

            {/* Password Strength */}
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded ${strength.color}`}
                  style={{
                    width: strength.width,
                  }}
                />
              </div>

              <p
                className={`text-sm mt-2 ${
                  strength.color === "bg-red-500"
                    ? "text-red-600"
                    : strength.color ===
                        "bg-yellow-500"
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {strength.text}
              </p>
            </div>
          </div>

          {/* ============================================
              CONFIRM PASSWORD
          ============================================ */}

          <div>
            <label className="block font-medium mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(
                    e.target.value,
                  );

                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "",
                  }));

                  setIsDirty(true);
                }}
                className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 outline-none ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(
                    !showConfirm,
                  )
                }
                className="absolute right-4 top-3"
              >
                {showConfirm ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-2">
                {errors.confirmPassword}
              </p>
            )}

            {confirmPassword &&
              confirmPassword ===
                newPassword && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Passwords match
                </p>
              )}
          </div>

          {/* ============================================
              BUTTONS
          ============================================ */}

          <div className="flex justify-end gap-3 pt-2">

            {/* Cancel */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Update Password */}
            <button
              type="submit"
              disabled={
                loading || !isDirty
              }
              className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
                loading || !isDirty
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>

          </div>
        </form>
      </div>

      {/* ============================================
          LEAVE WITHOUT SAVE MODAL
      ============================================ */}

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">

            {/* Header */}
            <div className="p-6 border-b border-slate-200">

              <h3 className="text-lg font-semibold text-slate-800">
                Leave without saving?
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                You have unsaved changes.
              </p>

            </div>

            {/* Body */}
            <div className="p-6">

              <p className="text-sm text-slate-600">
                If you go back now, all the changes
                you made will be discarded.
              </p>

            </div>

            {/* Buttons */}
            <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">

              {/* Stay */}
              <button
                type="button"
                onClick={() =>
                  setShowLeaveModal(false)
                }
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 transition font-medium text-slate-700"
              >
                Stay & Edit
              </button>

              {/* Go Back */}
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition font-semibold"
              >
                Yes, Go Back
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ============================================
          SUCCESS MODAL
      ============================================ */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">

            <h3 className="text-xl font-bold mb-4">
              Password Updated
            </h3>

            <p className="text-gray-600 mb-6">
              You must be logged out and re-login
              with your new password.
            </p>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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