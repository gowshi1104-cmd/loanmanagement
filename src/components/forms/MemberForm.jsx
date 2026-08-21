import {
  Save,
  AlertTriangle,
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

  const [loading, setLoading] = useState(false);

  const [groups, setGroups] = useState([]);

  const [groupsLoading, setGroupsLoading] =
    useState(false);

  const [documentFiles, setDocumentFiles] =
    useState([]);

  const [isDirty, setIsDirty] =
    useState(false);

  const [showLeaveModal, setShowLeaveModal] =
    useState(false);

  const historyGuardAdded =
    useRef(false);

  const allowBrowserBack =
    useRef(false);

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
  });

  // =========================================================
  // LOAD GROUPS
  // =========================================================

  useEffect(() => {

    const loadGroups = async () => {

      try {

        setGroupsLoading(true);

        const response =
          await getGroups();

        const data =
          response?.data;

        if (Array.isArray(data)) {

          setGroups(data);

        } else if (
          Array.isArray(data?.content)
        ) {

          setGroups(data.content);

        } else if (
          Array.isArray(data?.groups)
        ) {

          setGroups(data.groups);

        } else {

          setGroups([]);

        }

      } catch (error) {

        console.error(
          "Failed to load groups:",
          error
        );

        toast.error(
          "Failed to load groups"
        );

        setGroups([]);

      } finally {

        setGroupsLoading(false);

      }
    };

    loadGroups();

  }, []);

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

        navigate(
          "/members",
          {
            replace: true,
          }
        );

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

    // CUSTOMER ID CANNOT CHANGE
    if (name === "customerId") {
      return;
    }

    // PHONE
    if (name === "phone") {

      const phoneValue =
        value
          .replace(/\D/g, "")
          .slice(0, 10);

      setMember((prev) => ({
        ...prev,
        phone: phoneValue,
      }));

      setIsDirty(true);

      return;
    }

    // AADHAAR
    if (name === "aadharNumber") {

      const aadharValue =
        value
          .replace(/\D/g, "")
          .slice(0, 12);

      setMember((prev) => ({
        ...prev,
        aadharNumber:
          aadharValue,
      }));

      setIsDirty(true);

      return;
    }

    // PAN
    if (name === "panNumber") {

      const panValue =
        value
          .toUpperCase()
          .slice(0, 10);

      setMember((prev) => ({
        ...prev,
        panNumber:
          panValue,
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

    navigate(
      "/members",
      {
        replace: true,
      }
    );
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

    // =======================================================
    // GROUP ID IS REQUIRED
    // =======================================================

    if (!member.groupId) {

      toast.error(
        "Please select Group"
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

      // =====================================================
      // MEMBER DETAILS
      // =====================================================

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

      // =====================================================
      // GROUP ID
      // =====================================================

      formData.append(
        "groupId",
        String(member.groupId)
      );

      // =====================================================
      // GROUP NAME
      // =====================================================

      formData.append(
        "groupName",
        member.groupName
      );

      // =====================================================
      // STATUS
      // =====================================================

      formData.append(
        "status",
        member.status
      );

      // =====================================================
      // DOCUMENTS
      //
      // Backend currently accepts one MultipartFile.
      // So send first file for now.
      // =====================================================

      if (documentFiles.length > 0) {

        formData.append(
          "document",
          documentFiles[0]
        );
      }

      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "Saving member:",
        {
          name: member.name,
          phone: member.phone,
          groupId: member.groupId,
          groupName: member.groupName,
          status: member.status,
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

      }

      // =====================================================
      // CREATE
      // =====================================================

      else {

        await createMember(
          formData
        );
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      toast.success(
        isEdit
          ? "Member Updated Successfully"
          : "Member Added Successfully"
      );

      setIsDirty(false);

      allowBrowserBack.current = true;

      navigate(
        "/members",
        {
          replace: true,
        }
      );

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
      <div>

        {/* HEADER */}

        <div className="mb-6">

          <h2 className="text-xl font-semibold text-slate-800">
            Member Information
          </h2>

          <p className="text-slate-500 mt-1">
            Enter the member details below.
          </p>

        </div>

        {/* FORM */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6
          "
        >

          {/* CUSTOMER ID */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
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
                border
                border-slate-300
                bg-slate-100
                text-slate-500
                rounded-xl
                px-4
                py-3
                cursor-not-allowed
              "
            />

          </div>

          {/* FULL NAME */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
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
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                outline-none
              "
            />

          </div>

          {/* PHONE */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
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
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                outline-none
              "
            />

          </div>

          {/* ADDRESS */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
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
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                outline-none
              "
            />

          </div>

          {/* PAN */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
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
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                uppercase
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                outline-none
              "
            />

          </div>

          {/* AADHAAR */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
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
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                outline-none
              "
            />

          </div>

          {/* GROUP */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
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
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                outline-none
                disabled:bg-slate-100
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

          {/* STATUS */}

          <div>

            <label className="block mb-2 font-medium text-slate-700">
              Status
            </label>

            <select
              name="status"
              value={member.status}
              onChange={handleChange}
              className="
                w-full
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
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

          <div className="md:col-span-2">

            <label className="block mb-2 font-medium text-slate-700">

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
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                outline-none
              "
            />

            <p className="text-xs text-slate-500 mt-2">
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
                        items-center
                        justify-between
                        bg-slate-50
                        border
                        border-slate-200
                        rounded-lg
                        px-3
                        py-2
                      "
                    >

                      <span className="text-sm text-slate-700">
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
                          text-red-500
                          hover:text-red-700
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

                <p className="text-sm text-slate-500 mt-2">
                  Existing document:{" "}
                  {memberData.documentFileName}
                </p>

            )}

          </div>

        </div>

        {/* BUTTONS */}

        <div
          className="
            mt-10
            border-t
            pt-6
            flex
            justify-end
            gap-3
          "
        >

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="
              px-6
              py-3
              rounded-xl
              border
              border-slate-300
              hover:bg-slate-100
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
              flex
              items-center
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
                  ? "bg-slate-300 cursor-not-allowed"
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

      {/* LEAVE MODAL */}

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
            px-4
          "
        >

          <div
            className="
              bg-white
              w-full
              max-w-md
              rounded-2xl
              shadow-2xl
            "
          >

            <div
              className="
                p-6
                border-b
                border-slate-200
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    w-11
                    h-11
                    rounded-full
                    bg-amber-100
                  "
                >

                  <AlertTriangle
                    size={22}
                    className="text-amber-600"
                  />

                </div>

                <div>

                  <h3
                    className="
                      text-lg
                      font-semibold
                      text-slate-800
                    "
                  >
                    Leave without saving?
                  </h3>

                  <p
                    className="
                      text-sm
                      text-slate-500
                      mt-1
                    "
                  >
                    You have unsaved changes.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6">

              <p
                className="
                  text-sm
                  text-slate-600
                "
              >
                If you go back now, all
                changes will be discarded.
              </p>

            </div>

            <div
              className="
                px-6
                py-4
                bg-slate-50
                rounded-b-2xl
                flex
                justify-end
                gap-3
              "
            >

              <button
                type="button"
                onClick={handleStay}
                className="
                  px-5
                  py-2.5
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  hover:bg-slate-100
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