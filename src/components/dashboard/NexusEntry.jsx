import React from 'react';

export default function NexusEntry({ team }) {
  if (!team) return null;
  
  return (
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
  );
}
