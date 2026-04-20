import Sidebar from "../../components/Sidebar";
import RecentActivities from "../../Components/RecentActivity";
import StatCard from "../../Components/StatCard";
import fieldData from "../../Components/fieldData";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">

      
      <div className="sidebar-container">
        <Sidebar />
      </div>

      
      <div className="dashboard">
        <h1>Dashboard</h1>

    
        <div className="stat-cards">
          <StatCard label="Total Fields" value={48} />
          <StatCard label="At Risk" value={3} />
          <StatCard label="Harvested" value={15} />
          <StatCard label="Active Agents" value={12} />
        </div>

        {/* Map */}
        <div className="map-container">
          <div className="map-placeholder">Map goes here</div>
        </div>

    
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

          <table className="fo-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Crop</th>
                <th>Agent</th>
                <th>Planting Date</th>
                <th>Stage</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {fieldData.map((f) => (
                <tr key={f.id}>
                  <td><input type="checkbox" /></td>
                  <td>{f.name}</td>
                  <td>{f.crop}</td>
                  <td>{f.agent}</td>
                  <td>{f.date}</td>
                  <td>
                    <span>{f.stage}</span>
                    <div className="stage-bar">
                      <div
                        className="stage-fill"
                        style={{ width: `${f.pct}%` }}
                      />
                    </div>
                    <span>{f.pct}%</span>
                  </td>
                  <td>
                    <span className="badge-active">{f.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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