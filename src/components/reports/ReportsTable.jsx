const ReportsTable = ({ payments }) => {

  return (

    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6 mt-8">

      <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-slate-100">

        Recent Payments

      </h2>

      <div className="overflow-x-auto">

        <table className="w-full table-fixed">

          <thead>

            <tr className="border-b border-slate-200 dark:border-slate-700 text-left">

              <th className="w-20 py-3 px-4 text-slate-700 dark:text-slate-300">
                S.no
              </th>

              <th className="w-64 py-3 px-4 text-slate-700 dark:text-slate-300">
                Customer
              </th>

              <th className="w-48 py-3 px-4 text-right text-slate-700 dark:text-slate-300">
                Amount
              </th>

              <th className="w-48 py-3 px-4 text-center text-slate-700 dark:text-slate-300">
                Date
              </th>

              <th className="w-40 py-3 px-4 text-center text-slate-700 dark:text-slate-300">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {payments.map((payment, index) => (

              <tr

                key={payment.id}

                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"

              >

                {/* 🔥 Serial number instead of DB id */}

                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">

                  {index + 1}

                </td>

                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">

                  {payment.customerName}

                </td>

                <td className="py-3 px-4 text-right font-medium text-slate-800 dark:text-slate-200">

                  ₹{payment.amount.toLocaleString()}

                </td>

                <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300">

                  {payment.paymentDate}

                </td>

                <td className="py-3 px-4 text-center">

                  <span

                    className={`px-4 py-1 rounded-full text-sm ${
                      payment.status === "SUCCESS"
                        ? "bg-green-100 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : payment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
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