import React from 'react';

export default function Leaderboard({ leaderboard, team, myRank, totalTeams, gapToAlpha, scorecard }) {
  return (
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
          const isYou = row.team_name === team?.team_name;

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
  );
}
