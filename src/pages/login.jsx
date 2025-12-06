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

  const modalRef = useRef(null);

  // handle modal confirmation — navigate to /otp and ensure modal closes
  const handleModalOk = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowModal(false);
    navigate("/otp");
  };

  const handleModalCancel = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowModal(false);
  };

  // keyboard handling while the modal is open
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

  // time updater
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
    <div className="loginWrapper">
      <VortexBackground />

      {/* TOP MARQUEE */}
      <div className="marquee-bar">
        <div className="marquee-track">
          <span>
            ⚡ 24 HOURS TO LEGENDARY STATUS • CODE LIKE YOUR DREAMS DEPEND ON IT
            • BUILD THE IMPOSSIBLE • SLEEP IS FOR THE WEAK • YOUR SQUAD, YOUR
            LEGACY • BREAK LIMITS, NOT RULES • INNOVATION NEVER SLEEPS •
          </span>
          <span>
            ⚡ 24 HOURS TO LEGENDARY STATUS • CODE LIKE YOUR DREAMS DEPEND ON IT
            • BUILD THE IMPOSSIBLE • SLEEP IS FOR THE WEAK • YOUR SQUAD, YOUR
            LEGACY • BREAK LIMITS, NOT RULES • INNOVATION NEVER SLEEPS •
          </span>
        </div>
      </div>

      {/* LOGIN BOX */}
      <div className="terminalBox">
        {/* HEADER */}
        <div className="terminalHeader">
          <div className="headerLeft">
            <img src={logo} className="headerLogo" />
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
            placeholder="champion@institute.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="helper">– Your official battle credentials</p>

          {/* TEAM NAME */}
          <label className="fieldLabel">▸ TEAM CALL SIGN (TEAM NAME)</label>
          <input
            className="inputField"
            placeholder="Enter your legendary squad name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
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

      {/* Simple modal — OK navigates to /otp, Cancel closes modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            padding: "20px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#0b0b0d",
              color: "#fff",
              width: "420px",
              maxWidth: "100%",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 6px 30px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalVerifyTitle"
          >
            <h2 id="modalVerifyTitle" style={{ marginBottom: 8 }}>Verify</h2>
            <p style={{ marginBottom: 18 }}>
              A battle code has been dispatched. Click OK to enter the auth gate.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                className="authBtn"
                onClick={handleModalOk}
              >
                OK
              </button>
              <button
                className="authBtn secondary"
                style={{
                  background: "transparent",
                  border: "1px solid #0affc2",
                  color: "#0affc2",
                }}
                type="button"
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
