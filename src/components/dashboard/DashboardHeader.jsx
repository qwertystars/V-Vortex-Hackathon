import React from 'react';

export default function DashboardHeader({ activeTab, setShowSidebar, time }) {
  const getTitle = () => {
    switch(activeTab) {
      case 'vortex': return "Vortex Hub";
      case 'leaderboard': return "Leaderboard";
      case 'nexus': return "Nexus Entry";
      case 'mission': return "The Mission";
      default: return "";
    }
  };

  return (
    <header className="mainHeader">
      <div className="headerLeft">
        <button className="menuBtn" onClick={() => setShowSidebar(s => !s)} aria-label="Toggle sidebar">☰</button>

        <div>
          <div className="headerTitle">{getTitle()}</div>
          <div className="headerSub">OPERATIONAL OBJECTIVE DECRYPTION</div>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div className="systemLabel">SYSTEM TIME</div>
        <div className="systemTime">{time}</div>
      </div>
    </header>
  );
}
