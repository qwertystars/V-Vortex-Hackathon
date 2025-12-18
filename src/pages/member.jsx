import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMemberData, useAttendanceSessions } from "../hooks/useMemberData";
import CyberpunkLoader from "../components/ui/CyberpunkLoader";
import QRCodeDisplay from "../components/ui/QRCodeDisplay";
import "../styles/member.css";
import logo from "/logo.jpg";

export default function HackVortexDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("details");
  const [time, setTime] = useState("00:00:00");

  // Get user info from sessionStorage (set during login)
  const memberEmail = sessionStorage.getItem('memberEmail');
  const memberRole = sessionStorage.getItem('memberRole');

  // Use custom hook for member data
  const {
    memberProfile,
    teamMembers,
    attendance,
    qrCode,
    stats,
    loading,
    isLoading,
    error,
    generateQRCode,
    recordAttendance,
    refreshAll
  } = useMemberData(null, memberEmail);

  const { sessions } = useAttendanceSessions();

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
  // AUTHENTICATION CHECK
  // ===============================
  useEffect(() => {
    if (!memberEmail) {
      // Redirect to login if no member session
      navigate('/login');
    }
  }, [memberEmail, navigate]);

  // ===============================
  // PAGE TITLES
  // ===============================
  const titles = {
    details: {
      title: "Member Identity",
      subtitle: "Authenticated session",
    },
    qr: {
      title: "Access Gateway",
      subtitle: "Team verification portal",
    },
    attendance: {
      title: "Attendance Tracking",
      subtitle: "Session monitoring system",
    },
    team: {
      title: "Team Roster",
      subtitle: "Squad member database",
    },
  };

  // ===============================
  // HELPER FUNCTIONS
  // ===============================
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || loading.profile) {
    return (
      <div className="member-dashboard-loading">
        <CyberpunkLoader
          message="SYNCING MEMBER DATA..."
          type="spinner"
          fullscreen={true}
          size="large"
        />
      </div>
    );
  }

  return (
    <>
      {/* BACKGROUND */}
      <div className="mesh-bg"></div>

      <div className="dashboard">
        {/* ===============================
            SIDEBAR (DESKTOP)
        =============================== */}
        <aside className="sidebar glass">
          <div className="sidebar-header">
            <div className="sidebar-title">
              <img src={logo} alt="V-VORTEX logo" className="sidebarLogoImg" />
              HACKVORTEX
            </div>
            <div className="sidebar-subtitle">Developer Terminal</div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`sidebar-btn ${
                activePage === "details" ? "active" : ""
              }`}
              onClick={() => setActivePage("details")}
            >
              Member Identity
            </button>

            <button
              className={`sidebar-btn ${
                activePage === "qr" ? "active" : ""
              }`}
              onClick={() => setActivePage("qr")}
            >
              Access Gate
            </button>

            <button
              className={`sidebar-btn ${
                activePage === "attendance" ? "active" : ""
              }`}
              onClick={() => setActivePage("attendance")}
            >
              Attendance
            </button>

            <button
              className={`sidebar-btn ${
                activePage === "team" ? "active" : ""
              }`}
              onClick={() => setActivePage("team")}
            >
              Team Roster
            </button>
          </nav>

          {/* USER CARD */}
          <div className="sidebar-user">
            <div className="user-box glass">
              <div className="user-avatar">
                {getInitials(memberProfile?.member_name || memberProfile?.lead_name)}
              </div>
              <div className="user-meta">
                <p>{memberProfile?.member_name || memberProfile?.lead_name || 'Unknown'}</p>
                <p>{memberProfile?.member_email || memberProfile?.lead_email || 'No email'}</p>
                <p className="user-role">{memberProfile?.role || memberRole || 'Team Member'}</p>
              </div>
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
              <h1>{titles[activePage].title}</h1>
              <p>{titles[activePage].subtitle}</p>
            </div>

            <div className="clock glass">
              <span>System Pulse</span>
              <strong>{time}</strong>
            </div>
          </header>

          {/* CONTENT */}
          <section className="content">
            {/* DETAILS PAGE */}
            {activePage === "details" && (
              <div className="page">
                <div className="card glass">
                  <div className="member-details">
                    <div className="detail-row">
                      <label>Member Name</label>
                      <span>{memberProfile?.member_name || memberProfile?.lead_name || 'Loading...'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Email</label>
                      <span>{memberProfile?.member_email || memberProfile?.lead_email || 'Loading...'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Team</label>
                      <span>{memberProfile?.team_name || 'Loading...'}</span>
                    </div>
                    <div className="detail-row">
                      <label>Role</label>
                      <span>{memberProfile?.role || memberRole || 'Team Member'}</span>
                    </div>
                    {(memberProfile?.member_reg_no || memberProfile?.lead_reg_no) && (
                      <div className="detail-row">
                        <label>Registration Number</label>
                        <span>{memberProfile?.member_reg_no || memberProfile?.lead_reg_no}</span>
                      </div>
                    )}
                    {memberProfile?.institution && (
                      <div className="detail-row">
                        <label>Institution</label>
                        <span>{memberProfile?.institution}</span>
                      </div>
                    )}
                    {stats && (
                      <>
                        <div className="detail-row">
                          <label>Total Scans</label>
                          <span>{stats.totalScans || 0}</span>
                        </div>
                        <div className="detail-row">
                          <label>Sessions Attended</label>
                          <span>{stats.sessionsAttended || 0}</span>
                        </div>
                        <div className="detail-row">
                          <label>Team Size</label>
                          <span>{stats.teamSize || 1} members</span>
                        </div>
                        {stats.lastScan && (
                          <div className="detail-row">
                            <label>Last Scan</label>
                            <span>{formatDate(stats.lastScan)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="member-actions">
                    <button className="primary-btn" onClick={refreshAll}>
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* QR PAGE */}
            {activePage === "qr" && (
              <div className="page">
                <div className="card glass">
                  <QRCodeDisplay
                    qrData={qrCode}
                    memberName={memberProfile?.member_name || memberProfile?.lead_name}
                    teamName={memberProfile?.team_name}
                    size={200}
                    loading={loading.qrCode}
                    onRegenerate={generateQRCode}
                  />
                </div>
              </div>
            )}

            {/* ATTENDANCE PAGE */}
            {activePage === "attendance" && (
              <div className="page">
                <div className="card glass">
                  <h3>Attendance Records</h3>
                  {loading.attendance ? (
                    <CyberpunkLoader
                      message="LOADING ATTENDANCE DATA..."
                      type="dots"
                      inline={true}
                    />
                  ) : Object.keys(attendance).length > 0 ? (
                    <div className="attendance-records">
                      {Object.entries(attendance).map(([sessionId, data]) => (
                        <div key={sessionId} className="attendance-session">
                          <h4>{data.session?.session_name || `Session ${sessionId}`}</h4>
                          <div className="session-info">
                            <p>
                              <strong>Location:</strong> {data.session?.location || 'Main Hall'}
                            </p>
                            <p>
                              <strong>Time:</strong> {data.session?.start_time ?
                                formatDate(data.session.start_time) : 'Not specified'}
                            </p>
                          </div>
                          <div className="scan-list">
                            {data.scans.map((scan, index) => (
                              <div key={index} className="scan-item">
                                <span className="scan-type">
                                  {scan.scan_type === 'checkin' ? '📥 Check-in' : '📤 Check-out'}
                                </span>
                                <span className="scan-time">
                                  {formatDate(scan.scan_time)}
                                </span>
                                <span className="scan-location">
                                  📍 {scan.location}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No attendance records found</p>
                      <button
                        className="primary-btn"
                        onClick={() => recordAttendance('checkin', 'Main Hall')}
                      >
                        Check In Now
                      </button>
                    </div>
                  )}

                  <div className="attendance-actions">
                    <button
                      className="primary-btn"
                      onClick={() => recordAttendance('checkin', 'Main Hall')}
                    >
                      Check In
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => recordAttendance('checkout', 'Main Hall')}
                    >
                      Check Out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TEAM PAGE */}
            {activePage === "team" && (
              <div className="page">
                <div className="card glass">
                  <h3>Team Roster</h3>
                  {loading.team ? (
                    <CyberpunkLoader
                      message="LOADING TEAM DATA..."
                      type="dots"
                      inline={true}
                    />
                  ) : teamMembers.length > 0 ? (
                    <div className="team-members">
                      {teamMembers.map((member, index) => (
                        <div key={member.id} className="team-member-card">
                          <div className="member-avatar">
                            {getInitials(member.member_name)}
                          </div>
                          <div className="member-info">
                            <h4>{member.member_name}</h4>
                            <p>{member.member_email}</p>
                            {member.member_reg_no && (
                              <p>Reg: {member.member_reg_no}</p>
                            )}
                            {member.institution && (
                              <p>{member.institution}</p>
                            )}
                            {member.is_leader && (
                              <span className="leader-badge">TEAM LEAD</span>
                            )}
                          </div>
                          {member.qr_code_data && (
                            <div className="member-status">
                              <span className="status-indicator active">
                                ✓ QR Generated
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>No team members found</p>
                    </div>
                  )}

                  <div className="team-stats">
                    <div className="stat-item">
                      <span className="stat-label">Team Size</span>
                      <span className="stat-value">{teamMembers.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Team Name</span>
                      <span className="stat-value">{memberProfile?.team_name || 'Unknown'}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Institution</span>
                      <span className="stat-value">
                        {memberProfile?.institution ||
                         (memberProfile?.is_vit_chennai ? 'VIT Chennai' : 'External')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
