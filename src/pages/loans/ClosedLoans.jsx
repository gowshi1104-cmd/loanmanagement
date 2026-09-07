import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Eye,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const ClosedLoans = () => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClosedLoans = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/loans");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const closed = data.filter((loan) => {
        const status = String(loan?.status || "")
          .trim()
          .toUpperCase();

        return status === "CLOSED";
      });

      setLoans(closed);
      setFilteredLoans(closed);

      if (showToast) {
        toast.success("Closed loans refreshed");
      }
    } catch (error) {
      console.error("Failed to fetch closed loans:", error);

      if (error.response?.status === 401) {
        toast.error("Authentication required. Please login again.");
      } else if (error.response?.status === 403) {
        toast.error(
          error.response?.data ||
            "You don't have permission to view loans"
        );
      } else {
        toast.error("Failed to load closed loans");
      }

      setLoans([]);
      setFilteredLoans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClosedLoans();
  }, []);

  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      setFilteredLoans(loans);
      return;
    }

    const result = loans.filter((loan) => {
      return (
        String(loan?.loanId || "")
          .toLowerCase()
          .includes(value) ||
        String(loan?.customerId || "")
          .toLowerCase()
          .includes(value) ||
        String(loan?.customerName || "")
          .toLowerCase()
          .includes(value) ||
        String(loan?.status || "")
          .toLowerCase()
          .includes(value)
      );
    });

    setFilteredLoans(result);
  }, [search, loans]);

  const formatAmount = (amount) => {
    if (amount === null || amount === undefined) {
      return "₹0.00";
    }

    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-slate-50 p-3 dark:bg-slate-950 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl min-w-0">

        <div className="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
              Closed Loans
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              View all loans that have been closed
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchClosedLoans(true)}
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
          >
            {refreshing ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={17} />
            )}

            Refresh
          </button>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:mb-5 sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">

            <div className="relative w-full md:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Loan ID, Customer ID or Name..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-blue-900"
              />
            </div>

            <div className="text-sm text-slate-500 dark:text-slate-400 md:shrink-0">
              Showing{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {filteredLoans.length}
              </span>{" "}
              closed loan
              {filteredLoans.length !== 1 ? "s" : ""}
            </div>

          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center px-4 sm:min-h-[300px]">
              <div className="flex items-center gap-3 text-center text-sm text-slate-500 dark:text-slate-400">
                <Loader2
                  size={20}
                  className="shrink-0 animate-spin text-blue-600"
                />

                Loading closed loans...
              </div>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-4 text-center sm:min-h-[300px] sm:px-6">

              <div className="mb-3 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                <LockKeyhole
                  size={28}
                  className="text-slate-400 dark:text-slate-500"
                />
              </div>

              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                No closed loans found
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                There are no closed loans matching your search.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] text-left">

                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                  <tr>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Loan ID
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Customer
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Loan Amount
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Tenure
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      EMI
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Closed Date
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </th>

                    <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {filteredLoans.map((loan) => (
                    <tr
                      key={loan.id || loan.loanId}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {loan.loanId || "-"}
                        </span>

                        <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          {formatDate(loan.loanDate)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="whitespace-nowrap font-medium text-slate-800 dark:text-slate-100">
                          {loan.customerName || "-"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {loan.customerId || "-"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">
                        {formatAmount(loan.loanAmount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {loan.tenureMonths
                          ? `${loan.tenureMonths} months`
                          : "-"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700 dark:text-slate-200">
                        {formatAmount(loan.emiAmount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {formatDate(
                          loan.closedDate ||
                          loan.closingDate ||
                          loan.updatedAt
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <LockKeyhole size={14} />
                          {loan.status || "CLOSED"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/loans/${loan.id}`}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                        >
                          <Eye size={15} />
                          View
                        </Link>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ClosedLoans;