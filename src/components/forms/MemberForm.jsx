import {
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createMember,
  updateMember,
} from "../../services/memberService";

import {
  getGroups,
} from "../../services/groupService";

import {
  getUsers,
} from "../../services/userService";

import useAuth from "../../hooks/useAuth";

import toast from "react-hot-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const MemberForm = ({
  buttonText = "Save Member",
  memberData,
  isEdit = false,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // =========================================================
  // STAFF LIST
  // =========================================================
  const [staffUsers, setStaffUsers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  const [documentFiles, setDocumentFiles] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const historyGuardAdded = useRef(false);
  const allowBrowserBack = useRef(false);

  // =========================================================
  // CUSTOMER CREDENTIALS MODAL
  // =========================================================
  const [showCredentialsModal, setShowCredentialsModal] =
    useState(false);

  const [customerCredentials, setCustomerCredentials] = useState({
    customerId: "",
    username: "",
    temporaryPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  // =========================================================
  // GET CURRENT ROLE
  // =========================================================
  const getCurrentRoleName = () => {
    const role =
      user?.role?.roleName ||
      user?.roleName ||
      user?.role ||
      "";

    return String(role)
      .replace("ROLE_", "")
      .trim()
      .toUpperCase();
  };

  const currentRole = getCurrentRoleName();

  const canAssignStaff =
    currentRole === "ADMIN" ||
    currentRole === "MANAGER";

  // =========================================================
  // MEMBER STATE
  // =========================================================
  const [member, setMember] = useState({
    customerId: "",
    name: "",
    phone: "",
    address: "",
    panNumber: "",
    aadharNumber: "",
    groupId: "",
    groupName: "",
    status: "ACTIVE",

    // =====================================================
    // TASK 2
    // STAFF ASSIGNMENT
    // =====================================================
    assignedStaffId: "",
    assignedStaffName: "",
  });

  // =========================================================
  // LOAD GROUPS
  // =========================================================
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setGroupsLoading(true);

        const response = await getGroups();
        const data = response?.data;

        if (Array.isArray(data)) {
          setGroups(data);
        } else if (Array.isArray(data?.content)) {
          setGroups(data.content);
        } else if (Array.isArray(data?.groups)) {
          setGroups(data.groups);
        } else {
          setGroups([]);
        }
      } catch (error) {
        console.error(
          "Failed to load groups:",
          error
        );

        toast.error("Failed to load groups");
        setGroups([]);
      } finally {
        setGroupsLoading(false);
      }
    };

    loadGroups();
  }, []);

  // =========================================================
  // LOAD STAFF USERS
  //
  // ONLY ADMIN / MANAGER
  // =========================================================
  useEffect(() => {
    if (!canAssignStaff) {
      setStaffUsers([]);
      return;
    }

    const loadStaffUsers = async () => {
      try {
        setStaffLoading(true);

        const response = await getUsers();
        const data = response?.data;

        let users = [];

        if (Array.isArray(data)) {
          users = data;
        } else if (Array.isArray(data?.content)) {
          users = data.content;
        } else if (Array.isArray(data?.users)) {
          users = data.users;
        }

        // =================================================
        // ONLY STAFF ROLE
        // =================================================
        const onlyStaff = users.filter((userItem) => {
          const role =
            userItem?.role?.roleName ||
            userItem?.roleName ||
            userItem?.role ||
            "";

          return (
            String(role)
              .replace("ROLE_", "")
              .trim()
              .toUpperCase() === "STAFF"
          );
        });

        setStaffUsers(onlyStaff);
      } catch (error) {
        console.error(
          "Failed to load staff users:",
          error
        );

        toast.error("Failed to load staff users");
        setStaffUsers([]);
      } finally {
        setStaffLoading(false);
      }
    };

    loadStaffUsers();
  }, [canAssignStaff]);

  // =========================================================
  // LOAD MEMBER DATA FOR EDIT
  // =========================================================
  useEffect(() => {
    if (!memberData) {
      return;
    }

    setMember({
      customerId:
        memberData.customerId || "",

      name:
        memberData.name || "",

      phone:
        memberData.phone || "",

      address:
        memberData.address || "",

      panNumber:
        memberData.panNumber || "",

      aadharNumber:
        memberData.aadharNumber || "",

      groupId:
        memberData.groupId ||
        memberData.group?.id ||
        "",

      groupName:
        memberData.groupName ||
        memberData.group?.groupName ||
        "",

      status:
        memberData.status ||
        "ACTIVE",

      // =====================================================
      // LOAD ASSIGNED STAFF
      // =====================================================
      assignedStaffId:
        memberData.assignedStaffId ||
        memberData.assignedStaff?.id ||
        "",

      assignedStaffName:
        memberData.assignedStaffName ||
        memberData.assignedStaff?.fullName ||
        memberData.assignedStaff?.username ||
        "",
    });

    setIsDirty(false);
    setDocumentFiles([]);
  }, [memberData]);

  // =========================================================
  // BROWSER BACK BUTTON
  // =========================================================
  useEffect(() => {
    if (historyGuardAdded.current) {
      return;
    }

    historyGuardAdded.current = true;

    window.history.pushState(
      {
        memberFormPage: true,
      },
      "",
      window.location.href
    );

    const handlePopState = () => {
      if (allowBrowserBack.current) {
        return;
      }

      window.history.pushState(
        {
          memberFormPage: true,
        },
        "",
        window.location.href
      );

      if (!isDirty) {
        navigate("/members", {
          replace: true,
        });

        return;
      }

      setShowLeaveModal(true);
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

      historyGuardAdded.current = false;
    };
  }, [isDirty, navigate]);

  // =========================================================
  // FIELD CHANGE
  // =========================================================
  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    if (name === "customerId") {
      return;
    }

    if (name === "phone") {
      const phoneValue = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setMember((prev) => ({
        ...prev,
        phone: phoneValue,
      }));

      setIsDirty(true);

      return;
    }

    if (name === "aadharNumber") {
      const aadharValue = value
        .replace(/\D/g, "")
        .slice(0, 12);

      setMember((prev) => ({
        ...prev,
        aadharNumber: aadharValue,
      }));

      setIsDirty(true);

      return;
    }

    if (name === "panNumber") {
      const panValue = value
        .toUpperCase()
        .slice(0, 10);

      setMember((prev) => ({
        ...prev,
        panNumber: panValue,
      }));

      setIsDirty(true);

      return;
    }

    setMember((prev) => ({
      ...prev,
      [name]: value,
    }));

    setIsDirty(true);
  };

  // =========================================================
  // GROUP CHANGE
  // =========================================================
  const handleGroupChange = (e) => {
    const selectedGroupId =
      e.target.value;

    const selectedGroup =
      groups.find(
        (group) =>
          String(
            group.id ??
              group.groupId
          ) ===
          String(selectedGroupId)
      );

    const selectedGroupName =
      selectedGroup?.groupName ??
      selectedGroup?.name ??
      "";

    setMember((prev) => ({
      ...prev,
      groupId:
        selectedGroupId,
      groupName:
        selectedGroupName,
    }));

    setIsDirty(true);
  };

  // =========================================================
  // STAFF ASSIGNMENT CHANGE
  // =========================================================
  const handleStaffChange = (e) => {
    const selectedStaffId =
      e.target.value;

    const selectedStaff =
      staffUsers.find(
        (staff) =>
          String(staff.id) ===
          String(selectedStaffId)
      );

    const staffName =
      selectedStaff?.fullName ||
      selectedStaff?.name ||
      selectedStaff?.username ||
      "";

    setMember((prev) => ({
      ...prev,
      assignedStaffId:
        selectedStaffId,
      assignedStaffName:
        staffName,
    }));

    setIsDirty(true);
  };

  // =========================================================
  // DOCUMENT SELECTION
  // =========================================================
  const handleDocumentChange = (e) => {
    const selectedFiles =
      Array.from(
        e.target.files || []
      );

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    const validFiles = [];

    for (
      const file of selectedFiles
    ) {
      if (
        !ALLOWED_FILE_TYPES.includes(
          file.type
        )
      ) {
        toast.error(
          `${file.name}: Only PDF, JPG and PNG files are allowed`
        );

        continue;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        toast.error(
          `${file.name}: Document size must not exceed 5 MB`
        );

        continue;
      }

      const alreadySelected =
        documentFiles.some(
          (existingFile) =>
            existingFile.name ===
              file.name &&
            existingFile.size ===
              file.size
        );

      if (alreadySelected) {
        toast.error(
          `${file.name} is already selected`
        );

        continue;
      }

      validFiles.push(file);
    }

    if (
      validFiles.length > 0
    ) {
      setDocumentFiles(
        (prev) => [
          ...prev,
          ...validFiles,
        ]
      );

      setIsDirty(true);
    }

    e.target.value = "";
  };

  // =========================================================
  // REMOVE DOCUMENT
  // =========================================================
  const handleRemoveDocument = (
    index
  ) => {
    setDocumentFiles(
      (prev) =>
        prev.filter(
          (_, fileIndex) =>
            fileIndex !== index
        )
    );

    setIsDirty(true);
  };

  // =========================================================
  // CANCEL
  // =========================================================
  const handleCancel = () => {
    if (!isDirty) {
      navigate("/members");
      return;
    }

    setShowLeaveModal(true);
  };

  // =========================================================
  // STAY
  // =========================================================
  const handleStay = () => {
    setShowLeaveModal(false);
  };

  // =========================================================
  // CONFIRM LEAVE
  // =========================================================
  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    setIsDirty(false);

    allowBrowserBack.current = true;

    navigate("/members", {
      replace: true,
    });
  };

  // =========================================================
  // COPY CREDENTIAL
  // =========================================================
  const handleCopyCredential = async (
    value,
    field
  ) => {
    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopiedField(field);

      toast.success(
        `${
          field === "username"
            ? "Username"
            : "Temporary password"
        } copied`
      );

      setTimeout(() => {
        setCopiedField("");
      }, 2000);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );

      toast.error(
        "Failed to copy"
      );
    }
  };

  // =========================================================
  // CLOSE CREDENTIALS MODAL
  // =========================================================
  const handleCloseCredentials = () => {
    setShowCredentialsModal(false);

    setCustomerCredentials({
      customerId: "",
      username: "",
      temporaryPassword: "",
    });

    setShowPassword(false);
    setCopiedField("");
    setIsDirty(false);

    allowBrowserBack.current = true;

    navigate("/members", {
      replace: true,
    });
  };

  // =========================================================
  // VALIDATION
  // =========================================================
  const validate = () => {
    if (!member.name.trim()) {
      toast.error(
        "Member Name is required"
      );

      return false;
    }

    if (!member.phone.trim()) {
      toast.error(
        "Phone Number is required"
      );

      return false;
    }

    if (
      !/^[0-9]{10}$/.test(
        member.phone
      )
    ) {
      toast.error(
        "Enter valid 10 digit phone number"
      );

      return false;
    }

    if (!member.address.trim()) {
      toast.error(
        "Address is required"
      );

      return false;
    }

    if (!member.panNumber.trim()) {
      toast.error(
        "PAN Number is required"
      );

      return false;
    }

    if (
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(
        member.panNumber
      )
    ) {
      toast.error(
        "Enter valid PAN Number"
      );

      return false;
    }

    if (
      !member.aadharNumber.trim()
    ) {
      toast.error(
        "Aadhaar Number is required"
      );

      return false;
    }

    if (
      !/^[0-9]{12}$/.test(
        member.aadharNumber
      )
    ) {
      toast.error(
        "Enter valid 12 digit Aadhaar Number"
      );

      return false;
    }

    if (!member.groupId) {
      toast.error(
        "Please select Group"
      );

      return false;
    }

    // =======================================================
    // STAFF ASSIGNMENT
    // REQUIRED ONLY FOR ADMIN / MANAGER
    // =======================================================
    if (
      canAssignStaff &&
      !member.assignedStaffId
    ) {
      toast.error(
        "Please assign a Staff"
      );

      return false;
    }

    if (
      !isEdit &&
      documentFiles.length === 0
    ) {
      toast.error(
        "At least one member document is required"
      );

      return false;
    }

    return true;
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        member.name.trim()
      );

      formData.append(
        "phone",
        member.phone
      );

      formData.append(
        "address",
        member.address.trim()
      );

      formData.append(
        "panNumber",
        member.panNumber
      );

      formData.append(
        "aadharNumber",
        member.aadharNumber
      );

      formData.append(
        "groupId",
        String(member.groupId)
      );

      formData.append(
        "groupName",
        member.groupName
      );

      formData.append(
        "status",
        member.status
      );

      // =====================================================
      // TASK 2
      // SEND ASSIGNED STAFF
      //
      // ADMIN / MANAGER ONLY
      // =====================================================
      if (
        canAssignStaff &&
        member.assignedStaffId
      ) {
        formData.append(
          "assignedStaffUserId",
          String(
            member.assignedStaffId
          )
        );

        formData.append(
          "assignedStaffName",
          member.assignedStaffName ||
            ""
        );
      }

      if (
        documentFiles.length > 0
      ) {
        formData.append(
          "document",
          documentFiles[0]
        );
      }

      console.log(
        "Saving member:",
        {
          name:
            member.name,

          phone:
            member.phone,

          groupId:
            member.groupId,

          groupName:
            member.groupName,

          assignedStaffId:
            member.assignedStaffId,

          assignedStaffName:
            member.assignedStaffName,

          status:
            member.status,

          documentCount:
            documentFiles.length,
        }
      );

      // =====================================================
      // EDIT
      // =====================================================
      if (isEdit) {
        await updateMember(
          id,
          formData
        );

        toast.success(
          "Member Updated Successfully"
        );

        setIsDirty(false);

        allowBrowserBack.current =
          true;

        navigate("/members", {
          replace: true,
        });

        return;
      }

      // =====================================================
      // CREATE CUSTOMER
      // =====================================================
      const response =
        await createMember(
          formData
        );

      console.log(
        "Customer creation response:",
        response?.data
      );

      const responseData =
        response?.data;

      // =====================================================
      // GET CUSTOMER ID
      // =====================================================
      const generatedCustomerId =
        responseData?.customerId ||
        responseData?.member
          ?.customerId ||
        "";

      // =====================================================
      // GET USERNAME
      // =====================================================
      const generatedUsername =
        responseData?.username ||
        responseData?.user?.username ||
        responseData?.userDetails?.username ||
        "";

      // =====================================================
      // IMPORTANT FIX
      //
      // BACKEND RESPONSE:
      //
      // "temporaryPassword": "c0f9dc00c7"
      //
      // So temporaryPassword must be checked.
      // =====================================================
      const generatedPassword =
        responseData?.temporaryPassword ||
        responseData?.password ||
        responseData?.generatedPassword ||
        responseData?.user?.temporaryPassword ||
        responseData?.user?.password ||
        responseData?.userDetails?.temporaryPassword ||
        responseData?.userDetails?.password ||
        "";

      console.log(
        "Generated customer credentials:",
        {
          customerId:
            generatedCustomerId,

          username:
            generatedUsername,

          temporaryPassword:
            generatedPassword,
        }
      );

      // =====================================================
      // SHOW CREDENTIALS MODAL
      // =====================================================
      if (
        generatedUsername &&
        generatedPassword
      ) {
        setCustomerCredentials({
          customerId:
            generatedCustomerId,

          username:
            generatedUsername,

          temporaryPassword:
            generatedPassword,
        });

        setShowCredentialsModal(true);

        return;
      }

      // =====================================================
      // FALLBACK
      // =====================================================
      if (generatedUsername) {
        toast.success(
          `Customer created successfully!
Username: ${generatedUsername}`,
          {
            duration: 6000,
          }
        );
      } else {
        toast.success(
          "Customer Added Successfully"
        );
      }

      setIsDirty(false);

      allowBrowserBack.current =
        true;

      navigate("/members", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Member save error:",
        error
      );

      console.log(
        "Status:",
        error.response?.status
      );

      console.log(
        "Backend response:",
        error.response?.data
      );

      if (
        error.response?.status ===
        401
      ) {
        toast.error(
          "Session expired. Please login again."
        );
      } else if (
        error.response?.status ===
        403
      ) {
        toast.error(
          "You do not have permission to save members."
        );
      } else if (
        error.response?.status ===
        413
      ) {
        toast.error(
          "Total document upload size must not exceed allowed limit"
        );
      } else {
        const message =
          error.response?.data
            ?.message ||
          error.response?.data ||
          "Failed to save member";

        toast.error(
          typeof message ===
            "string"
            ? message
            : "Failed to save member"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // BUTTON
  // =========================================================
  const isSaveDisabled =
    loading ||
    !isDirty;

  // =========================================================
  // UI
  // =========================================================
  return (
    <>
      <div className="w-full min-w-0">
        {/* HEADER */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">
            Member Information
          </h2>

          <p className="mt-1 text-sm sm:text-base text-slate-500 dark:text-slate-400">
            Enter the member details below.
          </p>
        </div>

        {/* FORM */}
        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:gap-6
            md:grid-cols-2
          "
        >
          {/* CUSTOMER ID */}
          <div className="min-w-0">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
              Customer ID
            </label>

            <input
              type="text"
              name="customerId"
              value={
                member.customerId ||
                "Auto generated"
              }
              disabled
              className="
                w-full
                min-w-0
                border
                border-slate-300
                dark:border-slate-700
                bg-slate-100
                dark:bg-slate-800
                text-slate-500
                dark:text-slate-400
                rounded-xl
                px-3
                sm:px-4
                py-3
                cursor-not-allowed
              "
            />
          </div>

          {/* FULL NAME */}
          <div className="min-w-0">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
              Full Name
              <span className="text-red-500">
                {" *"}
              </span>
            </label>

            <input
              autoFocus
              type="text"
              name="name"
              value={member.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="
                w-full
                min-w-0
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-slate-100
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                rounded-xl
                px-3
                sm:px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                dark:focus:ring-blue-900
                outline-none
              "
            />
          </div>

          {/* PHONE */}
          <div className="min-w-0">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
              Phone Number
              <span className="text-red-500">
                {" *"}
              </span>
            </label>

            <input
              type="text"
              name="phone"
              value={member.phone}
              onChange={handleChange}
              maxLength={10}
              inputMode="numeric"
              placeholder="Enter 10 digit phone number"
              className="
                w-full
                min-w-0
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-slate-100
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                rounded-xl
                px-3
                sm:px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                dark:focus:ring-blue-900
                outline-none
              "
            />
          </div>

          {/* ADDRESS */}
          <div className="min-w-0">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
              Address
              <span className="text-red-500">
                {" *"}
              </span>
            </label>

            <input
              type="text"
              name="address"
              value={member.address}
              onChange={handleChange}
              placeholder="Enter address"
              className="
                w-full
                min-w-0
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-slate-100
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                rounded-xl
                px-3
                sm:px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                dark:focus:ring-blue-900
                outline-none
              "
            />
          </div>

          {/* PAN */}
          <div className="min-w-0">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
              PAN Number
              <span className="text-red-500">
                {" *"}
              </span>
            </label>

            <input
              type="text"
              name="panNumber"
              value={member.panNumber}
              onChange={handleChange}
              maxLength={10}
              placeholder="ABCDE1234F"
              className="
                w-full
                min-w-0
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-slate-100
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                rounded-xl
                px-3
                sm:px-4
                py-3
                uppercase
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                dark:focus:ring-blue-900
                outline-none
              "
            />
          </div>

          {/* AADHAAR */}
          <div className="min-w-0">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
              Aadhaar Number
              <span className="text-red-500">
                {" *"}
              </span>
            </label>

            <input
              type="text"
              name="aadharNumber"
              value={member.aadharNumber}
              onChange={handleChange}
              maxLength={12}
              inputMode="numeric"
              placeholder="Enter 12 digit Aadhaar number"
              className="
                w-full
                min-w-0
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-slate-100
                placeholder:text-slate-400
                dark:placeholder:text-slate-500
                rounded-xl
                px-3
                sm:px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                dark:focus:ring-blue-900
                outline-none
              "
            />
          </div>

          {/* GROUP */}
          <div className="min-w-0">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
              Group
              <span className="text-red-500">
                {" *"}
              </span>
            </label>

            <select
              name="groupId"
              value={member.groupId}
              onChange={handleGroupChange}
              disabled={groupsLoading}
              className="
                w-full
                min-w-0
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-slate-100
                rounded-xl
                px-3
                sm:px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                dark:focus:ring-blue-900
                outline-none
                disabled:bg-slate-100
                dark:disabled:bg-slate-800
                disabled:cursor-not-allowed
              "
            >
              <option value="">
                {groupsLoading
                  ? "Loading Groups..."
                  : "Select Group"}
              </option>

              {groups.map((group) => {
                const groupId =
                  group.id ??
                  group.groupId;

                const groupName =
                  group.groupName ??
                  group.name;

                return (
                  <option
                    key={groupId}
                    value={groupId}
                  >
                    {groupName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* =================================================
              ASSIGN STAFF
              ONLY ADMIN / MANAGER
              ================================================= */}
          {canAssignStaff && (
            <div className="min-w-0">
              <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
                Assign Staff
                <span className="text-red-500">
                  {" *"}
                </span>
              </label>

              <select
                name="assignedStaffId"
                value={
                  member.assignedStaffId
                }
                onChange={
                  handleStaffChange
                }
                disabled={staffLoading}
                className="
                  w-full
                  min-w-0
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-800
                  text-slate-900
                  dark:text-slate-100
                  rounded-xl
                  px-3
                  sm:px-4
                  py-3
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-200
                  dark:focus:ring-blue-900
                  outline-none
                  disabled:bg-slate-100
                  dark:disabled:bg-slate-800
                  disabled:cursor-not-allowed
                "
              >
                <option value="">
                  {staffLoading
                    ? "Loading Staff..."
                    : "Select Staff"}
                </option>

                {staffUsers.map(
                  (staff) => {
                    const staffName =
                      staff.fullName ||
                      staff.name ||
                      staff.username ||
                      "Unknown Staff";

                    const staffId =
                      staff.id;

                    return (
                      <option
                        key={staffId}
                        value={staffId}
                      >
                        {staffName}
                        {" - "}
                        ID: {staffId}
                      </option>
                    );
                  }
                )}
              </select>
            </div>
          )}

          {/* STATUS */}
          <div className="min-w-0">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
              Status
            </label>

            <select
              name="status"
              value={member.status}
              onChange={handleChange}
              className="
                w-full
                min-w-0
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-slate-100
                rounded-xl
                px-3
                sm:px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                dark:focus:ring-blue-900
                outline-none
              "
            >
              <option value="ACTIVE">
                ACTIVE
              </option>

              <option value="INACTIVE">
                INACTIVE
              </option>
            </select>
          </div>

          {/* DOCUMENTS */}
          <div className="md:col-span-2 min-w-0">
            <label className="block mb-2 font-medium text-slate-700 dark:text-slate-200">
              Member Documents

              {!isEdit && (
                <span className="text-red-500">
                  {" *"}
                </span>
              )}
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={
                handleDocumentChange
              }
              className="
                w-full
                min-w-0
                border
                border-slate-300
                dark:border-slate-700
                bg-white
                dark:bg-slate-800
                text-slate-900
                dark:text-slate-100
                file:bg-slate-100
                dark:file:bg-slate-700
                file:text-slate-700
                dark:file:text-slate-200
                rounded-xl
                px-3
                sm:px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                dark:focus:ring-blue-900
                outline-none
              "
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              PDF, JPG or PNG • Maximum 5 MB per file
            </p>

            {documentFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {documentFiles.map(
                  (file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        bg-slate-50
                        dark:bg-slate-800
                        border
                        border-slate-200
                        dark:border-slate-700
                        rounded-lg
                        px-3
                        py-2
                      "
                    >
                      <span className="min-w-0 break-all text-sm text-slate-700 dark:text-slate-200">
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveDocument(
                            index
                          )
                        }
                        className="
                          self-start
                          sm:self-auto
                          text-red-500
                          hover:text-red-700
                          dark:hover:text-red-400
                          text-sm
                        "
                      >
                        Remove
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {isEdit &&
              memberData?.documentFileName &&
              documentFiles.length === 0 && (
                <p className="text-sm break-all text-slate-500 dark:text-slate-400 mt-2">
                  Existing document:{" "}
                  {
                    memberData.documentFileName
                  }
                </p>
              )}
          </div>
        </div>

        {/* BUTTONS */}
        <div
          className="
            mt-8
            sm:mt-10
            border-t
            border-slate-200
            dark:border-slate-700
            pt-5
            sm:pt-6
            flex
            flex-col-reverse
            sm:flex-row
            sm:justify-end
            gap-3
          "
        >
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="
              w-full
              sm:w-auto
              px-6
              py-3
              rounded-xl
              border
              border-slate-300
              dark:border-slate-700
              bg-white
              dark:bg-slate-800
              text-slate-700
              dark:text-slate-200
              hover:bg-slate-100
              dark:hover:bg-slate-700
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaveDisabled}
            className={`
              w-full
              sm:w-auto
              flex
              items-center
              justify-center
              gap-2
              px-8
              py-3
              rounded-xl
              font-semibold
              shadow-md
              transition
              text-white
              ${
                isSaveDisabled
                  ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            <Save size={18} />

            {loading
              ? isEdit
                ? "Updating..."
                : "Saving..."
              : buttonText}
          </button>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER CREDENTIALS MODAL
          ===================================================== */}
      {showCredentialsModal && (
        <div
          className="
            fixed
            inset-0
            z-[10000]
            flex
            items-center
            justify-center
            bg-black/60
            px-3
            sm:px-4
            py-4
          "
        >
          <div
            className="
              bg-white
              dark:bg-slate-900
              w-full
              max-w-md
              max-h-[calc(100vh-2rem)]
              overflow-y-auto
              rounded-2xl
              shadow-2xl
              overflow-hidden
            "
          >
            {/* HEADER */}
            <div
              className="
                px-4
                sm:px-6
                py-4
                sm:py-5
                border-b
                border-slate-200
                dark:border-slate-700
                bg-slate-50
                dark:bg-slate-800
              "
            >
              <h3
                className="
                  text-lg
                  sm:text-xl
                  font-bold
                  text-slate-800
                  dark:text-slate-100
                "
              >
                Customer Created Successfully
              </h3>

              <p
                className="
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                  mt-1
                "
              >
                Please save these login credentials.
              </p>
            </div>

            {/* BODY */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* CUSTOMER ID */}
              {customerCredentials.customerId && (
                <div>
                  <label
                    className="
                      block
                      text-sm
                      font-medium
                      text-slate-600
                      dark:text-slate-300
                      mb-2
                    "
                  >
                    Customer ID
                  </label>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                      border
                      border-slate-300
                      dark:border-slate-700
                      rounded-xl
                      px-3
                      sm:px-4
                      py-3
                      bg-slate-50
                      dark:bg-slate-800
                    "
                  >
                    <span
                      className="
                        min-w-0
                        break-all
                        font-semibold
                        text-slate-800
                        dark:text-slate-100
                      "
                    >
                      {
                        customerCredentials.customerId
                      }
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCredential(
                          customerCredentials.customerId,
                          "customerId"
                        )
                      }
                      className="
                        shrink-0
                        text-slate-500
                        dark:text-slate-400
                        hover:text-blue-600
                        dark:hover:text-blue-400
                      "
                      title="Copy Customer ID"
                    >
                      {copiedField ===
                      "customerId" ? (
                        <Check
                          size={18}
                        />
                      ) : (
                        <Copy
                          size={18}
                        />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* USERNAME */}
              <div>
                <label
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-600
                    dark:text-slate-300
                    mb-2
                  "
                >
                  Username
                </label>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border
                    border-slate-300
                    dark:border-slate-700
                    rounded-xl
                    px-3
                    sm:px-4
                    py-3
                    bg-slate-50
                    dark:bg-slate-800
                  "
                >
                  <span
                    className="
                      min-w-0
                      break-all
                      font-semibold
                      text-slate-800
                      dark:text-slate-100
                    "
                  >
                    {
                      customerCredentials.username
                    }
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCredential(
                        customerCredentials.username,
                        "username"
                      )
                    }
                    className="
                      shrink-0
                      text-slate-500
                      dark:text-slate-400
                      hover:text-blue-600
                      dark:hover:text-blue-400
                    "
                    title="Copy Username"
                  >
                    {copiedField ===
                    "username" ? (
                      <Check
                        size={18}
                      />
                    ) : (
                      <Copy
                        size={18}
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* TEMPORARY PASSWORD */}
              <div>
                <label
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-600
                    dark:text-slate-300
                    mb-2
                  "
                >
                  Temporary Password
                </label>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border
                    border-blue-300
                    dark:border-blue-800
                    rounded-xl
                    px-3
                    sm:px-4
                    py-3
                    bg-blue-50
                    dark:bg-blue-950/40
                  "
                >
                  <span
                    className="
                      min-w-0
                      break-all
                      font-mono
                      font-semibold
                      text-slate-800
                      dark:text-slate-100
                      tracking-wide
                    "
                  >
                    {showPassword
                      ? customerCredentials.temporaryPassword
                      : "••••••••••"}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="
                        text-slate-500
                        dark:text-slate-400
                        hover:text-blue-600
                        dark:hover:text-blue-400
                      "
                      title={
                        showPassword
                          ? "Hide Password"
                          : "Show Password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          size={18}
                        />
                      ) : (
                        <Eye
                          size={18}
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCredential(
                          customerCredentials.temporaryPassword,
                          "temporaryPassword"
                        )
                      }
                      className="
                        text-slate-500
                        dark:text-slate-400
                        hover:text-blue-600
                        dark:hover:text-blue-400
                      "
                      title="Copy Temporary Password"
                    >
                      {copiedField ===
                      "temporaryPassword" ? (
                        <Check
                          size={18}
                        />
                      ) : (
                        <Copy
                          size={18}
                        />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* WARNING */}
              <div
                className="
                  flex
                  gap-3
                  rounded-xl
                  bg-amber-50
                  dark:bg-amber-950/40
                  border
                  border-amber-200
                  dark:border-amber-800
                  p-3
                  sm:p-4
                "
              >
                <AlertTriangle
                  size={20}
                  className="
                    text-amber-600
                    dark:text-amber-400
                    shrink-0
                    mt-0.5
                  "
                />

                <p
                  className="
                    text-sm
                    text-amber-800
                    dark:text-amber-300
                  "
                >
                  Give these credentials to the customer.
                  The customer should change the temporary
                  password after the first login.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="
                px-4
                sm:px-6
                py-4
                bg-slate-50
                dark:bg-slate-800
                border-t
                border-slate-200
                dark:border-slate-700
                flex
                justify-end
              "
            >
              <button
                type="button"
                onClick={
                  handleCloseCredentials
                }
                className="
                  w-full
                  sm:w-auto
                  px-6
                  py-3
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  font-semibold
                  shadow-md
                "
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          LEAVE MODAL
          ===================================================== */}
      {showLeaveModal && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/50
            px-3
            sm:px-4
            py-4
          "
        >
          <div
            className="
              bg-white
              dark:bg-slate-900
              w-full
              max-w-md
              max-h-[calc(100vh-2rem)]
              overflow-y-auto
              rounded-2xl
              shadow-2xl
            "
          >
            <div
              className="
                p-4
                sm:p-6
                border-b
                border-slate-200
                dark:border-slate-700
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    w-10
                    h-10
                    sm:w-11
                    sm:h-11
                    rounded-full
                    bg-amber-100
                    dark:bg-amber-950/50
                    shrink-0
                  "
                >
                  <AlertTriangle
                    size={22}
                    className="
                      text-amber-600
                      dark:text-amber-400
                    "
                  />
                </div>

                <div className="min-w-0">
                  <h3
                    className="
                      text-base
                      sm:text-lg
                      font-semibold
                      text-slate-800
                      dark:text-slate-100
                    "
                  >
                    Leave without saving?
                  </h3>

                  <p
                    className="
                      text-sm
                      text-slate-500
                      dark:text-slate-400
                      mt-1
                    "
                  >
                    You have unsaved changes.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <p
                className="
                  text-sm
                  text-slate-600
                  dark:text-slate-300
                "
              >
                If you go back now, all
                changes will be discarded.
              </p>
            </div>

            <div
              className="
                px-4
                sm:px-6
                py-4
                bg-slate-50
                dark:bg-slate-800
                rounded-b-2xl
                flex
                flex-col-reverse
                sm:flex-row
                sm:justify-end
                gap-3
              "
            >
              <button
                type="button"
                onClick={handleStay}
                className="
                  w-full
                  sm:w-auto
                  px-5
                  py-2.5
                  rounded-xl
                  border
                  border-slate-300
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-900
                  text-slate-700
                  dark:text-slate-200
                  hover:bg-slate-100
                  dark:hover:bg-slate-700
                "
              >
                Stay & Edit
              </button>

              <button
                type="button"
                onClick={
                  handleConfirmLeave
                }
                className="
                  w-full
                  sm:w-auto
                  px-5
                  py-2.5
                  rounded-xl
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  font-semibold
                "
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

export default MemberForm;