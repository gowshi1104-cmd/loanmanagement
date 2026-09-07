import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  User,
  CreditCard,
  ShieldCheck,
  Download,
  Loader2,
  Eye,
  X,
  CalendarDays,
  IndianRupee,
  Percent,
  Clock3,
  CheckCircle2,
  Building2,
  Users,
  Phone,
  MapPin,
  BriefcaseBusiness,
  CircleDollarSign,
  Landmark,
  Hash,
} from "lucide-react";

import {
  getLoanById,
  getCustomerLoans,
} from "../../services/loanService";

import {
  getLoanDocuments,
  downloadLoanDocument,
} from "../../services/loanDocumentService";

import api from "../../api/axios";

const ViewLoan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [loan, setLoan] = useState(null);
  const [allLoans, setAllLoans] = useState([]);
  const [loanDocuments, setLoanDocuments] = useState([]);

  const [customer, setCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loansLoading, setLoansLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentDownloading, setDocumentDownloading] = useState(null);

  // DOCUMENT VIEWER
  const [viewingDocument, setViewingDocument] = useState(null);
  const [viewingDocumentUrl, setViewingDocumentUrl] = useState(null);
  const [viewingDocumentLoading, setViewingDocumentLoading] =
    useState(false);

  // =========================================================
  // LOAD LOAN
  // =========================================================

  useEffect(() => {
    loadLoan();

    return () => {
      if (viewingDocumentUrl) {
        window.URL.revokeObjectURL(viewingDocumentUrl);
      }
    };
  }, [id]);

  // =========================================================
  // LOAD COMPLETE LOAN DETAILS
  // =========================================================

  const loadLoan = async () => {
    try {
      setLoading(true);

      // CURRENT LOAN
      const response = await getLoanById(id);

      const currentLoan = response?.data;

      if (!currentLoan) {
        setLoan(null);
        return;
      }

      setLoan(currentLoan);

      // CUSTOMER DETAILS
      if (currentLoan?.customerId) {
        await loadCustomerDetails(currentLoan.customerId);
      } else {
        setCustomer(null);
      }

      // CUSTOMER LOAN HISTORY
      if (currentLoan?.customerId) {
        try {
          setLoansLoading(true);

          const customerLoansResponse = await getCustomerLoans(
            currentLoan.customerId
          );

          const customerLoans = Array.isArray(
            customerLoansResponse?.data
          )
            ? customerLoansResponse.data
            : [];

          setAllLoans(customerLoans);
        } catch (error) {
          console.error(
            "Failed to load customer loan history:",
            error
          );

          setAllLoans([currentLoan]);
        } finally {
          setLoansLoading(false);
        }
      } else {
        setAllLoans([currentLoan]);
      }

      // LOAN DOCUMENTS
      await loadLoanDocuments(
        currentLoan?.id || currentLoan?.loanId
      );
    } catch (error) {
      console.error(
        "Failed to load loan details:",
        error
      );

      setLoan(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD CUSTOMER DETAILS
  // =========================================================

  const loadCustomerDetails = async (customerId) => {
    if (!customerId) {
      setCustomer(null);
      return;
    }

    try {
      setCustomerLoading(true);

      const response = await api.get(
        `/members/customer/${encodeURIComponent(
          customerId.trim().toUpperCase()
        )}`
      );

      const customerData =
        response?.data?.data ??
        response?.data?.member ??
        response?.data;

      setCustomer(customerData || null);
    } catch (error) {
      console.error(
        "Failed to load customer details:",
        error
      );

      setCustomer(null);
    } finally {
      setCustomerLoading(false);
    }
  };

  // =========================================================
  // LOAD LOAN DOCUMENTS
  // =========================================================

  const loadLoanDocuments = async (loanId) => {
    if (!loanId) {
      setLoanDocuments([]);
      return;
    }

    try {
      setDocumentsLoading(true);

      const response = await getLoanDocuments(loanId);

      const documents = Array.isArray(response?.data)
        ? response.data
        : [];

      console.log(
        "Loan documents response:",
        documents
      );

      setLoanDocuments(documents);
    } catch (error) {
      console.error(
        "Failed to load loan documents:",
        error
      );

      setLoanDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // =========================================================
  // FORMAT AMOUNT
  // =========================================================

  const formatAmount = (amount) => {
    const value = Number(amount || 0);

    return value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      const dateValue = String(date);

      const parsedDate = dateValue.includes("T")
        ? new Date(dateValue)
        : new Date(`${dateValue}T00:00:00`);

      if (Number.isNaN(parsedDate.getTime())) {
        return dateValue;
      }

      return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return date;
    }
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    const value = status
      ?.toString()
      .toUpperCase()
      .trim();

    if (value === "APPROVED") {
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800";
    }

    if (value === "PENDING") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800";
    }

    if (value === "REJECTED") {
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800";
    }

    if (value === "ACTIVE") {
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
    }

    if (value === "OVERDUE") {
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800";
    }

    if (value === "COMPLETED") {
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    }

    if (value === "CLOSED") {
      return "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600";
    }

    return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  };

  // =========================================================
  // DOCUMENT TYPE LABEL
  // =========================================================

  const getDocumentTypeLabel = (document) => {
    const type =
      document?.documentType ||
      document?.type ||
      document?.document_type ||
      "";

    const value = type
      .toString()
      .toUpperCase()
      .replace(/[\s_-]/g, "");

    if (value === "AADHAAR") {
      return "Aadhaar Card";
    }

    if (value === "PAN") {
      return "PAN Card";
    }

    if (
      value === "NOMINEE" ||
      value === "NOMINEEPROOF" ||
      value === "NOMINEEID"
    ) {
      return "Nominee ID / Proof";
    }

    if (
      value === "INCOMEPROOF" ||
      value === "INCOME"
    ) {
      return "Income Proof";
    }

    return (
      document?.documentType ||
      document?.type ||
      "Loan Document"
    );
  };

  // =========================================================
  // DOCUMENT TYPE CLASS
  // =========================================================

  const getDocumentTypeClass = (document) => {
    const label = getDocumentTypeLabel(document)
      .toString()
      .toUpperCase();

    if (label.includes("AADHAAR")) {
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
    }

    if (label.includes("PAN")) {
      return "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";
    }

    if (label.includes("NOMINEE")) {
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    }

    if (label.includes("INCOME")) {
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300";
    }

    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  // =========================================================
  // DOCUMENT FILE NAME
  // =========================================================

  const getDocumentFileName = (document) => {
    return (
      document?.fileName ||
      document?.originalFileName ||
      document?.documentFileName ||
      document?.name ||
      "Loan Document"
    );
  };

  // =========================================================
  // DOCUMENT ID
  // =========================================================

  const getDocumentId = (document) => {
    return (
      document?.id ||
      document?.documentId ||
      document?.loanDocumentId
    );
  };

  // =========================================================
  // GET CONTENT TYPE
  // =========================================================

  const getDocumentContentType = (document, response) => {
    const responseType =
      response?.headers?.["content-type"];

    if (responseType) {
      return responseType.split(";")[0].trim();
    }

    const fileName = getDocumentFileName(document)
      .toLowerCase();

    if (fileName.endsWith(".pdf")) {
      return "application/pdf";
    }

    if (
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg")
    ) {
      return "image/jpeg";
    }

    if (fileName.endsWith(".png")) {
      return "image/png";
    }

    if (fileName.endsWith(".webp")) {
      return "image/webp";
    }

    if (fileName.endsWith(".gif")) {
      return "image/gif";
    }

    return "application/octet-stream";
  };

  // =========================================================
  // VIEW DOCUMENT
  // =========================================================

  const handleDocumentView = async (document) => {
    const documentId = getDocumentId(document);

    if (!documentId) {
      alert("Document ID not available");
      return;
    }

    try {
      setViewingDocumentLoading(true);

      if (viewingDocumentUrl) {
        window.URL.revokeObjectURL(
          viewingDocumentUrl
        );
      }

      setViewingDocument(null);
      setViewingDocumentUrl(null);

      const response = await downloadLoanDocument(
        documentId
      );

      const contentType =
        getDocumentContentType(
          document,
          response
        );

      const blob = new Blob(
        [response.data],
        {
          type: contentType,
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      setViewingDocument(document);
      setViewingDocumentUrl(url);
    } catch (error) {
      console.error(
        "Failed to view loan document:",
        error
      );

      alert("Failed to open document");
    } finally {
      setViewingDocumentLoading(false);
    }
  };

  // =========================================================
  // CLOSE DOCUMENT VIEWER
  // =========================================================

  const handleCloseDocumentViewer = () => {
    if (viewingDocumentUrl) {
      window.URL.revokeObjectURL(
        viewingDocumentUrl
      );
    }

    setViewingDocument(null);
    setViewingDocumentUrl(null);
    setViewingDocumentLoading(false);
  };

  // =========================================================
  // DOWNLOAD DOCUMENT
  // =========================================================

  const handleDocumentDownload = async (document) => {
    const documentId = getDocumentId(document);

    if (!documentId) {
      alert("Document ID not available");
      return;
    }

    try {
      setDocumentDownloading(documentId);

      const response =
        await downloadLoanDocument(documentId);

      const blob = new Blob(
        [response.data],
        {
          type:
            response?.headers?.["content-type"] ||
            "application/octet-stream",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        window.document.createElement("a");

      link.href = url;

      link.download =
        getDocumentFileName(document);

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Failed to download loan document:",
        error
      );

      alert("Failed to download document");
    } finally {
      setDocumentDownloading(null);
    }
  };

  // =========================================================
  // GET OLD INCOME PROOF
  // =========================================================

  const getIncomeProofFiles = (item) => {
    const result = [];

    if (
      Array.isArray(
        item?.incomeProofFileNames
      )
    ) {
      item.incomeProofFileNames.forEach(
        (file) => {
          if (
            file &&
            file.toString().trim() !== ""
          ) {
            result.push(file);
          }
        }
      );
    }

    if (
      item?.incomeProofFileName &&
      item.incomeProofFileName
        .toString()
        .trim() !== ""
    ) {
      const alreadyExists =
        result.includes(
          item.incomeProofFileName
        );

      if (!alreadyExists) {
        result.push(
          item.incomeProofFileName
        );
      }
    }

    return result;
  };

  // =========================================================
  // REUSABLE DETAIL ITEM
  // =========================================================

  const DetailItem = ({
    label,
    value,
    icon: Icon,
    highlight = false,
  }) => {
    return (
      <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/60 sm:px-4 sm:py-4">
        <div className="mb-2 flex items-center gap-2">
          {Icon && (
            <Icon
              size={15}
              className="shrink-0 text-slate-400 dark:text-slate-500"
            />
          )}

          <p className="min-w-0 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
        </div>

        <p
          className={`break-words text-sm font-semibold ${
            highlight
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-800 dark:text-slate-100"
          }`}
        >
          {value || "-"}
        </p>
      </div>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4 sm:min-h-[70vh]">
        <div className="flex flex-col items-center gap-4 text-center text-slate-500 dark:text-slate-400">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
            <Loader2
              size={25}
              className="animate-spin text-blue-600 dark:text-blue-400"
            />
          </div>

          <p className="text-sm font-medium">
            Loading loan details...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO LOAN
  // =========================================================

  if (!loan) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center px-4 sm:min-h-[70vh]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/40">
            <FileText
              size={28}
              className="text-red-500 dark:text-red-400"
            />
          </div>

          <p className="mt-4 font-semibold text-red-500 dark:text-red-400">
            Failed to load loan details.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/loans")
            }
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
          >
            <ArrowLeft size={17} />
            Back to Loans
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // DOCUMENT VIEWER
  // =========================================================

  if (
    viewingDocument &&
    viewingDocumentUrl
  ) {
    const fileName =
      getDocumentFileName(
        viewingDocument
      );

    const fileNameLower =
      fileName.toLowerCase();

    const isPdf =
      fileNameLower.endsWith(".pdf");

    const isImage =
      fileNameLower.endsWith(".jpg") ||
      fileNameLower.endsWith(".jpeg") ||
      fileNameLower.endsWith(".png") ||
      fileNameLower.endsWith(".webp") ||
      fileNameLower.endsWith(".gif");

    return (
      <div className="min-h-screen w-full min-w-0">
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:mb-5">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40 sm:h-12 sm:w-12">
                <FileText
                  size={22}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">
                  {getDocumentTypeLabel(
                    viewingDocument
                  )}
                </p>

                <h2 className="truncate text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
                  {fileName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleCloseDocumentViewer
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
            >
              <X size={18} />
              Close
            </button>
          </div>
        </div>

        <div className="min-h-[65vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-950 sm:min-h-[80vh]">
          {isPdf ? (
            <iframe
              src={viewingDocumentUrl}
              title={fileName}
              className="h-[70vh] w-full border-0 dark:bg-slate-900 sm:h-[80vh]"
            />
          ) : isImage ? (
            <div className="flex min-h-[65vh] w-full items-center justify-center p-3 sm:min-h-[80vh] sm:p-8">
              <img
                src={viewingDocumentUrl}
                alt={fileName}
                className="max-h-[60vh] max-w-full rounded-xl bg-white object-contain shadow-md dark:bg-slate-900 sm:max-h-[76vh]"
              />
            </div>
          ) : (
            <div className="flex min-h-[65vh] flex-col items-center justify-center p-5 text-center sm:min-h-[80vh] sm:p-8">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900">
                <FileText
                  size={30}
                  className="text-slate-500 dark:text-slate-400"
                />
              </div>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Preview not available
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                This file type cannot be previewed
                directly in the browser. You can
                download the document instead.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleDocumentDownload(
                    viewingDocument
                  )
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 sm:w-auto"
              >
                <Download size={18} />
                Download Document
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end sm:mt-5">
          <button
            type="button"
            onClick={
              handleCloseDocumentViewer
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
          >
            <X size={18} />
            Close Document
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // DISPLAYED LOANS
  // =========================================================

  const displayedLoans =
    allLoans.length > 0
      ? allLoans
      : [loan];

  // =========================================================
  // CURRENT LOAN
  // =========================================================

  const currentLoanStatus =
    loan?.status || "-";

  const currentLoanAmount =
    Number(loan?.loanAmount || 0);

  const currentEmiAmount =
    Number(loan?.emiAmount || 0);

  // =========================================================
  // CUSTOMER DISPLAY VALUES
  // =========================================================

  const customerId =
    customer?.customerId ||
    loan?.customerId ||
    "-";

  const customerName =
    customer?.name ||
    loan?.customerName ||
    "-";

  const customerPhone =
    customer?.phone ||
    loan?.customerPhone ||
    loan?.phone ||
    "-";

  const customerAddress =
    customer?.address ||
    loan?.customerAddress ||
    loan?.address ||
    "-";

  const customerPan =
    customer?.panNumber ||
    loan?.panNumber ||
    "-";

  const customerAadhaar =
    customer?.aadharNumber ||
    customer?.aadhaarNumber ||
    loan?.aadhaarNumber ||
    "-";

  const customerGroupId =
    customer?.groupId ||
    loan?.groupId ||
    "-";

  const customerGroupName =
    customer?.groupName ||
    loan?.groupName ||
    "-";

  const customerStatus =
    customer?.status ||
    "-";

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full min-w-0 min-h-screen pb-6 sm:pb-10">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-5 flex flex-col gap-4 lg:mb-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            <span>Loans</span>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300">
              View Loan
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
            Loan Details
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Complete loan, customer, financial,
            nominee and document information.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/loans")
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
        >
          <ArrowLeft size={18} />
          Back to Loans
        </button>
      </div>

      {/* =====================================================
          TOP LOAN SUMMARY
      ====================================================== */}

      <div className="mb-5 w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:mb-6">
        <div className="p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between sm:gap-6">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-950/40 sm:h-14 sm:w-14">
                <CreditCard
                  size={26}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Loan ID
                </p>

                <h2 className="break-all text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {loan?.loanId ||
                    loan?.id ||
                    "-"}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                      currentLoanStatus
                    )}`}
                  >
                    {currentLoanStatus}
                  </span>

                  {loan?.loanDate && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarDays size={13} />
                      {formatDate(
                        loan.loanDate
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-2 xl:min-w-[600px] xl:grid-cols-4">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 dark:border-blue-900 dark:bg-blue-950/40 sm:px-4 sm:py-4">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Loan Amount
                </p>

                <p className="mt-1 break-words text-base font-bold text-blue-800 dark:text-blue-300 sm:text-lg">
                  ₹
                  {formatAmount(
                    currentLoanAmount
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3 dark:border-emerald-900 dark:bg-emerald-950/40 sm:px-4 sm:py-4">
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  EMI
                </p>

                <p className="mt-1 break-words text-base font-bold text-emerald-800 dark:text-emerald-300 sm:text-lg">
                  ₹
                  {formatAmount(
                    currentEmiAmount
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-3 dark:border-purple-900 dark:bg-purple-950/40 sm:px-4 sm:py-4">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  Interest
                </p>

                <p className="mt-1 break-words text-base font-bold text-purple-800 dark:text-purple-300 sm:text-lg">
                  {loan?.interestRate ?? 2}%
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 dark:border-amber-900 dark:bg-amber-950/40 sm:px-4 sm:py-4">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Tenure
                </p>

                <p className="mt-1 break-words text-base font-bold text-amber-800 dark:text-amber-300 sm:text-lg">
                  {loan?.tenureMonths || "-"}

                  <span className="ml-1 text-xs font-medium sm:text-sm">
                    Months
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER INFORMATION
      ====================================================== */}

      <div className="mb-5 w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:mb-6 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
              <User
                size={21}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Customer Information
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Customer profile associated with this loan.
              </p>
            </div>
          </div>

          {customerLoading && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 sm:text-sm">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Loading customer...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <DetailItem
            label="Customer ID"
            value={customerId}
            icon={Hash}
            highlight
          />

          <DetailItem
            label="Customer Name"
            value={customerName}
            icon={User}
          />

          <DetailItem
            label="Phone Number"
            value={customerPhone}
            icon={Phone}
          />

          <DetailItem
            label="Customer Status"
            value={customerStatus}
            icon={CheckCircle2}
          />

          <DetailItem
            label="Address"
            value={customerAddress}
            icon={MapPin}
          />

          <DetailItem
            label="PAN Number"
            value={customerPan}
            icon={CreditCard}
          />

          <DetailItem
            label="Aadhaar Number"
            value={customerAadhaar}
            icon={ShieldCheck}
          />

          <DetailItem
            label="Group ID"
            value={customerGroupId}
            icon={Users}
          />

          <DetailItem
            label="Group Name"
            value={customerGroupName}
            icon={Building2}
          />

          <DetailItem
            label="Total Loans"
            value={`${displayedLoans.length} ${
              displayedLoans.length === 1
                ? "Loan"
                : "Loans"
            }`}
            icon={CreditCard}
            highlight
          />
        </div>
      </div>

      {/* =====================================================
          FINANCIAL SUMMARY
      ====================================================== */}

      <div className="mb-5 grid w-full min-w-0 grid-cols-1 gap-4 sm:mb-6 sm:gap-6 xl:grid-cols-3">
        {/* LOAN FINANCIAL DETAILS */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6 xl:col-span-2">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
              <CircleDollarSign
                size={21}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Financial Details
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Complete financial information for this loan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            <DetailItem
              label="Loan Amount"
              value={`₹ ${formatAmount(
                loan?.loanAmount
              )}`}
              icon={IndianRupee}
              highlight
            />

            <DetailItem
              label="Interest Rate"
              value={`${loan?.interestRate ?? 2}%`}
              icon={Percent}
            />

            <DetailItem
              label="Tenure"
              value={
                loan?.tenureMonths
                  ? `${loan.tenureMonths} Months`
                  : "-"
              }
              icon={Clock3}
            />

            <DetailItem
              label="EMI Amount"
              value={`₹ ${formatAmount(
                loan?.emiAmount
              )}`}
              icon={IndianRupee}
              highlight
            />

            <DetailItem
              label="Monthly Income"
              value={
                loan?.monthlyIncome
                  ? `₹ ${formatAmount(
                      loan.monthlyIncome
                    )}`
                  : "-"
              }
              icon={BriefcaseBusiness}
            />

            <DetailItem
              label="Loan Status"
              value={loan?.status}
              icon={CheckCircle2}
            />
          </div>
        </div>

        {/* LOAN TIMELINE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex items-center gap-3 sm:mb-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950/40">
              <CalendarDays
                size={21}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Loan Timeline
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Important loan dates.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                <CalendarDays
                  size={17}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Loan Date
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatDate(
                    loan?.loanDate
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                <CalendarDays
                  size={17}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Disbursal Expected
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatDate(
                    loan?.disbursalExpectedDate
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
                <CalendarDays
                  size={17}
                  className="text-green-600 dark:text-green-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Next EMI Date
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatDate(
                    loan?.nextEmiDate
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                <CheckCircle2
                  size={17}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Completed Date
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatDate(
                    loan?.completedDate
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40">
                <ShieldCheck
                  size={17}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  NOC Eligible Date
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatDate(
                    loan?.nocEligibleDate
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Landmark
                  size={17}
                  className="text-slate-600 dark:text-slate-400"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Closed Date
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {formatDate(
                    loan?.closedDate
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          NOMINEE + ADDITIONAL DETAILS
      ====================================================== */}

      <div className="mb-5 w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:mb-6 sm:p-6 lg:p-7">
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
            <ShieldCheck
              size={21}
              className="text-amber-600 dark:text-amber-400"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Additional Loan Information
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nominee, identification and other submitted details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <DetailItem
            label="Nominee Name"
            value={loan?.nomineeName}
            icon={User}
          />

          <DetailItem
            label="Relationship"
            value={loan?.nomineeRelationship}
            icon={Users}
          />

          <DetailItem
            label="Nominee Mobile"
            value={loan?.nomineeMobile}
            icon={Phone}
          />

          <DetailItem
            label="Nominee Aadhaar"
            value={loan?.nomineeAadhaarNumber}
            icon={ShieldCheck}
          />

          <DetailItem
            label="Monthly Income"
            value={
              loan?.monthlyIncome
                ? `₹ ${formatAmount(
                    loan.monthlyIncome
                  )}`
                : "-"
            }
            icon={IndianRupee}
          />

          <DetailItem
            label="NOC Status"
            value={loan?.nocStatus}
            icon={ShieldCheck}
          />

          <DetailItem
            label="NOC Number"
            value={loan?.nocNumber}
            icon={Hash}
          />

          <DetailItem
            label="NOC Generated Date"
            value={formatDate(
              loan?.nocGeneratedDate
            )}
            icon={CalendarDays}
          />
        </div>

        {/* OLD INCOME PROOF */}

        {getIncomeProofFiles(loan).length > 0 && (
          <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700 sm:mt-6 sm:pt-6">
            <div className="mb-4 flex items-center gap-2">
              <FileText
                size={18}
                className="text-green-600 dark:text-green-400"
              />

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Income Proof
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Income proof files stored with the loan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {getIncomeProofFiles(
                loan
              ).map(
                (
                  fileName,
                  fileIndex
                ) => (
                  <div
                    key={`${fileName}-${fileIndex}`}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/60 sm:px-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950/40">
                      <FileText
                        size={18}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Income Proof
                      </p>

                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                        {fileName}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          CUSTOMER LOAN HISTORY
      ====================================================== */}

      <div className="mb-5 w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:mb-6 sm:p-6 lg:p-7">
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/40">
              <CreditCard
                size={21}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Customer Loan History
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Complete loan history of this customer.
              </p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {displayedLoans.length}{" "}
              {displayedLoans.length === 1
                ? "Loan"
                : "Loans"}
            </span>

            {loansLoading && (
              <Loader2
                size={19}
                className="animate-spin text-blue-600 dark:text-blue-400"
              />
            )}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {displayedLoans.map(
            (item, index) => {
              const incomeProofFiles =
                getIncomeProofFiles(
                  item
                );

              const isCurrentLoan =
                String(
                  item?.id ||
                    item?.loanId
                ) ===
                String(
                  loan?.id ||
                    loan?.loanId
                );

              return (
                <div
                  key={
                    item?.id ||
                    item?.loanId ||
                    index
                  }
                  className={`rounded-2xl border p-4 sm:p-6 ${
                    isCurrentLoan
                      ? "border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20"
                      : "border-slate-200 bg-slate-50/40 dark:border-slate-700 dark:bg-slate-800/40"
                  }`}
                >
                  {/* LOAN HEADER */}

                  <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:h-12 sm:w-12">
                        <CreditCard
                          size={21}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Loan {index + 1}
                          </p>

                          {isCurrentLoan && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                              Current Loan
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1 break-all text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                          {item?.loanId ||
                            item?.id ||
                            "-"}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit self-start rounded-full border px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${getStatusClass(
                        item?.status
                      )}`}
                    >
                      {item?.status || "-"}
                    </span>
                  </div>

                  {/* LOAN SUMMARY STRIP */}

                  <div className="mb-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:mb-6 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Loan Amount
                      </p>

                      <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                        ₹
                        {formatAmount(
                          item?.loanAmount
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        EMI Amount
                      </p>

                      <p className="mt-1 text-base font-bold text-emerald-700 dark:text-emerald-400">
                        ₹
                        {formatAmount(
                          item?.emiAmount
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Interest
                      </p>

                      <p className="mt-1 text-base font-bold text-purple-700 dark:text-purple-400">
                        {item?.interestRate ??
                          2}
                        %
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tenure
                      </p>

                      <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                        {item?.tenureMonths ||
                          "-"}{" "}
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Months
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* BASIC DETAILS */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
                    <DetailItem
                      label="Loan ID"
                      value={
                        item?.loanId ||
                        item?.id
                      }
                      icon={Hash}
                    />

                    <DetailItem
                      label="Customer ID"
                      value={
                        item?.customerId ||
                        loan?.customerId
                      }
                      icon={User}
                    />

                    <DetailItem
                      label="Customer Name"
                      value={
                        item?.customerName ||
                        loan?.customerName
                      }
                      icon={User}
                    />

                    <DetailItem
                      label="Loan Date"
                      value={formatDate(
                        item?.loanDate
                      )}
                      icon={CalendarDays}
                    />

                    <DetailItem
                      label="Disbursal Expected"
                      value={formatDate(
                        item?.disbursalExpectedDate
                      )}
                      icon={CalendarDays}
                    />

                    <DetailItem
                      label="Next EMI Date"
                      value={formatDate(
                        item?.nextEmiDate
                      )}
                      icon={CalendarDays}
                    />

                    <DetailItem
                      label="Completed Date"
                      value={formatDate(
                        item?.completedDate
                      )}
                      icon={CheckCircle2}
                    />

                    <DetailItem
                      label="Closed Date"
                      value={formatDate(
                        item?.closedDate
                      )}
                      icon={Landmark}
                    />
                  </div>

                  {/* EXTRA DETAILS */}

                  {(item?.nomineeName ||
                    item?.nomineeRelationship ||
                    item?.nomineeMobile ||
                    item?.monthlyIncome ||
                    item?.panNumber ||
                    item?.aadhaarNumber ||
                    incomeProofFiles.length > 0) && (
                    <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700 sm:mt-6 sm:pt-6">
                      <div className="mb-4 flex items-center gap-2">
                        <ShieldCheck
                          size={18}
                          className="text-amber-600 dark:text-amber-400"
                        />

                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          Additional Details
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
                        <DetailItem
                          label="Aadhaar"
                          value={
                            item?.aadhaarNumber
                          }
                          icon={ShieldCheck}
                        />

                        <DetailItem
                          label="PAN"
                          value={
                            item?.panNumber
                          }
                          icon={CreditCard}
                        />

                        <DetailItem
                          label="Nominee"
                          value={
                            item?.nomineeName
                          }
                          icon={User}
                        />

                        <DetailItem
                          label="Relationship"
                          value={
                            item?.nomineeRelationship
                          }
                          icon={Users}
                        />

                        <DetailItem
                          label="Nominee Mobile"
                          value={
                            item?.nomineeMobile
                          }
                          icon={Phone}
                        />

                        <DetailItem
                          label="Nominee Aadhaar"
                          value={
                            item?.nomineeAadhaarNumber
                          }
                          icon={ShieldCheck}
                        />

                        <DetailItem
                          label="Monthly Income"
                          value={
                            item?.monthlyIncome
                              ? `₹ ${formatAmount(
                                  item.monthlyIncome
                                )}`
                              : "-"
                          }
                          icon={IndianRupee}
                        />

                        <DetailItem
                          label="NOC Status"
                          value={
                            item?.nocStatus
                          }
                          icon={ShieldCheck}
                        />
                      </div>

                      {incomeProofFiles.length >
                        0 && (
                        <div className="mt-5">
                          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Income Proof
                          </p>

                          <div className="flex flex-wrap gap-3">
                            {incomeProofFiles.map(
                              (
                                fileName,
                                fileIndex
                              ) => (
                                <div
                                  key={`${fileName}-${fileIndex}`}
                                  className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-900 sm:px-4"
                                >
                                  <FileText
                                    size={17}
                                    className="shrink-0 text-green-600 dark:text-green-400"
                                  />

                                  <span className="max-w-[220px] truncate text-sm font-medium text-slate-700 dark:text-slate-200 sm:max-w-[280px]">
                                    {fileName}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DOCUMENTS */}

                  {isCurrentLoan && (
                    <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-700 sm:mt-6 sm:pt-6">
                      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
                            <FileText
                              size={19}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              Loan Documents
                            </h4>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Documents uploaded for this loan.
                            </p>
                          </div>
                        </div>

                        {documentsLoading && (
                          <Loader2
                            size={20}
                            className="text-blue-600 dark:text-blue-400 animate-spin"
                          />
                        )}
                      </div>

                      {documentsLoading ? (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 sm:px-5 sm:py-5">
                          Loading loan documents...
                        </div>
                      ) : loanDocuments.length ===
                        0 ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/60 sm:px-5 sm:py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                              <FileText
                                size={19}
                                className="text-slate-500 dark:text-slate-400"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                No loan documents found
                              </p>

                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                No documents have been uploaded for this loan.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                          {loanDocuments.map(
                            (
                              document,
                              documentIndex
                            ) => {
                              const documentId =
                                getDocumentId(
                                  document
                                );

                              const fileName =
                                getDocumentFileName(
                                  document
                                );

                              const typeLabel =
                                getDocumentTypeLabel(
                                  document
                                );

                              const typeClass =
                                getDocumentTypeClass(
                                  document
                                );

                              const isDownloading =
                                documentDownloading ===
                                documentId;

                              return (
                                <div
                                  key={
                                    documentId ||
                                    `${fileName}-${documentIndex}`
                                  }
                                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-800 sm:p-5"
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 sm:h-12 sm:w-12">
                                        <FileText
                                          size={21}
                                          className="text-blue-600 dark:text-blue-400"
                                        />
                                      </div>

                                      <div className="min-w-0">
                                        <span
                                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${typeClass}`}
                                        >
                                          {typeLabel}
                                        </span>

                                        <p className="mt-2 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                          {fileName}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDocumentView(
                                            document
                                          )
                                        }
                                        disabled={
                                          !documentId ||
                                          viewingDocumentLoading
                                        }
                                        title="View document"
                                        className="flex h-10 flex-1 items-center justify-center rounded-xl bg-slate-700 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 sm:w-10 sm:flex-none"
                                      >
                                        {viewingDocumentLoading ? (
                                          <Loader2
                                            size={17}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Eye
                                            size={17}
                                          />
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDocumentDownload(
                                            document
                                          )
                                        }
                                        disabled={
                                          !documentId ||
                                          isDownloading
                                        }
                                        title="Download document"
                                        className="flex h-10 flex-1 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 sm:w-10 sm:flex-none"
                                      >
                                        {isDownloading ? (
                                          <Loader2
                                            size={17}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Download
                                            size={17}
                                          />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* =====================================================
          FOOTER ACTION
      ====================================================== */}

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Loan Details
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Review customer, financial and document information.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/loans")
          }
          className="ml-0 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:ml-auto sm:w-auto"
        >
          <ArrowLeft size={18} />
          Back to Loans
        </button>
      </div>
    </div>
  );
};

export default ViewLoan;