import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { routeForContext } from "../utils/authRouting";
import VortexBackground from "../components/VortexBackground";
import "../styles/otp.css";
import logo from "/logo.jpg";

export default function Invite() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Decrypting invite signal...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const acceptInvite = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      setStatus("Syncing invite credentials...");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("Invite exchange error:", exchangeError);
          setError("Invite link is invalid or expired. Request a fresh invite.");
          return;
        }
      } else {
        const { error: sessionError } = await supabase.auth.getSessionFromUrl({
          storeSession: true,
        });
        if (sessionError) {
          console.error("Invite session error:", sessionError);
          setError("Invite code missing or invalid. Please use the link from your email.");
          return;
        }
      }

      setStatus("Routing to your onboarding bay...");
      const { data: context, error: contextError } = await supabase.functions.invoke("get-my-context");
      if (contextError) {
        console.error("Context error:", contextError);
        setError("Unable to fetch your access context. Please sign in.");
        return;
      }

      navigate(routeForContext(context), { replace: true });
    };

    acceptInvite();
  }, [navigate]);

  return (
    <div className="otpWrapper">
      <VortexBackground />

      <div className="marquee-bar">
        <div className="marquee-track">
          <span>⚡ INVITE SIGNAL RECEIVED • AUTHENTICATING •</span>
          <span>⚡ INVITE SIGNAL RECEIVED • AUTHENTICATING •</span>
        </div>
      </div>

      <div className="otpBox">
        <div className="otpHeader">
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

        <div className="otpSubtitle">⟨ INVITATION HANDSHAKE ⟩</div>

        {!error ? (
          <p className="helper" style={{ textAlign: "center", fontSize: "14px" }}>
            {status}
          </p>
        ) : (
          <>
            <p className="helper" style={{ textAlign: "center", color: "#ff9bd5" }}>
              {error}
            </p>
            <button className="verifyBtn" onClick={() => navigate("/login")}>
              RETURN TO LOGIN
            </button>
          </>
        )}
      </div>

      <div className="otpStatusBar">
        <div className="statusItem"><div className="statusDot"></div> INVITE CHANNEL: OPEN</div>
        <div className="statusItem">SYSTEM TIME: LIVE</div>
        <div className="statusItem">MISSION LOG: INTAKE</div>
      </div>
    </div>
  );
}
