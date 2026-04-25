import { FieldCard } from "./FieldCard";

export const KanbanBoard = ({ fields, onUpdate, onView, onRemove, userRole = "admin" }) => {
  const groupedFields = {
    Active:    fields.filter((f) => f.status === "Active"),
    "At Risk": fields.filter((f) => f.status === "At Risk"),
    Completed: fields.filter((f) => f.status === "Completed"),
  };

  const statusConfig = {
    Active:    { icon: "📋", color: "green",  count: groupedFields.Active.length },
    "At Risk": { icon: "⚠️", color: "yellow", count: groupedFields["At Risk"].length },
    Completed: { icon: "✅", color: "blue",   count: groupedFields.Completed.length },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {Object.entries(groupedFields).map(([status, statusFields]) => (
        <div key={status} className="bg-gray-50 rounded-lg p-4">
          {/* Column Header */}
          <div className="mb-4 pb-3 border-b-2 border-gray-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{statusConfig[status].icon}</span>
              <h2 className="font-bold text-gray-900">{status}</h2>
              <span className="ml-auto bg-gray-300 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                {statusConfig[status].count}
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {statusFields.length > 0 ? (
              statusFields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  onUpdate={onUpdate}
                  onView={onView}
                  onRemove={onRemove}
                  userRole={userRole}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No fields</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};