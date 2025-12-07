// src/pages/Register.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/register.css";
import logo from "/logo.jpg";
import submitSfxFile from "/vortex_music.m4a";

/**
 * Register page - Fully responsive for mobile, tablet, and desktop
 */
export default function Register() {
  // refs
  const canvasRef = useRef(null);
  const formWrapperRef = useRef(null);
  const vortexMessageRef = useRef(null);
  const submitSfxRef = useRef(null);
  const timeoutsRef = useRef([]);

  const navigate = useNavigate();

  // UI state
  const [teamSize, setTeamSize] = useState(2);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [teamSizeLabel, setTeamSizeLabel] = useState("2 members");
  const [sucked, setSucked] = useState(false);
  const [vortexVisible, setVortexVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // internal refs for animation state
  const stateRef = useRef({
    width: window.innerWidth,
    height: window.innerHeight,
    digits: [],
    ARMS: 8, // Reduced for mobile performance
    POINTS_PER_ARM: 30, // Reduced for mobile
    SPIRAL_TIGHTNESS: 0.28,
    baseSpeed: 0.00035, // Slightly slower for mobile
    speedFactor: 1,
    targetSpeedFactor: 1,
    rotationAngle: 0,
    lastTime: 0,
  });

  const [participants, setParticipants] = useState([]);

  // Detect mobile and adjust animation params
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Adjust animation params for mobile
      if (stateRef.current) {
        stateRef.current.ARMS = mobile ? 6 : 10;
        stateRef.current.POINTS_PER_ARM = mobile ? 25 : 40;
        stateRef.current.baseSpeed = mobile ? 0.0003 : 0.00045;
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Participants logic
  useEffect(() => {
    const others = Math.max(0, teamSize - 1);
    const arr = [];
    for (let i = 1; i <= others; i++) {
      arr.push({ name: "", reg: "" });
    }
    setParticipants(arr);
  }, [teamSize]);

  // Optimized Vortex Canvas for mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    function resize() {
      s.width = canvas.width = window.innerWidth;
      s.height = canvas.height = window.innerHeight;
      initDigits();
    }

    function randomBinary() {
      return Math.random() < 0.5 ? "0" : "1";
    }

    function initDigits() {
      s.digits.length = 0;
      const maxRadius = Math.min(s.width, s.height) * (isMobile ? 0.75 : 0.9);
      const minRadius = maxRadius * 0.08;

      for (let arm = 0; arm < s.ARMS; arm++) {
        const armOffset = (Math.PI * 2 * arm) / s.ARMS;
        for (let i = 0; i < s.POINTS_PER_ARM; i++) {
          const t = i / (s.POINTS_PER_ARM - 1);
          const radius = minRadius + t * (maxRadius - minRadius);
          const angle = armOffset + radius * s.SPIRAL_TIGHTNESS;
          const depth = t;
          const jitter = (Math.random() - 0.5) * (isMobile ? 4 : 8);

          s.digits.push({
            char: randomBinary(),
            baseRadius: radius + jitter,
            baseAngle: angle + (Math.random() - 0.5) * 0.06,
            depth,
            size: (isMobile ? 7 : 9) + depth * (isMobile ? 15 : 20),
            baseOpacity: 0.25 + (1 - Math.pow(depth, 0.5)) * 0.75,
            paletteIndex: Math.floor(Math.random() * 3),
          });
        }
      }
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

      ctx.fillStyle = "rgba(2, 6, 23, 0.2)"; // Slightly more opaque trail on mobile
      ctx.fillRect(0, 0, s.width, s.height);

      s.digits.forEach((d) => {
        const pulse = Math.sin(ts * 0.0005 + d.baseRadius * 0.008) * (isMobile ? 4 : 6);
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

        let hue = d.paletteIndex === 0 ? 190 : d.paletteIndex === 1 ? 325 : 283;
        const light = 55 + (1 - d.depth) * 14;

        ctx.font = `${d.size}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.shadowColor = `hsla(${hue}, 100%, 65%, ${opacity})`;
        ctx.shadowBlur = (isMobile ? 8 : 12) * (1 - d.depth);

        ctx.fillStyle = `hsla(${hue}, 100%, ${light}%, ${opacity})`;
        ctx.fillText(d.char, 0, 0);
        ctx.restore();

        if (Math.random() < (isMobile ? 0.0015 : 0.0025)) d.char = randomBinary();
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
  }, [isMobile]);

  // Dropdown handlers with mobile improvements
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen((v) => !v);
  };

  const closeDropdown = () => setDropdownOpen(false);

  const handlePickTeamSize = (val) => {
    setTeamSize(Number(val));
    setTeamSizeLabel(`${val} ${val === "1" ? "member" : "members"}`);
    closeDropdown();
  };

  const handleDropdownKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown(e);
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  };

  // Close dropdown on outside click (mobile friendly)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && formWrapperRef.current && !formWrapperRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [dropdownOpen]);

  const updateParticipant = (index, field, value) => {
    setParticipants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    if (submitSfxRef.current) {
      submitSfxRef.current.currentTime = 0;
      submitSfxRef.current.play().catch(() => {});
    }

    stateRef.current.targetSpeedFactor = isMobile ? 20 : 28;
    setSucked(true);

    const showDelay = isMobile ? 1800 : 2200;
    const visibleDuration = isMobile ? 4500 : 6000;

    const t1 = setTimeout(() => setVortexVisible(true), showDelay);
    const t2 = setTimeout(() => {
      setVortexVisible(false);
      setSucked(false);
    }, showDelay + visibleDuration);
    const t3 = setTimeout(() => navigate("/login"), showDelay + visibleDuration + 250);

    timeoutsRef.current.push(t1, t2, t3);
  };

  useEffect(() => {
    submitSfxRef.current = new Audio(submitSfxFile);
    submitSfxRef.current.preload = "auto";
    submitSfxRef.current.volume = 0.85; // Slightly lower for mobile speakers

    return () => {
      try {
        submitSfxRef.current.pause();
      } catch (e) {}
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
      <canvas id="vortexCanvas" ref={canvasRef} aria-hidden="true" />
      <div className="bg-overlay" />

      <div
        className={`form-wrapper${sucked ? " sucked" : ""}`}
        ref={formWrapperRef}
      >
        <div className="shell">
          {/* LEFT CARD - Mobile: Hidden or minimized */}
          <aside className={`panel left-panel${isMobile ? " mobile-hidden" : ""}`}>
            <div className="panel-header">
              <div className="logo-placeholder">
                <img src={logo} alt="V-VORTEX logo" className="logo-img" />
              </div>
              <div className="tagline">Hackathon Registration</div>
              <div className="title">V-VORTEX</div>
              <p className="subtitle">
                Assemble your crew. Enter the vortex. Build something the future will remember.
              </p>
            </div>

            <ul className="bullet-list">
              <li>Register a team of 2–4 innovators.</li>
              <li>One team leader per team with valid registration number.</li>
              <li>Use official institute names and registration numbers.</li>
            </ul>
          </aside>

          {/* RIGHT CARD - Mobile: Full width */}
          <section className={`panel right-panel${isMobile ? " mobile-full" : ""}`}>
            <form id="teamForm" onSubmit={handleSubmit}>
              <div className="section-label">Team details</div>

              <div className="field">
                <label htmlFor="teamName">Team name</label>
                <input
                  id="teamName"
                  name="teamName"
                  type="text"
                  className="input-base"
                  placeholder="e.g. Quantum Overdrive"
                  required
                />
              </div>

              <div className="section-label" style={{ marginTop: "0.6rem" }}>
                Team leader
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="leaderName">Leader name</label>
                  <input
                    id="leaderName"
                    name="leaderName"
                    type="text"
                    className="input-base"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="leaderReg">Leader registration no.</label>
                  <input
                    id="leaderReg"
                    name="leaderReg"
                    type="text"
                    className="input-base"
                    placeholder="Institute reg. no."
                    required
                  />
                </div>
              </div>

              <div className="section-label" style={{ marginTop: "0.8rem" }}>
                Team size & members
              </div>

              <div className="team-size-row">
                <span>Team size:</span>
                <div className="field dropdown-container" style={{ marginBottom: 0 }}>
                  <div className="dropdown" id="teamSizeDropdown">
                    <div
                      className="input-base dropdown-toggle"
                      tabIndex={0}
                      role="button"
                      onClick={toggleDropdown}
                      onKeyDown={handleDropdownKey}
                      aria-expanded={dropdownOpen}
                      onTouchStart={toggleDropdown} // Mobile touch support
                    >
                      <span id="teamSizeLabel">{teamSizeLabel}</span>
                      <span className="chevron">▾</span>
                    </div>

                    <ul
                      className={`dropdown-menu${dropdownOpen ? " open" : ""}`}
                      id="teamSizeMenu"
                      role="menu"
                    >
                      {[2, 3, 4].map((size) => (
                        <li
                          key={size}
                          className="dropdown-item"
                          data-value={size}
                          onClick={() => handlePickTeamSize(size)}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            handlePickTeamSize(size);
                          }}
                        >
                          <span>{size} {size === 1 ? "member" : "members"}{size === 4 ? " (max)" : ""}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <input type="hidden" id="teamSize" name="teamSize" value={teamSize} readOnly />
                </div>
              </div>

              <p className="hint">
                Leader is counted in team size. Maximum team size is 4. Add details for other members below.
              </p>

              <div className="participant-grid" id="participantsContainer">
                {participants.map((p, i) => (
                  <div className="participant-card" key={i}>
                    <div className="participant-title">Member {i + 1}</div>
                    <div className="field">
                      <label htmlFor={`memberName${i + 1}`}>Name</label>
                      <input
                        id={`memberName${i + 1}`}
                        name={`memberName${i + 1}`}
                        type="text"
                        className="input-base"
                        placeholder="Full name"
                        required
                        value={participants[i]?.name || ""}
                        onChange={(e) => updateParticipant(i, "name", e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`memberReg${i + 1}`}>Registration no.</label>
                      <input
                        id={`memberReg${i + 1}`}
                        name={`memberReg${i + 1}`}
                        type="text"
                        className="input-base"
                        placeholder="Institute reg. no."
                        required
                        value={participants[i]?.reg || ""}
                        onChange={(e) => updateParticipant(i, "reg", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="submit-btn">
                Enter the V-VORTEX
              </button>
            </form>
          </section>
        </div>
      </div>

      <div
        className={`vortex-message${vortexVisible ? " visible" : ""} ${isMobile ? "mobile" : ""}`}
        id="vortexMessage"
        ref={vortexMessageRef}
      >
        <div className="vortex-message-inner">
          <h2>VORTEX ENGAGED</h2>
          <p>
            Your squad has been swallowed by the <strong>VORTEX</strong>. The only way out is <strong>victory</strong>. Suit up.
          </p>
        </div>
      </div>
    </>
  );
}
