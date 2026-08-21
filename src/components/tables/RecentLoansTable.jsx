const RecentLoansTable = ({ loans = [] }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "ACTIVE":
        return "bg-blue-100 text-blue-700";

      case "COMPLETED":
      case "CLOSED":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Recent Loan Applications
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest loan applications across the organization
          </p>
        </div>

        <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
          Latest {loans.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">

          {/* Table Header */}
          <thead className="border-b border-slate-200">
            <tr className="text-xs uppercase tracking-wide text-slate-500">

              <th className="px-3 py-3 font-semibold">
                S.No
              </th>

              <th className="px-3 py-3 font-semibold">
                Loan ID
              </th>

              <th className="px-3 py-3 font-semibold">
                Customer
              </th>

              <th className="px-3 py-3 font-semibold">
                Amount
              </th>

              <th className="px-3 py-3 font-semibold">
                Created By
              </th>

              <th className="px-3 py-3 font-semibold">
                Status
              </th>

              <th className="px-3 py-3 font-semibold">
                Date
              </th>

            </tr>
          </thead>

          {/* Table Body */}
          <tbody>

            {loans.length > 0 ? (

              loans.map((loan, index) => (

                <tr
                  key={loan.loanId || index}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >

                  {/* S.No */}
                  <td className="px-3 py-4 text-sm text-slate-500">
                    {index + 1}
                  </td>

                  {/* Loan ID */}
                  <td className="px-3 py-4">
                    <span className="font-semibold text-slate-700">
                      {loan.loanId || "-"}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="px-3 py-4">
                    <div>
                      <p className="font-medium text-slate-700">
                        {loan.customerName || "-"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {loan.customerId || "-"}
                      </p>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-3 py-4">
                    <span className="font-semibold text-slate-700">
                      ₹
                      {Number(
                        loan.loanAmount || 0
                      ).toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* Created By */}
                  <td className="px-3 py-4 text-sm text-slate-600">
                    {loan.createdBy || (
                      <span className="text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        loan.status
                      )}`}
                    >
                      {loan.status || "-"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-3 py-4 text-sm text-slate-500">
                    {formatDate(loan.loanDate)}
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="7"
                  className="py-12 text-center"
                >
                  <div className="text-sm font-medium text-slate-500">
                    No recent loans found
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Recent loan applications will appear here.
                  </p>
                </td>
              </tr>

            )}

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentLoansTable;