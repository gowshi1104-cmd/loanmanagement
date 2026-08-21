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
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { generateLoanApplicationPdf } from "../../utils/loanApplicationPdf";
import { getMemberByCustomerId } from "../../services/memberService";
import { getCustomerLoans } from "../../services/loanService";
import { uploadLoanDocuments } from "../../services/loanDocumentService";

/* =========================================================
   GET TODAY
========================================================= */

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

/* =========================================================
   EMPTY DOCUMENTS
========================================================= */

const EMPTY_DOCUMENTS = {
  aadhaar: null,
  pan: null,
  rationCard: null,
  photo: null,
};

/* =========================================================
   VALID ROLES
========================================================= */

const VALID_ROLES = ["STAFF", "MANAGER", "ADMIN"];

/* =========================================================
   NORMALIZE ROLE
========================================================= */

const normalizeRole = (value) => {
  if (value === null || value === undefined) {
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

/* =========================================================
   VALID ROLE
========================================================= */

const isValidRole = (role) => {
  return VALID_ROLES.includes(role);
};

/* =========================================================
   EXTRACT ROLE FROM ANY VALUE
========================================================= */

const extractRole = (value) => {
  if (!value) {
    return "";
  }

  /* -------------------------------------------------------
     STRING
  ------------------------------------------------------- */

  if (typeof value === "string") {
    const role = normalizeRole(value);

    return isValidRole(role) ? role : "";
  }

  /* -------------------------------------------------------
     ARRAY
  ------------------------------------------------------- */

  if (Array.isArray(value)) {
    for (const item of value) {
      const role = extractRole(item);

      if (role) {
        return role;
      }
    }

    return "";
  }

  /* -------------------------------------------------------
     OBJECT
  ------------------------------------------------------- */

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
      const role = extractRole(item);

      if (role) {
        return role;
      }
    }

    /* Nested user */

    if (value.user) {
      const role = extractRole(value.user);

      if (role) {
        return role;
      }
    }

    /* Nested currentUser */

    if (value.currentUser) {
      const role = extractRole(value.currentUser);

      if (role) {
        return role;
      }
    }

    /* Nested data */

    if (value.data) {
      const role = extractRole(value.data);

      if (role) {
        return role;
      }
    }

    /* Nested result */

    if (value.result) {
      const role = extractRole(value.result);

      if (role) {
        return role;
      }
    }
  }

  return "";
};

/* =========================================================
   DECODE JWT PAYLOAD
========================================================= */

const decodeJwtPayload = (token) => {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedBase64 =
      base64 +
      "=".repeat(
        (4 - (base64.length % 4)) % 4
      );

    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split("")
        .map(
          (char) =>
            "%" +
            ("00" +
              char.charCodeAt(0).toString(16)
            ).slice(-2)
        )
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error(
      "Unable to decode JWT:",
      error
    );

    return null;
  }
};

/* =========================================================
   GET ROLE FROM JWT
========================================================= */

const getRoleFromToken = (token) => {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return "";
  }

  /* Direct role fields */

  const directValues = [
    payload.role,
    payload.roleName,
    payload.authority,
    payload.userRole,
  ];

  for (const value of directValues) {
    const role = extractRole(value);

    if (role) {
      return role;
    }
  }

  /* Authorities */

  const authorityRole = extractRole(
    payload.authorities
  );

  if (authorityRole) {
    return authorityRole;
  }

  /* Roles */

  const rolesRole = extractRole(
    payload.roles
  );

  if (rolesRole) {
    return rolesRole;
  }

  /* Scope */

  if (typeof payload.scope === "string") {
    const scopes =
      payload.scope.split(" ");

    for (const item of scopes) {
      const role = extractRole(item);

      if (role) {
        return role;
      }
    }
  }

  /* Nested user */

  if (payload.user) {
    const role = extractRole(
      payload.user
    );

    if (role) {
      return role;
    }
  }

  return "";
};

/* =========================================================
   READ JSON SAFELY
========================================================= */

const parseStoredJson = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

/* =========================================================
   GET ROLE FROM STORAGE OBJECT
========================================================= */

const getRoleFromStorageValue = (value) => {
  if (!value) {
    return "";
  }

  /* JSON object */

  const parsed =
    parseStoredJson(value);

  if (parsed) {
    const role =
      extractRole(parsed);

    if (role) {
      return role;
    }

    /* Sometimes token is inside JSON */

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

  /* Direct role string */

  const directRole =
    normalizeRole(value);

  if (isValidRole(directRole)) {
    return directRole;
  }

  /* JWT */

  const tokenRole =
    getRoleFromToken(value);

  if (tokenRole) {
    return tokenRole;
  }

  return "";
};

/* =========================================================
   GET CURRENT USER ROLE
========================================================= */

const getUserRole = () => {
  try {
    const storageSources = [
      localStorage,
      sessionStorage,
    ];

    /* =====================================================
       1. CURRENT USER OBJECT
    ===================================================== */

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

    /* =====================================================
       2. AUTH OBJECT
    ===================================================== */

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

    /* =====================================================
       3. JWT TOKEN
    ===================================================== */

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

    /* =====================================================
       4. DIRECT ROLE
    ===================================================== */

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

/* =========================================================
   LOAN FORM
========================================================= */

const LoanForm = ({
  initialData,
  onSubmit,
  buttonText = "Save Loan",
  successMessage = "Loan saved successfully",
}) => {
  const navigate = useNavigate();

  /* =======================================================
     EDIT MODE
  ======================================================= */

  const isEditMode = Boolean(
    initialData?.id ||
      initialData?.loanId
  );

  /* =======================================================
     CURRENT ROLE
  ======================================================= */

  const [userRole, setUserRole] =
    useState("");

  /* =======================================================
     READ ROLE
  ======================================================= */

  useEffect(() => {
    const readRole = () => {
      const role = getUserRole();

      console.log(
        "LoanForm - detected user role:",
        role
      );

      setUserRole(role);
    };

    readRole();

    /*
     Sometimes login/auth state is written
     after component mount.
    */

    const timer =
      setTimeout(readRole, 300);

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
   IMPORTANT:

   Only ADMIN / MANAGER can change status.

   STAFF -> PENDING only.

   UNKNOWN -> PENDING only.
   This is intentionally fail-safe.
  */

  const canChangeLoanStatus =
    isAdmin || isManager;

  /* =======================================================
     STATUS OPTIONS
  ======================================================= */

  const statusOptions = [
    "PENDING",
    "APPROVED",
    "REJECTED",
  ];

  /* =======================================================
     LOAN STATE
  ======================================================= */

  const [loan, setLoan] = useState({
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

  /* =======================================================
     EXISTING LOANS
  ======================================================= */

  const [
    existingLoans,
    setExistingLoans,
  ] = useState([]);

  const [
    loanHistoryLoading,
    setLoanHistoryLoading,
  ] = useState(false);

  const [
    hasExistingLoan,
    setHasExistingLoan,
  ] = useState(false);

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  const [
    documents,
    setDocuments,
  ] = useState({
    ...EMPTY_DOCUMENTS,
  });

  /* =======================================================
     LOADING / DIRTY
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    isDirty,
    setIsDirty,
  ] = useState(false);

  const [
    showLeaveModal,
    setShowLeaveModal,
  ] = useState(false);

  const isDirtyRef =
    useRef(false);

  const allowBrowserBack =
    useRef(false);

  /* =======================================================
     PDF
  ======================================================= */

  const [
    pdfGenerating,
    setPdfGenerating,
  ] = useState(false);

  const [
    pdfDownloaded,
    setPdfDownloaded,
  ] = useState(false);

  /* =======================================================
     TOAST
  ======================================================= */

  const customerLoadedToastShown =
    useRef(false);

  const existingLoanToastShown =
    useRef(false);

  /* =======================================================
     FILE CONFIG
  ======================================================= */

  const allowedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  const maxFileSize =
    5 * 1024 * 1024;

  /* =======================================================
     LOAN AMOUNT OPTIONS
  ======================================================= */

  const loanAmountOptions = [];

  for (
    let amount = 10000;
    amount <= 1000000;
    amount += 10000
  ) {
    loanAmountOptions.push(amount);
  }

  /* =======================================================
     TENURE OPTIONS
  ======================================================= */

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

  /* =======================================================
     INITIAL DATA
  ======================================================= */

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

  /* =======================================================
     FORCE PENDING FOR NON PRIVILEGED USERS
  ======================================================= */

  useEffect(() => {
    if (!canChangeLoanStatus) {
      setLoan((prev) => {
        if (prev.status === "PENDING") {
          return prev;
        }

        return {
          ...prev,
          status: "PENDING",
        };
      });
    }
  }, [canChangeLoanStatus]);

  /* =======================================================
     BROWSER BACK
  ======================================================= */

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

  /* =======================================================
     CUSTOMER FETCH
  ======================================================= */

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
      setLoanHistoryLoading(true);

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

      /* ===================================================
         EXISTING LOANS
      =================================================== */

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
          filteredLoans.length > 0;

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
      setLoanHistoryLoading(false);
    }
  };

  /* =======================================================
     FILE HANDLER
  ======================================================= */

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
      file.size > maxFileSize
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

  /* =======================================================
     REMOVE FILE
  ======================================================= */

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

  /* =======================================================
     EMI CALCULATION
  ======================================================= */

  useEffect(() => {
    if (
      !loan.loanAmount ||
      !loan.tenureMonths
    ) {
      setLoan((prev) => {
        if (prev.emiAmount === "") {
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
      (
        principal *
        monthlyRate *
        power
      ) /
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

  /* =======================================================
     WORKING DAYS
  ======================================================= */

  const addWorkingDays = (
    dateString,
    days
  ) => {
    if (!dateString) {
      return "";
    }

    const date =
      new Date(
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

  /* =======================================================
     DATE CALCULATION
  ======================================================= */

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

    const date =
      new Date(
        `${loan.loanDate}T00:00:00`
      );

    const nextEmiDate =
      new Date(date);

    nextEmiDate.setMonth(
      nextEmiDate.getMonth() + 2
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

  /* =======================================================
     HANDLE CHANGE
  ======================================================= */

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

    /* =====================================================
       STATUS SECURITY
    ===================================================== */

    if (name === "status") {
      /*
       STAFF / UNKNOWN cannot change status.
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

  /* =======================================================
     CUSTOMER ID CHANGE
  ======================================================= */

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

  /* =======================================================
     CUSTOMER ID ENTER
  ======================================================= */

  const handleCustomerIdKeyDown =
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        fetchCustomer(
          loan.customerId
        );
      }
    };

  /* =======================================================
     CANCEL
  ======================================================= */

  const handleCancel = () => {
    if (!isDirty) {
      navigate("/loans");
      return;
    }

    setShowLeaveModal(true);
  };

  /* =======================================================
     STAY
  ======================================================= */

  const handleStay = () => {
    setShowLeaveModal(false);
  };

  /* =======================================================
     CONFIRM LEAVE
  ======================================================= */

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);

    setIsDirty(false);

    isDirtyRef.current = false;

    allowBrowserBack.current = true;

    navigate("/loans");
  };

  /* =======================================================
     UPLOAD DOCUMENTS
  ======================================================= */

  const uploadSelectedDocuments =
    async (loanId) => {
      const documentsToUpload = [];

      if (documents.aadhaar) {
        documentsToUpload.push({
          documentType:
            "AADHAAR",

          file:
            documents.aadhaar,
        });
      }

      if (documents.pan) {
        documentsToUpload.push({
          documentType:
            "PAN",

          file:
            documents.pan,
        });
      }

      if (
        documents.rationCard
      ) {
        documentsToUpload.push({
          documentType:
            "RATION_CARD",

          file:
            documents.rationCard,
        });
      }

      if (documents.photo) {
        documentsToUpload.push({
          documentType:
            "PHOTO",

          file:
            documents.photo,
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

  /* =======================================================
     PDF
  ======================================================= */

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

  /* =======================================================
     FORM VALIDATION
  ======================================================= */

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

    /* =====================================================
       STAFF / UNKNOWN = PENDING ONLY
    ===================================================== */

    if (
      !canChangeLoanStatus &&
      loan.status !== "PENDING"
    ) {
      toast.error(
        "Only Admin or Manager can change loan status"
      );

      return false;
    }

    /* =====================================================
       ADMIN / MANAGER
    ===================================================== */

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

    /* =====================================================
       REQUIRED DOCUMENTS
    ===================================================== */

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

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* =====================================================
       ONE CUSTOMER ONE LOAN
    ===================================================== */

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

      /* ===================================================
         CUSTOMER RECHECK
      =================================================== */

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

      /* ===================================================
         FINAL EXISTING LOAN CHECK
      =================================================== */

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
          customerLoans.length > 0
        ) {
          setExistingLoans(
            customerLoans
          );

          setHasExistingLoan(true);

          toast.error(
            "This customer already has a loan. A customer can have only one loan."
          );

          return;
        }
      }

      /* ===================================================
         FINAL STATUS
      =================================================== */

      let finalStatus = "PENDING";

      /*
       * STAFF / UNKNOWN
       * ALWAYS PENDING
       */

      if (!canChangeLoanStatus) {
        finalStatus = "PENDING";
      }

      /*
       * ADMIN / MANAGER
       */

      else if (
        canChangeLoanStatus
      ) {
        if (
          statusOptions.includes(
            loan.status
          )
        ) {
          finalStatus =
            loan.status;
        } else {
          finalStatus = "PENDING";
        }
      }

      /* ===================================================
         PAYLOAD
      =================================================== */

      const payload = {
        ...(isEditMode &&
        (
          initialData?.id ||
          initialData?.loanId
        )
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
          loan.aadhaarNumber
            .trim(),

        panNumber:
          loan.panNumber
            .trim(),

        nomineeName:
          loan.nomineeName
            .trim(),

        nomineeRelationship:
          loan.nomineeRelationship
            .trim(),

        nomineeMobile:
          loan.nomineeMobile
            .trim(),

        nomineeAadhaarNumber:
          loan.nomineeAadhaarNumber
            .trim(),

        monthlyIncome:
          loan.monthlyIncome
            ? Number(
                loan.monthlyIncome
              )
            : null,

        incomeProofFileName:
          loan.incomeProofFileName
            .trim(),
      };

      /* ===================================================
         DEBUG
      =================================================== */

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

      /* ===================================================
         SAVE / UPDATE
      =================================================== */

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

      /* ===================================================
         DOCUMENT UPLOAD
      =================================================== */

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

          isDirtyRef.current = false;

          navigate("/loans");

          return;
        }
      }

      /* ===================================================
         PDF
      =================================================== */

      await downloadLoanApplicationPdf(
        savedLoan,
        customer
      );

      /* ===================================================
         SUCCESS
      =================================================== */

      setIsDirty(false);

      isDirtyRef.current = false;

      toast.success(
        successMessage ||
          (
            isEditMode
              ? "Loan updated successfully"
              : "Loan saved successfully"
          )
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

  /* =======================================================
     FORM VALID STATE
  ======================================================= */

  const basicFormValid =
    loan.customerId.trim() !== "" &&
    loan.customerName.trim() !== "" &&
    Number(
      loan.loanAmount
    ) >= 10000 &&
    Number(
      loan.loanAmount
    ) <= 1000000 &&
    Number(
      loan.tenureMonths
    ) > 0 &&
    Boolean(
      loan.loanDate
    );

  const documentsValid =
    isEditMode
      ? true
      : documents.aadhaar !== null &&
        documents.pan !== null &&
        documents.rationCard !== null;

  const isFormValid =
    basicFormValid &&
    documentsValid &&
    (
      isEditMode ||
      !hasExistingLoan
    );

  /* =======================================================
     DOCUMENT UPLOAD COMPONENT
  ======================================================= */

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
      <div className="w-full">
        <label className="block mb-2 text-sm font-medium text-slate-700">
          {title}{" "}
          {required ? (
            <span className="text-red-500">
              *
            </span>
          ) : (
            <span className="text-slate-400 font-normal">
              (Optional)
            </span>
          )}
        </label>

        <div
          className={`relative w-full h-[110px] border-2 border-dashed rounded-xl transition ${
            disabled
              ? "border-slate-200 bg-slate-100 opacity-70 cursor-not-allowed"
              : file
              ? "border-green-300 bg-green-50"
              : "border-slate-300 bg-white hover:border-blue-400"
          }`}
        >
          {file ? (
            <div className="h-full flex items-center justify-between gap-3 px-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <FileText
                    size={19}
                    className="text-green-600"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
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
                  className="text-red-600 hover:text-red-800 text-xs font-semibold shrink-0"
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
              <div className="h-full flex flex-col items-center justify-center">
                <Upload
                  size={22}
                  className={`mb-2 ${
                    disabled
                      ? "text-slate-400"
                      : "text-blue-500"
                  }`}
                />

                <p className="text-sm font-medium text-slate-700">
                  Upload {title}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  PDF, JPG, JPEG, PNG • Max 5 MB
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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* HEADER */}

        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {isEditMode
                  ? "Edit Loan"
                  : "Loan Information"}
              </h2>

              <p className="text-slate-500 mt-1">
                {isEditMode
                  ? "Update the loan details below."
                  : "Enter the loan details below."}
              </p>
            </div>

            {isEditMode && (
              <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                EDIT MODE
              </span>
            )}
          </div>
        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* CUSTOMER ID */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Customer ID{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                name="customerId"
                value={
                  loan.customerId
                }
                onChange={
                  handleCustomerIdChange
                }
                onBlur={() =>
                  fetchCustomer(
                    loan.customerId
                  )
                }
                onKeyDown={
                  handleCustomerIdKeyDown
                }
                placeholder="Enter customer ID e.g. CUST001"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  fetchCustomer(
                    loan.customerId
                  )
                }
                disabled={
                  !loan.customerId.trim() ||
                  loanHistoryLoading
                }
                className="px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 flex items-center justify-center"
              >
                {loanHistoryLoading ? (
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Search
                    size={18}
                  />
                )}
              </button>
            </div>

            {loanHistoryLoading && (
              <p className="text-xs text-blue-600 mt-1">
                Fetching customer...
              </p>
            )}

            {!isEditMode &&
              hasExistingLoan && (
                <div className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={19}
                      className="text-red-600 mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Loan Already Exists
                      </p>

                      <p className="text-xs text-red-600 mt-1 leading-5">
                        This customer already has a loan.
                        A customer can have only one loan.
                        A new loan cannot be created.
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* CUSTOMER NAME */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Customer Name
            </label>

            <input
              type="text"
              value={
                loan.customerName
              }
              disabled
              placeholder="Customer name will appear automatically"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-100 text-slate-600 cursor-not-allowed"
            />
          </div>

          {/* EXISTING LOANS */}

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Existing Loans
            </label>

            {loanHistoryLoading ? (
              <div className="border border-blue-200 rounded-xl px-4 py-3 bg-blue-50 text-sm text-blue-700">
                Checking existing loans...
              </div>
            ) : existingLoans.length ===
              0 ? (
              <div className="border border-green-200 rounded-xl px-4 py-3 bg-green-50 text-sm text-green-700">
                {isEditMode
                  ? "No other loans found for this customer."
                  : "No previous loans found for this customer."}
              </div>
            ) : (
              <div className="border border-red-200 rounded-xl bg-red-50 p-3">
                <p className="text-sm font-semibold text-red-700 mb-2">
                  {existingLoans.length} loan(s) found
                </p>

                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {existingLoans.map(
                    (item) => {
                      const status =
                        item?.status
                          ?.toString()
                          .toUpperCase();

                      return (
                        <div
                          key={
                            item.id ||
                            item.loanId
                          }
                          className="rounded-xl border border-red-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.loanId ||
                                  item.id ||
                                  "-"}
                              </p>

                              <p className="text-xs text-slate-500">
                                Loan Amount: ₹{" "}
                                {Number(
                                  item.loanAmount ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                status ===
                                "APPROVED"
                                  ? "bg-green-100 text-green-700"
                                  : status ===
                                    "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : status ===
                                    "REJECTED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {status ||
                                "-"}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-slate-600">
                            <span>
                              EMI: ₹{" "}
                              {Number(
                                item.emiAmount ||
                                  0
                              ).toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                            </span>

                            <span>
                              Tenure:{" "}
                              {item.tenureMonths ||
                                "-"}{" "}
                              months
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {!isEditMode && (
                  <p className="text-xs text-red-600 mt-3">
                    New loan creation is not allowed for this customer.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* LOAN AMOUNT */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Loan Amount{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <div className="flex gap-3">
              <select
                value={
                  loanAmountOptions.includes(
                    Number(
                      loan.loanAmount
                    )
                  )
                    ? loan.loanAmount
                    : ""
                }
                disabled={
                  hasExistingLoan &&
                  !isEditMode
                }
                onChange={(e) => {
                  setLoan((prev) => ({
                    ...prev,

                    loanAmount:
                      e.target.value,
                  }));

                  setIsDirty(true);

                  isDirtyRef.current =
                    true;
                }}
                className={`w-1/2 border border-slate-300 rounded-xl px-4 py-3 outline-none ${
                  hasExistingLoan &&
                  !isEditMode
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              >
                <option value="">
                  Select Amount
                </option>

                {loanAmountOptions.map(
                  (amount) => (
                    <option
                      key={amount}
                      value={amount}
                    >
                      ₹{" "}
                      {amount.toLocaleString(
                        "en-IN"
                      )}
                    </option>
                  )
                )}
              </select>

              <input
                type="number"
                name="loanAmount"
                min="10000"
                max="1000000"
                step="1000"
                value={
                  loan.loanAmount
                }
                disabled={
                  hasExistingLoan &&
                  !isEditMode
                }
                onChange={
                  handleChange
                }
                placeholder="Or type amount"
                className={`w-1/2 border border-slate-300 rounded-xl px-4 py-3 outline-none ${
                  hasExistingLoan &&
                  !isEditMode
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              />
            </div>

            <p className="text-xs text-slate-500 mt-1">
              ₹10,000 to ₹10,00,000
            </p>
          </div>

          {/* INTEREST */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Monthly Interest Rate
            </label>

            <input
              type="text"
              value="2%"
              disabled
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-100 text-slate-600 cursor-not-allowed"
            />

            <p className="text-xs text-slate-500 mt-1">
              Fixed monthly interest rate
            </p>
          </div>

          {/* TENURE */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Tenure (Months){" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              name="tenureMonths"
              value={
                loan.tenureMonths
              }
              disabled={
                hasExistingLoan &&
                !isEditMode
              }
              onChange={
                handleChange
              }
              className={`w-full border border-slate-300 rounded-xl px-4 py-3 outline-none ${
                hasExistingLoan &&
                !isEditMode
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              }`}
            >
              <option value="">
                Select Tenure
              </option>

              {tenureOptions.map(
                (months) => (
                  <option
                    key={months}
                    value={months}
                  >
                    {months} Months
                  </option>
                )
              )}
            </select>
          </div>

          {/* EMI */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              EMI Amount
            </label>

            <input
              type="text"
              value={
                loan.emiAmount
                  ? `₹ ${Number(
                      loan.emiAmount
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}`
                  : ""
              }
              disabled
              placeholder="Auto calculated"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-100 text-slate-600 cursor-not-allowed"
            />
          </div>

          {/* LOAN DATE */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Loan Date
            </label>

            <input
              type="date"
              name="loanDate"
              value={
                loan.loanDate
              }
              onChange={
                handleChange
              }
              disabled={
                hasExistingLoan &&
                !isEditMode
              }
              className={`w-full border border-slate-300 rounded-xl px-4 py-3 outline-none ${
                hasExistingLoan &&
                !isEditMode
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              }`}
            />
          </div>

          {/* DISBURSAL DATE */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Disbursal Expected Date
            </label>

            <input
              type="date"
              value={
                loan.disbursalExpectedDate
              }
              disabled
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-100 text-slate-600 cursor-not-allowed"
            />

            <p className="text-xs text-slate-500 mt-1">
              Automatically calculated as 5 working days from loan date.
            </p>
          </div>

          {/* FIRST EMI */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              First EMI Date
            </label>

            <input
              type="date"
              value={
                loan.nextEmiDate
              }
              disabled
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-100 text-slate-600 cursor-not-allowed"
            />

            <p className="text-xs text-slate-500 mt-1">
              First EMI starts after 2 months.
            </p>
          </div>

          {/* =================================================
             STATUS
          ================================================= */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Status
            </label>

            {/* =================================================
               ADMIN / MANAGER
               ONLY THEY GET DROPDOWN
            ================================================= */}

            {canChangeLoanStatus ? (
              <select
                name="status"
                value={
                  loan.status
                }
                onChange={
                  handleChange
                }
                disabled={
                  hasExistingLoan &&
                  !isEditMode
                }
                className={`w-full border border-slate-300 rounded-xl px-4 py-3 outline-none ${
                  hasExistingLoan &&
                  !isEditMode
                    ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                    : "bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                }`}
              >
                {statusOptions.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            ) : (
              /* =================================================
                 STAFF / UNKNOWN
                 PENDING ONLY
              ================================================= */

              <input
                type="text"
                value="PENDING"
                disabled
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-100 text-slate-600 cursor-not-allowed font-medium"
              />
            )}

            {/* =================================================
               ROLE DISPLAY
            ================================================= */}

            <p className="text-xs text-slate-500 mt-1">
              Role:{" "}
              <span className="font-semibold">
                {userRole ||
                  "STAFF"}
              </span>
            </p>

            {/* =================================================
               STAFF MESSAGE
            ================================================= */}

            {!canChangeLoanStatus && (
              <p className="text-xs text-amber-600 mt-1">
                Staff users can create loans only with PENDING status.
              </p>
            )}

            {/* =================================================
               ADMIN MESSAGE
            ================================================= */}

            {isAdmin && (
              <p className="text-xs text-blue-600 mt-1">
                Admin can change loan status to Pending, Approved or Rejected.
              </p>
            )}

            {/* =================================================
               MANAGER MESSAGE
            ================================================= */}

            {isManager && (
              <p className="text-xs text-blue-600 mt-1">
                Manager can change loan status to Pending, Approved or Rejected.
              </p>
            )}

            {/* =================================================
               UNKNOWN ROLE
            ================================================= */}

            {!userRole && (
              <p className="text-xs text-slate-500 mt-1">
                Status is restricted to PENDING until a privileged role is detected.
              </p>
            )}
          </div>

          {/* AADHAAR NUMBER */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Aadhaar Number
            </label>

            <input
              type="text"
              name="aadhaarNumber"
              value={
                loan.aadhaarNumber
              }
              onChange={
                handleChange
              }
              maxLength={12}
              placeholder="Enter Aadhaar number"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {/* PAN */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              PAN Number
            </label>

            <input
              type="text"
              name="panNumber"
              value={
                loan.panNumber
              }
              onChange={(e) =>
                handleChange({
                  target: {
                    name:
                      "panNumber",

                    value:
                      e.target.value.toUpperCase(),
                  },
                })
              }
              maxLength={10}
              placeholder="Enter PAN number"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {/* NOMINEE NAME */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Nominee Name
            </label>

            <input
              type="text"
              name="nomineeName"
              value={
                loan.nomineeName
              }
              onChange={
                handleChange
              }
              placeholder="Enter nominee name"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {/* NOMINEE RELATIONSHIP */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Nominee Relationship
            </label>

            <input
              type="text"
              name="nomineeRelationship"
              value={
                loan.nomineeRelationship
              }
              onChange={
                handleChange
              }
              placeholder="e.g. Father, Mother, Wife"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {/* NOMINEE MOBILE */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Nominee Mobile
            </label>

            <input
              type="tel"
              name="nomineeMobile"
              value={
                loan.nomineeMobile
              }
              onChange={
                handleChange
              }
              maxLength={10}
              placeholder="Enter nominee mobile"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {/* NOMINEE AADHAAR */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Nominee Aadhaar Number
            </label>

            <input
              type="text"
              name="nomineeAadhaarNumber"
              value={
                loan.nomineeAadhaarNumber
              }
              onChange={
                handleChange
              }
              maxLength={12}
              placeholder="Enter nominee Aadhaar"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>

          {/* MONTHLY INCOME */}

          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Monthly Income
            </label>

            <input
              type="number"
              name="monthlyIncome"
              min="0"
              value={
                loan.monthlyIncome
              }
              onChange={
                handleChange
              }
              placeholder="Enter monthly income"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
        </div>

        {/* ===================================================
           LOAN DOCUMENTS
        =================================================== */}

        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-slate-800">
              Loan Documents
            </h3>

            <p className="text-sm text-slate-600 mt-1">
              Upload Aadhaar Card, PAN Card and Ration Card.
              Photo is optional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <DocumentUpload
              title="Aadhaar Card"
              documentType="aadhaar"
              file={
                documents.aadhaar
              }
              required={
                !isEditMode
              }
            />

            <DocumentUpload
              title="PAN Card"
              documentType="pan"
              file={
                documents.pan
              }
              required={
                !isEditMode
              }
            />

            <DocumentUpload
              title="Ration Card"
              documentType="rationCard"
              file={
                documents.rationCard
              }
              required={
                !isEditMode
              }
            />

            <DocumentUpload
              title="Photo"
              documentType="photo"
              file={
                documents.photo
              }
              required={false}
            />
          </div>

          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">
                Create:
              </span>{" "}
              Aadhaar, PAN and Ration Card are required.
              Photo is optional.
            </p>

            {isEditMode && (
              <p className="text-xs text-blue-700 mt-1">
                <span className="font-semibold">
                  Edit:
                </span>{" "}
                Existing documents are preserved. Upload a
                new document only if you want to replace/add it.
              </p>
            )}
          </div>
        </div>

        {/* ===================================================
           EMI INFORMATION
        =================================================== */}

        {loan.loanAmount &&
          loan.tenureMonths &&
          loan.emiAmount && (
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="font-semibold text-blue-900">
                EMI Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm text-blue-700">
                    Loan Amount
                  </p>

                  <p className="font-semibold text-blue-950">
                    ₹{" "}
                    {Number(
                      loan.loanAmount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-blue-700">
                    Monthly EMI
                  </p>

                  <p className="font-semibold text-blue-950">
                    ₹{" "}
                    {Number(
                      loan.emiAmount
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-blue-700">
                    Disbursal Expected
                  </p>

                  <p className="font-semibold text-blue-950">
                    {loan.disbursalExpectedDate ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-blue-700">
                    First EMI
                  </p>

                  <p className="font-semibold text-blue-950">
                    {loan.nextEmiDate ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* ===================================================
           PDF STATUS
        =================================================== */}

        {pdfGenerating && (
          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <Download
                size={20}
                className="text-blue-600"
              />

              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Generating Loan Application PDF...
                </p>

                <p className="text-xs text-blue-700 mt-1">
                  Please wait while the application is prepared.
                </p>
              </div>
            </div>
          </div>
        )}

        {pdfDownloaded && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2
                size={21}
                className="text-green-600"
              />

              <div>
                <p className="text-sm font-semibold text-green-800">
                  Loan Application PDF Downloaded
                </p>

                <p className="text-xs text-green-700 mt-1">
                  The PDF has been generated successfully.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
           BUTTONS
        =================================================== */}

        <div className="mt-8 border-t pt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={
              handleCancel
            }
            disabled={
              loading ||
              pdfGenerating
            }
            className="flex items-center gap-2 border border-slate-300 px-6 py-3 rounded-xl hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={18} />

            Cancel
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              pdfGenerating ||
              !isFormValid
            }
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold shadow-md text-white transition ${
              loading ||
              pdfGenerating ||
              !isFormValid
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {pdfGenerating ? (
              <>
                <Download
                  size={18}
                />

                Preparing PDF...
              </>
            ) : loading ? (
              <>
                <Save
                  size={18}
                />

                {isEditMode
                  ? "Updating..."
                  : "Saving..."}
              </>
            ) : (
              <>
                <Save
                  size={18}
                />

                {isEditMode
                  ? "Update Loan"
                  : buttonText}
              </>
            )}
          </button>
        </div>
      </form>

      {/* =====================================================
         LEAVE MODAL
      ===================================================== */}

      {showLeaveModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
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

            <div className="p-6">
              <p className="text-sm text-slate-600">
                If you go back now, all the changes you made
                will be discarded.
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={
                  handleStay
                }
                className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 transition font-medium text-slate-700"
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
    </>
  );
};

export default LoanForm;