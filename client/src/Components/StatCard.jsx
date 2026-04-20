import "./StatCard.css";

const StatCard = ({ label, value, icon, iconBg }) => {
  return (
    <div className="stat-card">
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <h2 className="stat-value">{value}</h2>
      </div>

      <div className={`stat-icon ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;