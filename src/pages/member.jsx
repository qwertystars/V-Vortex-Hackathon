import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/member.css";
import logo from "/logo.jpg";

export default function HackVortexDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("details");
  const [time, setTime] = useState("00:00:00");
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState(null);
  const [teamData, setTeamData] = useState(null);

  // ===============================
  // AUTHENTICATION & DATA FETCH
  // ===============================
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          alert('❌ You must be logged in to access this page.');
          navigate('/login');
          return;
        }

        // Fetch member data using authenticated email
        const { data: member, error: memberError } = await supabase
          .from('team_members')
          .select('*')
          .eq('member_email', user.email)
          .single();

        if (memberError || !member) {
          alert('❌ Member data not found. Please contact support.');
          navigate('/login');
          return;
        }

        setMemberData(member);

        // Fetch team data
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', member.team_id)
          .single();

        if (teamError || !team) {
          alert('❌ Team data not found.');
          navigate('/login');
          return;
        }

        setTeamData(team);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching member data:', error);
        alert('❌ An error occurred. Please try again.');
        navigate('/login');
      }
    };

    fetchMemberData();
  }, [navigate]);

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
      subtitle: "Authenticated session",
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

  // Get member initials for avatar
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Handle logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('❌ Logout failed. Please try again.');
      return;
    }
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="mesh-bg">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#fff',
          fontSize: '1.5rem'
        }}>
          Loading member data...
        </div>
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
                activePage === "problem" ? "active" : ""
              }`}
              onClick={() => setActivePage("problem")}
            >
              Mission Logic
            </button>
          </nav>

          {/* USER CARD */}
          <div className="sidebar-user">
            <div className="user-box glass">
              <div className="user-avatar">{getInitials(memberData?.member_name)}</div>
              <div className="user-meta">
                <p>{memberData?.member_name || 'Member'}</p>
                <p>{teamData?.team_name || 'Loading...'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '8px',
                background: 'rgba(255, 0, 0, 0.2)',
                border: '1px solid rgba(255, 0, 0, 0.5)',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
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
                <div className="card glass center">
                  <h2>{memberData?.member_name || 'Member Name'}</h2>
                  <p>
                    {memberData?.member_role || 'Team Member'} <br />
                    <strong>{teamData?.team_name || 'Team Name'}</strong>
                  </p>
                  <p style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.7 }}>
                    Email: {memberData?.member_email}
                  </p>
                </div>
              </div>
            )}

            {/* QR PAGE */}
            {activePage === "qr" && (
              <div className="page">
                <div className="card glass center">
                  <h2>Gateway Access</h2>
                  {memberData?.member_qr_code ? (
                    <img 
                      src={memberData.member_qr_code} 
                      alt="Member QR Code"
                      style={{ 
                        width: '200px', 
                        height: '200px',
                        margin: '20px auto',
                        background: 'white',
                        padding: '10px',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <div className="qr-box">QR</div>
                  )}
                  <p style={{ marginTop: '10px', opacity: 0.8 }}>
                    Team: {teamData?.team_name}
                  </p>
                  <button className="primary-btn" onClick={() => {
                    if (memberData?.member_qr_code) {
                      window.open(memberData.member_qr_code, '_blank');
                    } else {
                      alert('QR Code not available');
                    }
                  }}>
                    Export Credential
                  </button>
                </div>
              </div>
            )}

            {/* PROBLEM PAGE */}
            {activePage === "problem" && (
              <div className="page">
                <div className="card glass">
                  <h2>{teamData?.problem_statement || 'Problem Statement'}</h2>
                  <p>
                    {teamData?.problem_description || 
                    'Problem description will be displayed here once your team receives the challenge.'}
                  </p>
                  <button className="primary-btn">
                    Initialize Mission Workspace
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
