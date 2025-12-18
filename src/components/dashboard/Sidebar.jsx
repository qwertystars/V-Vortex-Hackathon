import React from 'react';
import logo from "/logo.jpg";

export default function Sidebar({ showSidebar, activeTab, setActiveTab, team, handleLogout, closeSidebar }) {
  return (
    <>
      <aside className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebarLogo">
          <img src={logo} alt="V-VORTEX logo" className="sidebarLogoImg" />
          <span>HACKVORTEX</span>
        </div>
        <div className="sidebarSub">ALPHA SECTOR</div>

        <div className="sidebarNav">
          {['vortex', 'leaderboard', 'nexus', 'mission'].map(tab => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => { setActiveTab(tab); closeSidebar(); }}
            >
              {tab === 'vortex' ? 'Vortex Hub' : 
               tab === 'nexus' ? 'Nexus Entry' : 
               tab === 'mission' ? 'The Mission' : 
               tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="sidebarFooter">
          <div className="userCard">
            <strong>{team?.lead_name || 'Leader'}</strong>
            <div style={{ fontSize: "11px", color: "#e879f9" }}>
              Team Leader
            </div>
          </div>

          <button className="disconnectBtn" onClick={handleLogout}>
            DISCONNECT
          </button>
        </div>
      </aside>

      {showSidebar && <div className="sidebarOverlay" onClick={closeSidebar} /> }
    </>
  );
}
