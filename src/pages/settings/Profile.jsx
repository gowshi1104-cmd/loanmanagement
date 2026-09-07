import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { User, Mail, Shield, AlertTriangle } from "lucide-react";

import { getProfile, updateProfile } from "../../services/userService";

const Profile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "",
  });

  const [originalForm, setOriginalForm] = useState({
    username: "",
    fullName: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // Browser Back Button protection
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (isDirty) {
        setShowLeaveModal(true);

        // Keep user on the current page
        window.history.pushState(null, "", window.location.href);
      } else {
        navigate(-1);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, navigate]);

  const loadProfile = async () => {
    try {
      const res = await getProfile();

      const profileData = {
        username: res.data.username || "",
        fullName: res.data.fullName || "",
        email: res.data.email || "",
        role: res.data.role?.roleName || "",
      };

      setForm(profileData);
      setOriginalForm(profileData);
      setIsDirty(false);
    } catch (error) {
      console.error(error);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = {
      ...form,
      [name]: value,
    };

    setForm(updatedForm);

    setIsDirty(
      updatedForm.fullName !== originalForm.fullName ||
        updatedForm.email !== originalForm.email
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isDirty) return;

    setSaving(true);

    try {
      await updateProfile({
        fullName: form.fullName,
        email: form.email,
      });

      alert("Profile Updated Successfully");

      setOriginalForm(form);
      setIsDirty(false);

      navigate(-1);
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    } finally {
      setSaving(false);
    }
  };

  // Cancel button
  const handleCancel = () => {
    if (!isDirty) {
      navigate(-1);
      return;
    }

    setShowLeaveModal(true);
  };

  // Yes, Go Back
  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    setForm(originalForm);
    setIsDirty(false);
    navigate(-1);
  };

  if (loading) {
    return <div className="dark:text-slate-400">Loading...</div>;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-3xl min-w-0">
        <div className="rounded-2xl bg-white p-4 shadow-lg sm:p-6 md:p-8 dark:border dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-2 text-2xl font-bold text-slate-800 sm:text-3xl dark:text-slate-100">
            My Profile
          </h2>

          <p className="mb-6 text-sm text-gray-500 sm:mb-8 sm:text-base dark:text-slate-400">
            Update your personal information.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Username */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800 sm:text-base dark:text-slate-200">
                Username
              </label>

              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                  size={18}
                />

                <input
                  value={form.username}
                  readOnly
                  className="w-full rounded-lg border py-3 pl-10 pr-3 text-sm bg-gray-100 sm:text-base dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800 sm:text-base dark:text-slate-200">
                Full Name
              </label>

              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 text-sm sm:text-base bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800 sm:text-base dark:text-slate-200">
                Email
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                  size={18}
                />

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border py-3 pl-10 pr-3 text-sm sm:text-base bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800 sm:text-base dark:text-slate-200">
                Role
              </label>

              <div className="relative">
                <Shield
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                  size={18}
                />

                <input
                  value={form.role}
                  readOnly
                  className="w-full rounded-lg border py-3 pl-10 pr-3 text-sm sm:text-base bg-gray-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end">
              {/* Cancel */}
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="w-full rounded-lg border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 sm:w-auto dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              {/* Update */}
              <button
                type="submit"
                disabled={saving || !isDirty}
                className={`w-full rounded-lg px-8 py-3 font-semibold text-white transition sm:w-auto ${
                  saving || !isDirty
                    ? "cursor-not-allowed bg-slate-300 dark:bg-slate-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Leave Without Saving Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-4 sm:px-6">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
            {/* Header */}
            <div className="border-b border-slate-200 p-4 sm:p-6 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 sm:h-11 sm:w-11 dark:bg-amber-950/40">
                  <AlertTriangle
                    size={22}
                    className="text-amber-600 dark:text-amber-400"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-800 sm:text-lg dark:text-slate-100">
                    Leave without saving?
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    You have unsaved changes.
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                If you go back now, all the changes you made
                will be discarded.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 rounded-b-2xl bg-slate-50 p-4 sm:flex-row sm:justify-end sm:px-6 sm:py-4 dark:bg-slate-800">
              {/* Stay */}
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="w-full rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Stay & Edit
              </button>

              {/* Go Back */}
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
    </>
  );
};

export default Profile;