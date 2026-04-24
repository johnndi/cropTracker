import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SummaryWidget } from "../../Components/common/SummaryWidget";
import { FieldCard } from "../../Components/cards/FieldCard";
import { mockFields } from "../../mockData";
import { useAuthStore } from "../../store/authStore";

export const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const agentName = user?.name || "Agent";
  const [fields, setFields] = useState(
    mockFields.filter((f) => f.agent === agentName)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Calculate statistics
  const stats = {
    total: fields.length,
    active: fields.filter((f) => f.status === "Active").length,
    atRisk: fields.filter((f) => f.status === "At Risk").length,
    completed: fields.filter((f) => f.status === "Completed").length,
  };

  const handleUpdateStage = (fieldId, newStage) => {
    setFields(
      fields.map((f) =>
        f.id === fieldId ? { ...f, currentStage: newStage } : f
      )
    );
  };

  const handleAddObservation = (fieldId, observation) => {
    setFields(
      fields.map((f) =>
        f.id === fieldId ? { ...f, notes: observation } : f
      )
    );
    alert(`Observation added for field ${fieldId}: ${observation}`);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome, {agentName}
          </h1>
          <p className="text-gray-600">Update your assigned fields and add observations</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryWidget title="Total Assigned" count={stats.total} icon="🌾" color="blue" />
        <SummaryWidget title="Active" count={stats.active} icon="📋" color="green" />
        <SummaryWidget title="At Risk" count={stats.atRisk} icon="⚠️" color="yellow" />
        <SummaryWidget title="Ready to Harvest" count={stats.completed} icon="✅" color="blue" />
      </div>

      {/* Assigned Fields */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Fields</h2>
        
        {fields.length > 0 ? (
          <div className="max-w-3xl space-y-4">
            {fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                userRole="agent"
                onUpdateStage={handleUpdateStage}
                onAddObservation={handleAddObservation}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No fields assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
