import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const LoanStatusChart = ({ loans = [] }) => {
  const approved = loans.filter(
    (loan) => loan.status === "APPROVED"
  ).length;

  const pending = loans.filter(
    (loan) => loan.status === "PENDING"
  ).length;

  const rejected = loans.filter(
    (loan) => loan.status === "REJECTED"
  ).length;

  const data = [
    {
      status: "Approved",
      count: approved,
    },
    {
      status: "Pending",
      count: pending,
    },
    {
      status: "Rejected",
      count: rejected,
    },
  ];

  const COLORS = [
    "#22c55e", // Green
    "#facc15", // Yellow
    "#ef4444", // Red
  ];

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-5">
        Loan Status Report
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="status" />

          <YAxis allowDecimals={false} />

          <Tooltip />

          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoanStatusChart;