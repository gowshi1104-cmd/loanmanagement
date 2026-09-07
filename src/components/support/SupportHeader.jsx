import React from "react";
import {
  HelpCircle,
  Search,
  ShieldCheck,
} from "lucide-react";

const SupportHeader = ({ search, setSearch }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4 text-white shadow-lg sm:px-6 sm:py-5">
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />
      <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 sm:h-12 sm:w-12">
            <HelpCircle size={25} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                Help & Support
              </h1>

              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                SUPPORT
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-300 dark:text-slate-300 sm:text-sm">
              Get assistance, raise tickets and find quick answers.
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-md items-center gap-2 sm:gap-3">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search help topics..."
              className="w-full rounded-xl border border-white/10 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-white/25 focus:bg-white/15 sm:pr-4"
            />
          </div>

          <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 sm:flex">
            <ShieldCheck size={16} className="text-emerald-300" />
            <span className="text-xs font-medium text-slate-300">
              Secure Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHeader;