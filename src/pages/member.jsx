import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/member.css";
import logo from "/logo.jpg";
import { selectProblem } from "../utils/selectProblem";

export default function HackVortexDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("details");
  const [time, setTime] = useState("00:00:00");
  const [loading, setLoading] = useState(true);
  const [memberData, setMemberData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardPublic, setLeaderboardPublic] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

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
  // LEADERBOARD FETCH
  // ===============================
  const refreshLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      // Check if leaderboard is public
      const { data: settings } = await supabase.from('app_settings').select('leaderboard_public').eq('id', 'main').single();
      const isPublic = !!settings?.leaderboard_public;
      setLeaderboardPublic(isPublic);

      if (isPublic) {
        const { data, error } = await supabase.from('leaderboard_view').select('*').order('position', { ascending: true });
        if (error) throw error;
        const norm = (data || []).map(r => ({ ...r, score: r.score ?? r.total_score ?? 0, delta: r.delta ?? 0 }));
        setLeaderboard(norm);
      } else {
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Failed to refresh leaderboard:', err);
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Load leaderboard when tab changes to leaderboard
  useEffect(() => {
    if (activePage === 'leaderboard') {
      refreshLeaderboard();
    }
  }, [activePage]);

  // Initial leaderboard load
  useEffect(() => {
    refreshLeaderboard();
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
    leaderboard: {
      title: "Leaderboard",
      subtitle: "Live team rankings",
    },
  };

  // Small domains list used for leader problem assignment modal
  const domains = {
    iot: {
      title: "IOT & ROBOTICS",
      problems: [
        { name: "Sky-Glow Sentinel (Urban Light Pollution Mapping)", desc: "Design a high-sensitivity Sky Quality Monitoring system and mapping solution." },
        { name: "Smart Parking Occupancy Detection System", desc: "Low-cost IoT-based system to detect parking spot occupancy in real time." },
      ],
    },
    aiml: {
      title: "AI/ML",
      problems: [
        { name: "AI-Generated Image Authenticity Detection", desc: "Determine whether an image is AI-generated or real with explainable confidence." },
        { name: "AI-Powered Mind Map Search Engine", desc: "Retrieve information and present it as an interactive mind map." },
      ],
    },
    fintech: {
      title: "FINTECH",
      problems: [
        { name: "Unified Payment Orchestration & Automated Settlements", desc: "Prototype a unified payment orchestration platform with automated workflows." },
      ],
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

  // Problem assignment modal handlers (leader only)
  const openProblemModal = () => setShowProblemModal(true);
  const closeProblemModal = () => setShowProblemModal(false);

  const handleAssignProblem = async (domainKey, problem) => {
    if (!teamData || !teamData.id) {
      alert('Team not loaded');
      return;
    }

    setIsAssigning(true);
    try {
      await selectProblem({
        teamId: teamData.id,
        domain: domainKey,
        problemName: problem.name,
        problemDescription: problem.desc,
      });

      // Refresh teamData
      const { data: refreshedTeam, error: teamError } = await supabase.from('teams').select('*').eq('id', teamData.id).single();
      if (teamError) throw teamError;
      setTeamData(refreshedTeam);

      alert('✅ Problem assigned to team successfully');
      closeProblemModal();
    } catch (err) {
      console.error('Assign problem error:', err);
      alert(err.message || 'Failed to assign problem');
    } finally {
      setIsAssigning(false);
    }
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

            <button
              className={`sidebar-btn ${
                activePage === "leaderboard" ? "active" : ""
              }`}
              onClick={() => setActivePage("leaderboard")}
            >
              Leaderboard
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

                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <button className="primary-btn">
                      Initialize Mission Workspace
                    </button>

                    {/* Leader-only: assign/select problem */}
                    {memberData?.member_email === teamData?.lead_email && (
                      <button
                        className="primary-btn"
                        onClick={openProblemModal}
                        disabled={isAssigning}
                        style={{ background: '#00bfa5' }}
                      >
                        {isAssigning ? 'Assigning...' : (teamData?.problem_statement ? 'Reassign Problem' : 'Assign Problem')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Problem selection modal (leader only) */}
                {showProblemModal && (
                  <div
                    className="modal-overlay active"
                    onClick={closeProblemModal}
                    style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', zIndex: 1200 }}
                  >
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 900, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Assign Problem Statement</h3>
                        <button onClick={closeProblemModal} style={{ height: 30, width: 30 }}>×</button>
                      </div>

                      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {Object.entries(domains).map(([key, d]) => (
                          <div key={key} style={{ border: '1px solid rgba(255,255,255,0.04)', padding: 12, borderRadius: 8 }}>
                            <h4 style={{ marginTop: 0 }}>{d.title}</h4>
                            <div>
                              {d.problems.map((p, i) => (
                                <div key={i} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: '1px dashed rgba(255,255,255,0.03)' }}>
                                  <strong style={{ color: '#00e6ff' }}>{p.name}</strong>
                                  <p style={{ margin: '6px 0 8px 0' }}>{p.desc}</p>
                                  <button
                                    className="primary-btn"
                                    onClick={() => handleAssignProblem(key, p)}
                                    disabled={isAssigning}
                                  >
                                    {isAssigning ? 'Assigning...' : 'Select this problem'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LEADERBOARD PAGE */}
            {activePage === "leaderboard" && (
              <div className="page">
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                  
                  {/* Team Stats Cards */}
                  {leaderboardPublic && leaderboard.length > 0 && (() => {
                    const currentTeam = leaderboard.find(r => r.team_id === teamData?.id);
                    const alphaTeam = leaderboard[0];
                    const gapToAlpha = currentTeam ? (alphaTeam?.score || 0) - (currentTeam?.score || 0) : 0;
                    
                    return (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        {/* Tactical Rank Card */}
                        <div className="card glass" style={{
                          background: 'linear-gradient(135deg, rgba(0, 191, 165, 0.15), rgba(0, 230, 255, 0.08))',
                          border: '1px solid rgba(0, 191, 165, 0.25)',
                          padding: '1.5rem'
                        }}>
                          <div style={{ 
                            color: '#00bfa5', 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            letterSpacing: '2px',
                            marginBottom: '0.75rem'
                          }}>TACTICAL RANK</div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>
                              {currentTeam?.position || '—'}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '1.1rem' }}>/{leaderboard.length}</span>
                          </div>
                        </div>

                        {/* Accumulated Data Card */}
                        <div className="card glass" style={{
                          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(6, 182, 212, 0.08))',
                          border: '1px solid rgba(34, 211, 238, 0.25)',
                          padding: '1.5rem'
                        }}>
                          <div style={{ 
                            color: '#22d3ee', 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            letterSpacing: '2px',
                            marginBottom: '0.75rem'
                          }}>ACCUMULATED DATA</div>
                          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>
                            {currentTeam?.score || 0}
                          </div>
                        </div>

                        {/* Gap to Alpha Card */}
                        <div className="card glass" style={{
                          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(249, 115, 22, 0.08))',
                          border: '1px solid rgba(251, 146, 60, 0.25)',
                          padding: '1.5rem'
                        }}>
                          <div style={{ 
                            color: '#fb923c', 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            letterSpacing: '2px',
                            marginBottom: '0.75rem'
                          }}>GAP TO ALPHA</div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: 800, color: '#fff' }}>
                              {gapToAlpha}
                            </span>
                            <span style={{ color: '#6b7280', fontSize: '1rem', fontWeight: 600 }}>PTS</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {!leaderboardPublic ? (
                    <div className="card glass" style={{
                      textAlign: 'center',
                      padding: '4rem 2rem'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>🔒</div>
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Leaderboard Hidden</h3>
                      <p style={{ color: '#9ca3af', maxWidth: '400px', margin: '0 auto' }}>
                        The leaderboard is currently not available. Check back later when the organizers make it public.
                      </p>
                    </div>
                  ) : leaderboardLoading ? (
                    <div className="card glass" style={{
                      textAlign: 'center',
                      padding: '4rem 2rem'
                    }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        border: '3px solid rgba(0, 191, 165, 0.2)', 
                        borderTopColor: '#00bfa5',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <p style={{ color: '#9ca3af' }}>Loading leaderboard...</p>
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <div className="card glass" style={{
                      textAlign: 'center',
                      padding: '4rem 2rem'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                      <p style={{ color: '#9ca3af' }}>No leaderboard data available yet.</p>
                    </div>
                  ) : (
                    <div className="card glass" style={{
                      padding: 0,
                      overflow: 'hidden'
                    }}>
                      {/* Table Header */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '140px 1fr 150px',
                        padding: '1rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        fontWeight: 700,
                        color: '#00bfa5',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                      }}>
                        <div>POSITION</div>
                        <div>SQUAD DESIGNATION</div>
                        <div style={{ textAlign: 'right' }}>PAYLOAD</div>
                      </div>

                      {/* Leaderboard Rows */}
                      {leaderboard.map((row, idx) => {
                        const isCurrentTeam = row.team_id === teamData?.id;
                        const prevTeam = leaderboard[idx - 1];
                        const delta = prevTeam ? row.score - (prevTeam?.score || 0) : 0;

                        return (
                          <div 
                            key={row.team_id || idx}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '140px 1fr 150px',
                              padding: '1rem 1.5rem',
                              borderBottom: '1px solid rgba(255,255,255,0.03)',
                              background: isCurrentTeam 
                                ? 'linear-gradient(90deg, rgba(0, 191, 165, 0.12), transparent)' 
                                : 'transparent',
                              position: 'relative',
                              alignItems: 'center'
                            }}
                          >
                            {isCurrentTeam && (
                              <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: '3px',
                                background: '#00bfa5'
                              }} />
                            )}
                            
                            {/* Position */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ 
                                color: isCurrentTeam ? '#00e6ff' : '#fff', 
                                fontWeight: 700,
                                fontSize: '0.95rem'
                              }}>
                                {row.position}
                              </span>
                            </div>
                            
                            {/* Squad Designation */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.875rem'
                            }}>
                              <div style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: `linear-gradient(135deg, hsl(${(row.position * 47 + 200) % 360}, 70%, 55%), hsl(${(row.position * 47 + 230) % 360}, 70%, 45%))`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                color: '#fff',
                                fontSize: '0.75rem',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}>
                                {row.team_name?.slice(0, 2).toUpperCase() || '??'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ 
                                  fontWeight: isCurrentTeam ? 700 : 500, 
                                  color: isCurrentTeam ? '#00e6ff' : '#e6fffa',
                                  fontSize: '0.95rem'
                                }}>
                                  {row.team_name}
                                </span>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  color: isCurrentTeam ? '#5eead4' : '#6b7280',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px'
                                }}>
                                  {isCurrentTeam ? 'YOUR SQUAD' : 'ACTIVE'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Payload */}
                            <div style={{
                              textAlign: 'right'
                            }}>
                              <div style={{
                                fontWeight: 800,
                                color: isCurrentTeam ? '#00e6ff' : '#fff',
                                fontSize: '1.25rem'
                              }}>
                                {row.score}
                              </div>
                              {row.position > 1 && (
                                <div style={{ 
                                  fontSize: '0.7rem', 
                                  color: '#22d3ee',
                                  fontWeight: 600
                                }}>
                                  {delta >= 0 ? `+${delta}` : delta} PTS
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
