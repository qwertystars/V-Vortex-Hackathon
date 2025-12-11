// src/pages/Register.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/register.css";
import logo from "/logo.jpg";
import submitSfxFile from "/vortex_music.m4a";

/**
 * Register page converted from the provided HTML (pixel-perfect).
 * Reference HTML: see uploaded file. :contentReference[oaicite:1]{index=1}
 */
export default function Register() {
  // refs
  const canvasRef = useRef(null);
  const formWrapperRef = useRef(null);
  const vortexMessageRef = useRef(null);
  const submitSfxRef = useRef(null); // <-- submit sfx ref
  const timeoutsRef = useRef([]); // <-- new: track timeout IDs

  const navigate = useNavigate(); // added

  // UI state
  const [teamSize, setTeamSize] = useState(2);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [teamSizeLabel, setTeamSizeLabel] = useState("2 members");
  const [sucked, setSucked] = useState(false);
  const [vortexVisible, setVortexVisible] = useState(false);

  // internal refs for animation state (avoids re-renders)
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

  // participants are computed from teamSize (leader included)
  const [participants, setParticipants] = useState([]);

  // ---------- PARTICIPANTS (leader counted) ----------
  useEffect(() => {
    const others = Math.max(0, teamSize - 1);
    const arr = [];
    for (let i = 1; i <= others; i++) {
      arr.push({ name: "", reg: "" });
    }
    setParticipants(arr);
  }, [teamSize]);

  // ---------- VORTEX CANVAS ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = stateRef.current;

    // resize helper
    function resize() {
      s.width = canvas.width = window.innerWidth;
      s.height = canvas.height = window.innerHeight;
      initDigits();
    }

    // binary helper
    function randomBinary() {
      return Math.random() < 0.5 ? "0" : "1";
    }

    // digits init
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

    // initial sizes + digits
    resize();
    window.addEventListener("resize", resize);

    // animation loop
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

        let hue = d.paletteIndex === 0 ? 190 : d.paletteIndex === 1 ? 325 : 283;
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

    // start
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, s.width, s.height);
    rafId = requestAnimationFrame(draw);

    // cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ---------- DROPDOWN HANDLERS ----------
  const toggleDropdown = () => setDropdownOpen((v) => !v);
  const closeDropdown = () => setDropdownOpen(false);

  const handlePickTeamSize = (val) => {
    setTeamSize(Number(val));
    setTeamSizeLabel(`${val} ${val === "1" ? "member" : "members"}`);
    setTimeout(() => {
      // re-render participants
      setParticipants((p) => {
        const others = Math.max(0, Number(val) - 1);
        const arr = [];
        for (let i = 1; i <= others; i++) arr.push({ name: "", reg: "" });
        return arr;
      });
    }, 0);
    closeDropdown();
  };

  // keyboard accessibility for dropdown
  const handleDropdownKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown();
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  };

  // ---------- PARTICIPANT FIELD CHANGE ----------
  const updateParticipant = (index, field, value) => {
    setParticipants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // ---------- FORM SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any existing timeouts to prevent duplicates if user resubmits quickly
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    // Get form data
    const formData = new FormData(e.target);
    const teamName = formData.get("teamName");
    const leaderName = formData.get("leaderName");
    const leaderReg = formData.get("leaderReg");
    const leaderEmail = formData.get("leaderEmail");

    // Prepare members array
    const members = participants.map((p, i) => ({
      name: formData.get(`memberName${i + 1}`),
      reg: formData.get(`memberReg${i + 1}`),
    }));

    try {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('register-team', {
        body: {
          teamName,
          teamSize,
          leaderName,
          leaderReg,
          leaderEmail,
          members,
        },
      });

      if (error) throw error;

      // 🔊 PLAY SUBMIT SOUND EFFECT
      if (submitSfxRef.current) {
        submitSfxRef.current.currentTime = 0;
        submitSfxRef.current.play().catch(() => {});
      }

      // 🌀 Turbo vortex effect
      stateRef.current.targetSpeedFactor = 28;

      // 💥 Suck animation
      setSucked(true);

      // Timings
      const showDelay = 2200;
      const visibleDuration = 6000;

      // Show final card
      const t1 = setTimeout(() => {
        setVortexVisible(true);
      }, showDelay);
      timeoutsRef.current.push(t1);

      // Hide final card and reset 'sucked'
      const t2 = setTimeout(() => {
        setVortexVisible(false);
        setSucked(false);
      }, showDelay + visibleDuration);
      timeoutsRef.current.push(t2);

      // Navigate shortly after vanish
      const t3 = setTimeout(() => {
        navigate("/login");
      }, showDelay + visibleDuration + 250);
      timeoutsRef.current.push(t3);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    }
  };

  // ---------- INITIALIZE SUBMIT SFX ----------
  useEffect(() => {
    submitSfxRef.current = new Audio(submitSfxFile);
    submitSfxRef.current.preload = "auto";
    // optional volume tweak:
    submitSfxRef.current.volume = 0.95;

    return () => {
      try {
        submitSfxRef.current.pause();
      } catch (e) {}
    };
  }, []);

  // clear timeouts on unmount
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

      <div
        className={`form-wrapper${sucked ? " sucked" : ""}`}
        ref={formWrapperRef}
      >
        <div className="shell">
          {/* LEFT CARD */}
          <aside className="panel">
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

          {/* RIGHT CARD */}
          <section className="panel">
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

              {/* LEADER EMAIL -- placed on the next line */}
              <div className="field">
                <label htmlFor="leaderEmail">Leader Email Address</label>
                <input
                  id="leaderEmail"
                  name="leaderEmail"
                  type="email"
                  className="input-base"
                  placeholder="leader@institute.edu"
                  required
                />
              </div>
              
              <div className="section-label" style={{ marginTop: "0.8rem" }}>
                Team size & members
              </div>

              <div className="team-size-row">
                <span>Team size:</span>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="dropdown" id="teamSizeDropdown">
                    <div
                      className="input-base dropdown-toggle"
                      tabIndex={0}
                      role="button"
                      onClick={toggleDropdown}
                      onKeyDown={handleDropdownKey}
                      aria-expanded={dropdownOpen}
                    >
                      <span id="teamSizeLabel">{teamSizeLabel}</span>
                      <span className="chevron">▾</span>
                    </div>

                    <ul
                      className={`dropdown-menu${dropdownOpen ? " open" : ""}`}
                      id="teamSizeMenu"
                      role="menu"
                    >
                      <li
                        className="dropdown-item"
                        data-value="2"
                        onClick={() => handlePickTeamSize(2)}
                      >
                        <span>2 members</span>
                      </li>
                      <li
                        className="dropdown-item"
                        data-value="3"
                        onClick={() => handlePickTeamSize(3)}
                      >
                        <span>3 members</span>
                      </li>
                      <li
                        className="dropdown-item"
                        data-value="4"
                        onClick={() => handlePickTeamSize(4)}
                      >
                        <span>4 members (max)</span>
                      </li>
                    </ul>
                  </div>

                  {/* hidden real value for compatibility */}
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

              <button type="submit" className="submit-btn">Enter the V-VORTEX</button>
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
          <h2>VORTEX ENGAGED</h2>
          <p>
            Your squad has been swallowed by the <strong>VORTEX</strong>. The only way out is <strong>victory</strong>. Suit up.
          </p>
        </div>
      </div>
    </>
  );
}
