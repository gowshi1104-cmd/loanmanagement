import { FileText, Upload, CheckCircle2, X } from "lucide-react";

const DocumentUpload = ({
  title,
  documentType,
  file,
  required = true,
  disabled = false,
  onFileChange,
  onRemove,
}) => {
  return (
    <div className="w-full">
      <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-200">
        {title}{" "}
        {required ? (
          <span className="text-red-500">*</span>
        ) : (
          <span className="font-normal text-slate-400 dark:text-slate-500">
            (Optional)
          </span>
        )}
      </label>

      <div
        className={`relative min-h-[92px] w-full rounded-lg border transition-all ${
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-70 dark:border-slate-700 dark:bg-slate-800"
            : file
            ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30"
            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700 dark:hover:bg-slate-800"
        }`}
      >
        {file ? (
          <div className="flex min-h-[92px] items-center justify-between gap-3 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <CheckCircle2
                  size={18}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {file.name}
                </p>

                <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Uploaded •{" "}
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(documentType)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                title="Remove"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <label
            className={`block min-h-[92px] ${
              disabled
                ? "cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <div className="flex min-h-[92px] items-center gap-4 px-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  disabled
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "bg-blue-50 dark:bg-blue-950/40"
                }`}
              >
                <Upload
                  size={19}
                  className={
                    disabled
                      ? "text-slate-400 dark:text-slate-500"
                      : "text-blue-600 dark:text-blue-400"
                  }
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Upload {title}
                </p>

                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  PDF, JPG, JPEG, PNG • Max 5 MB
                </p>
              </div>

              <div className="ml-auto shrink-0">
                <span
                  className={`inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium ${
                    disabled
                      ? "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                      : "border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  Choose File
                </span>
              </div>
            </div>

            {!disabled && (
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) =>
                  onFileChange(e, documentType)
                }
              />
            )}
          </label>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;