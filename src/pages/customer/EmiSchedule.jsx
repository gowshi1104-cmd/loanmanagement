import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock3,
  AlertCircle,
} from "lucide-react";

import {
  getMyEmiSchedule,
} from "../../services/customerService";

const EmiSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const response =
        await getMyEmiSchedule();

      setSchedule(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "EMI Schedule Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (
      String(status || "").toUpperCase()
    ) {
      case "PAID":
      case "SUCCESS":
        return "bg-green-100 text-green-700";

      case "UPCOMING":
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "OVERDUE":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-500">
        Loading EMI schedule...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays
          size={30}
          className="text-blue-600"
        />

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            EMI Schedule
          </h1>

          <p className="text-slate-500">
            Track your paid and upcoming EMIs.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow border overflow-hidden">
        {schedule.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            No EMI schedule available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Loan ID
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    EMI No
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    EMI Date
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    EMI Amount
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Paid Amount
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Due Amount
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {schedule.map((emi, index) => (
                  <tr
                    key={
                      emi.id ||
                      emi.emiId ||
                      index
                    }
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {emi.loanId || "-"}
                    </td>

                    <td className="px-6 py-4">
                      {emi.emiNumber ??
                        emi.emiNo ??
                        index + 1}
                    </td>

                    <td className="px-6 py-4">
                      {emi.emiDate ||
                        emi.dueDate ||
                        "-"}
                    </td>

                    <td className="px-6 py-4">
                      ₹
                      {Number(
                        emi.emiAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      ₹
                      {Number(
                        emi.paidAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      ₹
                      {Number(
                        emi.dueAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          emi.status
                        )}`}
                      >
                        {String(
                          emi.status || ""
                        ).toUpperCase() ===
                          "PAID" && (
                          <CheckCircle size={13} />
                        )}

                        {String(
                          emi.status || ""
                        ).toUpperCase() ===
                          "UPCOMING" && (
                          <Clock3 size={13} />
                        )}

                        {String(
                          emi.status || ""
                        ).toUpperCase() ===
                          "OVERDUE" && (
                          <AlertCircle
                            size={13}
                          />
                        )}

                        {emi.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmiSchedule;