import React from "react";

import {
  Search,
  UserRound,
  Phone,
  MapPin,
  Users,
  CreditCard,
  BriefcaseBusiness,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";

const CustomerSection = ({
  loan,
  handleCustomerIdChange,
  handleCustomerIdKeyDown,
  fetchCustomer,
  loanHistoryLoading,
  hasExistingLoan,
  existingLoans = [],
  isEditMode,
}) => {
  const customerLoaded =
    Boolean(loan?.customerId) &&
    Boolean(loan?.customerName);

  const activeLoans = existingLoans.filter(
    (item) =>
      item?.status === "APPROVED" ||
      item?.status === "ACTIVE"
  );

  const closedLoans = existingLoans.filter(
    (item) =>
      item?.status === "CLOSED" ||
      item?.status === "COMPLETED"
  );

  const handleSearch = () => {
    if (!loan?.customerId?.trim()) return;
    fetchCustomer(loan.customerId.trim());
  };

  const formatCurrency = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    return `₹ ${Number(value).toLocaleString("en-IN")}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";

    try {
      return new Date(
        `${value}T00:00:00`
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          CUSTOMER SEARCH
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Search
                size={18}
                className="text-blue-600 dark:text-blue-400"
              />

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Customer Search
              </h3>
            </div>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Search using Customer ID or mobile number
            </p>
          </div>

          {customerLoaded && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 size={13} />
              Active Customer
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />

            <input
              type="text"
              value={loan?.customerId || ""}
              onChange={handleCustomerIdChange}
              onKeyDown={handleCustomerIdKeyDown}
              placeholder="Customer ID / Mobile"
              disabled={
                hasExistingLoan && !isEditMode
              }
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950/40 dark:disabled:bg-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={
              !loan?.customerId?.trim() ||
              loanHistoryLoading ||
              (hasExistingLoan && !isEditMode)
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
          >
            {loanHistoryLoading ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Search size={17} />
            )}

            {loanHistoryLoading
              ? "Searching..."
              : "Search Customer"}
          </button>
        </div>
      </div>

      {/* =====================================================
          CUSTOMER INFORMATION
      ====================================================== */}

      {customerLoaded ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            {/* HEADER */}

            <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-700">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
                    <UserRound
                      size={22}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Customer Information
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Verified customer profile
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fetchCustomer(
                      loan.customerId
                    )
                  }
                  disabled={loanHistoryLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {loanHistoryLoading ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Search size={14} />
                  )}

                  Refresh
                </button>
              </div>
            </div>

            {/* CUSTOMER PROFILE */}

            <div className="p-6">
              <div className="mb-6 flex flex-col gap-5 rounded-2xl border border-slate-100 bg-slate-50 p-5 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                    {loan.customerName
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {loan.customerName}
                    </p>

                    <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                      {loan.customerId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-950/40">
                  <CheckCircle2
                    size={17}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                  <div>
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Active Customer
                    </p>

                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Customer verified
                    </p>
                  </div>
                </div>
              </div>

              {/* DETAILS */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-2">
                    <CreditCard
                      size={15}
                      className="text-blue-500 dark:text-blue-400"
                    />

                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Customer ID
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {loan.customerId || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-2">
                    <Phone
                      size={15}
                      className="text-blue-500 dark:text-blue-400"
                    />

                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Mobile
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {loan.customerPhone ||
                      loan.phone ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-2">
                    <Users
                      size={15}
                      className="text-blue-500 dark:text-blue-400"
                    />

                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Group / Branch
                    </span>
                  </div>

                  <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                    {loan.groupName ||
                      loan.groupId ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin
                      size={15}
                      className="text-blue-500 dark:text-blue-400"
                    />

                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Address
                    </span>
                  </div>

                  <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                    {loan.customerAddress ||
                      loan.address ||
                      "—"}
                  </p>
                </div>
              </div>

              {/* CUSTOMER FINANCIAL SUMMARY */}

              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Occupation
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <BriefcaseBusiness
                      size={15}
                      className="text-slate-400 dark:text-slate-500"
                    />

                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {loan.occupation ||
                        "Salaried"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Monthly Income
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(
                      loan.monthlyIncome
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Credit Score
                  </p>

                  <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {loan.creditScore || "Good"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Customer Status
                  </p>

                  <p className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Active
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              LOAN HISTORY
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between dark:border-slate-700">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />

                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    Existing Loans
                  </h3>
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Recent loans associated with this
                  customer
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {existingLoans.length} Total Loans
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
              {/* ACTIVE */}

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Active Loans
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {activeLoans.length}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                    <ShieldCheck
                      size={19}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* CLOSED */}

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Closed Loans
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-200">
                      {closedLoans.length}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-700">
                    <CheckCircle2
                      size={19}
                      className="text-slate-500 dark:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* TOTAL */}

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Total Loans
                    </p>

                    <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {existingLoans.length}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/50">
                    <CreditCard
                      size={19}
                      className="text-blue-600 dark:text-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LOAN TABLE */}

            {existingLoans.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-700">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          Loan ID
                        </th>

                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          Loan Type
                        </th>

                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          Amount
                        </th>

                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          Date
                        </th>

                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          View
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {existingLoans
                        .slice(0, 5)
                        .map((item, index) => {
                          const status =
                            item?.status ||
                            "PENDING";

                          return (
                            <tr
                              key={
                                item?.loanId ||
                                item?.id ||
                                index
                              }
                              className="transition hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                  {item?.loanId ||
                                    item?.id ||
                                    `LN${index + 1}`}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                  {item?.loanPurpose ||
                                    item?.purpose ||
                                    "Personal Loan"}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  {formatCurrency(
                                    item?.loanAmount ||
                                      item?.amount
                                  )}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  {formatDate(
                                    item?.loanDate ||
                                      item?.createdDate
                                  )}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                    status ===
                                      "APPROVED" ||
                                    status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                      : status ===
                                          "REJECTED"
                                        ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                        : status ===
                                              "CLOSED" ||
                                            status ===
                                              "COMPLETED"
                                          ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                                  }`}
                                >
                                  {status}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  View

                                  <ArrowRight
                                    size={13}
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {existingLoans.length > 5 && (
                  <div className="flex justify-center border-t border-slate-100 px-6 py-4 dark:border-slate-700">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View All Loans

                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* NO LOANS */}

            {existingLoans.length === 0 && (
              <div className="border-t border-slate-100 px-6 py-10 text-center dark:border-slate-700">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <CreditCard
                    size={21}
                    className="text-slate-400 dark:text-slate-500"
                  />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  No Existing Loans
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This customer has no previous loan
                  records.
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              EXISTING LOAN WARNING
          ================================================== */}

          {hasExistingLoan && !isEditMode && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                  <AlertTriangle
                    size={18}
                    className="text-amber-600 dark:text-amber-400"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    Existing Loan Found
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                    This customer already has an existing
                    loan. Loan details cannot be changed
                    while an existing loan is active.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* ===================================================
           EMPTY CUSTOMER STATE
        ==================================================== */

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex max-w-md flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40">
              <UserRound
                size={27}
                className="text-blue-500 dark:text-blue-400"
              />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-100">
              Search Customer
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Enter a Customer ID or mobile number
              above to load customer information,
              existing loans and eligibility details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSection;