import AgentSidebar from "./AgentSidebar";
import { useEffect, useState } from "react";
import useUserStore from "../../store/UserStore";
import useFieldStore from "../../store/fieldStore";
import "./Dashboard.css";


const AgentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const { fields, setFields } = useFieldStore();

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/fields', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch fields');
        const data = await response.json();
        setFields(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching fields:', error);
        setLoading(false);
      }
    };

    fetchFields();
  }, [setFields]);

  return (
    <div className="dashboard-container">
      <div className="sidebar-container">
        <AgentSidebar/>
      </div>
      <div className="dashboard">
        <h1>Agent Dashboard</h1>
        <span>Your Fields</span>
        
        <div className="fields">
          {loading ? (
            <p>Loading fields...</p>
          ) : fields.length === 0 ? (
            <p>No fields assigned yet</p>
          ) : (
            fields.map((field) => (
              <div key={field.id} className="field-card">
                <div className="card-header">
                  <h3>{field.name}</h3>
                </div>
                <div className="card-content">
                  <div className="card-row">
                    <span className="label">Crop:</span>
                    <span className="value">{field.cropType}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Stage:</span>
                    <span className="value">{field.currentStage}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Status:</span>
                    <span className="value">{field.status}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Area:</span>
                    <span className="value">{field.areaAcres} acres</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default AgentDashboard;