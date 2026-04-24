export const StatusBadge = ({ status }) => {
  const statusStyles = {
    Active: "bg-green-100 text-green-800 border-green-300",
    "At Risk": "bg-yellow-100 text-yellow-800 border-yellow-300",
    Completed: "bg-blue-100 text-blue-800 border-blue-300",
  };

  const statusIcons = {
    Active: "📋",
    "At Risk": "⚠️",
    Completed: "✅",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${
        statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-300"
      }`}
    >
      {statusIcons[status]} {status}
    </span>
  );
};
