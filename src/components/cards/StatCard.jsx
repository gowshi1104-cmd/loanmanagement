const StatCard = ({
  title,
  value,
  icon: Icon,
  iconBg = "bg-blue-100",
  iconColor = "text-blue-600",
  change,
  changeType = "positive",
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">{value}</h2>

          {change && (
            <p
              className={`mt-3 text-sm font-medium ${
                changeType === "positive" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {change}
            </p>
          )}
        </div>

        <div
          className={`h-14 w-14 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          {Icon && <Icon size={28} className={iconColor} />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
