import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useToast } from "../components/ui/CyberpunkToast";
import CyberpunkLoader from "../components/ui/CyberpunkLoader";
import "../styles/login.css";
import logo from "/logo.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [role, setRole] = useState("Team Leader");
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const modalRef = useRef(null);
  const { success, error, warning } = useToast();

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
  }, [showModal, handleModalOk]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!teamName.trim()) {
      errors.teamName = 'Team name is required';
    }

    if (!role.trim()) {
      errors.role = 'Please select a role';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      warning('Please fix the form errors');
      return;
    }

    setIsLoading(true);
    setLoadingStage("Verifying credentials...");

    try {
      // Use optimized authService for verification
      setLoadingStage("Authenticating team access...");

      const result = await authService.verifyTeamAndMember(
        teamName.trim(),
        email.trim().toLowerCase(),
        role.toLowerCase().replace(' ', '_')
      );

      setLoadingStage("Dispatching authentication code...");

      // Send OTP using optimized service
      const otpResult = await authService.sendOTP(
        email.trim().toLowerCase(),
        {
          userData: {
            team_id: result.team.id,
            role: role.toLowerCase().replace(' ', '_'),
            team_name: result.team.team_name
          }
        }
      );

      setLoadingStage("Securing session...");

      // Store session data for OTP page
      sessionStorage.setItem('loginEmail', email.trim().toLowerCase());
      sessionStorage.setItem('teamId', result.team.id);
      sessionStorage.setItem('role', role);
      sessionStorage.setItem('memberEmail', email.trim().toLowerCase());
      sessionStorage.setItem('memberRole', role.toLowerCase().replace(' ', '_'));

      setLoadingStage("");
      setIsLoading(false);

      // Show success feedback
      success(otpResult.message);

      // Brief delay before navigation for better UX
      setTimeout(() => {
        setShowModal(true);
      }, 500);

    } catch (err) {
      console.error('Login error:', err);
      setLoadingStage("");
      setIsLoading(false);

      // Provide specific error messages
      if (err.message.includes('credentials')) {
        error('Invalid credentials: Email does not match team records');
      } else if (err.message.includes('Team not found')) {
        error('Team not found. Please check your team name and try again.');
      } else if (err.message.includes('Member not found')) {
        error('Member not found. Please check your member email.');
      } else if (err.message.includes('OTP')) {
        error('Failed to send authentication code. Please try again.');
      } else {
        error('Authentication failed. Please try again.');
      }
    }
  };

  // Handle input changes with immediate validation feedback
  const handleInputChange = (field, value) => {
    setFormErrors(prev => ({ ...prev, [field]: '' }));

    switch(field) {
      case 'email':
        setEmail(value);
        break;
      case 'teamName':
        setTeamName(value);
        break;
      case 'role':
        setRole(value);
        break;
      default:
        break;
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
              className={`inputField ${formErrors.role ? 'error' : ''}`}
              value={role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="Team Leader">Team Leader</option>
              <option value="Team Member">Team Member</option>
            </select>
            <p className="helper">– Your designation in the squad</p>
            {formErrors.role && (
              <p className="error-message">{formErrors.role}</p>
            )}

            <label className="fieldLabel">
              {role === "Team Leader" ? "▸ TEAM LEADER EMAIL ID" : "▸ MEMBER EMAIL ID"}
            </label>
            <input
              className={`inputField ${formErrors.email ? 'error' : ''}`}
              type="email"
              placeholder="champion@institute.edu"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              autoComplete="email"
              required
              disabled={isLoading}
            />
            <p className="helper">– Your official battle credentials</p>
            {formErrors.email && (
              <p className="error-message">{formErrors.email}</p>
            )}

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
              disabled={isLoading}
            />
            <p className="helper">– Your battle identity</p>

            <label className="fieldLabel">▸ TEAM CALL SIGN (TEAM NAME)</label>
            <input
              className={`inputField ${formErrors.teamName ? 'error' : ''}`}
              placeholder="Enter your legendary squad name"
              value={teamName}
              onChange={(e) => handleInputChange('teamName', e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="helper">
              – The name that will echo through V-VORTEX history
            </p>
            {formErrors.teamName && (
              <p className="error-message">{formErrors.teamName}</p>
            )}

            <button
              className={`submitBtn ${isLoading ? 'loading' : ''}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-content">
                  <CyberpunkLoader
                    message={loadingStage || "PROCESSING..."}
                    type="dots"
                    inline={true}
                    size="small"
                  />
                </span>
              ) : (
                <span>⚡ ENTER THE ARENA • SEND BATTLE CODE ⚡</span>
              )}
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
