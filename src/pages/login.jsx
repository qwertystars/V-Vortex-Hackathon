import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { routeForContext } from "../utils/authRouting";
import "../styles/login.css";
import logo from "/logo.jpg";

export default function Login({ setTransition: _setTransition }) {
  const navigate = useNavigate();
  const { user, context, loading, contextLoading } = useAuth();
  const [email, setEmail] = useState("");
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
    if (loading || contextLoading) return;
    if (user && context) {
      navigate(routeForContext(context));
    }
  }, [user, context, loading, contextLoading, navigate]);

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
  }, [showModal, handleModalOk]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send OTP to email using Supabase Auth
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
        }
      });

      if (otpError) {
        alert(`❌ Failed to send OTP: ${otpError.message}`);
        return;
      }

      // Store email for OTP verification page
      sessionStorage.setItem('loginEmail', email);
      
      // Show success modal
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
    <>
      {/* TOP MARQUEE - FIXED */}
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

      <div className={`loginWrapper ${isMobile ? 'mobile' : ''}`}>
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
            <label className="fieldLabel">
              ▸ COMMAND CENTER EMAIL ID
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

            <p className="helper">
              – Invited members: use the invite link sent to your email
            </p>

            <button className="submitBtn" type="submit">
              <span>⚡ ENTER THE ARENA • SEND BATTLE CODE ⚡</span>
            </button>
          </form>
        </div>
      </div>

      {/* STATUS BAR - FIXED BOTTOM */}
      <div className="statusBar">
        <div className="statusItem">
          <div className="statusDot"></div>
          <span>ARENA STATUS: LIVE & ELECTRIC</span>
        </div>
        <div className="statusItem">
          <span>SYSTEM TIME: <span id="system-time"></span></span>
        </div>
        <div className="statusItem">
          <span>LEGENDS IN THE MAKING: LOADING…</span>
        </div>
      </div>

      {/* MODAL */}
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
                <span>OK</span>
              </button>
              <button
                type="button"
                className="authBtn secondary"
                onClick={handleModalCancel}
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
