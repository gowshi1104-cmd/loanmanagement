import {
  CheckCircle2,
  FileText,
} from "lucide-react";

const DocumentStatus = ({ documents }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <FileText
            size={18}
            className="text-orange-600 dark:text-orange-400"
          />

          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            Document Status
          </h3>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Required document checklist
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {[
          {
            label: "Aadhaar Card",
            file: documents.aadhaar,
            required: true,
          },
          {
            label: "PAN Card",
            file: documents.pan,
            required: true,
          },
          {
            label: "Address Proof",
            file: documents.rationCard,
            required: true,
          },
          {
            label: "Customer Photo",
            file: documents.photo,
            required: false,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-5 py-3.5"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  item.file
                    ? "bg-emerald-100 dark:bg-emerald-950/40"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                {item.file ? (
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                ) : (
                  <FileText
                    size={16}
                    className="text-slate-400 dark:text-slate-500"
                  />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.label}
                </p>

                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {item.required
                    ? "Required"
                    : "Optional"}
                </p>
              </div>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                item.file
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
              }`}
            >
              {item.file ? "UPLOADED" : "PENDING"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentStatus;