import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SummaryWidget } from "../../Components/common/SummaryWidget";
import { KanbanBoard } from "../../Components/cards/KanbanBoard";
import { Modal } from "../../Components/common/Modal";
import { useAuthStore } from "../../store/authStore";

const API = "http://localhost:4000";

export const AdminDashboard = () => {
  const [fields, setFields]                   = useState([]);
  const [agents, setAgents]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showAddFieldModal, setShowAddFieldModal]   = useState(false);
  const [showAgentModal, setShowAgentModal]         = useState(false);
  const [showAddAgentModal, setShowAddAgentModal]   = useState(false);
  const [showAddAdminModal, setShowAddAdminModal]   = useState(false);
  const [showViewModal, setShowViewModal]           = useState(false);
  const [selectedFieldId, setSelectedFieldId]       = useState(null);
  const [viewField, setViewField]                   = useState(null);
  const [formError, setFormError]                   = useState("");

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // ── Fetch all fields on mount ─────────────────────────────────────────────
  useEffect(() => {
    fetchFields();
    fetchAgents();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API}/api/fields`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch fields");

      // Normalise agent object → name string for components that expect a string
      const normalised = data.fields.map((f) => ({
        ...f,
        agent: f.agent?.name ?? f.agent,
      }));
      setFields(normalised);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res  = await fetch(`${API}/api/users?role=AGENT`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch agents");
      setAgents(data.users);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API}/api/auth/logout`, { method: "POST", credentials: "include" });
    logout();
    navigate("/login");
  };

  const stats = {
    total:     fields.length,
    active:    fields.filter((f) => f.status === "Active").length,
    atRisk:    fields.filter((f) => f.status === "At Risk").length,
    completed: fields.filter((f) => f.status === "Completed").length,
  };

  // ── Add Field ─────────────────────────────────────────────────────────────
  const handleAddField = async (e) => {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.target);

    const payload = {
      name:         formData.get("name"),
      cropType:     formData.get("cropType"),
      plantingDate: formData.get("plantingDate"),
      agentName:    formData.get("agentName"), // backend resolves name → id
    };

    try {
      const res  = await fetch(`${API}/api/fields`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create field");

      // Add new field to state (flatten agent object)
      setFields((prev) => [
        ...prev,
        { ...data.field, agent: data.field.agent?.name ?? data.field.agent },
      ]);
      setShowAddFieldModal(false);
      e.target.reset();
    } catch (err) {
      setFormError(err.message);
    }
  };

  // ── Remove Field ──────────────────────────────────────────────────────────
  const handleRemoveField = async (fieldId) => {
    if (!confirm("Are you sure you want to remove this field?")) return;
    try {
      const res = await fetch(`${API}/api/fields/${fieldId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete field");
      }
      setFields((prev) => prev.filter((f) => f.id !== fieldId));
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Reassign Agent ────────────────────────────────────────────────────────
  const handleAssignAgent = async (e) => {
    e.preventDefault();
    setFormError("");
    const agentName = e.target.agentName.value;

    try {
      const res  = await fetch(`${API}/api/fields/${selectedFieldId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ agentName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reassign agent");

      setFields((prev) =>
        prev.map((f) =>
          f.id === selectedFieldId
            ? { ...f, agent: data.field.agent?.name ?? data.field.agent }
            : f
        )
      );
      setShowAgentModal(false);
      setSelectedFieldId(null);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // ── View Field (with observations) ────────────────────────────────────────
  const handleViewField = async (fieldId) => {
    try {
      const res  = await fetch(`${API}/api/fields/${fieldId}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch field");
      setViewField(data.field);
      setShowViewModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Add Agent ─────────────────────────────────────────────────────────────
  const handleAddAgent = async (e) => {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.target);

    const payload = {
      name:     formData.get("name"),
      email:    formData.get("email"),
      password: formData.get("password"),
      role:     "AGENT",
    };

    try {
      const res  = await fetch(`${API}/api/users`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create agent");

      setAgents((prev) => [...prev, data.user]);
      setShowAddAgentModal(false);
      e.target.reset();
    } catch (err) {
      setFormError(err.message);
    }
  };

  // ── Add Admin ─────────────────────────────────────────────────────────────
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.target);

    const payload = {
      name:     formData.get("name"),
      email:    formData.get("email"),
      password: formData.get("password"),
      role:     "ADMIN",
    };

    try {
      const res  = await fetch(`${API}/api/users`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");

      alert(`Admin "${data.user.name}" added successfully.`);
      setShowAddAdminModal(false);
      e.target.reset();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // ── Recent activity: fields sorted by most recent observation/update ──────
  const recentFields = [...fields]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white p-6">

      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setFormError(""); setShowAddAdminModal(true); }}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition">
            + Add Admin
          </button>
          <button onClick={() => { setFormError(""); setShowAddAgentModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition">
            + Add Agent
          </button>
          <button onClick={() => { setFormError(""); setShowAddFieldModal(true); }}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition">
            + Add Field
          </button>
          <button onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition">
            Logout
          </button>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryWidget title="Total Fields" count={stats.total}     icon="🌾" color="blue"   />
        <SummaryWidget title="Active"        count={stats.active}    icon="📋" color="green"  />
        <SummaryWidget title="At Risk"       count={stats.atRisk}    icon="⚠️" color="yellow" />
        <SummaryWidget title="Completed"     count={stats.completed} icon="✅" color="blue"   />
      </div>

      {/* Kanban Board */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Field Status Board</h2>
        {loading ? (
          <p className="text-gray-500">Loading fields…</p>
        ) : (
          <KanbanBoard
            fields={fields}
            onUpdate={(fieldId) => { setSelectedFieldId(fieldId); setShowAgentModal(true); }}
            onView={handleViewField}
            onRemove={handleRemoveField}
            userRole="admin"
          />
        )}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        {recentFields.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {recentFields.map((f) => (
              <div key={f.id}
                className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewField(f.id)}>
                <div>
                  <p className="font-semibold text-gray-800">{f.name}</p>
                  <p className="text-xs text-gray-500">
                    {f.cropType} · Agent: {f.agent} · Stage: {f.currentStage}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    f.status === "Active"    ? "bg-green-100 text-green-700"  :
                    f.status === "Completed" ? "bg-blue-100 text-blue-700"   :
                                              "bg-yellow-100 text-yellow-700"
                  }`}>
                    {f.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(f.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Add Field Modal ── */}
      <Modal isOpen={showAddFieldModal} title="Add New Field"
        onClose={() => setShowAddFieldModal(false)}>
        <form onSubmit={handleAddField} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{formError}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
            <input type="text" name="name" placeholder="e.g., Wheat Field A" required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
            <select name="cropType" required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select crop type...</option>
              {["Wheat","Corn","Rice","Barley","Soybean","Maize","Sunflower","Sorghum"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
            <input type="date" name="plantingDate" required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Agent</label>
            <select name="agentName" required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select an agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition">
              Add Field
            </button>
            <button type="button" onClick={() => setShowAddFieldModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Reassign Agent Modal ── */}
      <Modal isOpen={showAgentModal} title={`Reassign Agent — ${selectedField?.name}`}
        onClose={() => { setShowAgentModal(false); setSelectedFieldId(null); }}>
        <form onSubmit={handleAssignAgent} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{formError}</p>}
          <p className="text-sm text-gray-600">
            Current Agent: <span className="font-semibold">{selectedField?.agent}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select New Agent</label>
            <select name="agentName" required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select an agent...</option>
              {agents.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition">
              Reassign
            </button>
            <button type="button" onClick={() => { setShowAgentModal(false); setSelectedFieldId(null); }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── View Field Modal ── */}
      <Modal isOpen={showViewModal} title={`Field Details — ${viewField?.name}`}
        onClose={() => { setShowViewModal(false); setViewField(null); }}>
        {viewField && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Crop</p>
                <p className="font-semibold">{viewField.cropType}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Stage</p>
                <p className="font-semibold">{viewField.currentStage}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
                <p className="font-semibold">{viewField.status}</p>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Agent</p>
                <p className="font-semibold">{viewField.agent?.name ?? viewField.agent}</p>
              </div>
              <div className="bg-gray-50 rounded p-3 col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Planting Date</p>
                <p className="font-semibold">{new Date(viewField.plantingDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Observations */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Observations ({viewField.observations?.length ?? 0})
              </h3>
              {!viewField.observations || viewField.observations.length === 0 ? (
                <p className="text-gray-400 italic text-xs">No observations recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {viewField.observations.map((obs) => (
                    <div key={obs.id} className="border border-gray-100 rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-gray-600">
                          {obs.createdBy?.name ?? "Agent"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(obs.createdAt).toLocaleDateString()} · Stage: {obs.stageAtTime}
                        </span>
                      </div>
                      <p className="text-gray-700">{obs.notes ?? <em className="text-gray-400">Stage update only</em>}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add Agent Modal ── */}
      <Modal isOpen={showAddAgentModal} title="Add New Agent"
        onClose={() => setShowAddAgentModal(false)}>
        <form onSubmit={handleAddAgent} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{formError}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" placeholder="e.g., Jane Doe" required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" placeholder="jane@farmops.com" required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" placeholder="••••••••" required minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition">
              Add Agent
            </button>
            <button type="button" onClick={() => setShowAddAgentModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Add Admin Modal ── */}
      <Modal isOpen={showAddAdminModal} title="Add New Admin"
        onClose={() => setShowAddAdminModal(false)}>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{formError}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" placeholder="e.g., Jane Admin" required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" placeholder="admin@farmops.com" required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" placeholder="••••••••" required minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition">
              Add Admin
            </button>
            <button type="button" onClick={() => setShowAddAdminModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded hover:bg-gray-300 transition">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};