import api from "../api/axios";

// =========================================================
// UPLOAD SINGLE DOCUMENT
// POST /api/loan-documents/upload/{loanId}
// =========================================================

export const uploadLoanDocument = (
  loanId,
  documentType,
  file
) => {
  const formData = new FormData();

  formData.append("documentType", documentType);
  formData.append("file", file);

  return api.post(
    `/loan-documents/upload/${loanId}`,
    formData
  );
};

// =========================================================
// UPLOAD MULTIPLE DOCUMENTS
// POST /api/loan-documents/upload-batch/{loanId}
// =========================================================

export const uploadLoanDocuments = (
  loanId,
  documents
) => {
  const formData = new FormData();

  documents.forEach(({ documentType, file }) => {
    if (!file) {
      return;
    }

    formData.append(
      "documentType",
      documentType
    );

    formData.append(
      "file",
      file
    );
  });

  return api.post(
    `/loan-documents/upload-batch/${loanId}`,
    formData
  );
};

// =========================================================
// GET ALL DOCUMENTS OF LOAN
// GET /api/loan-documents/loan/{loanId}
// =========================================================

export const getLoanDocuments = (
  loanId
) => {
  return api.get(
    `/loan-documents/loan/${loanId}`
  );
};

// =========================================================
// GET DOCUMENT BY ID
// GET /api/loan-documents/{documentId}
// =========================================================

export const getLoanDocumentById = (
  documentId
) => {
  return api.get(
    `/loan-documents/${documentId}`
  );
};

// =========================================================
// VIEW / DOWNLOAD DOCUMENT
// GET /api/loan-documents/download/{documentId}
// =========================================================

export const downloadLoanDocument = (
  documentId
) => {
  return api.get(
    `/loan-documents/download/${documentId}`,
    {
      responseType: "blob",
    }
  );
};

// =========================================================
// DELETE DOCUMENT
// DELETE /api/loan-documents/{documentId}
// =========================================================

export const deleteLoanDocument = (
  documentId
) => {
  return api.delete(
    `/loan-documents/${documentId}`
  );
};