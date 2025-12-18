import { useEffect, useState } from "react";
import "../styles/member.css";
import logo from "/logo.jpg";

export default function HackVortexDashboard() {
  const [activePage, setActivePage] = useState("details");
  const [time, setTime] = useState("00:00:00");

  // ===============================
  // LIVE CLOCK
  // ===============================
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // ===============================
  // PAGE TITLES
  // ===============================
  const titles = {
    details: {
      title: "Member Identity",
      subtitle: "Authenticated user session active",
    },
    qr: {
      title: "Access Gateway",
      subtitle: "Team verification portal",
    },
    problem: {
      title: "Mission Logic",
      subtitle: "Strategic challenge overview",
    },
  };

  return (
    <>
      {/* BACKGROUND */}
      <div className="mesh-bg"></div>

      <div className="dashboard">
        {/* ===============================
            SIDEBAR (DESKTOP)
        =============================== */}
        <aside className="sidebar glass">
          {/* Brand Logo */}
          <div className="sidebar-header">
            <div className="brand-logo-group">
              <div className="logo-glow-wrapper">
                <div className="logo-glow"></div>
                <div className="logo-box">
                  <svg className="lightning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="sidebar-title">HACKVORTEX</h1>
                <span className="sidebar-subtitle">Developer Terminal</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="sidebar-nav">
            <p className="nav-label">Core System</p>
            
            <button
              className={`sidebar-item ${activePage === "details" ? "active" : ""}`}
              onClick={() => setActivePage("details")}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span>Member Identity</span>
            </button>

            <button
              className={`sidebar-item ${activePage === "qr" ? "active" : ""}`}
              onClick={() => setActivePage("qr")}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
              </svg>
              <span>Access Gate</span>
            </button>

            <button
              className={`sidebar-item ${activePage === "problem" ? "active" : ""}`}
              onClick={() => setActivePage("problem")}
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Mission Logic</span>
            </button>
          </nav>

          {/* User Brief */}
          <div className="sidebar-user">
            <div className="user-box glass">
              <div className="user-avatar">AJ</div>
              <div className="user-meta">
                <p className="user-name">Alex Johnson</p>
                <p className="user-id">0x4582...BCA3</p>
              </div>
              <button className="logout-btn">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* ===============================
            MAIN AREA
        =============================== */}
        <main className="main">
          {/* HEADER */}
          <header className="header glass">
            <div>
              <h2 className="page-title">{titles[activePage].title}</h2>
              <p className="page-subtitle">{titles[activePage].subtitle}</p>
            </div>

            <div className="clock glass">
              <span className="clock-label">System Pulse</span>
              <strong className="clock-time">{time}</strong>
            </div>
          </header>

          {/* CONTENT */}
          <div className="content">
            {/* DETAILS PAGE */}
            {activePage === "details" && (
              <section className="page page-transition">
                {/* Hero Profile */}
                <div className="hero-profile glass">
                  <div className="hero-gradient"></div>
                  
                  <div className="hero-content">
                    <div className="avatar-section">
                      <div className="avatar-glow"></div>
                      <div className="avatar-container">
                        <div className="avatar-placeholder">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="status-indicator">
                        <div className="status-ping"></div>
                      </div>
                    </div>

                    <div className="hero-info">
                      <div className="badge-group">
                        <span className="badge badge-primary">Primary Node</span>
                        <span className="badge badge-verified">Verified</span>
                      </div>
                      <h3 className="hero-name">Alex Johnson</h3>
                      <p className="hero-role">Lead Full Stack Architect <span className="divider">/</span> <span className="team-highlight">CodeCrafters</span></p>
                    </div>
                  </div>

                  <div className="info-grid">
                    <div className="info-card glass-hover glass">
                      <p className="info-label">Identity UID</p>
                      <p className="info-value info-mono">MEM-2024-4582</p>
                    </div>
                    <div className="info-card glass-hover glass">
                      <p className="info-label">Comms Channel</p>
                      <p className="info-value">alex.j@vortex.dev</p>
                    </div>
                    <div className="info-card glass-hover glass">
                      <p className="info-label">Mobile Uplink</p>
                      <p className="info-value">+1 (555) 123-4567</p>
                    </div>
                    <div className="info-card glass-hover glass">
                      <p className="info-label">Inception</p>
                      <p className="info-value">Dec 10, 2024</p>
                    </div>
                  </div>
                </div>

                {/* Team Grid */}
                <div className="team-layout">
                  {/* Stats */}
                  <div className="stats-section">
                    <div className="stats-grid">
                      <div className="stat-card glass">
                        <div className="stat-icon stat-icon-purple">
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <p className="stat-label stat-label-purple">Team Name</p>
                        <p className="stat-value">CodeCrafters</p>
                      </div>
                      <div className="stat-card glass">
                        <div className="stat-icon stat-icon-pink">
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <p className="stat-label stat-label-pink">Current Rank</p>
                        <p className="stat-value">#02</p>
                      </div>
                      <div className="stat-card glass">
                        <div className="stat-icon stat-icon-cyan">
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <p className="stat-label stat-label-cyan">Global Score</p>
                        <p className="stat-value">2,756</p>
                      </div>
                    </div>

                    {/* Team Roster */}
                    <div className="team-roster glass">
                      <div className="roster-header">
                        <h4 className="roster-title">
                          <span className="title-bar"></span>
                          Squad Configuration
                        </h4>
                        <span className="roster-count">4 ACTIVE NODES</span>
                      </div>
                      
                      <div className="roster-grid">
                        {/* Member Item */}
                        <div className="member-item glass-hover glass">
                          <div className="member-icon member-icon-amber">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                          </div>
                          <div className="member-info">
                            <p className="member-name">Sarah Mitchell</p>
                            <p className="member-role">Team Leader • Full Stack</p>
                          </div>
                          <span className="member-badge member-badge-amber">Admin</span>
                        </div>
                        
                        {/* Member Item (You) */}
                        <div className="member-item member-item-self glass-hover glass">
                          <div className="member-icon member-icon-purple">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          </div>
                          <div className="member-info">
                            <p className="member-name">Alex Johnson <span className="self-indicator">(Self)</span></p>
                            <p className="member-role">Full Stack Architect</p>
                          </div>
                          <div className="member-pulse"></div>
                        </div>
                        
                        <div className="member-item glass-hover glass">
                          <div className="member-icon member-icon-blue">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          </div>
                          <div className="member-info">
                            <p className="member-name">David Chen</p>
                            <p className="member-role">Backend Engineer</p>
                          </div>
                        </div>
                        
                        <div className="member-item glass-hover glass">
                          <div className="member-icon member-icon-pink-alt">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          </div>
                          <div className="member-info">
                            <p className="member-name">Emma Rodriguez</p>
                            <p className="member-role">Visual Interaction Designer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Side Info */}
                  <div className="side-section">
                    <div className="upcoming-syncs glass">
                      <div className="syncs-gradient"></div>
                      <h4 className="syncs-title">Upcoming Syncs</h4>
                      <div className="syncs-list">
                        <div className="sync-item">
                          <div className="sync-timeline">
                            <div className="sync-dot sync-dot-active"></div>
                            <div className="sync-line"></div>
                          </div>
                          <div className="sync-content">
                            <p className="sync-time">14:00 PM</p>
                            <p className="sync-title-text">Design Review</p>
                            <p className="sync-description">UX Audit with Emma</p>
                          </div>
                        </div>
                        <div className="sync-item">
                          <div className="sync-timeline">
                            <div className="sync-dot"></div>
                          </div>
                          <div className="sync-content">
                            <p className="sync-time">18:30 PM</p>
                            <p className="sync-title-text">Internal Demo</p>
                            <p className="sync-description">Final staging push</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="cta-card">
                      <div className="cta-glow"></div>
                      <p className="cta-label">Hackathon Focus</p>
                      <h4 className="cta-title">CRUSH THE CODE BASE.</h4>
                      <button className="cta-button">View Leaderboard</button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* QR PAGE */}
            {activePage === "qr" && (
              <section className="page page-transition">
                <div className="qr-container glass">
                  <div className="qr-gradient"></div>
                  
                  <div className="qr-content">
                    <div className="qr-code-wrapper">
                      <div className="qr-glow"></div>
                      <div className="qr-code">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm4 2H7v2h2V7zm-4 6h8v8H3v-8zm2 2v4h4v-4H5zm4 2H7v2h2v-2zm6-13h8v8h-8V3zm2 2v4h4V5h-4zm4 2h-2v2h2V7zm-4 6h2v2h-2v-2zm0 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                        </svg>
                      </div>
                    </div>

                    <h3 className="qr-title">GATEWAY ACCESS</h3>
                    <p className="qr-subtitle">Scan to verify team <span className="qr-team">CodeCrafters</span> presence</p>
                    
                    <div className="session-key glass">
                      <span className="session-label">Session Key</span>
                      <span className="session-value">HCK-2024-CC-7891</span>
                      <svg className="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </div>

                    <div className="qr-actions">
                      <button className="qr-btn qr-btn-primary">Export Credential</button>
                      <button className="qr-btn qr-btn-secondary glass">Copy Link</button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* PROBLEM PAGE */}
            {activePage === "problem" && (
              <section className="page page-transition">
                <div className="problem-container glass">
                  <div className="problem-header">
                    <div className="problem-header-content">
                      <div>
                        <span className="problem-badge">Global Challenge 2024</span>
                        <h2 className="problem-title">AI-POWERED SUSTAINABILITY PLATFORM</h2>
                      </div>
                      <div className="complexity-card">
                        <p className="complexity-label">Complexity</p>
                        <div className="complexity-stars">
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <svg className="star-inactive" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <svg className="star-inactive" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="problem-content">
                    <div className="problem-main">
                      <div className="problem-summary">
                        <h3 className="section-title">
                          <span className="section-bar"></span>
                          Executive Summary
                        </h3>
                        <p className="summary-text">
                          Design and develop an innovative platform that leverages artificial intelligence to help individuals 
                          and organizations track, analyze, and reduce their carbon footprint in real-time.
                        </p>
                      </div>

                      <div className="requirements-grid">
                        <div className="requirement-card glass">
                          <h4 className="requirement-title requirement-title-purple">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Critical Requirements
                          </h4>
                          <ul className="requirement-list">
                            <li><span>•</span> Real-time footprint tracking</li>
                            <li><span>•</span> AI-powered recommendations</li>
                            <li><span>•</span> Gamification elements</li>
                            <li><span>•</span> IoT/Platform integration</li>
                          </ul>
                        </div>
                        <div className="requirement-card glass">
                          <h4 className="requirement-title requirement-title-pink">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            Evaluation Vectors
                          </h4>
                          <ul className="evaluation-list">
                            <li><span>Innovation</span><span>30%</span></li>
                            <li><span>Technical Ops</span><span>30%</span></li>
                            <li><span>UX Architecture</span><span>20%</span></li>
                            <li><span>Impact Delta</span><span>20%</span></li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="problem-side">
                      <div className="advice-card">
                        <div className="advice-glow"></div>
                        <h4 className="advice-title">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Tactical Advice
                        </h4>
                        <p className="advice-text">
                          Focus on the <span className="advice-highlight">Core Engine</span> first. Don't let peripheral features bleed your time. Coordinate via the team leader Sarah for all architectural merges.
                        </p>
                        <div className="pro-tip">
                          <p className="pro-tip-label">PRO TIP</p>
                          <p className="pro-tip-text">"The best code is the code you didn't have to write. Use robust APIs for the carbon analytics."</p>
                        </div>
                      </div>
                      
                      <button className="mission-btn">Initialize Mission Workspace</button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
