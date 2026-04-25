import { useNavigate } from "react-router-dom";
import { SummaryWidget } from "../../Components/common/SummaryWidget";
import { FieldCard } from "../../Components/cards/FieldCard";
import { useAuthStore } from "../../store/authStore";
import { useState, useEffect } from "react";

const API = "http://localhost:4000";

export const AgentDashboard = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const agentName = user?.name || "Agent";

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API}/api/agent/fields`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch fields");
        }

        // Response shape: { agent, count, fields: [...] }
        // Flatten field.agent from { id, name, email } to just the name string
        // so FieldCard (which expects a string) does not throw
        const normalised = data.fields.map((f) => ({
          ...f,
          agent: f.agent?.name ?? f.agent,
        }));

        setFields(normalised);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [user]);

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    logout();
    navigate("/login");
  };

  const handleUpdateStage = async (fieldId, newStage) => {
    try {
      const res = await fetch(`${API}/api/fields/${fieldId}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ stage: newStage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update stage");
      }

      // Response shape: { observation, field }
      // Flatten agent on the returned field too before merging into state
      const updatedField = {
        ...data.field,
        agent: data.field.agent?.name ?? data.field.agent,
      };

      setFields((prev) =>
        prev.map((f) => (f.id === fieldId ? { ...f, ...updatedField } : f))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddObservation = async (fieldId, notes) => {
    try {
      const res = await fetch(`${API}/api/fields/${fieldId}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ notes }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add observation");
      }

      // Increment the observation count on the matching field
      setFields((prev) =>
        prev.map((f) =>
          f.id === fieldId
            ? { ...f, _count: { observations: f._count.observations + 1 } }
            : f
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const stats = {
    total:     fields.length,
    active:    fields.filter((f) => f.status === "Active").length,
    atRisk:    fields.filter((f) => f.status === "At Risk").length,
    completed: fields.filter((f) => f.status === "Completed").length,
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome, {agentName}
          </h1>
          <p className="text-gray-600">
            Update your assigned fields and add observations
          </p>
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
        <SummaryWidget title="Total Assigned" count={stats.total}     icon="🌾" color="blue"   />
        <SummaryWidget title="Active"          count={stats.active}    icon="📋" color="green"  />
        <SummaryWidget title="At Risk"         count={stats.atRisk}    icon="⚠️" color="yellow" />
        <SummaryWidget title="Harvest Ready"   count={stats.completed} icon="✅" color="blue"   />
      </div>

      {/* Fields */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Fields</h2>

        {loading && (
          <p className="text-gray-500">Loading fields…</p>
        )}

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!loading && !error && fields.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No fields assigned yet</p>
          </div>
        )}

        {!loading && fields.length > 0 && (
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
        )}
      </div>
    </div>
  );
};