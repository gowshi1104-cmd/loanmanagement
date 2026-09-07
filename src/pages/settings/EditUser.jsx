import {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import { AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Divider,
} from "@mui/material";

import { getRoles } from "../../services/roleService";

import {
  getUserById,
  updateUser,
  getUsers,
} from "../../services/userService";

import { AuthContext } from "../../context/AuthContext";

const EditUser = () => {

  const { id } = useParams();

  const navigate = useNavigate();

  // =========================================================
  // CURRENT LOGGED-IN USER
  // =========================================================

  const { user: currentUser } = useContext(AuthContext);

  const [roles, setRoles] = useState([]);

  const [managers, setManagers] = useState([]);

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    roleId: "",
    reportingManagerId: "",
    enabled: true,
  });

  const [originalForm, setOriginalForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    roleId: "",
    reportingManagerId: "",
    enabled: true,
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // =========================================================
  // LOAD USER + ROLES + MANAGERS
  // =========================================================

  useEffect(() => {

    loadData();

  }, [id]);

  const loadData = async () => {

    try {

      setLoading(true);

      const [
        rolesRes,
        userRes,
        usersRes,
      ] = await Promise.all([
        getRoles(),
        getUserById(id),
        getUsers(),
      ]);

      const allRoles = Array.isArray(rolesRes.data)
        ? rolesRes.data
        : [];

      const userDataResponse = userRes.data;

      const allUsers = Array.isArray(usersRes.data)
        ? usersRes.data
        : [];

      // =====================================================
      // FILTER ROLES BASED ON CURRENT USER ROLE
      // =====================================================

      let filteredRoles = [];

      const currentRole =
        currentUser?.role?.roleName ||
        currentUser?.role ||
        "";

      if (currentRole.toUpperCase() === "ADMIN") {

        filteredRoles = allRoles;

      } else if (currentRole.toUpperCase() === "MANAGER") {

        filteredRoles = allRoles.filter(
          (role) =>
            role.roleName?.toUpperCase() !== "ADMIN" &&
            role.roleName?.toUpperCase() !== "MANAGER"
        );

      } else if (currentRole.toUpperCase() === "STAFF") {

        filteredRoles = allRoles.filter(
          (role) =>
            role.roleName?.toUpperCase() === "MEMBER" ||
            role.roleName?.toUpperCase() === "CUSTOMER"
        );

      }

      // =====================================================
      // EXISTING USER ROLE
      // =====================================================

      const currentEditedUserRole =
        userDataResponse.role;

      if (
        currentEditedUserRole &&
        !filteredRoles.some(
          (role) =>
            role.id === currentEditedUserRole.id
        )
      ) {

        filteredRoles = [
          currentEditedUserRole,
          ...filteredRoles,
        ];

      }

      setRoles(filteredRoles);

      // =====================================================
      // MANAGERS
      // Only users whose role is MANAGER
      // =====================================================

      const managerUsers = allUsers.filter((item) => {

        const roleName =
          item.role?.roleName ||
          item.role ||
          "";

        return (
          roleName.trim().toUpperCase() ===
          "MANAGER"
        );

      });

      setManagers(managerUsers);

      // =====================================================
      // EXISTING REPORTING MANAGER
      // =====================================================

      const existingManager =
        userDataResponse.reportingManager;

      const existingManagerId =
        existingManager?.id ||
        existingManager?.userId ||
        userDataResponse.reportingManagerId ||
        "";

      // =====================================================
      // CURRENT USER DATA
      // =====================================================

      const loadedForm = {

        username:
          userDataResponse.username || "",

        password: "",

        fullName:
          userDataResponse.fullName || "",

        email:
          userDataResponse.email || "",

        roleId:
          userDataResponse.role?.id || "",

        reportingManagerId:
          existingManagerId || "",

        // ===================================================
        // ACTION / STATUS
        // Backend field expected: enabled
        // ===================================================

        enabled:
          userDataResponse.enabled !== undefined
            ? Boolean(userDataResponse.enabled)
            : true,

      };

      setForm(loadedForm);

      setOriginalForm(loadedForm);

      setIsDirty(false);

    } catch (err) {

      console.error(
        "Load Edit User Error:",
        err
      );

      if (err.response?.status === 403) {

        toast.error(
          "You don't have permission to edit this user. Please contact the reporting manager."
        );

      } else {

        toast.error(
          err.response?.data?.message ||
            err.response?.data ||
            "Unable to load user details"
        );

      }

    } finally {

      setLoading(false);

    }

  };

  // =========================================================
  // CHECK STAFF ROLE
  // =========================================================

  const selectedRole = roles.find(
    (role) =>
      String(role.id) ===
      String(form.roleId)
  );

  const isStaffRole =
    selectedRole?.roleName
      ?.trim()
      .toUpperCase() === "STAFF";

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    let updatedForm = {
      ...form,
      [name]: value,
    };

    // =====================================================
    // ACTION VALUE
    // Select returns string, convert to boolean
    // =====================================================

    if (name === "enabled") {

      updatedForm = {
        ...updatedForm,
        enabled: value === "true",
      };

    }

    // =====================================================
    // ONLY STAFF CAN HAVE REPORTING MANAGER
    // =====================================================

    if (name === "roleId") {

      const selected = roles.find(
        (role) =>
          String(role.id) ===
          String(value)
      );

      const roleName =
        selected?.roleName
          ?.trim()
          .toUpperCase();

      if (roleName !== "STAFF") {

        updatedForm = {
          ...updatedForm,
          reportingManagerId: "",
        };

      }

    }

    setForm(updatedForm);

    // =====================================================
    // CHECK DIRTY
    // =====================================================

    const changed =
      updatedForm.fullName !==
        originalForm.fullName ||

      updatedForm.email !==
        originalForm.email ||

      updatedForm.password !== "" ||

      String(updatedForm.roleId) !==
        String(originalForm.roleId) ||

      String(
        updatedForm.reportingManagerId
      ) !==
        String(
          originalForm.reportingManagerId
        ) ||

      Boolean(updatedForm.enabled) !==
        Boolean(originalForm.enabled);

    setIsDirty(changed);

  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {

    if (!isDirty) {

      navigate("/settings/users");

      return;

    }

    setShowLeaveModal(true);

  };

  // =========================================================
  // BROWSER BACK
  // =========================================================

  useEffect(() => {

    if (loading) return;

    window.history.pushState(
      null,
      "",
      window.location.href
    );

    const handlePopState = () => {

      if (isDirty) {

        setShowLeaveModal(true);

        window.history.pushState(
          null,
          "",
          window.location.href
        );

      } else {

        navigate("/settings/users");

      }

    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {

      window.removeEventListener(
        "popstate",
        handlePopState
      );

    };

  }, [
    isDirty,
    loading,
    navigate,
  ]);

  // =========================================================
  // CONFIRM LEAVE
  // =========================================================

  const handleConfirmLeave = () => {

    setIsDirty(false);

    setShowLeaveModal(false);

    navigate("/settings/users");

  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!isDirty) {

      return;

    }

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!form.fullName.trim()) {

      toast.error("Full Name is required");

      return;

    }

    if (!form.email.trim()) {

      toast.error("Email is required");

      return;

    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {

      toast.error("Please enter a valid email");

      return;

    }

    if (!form.roleId) {

      toast.error("Please select a role");

      return;

    }

    // =====================================================
    // STAFF -> REPORTING MANAGER REQUIRED
    // =====================================================

    if (
      isStaffRole &&
      !form.reportingManagerId
    ) {

      toast.error(
        "Please select a Reporting Manager"
      );

      return;

    }

    // =====================================================
    // PASSWORD VALIDATION
    // =====================================================

    if (
      form.password &&
      form.password.trim().length < 6
    ) {

      toast.error(
        "Password must contain at least 6 characters"
      );

      return;

    }

    try {

      setSaving(true);

      // ===================================================
      // PAYLOAD
      // Includes Action / enabled
      // ===================================================

      const payload = {

        fullName:
          form.fullName.trim(),

        email:
          form.email.trim(),

        password:
          form.password,

        roleId:
          Number(form.roleId),

        reportingManagerId:
          isStaffRole &&
          form.reportingManagerId
            ? Number(
                form.reportingManagerId
              )
            : null,

        // =================================================
        // ACTIVE / INACTIVE
        // =================================================

        enabled:
          Boolean(form.enabled),

      };

      console.log(
        "Update User Payload:",
        payload
      );

      await updateUser(
        id,
        payload
      );

      toast.success(
        "User Updated Successfully"
      );

      setIsDirty(false);

      navigate("/settings/users");

    } catch (err) {

      console.error(
        "Update User Error:",
        err
      );

      if (err.response?.status === 403) {

        toast.error(
          "You don't have permission to update this user. Please contact the reporting manager."
        );

      } else {

        toast.error(
          err.response?.data?.message ||
            err.response?.data ||
            "Update Failed"
        );

      }

    } finally {

      setSaving(false);

    }

  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400">
        Loading...
      </div>
    );

  }

  // =========================================================
  // UI
  // =========================================================

  return (

    <div>

      <Card
        elevation={3}
        sx={{
          borderRadius: 3,
          backgroundColor: "var(--mui-card-bg)",
          border: "1px solid var(--mui-card-border)",
        }}
        className="dark:[--mui-card-bg:#0f172a] dark:[--mui-card-border:#334155]"
      >

        <CardContent sx={{ p: 4 }}>

          {/* HEADER */}

          <div className="mb-6">

            <Typography
              variant="h5"
              fontWeight={700}
              className="text-slate-800 dark:text-slate-100"
            >
              Edit User
            </Typography>

            <Typography
              variant="body2"
              className="text-gray-500 dark:text-slate-400 mt-1"
            >
              Update the user's account details
              and role.
            </Typography>

          </div>

          <Divider className="mb-7 dark:border-slate-700" />

          <form onSubmit={handleSubmit}>

            <Grid
              container
              spacing={3}
            >

              {/* FULL NAME */}

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "inherit",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "inherit",
                      backgroundColor: "transparent",
                      "& fieldset": {
                        borderColor: "inherit",
                      },
                    },
                  }}
                  className="dark:text-slate-200 dark:[--mui-text-color:#e2e8f0] dark:[--mui-border-color:#475569] dark:[--mui-label-color:#94a3b8]"
                />

              </Grid>

              {/* USERNAME */}

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={form.username}
                  disabled
                  helperText="Username cannot be changed"
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "inherit",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "inherit",
                      backgroundColor: "transparent",
                      "& fieldset": {
                        borderColor: "inherit",
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      color: "inherit",
                    },
                  }}
                  className="dark:text-slate-200 dark:[--mui-text-color:#e2e8f0] dark:[--mui-border-color:#475569] dark:[--mui-label-color:#94a3b8] dark:[--mui-helper-color:#64748b]"
                />

              </Grid>

              {/* EMAIL */}

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth
                  required
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "inherit",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "inherit",
                      backgroundColor: "transparent",
                      "& fieldset": {
                        borderColor: "inherit",
                      },
                    },
                  }}
                  className="dark:text-slate-200 dark:[--mui-text-color:#e2e8f0] dark:[--mui-border-color:#475569] dark:[--mui-label-color:#94a3b8]"
                />

              </Grid>

              {/* ROLE */}

              <Grid item xs={12} md={6}>

                <TextField
                  fullWidth
                  required
                  select
                  label="Role"
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "inherit",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "inherit",
                      backgroundColor: "transparent",
                      "& fieldset": {
                        borderColor: "inherit",
                      },
                    },
                    "& .MuiSelect-icon": {
                      color: "inherit",
                    },
                  }}
                  className="dark:text-slate-200 dark:[--mui-text-color:#e2e8f0] dark:[--mui-border-color:#475569] dark:[--mui-label-color:#94a3b8]"
                >

                  {roles.map((role) => (

                    <MenuItem
                      key={role.id}
                      value={role.id}
                    >
                      {role.roleName}
                    </MenuItem>

                  ))}

                </TextField>

              </Grid>

              {/* =================================================
                  REPORTING MANAGER
                  ONLY FOR STAFF
                  ================================================= */}

              {isStaffRole && (

                <Grid
                  item
                  xs={12}
                  md={6}
                >

                  <TextField
                    fullWidth
                    required
                    select
                    label="Reporting Manager"
                    name="reportingManagerId"
                    value={
                      form.reportingManagerId
                    }
                    onChange={handleChange}
                    helperText="Select the manager responsible for this staff"
                    sx={{
                      "& .MuiInputLabel-root": {
                        color: "inherit",
                      },
                      "& .MuiOutlinedInput-root": {
                        color: "inherit",
                        backgroundColor: "transparent",
                        "& fieldset": {
                          borderColor: "inherit",
                        },
                      },
                      "& .MuiSelect-icon": {
                        color: "inherit",
                      },
                      "& .MuiFormHelperText-root": {
                        color: "inherit",
                      },
                    }}
                    className="dark:text-slate-200 dark:[--mui-text-color:#e2e8f0] dark:[--mui-border-color:#475569] dark:[--mui-label-color:#94a3b8] dark:[--mui-helper-color:#64748b]"
                  >

                    <MenuItem value="">
                      Select Reporting Manager
                    </MenuItem>

                    {managers.map(
                      (manager) => (

                        <MenuItem
                          key={manager.id}
                          value={manager.id}
                        >
                          {manager.username ||
                            manager.userId ||
                            manager.id}{" "}
                          -{" "}
                          {manager.fullName}
                        </MenuItem>

                      )
                    )}

                  </TextField>

                </Grid>

              )}

              {/* =================================================
                  ACTION
                  ACTIVE / INACTIVE
                  ================================================= */}

              <Grid
                item
                xs={12}
                md={6}
              >

                <TextField
                  fullWidth
                  select
                  label="Action"
                  name="enabled"
                  value={
                    form.enabled
                      ? "true"
                      : "false"
                  }
                  onChange={handleChange}
                  helperText="Set the user's account status"
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "inherit",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "inherit",
                      backgroundColor: "transparent",
                      "& fieldset": {
                        borderColor: "inherit",
                      },
                    },
                    "& .MuiSelect-icon": {
                      color: "inherit",
                    },
                    "& .MuiFormHelperText-root": {
                      color: "inherit",
                    },
                  }}
                  className="dark:text-slate-200 dark:[--mui-text-color:#e2e8f0] dark:[--mui-border-color:#475569] dark:[--mui-label-color:#94a3b8] dark:[--mui-helper-color:#64748b]"
                >

                  <MenuItem value="true">
                    Active
                  </MenuItem>

                  <MenuItem value="false">
                    Inactive
                  </MenuItem>

                </TextField>

              </Grid>

              {/* PASSWORD */}

              <Grid item xs={12}>

                <TextField
                  fullWidth
                  label="New Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  helperText="Leave blank if you don't want to change the password"
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: "inherit",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "inherit",
                      backgroundColor: "transparent",
                      "& fieldset": {
                        borderColor: "inherit",
                      },
                    },
                    "& .MuiFormHelperText-root": {
                      color: "inherit",
                    },
                  }}
                  className="dark:text-slate-200 dark:[--mui-text-color:#e2e8f0] dark:[--mui-border-color:#475569] dark:[--mui-label-color:#94a3b8] dark:[--mui-helper-color:#64748b]"
                />

              </Grid>

            </Grid>

            {/* BUTTONS */}

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t dark:border-slate-700">

              <Button
                type="button"
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  minWidth: 120,
                  height: 44,
                  textTransform: "none",
                  borderRadius: 2,
                }}
                className="dark:text-slate-300 dark:border-slate-600"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                disabled={
                  saving || !isDirty
                }
                sx={{
                  minWidth: 140,
                  height: 44,
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                {saving
                  ? "Updating..."
                  : "Update User"}
              </Button>

            </div>

          </form>

        </CardContent>

      </Card>

      {/* =====================================================
          LEAVE WITHOUT SAVE MODAL
          ===================================================== */}

      {showLeaveModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl dark:border dark:border-slate-700">

            <div className="p-6 border-b border-slate-200 dark:border-slate-700">

              <div className="flex items-center gap-3">

                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-950/40">

                  <AlertTriangle
                    size={22}
                    className="text-amber-600 dark:text-amber-400"
                  />

                </div>

                <div>

                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Leave without saving?
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    You have unsaved changes.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6">

              <p className="text-sm text-slate-600 dark:text-slate-300">
                If you go back now, all the
                changes you made will be
                discarded.
              </p>

            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-b-2xl flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowLeaveModal(false)
                }
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 transition font-medium text-slate-700 dark:text-slate-200"
              >
                Stay & Edit
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmLeave
                }
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition font-semibold"
              >
                Yes, Go Back
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default EditUser;