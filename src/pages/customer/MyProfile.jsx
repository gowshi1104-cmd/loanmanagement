import { useEffect, useState } from "react";
import {
  UserCircle,
  Save,
} from "lucide-react";

import api from "../../api/axios";

const MyProfile = () => {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const loadProfile = async () => {
    try {
      const response =
        await api.get("/users/me");

      setProfile(response.data);
    } catch (error) {
      console.error(
        "Customer Profile Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.put(
        "/users/me",
        profile
      );

      alert(
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        "Profile Update Error:",
        error
      );

      alert(
        "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-slate-500">
        Profile not found.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <UserCircle
          size={30}
          className="text-blue-600"
        />

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            My Profile
          </h1>

          <p className="text-slate-500">
            View and update your profile.
          </p>
        </div>
      </div>

      <div className="max-w-3xl bg-white rounded-2xl shadow border p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Username
              </label>

              <input
                type="text"
                value={
                  profile.username || ""
                }
                disabled
                className="w-full border rounded-lg px-4 py-3 bg-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={
                  profile.fullName || ""
                }
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={
                  profile.phone || ""
                }
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  profile.email || ""
                }
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Address
            </label>

            <textarea
              name="address"
              value={
                profile.address || ""
              }
              onChange={handleChange}
              rows={4}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save size={18} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;