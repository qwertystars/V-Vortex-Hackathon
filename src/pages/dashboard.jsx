import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { teamService } from "../services/team";

// Components
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import VortexHub from "../components/dashboard/VortexHub";
import Leaderboard from "../components/dashboard/Leaderboard";
import NexusEntry from "../components/dashboard/NexusEntry";
import Mission from "../components/dashboard/Mission";

import "../styles/dashboard.css";

export default function TeamDashboard() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Using context

  const [team, setTeam] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [activeTab, setActiveTab] = useState("vortex");
  const [showSidebar, setShowSidebar] = useState(false);
  
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
      // Check auth via context or redirect
      // (The useAuth hook handles initial session load, but we double check here)
      const currentEmail = sessionStorage.getItem('loginEmail');
      
      if (!currentEmail) {
        navigate("/login");
        return;
      }

      try {
        // Fetch Data in parallel
        const [teamData, scoreData, leaderboardData] = await Promise.all([
           teamService.getTeamDetails(teamId),
           teamService.getScorecard(teamId),
           teamService.getLeaderboard()
        ]);

        setTeam(teamData);
        setScorecard(scoreData || null);
        setLeaderboard(leaderboardData || []);
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
    await logout();
    navigate("/");
  };

  if (loading) {
    return <div className="loading">SYNCING VORTEX DATA…</div>;
  }

  return (
    <div className="dashboardWrapper">

      <Sidebar 
        showSidebar={showSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        team={team}
        handleLogout={handleLogout}
        closeSidebar={() => setShowSidebar(false)}
      />

      {/* ================= MAIN ================= */}
      <div className="mainArea">

        <DashboardHeader 
          activeTab={activeTab}
          setShowSidebar={setShowSidebar}
          time={time}
        />

        {/* ================= CONTENT ================= */}
        <div className="pageContent">

          {activeTab === "vortex" && (
            <VortexHub 
              setActiveTab={setActiveTab} 
              team={team} 
              scorecard={scorecard} 
            />
          )}

          {activeTab === "leaderboard" && (
            <Leaderboard 
              leaderboard={leaderboard} 
              team={team}
              myRank={myRank}
              totalTeams={totalTeams}
              gapToAlpha={gapToAlpha}
              scorecard={scorecard}
            />
          )}

          {activeTab === "nexus" && (
            <NexusEntry team={team} />
          )}

          {activeTab === "mission" && (
            <Mission />
          )}

        </div>
      </div>
    </div>
  );
}