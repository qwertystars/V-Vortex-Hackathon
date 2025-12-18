import React from 'react';

export default function VortexHub({ setActiveTab, team, scorecard }) {
  return (
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
            {team?.team_name?.slice(0, 2).toUpperCase() || "XX"}
          </div>
          <div>
            <h2>{team?.team_name || "Unknown Team"}</h2>
            <p>ELITE SQUAD · LIVE RANKING</p>
          </div>
        </div>

        <div className="teamRight">
          <span>CURRENT YIELD</span>
          <strong>{scorecard?.total_score ?? "—"} PTS</strong>
        </div>
      </div>
    </div>
  );
}
