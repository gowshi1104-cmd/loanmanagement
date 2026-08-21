import {
  AlertTriangle,
  FileText,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import LoanForm from "../../components/forms/LoanForm";

import {
  getLoanById,
  updateLoan,
} from "../../services/loanService";

import {
  getLoanDocuments,
  downloadLoanDocument,
  deleteLoanDocument,
  uploadLoanDocuments,
} from "../../services/loanDocumentService";

// =========================================================
// EDIT LOAN
// =========================================================

const EditLoan = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  // =========================================================
  // LOAN
  // =========================================================

  const [loan, setLoan] = useState(null);

  // =========================================================
  // DOCUMENTS
  // =========================================================

  const [documents, setDocuments] =
    useState([]);

  const [documentsLoading, setDocumentsLoading] =
    useState(false);

  const [documentUploading, setDocumentUploading] =
    useState(false);

  const [deletingDocumentId, setDeletingDocumentId] =
    useState(null);

  // =========================================================
  // DELETE DOCUMENT MODAL
  // =========================================================

  const [deleteDocumentModal, setDeleteDocumentModal] =
    useState(null);

  const [viewingDocumentId, setViewingDocumentId] =
    useState(null);

  // =========================================================
  // DOCUMENT PREVIEW
  // =========================================================

  const [previewDocument, setPreviewDocument] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState(null);

  // =========================================================
  // FILE INPUT
  // =========================================================

  const [selectedDocuments, setSelectedDocuments] =
    useState({
      aadhaar: null,
      pan: null,
      nomineeProof: null,
      incomeProof: null,
    });

  // =========================================================
  // FILE CONFIG
  // =========================================================

  const allowedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  const maxFileSize =
    5 * 1024 * 1024;

  // =========================================================
  // LOAD LOAN
  // =========================================================

  useEffect(() => {
    loadLoan();
  }, [id]);

  // =========================================================
  // LOAD LOAN
  // =========================================================

  const loadLoan = async () => {
    try {
      const response =
        await getLoanById(id);

      setLoan(response.data);

      await loadLoanDocuments(id);
    } catch (error) {
      console.error(
        "Failed to load loan:",
        error
      );

      toast.error(
        "Failed to load loan"
      );
    }
  };

  // =========================================================
  // LOAD DOCUMENTS
  // =========================================================

  const loadLoanDocuments = async (
    loanId
  ) => {
    try {
      setDocumentsLoading(true);

      const response =
        await getLoanDocuments(
          loanId
        );

      const data =
        Array.isArray(response.data)
          ? response.data
          : [];

      setDocuments(data);
    } catch (error) {
      console.error(
        "Failed to load loan documents:",
        error
      );

      setDocuments([]);

      toast.error(
        "Failed to load loan documents"
      );
    } finally {
      setDocumentsLoading(false);
    }
  };

  // =========================================================
  // UPDATE LOAN
  // =========================================================

  const handleUpdateLoan = async (
    updatedLoan
  ) => {
    const response =
      await updateLoan(
        id,
        updatedLoan
      );

    return response;
  };

  // =========================================================
  // FILE CHANGE
  // =========================================================

  const handleDocumentChange = (
    event,
    documentType
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    // -------------------------------------------------------
    // FILE TYPE
    // -------------------------------------------------------

    if (
      !allowedFileTypes.includes(
        file.type
      )
    ) {
      toast.error(
        "Only PDF, JPG, JPEG and PNG files are allowed"
      );

      return;
    }

    // -------------------------------------------------------
    // FILE SIZE
    // -------------------------------------------------------

    if (
      file.size > maxFileSize
    ) {
      toast.error(
        "File size must be maximum 5 MB"
      );

      return;
    }

    setSelectedDocuments(
      (prev) => ({
        ...prev,
        [documentType]: file,
      })
    );
  };

  // =========================================================
  // REMOVE SELECTED FILE
  // =========================================================

  const removeSelectedDocument = (
    documentType
  ) => {
    setSelectedDocuments(
      (prev) => ({
        ...prev,
        [documentType]: null,
      })
    );
  };

  // =========================================================
  // UPLOAD DOCUMENT
  // =========================================================

  const handleUploadDocument = async (
    documentType
  ) => {
    const file =
      selectedDocuments[
        documentType
      ];

    if (!file) {
      toast.error(
        "Please select a document"
      );

      return;
    }

    try {
      setDocumentUploading(true);

      await uploadLoanDocuments(
        id,
        [
          {
            documentType:
              documentTypeToBackendType(
                documentType
              ),

            file,
          },
        ]
      );

      toast.success(
        `${documentTypeToLabel(
          documentType
        )} uploaded successfully`
      );

      setSelectedDocuments(
        (prev) => ({
          ...prev,
          [documentType]: null,
        })
      );

      await loadLoanDocuments(id);
    } catch (error) {
      console.error(
        "Document upload error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to upload document"
      );
    } finally {
      setDocumentUploading(false);
    }
  };

  // =========================================================
  // OPEN DELETE DOCUMENT MODAL
  // =========================================================

  const handleDeleteDocument = (
    documentId
  ) => {
    if (!documentId) {
      toast.error(
        "Document ID not available"
      );

      return;
    }

    setDeleteDocumentModal(
      documentId
    );
  };

  // =========================================================
  // CONFIRM DELETE DOCUMENT
  // =========================================================

  const confirmDeleteDocument = async () => {
    const documentId =
      deleteDocumentModal;

    if (!documentId) {
      return;
    }

    try {
      setDeletingDocumentId(
        documentId
      );

      await deleteLoanDocument(
        documentId
      );

      toast.success(
        "Document deleted successfully"
      );

      setDeleteDocumentModal(
        null
      );

      await loadLoanDocuments(id);
    } catch (error) {
      console.error(
        "Document delete error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to delete document"
      );
    } finally {
      setDeletingDocumentId(null);
    }
  };

  // =========================================================
  // CLOSE DELETE DOCUMENT MODAL
  // =========================================================

  const closeDeleteDocumentModal = () => {
    if (
      deletingDocumentId !== null
    ) {
      return;
    }

    setDeleteDocumentModal(null);
  };

  // =========================================================
  // VIEW DOCUMENT
  // =========================================================

  const handleViewDocument = async (
    documentItem
  ) => {
    const documentId =
      documentItem?.id ||
      documentItem?.documentId;

    if (!documentId) {
      toast.error(
        "Document ID not available"
      );

      return;
    }

    try {
      setViewingDocumentId(
        documentId
      );

      const response =
        await downloadLoanDocument(
          documentId
        );

      const contentType =
        response.headers?.[
          "content-type"
        ] ||
        documentItem?.contentType ||
        "application/octet-stream";

      const blob =
        new Blob(
          [response.data],
          {
            type: contentType,
          }
        );

      const url =
        window.URL.createObjectURL(
          blob
        );

      setPreviewDocument(
        documentItem
      );

      setPreviewUrl(url);
    } catch (error) {
      console.error(
        "Document view error:",
        error
      );

      toast.error(
        "Failed to view document"
      );
    } finally {
      setViewingDocumentId(
        null
      );
    }
  };

  // =========================================================
  // CLOSE DOCUMENT PREVIEW
  // =========================================================

  const closeDocumentPreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(
        previewUrl
      );
    }

    setPreviewUrl(null);
    setPreviewDocument(null);
  };

  // =========================================================
  // DOCUMENT TYPE
  // =========================================================

  const documentTypeToBackendType = (
    documentType
  ) => {
    switch (documentType) {
      case "aadhaar":
        return "AADHAAR";

      case "pan":
        return "PAN";

      case "nomineeProof":
        return "NOMINEE_PROOF";

      case "incomeProof":
        return "INCOME_PROOF";

      default:
        return documentType
          ?.toUpperCase();
    }
  };

  // =========================================================
  // DOCUMENT LABEL
  // =========================================================

  const documentTypeToLabel = (
    documentType
  ) => {
    switch (documentType) {
      case "AADHAAR":
      case "aadhaar":
        return "Aadhaar Card";

      case "PAN":
      case "pan":
        return "PAN Card";

      case "NOMINEE_PROOF":
      case "nomineeProof":
        return "Nominee ID / Proof";

      case "INCOME_PROOF":
      case "incomeProof":
        return "Income Proof";

      default:
        return documentType || "Document";
    }
  };

  // =========================================================
  // NORMALIZE DOCUMENT TYPE
  // =========================================================

  const normalizeDocumentType = (
    documentItem
  ) => {
    const type =
      documentItem?.documentType ||
      documentItem?.type ||
      "";

    return type
      .toString()
      .toUpperCase()
      .trim();
  };

  // =========================================================
  // FIND EXISTING DOCUMENT
  // =========================================================

  const getExistingDocument = (
    documentType
  ) => {
    const backendType =
      documentTypeToBackendType(
        documentType
      );

    return documents.find(
      (item) =>
        normalizeDocumentType(
          item
        ) === backendType
    );
  };

  // =========================================================
  // DOCUMENT CARD
  // =========================================================

  const DocumentCard = ({
    title,
    documentType,
  }) => {
    const existingDocument =
      getExistingDocument(
        documentType
      );

    const selectedFile =
      selectedDocuments[
        documentType
      ];

    const documentId =
      existingDocument?.id ||
      existingDocument?.documentId;

    return (
      <div className="border border-slate-200 rounded-2xl bg-white p-5">
        {/* -------------------------------------------------
            HEADER
        -------------------------------------------------- */}

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                {title}
              </h3>

              <p className="text-xs text-slate-500 mt-0.5">
                {existingDocument
                  ? "Document uploaded"
                  : "Document not uploaded"}
              </p>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            EXISTING DOCUMENT
        -------------------------------------------------- */}

        {existingDocument ? (
          <div className="border border-green-200 bg-green-50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText
                  size={18}
                  className="text-green-600 shrink-0"
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {
                      existingDocument.fileName
                    }
                  </p>

                  {existingDocument.fileSize && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {(
                        Number(
                          existingDocument.fileSize
                        ) /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* VIEW BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    handleViewDocument(
                      existingDocument
                    )
                  }
                  disabled={
                    viewingDocumentId ===
                    documentId
                  }
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:bg-slate-300"
                >
                  {viewingDocumentId ===
                  documentId ? (
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <FileText
                      size={14}
                    />
                  )}

                  View
                </button>

                {/* DELETE BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteDocument(
                      documentId
                    )
                  }
                  disabled={
                    deletingDocumentId ===
                    documentId
                  }
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                  title="Delete document"
                >
                  {deletingDocumentId ===
                  documentId ? (
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2
                      size={15}
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-amber-700">
              No document uploaded.
            </p>
          </div>
        )}

        {/* -------------------------------------------------
            SELECTED NEW DOCUMENT
        -------------------------------------------------- */}

        {selectedFile && (
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText
                  size={18}
                  className="text-blue-600 shrink-0"
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {selectedFile.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {(
                      selectedFile.size /
                      (1024 * 1024)
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  removeSelectedDocument(
                    documentType
                  )
                }
                className="text-red-600 hover:text-red-800 text-xs font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------
            UPLOAD
        -------------------------------------------------- */}

        <div className="flex gap-2">
          <label className="flex-1">
            <div className="w-full border-2 border-dashed border-slate-300 rounded-xl px-4 py-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
              <div className="flex items-center justify-center gap-2">
                <Upload
                  size={17}
                  className="text-blue-600"
                />

                <span className="text-sm font-medium text-slate-700">
                  {existingDocument
                    ? "Choose replacement document"
                    : "Choose document"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 text-center mt-1">
                PDF, JPG, JPEG, PNG • Max 5 MB
              </p>
            </div>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) =>
                handleDocumentChange(
                  e,
                  documentType
                )
              }
            />
          </label>

          <button
            type="button"
            onClick={() =>
              handleUploadDocument(
                documentType
              )
            }
            disabled={
              !selectedFile ||
              documentUploading
            }
            className="px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {documentUploading
              ? "Uploading..."
              : existingDocument
              ? "Update"
              : "Upload"}
          </button>
        </div>
      </div>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (!loan) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-slate-500">
          Loading...
        </p>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>
      {/* ===================================================
          HEADER
      ==================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Edit Loan
        </h1>

        <p className="text-slate-500 mt-1">
          Update loan information and documents.
        </p>
      </div>

      <div className="max-w-6xl">
        {/* =================================================
            LOAN FORM
        ================================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <LoanForm
            initialData={loan}
            onSubmit={handleUpdateLoan}
            buttonText="Update Loan"
            successMessage="Changes updated successfully!"
          />
        </div>

        {/* =================================================
            DOCUMENT EDIT SECTION
        ================================================== */}

        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {/* -------------------------------------------------
              DOCUMENT HEADER
          -------------------------------------------------- */}

          <div className="mb-6">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileText
                  size={22}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Loan Documents
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  View, delete and update loan documents.
                </p>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------
              LIMIT NOTICE
          -------------------------------------------------- */}

          {loan?.customerId &&
            loan?.customerId &&
            false && (
              <div className="mb-5">
                <AlertTriangle />
              </div>
            )}

          {/* -------------------------------------------------
              DOCUMENT LOADING
          -------------------------------------------------- */}

          {documentsLoading ? (
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-5 text-sm text-blue-700">
              Loading loan documents...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* AADHAAR */}

              <DocumentCard
                title="Aadhaar Card"
                documentType="aadhaar"
              />

              {/* PAN */}

              <DocumentCard
                title="PAN Card"
                documentType="pan"
              />

              {/* NOMINEE */}

              <DocumentCard
                title="Nominee ID / Proof"
                documentType="nomineeProof"
              />

              {/* INCOME */}

              <DocumentCard
                title="Income Proof"
                documentType="incomeProof"
              />
            </div>
          )}

          {/* -------------------------------------------------
              INFO
          -------------------------------------------------- */}

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="text-slate-500 mt-0.5 shrink-0"
              />

              <p className="text-xs text-slate-600 leading-5">
                Document updates are independent of the loan
                limit. You can delete or upload documents even
                when the customer has already reached the
                maximum loan limit.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            BACK
        ================================================== */}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() =>
              navigate("/loans")
            }
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Back to Loans
          </button>
        </div>
      </div>

      {/* =====================================================
          DELETE DOCUMENT CONFIRMATION MODAL
      ====================================================== */}

      {deleteDocumentModal !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={closeDeleteDocumentModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* -------------------------------------------------
                MODAL HEADER
            -------------------------------------------------- */}

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <Trash2
                    size={22}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Delete Document
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Are you sure you want to delete this
                    document?
                  </p>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------
                MODAL ACTIONS
            -------------------------------------------------- */}

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={
                  closeDeleteDocumentModal
                }
                disabled={
                  deletingDocumentId !== null
                }
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmDeleteDocument
                }
                disabled={
                  deletingDocumentId !== null
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {deletingDocumentId !== null ? (
                  <>
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={15}
                    />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DOCUMENT PREVIEW MODAL
      ====================================================== */}

      {previewUrl && previewDocument && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            {/* -------------------------------------------------
                PREVIEW HEADER
            -------------------------------------------------- */}

            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800">
                    {documentTypeToLabel(
                      previewDocument?.documentType ||
                        previewDocument?.type
                    )}
                  </h3>

                  <p className="text-xs text-slate-500 truncate">
                    {previewDocument?.fileName ||
                      "Loan Document"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  closeDocumentPreview
                }
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            {/* -------------------------------------------------
                PREVIEW BODY
            -------------------------------------------------- */}

            <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4">
              {(
                previewDocument?.contentType ||
                ""
              )
                .toLowerCase()
                .includes("pdf") ? (
                <iframe
                  src={previewUrl}
                  title={
                    previewDocument?.fileName ||
                    "Loan Document"
                  }
                  className="w-full h-full rounded-lg border border-slate-300 bg-white"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={
                    previewDocument?.fileName ||
                    "Loan Document"
                  }
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditLoan;