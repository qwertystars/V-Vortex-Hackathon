import { useState, useEffect } from "react";
import "../styles/otp.css";
import VortexBackground from "../components/VortexBackground";
import logo from "/logo.jpg";
import { useNavigate } from "react-router-dom";

export default function OTP({ setTransition }) {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("⚠ INVALID BATTLE CODE • MUST BE 6 DIGITS ⚠");
      return;
    }

    alert("🔥 AUTH VERIFIED • WELCOME TO THE VORTEX CHAMPION 🔥");

    // Optional transition effect
    if (setTransition) {
      setTransition(
        <div className="otpTransition">
          <span>Entering The Vortex...</span>
        </div>
      );

      setTimeout(() => {
        setTransition(null);
        navigate("/");
      }, 1200);
    } else {
      navigate("/");
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
            className="otpInput"
            placeholder="XXXXXX"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />

          <p className="helper">– Found in your mission control center</p>

          <button className="verifyBtn">🌀 VERIFY & DIVE INTO THE VORTEX 🌀</button>

          <div className="backBtn" onClick={() => navigate("/login")}>
            ⟨ REGROUP • GO BACK ⟩
          </div>
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
