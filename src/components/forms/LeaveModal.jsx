import { AlertTriangle, X } from "lucide-react";

const LeaveModal = ({
  show,
  onStay,
  onConfirmLeave,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] px-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
            <AlertTriangle
              size={19}
              className="text-amber-600 dark:text-amber-400"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Leave without saving?
            </h3>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              You have unsaved changes.
            </p>
          </div>

          <button
            type="button"
            onClick={onStay}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-6">
            If you go back now, all changes will be discarded.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onStay}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Stay & Edit
          </button>

          <button
            type="button"
            onClick={onConfirmLeave}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
          >
            Yes, Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;