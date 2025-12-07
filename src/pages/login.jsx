import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import VortexBackground from "../components/VortexBackground";
import logo from "/logo.jpg";

export default function Login({ setTransition }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [teamName, setTeamName] = useState("");
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
  }, [showModal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
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
      <VortexBackground />

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
          {/* EMAIL */}
          <label className="fieldLabel">▸ SQUAD LEADER IDENTITY</label>
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
