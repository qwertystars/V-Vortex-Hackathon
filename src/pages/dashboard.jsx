import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BuildTeam from "../components/BuildTeam";
import "../styles/dashboard.css";
import logo from "/logo.jpg";

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
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamBuilt, setTeamBuilt] = useState(false);
  
  // Calculated stats
  const myRank = leaderboard.find(row => row.team_name === team?.team_name)?.position ?? "—";
  const totalTeams = leaderboard.length;
  const topScore = leaderboard[0]?.score ?? 0;
  const myScore = scorecard?.total_score ?? 0;
  const gapToAlpha = myRank === 1 ? 0 : Math.max(0, topScore - myScore);


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
        const { data: teamData } = await supabase
          .from("teams")
          .select("*")
          .eq("id", teamId)
          .single();

        const { data: scoreData } = await supabase
          .from("scorecards")
          .select("*")
          .eq("team_id", teamId)
          .single();

        const { data: leaderboardData } = await supabase
          .from("leaderboard_view")
          .select("*")
          .order("position", { ascending: true });

        const { data: membersData } = await supabase
          .from("team_members")
          .select("*")
          .eq("team_id", teamId);

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

  /* ===============================
     LOGOUT
  =============================== */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
            The Mission
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
                {activeTab === "mission" && "The Mission"}
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
              onTeamBuilt={async () => {
                // Reload team data after building
                const { data: updatedTeam } = await supabase
                  .from("teams")
                  .select("*")
                  .eq("id", teamId)
                  .single();
                
                const { data: updatedMembers } = await supabase
                  .from("team_members")
                  .select("*")
                  .eq("team_id", teamId);
                
                setTeam(updatedTeam);
                setTeamMembers(updatedMembers || []);
                setActiveTab("vortex");
              }}
            />
          )}

          {/* ===== VORTEX HUB ===== */}
          {activeTab === "vortex" && (
            <div className="vortexHub">
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
                  <h3>The Mission</h3>
                  <p>Decrypt objectives and evaluation matrix.</p>
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

          {/* ===== THE MISSION ===== */}
          {activeTab === "mission" && (
            <div className="missionWrapper">

              <div className="missionTag">OBJECTIVE PRIMARY</div>

              <div className="missionTitle">
                Synthesize AI-Powered <br />
                <span>Eco-Intelligence</span>
              </div>

              <div className="missionGrid">

                <div className="missionCard">
                  <div className="reqTitle">Requirements</div>
                  <ul className="reqList">
                    <li><span className="reqDot">✓</span> Real-time neural tracking of carbon outputs</li>
                    <li><span className="reqDot">✓</span> Autonomous green-protocol recommendations</li>
                    <li><span className="reqDot">✓</span> IoT Matrix integration for global analytics</li>
                  </ul>
                </div>

                <div className="missionCard">
                  <div className="reqTitle">Evaluation Matrix</div>

                  <div className="evalRow">
                    <div className="evalHeader"><span>INNOVATION ALPHA</span><span>30%</span></div>
                    <div className="evalBar"><div className="evalFill" style={{ width: "30%" }} /></div>
                  </div>

                  <div className="evalRow">
                    <div className="evalHeader"><span>TECH EXECUTION</span><span>40%</span></div>
                    <div className="evalBar"><div className="evalFill" style={{ width: "40%" }} /></div>
                  </div>

                  <div className="evalRow">
                    <div className="evalHeader"><span>UI SYNAPSE</span><span>30%</span></div>
                    <div className="evalBar"><div className="evalFill" style={{ width: "30%" }} /></div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
