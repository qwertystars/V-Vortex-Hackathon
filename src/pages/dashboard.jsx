import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BuildTeam from "../components/BuildTeam";
import "../styles/dashboard.css";
import logo from "/logo.jpg";
import { selectProblem } from "../utils/selectProblem";

export default function TeamDashboard() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [activeTab, setActiveTab] = useState("vortex");
  const [showSidebar, setShowSidebar] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Problem Statement Selection State
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedPS, setSelectedPS] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmittingSelection, setIsSubmittingSelection] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  
  // Calculated stats
  const myRank = leaderboard.find(row => row.team_name === team?.team_name)?.position ?? "—";
  const totalTeams = leaderboard.length;
  const topScore = leaderboard[0]?.score ?? 0;
  const myScore = scorecard?.total_score ?? 0;
  const gapToAlpha = myRank === 1 ? 0 : Math.max(0, topScore - myScore);

  // Problem Statements Data
  const problemStatements = {
    ai: [
      {
        id: 'ps1',
        code: 'PS 1',
        title: 'AI-Generated Image Authenticity Detection',
        description: 'Design a system that determines whether an image is AI-generated or real, remaining robust to compression, resizing, and post-processing, while providing confidence-aware and explainable authenticity assessments across diverse image sources.',
        totalSeats: 15,
        seatsBooked: 3
      },
      {
        id: 'ps2',
        code: 'PS 2',
        title: 'AI-Powered Mind Map Search Engine',
        description: 'Design a search system that retrieves information for a user query and organizes results into an interactive mind map, automatically revealing key concepts, subtopics, and relationships to support exploratory learning and research.',
        totalSeats: 12,
        seatsBooked: 8
      },
      {
        id: 'ps3',
        code: 'PS 3',
        title: 'AI-Powered Mental Well-Being Risk Indicator (Non-Clinical)',
        description: 'Design a non-clinical system that analyzes anonymized behavioral patterns over time to identify early mental well-being risk indicators, while preserving user privacy, avoiding medical diagnosis, and providing transparent, uncertainty-aware insights.',
        totalSeats: 10,
        seatsBooked: 10
      }
    ],
    fintech: [
      {
        id: 'fintech1',
        code: 'PS 1',
        title: 'Unified Payment Orchestration & Automated Settlements',
        description: 'Design and prototype a unified payment orchestration platform that allows merchants to accept payments across multiple channels through a single interface, while automating post-payment workflows such as settlements, refunds, splits, and conditional payouts using configurable logic.',
        totalSeats: 20,
        seatsBooked: 5
      },
      {
        id: 'fintech2',
        code: 'PS 2',
        title: 'Privacy-Preserving Collaborative Fraud Intelligence Platform',
        description: 'Design and prototype a real-time transaction monitoring and compliance intelligence platform that detects suspicious activity and assigns risk levels while enabling privacy-preserving collaboration across multiple independent entities.',
        totalSeats: 18,
        seatsBooked: 14
      },
      {
        id: 'fintech3',
        code: 'PS 3',
        title: 'Adaptive Pricing in Real-Time Digital Marketplaces',
        description: 'Design a real-time adaptive pricing system for digital marketplaces that continuously adjusts prices under uncertain and evolving demand conditions to maximize long-term business value while maintaining fairness, customer trust, and regulatory compliance.',
        totalSeats: 15,
        seatsBooked: 2
      }
    ],
    cybersecurity: [
      {
        id: 'cybersecurity1',
        code: 'PS 1',
        title: 'Secure Identity & Authentication',
        description: 'Design a privacy-preserving identity framework that enables verifiable authentication across services while minimizing centralized exposure and preserving user control.',
        totalSeats: 16,
        seatsBooked: 9
      },
      {
        id: 'cybersecurity2',
        code: 'PS 2',
        title: 'Automated Vulnerability Detection',
        description: 'Create a system that detects software and infrastructure vulnerabilities, correlates threat intelligence, and prioritizes remediation for high-risk exposures in distributed systems.',
        totalSeats: 14,
        seatsBooked: 6
      },
      {
        id: 'cybersecurity3',
        code: 'PS 3',
        title: 'Resilient Network Defense Architecture',
        description: 'Design defensive architectures and rapid incident response tooling to detect, contain, and recover from advanced cyber attacks targeting critical services and infrastructure.',
        totalSeats: 12,
        seatsBooked: 11
      }
    ],
    healthcare: [
      {
        id: 'healthcare1',
        code: 'PS 1',
        title: 'AI-Powered Early Disease Detection System',
        description: 'Create an intelligent diagnostic system that analyzes patient data, medical imaging, and biomarkers to detect early signs of chronic diseases, providing risk assessments and recommendations while maintaining HIPAA compliance and patient privacy.',
        totalSeats: 18,
        seatsBooked: 4
      },
      {
        id: 'healthcare2',
        code: 'PS 2',
        title: 'Telemedicine Platform with Remote Monitoring',
        description: 'Design a comprehensive telemedicine platform that integrates real-time patient monitoring, wearable device data, and virtual consultations to provide continuous care for patients with chronic conditions in remote or underserved areas.',
        totalSeats: 20,
        seatsBooked: 13
      },
      {
        id: 'healthcare3',
        code: 'PS 3',
        title: 'Medical Supply Chain Transparency System',
        description: 'Develop a blockchain-enabled supply chain tracking system for pharmaceuticals and medical equipment that ensures authenticity, prevents counterfeit products, and maintains complete traceability from manufacturer to patient.',
        totalSeats: 15,
        seatsBooked: 7
      }
    ],
    iot: [
      {
        id: 'iot1',
        code: 'PS 1',
        title: 'Sky-Glow Sentinel (Urban Light Pollution Mapping)',
        description: 'Urban light pollution creates skyglow that obscures stars and disrupts natural biological cycles. The objective is to design a high-sensitivity Sky Quality Monitoring system capable of accurately measuring night-sky brightness in urban environments.',
        totalSeats: 12,
        seatsBooked: 7
      },
      {
        id: 'iot2',
        code: 'PS 2',
        title: 'Decentralized Communication in Infrastructure-Denied Environments',
        description: 'Modern communication systems fail in environments without internet, cellular networks, Wi-Fi, or cloud access. The objective is to develop a decentralized, peer-to-peer hardware communication network that enables reliable data exchange.',
        totalSeats: 10,
        seatsBooked: 1
      },
      {
        id: 'iot3',
        code: 'PS 3',
        title: 'Smart Parking Occupancy Detection System',
        description: 'In urban areas, drivers spend significant time searching for vacant parking spaces, leading to traffic congestion and fuel wastage. The objective is to design a low-cost IoT-based system that detects parking spot occupancy in real time.',
        totalSeats: 16,
        seatsBooked: 11
      }
    ]
  };

  const domainNames = {
    ai: 'AI/ML - Artificial Intelligence & Machine Learning',
    fintech: 'FINTECH - Financial Technology & Digital Payments',
    cybersecurity: 'CYBERSECURITY - Security & Privacy',
    healthcare: 'HEALTHCARE - Medical Innovation & Digital Health',
    iot: 'IOT & ROBOTICS - Internet of Things & Robotics Systems'
  };

  const domainShortNames = {
    ai: 'AI/ML',
    fintech: 'FINTECH',
    cybersecurity: 'CYBERSECURITY',
    healthcare: 'HEALTHCARE',
    iot: 'IOT & ROBOTICS'
  };

  const domainIcons = {
    ai: '🖥️',
    fintech: '💰',
    cybersecurity: '🛡️',
    healthcare: '🏥',
    iot: '🤖'
  };

  /* ===============================
     AUTH + DATA FETCH
  =============================== */
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const [
          { data: teamData },
          { data: scoreData },
          { data: leaderboardData },
          { data: membersData }
        ] = await Promise.all([
          supabase.from("teams").select("*").eq("id", teamId).single(),
          supabase.from("scorecards").select("*").eq("team_id", teamId).single(),
          supabase.from("leaderboard_view").select("*").order("position", { ascending: true }),
          supabase.from("team_members").select("*").eq("team_id", teamId)
        ]);

        if (teamData) {
          const isLeader = teamData.lead_email === user.email;
          const isMember = membersData?.some(m => m.member_email === user.email);
          
          if (!isLeader && !isMember) {
            alert("You don't have access to this team dashboard.");
            navigate("/login");
            return;
          }
        }

        setTeam(teamData);
        setScorecard(scoreData || null);
        setLeaderboard(leaderboardData || []);
        setTeamMembers(membersData || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [teamId, navigate]);

  /* ===============================
     LIVE CLOCK
  =============================== */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  // Debug: ensure initial load state
  useEffect(() => {
    if (!loading) console.debug('dashboard loaded');
  }, [loading]);

  /* ===============================
     LOGOUT
  =============================== */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  /* ===============================
     PROBLEM STATEMENT HELPERS
  =============================== */
  const getSeatStatus = (ps) => {
    const seatsLeft = ps.totalSeats - ps.seatsBooked;
    const isFull = seatsLeft === 0;
    const seatPercentage = ps.totalSeats ? (seatsLeft / ps.totalSeats) * 100 : 0;
    
    let seatClass = 'seat-high';
    let seatColor = '#4ade80';
    let seatIcon = '✓';
    
    if (isFull) {
      seatClass = 'seat-full';
      seatColor = '#f87171';
      seatIcon = '✗';
    } else if (seatPercentage <= 25) {
      seatClass = 'seat-low';
      seatColor = '#fb923c';
      seatIcon = '⚠';
    } else if (seatPercentage <= 50) {
      seatClass = 'seat-medium';
      seatColor = '#facc15';
      seatIcon = '●';
    }
    
    return { seatsLeft, isFull, seatClass, seatColor, seatIcon, seatPercentage };
  };

  const getDomainGradient = (domain) => {
    const gradients = {
      ai: 'linear-gradient(to bottom right, #9333ea, #a855f7)',
      fintech: 'linear-gradient(to bottom right, #db2777, #ec4899)',
      cybersecurity: 'linear-gradient(to bottom right, #ea580c, #f97316)',
      healthcare: 'linear-gradient(to bottom right, #059669, #10b981)',
      iot: 'linear-gradient(to bottom right, #0891b2, #06b6d4)'
    };
    return gradients[domain];
  };

  // Calculate total seats for each domain
  const getDomainSeats = (domain) => {
    const statements = problemStatements[domain];
    const totalSeats = statements.reduce((sum, ps) => sum + ps.totalSeats, 0);
    const bookedSeats = statements.reduce((sum, ps) => sum + ps.seatsBooked, 0);
    const availableSeats = totalSeats - bookedSeats;
    const percentageAvailable = (availableSeats / totalSeats) * 100;
    
    return {
      totalSeats,
      bookedSeats,
      availableSeats,
      percentageAvailable,
      isFull: availableSeats === 0
    };
  };

  const handleDomainSelect = (domain) => {
    if (isSubmitted || isSubmittingSelection) return;
    const domainSeats = getDomainSeats(domain);
    if (domainSeats.isFull) return;
    setSelectedDomain(domain);
    setSelectedPS(null);
  };

  const handlePSSelect = (ps) => {
    if (isSubmitted || isSubmittingSelection) return;
    const { isFull } = getSeatStatus(ps);
    if (isFull) return;
    setSelectedPS(ps);
  };

  // NOTE: `handleConfirmSubmit` is used directly for submission.

  const handleConfirmSubmit = async () => {
    setIsSubmittingSelection(true);

    try {
      console.debug("Submitting problem selection", { teamId: team.id, domain: selectedDomain, ps: selectedPS });

      const payload = {
        teamId: team.id,
        domain: selectedDomain,
        psId: selectedPS.id,
        problemName: selectedPS.title,
        problemDescription: selectedPS.description,
      };

      setLastRequest(payload);
      setLastResponse(null);
      setLastError(null);

      // Call edge function to persist selection (only team lead should be able to do this)
      const resp = await selectProblem(payload);
      setLastResponse(resp || { success: true });

      // Refresh team data from DB
      const { data: refreshedTeam, error: teamError } = await supabase.from("teams").select("*").eq("id", team.id).single();
      if (teamError) throw teamError;
      setTeam(refreshedTeam);

      setIsSubmitted(true);
      // show immediate success info to user
      setSuccessInfo({ domain: selectedDomain, ps: selectedPS });
      // auto-hide after 6s
      setTimeout(() => setSuccessInfo(null), 6000);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit problem selection:", err);
      setLastError(err.message || String(err));
      alert(err.message || "Failed to save selection. Please try again.");
    } finally {
      setIsSubmittingSelection(false);
    }
  };

  const handleBackToDomains = () => {
    setSelectedPS(null);
    setSelectedDomain(null);
  };

  if (loading) {
    return <div className="loading">SYNCING VORTEX DATA…</div>;
  }

  return (
    <div className="dashboardWrapper">

      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebarLogo">
          <img src={logo} alt="V-VORTEX logo" className="sidebarLogoImg" />
          <span>HACKVORTEX</span>
        </div>
        <div className="sidebarSub">ALPHA SECTOR</div>

        <div className="sidebarNav">
          <button
            className={activeTab === "vortex" ? "active" : ""}
            onClick={() => { setActiveTab("vortex"); setShowSidebar(false); }}
          >
            Vortex Hub
          </button>

          <button
            className={activeTab === "buildTeam" ? "active" : ""}
            onClick={() => { setActiveTab("buildTeam"); setShowSidebar(false); }}
          >
            Build Your Team
          </button>

          <button
            className={activeTab === "leaderboard" ? "active" : ""}
            onClick={() => { setActiveTab("leaderboard"); setShowSidebar(false); }}
          >
            Leaderboard
          </button>

          <button
            className={activeTab === "nexus" ? "active" : ""}
            onClick={() => { setActiveTab("nexus"); setShowSidebar(false); }}
          >
            Nexus Entry
          </button>

          <button
            className={activeTab === "mission" ? "active" : ""}
            onClick={() => { setActiveTab("mission"); setShowSidebar(false); }}
          >
            IdeaVortex
          </button>
        </div>

        <div className="sidebarFooter">
          <div className="userCard">
            <strong>{team.lead_name}</strong>
            <div style={{ fontSize: "11px", color: "#e879f9" }}>
              Team Leader
            </div>
          </div>

          <button className="disconnectBtn" onClick={handleLogout}>
            DISCONNECT
          </button>
        </div>
      </aside>

      {showSidebar && <div className="sidebarOverlay" onClick={() => setShowSidebar(false)} /> }

      {/* ================= MAIN ================= */}
      <div className="mainArea">

        {/* HEADER */}
        <header className="mainHeader">
          <div className="headerLeft">
            <button className="menuBtn" onClick={() => setShowSidebar(s => !s)} aria-label="Toggle sidebar">☰</button>

            <div>
              <div className="headerTitle">
                {activeTab === "vortex" && "Vortex Hub"}
                {activeTab === "buildTeam" && "Build Your Team"}
                {activeTab === "leaderboard" && "Leaderboard"}
                {activeTab === "nexus" && "Nexus Entry"}
                {activeTab === "mission" && "IdeaVortex - Problem Statement Selector"}
              </div>

              <div className="headerSub">
                OPERATIONAL OBJECTIVE DECRYPTION
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div className="systemLabel">SYSTEM TIME</div>
            <div className="systemTime">{time}</div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <div className="pageContent">

          {/* ===== BUILD YOUR TEAM ===== */}
          {activeTab === "buildTeam" && (
            <BuildTeam 
              teamId={teamId}
              currentTeamName={team?.team_name}
              hasMembers={teamMembers.length > 0}
              team={team}
              teamMembers={teamMembers}
              onTeamBuilt={async () => {
                const [
                  { data: updatedTeam },
                  { data: updatedMembers },
                  { data: updatedLeaderboard }
                ] = await Promise.all([
                  supabase.from("teams").select("*").eq("id", teamId).single(),
                  supabase.from("team_members").select("*").eq("team_id", teamId),
                  supabase.from("leaderboard_view").select("*").order("position", { ascending: true })
                ]);
                
                setTeam(updatedTeam);
                setTeamMembers(updatedMembers || []);
                setLeaderboard(updatedLeaderboard || []);
                setActiveTab("vortex");
              }}
            />
          )}

          {/* ===== VORTEX HUB ===== */}
          {activeTab === "vortex" && (
            <div className="vortexHub">
              
              {teamMembers.length === 0 && (
                <div className="buildTeamPrompt" style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                  border: '2px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer'
                }} onClick={() => setActiveTab("buildTeam")}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔨</div>
                  <h3 style={{ color: '#e879f9', marginBottom: '0.5rem', fontSize: '1.4rem' }}>
                    Build Your Team First!
                  </h3>
                  <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
                    Your team is not complete yet. Click here to add members and set your team name.
                  </p>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: '8px',
                    color: '#e9d5ff',
                    fontWeight: '600'
                  }}>
                    Go to Build Your Team →
                  </div>
                </div>
              )}
              
              <div className="vortexGrid">
                <div className="vortexCard" onClick={() => setActiveTab("leaderboard")}>
                  <div className="vortexIcon">↗</div>
                  <h3>Leaderboard</h3>
                  <p>Analyze the competitive landscape and track your climb.</p>
                </div>

                <div className="vortexCard" onClick={() => setActiveTab("nexus")}>
                  <div className="vortexIcon">⌁</div>
                  <h3>Nexus Entry</h3>
                  <p>Generate encrypted access credentials.</p>
                </div>

                <div className="vortexCard" onClick={() => setActiveTab("mission")}>
                  <div className="vortexIcon">💡</div>
                  <h3>IdeaVortex</h3>
                  <p>Select your domain and problem statement.</p>
                </div>
              </div>

              <div className="teamSummary">
                <div className="teamLeft">
                  <div className="teamBadge">
                    {team.team_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2>{team.team_name}</h2>
                    <p>ELITE SQUAD · LIVE RANKING</p>
                  </div>
                </div>

                <div className="teamRight">
                  <span>CURRENT YIELD</span>
                  <strong>{scorecard?.total_score ?? "—"} PTS</strong>
                </div>
              </div>
              {team?.domain && team?.problem_statement && (
                <div style={{ maxWidth: 800, margin: '1rem auto 2rem', padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#22d3ee' }}>Assigned</div>
                    <div style={{ color: '#9ca3af' }}>{domainShortNames[team.domain] || team.domain} ·</div>
                    <div style={{ color: '#facc15', fontWeight: 700 }}>{team.problem_statement}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== LEADERBOARD ===== */}
          {activeTab === "leaderboard" && (
            <>
              <div className="statsGrid">
                <div className="statCard">
                  <div className="statLabel">TACTICAL RANK</div>
                  <div className="statValue">{myRank} <span className="statSub">/{totalTeams}</span></div>
                </div>
                <div className="statCard">
                  <div className="statLabel">ACCUMULATED DATA</div>
                  <div className="statValue">{scorecard?.total_score ?? "—"}</div>
                </div>
                <div className="statCard">
                  <div className="statLabel">GAP TO ALPHA</div>
                  <div className="statValue">{gapToAlpha} <span className="statSub">PTS</span></div>
                </div>
              </div>

              <div className="leaderboardTable">
                <div className="lbHeader">
                  <div>POSITION</div>
                  <div>SQUAD DESIGNATION</div>
                  <div style={{ textAlign: "right" }}>PAYLOAD</div>
                </div>

                {leaderboard.map((row) => {
                  const isYou = row.team_name === team.team_name;

                  const rankText =
                    row.position === 1 ? "ULTRA-1" :
                    row.position === 2 ? "ELITE-2" :
                    row.position === 3 ? "APEX-3" :
                    `#${row.position}`;

                  const rankClass =
                    row.position === 1 ? "rank-ultra" :
                    row.position === 2 ? "rank-elite" :
                    row.position === 3 ? "rank-apex" :
                    "rankDefault";

                  return (
                    <div key={row.team_name} className={`lbRow ${isYou ? "you" : ""}`}>
                      <div className={`rankBadge ${rankClass}`}>{rankText}</div>

                      <div className="teamCell">
                        <div className="teamIcon">
                          {row.team_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="teamMeta">
                          <strong>{row.team_name}</strong>
                          <span>{isYou ? "YOUR SQUAD" : "ACTIVE"}</span>
                        </div>
                      </div>

                      <div className="payload">
                        <strong>{row.score}</strong>
                        <div className={row.delta >= 0 ? "deltaUp" : "deltaDown"}>
                          {row.delta >= 0 ? "+" : ""}{row.delta} PTS
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ===== NEXUS ENTRY ===== */}
          {activeTab === "nexus" && (
            <div className="nexusWrapper">
              <div className="nexusCard">
                <div className="qrBox">
                  <div className="lockIcon">🔒</div>
                </div>

                <div className="nexusTitle">SQUAD: {team.team_name}</div>

                <div className="nexusDesc">
                  Authorized personnel must scan this encrypted vortex key
                  to gain access to the secure development environment.
                </div>

                <div className="nexusCodeBar">
                  HCK-2024-{team.team_name.slice(0, 2).toUpperCase()}-{team.id}-EPSILON
                </div>
              </div>
            </div>
          )}

          {/* ===== IDEAVORTEX - PROBLEM STATEMENT SELECTOR ===== */}
          {activeTab === "mission" && (
            <div className="ideaVortexWrapper" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              
              {/* Step 1: Domain Selection */}
              <section style={{ marginBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: 'linear-gradient(to right, #06b6d4, #9333ea)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: 'white',
                      fontFamily: 'Orbitron, sans-serif'
                    }}>01</span>
                    <h2 style={{
                      fontSize: '1.875rem',
                      fontWeight: 'bold',
                      color: 'white',
                      fontFamily: 'Orbitron, sans-serif',
                      margin: 0
                    }}>
                      CHOOSE YOUR <span style={{ color: '#00f5ff' }}>DOMAIN</span>
                    </h2>
                  </div>
                  <p style={{ color: '#9ca3af', maxWidth: '42rem', margin: '0 auto' }}>
                    Select the arena where your innovation will make its mark. Each domain presents unique challenges and opportunities for disruption.
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem',
                  marginBottom: '2rem'
                }}>
                  {/* AI/ML Domain */}
                  <div
                    onClick={() => {
                      if (isSubmitted) return;
                      handleDomainSelect('ai');
                    }}
                    style={{
                      position: 'relative',
                      background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.9) 0%, rgba(20, 20, 35, 0.8) 100%)',
                      border: selectedDomain === 'ai' ? '2px solid #f0ff00' : '1px solid rgba(0, 245, 255, 0.2)',
                      borderRadius: '1rem',
                      padding: '2rem',
                      cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      opacity: isSubmitted ? 0.5 : 1,
                      transition: 'all 0.4s ease',
                      boxShadow: selectedDomain === 'ai' ? '0 0 40px rgba(240, 255, 0, 0.4)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(to bottom right, #9333ea, #a855f7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '2rem' }}>🖥️</span>
                      </div>
                      <div>
                        <h3 style={{ color: '#c084fc', margin: 0, fontSize: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>AI/ML</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Artificial Intelligence & Machine Learning</p>
                      </div>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                      Push the boundaries of what's possible with intelligent systems. Solve real-world problems using cutting-edge AI algorithms.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '0.5rem',
                          background: 'rgba(219, 39, 119, 0.2)',
                          color: '#f9a8d4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>03</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Challenges</span>
                      </div>
                    </div>
                    {selectedDomain === 'ai' && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '2rem',
                        height: '2rem',
                        background: '#f0ff00',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>

                  {/* FINTECH Domain */}
                  <div
                    onClick={() => {
                      if (isSubmitted) return;
                      handleDomainSelect('fintech');
                    }}
                    style={{
                      position: 'relative',
                      background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.9) 0%, rgba(20, 20, 35, 0.8) 100%)',
                      border: selectedDomain === 'fintech' ? '2px solid #f0ff00' : '1px solid rgba(0, 245, 255, 0.2)',
                      borderRadius: '1rem',
                      padding: '2rem',
                      cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      opacity: isSubmitted ? 0.5 : 1,
                      transition: 'all 0.4s ease',
                      boxShadow: selectedDomain === 'fintech' ? '0 0 40px rgba(240, 255, 0, 0.4)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(to bottom right, #f97316, #f59e0b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '2rem' }}>💰</span>
                      </div>
                      <div>
                        <h3 style={{ color: '#fb923c', margin: 0, fontSize: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>FINTECH</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Financial Technology & Digital Payments</p>
                      </div>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                      Innovate payment flows, settlement systems and privacy-preserving financial services for the modern economy.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>03</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Challenges</span>
                      </div>
                    </div>
                    {selectedDomain === 'fintech' && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '2rem',
                        height: '2rem',
                        background: '#f0ff00',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>

                  {/* CYBERSECURITY Domain */}
                  <div
                    onClick={() => {
                      if (isSubmitted) return;
                      handleDomainSelect('cybersecurity');
                    }}
                    style={{
                      position: 'relative',
                      background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.9) 0%, rgba(20, 20, 35, 0.8) 100%)',
                      border: selectedDomain === 'cybersecurity' ? '2px solid #f0ff00' : '1px solid rgba(0, 245, 255, 0.2)',
                      borderRadius: '1rem',
                      padding: '2rem',
                      cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      opacity: isSubmitted ? 0.5 : 1,
                      transition: 'all 0.4s ease',
                      boxShadow: selectedDomain === 'cybersecurity' ? '0 0 40px rgba(240, 255, 0, 0.4)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(to bottom right, #0ea5a4, #0891b2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '2rem' }}>🛡️</span>
                      </div>
                      <div>
                        <h3 style={{ color: '#67e8f9', margin: 0, fontSize: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>CYBERSECURITY</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Security & Privacy</p>
                      </div>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                      Build systems and defenses to protect users and infrastructure from evolving threats while preserving privacy.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>03</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Challenges</span>
                      </div>
                    </div>
                    {selectedDomain === 'cybersecurity' && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '2rem',
                        height: '2rem',
                        background: '#f0ff00',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>

                  {/* HEALTHCARE Domain */}
                  <div
                    onClick={() => {
                      if (isSubmitted) return;
                      handleDomainSelect('healthcare');
                    }}
                    style={{
                      position: 'relative',
                      background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.9) 0%, rgba(20, 20, 35, 0.8) 100%)',
                      border: selectedDomain === 'healthcare' ? '2px solid #f0ff00' : '1px solid rgba(0, 245, 255, 0.2)',
                      borderRadius: '1rem',
                      padding: '2rem',
                      cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      opacity: isSubmitted ? 0.5 : 1,
                      transition: 'all 0.4s ease',
                      boxShadow: selectedDomain === 'healthcare' ? '0 0 40px rgba(240, 255, 0, 0.4)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(to bottom right, #06b6d4, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '2rem' }}>🏥</span>
                      </div>
                      <div>
                        <h3 style={{ color: '#60a5fa', margin: 0, fontSize: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>HEALTHCARE</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Medical Innovation & Digital Health</p>
                      </div>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                      Design patient-centered digital health solutions, remote monitoring, and AI-assisted diagnostics with privacy-first principles.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>03</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Challenges</span>
                      </div>
                    </div>
                    {selectedDomain === 'healthcare' && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '2rem',
                        height: '2rem',
                        background: '#f0ff00',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>

                  {/* IOT Domain */}
                  <div
                    onClick={() => {
                      if (isSubmitted) return;
                      handleDomainSelect('iot');
                    }}
                    style={{
                      position: 'relative',
                      background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.9) 0%, rgba(20, 20, 35, 0.8) 100%)',
                      border: selectedDomain === 'iot' ? '2px solid #f0ff00' : '1px solid rgba(0, 245, 255, 0.2)',
                      borderRadius: '1rem',
                      padding: '2rem',
                      cursor: isSubmitted ? 'not-allowed' : 'pointer',
                      opacity: isSubmitted ? 0.5 : 1,
                      transition: 'all 0.4s ease',
                      boxShadow: selectedDomain === 'iot' ? '0 0 40px rgba(240, 255, 0, 0.4)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(to bottom right, #0891b2, #06b6d4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '2rem' }}>🤖</span>
                      </div>
                      <div>
                        <h3 style={{ color: '#67e8f9', margin: 0, fontSize: '1.5rem', fontFamily: 'Orbitron, sans-serif' }}>IOT & ROBOTICS</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Internet of Things & Robotics Systems</p>
                      </div>
                    </div>
                    <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                      Build the connected future. Design intelligent systems that bridge the physical and digital worlds.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>03</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Challenges</span>
                      </div>
                    </div>
                    {selectedDomain === 'iot' && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '2rem',
                        height: '2rem',
                        background: '#f0ff00',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Step 2: Problem Statement Selection */}
              {selectedDomain && (
                <section style={{ marginBottom: '4rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        background: 'linear-gradient(to right, #ec4899, #06b6d4)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: 'white',
                        fontFamily: 'Orbitron, sans-serif'
                      }}>02</span>
                      <h2 style={{
                        fontSize: '1.875rem',
                        fontWeight: 'bold',
                        color: 'white',
                        fontFamily: 'Orbitron, sans-serif',
                        margin: 0
                      }}>
                        SELECT <span style={{ color: '#f0ff00' }}>PROBLEM STATEMENT</span>
                      </h2>
                    </div>
                    <p style={{ color: '#9ca3af', maxWidth: '42rem', margin: '0 auto' }}>
                      Choose your challenge wisely. Each statement presents a unique opportunity to innovate and make an impact.
                    </p>
                  </div>

                  <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
                    {problemStatements[selectedDomain]?.map((ps) => {
                      const { seatsLeft, isFull, seatClass, seatColor, seatIcon, seatPercentage } = getSeatStatus(ps);
                      
                      return (
                        <div
                          key={ps.id}
                          onClick={() => {
                            if (isFull || isSubmitted) return;
                            handlePSSelect(ps);
                          }}
                          style={{
                            position: 'relative',
                            background: selectedPS?.id === ps.id 
                              ? 'linear-gradient(135deg, rgba(240, 255, 0, 0.1) 0%, rgba(240, 255, 0, 0.05) 100%)'
                              : 'linear-gradient(135deg, rgba(15, 15, 30, 0.95) 0%, rgba(25, 25, 45, 0.8) 100%)',
                            border: selectedPS?.id === ps.id ? '1px solid #f0ff00' : '1px solid rgba(0, 245, 255, 0.15)',
                            borderLeft: selectedPS?.id === ps.id ? '4px solid #f0ff00' : '1px solid rgba(0, 245, 255, 0.15)',
                            borderRadius: '0.75rem',
                            padding: '1.5rem',
                            marginBottom: '1rem',
                            cursor: isFull || isSubmitted ? 'not-allowed' : 'pointer',
                            opacity: isFull || isSubmitted ? 0.5 : 1,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '1.25rem' }}>
                            <div style={{
                              width: '3.5rem',
                              height: '3.5rem',
                              borderRadius: '0.75rem',
                              background: getDomainGradient(selectedDomain),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              color: 'white',
                              fontFamily: 'Orbitron, sans-serif'
                            }}>
                              {ps.code.split(' ')[ps.code.split(' ').length - 1]}
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', marginBottom: '0.75rem' }}>
                                <h4 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: 'white', margin: 0, fontFamily: 'Orbitron, sans-serif' }}>
                                  {ps.title}
                                </h4>
                                
                                <div style={{
                                  border: `1px solid ${seatColor}`,
                                  borderRadius: '0.5rem',
                                  padding: '0.375rem 0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  flexShrink: 0,
                                  background: `${seatColor}20`
                                }}>
                                  <span style={{ color: seatColor, fontSize: '1.125rem' }}>{seatIcon}</span>
                                  <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: seatColor, fontWeight: 'bold', fontSize: '0.875rem', margin: 0, fontFamily: 'Orbitron, sans-serif' }}>
                                      {seatsLeft}/{ps.totalSeats}
                                    </p>
                                    <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>SEATS</p>
                                  </div>
                                </div>
                              </div>
                              
                              {isFull && (
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.375rem 0.75rem',
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                  borderRadius: '9999px',
                                  marginBottom: '0.75rem'
                                }}>
                                  <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.05em' }}>⚠️ FULLY BOOKED</span>
                                </div>
                              )}
                              
                              <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                                {ps.description}
                              </p>
                              
                              {!isFull && seatPercentage <= 25 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', color: '#fb923c', fontSize: '0.75rem' }}>
                                  <span>⏱️</span>
                                  <span style={{ fontWeight: '600' }}>FILLING FAST - Only {seatsLeft} seat{seatsLeft === 1 ? '' : 's'} remaining!</span>
                                </div>
                              )}
                            </div>
                            
                            {selectedPS?.id === ps.id && (
                              <div style={{
                                width: '2.5rem',
                                height: '2.5rem',
                                background: '#f0ff00',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                ✓
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Step 3: Submit Section */}
              {selectedDomain && selectedPS && (
                <section>
                  <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.9) 0%, rgba(20, 20, 35, 0.8) 100%)',
                      border: '1px solid #f0ff00',
                      borderRadius: '1rem',
                      padding: '2rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          background: 'rgba(240, 255, 0, 0.2)',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          ✓
                        </div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', margin: 0, fontFamily: 'Orbitron, sans-serif' }}>
                          SELECTION SUMMARY
                        </h3>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#4ade80' }} />
                          <span style={{ color: '#9ca3af' }}>TEAM:</span>
                          <span style={{ color: 'white', fontWeight: 'bold', fontFamily: 'Orbitron, sans-serif' }}>{team.team_name.toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#22d3ee' }} />
                          <span style={{ color: '#9ca3af' }}>DOMAIN:</span>
                          <span style={{ color: 'white', fontWeight: '600', fontFamily: 'Orbitron, sans-serif' }}>{domainShortNames[selectedDomain]}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#facc15' }} />
                          <span style={{ color: '#9ca3af' }}>CHALLENGE:</span>
                          <span style={{ color: '#facc15', fontWeight: '600', flex: 1 }}>{selectedPS.code}: {selectedPS.title}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      gap: '0.75rem'
                    }}>
                      <span style={{ color: '#f87171', fontSize: '1.25rem' }}>⚠️</span>
                      <div>
                        <p style={{ color: '#f87171', fontWeight: '600', margin: '0 0 0.25rem 0' }}>IRREVERSIBLE ACTION</p>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                          Once submitted, your selection cannot be changed. Choose wisely, innovator.
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isSubmitted || isSubmittingSelection}
                      aria-busy={isSubmittingSelection}
                      onClick={handleConfirmSubmit}
                      style={{
                        width: '100%',
                        padding: '1.25rem 2rem',
                        background: isSubmitted ? '#374151' : 'linear-gradient(to right, #9333ea, #7e22ce)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.125rem',
                        letterSpacing: '0.05em',
                        cursor: isSubmitted || isSubmittingSelection ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        fontFamily: 'Orbitron, sans-serif',
                        transition: 'all 0.3s ease',
                        opacity: isSubmittingSelection ? 0.9 : 1
                      }}
                    >
                      <span>{isSubmittingSelection ? '⏳' : '✓'}</span>
                      {isSubmittingSelection ? 'PROCESSING…' : 'CONFIRM SELECTION'}
                    </button>
                  </div>
                </section>
              )}

              {/* Confirmation modal removed: direct-submit UX enabled */}

              {/* Inline success banner (shows briefly after submission) */}
              {successInfo && (
                <div style={{
                  position: 'fixed',
                  right: 16,
                  top: 16,
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06), rgba(129, 140, 248, 0.06))',
                  border: '1px solid rgba(148,163,184,0.12)',
                  color: '#d1d5db',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  zIndex: 4000,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.6)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 20, color: '#34d399' }}>✓</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>Selection saved</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        {domainShortNames[successInfo.domain] || successInfo.domain} · {successInfo.ps?.code}: {successInfo.ps?.title}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
      {/* Dev debug panel removed to avoid lingering modal in UI */}
    </div>
  );
}

