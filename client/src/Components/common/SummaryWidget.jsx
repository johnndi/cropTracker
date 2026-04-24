export const SummaryWidget = ({ title, count, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${colorClasses[color]} flex items-center gap-3`}
    >
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm font-medium opacity-75">{title}</p>
        <p className="text-2xl font-bold">{count}</p>
      </div>
    </div>
  );
};
