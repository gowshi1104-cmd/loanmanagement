import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUser,
  getUsers,
} from "../../services/userService";
import { getRoles } from "../../services/roleService";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";

const AddUser = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: "",
  });

  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // LOAD INITIAL DATA
  // =========================================================

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, [user]);

  // =========================================================
  // LOAD ROLES
  // =========================================================

  const loadRoles = async () => {
    try {
      const res = await getRoles();

      const allRoles = Array.isArray(res.data)
        ? res.data
        : [];

      const currentUserRole =
        user?.role?.toUpperCase();

      // =====================================================
      // ADMIN
      // Can create ADMIN / MANAGER / STAFF / CUSTOMER
      // =====================================================

      if (currentUserRole === "ADMIN") {
        setRoles(allRoles);
      }

      // =====================================================
      // MANAGER
      // Can create STAFF / CUSTOMER
      // Cannot create ADMIN / MANAGER
      // =====================================================

      else if (currentUserRole === "MANAGER") {
        setRoles(
          allRoles.filter((role) => {
            const roleName =
              role.roleName?.trim().toUpperCase();

            return (
              roleName !== "ADMIN" &&
              roleName !== "MANAGER"
            );
          })
        );
      }

      // =====================================================
      // STAFF
      // Can create CUSTOMER / MEMBER
      // =====================================================

      else if (currentUserRole === "STAFF") {
        setRoles(
          allRoles.filter((role) => {
            const roleName =
              role.roleName?.trim().toUpperCase();

            return (
              roleName === "CUSTOMER" ||
              roleName === "MEMBER"
            );
          })
        );
      }

      // =====================================================
      // OTHER
      // =====================================================

      else {
        setRoles([]);
      }

    } catch (err) {
      console.error(
        "Load Roles Error:",
        err
      );

      toast.error(
        "Unable to load roles"
      );
    }
  };

  // =========================================================
  // LOAD EXISTING USERS
  // =========================================================

  const loadUsers = async () => {
    try {
      const res = await getUsers();

      setUsers(
        Array.isArray(res.data)
          ? res.data
          : []
      );

    } catch (err) {
      console.error(
        "Load Users Error:",
        err
      );

      setUsers([]);
    }
  };

  // =========================================================
  // ROLE PREFIX
  // =========================================================

  const getRolePrefix = (roleName) => {
    if (!roleName) {
      return "";
    }

    const role =
      roleName.trim().toUpperCase();

    switch (role) {
      case "ADMIN":
        return "ADM";

      case "MANAGER":
        return "MAN";

      case "STAFF":
        return "STA";

      case "CUSTOMER":
      case "MEMBER":
        return "CUS";

      default:
        return "";
    }
  };

  // =========================================================
  // GET NEXT USER ID PREVIEW
  // =========================================================

  const getNextUserId = (prefix) => {
    if (!prefix) {
      return "";
    }

    let highestNumber = 0;

    users.forEach((existingUser) => {
      const username =
        existingUser?.username || "";

      const upperUsername =
        username.toUpperCase();

      const upperPrefix =
        prefix.toUpperCase();

      if (
        upperUsername.startsWith(
          upperPrefix
        )
      ) {
        const numberPart =
          username.substring(
            prefix.length
          );

        const number =
          parseInt(numberPart, 10);

        if (
          !isNaN(number) &&
          number > highestNumber
        ) {
          highestNumber = number;
        }
      }
    });

    const nextNumber =
      highestNumber + 1;

    return (
      prefix +
      String(nextNumber).padStart(3, "0")
    );
  };

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setIsDirty(true);

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================================================
  // VALIDATE
  // =========================================================

  const validate = () => {
    const temp = {};

    // Full Name
    if (!form.fullName.trim()) {
      temp.fullName =
        "Full Name is required";
    }

    // Email
    if (!form.email.trim()) {
      temp.email =
        "Email is required";
    } else if (
      !/\S+@\S+\.\S+/.test(
        form.email
      )
    ) {
      temp.email =
        "Invalid Email";
    }

    // Password
    if (!form.password) {
      temp.password =
        "Password required";
    } else if (
      form.password.length < 6
    ) {
      temp.password =
        "Minimum 6 characters";
    }

    // Confirm Password
    if (!form.confirmPassword) {
      temp.confirmPassword =
        "Confirm Password is required";
    } else if (
      form.password !==
      form.confirmPassword
    ) {
      temp.confirmPassword =
        "Password mismatch";
    }

    // Role
    if (!form.roleId) {
      temp.roleId =
        "Select Role";
    }

    setErrors(temp);

    return (
      Object.keys(temp).length === 0
    );
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);

      // =====================================================
      // IMPORTANT
      //
      // DO NOT SEND USERNAME.
      //
      // Backend automatically generates:
      //
      // ADMIN    -> ADM001
      // MANAGER  -> MAN001
      // STAFF    -> STA001
      // CUSTOMER -> CUS001
      //
      // Backend is the final authority.
      // =====================================================

      await createUser({
        fullName:
          form.fullName.trim(),

        email:
          form.email.trim(),

        password:
          form.password,

        roleId:
          Number(form.roleId),
      });

      toast.success(
        "User Created Successfully"
      );

      setIsDirty(false);

      navigate(
        "/settings/users"
      );

    } catch (err) {
      console.error(
        "Create User Error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to create user"
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    if (isDirty) {
      setShowLeaveModal(true);
    } else {
      navigate(
        "/settings/users"
      );
    }
  };

  // =========================================================
  // LEAVE WITHOUT SAVING
  // =========================================================

  const handleLeave = () => {
    setIsDirty(false);

    setShowLeaveModal(false);

    navigate(
      "/settings/users"
    );
  };

  // =========================================================
  // SELECTED ROLE
  // =========================================================

  const selectedRole =
    roles.find(
      (role) =>
        String(role.id) ===
        String(form.roleId)
    );

  // =========================================================
  // SELECTED PREFIX
  // =========================================================

  const selectedPrefix =
    getRolePrefix(
      selectedRole?.roleName
    );

  // =========================================================
  // NEXT USER ID PREVIEW
  // =========================================================

  const nextUserId =
    getNextUserId(
      selectedPrefix
    );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-slate-800">
          Add User
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Create a new system user.
          The User ID will be generated automatically
          based on the selected role.
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* ===================================================
            FULL NAME
        =================================================== */}

        <div>

          <label className="font-medium text-slate-700">
            Full Name
          </label>

          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter full name"
            className={`w-full border rounded-lg mt-2 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fullName
                ? "border-red-500"
                : "border-slate-300"
            }`}
          />

          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.fullName}
            </p>
          )}

        </div>

        {/* ===================================================
            EMAIL
        =================================================== */}

        <div>

          <label className="font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            className={`w-full border rounded-lg mt-2 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email
                ? "border-red-500"
                : "border-slate-300"
            }`}
          />

          {errors.email && (
            <p className="text-red-500 text-sm mt-1">
              {errors.email}
            </p>
          )}

        </div>

        {/* ===================================================
            PASSWORD
        =================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <label className="font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className={`w-full border rounded-lg mt-2 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password
                  ? "border-red-500"
                  : "border-slate-300"
              }`}
            />

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}

          </div>

          <div>

            <label className="font-medium text-slate-700">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className={`w-full border rounded-lg mt-2 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword
                  ? "border-red-500"
                  : "border-slate-300"
              }`}
            />

            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}

          </div>

        </div>

        {/* ===================================================
            ROLE
        =================================================== */}

        <div>

          <label className="font-medium text-slate-700">
            Role
          </label>

          <select
            name="roleId"
            value={form.roleId}
            onChange={handleChange}
            className={`w-full border rounded-lg mt-2 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.roleId
                ? "border-red-500"
                : "border-slate-300"
            }`}
          >

            <option value="">
              Select Role
            </option>

            {roles.map((role) => (
              <option
                key={role.id}
                value={role.id}
              >
                {role.roleName}
              </option>
            ))}

          </select>

          {errors.roleId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.roleId}
            </p>
          )}

        </div>

        {/* ===================================================
            GENERATED USER ID
        =================================================== */}

        {selectedPrefix && (

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-sm font-medium text-blue-700">
                  Next User ID
                </p>

                <p className="text-xs text-blue-600 mt-1">
                  Based on the existing users for this role.
                </p>

              </div>

              <div className="bg-white border border-blue-200 rounded-lg px-5 py-3">

                <span className="text-xl font-bold tracking-wider text-blue-700">
                  {nextUserId}
                </span>

              </div>

            </div>

            <p className="text-xs text-slate-500 mt-3">
              This is a preview only. The backend will
              generate and save the final User ID when
              the user is created.
            </p>

          </div>

        )}

        {/* ===================================================
            BUTTONS
        =================================================== */}

        <div className="flex justify-end gap-4 pt-4 border-t">

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-3 rounded-lg border border-slate-300 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              !isDirty ||
              saving
            }
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving
              ? "Saving..."
              : "Save User"}
          </button>

        </div>

      </form>

      {/* =====================================================
          UNSAVED CHANGES MODAL
      ===================================================== */}

      {showLeaveModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">

            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Leave without saving?
            </h3>

            <p className="text-slate-600 mb-6">
              You have unsaved changes.
              If you leave now, your changes will be lost.
            </p>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowLeaveModal(false)
                }
                className="px-6 py-3 border rounded-lg hover:bg-gray-100"
              >
                Stay
              </button>

              <button
                type="button"
                onClick={handleLeave}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Leave without saving
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default AddUser;