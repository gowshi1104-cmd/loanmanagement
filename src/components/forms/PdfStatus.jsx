import {
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";

const PdfStatus = ({
  pdfGenerating = false,
  pdfDownloaded = false,
}) => {
  if (pdfGenerating) {
    return (
      <div className="mt-5 rounded-2xl border border-blue-100 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
            <Loader2
              size={20}
              className="animate-spin text-blue-600 dark:text-blue-400"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Generating PDF
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Please wait while the loan application PDF is being generated.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (pdfDownloaded) {
    return (
      <div className="mt-5 rounded-2xl border border-emerald-100 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
            <CheckCircle2
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              PDF Downloaded
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Loan application PDF has been downloaded successfully.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <FileText
            size={20}
            className="text-slate-500 dark:text-slate-400"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Loan Application PDF
          </p>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            PDF will be generated after the loan is successfully saved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfStatus;