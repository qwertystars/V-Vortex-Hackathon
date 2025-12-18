import React from 'react';

export default function Mission() {
  return (
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
  );
}
