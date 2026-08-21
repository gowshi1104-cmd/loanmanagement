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
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-2">
            My Profile
          </h2>

          <p className="text-gray-500 mb-8">
            Update your personal information.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Username */}
            <div>
              <label className="font-medium mb-2 block">
                Username
              </label>

              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />

                <input
                  value={form.username}
                  readOnly
                  className="w-full border rounded-lg pl-10 py-3 bg-gray-100"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="font-medium mb-2 block">
                Full Name
              </label>

              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            {/* Email */}
            <div>
              <label className="font-medium mb-2 block">
                Email
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg pl-10 py-3"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="font-medium mb-2 block">
                Role
              </label>

              <div className="relative">
                <Shield
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />

                <input
                  value={form.role}
                  readOnly
                  className="w-full border rounded-lg pl-10 py-3 bg-gray-100"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              {/* Cancel */}
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-8 py-3 rounded-lg border border-slate-300 hover:bg-slate-100 font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Update */}
              <button
                type="submit"
                disabled={saving || !isDirty}
                className={`px-8 py-3 rounded-lg text-white font-semibold transition ${
                  saving || !isDirty
                    ? "bg-slate-300 cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">

            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-100">
                  <AlertTriangle
                    size={22}
                    className="text-amber-600"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Leave without saving?
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    You have unsaved changes.
                  </p>
                </div>

              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-slate-600">
                If you go back now, all the changes you made
                will be discarded.
              </p>
            </div>

            {/* Buttons */}
            <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">

              {/* Stay */}
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
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
    </>
  );
};

export default Profile;