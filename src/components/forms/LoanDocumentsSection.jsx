import DocumentUpload from "./DocumentUpload";

const LoanDocumentsSection = ({
  documents,
  isEditMode,
  hasExistingLoan,
  handleFileChange,
  removeFile,
}) => {
  const disabled =
    hasExistingLoan && !isEditMode;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Loan Documents
        </h3>

        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Upload the required documents for this loan application
        </p>
      </div>

      {/* Documents */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DocumentUpload
            title="Aadhaar Card"
            documentType="aadhaar"
            file={documents.aadhaar}
            required={!isEditMode}
            disabled={disabled}
            onFileChange={handleFileChange}
            onRemove={removeFile}
          />

          <DocumentUpload
            title="PAN Card"
            documentType="pan"
            file={documents.pan}
            required={!isEditMode}
            disabled={disabled}
            onFileChange={handleFileChange}
            onRemove={removeFile}
          />

          <DocumentUpload
            title="Ration Card"
            documentType="rationCard"
            file={documents.rationCard}
            required={!isEditMode}
            disabled={disabled}
            onFileChange={handleFileChange}
            onRemove={removeFile}
          />

          <DocumentUpload
            title="Photo"
            documentType="photo"
            file={documents.photo}
            required={false}
            disabled={disabled}
            onFileChange={handleFileChange}
            onRemove={removeFile}
          />
        </div>

        {/* Information */}
        <div className="mt-5 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 px-4 py-3">
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-5">
            <span className="font-semibold">
              Create:
            </span>{" "}
            Aadhaar, PAN and Ration Card are required.
            Photo is optional.
          </p>

          {isEditMode && (
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1.5 leading-5">
              <span className="font-semibold">
                Edit:
              </span>{" "}
              Existing documents are preserved.
              Upload a new document only if you want
              to replace or add it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDocumentsSection;