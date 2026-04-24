import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SummaryWidget } from "../../Components/common/SummaryWidget";
import { KanbanBoard } from "../../Components/cards/KanbanBoard";
import { Modal } from "../../Components/common/Modal";
import { mockFields } from "../../mockData";
import { useAuthStore } from "../../store/authStore";

export const AdminDashboard = () => {
  const [fields, setFields] = useState(mockFields);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  
  const navigate = useNavigate();
  const { user, logout, addAdmin, getAgents } = useAuthStore();
  const agents = useMemo(() => getAgents(), []);

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

  // Add new field
  const handleAddField = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newField = {
      id: Math.max(...fields.map((f) => f.id), 0) + 1,
      name: formData.get("name"),
      cropType: formData.get("cropType"),
      plantingDate: formData.get("plantingDate"),
      currentStage: "Planted",
      status: "Active",
      notes: "",
      agent: formData.get("agent"),
      lastUpdate: "Just now",
    };
    setFields([...fields, newField]);
    setShowAddFieldModal(false);
  };

  // Remove field
  const handleRemoveField = (fieldId) => {
    if (confirm("Are you sure you want to remove this field?")) {
      setFields(fields.filter((f) => f.id !== fieldId));
    }
  };

  // Assign agent to field
  const handleAssignAgent = (e) => {
    e.preventDefault();
    const newAgent = e.target.agent.value;
    setFields(
      fields.map((f) =>
        f.id === selectedFieldId ? { ...f, agent: newAgent } : f
      )
    );
    setShowAgentModal(false);
    setSelectedFieldId(null);
  };

  // Manage field
  const handleManageField = (fieldId) => {
    setSelectedFieldId(fieldId);
    setShowAgentModal(true);
  };

  // View field details
  const handleViewField = (fieldId) => {
    alert(`View details for field ${fieldId}`);
  };

  // Add admin
  const handleAddAdmin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      addAdmin(
        formData.get("name"),
        formData.get("email"),
        formData.get("password")
      );
      alert("Admin added successfully!");
      setShowAddAdminModal(false);
      e.target.reset();
    } catch (err) {
      alert(err.message);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header with Action Buttons */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddAdminModal(true)}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition"
          >
            + Add Admin
          </button>
          <button
            onClick={() => setShowAddFieldModal(true)}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition"
          >
            + Add Field
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryWidget title="Total Fields" count={stats.total} icon="🌾" color="blue" />
        <SummaryWidget title="Active" count={stats.active} icon="📋" color="green" />
        <SummaryWidget title="At Risk" count={stats.atRisk} icon="⚠️" color="yellow" />
        <SummaryWidget title="Completed" count={stats.completed} icon="✅" color="blue" />
      </div>

      {/* Kanban Board */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Field Status Board</h2>
        <KanbanBoard
          fields={fields}
          onUpdate={handleManageField}
          onView={handleViewField}
          onRemove={handleRemoveField}
          userRole="admin"
        />
      </div>

      {/* Add Field Modal */}
      <Modal
        isOpen={showAddFieldModal}
        title="Add New Field"
        onClose={() => setShowAddFieldModal(false)}
      >
        <form onSubmit={handleAddField} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Wheat Field A"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Crop Type
            </label>
            <select
              name="cropType"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select crop type...</option>
              <option value="Wheat">Wheat</option>
              <option value="Corn">Corn</option>
              <option value="Rice">Rice</option>
              <option value="Barley">Barley</option>
              <option value="Soybean">Soybean</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planting Date
            </label>
            <input
              type="date"
              name="plantingDate"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Agent
            </label>
            <select
              name="agent"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an agent...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.name}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
            >
              Add Field
            </button>
            <button
              type="button"
              onClick={() => setShowAddFieldModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Agent Modal */}
      <Modal
        isOpen={showAgentModal}
        title={`Reassign Agent - ${selectedField?.name}`}
        onClose={() => {
          setShowAgentModal(false);
          setSelectedFieldId(null);
        }}
      >
        <form onSubmit={handleAssignAgent} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Current Agent: <span className="font-semibold">{selectedField?.agent}</span>
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select New Agent
            </label>
            <select
              name="agent"
              defaultValue={selectedField?.agent}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an agent...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.name}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
            >
              Reassign
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAgentModal(false);
                setSelectedFieldId(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        isOpen={showAddAdminModal}
        title="Add New Admin"
        onClose={() => setShowAddAdminModal(false)}
      >
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Jane Admin"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g., admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
            >
              Add Admin
            </button>
            <button
              type="button"
              onClick={() => setShowAddAdminModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
