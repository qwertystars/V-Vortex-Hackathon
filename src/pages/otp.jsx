import { useState, useEffect } from "react";
import authService from "../services/authService";
import { useToast } from "../components/ui/CyberpunkToast";
import CyberpunkLoader from "../components/ui/CyberpunkLoader";
import "../styles/otp.css";
import VortexBackground from "../components/VortexBackground";
import logo from "/logo.jpg";
import { useNavigate } from "react-router-dom";

export default function OTP({ setTransition }) {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  // Get email from sessionStorage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('loginEmail');
    if (!storedEmail) {
      error('No login session found. Please login again.');
      navigate('/login');
      return;
    }
    setEmail(storedEmail);
  }, [navigate, error]);

  const handleVerify = async (e) => {
    e.preventDefault();

    // Reset error state
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Invalid battle code: Must be exactly 6 digits");
      warning('Battle code must be exactly 6 digits');
      return;
    }

    setIsLoading(true);
    setLoadingStage("Verifying battle code...");

    try {
      // Use optimized authService for OTP verification
      setLoadingStage("Authenticating credentials...");

      const result = await authService.verifyOTP(email, otp, {
        type: 'email',
        createProfile: true
      });

      setLoadingStage("Initializing secure session...");

      // Get session data
      const role = sessionStorage.getItem('role') || 'Team Leader';
      const teamId = sessionStorage.getItem('teamId');

      // Clean up session storage
      sessionStorage.removeItem('loginEmail');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('teamId');

      // Decide destination based on role
      const destination = role === 'Team Member' ? '/member' : `/dashboard/${teamId}`;

      setLoadingStage("Entering The Vortex...");

      // Show success message
      success(result.message);

      // Brief delay for better UX before navigation
      setTimeout(() => {
        if (setTransition) {
          setTransition(
            <div className="otpTransition">
              <CyberpunkLoader
                message="Entering The Vortex..."
                type="pulse"
                fullscreen={true}
                size="large"
              />
            </div>
          );

          setTimeout(() => {
            setTransition(null);
            navigate(destination);
          }, 2000);
        } else {
          navigate(destination);
        }
      }, 1000);

    } catch (err) {
      console.error('OTP verification error:', err);
      setLoadingStage("");
      setIsLoading(false);

      // Provide specific error messages
      if (err.message.includes('invalid') || err.message.includes('Invalid')) {
        setOtpError("Invalid battle code: Please check and try again");
        error('Invalid authentication code. Please check your email and try again.');
      } else if (err.message.includes('expired')) {
        setOtpError("Battle code expired: Please request a new one");
        error('Authentication code has expired. Please login again to get a new code.');
      } else {
        setOtpError("Verification failed: Please try again");
        error('Verification failed. Please try again or contact support.');
      }
    }
  };

  // Handle OTP input with validation
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setOtp(value.slice(0, 6)); // Limit to 6 digits
    setOtpError(""); // Clear error when user types
  };

  // Handle backspace key for OTP input
  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && otp.length === 0) {
      // Allow navigation back to login if OTP is empty
      navigate('/login');
    }
  };

  // Time updater
  useEffect(() => {
    const el = document.getElementById("otp-system-time");
    if (!el) return;

    const tick = () => {
      el.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="otpWrapper">
      <VortexBackground />

      {/* MARQUEE */}
      <div className="marquee-bar">
        <div className="marquee-track">
          <span>⚡ BATTLE CODE DEPLOYED • ENTER THE AUTH GATE • BECOME UNSTOPPABLE •</span>
          <span>⚡ BATTLE CODE DEPLOYED • ENTER THE AUTH GATE • BECOME UNSTOPPABLE •</span>
        </div>
      </div>

      {/* OTP BOX */}
      <div className="otpBox">
        <div className="otpHeader">
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

        <div className="otpSubtitle">
          ⟨ ENTER YOUR 6-DIGIT AUTHENTICATION CODE ⟩
        </div>

        <form onSubmit={handleVerify}>
          <label className="fieldLabel">▸ BATTLE AUTH CODE</label>
          <input
            className={`otpInput ${otpError ? 'error' : ''}`}
            placeholder="XXXXXX"
            maxLength={6}
            value={otp}
            onChange={handleOtpChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoComplete="one-time-code"
            autoFocus
          />

          {otpError && (
            <p className="otp-error">{otpError}</p>
          )}

          <p className="helper">– Found in your mission control center</p>

          {isLoading ? (
            <div className="loading-container">
              <CyberpunkLoader
                message={loadingStage || "VERIFYING..."}
                type="spinner"
                inline={true}
                size="small"
              />
            </div>
          ) : (
            <button
              type="submit"
              className={`verifyBtn ${otp.length === 6 ? 'ready' : ''}`}
              disabled={otp.length !== 6}
            >
              🌀 VERIFY & DIVE INTO THE VORTEX 🌀
            </button>
          )}

          {!isLoading && (
            <div className="backBtn" onClick={() => navigate("/login")}>
              ⟨ REGROUP • GO BACK ⟩
            </div>
          )}
        </form>
      </div>

      {/* STATUS BAR */}
      <div className="otpStatusBar">
        <div className="statusItem"><div className="statusDot"></div> AUTH GATE: ACTIVE</div>
        <div className="statusItem">SYSTEM TIME: <span id="otp-system-time"></span></div>
        <div className="statusItem">MISSION LOG: STANDBY...</div>
      </div>
    </div>
  );
}
