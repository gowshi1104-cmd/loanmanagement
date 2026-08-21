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
} from "lucide-react";

import {
  getLoanById,
  getCustomerLoans,
} from "../../services/loanService";

import {
  getLoanDocuments,
  downloadLoanDocument,
} from "../../services/loanDocumentService";

const ViewLoan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [loan, setLoan] = useState(null);
  const [allLoans, setAllLoans] = useState([]);
  const [loanDocuments, setLoanDocuments] = useState([]);

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

      // -----------------------------------------------------
      // CURRENT LOAN
      // -----------------------------------------------------

      const response = await getLoanById(id);

      const currentLoan = response?.data;

      if (!currentLoan) {
        setLoan(null);
        return;
      }

      setLoan(currentLoan);

      // -----------------------------------------------------
      // CUSTOMER LOAN HISTORY
      // -----------------------------------------------------

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

      // -----------------------------------------------------
      // LOAN DOCUMENTS
      // -----------------------------------------------------

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
      return "bg-green-100 text-green-700";
    }

    if (value === "PENDING") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (value === "REJECTED") {
      return "bg-red-100 text-red-700";
    }

    return "bg-slate-100 text-slate-600";
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
      return "bg-blue-100 text-blue-700";
    }

    if (label.includes("PAN")) {
      return "bg-purple-100 text-purple-700";
    }

    if (label.includes("NOMINEE")) {
      return "bg-amber-100 text-amber-700";
    }

    if (label.includes("INCOME")) {
      return "bg-green-100 text-green-700";
    }

    return "bg-slate-100 text-slate-700";
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

      // Close previous preview URL
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

      const response = await downloadLoanDocument(
        documentId
      );

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
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2
            size={20}
            className="animate-spin"
          />

          <p>Loading loan details...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // NO LOAN
  // =========================================================

  if (!loan) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 font-medium">
          Failed to load loan details.
        </p>

        <button
          type="button"
          onClick={() =>
            navigate("/loans")
          }
          className="mt-4 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
        >
          Back to Loans
        </button>
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
      <div className="w-full">
        {/* ===================================================
            VIEWER HEADER
        ==================================================== */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-4">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <FileText
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  {getDocumentTypeLabel(
                    viewingDocument
                  )}
                </p>

                <h2 className="font-semibold text-slate-800 truncate">
                  {fileName}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={
                handleCloseDocumentViewer
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition shrink-0"
            >
              <X size={18} />
              Close
            </button>
          </div>
        </div>

        {/* ===================================================
            DOCUMENT VIEW
        ==================================================== */}

        <div className="bg-slate-100 border border-slate-200 rounded-2xl min-h-[75vh] overflow-hidden">
          {isPdf ? (
            <iframe
              src={viewingDocumentUrl}
              title={fileName}
              className="w-full h-[75vh] border-0"
            />
          ) : isImage ? (
            <div className="w-full min-h-[75vh] flex items-center justify-center p-6">
              <img
                src={viewingDocumentUrl}
                alt={fileName}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm bg-white"
              />
            </div>
          ) : (
            <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4">
                <FileText
                  size={28}
                  className="text-slate-500"
                />
              </div>

              <h3 className="text-lg font-semibold text-slate-800">
                Preview not available
              </h3>

              <p className="text-sm text-slate-500 mt-2 max-w-md">
                This file type cannot be previewed
                directly in the browser.
                You can download the document
                instead.
              </p>

              <button
                type="button"
                onClick={() =>
                  handleDocumentDownload(
                    viewingDocument
                  )
                }
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                <Download size={18} />
                Download Document
              </button>
            </div>
          )}
        </div>

        {/* ===================================================
            CLOSE BUTTON
        ==================================================== */}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={
              handleCloseDocumentViewer
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
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
  // RENDER
  // =========================================================

  return (
    <div>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Loan Details
        </h1>

        <p className="text-slate-500 mt-1">
          View complete loan information,
          documents and customer loan history.
        </p>
      </div>

      {/* =====================================================
          CUSTOMER SUMMARY
      ====================================================== */}

      <div className="max-w-6xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
            <User
              size={21}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Customer Information
            </h2>

            <p className="text-sm text-slate-500">
              All loans belonging to this customer
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-slate-500">
              Customer ID
            </p>

            <p className="font-semibold text-lg text-slate-800 mt-1">
              {loan.customerId || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Customer Name
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {loan.customerName || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Total Loans
            </p>

            <p className="font-semibold text-lg text-blue-600 mt-1">
              {displayedLoans.length}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER LOAN HISTORY
      ====================================================== */}

      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Customer Loan History
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Complete details of all loans for this customer.
            </p>
          </div>

          {loansLoading && (
            <span className="text-sm text-blue-600">
              Loading loans...
            </span>
          )}
        </div>

        <div className="space-y-6">
          {displayedLoans.map(
            (item, index) => {
              const incomeProofFiles =
                getIncomeProofFiles(item);

              const hasAdditionalDetails =
                Boolean(
                  item?.aadhaarNumber ||
                    item?.panNumber ||
                    item?.nomineeName ||
                    item?.nomineeRelationship ||
                    item?.nomineeMobile ||
                    item?.nomineeAadhaarNumber ||
                    item?.monthlyIncome ||
                    incomeProofFiles.length > 0
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
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
                >
                  {/* =================================================
                      LOAN HEADER
                  ================================================== */}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                        <CreditCard
                          size={21}
                          className="text-blue-600"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-500">
                            Loan {index + 1}
                          </p>

                          {isCurrentLoan && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                              Current
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-800">
                          {item?.loanId ||
                            item?.id ||
                            "-"}
                        </h3>
                      </div>
                    </div>

                    <span
                      className={`inline-block w-fit px-4 py-2 rounded-full text-sm font-semibold ${getStatusClass(
                        item?.status
                      )}`}
                    >
                      {item?.status || "-"}
                    </span>
                  </div>

                  {/* =================================================
                      BASIC LOAN DETAILS
                  ================================================== */}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-slate-500">
                        Loan ID
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {item?.loanId ||
                          item?.id ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Customer ID
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {item?.customerId ||
                          loan?.customerId ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Customer Name
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {item?.customerName ||
                          loan?.customerName ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Loan Amount
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        ₹{" "}
                        {formatAmount(
                          item?.loanAmount
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Interest Rate
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {item?.interestRate ??
                          2}
                        %
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Tenure
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {item?.tenureMonths ||
                          "-"}{" "}
                        Months
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        EMI Amount
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        ₹{" "}
                        {formatAmount(
                          item?.emiAmount
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Loan Date
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {formatDate(
                          item?.loanDate
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Disbursal Expected
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {formatDate(
                          item?.disbursalExpectedDate
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        First EMI Date
                      </p>

                      <p className="font-semibold text-slate-800 mt-1">
                        {formatDate(
                          item?.nextEmiDate
                        )}
                      </p>
                    </div>
                  </div>

                  {/* =================================================
                      ADDITIONAL LOAN REQUIREMENTS
                  ================================================== */}

                  {hasAdditionalDetails && (
                    <div className="mt-8 pt-7 border-t border-slate-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                          <ShieldCheck
                            size={20}
                            className="text-amber-600"
                          />
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-slate-800">
                            Additional Loan Requirements
                          </h4>

                          <p className="text-sm text-slate-500 mt-1">
                            Additional information submitted for this loan.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-slate-500">
                            Aadhaar Number
                          </p>

                          <p className="font-semibold text-slate-800 mt-1">
                            {item?.aadhaarNumber ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">
                            PAN Number
                          </p>

                          <p className="font-semibold text-slate-800 mt-1">
                            {item?.panNumber ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">
                            Nominee Name
                          </p>

                          <p className="font-semibold text-slate-800 mt-1">
                            {item?.nomineeName ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">
                            Nominee Relationship
                          </p>

                          <p className="font-semibold text-slate-800 mt-1">
                            {item?.nomineeRelationship ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">
                            Nominee Mobile
                          </p>

                          <p className="font-semibold text-slate-800 mt-1">
                            {item?.nomineeMobile ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">
                            Nominee Aadhaar
                          </p>

                          <p className="font-semibold text-slate-800 mt-1">
                            {item?.nomineeAadhaarNumber ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-500">
                            Monthly Income
                          </p>

                          <p className="font-semibold text-slate-800 mt-1">
                            {item?.monthlyIncome
                              ? `₹ ${formatAmount(
                                  item.monthlyIncome
                                )}`
                              : "-"}
                          </p>
                        </div>
                      </div>

                      {/* =================================================
                          OLD INCOME PROOF FIELD
                      ================================================== */}

                      {incomeProofFiles.length > 0 && (
                        <div className="mt-7">
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-slate-700">
                              Income Proof
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              Income proof filename stored with the loan.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {incomeProofFiles.map(
                              (
                                fileName,
                                fileIndex
                              ) => (
                                <div
                                  key={`${fileName}-${fileIndex}`}
                                  className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                                    <FileText
                                      size={18}
                                      className="text-green-600"
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-xs text-slate-500">
                                      Income Proof
                                    </p>

                                    <p className="text-sm font-medium text-slate-700 truncate">
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
                  )}

                  {/* =================================================
                      LOAN DOCUMENTS
                  ================================================== */}

                  {isCurrentLoan && (
                    <div className="mt-8 pt-7 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <FileText
                              size={20}
                              className="text-blue-600"
                            />
                          </div>

                          <div>
                            <h4 className="text-lg font-semibold text-slate-800">
                              Loan Documents
                            </h4>

                            <p className="text-sm text-slate-500 mt-1">
                              Documents uploaded for this loan.
                            </p>
                          </div>
                        </div>

                        {documentsLoading && (
                          <Loader2
                            size={20}
                            className="text-blue-600 animate-spin"
                          />
                        )}
                      </div>

                      {documentsLoading ? (
                        <div className="border border-blue-200 rounded-xl px-5 py-5 bg-blue-50 text-sm text-blue-700">
                          Loading loan documents...
                        </div>
                      ) : loanDocuments.length === 0 ? (
                        <div className="border border-slate-200 rounded-xl px-5 py-5 bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                              <FileText
                                size={19}
                                className="text-slate-500"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                No loan documents found
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                No documents have been uploaded for this loan.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                        <FileText
                                          size={20}
                                          className="text-blue-600"
                                        />
                                      </div>

                                      <div className="min-w-0">
                                        <span
                                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${typeClass}`}
                                        >
                                          {typeLabel}
                                        </span>

                                        <p className="text-sm font-medium text-slate-800 mt-2 truncate">
                                          {fileName}
                                        </p>
                                      </div>
                                    </div>

                                    {/* =================================================
                                        ACTION BUTTONS
                                    ================================================== */}

                                    <div className="flex items-center gap-2 shrink-0">
                                      {/* VIEW */}

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
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                                      >
                                        {viewingDocumentLoading ? (
                                          <Loader2
                                            size={16}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Eye
                                            size={16}
                                          />
                                        )}

                                        {viewingDocumentLoading
                                          ? "Opening..."
                                          : "View"}
                                      </button>

                                      {/* DOWNLOAD */}

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
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                                      >
                                        {isDownloading ? (
                                          <Loader2
                                            size={16}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Download
                                            size={16}
                                          />
                                        )}

                                        {isDownloading
                                          ? "Downloading..."
                                          : "Download"}
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
          BACK BUTTON
      ====================================================== */}

      <div className="max-w-6xl mt-8 border-t pt-6 flex justify-end">
        <button
          type="button"
          onClick={() =>
            navigate("/loans")
          }
          className="flex items-center gap-2 border border-slate-300 px-6 py-3 rounded-xl hover:bg-slate-100 transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>
    </div>
  );
};

export default ViewLoan;