import Sidebar from "../../components/Sidebar";
import RecentActivities from "../../Components/RecentActivity";
import StatCard from "../../Components/StatCard";
import fieldData from "../../Components/fieldData";
import "./Dashboard.css";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFields: 0,
    atRisk: 0,
    harvested: 0,
    activeAgents: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
    
        const response = await fetch('http://localhost:5000/api/fields', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch fields');
        
        const fields = await response.json();
        
        // Calculate totals
        const totalFields = fields.length;
        const atRisk = fields.filter(f => f.status === 'At Risk').length;
        const harvested = fields.filter(f => f.currentStage === 'HARVESTED').length;
        
        // Get unique agents
        const uniqueAgents = new Set(fields.map(f => f.agentId)).size;
        
        setStats({
          totalFields,
          atRisk,
          harvested,
          activeAgents: uniqueAgents
        });
    };

    fetchStats();
  }
  , []);

  
  return (
    <div className="dashboard-container">
      <div className="sidebar-container">
        <Sidebar />
      </div>

      <div className="dashboard">
        <h1>Dashboard</h1>

        <div className="stat-cards">
          <StatCard label="Total Fields" value={stats.totalFields} />
          <StatCard label="At Risk" value={stats.atRisk} />
          <StatCard label="Harvested" value={stats.harvested} />
          <StatCard label="Active Agents" value={stats.activeAgents} />
        </div>

        {/* Map */}
        <div className="map-container">
          <div className="map-placeholder">Map goes here</div>
        </div>

        {/* Field Overview - Card Layout */}
        <div className="field-overview">
          <div className="fo-header">
            <h2>Field Overview</h2>
            <div className="fo-actions">
              <select><option>Crop Type</option></select>
              <select><option>Agent</option></select>
              <select><option>Status</option></select>
              <button className="btn-create">+ Create New Field</button>
            </div>
          </div>

          <div className="fo-cards">
            {fieldData.map((f) => (
              <div key={f.id} className="field-card">
                <div className="card-header">
                  <input type="checkbox" />
                  <h3>{f.name}</h3>
                </div>

                <div className="card-content">
                  <div className="card-row">
                    <span className="label">Crop:</span>
                    <span className="value">{f.crop}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Agent:</span>
                    <span className="value">{f.agent}</span>
                  </div>
                  <div className="card-row">
                    <span className="label">Planting Date:</span>
                    <span className="value">{f.date}</span>
                  </div>

                  <div className="card-row">
                    <span className="label">Stage:</span>
                    <div className="stage-info">
                      <span>{f.stage}</span>
                      <div className="stage-bar">
                        <div
                          className="stage-fill"
                          style={{ width: `${f.pct}%` }}
                        />
                      </div>
                      <span>{f.pct}%</span>
                    </div>
                  </div>

                  <div className="card-row">
                    <span className="label">Status:</span>
                    <span className="badge-active">{f.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
       
      </div>
       <div className="recent-activity">
          <h2>Recent Activities</h2>
          <div className="activities">
            {RecentActivities.map((item) => (
              <div key={item.id} className="card">
                <h3>{item.activity}</h3>
                <p><strong>Crop:</strong> {item.crop}</p>
                <p><strong>Agent:</strong> {item.agent}</p>
                <p><strong>Status:</strong> {item.status}</p>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default Dashboard;