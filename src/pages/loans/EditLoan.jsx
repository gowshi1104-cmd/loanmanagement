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

  const [documents, setDocuments] = useState([]);
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
      rationCard: null,
      photo: null,
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

    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
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
        await getLoanDocuments(loanId);

      const data =
        Array.isArray(response?.data)
          ? response.data
          : [];

      console.log(
        "Loan documents response:",
        data
      );

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

      setDeleteDocumentModal(null);

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
  // DOCUMENT ID
  // =========================================================

  const getDocumentId = (
    documentItem
  ) => {
    return (
      documentItem?.id ||
      documentItem?.documentId ||
      documentItem?.loanDocumentId
    );
  };

  // =========================================================
  // DOCUMENT FILE NAME
  // =========================================================

  const getDocumentFileName = (
    documentItem
  ) => {
    return (
      documentItem?.fileName ||
      documentItem?.originalFileName ||
      documentItem?.documentFileName ||
      documentItem?.name ||
      "Loan Document"
    );
  };

  // =========================================================
  // DOCUMENT CONTENT TYPE
  // =========================================================

  const getDocumentContentType = (
    documentItem,
    response
  ) => {
    const responseType =
      response?.headers?.[
        "content-type"
      ];

    if (responseType) {
      return responseType
        .split(";")[0]
        .trim();
    }

    const documentContentType =
      documentItem?.contentType ||
      documentItem?.mimeType ||
      "";

    if (documentContentType) {
      return documentContentType
        .split(";")[0]
        .trim();
    }

    const fileName =
      getDocumentFileName(
        documentItem
      ).toLowerCase();

    if (
      fileName.endsWith(".pdf")
    ) {
      return "application/pdf";
    }

    if (
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg")
    ) {
      return "image/jpeg";
    }

    if (
      fileName.endsWith(".png")
    ) {
      return "image/png";
    }

    return "application/octet-stream";
  };

  // =========================================================
  // VIEW DOCUMENT
  // =========================================================

  const handleViewDocument = async (
    documentItem
  ) => {
    const documentId =
      getDocumentId(
        documentItem
      );

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

      if (previewUrl) {
        window.URL.revokeObjectURL(
          previewUrl
        );
      }

      setPreviewDocument(null);
      setPreviewUrl(null);

      const response =
        await downloadLoanDocument(
          documentId
        );

      const contentType =
        getDocumentContentType(
          documentItem,
          response
        );

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

      setPreviewDocument({
        ...documentItem,
        contentType,
      });

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
      setViewingDocumentId(null);
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

      case "rationCard":
        return "RATION_CARD";

      case "photo":
        return "PHOTO";

      default:
        return documentType?.toUpperCase();
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

      case "RATION_CARD":
      case "RATIONCARD":
      case "rationCard":
        return "Ration Card";

      case "PHOTO":
      case "photo":
        return "Photo";

      default:
        return (
          documentType ||
          "Document"
        );
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
      documentItem?.document_type ||
      "";

    return type
      .toString()
      .toUpperCase()
      .replace(/[\s_-]/g, "")
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
      )
        ?.toString()
        .toUpperCase()
        .replace(/[\s_-]/g, "");

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
      getDocumentId(
        existingDocument
      );

    const fileName =
      getDocumentFileName(
        existingDocument
      );

    const fileSize =
      existingDocument?.fileSize ??
      existingDocument?.size ??
      existingDocument?.file_size;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
              <FileText
                size={20}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                {title}
              </h3>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {existingDocument
                  ? "Document uploaded"
                  : "Document not uploaded"}
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            EXISTING DOCUMENT
        ================================================= */}

        {existingDocument ? (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/40">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-2">
                <FileText
                  size={18}
                  className="shrink-0 text-green-600 dark:text-green-400"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {fileName}
                  </p>

                  {fileSize && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {(
                        Number(fileSize) /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </p>
                  )}
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0">

                {/* VIEW */}

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
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 sm:flex-none"
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

                {/* DELETE */}

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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70"
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
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              No document uploaded.
            </p>
          </div>
        )}

        {/* =================================================
            SELECTED NEW DOCUMENT
        ================================================= */}

        {selectedFile && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/40">

            <div className="flex items-center justify-between gap-3">

              <div className="flex min-w-0 items-center gap-2">
                <FileText
                  size={18}
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {selectedFile.name}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
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
                className="shrink-0 text-xs font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove
              </button>

            </div>
          </div>
        )}

        {/* =================================================
            UPLOAD
        ================================================= */}

        <div className="flex flex-col gap-2 sm:flex-row">

          <label className="flex-1">
            <div className="w-full cursor-pointer rounded-xl border-2 border-dashed border-slate-300 px-4 py-4 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:bg-blue-950/30">

              <div className="flex items-center justify-center gap-2">
                <Upload
                  size={17}
                  className="text-blue-600 dark:text-blue-400"
                />

                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {existingDocument
                    ? "Choose replacement document"
                    : "Choose document"}
                </span>
              </div>

              <p className="mt-1 text-center text-[11px] text-slate-500 dark:text-slate-400">
                PDF, JPG, JPEG, PNG • Max 5 MB
              </p>

            </div>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(event) =>
                handleDocumentChange(
                  event,
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
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 sm:w-auto sm:min-w-[100px]"
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
      <div className="flex min-h-[260px] items-center justify-center px-4 sm:min-h-[300px]">
        <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Loading...
        </p>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full min-w-0">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 sm:text-3xl">
          Edit Loan
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Update loan information and documents.
        </p>
      </div>

      <div className="w-full min-w-0">

        {/* =================================================
            LOAN FORM
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
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

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:mt-6 sm:p-6">

          {/* DOCUMENT HEADER */}

          <div className="mb-5 sm:mb-6">
            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 sm:h-11 sm:w-11">
                <FileText
                  size={22}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 sm:text-xl">
                  Loan Documents
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  View, delete and update loan documents.
                </p>
              </div>

            </div>
          </div>

          {/* DOCUMENT LOADING */}

          {documentsLoading ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 sm:p-5">
              Loading loan documents...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">

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

              {/* RATION CARD */}

              <DocumentCard
                title="Ration Card"
                documentType="rationCard"
              />

              {/* PHOTO */}

              <DocumentCard
                title="Photo"
                documentType="photo"
              />

            </div>
          )}

          {/* INFO */}

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:mt-5 sm:p-4">

            <div className="flex items-start gap-3">

              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400"
              />

              <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
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

        <div className="mt-4 flex justify-stretch sm:mt-5 sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate("/loans")
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-4"
          onClick={
            closeDeleteDocumentModal
          }
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-hidden overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="p-4 sm:p-6">

              <div className="flex items-start gap-3 sm:gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 sm:h-11 sm:w-11">
                  <Trash2
                    size={22}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
                    Delete Document
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Are you sure you want to delete this
                    document?
                  </p>
                </div>

              </div>

            </div>

            {/* MODAL ACTIONS */}

            <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">

              <button
                type="button"
                onClick={
                  closeDeleteDocumentModal
                }
                disabled={
                  deletingDocumentId !==
                  null
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmDeleteDocument
                }
                disabled={
                  deletingDocumentId !==
                  null
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 sm:w-auto"
              >
                {deletingDocumentId !==
                null ? (
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

      {previewUrl &&
        previewDocument && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-2 sm:p-4">

            <div className="flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 sm:h-[90vh]">

              {/* PREVIEW HEADER */}

              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-3 dark:border-slate-700 sm:gap-4 sm:px-5 sm:py-4">

                <div className="flex min-w-0 items-center gap-2 sm:gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                    <FileText
                      size={19}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100 sm:text-base">
                      {documentTypeToLabel(
                        previewDocument?.documentType ||
                          previewDocument?.type
                      )}
                    </h3>

                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {getDocumentFileName(
                        previewDocument
                      )}
                    </p>
                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    closeDocumentPreview
                  }
                  className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:px-4 sm:text-sm"
                >
                  Close
                </button>

              </div>

              {/* PREVIEW BODY */}

              <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100 p-2 dark:bg-slate-950 sm:p-4">

                {(
                  previewDocument?.contentType ||
                  ""
                )
                  .toLowerCase()
                  .includes("pdf") ? (
                  <iframe
                    src={previewUrl}
                    title={
                      getDocumentFileName(
                        previewDocument
                      )
                    }
                    className="h-full w-full rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt={
                      getDocumentFileName(
                        previewDocument
                      )
                    }
                    className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
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