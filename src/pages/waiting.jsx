import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/login.css";
import logo from "/logo.jpg";

export default function Waiting() {
  const navigate = useNavigate();

  useEffect(() => {
    const el = document.getElementById("waiting-time");
    if (!el) return;

    const update = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString("en-GB", { hour12: false });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <>
      <div className="marquee-bar">
        <div className="marquee-track">
          <span>⚡ ACCESS PENDING • AWAITING TEAM ASSIGNMENT •</span>
          <span aria-hidden="true">⚡ ACCESS PENDING • AWAITING TEAM ASSIGNMENT •</span>
        </div>
      </div>

      <div className="loginWrapper">
        <div className="terminalBox">
          <div className="terminalHeader">
            <div className="headerLeft">
              <img src={logo} className="headerLogo" alt="V-VORTEX logo" />
              <span className="title">V-VORTEX</span>
            </div>
            <div className="headerDots">
              <div className="dot d1"></div>
              <div className="dot d2"></div>
              <div className="dot d3"></div>
            </div>
          </div>

          <div className="sectionSubtitle">
            ⟨ SIGNAL RECEIVED • TEAM LINK PENDING ⟩
          </div>

          <p className="helper" style={{ marginBottom: "24px" }}>
            You're authenticated, but no team assignment is linked to this email yet.
            If you've been invited, use the invite link sent to your inbox. Otherwise,
            contact your team leader to request access.
          </p>

          <button className="submitBtn" type="button" onClick={handleLogout}>
            <span>DISCONNECT & RETURN TO LOGIN</span>
          </button>
        </div>
      </div>

      <div className="statusBar">
        <div className="statusItem">
          <div className="statusDot"></div>
          <span>ASSIGNMENT STATUS: WAITING</span>
        </div>
        <div className="statusItem">
          <span>SYSTEM TIME: <span id="waiting-time"></span></span>
        </div>
        <div className="statusItem">
          <span>COMMS: STANDBY</span>
        </div>
      </div>
    </>
  );
}
