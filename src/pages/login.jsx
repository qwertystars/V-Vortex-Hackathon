import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/login.css";
import logo from "/logo.jpg";

export default function Login({ setTransition }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [role, setRole] = useState("Team Leader");
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const modalRef = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleModalOk = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowModal(false);
    navigate("/otp");
  }, [navigate]);

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
  }, [showModal, handleModalOk]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Show immediate feedback
      setSubmitMessage("🔄 Verifying your credentials...");

      // Parallel validation: Check team verification while sending OTP
      let teamVerificationPromise;

      if (role === "Team Leader") {
        teamVerificationPromise = supabase
          .from('teams')
          .select('id, team_name, lead_email')
          .eq('team_name', teamName)
          .eq('lead_email', email)
          .single();
      } else {
        // Team Member - verify member exists and get team info in parallel
        teamVerificationPromise = supabase
          .from('team_members')
          .select(`
            team_id,
            teams!inner(id, team_name)
          `)
          .eq('member_email', email)
          .eq('teams.team_name', teamName)
          .single();
      }

      // Start OTP verification in parallel with team validation
      const [teamResult, otpResult] = await Promise.allSettled([
        teamVerificationPromise,
        supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false // Don't create new users during OTP
          }
        })
      ]);

      // Handle OTP result first (most critical for UX)
      if (otpResult.status === 'rejected' || otpResult.value.error) {
        alert('❌ Failed to send verification code. Please try again.');
        setIsSubmitting(false);
        setSubmitMessage("");
        return;
      }

      setSubmitMessage("📧 Verification code sent! Validating team information...");

      // Handle team validation result
      let team = null;

      if (teamResult.status === 'fulfilled' && teamResult.value.data) {
        if (role === "Team Leader") {
          team = teamResult.value.data;
        } else {
          // Extract team info from the join result
          team = teamResult.value.data.teams;
        }
      } else {
        const errorMsg = role === "Team Leader"
          ? "Team not found or leader email mismatch. Please check your team name and email."
          : "Member not found or team name mismatch. Please check your member email and team name.";
        alert(`❌ ${errorMsg}`);
        setIsSubmitting(false);
        setSubmitMessage("");
        return;
      }

      // Success! Both OTP sent and team validated
      setSubmitMessage("✅ Verification successful! Please check your email.");

      // 3. Store email and role in sessionStorage for OTP verification page
      sessionStorage.setItem('loginEmail', email);
      sessionStorage.setItem('teamId', team.id);
      sessionStorage.setItem('role', role);

      // 4. Show success modal
      setShowModal(true);
    } catch (error) {
      console.error('Login error:', error);
      alert('❌ An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitMessage("");
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

            <button className="submitBtn" type="submit" disabled={isSubmitting}>
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
