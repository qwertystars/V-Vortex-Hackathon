import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../styles/register.css";
import logo from "/logo.jpg";
import submitSfxFile from "/vortex_music.m4a";

export default function Register() {
  const canvasRef = useRef(null);
  const formWrapperRef = useRef(null);
  const vortexMessageRef = useRef(null);
  const submitSfxRef = useRef(null);
  const timeoutsRef = useRef([]);

  const navigate = useNavigate();
  const { user } = useAuth();

  const [sucked, setSucked] = useState(false);
  const [vortexVisible, setVortexVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const [isVitChennai, setIsVitChennai] = useState("yes");
  const [eventHubId, setEventHubId] = useState("");
  const [universityName, setUniversityName] = useState("");

  const stateRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
    digits: [],
    ARMS: 10,
    POINTS_PER_ARM: 40,
    SPIRAL_TIGHTNESS: 0.28,
    baseSpeed: 0.00045,
    speedFactor: 1,
    targetSpeedFactor: 1,
    rotationAngle: 0,
    lastTime: 0,
  });

  useEffect(() => {
    if (isVitChennai === "yes") {
      setEventHubId("");
      setUniversityName("");
    }
  }, [isVitChennai]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    function randomBinary() {
      return Math.random() < 0.5 ? "0" : "1";
    }

    function initDigits() {
      s.digits.length = 0;
      const maxRadius = Math.min(s.width, s.height) * 0.9;
      const minRadius = maxRadius * 0.06;

      for (let arm = 0; arm < s.ARMS; arm++) {
        const armOffset = (Math.PI * 2 * arm) / s.ARMS;
        for (let i = 0; i < s.POINTS_PER_ARM; i++) {
          const t = i / (s.POINTS_PER_ARM - 1);
          const radius = minRadius + t * maxRadius;
          const angle = armOffset + radius * s.SPIRAL_TIGHTNESS;
          const depth = t;
          const jitter = (Math.random() - 0.5) * 8;

          s.digits.push({
            char: randomBinary(),
            baseRadius: radius + jitter,
            baseAngle: angle + (Math.random() - 0.5) * 0.06,
            depth,
            size: 9 + depth * 20,
            baseOpacity: 0.28 + (1 - Math.pow(depth, 0.5)) * 0.85,
            paletteIndex: Math.floor(Math.random() * 3),
          });
        }
      }
    }

    function resize() {
      s.width = canvas.width = window.innerWidth;
      s.height = canvas.height = window.innerHeight;
      initDigits();
    }

    resize();
    window.addEventListener("resize", resize);

    let rafId;
    function draw(ts) {
      if (!s.lastTime) s.lastTime = ts;
      const dt = ts - s.lastTime;
      s.lastTime = ts;

      s.speedFactor += (s.targetSpeedFactor - s.speedFactor) * 0.04;
      s.rotationAngle += s.baseSpeed * s.speedFactor * dt;

      const cx = s.width / 2;
      const cy = s.height / 2;

      ctx.fillStyle = "rgba(2, 6, 23, 0.18)";
      ctx.fillRect(0, 0, s.width, s.height);

      s.digits.forEach((d) => {
        const pulse = Math.sin(ts * 0.0005 + d.baseRadius * 0.008) * 6;
        const radius = d.baseRadius + pulse;
        const angle = d.baseAngle + s.rotationAngle * (0.7 + 0.6 * (1 - d.depth));

        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;

        ctx.save();
        ctx.translate(x, y);

        const perspectiveScale = 0.75 + (1 - d.depth) * 0.6;
        ctx.scale(1, perspectiveScale);
        ctx.rotate(angle + Math.PI / 2);

        const flicker = 0.9 + Math.sin(ts * 0.006 + d.baseRadius * 0.02) * 0.18;
        const opacity = d.baseOpacity * flicker;

        const hue = d.paletteIndex === 0 ? 190 : d.paletteIndex === 1 ? 325 : 283;
        const light = 55 + (1 - d.depth) * 14;

        ctx.font = `${d.size}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.shadowColor = `hsla(${hue}, 100%, 65%, ${opacity})`;
        ctx.shadowBlur = 12 * (1 - d.depth);

        ctx.fillStyle = `hsla(${hue}, 100%, ${light}%, ${opacity})`;
        ctx.fillText(d.char, 0, 0);
        ctx.restore();

        if (Math.random() < 0.0025) d.char = randomBinary();
      });

      rafId = requestAnimationFrame(draw);
    }

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, s.width, s.height);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    const formData = new FormData(e.target);
    if (!user) {
      navigate("/login");
      return;
    }

    const teamName = formData.get("teamName");
    const leaderName = formData.get("leaderName");
    const leaderReg = formData.get("leaderReg");
    const receiptLink = formData.get("receiptLink");
    const leaderEmail = user.email;

    if (isVitChennai === "no" && !String(eventHubId || "").trim()) {
      alert("Please enter your VIT EventHub Unique ID.");
      return;
    }

    if (!receiptLink || !receiptLink.trim()) {
      alert("⚠️ Please provide a payment receipt link.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("⚡ Connecting to V-VORTEX mainframe...");

    try {
      setSubmitMessage("🔥 Your legion is being forged in digital fire...");
      const { error } = await supabase.functions.invoke("create-team", {
        body: {
          teamName,
          isVitChennai,
          eventHubId: isVitChennai === "no" ? eventHubId : null,
          universityName: isVitChennai === "no" ? universityName : "VIT Chennai",
          leaderName,
          leaderReg: isVitChennai === "yes" ? leaderReg : null,
          leaderEmail,
          receiptLink,
        },
      });

      if (error) throw error;

      setSubmitMessage("✅ LEGION REGISTERED! Prepare for battle...");

      if (submitSfxRef.current) {
        submitSfxRef.current.currentTime = 0;
        submitSfxRef.current.play().catch(() => {});
      }

      stateRef.current.targetSpeedFactor = 28;
      setSucked(true);

      const showDelay = 2200;
      const visibleDuration = 6000;

      const t1 = setTimeout(() => setVortexVisible(true), showDelay);
      const t2 = setTimeout(() => {
        setVortexVisible(false);
        setSucked(false);
      }, showDelay + visibleDuration);
      const t3 = setTimeout(() => navigate("/dashboard"), showDelay + visibleDuration + 250);

      timeoutsRef.current.push(t1, t2, t3);
    } catch (error) {
      console.error("Registration error:", error);
      setIsSubmitting(false);
      setSubmitMessage("");
      alert(`❌ Registration failed: ${error?.message || "Please try again."}`);
    }
  };

  useEffect(() => {
    submitSfxRef.current = new Audio(submitSfxFile);
    submitSfxRef.current.preload = "auto";
    submitSfxRef.current.volume = 0.95;

    return () => {
      try {
        submitSfxRef.current.pause();
      } catch (e) {
        // Ignore errors on cleanup
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  return (
    <>
      <canvas id="vortexCanvas" ref={canvasRef} />
      <div className="bg-overlay" />

      <div className={`form-wrapper${sucked ? " sucked" : ""}`} ref={formWrapperRef}>
        <div className="shell">
          <aside className="panel">
            <div className="panel-header">
              <div className="logo-placeholder">
                <img src={logo} alt="V-VORTEX logo" className="logo-img" />
              </div>
              <div className="tagline">Commander Registration Portal</div>
              <div className="title">V-VORTEX</div>
              <p className="subtitle">
                You stand at the threshold of legends. As commander, you will forge warriors into champions. Rally your elite squad and breach the vortex. Greatness is not given—it is seized.
              </p>
            </div>

            <ul className="bullet-list">
              <li>Every empire begins with a single command. This is yours.</li>
              <li>Lead with fire. Code with fury. Conquer with innovation.</li>
              <li>The vortex devours the weak. Only legends emerge victorious.</li>
            </ul>
          </aside>

          <section className="panel">
            <form id="teamForm" onSubmit={handleSubmit}>
              <div className="section-label">⚔️ Forge Your Legion's Identity</div>

              <div className="field">
                <label htmlFor="teamName">Legion Name</label>
                <input
                  id="teamName"
                  name="teamName"
                  type="text"
                  className="input-base"
                  placeholder="e.g. Quantum Reapers, Code Titans, Digital Warlords"
                  required
                />
              </div>

              <div className="field">
                <label>Are you from VIT Chennai?</label>

                <div className={`toggle-group${isVitChennai === "no" ? " no-selected" : ""}`} id="vitToggleGroup">
                  <div className="toggle-slider" />

                  <label className="toggle-option">
                    <input
                      type="radio"
                      name="isVitChennai"
                      value="yes"
                      checked={isVitChennai === "yes"}
                      onChange={() => setIsVitChennai("yes")}
                    />
                    <span className="toggle-label">
                      <span className="toggle-icon">✓</span>
                      Yes, VIT Chennai
                    </span>
                  </label>

                  <label className="toggle-option">
                    <input
                      type="radio"
                      name="isVitChennai"
                      value="no"
                      checked={isVitChennai === "no"}
                      onChange={() => setIsVitChennai("no")}
                    />
                    <span className="toggle-label">
                      <span className="toggle-icon">✕</span>
                      No, Other College
                    </span>
                  </label>
                </div>
              </div>

              {isVitChennai === "no" && (
                <div className="field college-field" id="collegeField">
                  <label htmlFor="eventHubId">VIT EventHub Unique ID</label>
                  <input
                    id="eventHubId"
                    name="eventHubId"
                    type="text"
                    className="input-base"
                    placeholder="Enter your EventHub Unique ID"
                    required
                    value={eventHubId}
                    onChange={(e) => setEventHubId(e.target.value)}
                  />
                </div>
              )}

              {isVitChennai === "no" && (
                <div className="field college-field">
                  <label htmlFor="universityName">College / University Name</label>
                  <input
                    id="universityName"
                    name="universityName"
                    type="text"
                    className="input-base"
                    placeholder="Enter your institution name"
                    required
                    value={universityName}
                    onChange={(e) => setUniversityName(e.target.value)}
                  />
                </div>
              )}

              <div className="section-label" style={{ marginTop: "0.6rem" }}>
                🛡️ Commander Credentials
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="leaderName">Your Name, Commander</label>
                  <input
                    id="leaderName"
                    name="leaderName"
                    type="text"
                    className="input-base"
                    placeholder="The one who leads the charge"
                    required
                  />
                </div>
                {isVitChennai === "yes" && (
                  <div className="field">
                    <label htmlFor="leaderReg">Battle ID</label>
                    <input
                      id="leaderReg"
                      name="leaderReg"
                      type="text"
                      className="input-base"
                      placeholder="Your VIT warrior code"
                      required={isVitChennai === "yes"}
                    />
                  </div>
                )}
              </div>

              <div className="field">
                <label htmlFor="leaderEmail">Command Center Contact</label>
                <input
                  id="leaderEmail"
                  name="leaderEmail"
                  type="email"
                  className="input-base"
                  placeholder="commander@warzone.com"
                  value={user?.email ?? ""}
                  disabled
                />
              </div>

              <div className="field">
                <label htmlFor="receiptLink">⚡ Battle Entry Pass (Payment Proof)</label>
                <input
                  id="receiptLink"
                  name="receiptLink"
                  type="url"
                  className="input-base"
                  placeholder="https://drive.google.com/file/..."
                  required
                />
                <p className="hint" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#00ffff' }}>
                  Upload your payment receipt to Google Drive. Share the link with view access. This is your key to the battlefield.
                </p>
              </div>

              <p className="hint" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#7cf0ff' }}>
                Teams must have 2–4 members (including the leader). Invite at least one member after creation.
              </p>

              {isSubmitting && (
                <div className="submit-message" style={{
                  textAlign: 'center',
                  padding: '1rem',
                  marginBottom: '1rem',
                  background: 'rgba(0, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#00ffff',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                  {submitMessage}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={isSubmitting} style={{
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}>
                {isSubmitting ? '⚡ INITIALIZING...' : '⚔️ ENTER THE ARENA'}
              </button>
            </form>
          </section>
        </div>
      </div>

      <div
        className={`vortex-message${vortexVisible ? " visible" : ""}`}
        id="vortexMessage"
        ref={vortexMessageRef}
      >
        <div className="vortex-message-inner">
          <h2>🔥 COMMANDER INITIATED 🔥</h2>
          <p>
            Your <strong>LEGION</strong> has been inscribed in the annals of the VORTEX. The arena trembles at your approach. Assemble your warriors. The battle for <strong>GLORY</strong> begins now. <strong>VICTORY OR VALHALLA.</strong>
          </p>
        </div>
      </div>
    </>
  );
}
