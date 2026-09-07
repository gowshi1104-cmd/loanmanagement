import {
  Save,
  X,
  AlertTriangle,
  Search,
  FileText,
  Download,
  Upload,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  UserRound,
  Landmark,
  Calculator,
  ShieldCheck,
  WalletCards,
  CalendarDays,
  Users,
  IndianRupee,
  Clock3,
  ClipboardCheck,
  Loader2,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { generateLoanApplicationPdf } from "../../utils/loanApplicationPdf";

import { getMemberByCustomerId } from "../../services/memberService";

import { getCustomerLoans } from "../../services/loanService";

import { uploadLoanDocuments } from "../../services/loanDocumentService";

import CustomerSection from "./CustomerSection";

import LoanDetailsSection from "./LoanDetailsSection";

import LoanStatusSection from "./LoanStatusSection";

import PersonalDetailsSection from "./PersonalDetailsSection";

import LoanDocumentsSection from "./LoanDocumentsSection";

import DocumentUpload from "./DocumentUpload";

import EmiDetailsCard from "./EmiDetailsCard";

import PdfStatus from "./PdfStatus";

import LeaveModal from "./LeaveModal";

import ApplicationSummary from "./ApplicationSummary";

import FinancialInformation from "./FinancialInformation";

import CustomerSnapshot from "./CustomerSnapshot";

import EligibilityCheck from "./EligibilityCheck";

import LoanCalculator from "./LoanCalculator";

import DocumentStatus from "./DocumentStatus";

import QuickActions from "./QuickActions";

// =========================================================
// GET TODAY
// =========================================================

const getToday = () => {
  return new Date()
    .toISOString()
    .split("T")[0];
};

// =========================================================
// EMPTY DOCUMENTS
// =========================================================

const EMPTY_DOCUMENTS = {
  aadhaar: null,
  pan: null,
  rationCard: null,
  photo: null,
};

// =========================================================
// VALID ROLES
// =========================================================

const VALID_ROLES = [
  "STAFF",
  "MANAGER",
  "ADMIN",
];

// =========================================================
// NORMALIZE ROLE
// =========================================================

const normalizeRole = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value !== "string") {
    return "";
  }

  return value
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .replace(/^ROLE-/, "")
    .trim();
};

// =========================================================
// VALID ROLE
// =========================================================

const isValidRole = (role) => {
  return VALID_ROLES.includes(role);
};

// =========================================================
// EXTRACT ROLE FROM ANY VALUE
// =========================================================

const extractRole = (value) => {
  if (!value) {
    return "";
  }

  // -------------------------------------------------------
  // STRING
  // -------------------------------------------------------

  if (typeof value === "string") {
    const role =
      normalizeRole(value);

    return isValidRole(role)
      ? role
      : "";
  }

  // -------------------------------------------------------
  // ARRAY
  // -------------------------------------------------------

  if (Array.isArray(value)) {
    for (const item of value) {
      const role =
        extractRole(item);

      if (role) {
        return role;
      }
    }

    return "";
  }

  // -------------------------------------------------------
  // OBJECT
  // -------------------------------------------------------

  if (typeof value === "object") {
    const possibleDirectValues = [
      value.roleName,
      value.role,
      value.name,
      value.authority,
      value.authorities,
      value.roles,
      value.userRole,
      value.user_role,
      value.type,
    ];

    for (const item of possibleDirectValues) {
      const role =
        extractRole(item);

      if (role) {
        return role;
      }
    }

    // Nested user

    if (value.user) {
      const role =
        extractRole(value.user);

      if (role) {
        return role;
      }
    }

    // Nested currentUser

    if (value.currentUser) {
      const role =
        extractRole(
          value.currentUser
        );

      if (role) {
        return role;
      }
    }

    // Nested data

    if (value.data) {
      const role =
        extractRole(value.data);

      if (role) {
        return role;
      }
    }

    // Nested result

    if (value.result) {
      const role =
        extractRole(value.result);

      if (role) {
        return role;
      }
    }
  }

  return "";
};

// =========================================================
// DECODE JWT PAYLOAD
// =========================================================

const decodeJwtPayload = (token) => {
  try {
    if (
      !token ||
      typeof token !== "string"
    ) {
      return null;
    }

    const parts =
      token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url =
      parts[1];

    const base64 =
      base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const paddedBase64 =
      base64 +
      "=".repeat(
        (4 -
          (base64.length % 4)) %
          4
      );

    const jsonPayload =
      decodeURIComponent(
        atob(paddedBase64)
          .split("")
          .map(
            (char) =>
              "%" +
              (
                "00" +
                char.charCodeAt(
                  0
                ).toString(16)
              ).slice(-2)
          )
          .join("")
      );

    return JSON.parse(
      jsonPayload
    );
  } catch (error) {
    console.error(
      "Unable to decode JWT:",
      error
    );

    return null;
  }
};

// =========================================================
// GET ROLE FROM JWT
// =========================================================

const getRoleFromToken = (token) => {
  const payload =
    decodeJwtPayload(token);

  if (!payload) {
    return "";
  }

  // Direct role fields

  const directValues = [
    payload.role,
    payload.roleName,
    payload.authority,
    payload.userRole,
  ];

  for (const value of directValues) {
    const role =
      extractRole(value);

    if (role) {
      return role;
    }
  }

  // Authorities

  const authorityRole =
    extractRole(
      payload.authorities
    );

  if (authorityRole) {
    return authorityRole;
  }

  // Roles

  const rolesRole =
    extractRole(
      payload.roles
    );

  if (rolesRole) {
    return rolesRole;
  }

  // Scope

  if (
    typeof payload.scope ===
    "string"
  ) {
    const scopes =
      payload.scope.split(
        " "
      );

    for (const item of scopes) {
      const role =
        extractRole(item);

      if (role) {
        return role;
      }
    }
  }

  // Nested user

  if (payload.user) {
    const role =
      extractRole(
        payload.user
      );

    if (role) {
      return role;
    }
  }

  return "";
};

// =========================================================
// READ JSON SAFELY
// =========================================================

const parseStoredJson = (
  value
) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

// =========================================================
// GET ROLE FROM STORAGE OBJECT
// =========================================================

const getRoleFromStorageValue = (
  value
) => {
  if (!value) {
    return "";
  }

  // JSON object

  const parsed =
    parseStoredJson(value);

  if (parsed) {
    const role =
      extractRole(parsed);

    if (role) {
      return role;
    }

    // Sometimes token is inside JSON

    const tokenCandidates = [
      parsed.token,
      parsed.accessToken,
      parsed.jwt,
      parsed.authToken,
    ];

    for (const token of tokenCandidates) {
      const tokenRole =
        getRoleFromToken(token);

      if (tokenRole) {
        return tokenRole;
      }
    }
  }

  // Direct role string

  const directRole =
    normalizeRole(value);

  if (isValidRole(directRole)) {
    return directRole;
  }

  // JWT

  const tokenRole =
    getRoleFromToken(value);

  if (tokenRole) {
    return tokenRole;
  }

  return "";
};

// =========================================================
// GET CURRENT USER ROLE
// =========================================================

const getUserRole = () => {
  try {
    const storageSources = [
      localStorage,
      sessionStorage,
    ];

    // =====================================================
    // 1. CURRENT USER OBJECT
    // =====================================================

    const userKeys = [
      "user",
      "currentUser",
      "loggedInUser",
      "authUser",
      "userData",
      "current_user",
    ];

    for (const storage of storageSources) {
      for (const key of userKeys) {
        const value =
          storage.getItem(key);

        if (!value) {
          continue;
        }

        const role =
          getRoleFromStorageValue(
            value
          );

        if (role) {
          return role;
        }
      }
    }

    // =====================================================
    // 2. AUTH OBJECT
    // =====================================================

    const authKeys = [
      "auth",
      "authentication",
      "loginResponse",
      "authResponse",
      "session",
    ];

    for (const storage of storageSources) {
      for (const key of authKeys) {
        const value =
          storage.getItem(key);

        if (!value) {
          continue;
        }

        const role =
          getRoleFromStorageValue(
            value
          );

        if (role) {
          return role;
        }
      }
    }

    // =====================================================
    // 3. JWT TOKEN
    // =====================================================

    const tokenKeys = [
      "token",
      "accessToken",
      "jwt",
      "authToken",
      "jwtToken",
      "access_token",
      "idToken",
    ];

    for (const storage of storageSources) {
      for (const key of tokenKeys) {
        const token =
          storage.getItem(key);

        if (!token) {
          continue;
        }

        const role =
          getRoleFromToken(token);

        if (role) {
          return role;
        }
      }
    }

    // =====================================================
    // 4. DIRECT ROLE
    // =====================================================

    const roleKeys = [
      "role",
      "userRole",
      "roleName",
      "user_role",
    ];

    for (const storage of storageSources) {
      for (const key of roleKeys) {
        const value =
          storage.getItem(key);

        if (!value) {
          continue;
        }

        const role =
          normalizeRole(value);

        if (isValidRole(role)) {
          return role;
        }
      }
    }

    return "";
  } catch (error) {
    console.error(
      "Unable to read current user role:",
      error
    );

    return "";
  }
};

// =========================================================
// LOAN FORM
// =========================================================

const LoanForm = ({
  initialData,
  onSubmit,
  buttonText = "Save Loan",
  successMessage = "Loan saved successfully",
}) => {
  const navigate =
    useNavigate();

  // =======================================================
  // EDIT MODE
  // =======================================================

  const isEditMode =
    Boolean(
      initialData?.id ||
        initialData?.loanId
    );

  // =======================================================
  // CURRENT ROLE
  // =======================================================

  const [userRole, setUserRole] =
    useState("");

  // =======================================================
  // READ ROLE
  // =======================================================

  useEffect(() => {
    const readRole = () => {
      const role =
        getUserRole();

      console.log(
        "LoanForm - detected user role:",
        role
      );

      setUserRole(role);
    };

    readRole();

    /*
     * Sometimes login/auth state is written
     * after component mount.
     */

    const timer =
      setTimeout(
        readRole,
        300
      );

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const isStaff =
    userRole === "STAFF";

  const isManager =
    userRole === "MANAGER";

  const isAdmin =
    userRole === "ADMIN";

  /*
   * IMPORTANT:
   * Only ADMIN / MANAGER can change status.
   * STAFF -> PENDING only.
   * UNKNOWN -> PENDING only.
   * This is intentionally fail-safe.
   */

  const canChangeLoanStatus =
    isAdmin || isManager;

  // =======================================================
  // STATUS OPTIONS
  // =======================================================

  const statusOptions = [
    "PENDING",
    "APPROVED",
    "REJECTED",
  ];

  // =======================================================
  // LOAN STATE
  // =======================================================

  const [loan, setLoan] =
    useState({
      customerId: "",
      customerName: "",
      loanAmount: "",
      interestRate: 2,
      tenureMonths: "",
      emiAmount: "",
      loanDate: getToday(),
      nextEmiDate: "",
      disbursalExpectedDate: "",
      status: "PENDING",
      aadhaarNumber: "",
      panNumber: "",
      nomineeName: "",
      nomineeRelationship: "",
      nomineeMobile: "",
      nomineeAadhaarNumber: "",
      monthlyIncome: "",
      incomeProofFileName: "",
    });

  // =======================================================
  // EXISTING LOANS
  // =======================================================

  const [existingLoans, setExistingLoans] =
    useState([]);

  const [loanHistoryLoading, setLoanHistoryLoading] =
    useState(false);

  const [hasExistingLoan, setHasExistingLoan] =
    useState(false);

  // =======================================================
  // DOCUMENTS
  // =======================================================

  const [documents, setDocuments] =
    useState({
      ...EMPTY_DOCUMENTS,
    });

  // =======================================================
  // LOADING / DIRTY
  // =======================================================

  const [loading, setLoading] =
    useState(false);

  const [isDirty, setIsDirty] =
    useState(false);

  const [showLeaveModal, setShowLeaveModal] =
    useState(false);

  const isDirtyRef =
    useRef(false);

  const allowBrowserBack =
    useRef(false);

  // =======================================================
  // PDF
  // =======================================================

  const [pdfGenerating, setPdfGenerating] =
    useState(false);

  const [pdfDownloaded, setPdfDownloaded] =
    useState(false);

  // =======================================================
  // TOAST
  // =======================================================

  const customerLoadedToastShown =
    useRef(false);

  const existingLoanToastShown =
    useRef(false);

  // =======================================================
  // FILE CONFIG
  // =======================================================

  const allowedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  const maxFileSize =
    5 * 1024 * 1024;

  // =======================================================
  // LOAN AMOUNT OPTIONS
  // =======================================================

  const loanAmountOptions = [];

  for (
    let amount = 10000;
    amount <= 1000000;
    amount += 10000
  ) {
    loanAmountOptions.push(
      amount
    );
  }

  // =======================================================
  // TENURE OPTIONS
  // =======================================================

  const tenureOptions = [
    12,
    24,
    36,
    48,
    60,
    72,
    84,
    96,
    120,
  ];

  // =======================================================
  // INITIAL DATA
  // =======================================================

  useEffect(() => {
    if (!initialData) {
      setLoan((prev) => ({
        ...prev,
        status: "PENDING",
      }));

      setExistingLoans([]);
      setHasExistingLoan(false);
      setIsDirty(false);
      isDirtyRef.current = false;
      setPdfDownloaded(false);

      customerLoadedToastShown.current =
        false;

      existingLoanToastShown.current =
        false;

      return;
    }

    const rawStatus =
      String(
        initialData.status ||
          "PENDING"
      )
        .toUpperCase()
        .trim();

    const validInitialStatus =
      statusOptions.includes(
        rawStatus
      )
        ? rawStatus
        : "PENDING";

    /*
     * IMPORTANT
     *
     * Staff must never load APPROVED/REJECTED
     * into the form.
     *
     * Unknown role is also kept PENDING
     * for safety.
     */

    const safeInitialStatus =
      canChangeLoanStatus
        ? validInitialStatus
        : "PENDING";

    setLoan({
      customerId:
        initialData.customerId ||
        "",

      customerName:
        initialData.customerName ||
        initialData.name ||
        "",

      loanAmount:
        initialData.loanAmount ??
        "",

      interestRate:
        Number(
          initialData.interestRate ??
            2
        ),

      tenureMonths:
        initialData.tenureMonths ??
        "",

      emiAmount:
        initialData.emiAmount ??
        "",

      loanDate:
        initialData.loanDate ||
        getToday(),

      nextEmiDate:
        initialData.nextEmiDate ||
        "",

      disbursalExpectedDate:
        initialData.disbursalExpectedDate ||
        "",

      status:
        safeInitialStatus,

      aadhaarNumber:
        initialData.aadhaarNumber ||
        "",

      panNumber:
        initialData.panNumber ||
        "",

      nomineeName:
        initialData.nomineeName ||
        "",

      nomineeRelationship:
        initialData.nomineeRelationship ||
        "",

      nomineeMobile:
        initialData.nomineeMobile ||
        "",

      nomineeAadhaarNumber:
        initialData.nomineeAadhaarNumber ||
        "",

      monthlyIncome:
        initialData.monthlyIncome ??
        "",

      incomeProofFileName:
        initialData.incomeProofFileName ||
        "",
    });

    setDocuments({
      ...EMPTY_DOCUMENTS,
    });

    setExistingLoans([]);
    setHasExistingLoan(false);
    setIsDirty(false);
    isDirtyRef.current = false;
    setPdfDownloaded(false);

    customerLoadedToastShown.current =
      false;

    existingLoanToastShown.current =
      false;

    if (initialData.customerId) {
      fetchCustomer(
        initialData.customerId,
        true
      );
    }
  }, [
    initialData,
    canChangeLoanStatus,
  ]);

  // =======================================================
  // FORCE PENDING FOR NON PRIVILEGED USERS
  // =======================================================

  useEffect(() => {
    if (!canChangeLoanStatus) {
      setLoan((prev) => {
        if (
          prev.status ===
          "PENDING"
        ) {
          return prev;
        }

        return {
          ...prev,
          status: "PENDING",
        };
      });
    }
  }, [canChangeLoanStatus]);

  // =======================================================
  // BROWSER BACK
  // =======================================================

  useEffect(() => {
    window.history.pushState(
      {
        loanFormPage: true,
      },
      "",
      window.location.href
    );

    const handlePopState = () => {
      if (
        allowBrowserBack.current
      ) {
        return;
      }

      if (isDirtyRef.current) {
        window.history.pushState(
          {
            loanFormPage: true,
          },
          "",
          window.location.href
        );

        setShowLeaveModal(true);
      } else {
        navigate("/loans");
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
  }, [navigate]);

  // =======================================================
  // CUSTOMER FETCH
  // =======================================================

  const fetchCustomer = async (
    customerId,
    isInitialLoad = false
  ) => {
    const id =
      customerId
        ?.trim()
        .toUpperCase();

    if (!id) {
      toast.error(
        "Please enter Customer ID"
      );

      return;
    }

    try {
      setLoanHistoryLoading(
        true
      );

      const customerResponse =
        await getMemberByCustomerId(
          id
        );

      const member =
        customerResponse?.data;

      if (!member) {
        throw new Error(
          "Customer not found"
        );
      }

      setLoan((prev) => ({
        ...prev,
        customerId:
          member.customerId ||
          id,
        customerName:
          member.name ||
          member.fullName ||
          "",
      }));

      // ===================================================
      // EXISTING LOANS
      // ===================================================

      try {
        const loanResponse =
          await getCustomerLoans(
            id
          );

        const loans =
          Array.isArray(
            loanResponse?.data
          )
            ? loanResponse.data
            : [];

        const currentLoanId =
          initialData?.id ||
          initialData?.loanId;

        const filteredLoans =
          isEditMode
            ? loans.filter(
                (item) => {
                  const itemId =
                    item?.id ||
                    item?.loanId;

                  return (
                    String(itemId) !==
                    String(
                      currentLoanId
                    )
                  );
                }
              )
            : loans;

        setExistingLoans(
          filteredLoans
        );

        const existingLoanExists =
          filteredLoans.length >
          0;

        setHasExistingLoan(
          existingLoanExists
        );

        if (
          existingLoanExists &&
          !isInitialLoad &&
          !existingLoanToastShown.current
        ) {
          existingLoanToastShown.current =
            true;

          toast.error(
            "This customer already has another loan. A customer can have only one loan."
          );
        }
      } catch (loanError) {
        console.error(
          "Existing loan fetch error:",
          loanError
        );

        setExistingLoans([]);
        setHasExistingLoan(false);
      }

      if (
        !customerLoadedToastShown.current
      ) {
        customerLoadedToastShown.current =
          true;

        toast.success(
          "Customer details loaded"
        );
      }
    } catch (error) {
      console.error(
        "Customer fetch error:",
        error
      );

      setLoan((prev) => ({
        ...prev,
        customerName: "",
      }));

      setExistingLoans([]);
      setHasExistingLoan(false);

      setDocuments({
        ...EMPTY_DOCUMENTS,
      });

      customerLoadedToastShown.current =
        false;

      existingLoanToastShown.current =
        false;

      toast.error(
        error?.response?.data
          ?.message ||
          error?.response?.data ||
          error?.message ||
          "Customer ID not found"
      );
    } finally {
      setLoanHistoryLoading(
        false
      );
    }
  };

  // =======================================================
  // FILE HANDLER
  // =======================================================

  const handleFileChange = (
    e,
    documentType
  ) => {
    if (
      hasExistingLoan &&
      !isEditMode
    ) {
      e.target.value = "";

      toast.error(
        "This customer already has a loan. Documents cannot be added."
      );

      return;
    }

    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !allowedFileTypes.includes(
        file.type
      )
    ) {
      toast.error(
        "Only PDF, JPG, JPEG and PNG files are allowed"
      );

      e.target.value = "";

      return;
    }

    if (
      file.size >
      maxFileSize
    ) {
      toast.error(
        "File size must be maximum 5 MB"
      );

      e.target.value = "";

      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [documentType]: file,
    }));

    setIsDirty(true);
    isDirtyRef.current = true;
  };

  // =======================================================
  // REMOVE FILE
  // =======================================================

  const removeFile = (
    documentType
  ) => {
    if (
      hasExistingLoan &&
      !isEditMode
    ) {
      toast.error(
        "This customer already has a loan."
      );

      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [documentType]: null,
    }));

    setIsDirty(true);
    isDirtyRef.current = true;
  };

  // =======================================================
  // EMI CALCULATION
  // =======================================================

  useEffect(() => {
    if (
      !loan.loanAmount ||
      !loan.tenureMonths
    ) {
      setLoan((prev) => {
        if (
          prev.emiAmount === ""
        ) {
          return prev;
        }

        return {
          ...prev,
          emiAmount: "",
        };
      });

      return;
    }

    const principal =
      Number(
        loan.loanAmount
      );

    const months =
      Number(
        loan.tenureMonths
      );

    const interestRate =
      Number(
        loan.interestRate || 2
      );

    const monthlyRate =
      interestRate / 100;

    if (
      principal <= 0 ||
      months <= 0 ||
      monthlyRate <= 0
    ) {
      return;
    }

    const power =
      Math.pow(
        1 + monthlyRate,
        months
      );

    const emi =
      (principal *
        monthlyRate *
        power) /
      (power - 1);

    const roundedEmi =
      Math.round(
        emi * 100
      ) / 100;

    setLoan((prev) => ({
      ...prev,
      emiAmount:
        roundedEmi,
    }));
  }, [
    loan.loanAmount,
    loan.tenureMonths,
    loan.interestRate,
  ]);

  // =======================================================
  // WORKING DAYS
  // =======================================================

  const addWorkingDays = (
    dateString,
    days
  ) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    let added = 0;

    while (added < days) {
      date.setDate(
        date.getDate() + 1
      );

      const day =
        date.getDay();

      if (
        day !== 0 &&
        day !== 6
      ) {
        added++;
      }
    }

    return date
      .toISOString()
      .split("T")[0];
  };

  // =======================================================
  // DATE CALCULATION
  // =======================================================

  useEffect(() => {
    if (!loan.loanDate) {
      setLoan((prev) => ({
        ...prev,
        nextEmiDate: "",
        disbursalExpectedDate:
          "",
      }));

      return;
    }

    const date = new Date(
      `${loan.loanDate}T00:00:00`
    );

    const nextEmiDate =
      new Date(date);

    nextEmiDate.setMonth(
      nextEmiDate.getMonth() +
        2
    );

    const disbursalDate =
      addWorkingDays(
        loan.loanDate,
        5
      );

    setLoan((prev) => ({
      ...prev,
      nextEmiDate:
        nextEmiDate
          .toISOString()
          .split("T")[0],
      disbursalExpectedDate:
        disbursalDate,
    }));
  }, [loan.loanDate]);

  // =======================================================
  // HANDLE CHANGE
  // =======================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    if (
      hasExistingLoan &&
      !isEditMode
    ) {
      return;
    }

    // =====================================================
    // STATUS SECURITY
    // =====================================================

    if (name === "status") {
      /*
       * STAFF / UNKNOWN cannot change status.
       */

      if (!canChangeLoanStatus) {
        return;
      }

      if (
        !statusOptions.includes(
          value
        )
      ) {
        return;
      }
    }

    setLoan((prev) => ({
      ...prev,
      [name]: value,
    }));

    setIsDirty(true);
    isDirtyRef.current = true;
  };

  // =======================================================
  // CUSTOMER ID CHANGE
  // =======================================================

  const handleCustomerIdChange = (
    e
  ) => {
    const value =
      e.target.value
        .toUpperCase()
        .trimStart();

    setLoan((prev) => ({
      ...prev,
      customerId: value,
      customerName: "",
    }));

    setExistingLoans([]);
    setHasExistingLoan(false);

    setDocuments({
      ...EMPTY_DOCUMENTS,
    });

    setPdfDownloaded(false);

    customerLoadedToastShown.current =
      false;

    existingLoanToastShown.current =
      false;

    setIsDirty(true);
    isDirtyRef.current = true;
  };

  // =======================================================
  // CUSTOMER ID ENTER
  // =======================================================

  const handleCustomerIdKeyDown = (
    e
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      fetchCustomer(
        loan.customerId
      );
    }
  };

  // =======================================================
  // CANCEL
  // =======================================================

  const handleCancel = () => {
    if (!isDirty) {
      navigate("/loans");
      return;
    }

    setShowLeaveModal(true);
  };

  // =======================================================
  // STAY
  // =======================================================

  const handleStay = () => {
    setShowLeaveModal(false);
  };

  // =======================================================
  // CONFIRM LEAVE
  // =======================================================

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    setIsDirty(false);
    isDirtyRef.current = false;
    allowBrowserBack.current =
      true;

    navigate("/loans");
  };

  // =======================================================
  // UPLOAD DOCUMENTS
  // =======================================================

  const uploadSelectedDocuments =
    async (loanId) => {
      const documentsToUpload = [];

      if (documents.aadhaar) {
        documentsToUpload.push({
          documentType:
            "AADHAAR",
          file: documents.aadhaar,
        });
      }

      if (documents.pan) {
        documentsToUpload.push({
          documentType: "PAN",
          file: documents.pan,
        });
      }

      if (documents.rationCard) {
        documentsToUpload.push({
          documentType:
            "RATION_CARD",
          file: documents.rationCard,
        });
      }

      if (documents.photo) {
        documentsToUpload.push({
          documentType: "PHOTO",
          file: documents.photo,
        });
      }

      if (
        documentsToUpload.length ===
        0
      ) {
        return null;
      }

      if (!loanId) {
        throw new Error(
          "Loan ID was not returned. Documents cannot be uploaded."
        );
      }

      return await uploadLoanDocuments(
        loanId,
        documentsToUpload
      );
    };

  // =======================================================
  // PDF
  // =======================================================

  const downloadLoanApplicationPdf =
    async (
      savedLoan,
      customer
    ) => {
      try {
        setPdfGenerating(true);

        const pdfLoan = {
          ...loan,
          ...savedLoan,

          customerId:
            customer?.customerId ||
            loan.customerId,

          customerName:
            customer?.name ||
            customer?.fullName ||
            loan.customerName,

          loanAmount:
            savedLoan?.loanAmount ??
            loan.loanAmount,

          interestRate:
            savedLoan?.interestRate ??
            loan.interestRate,

          tenureMonths:
            savedLoan?.tenureMonths ??
            loan.tenureMonths,

          emiAmount:
            savedLoan?.emiAmount ??
            loan.emiAmount,

          loanDate:
            savedLoan?.loanDate ??
            loan.loanDate,

          nextEmiDate:
            savedLoan?.nextEmiDate ??
            loan.nextEmiDate,

          disbursalExpectedDate:
            savedLoan?.disbursalExpectedDate ??
            loan.disbursalExpectedDate,

          status:
            savedLoan?.status ??
            loan.status,

          aadhaarNumber:
            loan.aadhaarNumber,

          panNumber:
            loan.panNumber,

          nomineeName:
            loan.nomineeName,

          nomineeRelationship:
            loan.nomineeRelationship,

          nomineeMobile:
            loan.nomineeMobile,

          nomineeAadhaarNumber:
            loan.nomineeAadhaarNumber,

          monthlyIncome:
            loan.monthlyIncome,
        };

        await generateLoanApplicationPdf(
          {
            loan: pdfLoan,

            customer:
              customer || {
                customerId:
                  pdfLoan.customerId,
                name:
                  pdfLoan.customerName,
              },

            photoFile:
              documents.photo,

            documents: {
              aadhaar:
                documents.aadhaar,
              pan:
                documents.pan,
              rationCard:
                documents.rationCard,
              photo:
                documents.photo,
            },
          }
        );

        setPdfDownloaded(true);

        toast.success(
          "Loan Application PDF downloaded successfully"
        );

        return true;
      } catch (pdfError) {
        console.error(
          "Loan application PDF error:",
          pdfError
        );

        toast.error(
          "Loan saved, but PDF download failed"
        );

        return false;
      } finally {
        setPdfGenerating(false);
      }
    };

  // =======================================================
  // FORM VALIDATION
  // =======================================================

  const validateForm = () => {
    if (
      !loan.customerId.trim()
    ) {
      toast.error(
        "Please enter Customer ID"
      );

      return false;
    }

    if (
      !loan.customerName.trim()
    ) {
      toast.error(
        "Please fetch a valid customer"
      );

      return false;
    }

    if (!loan.loanAmount) {
      toast.error(
        "Please select loan amount"
      );

      return false;
    }

    const amount =
      Number(
        loan.loanAmount
      );

    if (
      amount < 10000 ||
      amount > 1000000
    ) {
      toast.error(
        "Loan amount must be between ₹10,000 and ₹10,00,000"
      );

      return false;
    }

    if (
      !loan.tenureMonths ||
      Number(
        loan.tenureMonths
      ) <= 0
    ) {
      toast.error(
        "Please select a valid tenure"
      );

      return false;
    }

    if (!loan.loanDate) {
      toast.error(
        "Please select loan date"
      );

      return false;
    }

    // =====================================================
    // STAFF / UNKNOWN = PENDING ONLY
    // =====================================================

    if (
      !canChangeLoanStatus &&
      loan.status !==
        "PENDING"
    ) {
      toast.error(
        "Only Admin or Manager can change loan status"
      );

      return false;
    }

    // =====================================================
    // ADMIN / MANAGER
    // =====================================================

    if (
      canChangeLoanStatus &&
      !statusOptions.includes(
        loan.status
      )
    ) {
      toast.error(
        "Invalid loan status"
      );

      return false;
    }

    // =====================================================
    // REQUIRED DOCUMENTS
    // =====================================================

    if (!isEditMode) {
      if (!documents.aadhaar) {
        toast.error(
          "Aadhaar Card document is required"
        );

        return false;
      }

      if (!documents.pan) {
        toast.error(
          "PAN Card document is required"
        );

        return false;
      }

      if (!documents.rationCard) {
        toast.error(
          "Ration Card document is required"
        );

        return false;
      }
    }

    return true;
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    // =====================================================
    // ONE CUSTOMER ONE LOAN
    // =====================================================

    if (
      !isEditMode &&
      hasExistingLoan
    ) {
      toast.error(
        "This customer already has a loan. A customer can have only one loan."
      );

      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setPdfDownloaded(false);

      // ===================================================
      // CUSTOMER RECHECK
      // ===================================================

      const customerResponse =
        await getMemberByCustomerId(
          loan.customerId
            .trim()
            .toUpperCase()
        );

      const customer =
        customerResponse?.data;

      if (!customer) {
        toast.error(
          "Customer not found"
        );

        return;
      }

      // ===================================================
      // FINAL EXISTING LOAN CHECK
      // ===================================================

      if (!isEditMode) {
        const loanResponse =
          await getCustomerLoans(
            customer.customerId
          );

        const customerLoans =
          Array.isArray(
            loanResponse?.data
          )
            ? loanResponse.data
            : [];

        if (
          customerLoans.length >
          0
        ) {
          setExistingLoans(
            customerLoans
          );

          setHasExistingLoan(
            true
          );

          toast.error(
            "This customer already has a loan. A customer can have only one loan."
          );

          return;
        }
      }

      // ===================================================
      // FINAL STATUS
      // ===================================================

      let finalStatus =
        "PENDING";

      /*
       * STAFF / UNKNOWN
       * ALWAYS PENDING
       */

      if (
        !canChangeLoanStatus
      ) {
        finalStatus =
          "PENDING";
      } else if (
        canChangeLoanStatus
      ) {
        /*
         * ADMIN / MANAGER
         */

        if (
          statusOptions.includes(
            loan.status
          )
        ) {
          finalStatus =
            loan.status;
        } else {
          finalStatus =
            "PENDING";
        }
      }

      // ===================================================
      // PAYLOAD
      // ===================================================

      const payload = {
        ...(isEditMode &&
        (initialData?.id ||
          initialData?.loanId)
          ? {
              id:
                initialData?.id ||
                initialData?.loanId,
            }
          : {}),

        customerId:
          customer.customerId,

        customerName:
          customer.name ||
          customer.fullName,

        loanAmount:
          Number(
            loan.loanAmount
          ),

        interestRate: 2,

        tenureMonths:
          Number(
            loan.tenureMonths
          ),

        loanDate:
          loan.loanDate,

        nextEmiDate:
          loan.nextEmiDate,

        disbursalExpectedDate:
          loan.disbursalExpectedDate,

        /*
         * SECURITY:
         * Staff/Unknown can NEVER send APPROVED/REJECTED.
         */

        status:
          finalStatus,

        aadhaarNumber:
          loan.aadhaarNumber.trim(),

        panNumber:
          loan.panNumber.trim(),

        nomineeName:
          loan.nomineeName.trim(),

        nomineeRelationship:
          loan.nomineeRelationship.trim(),

        nomineeMobile:
          loan.nomineeMobile.trim(),

        nomineeAadhaarNumber:
          loan.nomineeAadhaarNumber.trim(),

        monthlyIncome:
          loan.monthlyIncome
            ? Number(
                loan.monthlyIncome
              )
            : null,

        incomeProofFileName:
          loan.incomeProofFileName.trim(),
      };

      // ===================================================
      // DEBUG
      // ===================================================

      console.log(
        "========================================"
      );

      console.log(
        "CURRENT USER ROLE:",
        userRole
      );

      console.log(
        "IS STAFF:",
        isStaff
      );

      console.log(
        "IS MANAGER:",
        isManager
      );

      console.log(
        "IS ADMIN:",
        isAdmin
      );

      console.log(
        "CAN CHANGE STATUS:",
        canChangeLoanStatus
      );

      console.log(
        "IS EDIT MODE:",
        isEditMode
      );

      console.log(
        "UI STATUS:",
        loan.status
      );

      console.log(
        "FINAL STATUS SENT:",
        finalStatus
      );

      console.log(
        "PAYLOAD:",
        payload
      );

      console.log(
        "========================================"
      );

      // ===================================================
      // SAVE / UPDATE
      // ===================================================

      const savedLoanResponse =
        await onSubmit(
          payload
        );

      console.log(
        "Loan save/update response:",
        savedLoanResponse
      );

      const savedLoan =
        savedLoanResponse?.data ||
        savedLoanResponse ||
        null;

      const savedLoanId =
        savedLoan?.id ||
        savedLoan?.loanId ||
        savedLoan?.loan?.id ||
        initialData?.id ||
        initialData?.loanId ||
        null;

      // ===================================================
      // DOCUMENT UPLOAD
      // ===================================================

      if (
        documents.aadhaar ||
        documents.pan ||
        documents.rationCard ||
        documents.photo
      ) {
        try {
          await uploadSelectedDocuments(
            savedLoanId
          );

          toast.success(
            "Loan documents uploaded successfully"
          );
        } catch (
          documentError
        ) {
          console.error(
            "Loan document upload error:",
            documentError
          );

          toast.error(
            isEditMode
              ? "Loan updated, but document upload failed"
              : "Loan saved, but document upload failed"
          );

          setIsDirty(false);
          isDirtyRef.current =
            false;

          navigate("/loans");

          return;
        }
      }

      // ===================================================
      // PDF
      // ===================================================

      await downloadLoanApplicationPdf(
        savedLoan,
        customer
      );

      // ===================================================
      // SUCCESS
      // ===================================================

      setIsDirty(false);
      isDirtyRef.current =
        false;

      toast.success(
        successMessage ||
          (isEditMode
            ? "Loan updated successfully"
            : "Loan saved successfully")
      );

      navigate("/loans");
    } catch (error) {
      console.error(
        "Save/update loan error:",
        error
      );

      toast.error(
        error?.response?.data
          ?.message ||
          error?.response?.data
            ?.error ||
          error?.response?.data ||
          error?.message ||
          "Failed to save loan"
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // FORM VALID STATE
  // =======================================================

  const basicFormValid =
    loan.customerId.trim() !==
      "" &&
    loan.customerName.trim() !==
      "" &&
    Number(
      loan.loanAmount
    ) >= 10000 &&
    Number(
      loan.loanAmount
    ) <= 1000000 &&
    Number(
      loan.tenureMonths
    ) > 0 &&
    Boolean(loan.loanDate);

  const documentsValid =
    isEditMode
      ? true
      : documents.aadhaar !==
          null &&
        documents.pan !==
          null &&
        documents.rationCard !==
          null;

  const isFormValid =
    basicFormValid &&
    documentsValid &&
    (isEditMode ||
      !hasExistingLoan);

  // =======================================================
  // DOCUMENT UPLOAD COMPONENT
  // =======================================================

  const DocumentUpload = ({
    title,
    documentType,
    file,
    required = true,
  }) => {
    const disabled =
      hasExistingLoan &&
      !isEditMode;

    return (
      <div className="w-full min-w-0">
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {title}{" "}
          {required ? (
            <span className="text-red-500">
              *
            </span>
          ) : (
            <span className="font-normal text-slate-400 dark:text-slate-500">
              (Optional)
            </span>
          )}
        </label>

        <div
          className={`relative h-[110px] w-full overflow-hidden rounded-xl border-2 border-dashed transition ${
            disabled
              ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70 dark:border-slate-700 dark:bg-slate-800"
              : file
              ? "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
              : "border-slate-300 bg-white hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500"
          }`}
        >
          {file ? (
            <div className="flex h-full min-w-0 items-center justify-between gap-3 px-3 sm:px-4">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/40">
                  <FileText
                    size={19}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {(
                      file.size /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() =>
                    removeFile(
                      documentType
                    )
                  }
                  className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          ) : (
            <label
              className={`block h-full ${
                disabled
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                <Upload
                  size={22}
                  className={`mb-2 ${
                    disabled
                      ? "text-slate-400 dark:text-slate-500"
                      : "text-blue-500 dark:text-blue-400"
                  }`}
                />

                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Upload {title}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  PDF, JPG, JPEG, PNG •
                  Max 5 MB
                </p>
              </div>

              {!disabled && (
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) =>
                    handleFileChange(
                      e,
                      documentType
                    )
                  }
                />
              )}
            </label>
          )}
        </div>
      </div>
    );
  };

  // =======================================================
  // UI CALCULATIONS
  // =======================================================

  const monthlyIncome =
    Number(
      loan.monthlyIncome || 0
    );

  const monthlyEmi =
    Number(
      loan.emiAmount || 0
    );

  const principalAmount =
    Number(
      loan.loanAmount || 0
    );

  const totalPayable =
    monthlyEmi &&
    loan.tenureMonths
      ? monthlyEmi *
        Number(
          loan.tenureMonths
        )
      : 0;

  const totalInterest =
    totalPayable >
    principalAmount
      ? totalPayable -
        principalAmount
      : 0;

  const emiBurden =
    monthlyIncome > 0 &&
    monthlyEmi > 0
      ? (monthlyEmi /
          monthlyIncome) *
        100
      : 0;

  const eligibilityScore =
    (() => {
      let score = 50;

      if (monthlyIncome > 0)
        score += 15;

      if (principalAmount > 0)
        score += 10;

      if (
        emiBurden > 0 &&
        emiBurden <= 40
      )
        score += 15;

      if (documents.aadhaar)
        score += 3;

      if (documents.pan)
        score += 3;

      if (
        documents.rationCard
      )
        score += 2;

      if (documents.photo)
        score += 2;

      return Math.min(
        Math.round(score),
        100
      );
    })();

  const getEligibilityLabel =
    () => {
      if (
        eligibilityScore >= 80
      ) {
        return "Good Eligibility";
      }

      if (
        eligibilityScore >= 60
      ) {
        return "Moderate Eligibility";
      }

      return "Needs Review";
    };

  const getEligibilityClasses =
    () => {
      if (
        eligibilityScore >= 80
      ) {
        return "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300";
      }

      if (
        eligibilityScore >= 60
      ) {
        return "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300";
      }

      return "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300";
    };

  const formatCurrency = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString("en-IN");
  };

  const formatDate = (
    date
  ) => {
    if (!date) return "-";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50 dark:bg-slate-950"
      >
        {/* ===================================================
            BREADCRUMB
        ==================================================== */}

        <div className="mb-4 sm:mb-5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <span className="text-slate-400 dark:text-slate-500">
              Loans
            </span>

            <span className="text-slate-300 dark:text-slate-700">
              /
            </span>

            <span className="text-slate-400 dark:text-slate-500">
              Loan Applications
            </span>

            <span className="text-slate-300 dark:text-slate-700">
              /
            </span>

            <span className="font-medium text-slate-700 dark:text-slate-300">
              {isEditMode
                ? "Edit Application"
                : "New Application"}
            </span>
          </div>
        </div>

        {/* ===================================================
            PAGE HEADER
        ==================================================== */}

        <div className="mb-5 flex flex-col gap-4 xl:mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm sm:h-11 sm:w-11">
                <Landmark
                  size={22}
                  className="text-white"
                />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                  Loan Application
                </h1>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                  {isEditMode
                    ? "Update the existing loan application details."
                    : "Create a new loan application for customer"}
                </p>
              </div>
            </div>
          </div>

          {/* HEADER ACTIONS */}

          <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:w-auto">
            <button
              type="button"
              onClick={
                handleCancel
              }
              disabled={
                loading ||
                pdfGenerating
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
            >
              <X size={17} />
              Cancel
            </button>

            <button
              type="button"
              disabled={
                loading ||
                pdfGenerating
              }
              onClick={() => {
                if (
                  !loan.customerName
                ) {
                  toast.error(
                    "Please select a customer before generating PDF"
                  );

                  return;
                }

                downloadLoanApplicationPdf(
                  loan,
                  {
                    customerId:
                      loan.customerId,
                    name:
                      loan.customerName,
                  }
                );
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:w-auto"
            >
              {pdfGenerating ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Download
                  size={17}
                />
              )}

              Generate PDF
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                pdfGenerating ||
                !isFormValid
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  {isEditMode
                    ? "Updating..."
                    : "Saving..."}
                </>
              ) : (
                <>
                  <Save size={17} />

                  {isEditMode
                    ? "Update Application"
                    : "Submit Application"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===================================================
            STEP PROGRESS
        ==================================================== */}

        <div className="mb-5 w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:mb-6 sm:p-4">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4 sm:gap-3">
            {[
              {
                number: "01",
                title:
                  "Customer & Loan",
                subtitle:
                  "Application details",
                icon: UserRound,
              },
              {
                number: "02",
                title:
                  "Financial Information",
                subtitle:
                  "Income & personal data",
                icon: WalletCards,
              },
              {
                number: "03",
                title:
                  "Documents",
                subtitle:
                  "Upload verification files",
                icon: FileText,
              },
              {
                number: "04",
                title:
                  "Review & Submit",
                subtitle:
                  "Complete application",
                icon: ClipboardCheck,
              },
            ].map(
              (step, index) => {
                const Icon =
                  step.icon;

                return (
                  <div
                    key={
                      step.number
                    }
                    className={`relative flex min-w-0 items-center gap-2.5 rounded-xl p-2.5 sm:gap-3 sm:p-3 ${
                      index === 0
                        ? "bg-blue-50 dark:bg-blue-950/30"
                        : "bg-slate-50 dark:bg-slate-800/60"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
                        index === 0
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:text-xs">
                        STEP{" "}
                        {step.number}
                      </p>

                      <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200 sm:text-sm">
                        {step.title}
                      </p>

                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* ===================================================
            MAIN LAYOUT
        ==================================================== */}

        <div className="grid w-full min-w-0 grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* ===============================================
              LEFT CONTENT
          =============================================== */}

          <div className="min-w-0 space-y-5 sm:space-y-6">
            {/* =============================================
                APPLICATION SUMMARY
            ============================================= */}

            <ApplicationSummary
              loan={loan}
              initialData={
                initialData
              }
              formatDate={
                formatDate
              }
              formatCurrency={
                formatCurrency
              }
            />

            {/* =============================================
                CUSTOMER & LOAN DETAILS
            ============================================= */}

            <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start gap-2.5 border-b border-slate-100 px-4 py-4 dark:border-slate-700 sm:items-center sm:gap-3 sm:px-6 sm:py-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 sm:h-10 sm:w-10">
                  <UserRound
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">
                    Customer & Loan
                    Details
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                    Select customer and configure loan information
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* CUSTOMER */}

                <div className="mb-5 sm:mb-6">
                  <CustomerSection
                    loan={loan}
                    handleCustomerIdChange={
                      handleCustomerIdChange
                    }
                    handleCustomerIdKeyDown={
                      handleCustomerIdKeyDown
                    }
                    fetchCustomer={
                      fetchCustomer
                    }
                    loanHistoryLoading={
                      loanHistoryLoading
                    }
                    hasExistingLoan={
                      hasExistingLoan
                    }
                    existingLoans={
                      existingLoans
                    }
                    isEditMode={
                      isEditMode
                    }
                  />
                </div>

                {/* LOAN DETAILS GRID */}

                {/* LOAN DETAILS */}

                <LoanDetailsSection
                  loan={loan}
                  loanAmountOptions={
                    loanAmountOptions
                  }
                  tenureOptions={
                    tenureOptions
                  }
                  handleChange={
                    handleChange
                  }
                  setLoan={
                    setLoan
                  }
                  setIsDirty={
                    setIsDirty
                  }
                  isDirtyRef={
                    isDirtyRef
                  }
                  hasExistingLoan={
                    hasExistingLoan
                  }
                  isEditMode={
                    isEditMode
                  }
                />

                {/* STATUS */}

                <div className="mt-4 sm:mt-5">
                  <LoanStatusSection
                    loan={loan}
                    handleChange={
                      handleChange
                    }
                    canChangeLoanStatus={
                      canChangeLoanStatus
                    }
                    hasExistingLoan={
                      hasExistingLoan
                    }
                    isEditMode={
                      isEditMode
                    }
                    statusOptions={
                      statusOptions
                    }
                    userRole={
                      userRole
                    }
                    isAdmin={
                      isAdmin
                    }
                    isManager={
                      isManager
                    }
                  />
                </div>
              </div>
            </div>

            {/* =============================================
                FINANCIAL INFORMATION
            ============================================= */}

            <FinancialInformation
              loan={loan}
              handleChange={
                handleChange
              }
            />

            {/* =============================================
                DOCUMENTS
            ============================================= */}

            <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start gap-2.5 border-b border-slate-100 px-4 py-4 dark:border-slate-700 sm:items-center sm:gap-3 sm:px-6 sm:py-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40 sm:h-10 sm:w-10">
                  <FileText
                    size={20}
                    className="text-orange-600 dark:text-orange-400"
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">
                    Documents
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                    Upload required customer verification documents
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <LoanDocumentsSection
                  documents={
                    documents
                  }
                  isEditMode={
                    isEditMode
                  }
                  hasExistingLoan={
                    hasExistingLoan
                  }
                  handleFileChange={
                    handleFileChange
                  }
                  removeFile={
                    removeFile
                  }
                />
              </div>
            </div>

            {/* =============================================
                BOTTOM ACTION BAR
            ============================================= */}

            <div className="sticky bottom-2 z-20 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 sm:bottom-4 sm:p-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                    isFormValid
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}
                >
                  {isFormValid ? (
                    <CheckCircle2
                      size={20}
                    />
                  ) : (
                    <AlertTriangle
                      size={20}
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 sm:text-sm">
                    {isFormValid
                      ? "Application ready to submit"
                      : "Complete required information"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
                    {isFormValid
                      ? "All required details are available"
                      : "Please complete customer, loan and required documents"}
                  </p>
                </div>
              </div>

              <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:w-auto md:flex md:flex-wrap">
                <button
                  type="button"
                  onClick={
                    handleCancel
                  }
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 md:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    pdfGenerating ||
                    !isFormValid
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 md:w-auto"
                >
                  {loading ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  {isEditMode
                    ? "Update Application"
                    : "Submit Application"}
                </button>
              </div>
            </div>
          </div>

          {/* ===============================================
              RIGHT SIDEBAR
          =============================================== */}

          <aside className="min-w-0 space-y-5 sm:space-y-6 xl:sticky xl:top-6 xl:h-fit">
            {/* =============================================
                CUSTOMER SNAPSHOT
            ============================================= */}

            <CustomerSnapshot
              loan={loan}
              existingLoans={
                existingLoans
              }
              monthlyIncome={
                monthlyIncome
              }
              principalAmount={
                principalAmount
              }
              formatCurrency={
                formatCurrency
              }
            />

            {/* =============================================
                ELIGIBILITY
            ============================================= */}

            <EligibilityCheck
              eligibilityScore={
                eligibilityScore
              }
              getEligibilityClasses={
                getEligibilityClasses
              }
              getEligibilityLabel={
                getEligibilityLabel
              }
              monthlyIncome={
                monthlyIncome
              }
              emiBurden={
                emiBurden
              }
              documents={
                documents
              }
            />

            {/* =============================================
                LOAN CALCULATOR
            ============================================= */}

            <LoanCalculator
              monthlyEmi={
                monthlyEmi
              }
              principalAmount={
                principalAmount
              }
              totalInterest={
                totalInterest
              }
              totalPayable={
                totalPayable
              }
              formatCurrency={
                formatCurrency
              }
            />

            {/* =============================================
                DOCUMENT STATUS
            ============================================= */}

            <DocumentStatus
              documents={
                documents
              }
            />

            {/* =============================================
                QUICK ACTIONS
            ============================================= */}

            <QuickActions
              loan={loan}
              downloadLoanApplicationPdf={
                downloadLoanApplicationPdf
              }
              fetchCustomer={
                fetchCustomer
              }
              toast={toast}
            />
          </aside>
        </div>
      </form>

      <LeaveModal
        show={
          showLeaveModal
        }
        onStay={
          handleStay
        }
        onConfirmLeave={
          handleConfirmLeave
        }
      />
    </>
  );
};

export default LoanForm;