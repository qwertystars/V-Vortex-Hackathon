import "../styles/admin.css";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="adminWrapper">

      {/* TOP NAVBAR */}
      <nav className="adminNav">
        <div className="adminLeft">
          <img src="/logo.jpg" className="adminLogo" alt="Logo" />
          <span className="adminTitle">ADMIN CONTROL PANEL</span>
        </div>

        <div className="adminRight">
          <button className="logoutBtn" onClick={() => navigate("/")}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN GRID */}
      <div className="adminGrid">

        <div className="adminCard">
          <h2>Active Users</h2>
          <p className="metric">128</p>
        </div>

        <div className="adminCard">
          <h2>Pending Requests</h2>
          <p className="metric yellow">7</p>
        </div>

        <div className="adminCard">
          <h2>System Health</h2>
          <p className="metric green">Optimal</p>
        </div>

        <div className="adminCard">
          <h2>Security Alerts</h2>
          <p className="metric red">0</p>
        </div>

      </div>

      {/* LARGE PANEL BELOW */}
      <div className="adminPanel">
        <h2 className="panelTitle">Recent Activity Logs</h2>

        <div className="logBox">
          <p>User DEV01 logged in.</p>
          <p>Permission granted to TEAM-ALPHA.</p>
          <p>New registration request: user_57.</p>
          <p>System scan completed successfully.</p>
        </div>
      </div>
    </div>
  );
}
