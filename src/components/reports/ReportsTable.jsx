const ReportsTable = ({ payments }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-8">
      <h2 className="text-2xl font-semibold mb-6">
        Recent Payments
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b text-left">
              <th className="w-20 py-3 px-4">S.no</th>
              <th className="w-64 py-3 px-4">Customer</th>
              <th className="w-48 py-3 px-4 text-right">Amount</th>
              <th className="w-48 py-3 px-4 text-center">Date</th>
              <th className="w-40 py-3 px-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment, index) => (
              <tr
                key={payment.id}
                className="border-b hover:bg-slate-50"
              >
                {/* 🔥 Serial number instead of DB id */}
                <td className="py-3 px-4">
                  {index + 1}
                </td>

                <td className="py-3 px-4">
                  {payment.customerName}
                </td>

                <td className="py-3 px-4 text-right font-medium">
                  ₹{payment.amount.toLocaleString()}
                </td>

                <td className="py-3 px-4 text-center">
                  {payment.paymentDate}
                </td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-4 py-1 rounded-full text-sm ${
                      payment.status === "SUCCESS"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportsTable;
