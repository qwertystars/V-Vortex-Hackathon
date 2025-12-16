import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/login.css";
// import VortexBackground from "../components/VortexBackground"; // Commented out - CSS now handles background effects
import logo from "/logo.jpg";

export default function Login({ setTransition }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [role, setRole] = useState("Team Leader");
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const modalRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleModalOk = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowModal(false);
    navigate("/otp");
  };

  const handleModalCancel = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowModal(false);
  };

  useEffect(() => {
    if (!showModal) return;
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        setShowModal(false);
      } else if (ev.key === "Enter") {
        handleModalOk(ev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal, handleModalOk]); // Added handleModalOk to dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Verify team exists with this email
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id, team_name, lead_email')
        .eq('team_name', teamName)
        .eq('lead_email', email)
        .single();

      if (teamError || !team) {
        alert('❌ Team not found. Please check your team name and email.');
        return;
      }

      // 2. Send OTP to email using Supabase Auth
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true, // Create auth user if doesn't exist
        }
      });

      if (otpError) {
        alert(`❌ Failed to send OTP: ${otpError.message}`);
        return;
      }

      // 3. Store email in sessionStorage for OTP verification page
      sessionStorage.setItem('loginEmail', email);
      sessionStorage.setItem('teamId', team.id);
      
      // 4. Show success modal
      setShowModal(true);
    } catch (error) {
      console.error('Login error:', error);
      alert('❌ An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    const el = document.getElementById("system-time");
    if (!el) return;

    const update = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString("en-GB", { hour12: false });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`loginWrapper ${isMobile ? 'mobile' : ''}`}>
      {/* VortexBackground removed - CSS now handles background effects with scanline and noise */}

      {/* TOP MARQUEE - Mobile optimized */}
      <div className="marquee-bar">
        <div className="marquee-track">
          <span>
            ⚡ 24 HOURS TO LEGENDARY STATUS • CODE LIKE YOUR DREAMS DEPEND ON IT • BUILD THE IMPOSSIBLE • SLEEP IS FOR THE WEAK • YOUR SQUAD, YOUR LEGACY • BREAK LIMITS, NOT RULES • INNOVATION NEVER SLEEPS •
          </span>
          <span aria-hidden="true">
            ⚡ 24 HOURS TO LEGENDARY STATUS • CODE LIKE YOUR DREAMS DEPEND ON IT • BUILD THE IMPOSSIBLE • SLEEP IS FOR THE WEAK • YOUR SQUAD, YOUR LEGACY • BREAK LIMITS, NOT RULES • INNOVATION NEVER SLEEPS •
          </span>
        </div>
      </div>

      {/* LOGIN BOX */}
      <div className="terminalBox">
        {/* HEADER */}
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
          ⟨ WARRIORS ASSEMBLE • THE ARENA AWAITS ⟩
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* ROLE DROPDOWN */}
          <label className="fieldLabel">▸ WARRIOR CLASS</label>
          <select
            className="inputField"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="Team Leader">Team Leader</option>
            <option value="Team Member">Team Member</option>
          </select>
          <p className="helper">– Your designation in the squad</p>

          {/* EMAIL - Dynamic label based on role */}
          <label className="fieldLabel">
            {role === "Team Leader" ? "▸ TEAM LEADER EMAIL ID" : "▸ MEMBER EMAIL ID"}
          </label>
          <input
            className="inputField"
            type="email"
            placeholder="champion@institute.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <p className="helper">– Your official battle credentials</p>

          {/* NAME - Dynamic label based on role */}
          <label className="fieldLabel">
            {role === "Team Leader" ? "▸ TEAM LEADER NAME" : "▸ MEMBER NAME"}
          </label>
          <input
            className="inputField"
            type="text"
            placeholder="Enter your warrior name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <p className="helper">– Your battle identity</p>

          {/* TEAM NAME */}
          <label className="fieldLabel">▸ TEAM CALL SIGN (TEAM NAME)</label>
          <input
            className="inputField"
            placeholder="Enter your legendary squad name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
          <p className="helper">
            – The name that will echo through V-VORTEX history
          </p>

          {/* BUTTON */}
          <button className="submitBtn" type="submit">
            ⚡ ENTER THE ARENA • SEND BATTLE CODE ⚡
          </button>
        </form>
      </div>

      {/* STATUS BAR */}
      <div className="statusBar">
        <div className="statusItem">
          <div className="statusDot"></div> ARENA STATUS: LIVE & ELECTRIC
        </div>
        <div className="statusItem">
          SYSTEM TIME: <span id="system-time"></span>
        </div>
        <div className="statusItem">LEGENDS IN THE MAKING: LOADING…</div>
      </div>

      {/* Mobile-optimized Modal */}
      {showModal && (
        <div
          className="mobile-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="mobile-modal-content"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalVerifyTitle"
          >
            <h2 id="modalVerifyTitle" className="modal-title">Verify</h2>
            <p className="modal-text">
              A battle code has been dispatched. Click OK to enter the auth gate.
            </p>
            <div className="modal-buttons">
              <button
                type="button"
                className="authBtn primary"
                onClick={handleModalOk}
              >
                OK
              </button>
              <button
                type="button"
                className="authBtn secondary"
                onClick={handleModalCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
