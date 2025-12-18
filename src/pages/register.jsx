import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
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

  const [teamSize, setTeamSize] = useState(2);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [teamSizeLabel, setTeamSizeLabel] = useState("2 members");
  const [sucked, setSucked] = useState(false);
  const [vortexVisible, setVortexVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("idle"); // idle | pending | finalizing | success | error
  const [registrationError, setRegistrationError] = useState("");
  const [registrationResult, setRegistrationResult] = useState(null);

  const [isVitChennai, setIsVitChennai] = useState("yes");
  const [eventHubId, setEventHubId] = useState("");

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

  const [participants, setParticipants] = useState([]);
  const submissionIdRef = useRef(null);

  useEffect(() => {
    const others = Math.max(0, teamSize - 1);
    const arr = [];
    for (let i = 1; i <= others; i++) arr.push({ name: "", reg: "", institution: "", email: "" });
    setParticipants(arr);
  }, [teamSize]);

  useEffect(() => {
    if (isVitChennai === "yes") {
      setEventHubId("");
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

  const toggleDropdown = () => setDropdownOpen((v) => !v);
  const closeDropdown = () => setDropdownOpen(false);

  const handlePickTeamSize = (val) => {
    const n = Number(val);
    setTeamSize(n);
    setTeamSizeLabel(`${val} ${val === 1 ? "member" : "members"}${val === 4 ? " (max)" : ""}`);
    closeDropdown();
  };

  const handleDropdownKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown();
    } else if (e.key === "Escape") {
      closeDropdown();
    }
  };

  useEffect(() => {
    function onDocClick(e) {
      if (!e.target.closest?.(".dropdown")) closeDropdown();
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const updateParticipant = (index, field, value) => {
    setParticipants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];

    const formData = new FormData(e.target);
    const teamName = formData.get("teamName");
    const leaderName = formData.get("leaderName");
    const leaderReg = formData.get("leaderReg");
    const leaderEmail = formData.get("leaderEmail");
    const receiptLink = formData.get("receiptLink");

    const members = participants.map((p, i) => ({
      name: formData.get(`memberName${i + 1}`),
      email: formData.get(`memberEmail${i + 1}`),
      reg: isVitChennai === "yes" ? formData.get(`memberReg${i + 1}`) : null,
      institution: isVitChennai === "no" ? formData.get(`memberInstitution${i + 1}`) : null,
    }));

    if (isVitChennai === "no" && !String(eventHubId || "").trim()) {
      alert("Please enter your VIT EventHub Unique ID.");
      return;
    }

    if (!receiptLink || !receiptLink.trim()) {
      alert("⚠️ Please provide a payment receipt link.");
      return;
    }

    const submissionId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    submissionIdRef.current = submissionId;

    setRegistrationError("");
    setRegistrationResult(null);
    setRegistrationStatus("pending");

    setIsSubmitting(true);
    setSubmitMessage("✅ Registration received. Entering the VORTEX...");

    if (submitSfxRef.current) {
      submitSfxRef.current.currentTime = 0;
      submitSfxRef.current.play().catch(() => {});
    }

    // Start the animation immediately (backend continues in parallel)
    stateRef.current.targetSpeedFactor = 28;
    setSucked(true);

    try {
      const showDelay = 2200;
      const visibleDuration = 6000;
      const minTotalDuration = showDelay + visibleDuration;
      const startedAt = Date.now();

      const t1 = setTimeout(() => setVortexVisible(true), showDelay);
      const t2 = setTimeout(() => {
        if (submissionIdRef.current === submissionId) {
          setRegistrationStatus((prev) => (prev === "pending" ? "finalizing" : prev));
        }
      }, minTotalDuration);

      timeoutsRef.current.push(t1, t2);

      // Backend registration runs while the animation plays
      const { data, error } = await supabase.functions.invoke("register-team", {
        body: {
          teamName,
          teamSize,
          isVitChennai,
          institution: isVitChennai === "no" ? eventHubId : null,
          eventHubId: isVitChennai === "no" ? eventHubId : null, // backwards compat for older functions
          leaderName,
          leaderReg: isVitChennai === "yes" ? leaderReg : null,
          leaderEmail,
          receiptLink,
          members,
        },
      });

      if (submissionIdRef.current !== submissionId) return;
      if (error) throw error;

      setRegistrationResult(data || null);
      setRegistrationStatus("success");

      // Ensure the animation has had time to play before navigating away.
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, minTotalDuration - elapsed);

      const t3 = setTimeout(() => {
        if (submissionIdRef.current === submissionId) {
          setVortexVisible(false);
          setSucked(false);
          navigate("/login");
        }
      }, remaining + 250);

      timeoutsRef.current.push(t3);
    } catch (error) {
      console.error("Registration error:", error);
      if (submissionIdRef.current !== submissionId) return;

      setIsSubmitting(false);
      setSubmitMessage("");
      setRegistrationStatus("error");
      setRegistrationError(error?.message || "Registration failed. Please try again.");

      // Bring the form back and show the overlay with the error
      stateRef.current.targetSpeedFactor = 1;
      setSucked(false);
      setVortexVisible(true);
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
                {isVitChennai === "yes" && (
                  <div className="field">
                    <label htmlFor="leaderReg">Leader registration no.</label>
                    <input
                      id="leaderReg"
                      name="leaderReg"
                      type="text"
                      className="input-base"
                      placeholder="VIT reg. no."
                      required={isVitChennai === "yes"}
                    />
                  </div>
                )}
              </div>

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

              <div className="field">
                <label htmlFor="receiptLink">Payment Receipt (Google Drive Link) *</label>
                <input
                  id="receiptLink"
                  name="receiptLink"
                  type="url"
                  className="input-base"
                  placeholder="https://drive.google.com/file/..."
                  required
                />
                <p className="hint" style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#00ffff' }}>
                  Upload your payment receipt to Google Drive and paste the shareable link here. Ensure the link is set to "Anyone with the link can view".
                </p>
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
                      id="dropdownToggle"
                    >
                      <span id="teamSizeLabel">{teamSizeLabel}</span>
                      <span className="chevron">▾</span>
                    </div>

                    <ul
                      className={`dropdown-menu${dropdownOpen ? " open" : ""}`}
                      id="teamSizeMenu"
                      role="menu"
                    >
                      <li className="dropdown-item" data-value="2" onClick={() => handlePickTeamSize(2)}>
                        <span>2 members</span>
                      </li>
                      <li className="dropdown-item" data-value="3" onClick={() => handlePickTeamSize(3)}>
                        <span>3 members</span>
                      </li>
                      <li className="dropdown-item" data-value="4" onClick={() => handlePickTeamSize(4)}>
                        <span>4 members (max)</span>
                      </li>
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
                      <label htmlFor={`memberEmail${i + 1}`}>Email</label>
                      <input
                        id={`memberEmail${i + 1}`}
                        name={`memberEmail${i + 1}`}
                        type="email"
                        className="input-base"
                        placeholder="member@institute.edu"
                        required
                        value={participants[i]?.email || ""}
                        onChange={(e) => updateParticipant(i, "email", e.target.value)}
                      />
                    </div>

                    {isVitChennai === "yes" ? (
                      <div className="field">
                        <label htmlFor={`memberReg${i + 1}`}>Registration no.</label>
                        <input
                          id={`memberReg${i + 1}`}
                          name={`memberReg${i + 1}`}
                          type="text"
                          className="input-base"
                          placeholder="VIT reg. no."
                          required={isVitChennai === "yes"}
                          value={participants[i]?.reg || ""}
                          onChange={(e) => updateParticipant(i, "reg", e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="field">
                        <label htmlFor={`memberInstitution${i + 1}`}>Institution</label>
                        <input
                          id={`memberInstitution${i + 1}`}
                          name={`memberInstitution${i + 1}`}
                          type="text"
                          className="input-base"
                          placeholder="College/University name"
                          required={isVitChennai === "no"}
                          value={participants[i]?.institution || ""}
                          onChange={(e) => updateParticipant(i, "institution", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

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
                {isSubmitting ? '⏳ Processing...' : 'Enter the V-VORTEX'}
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
          {registrationStatus === "error" ? (
            <>
              <h2 style={{ background: "linear-gradient(135deg, #fecaca 0%, #fb7185 45%, #ef4444 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                REGISTRATION FAILED
              </h2>
              <p style={{ color: "#fecdd3" }}>
                {registrationError || "Something went wrong while registering your team."}
              </p>
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.8rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => {
                    setVortexVisible(false);
                    setRegistrationStatus("idle");
                    setRegistrationError("");
                  }}
                  style={{ width: "auto", padding: "0.9rem 1.4rem", fontSize: "0.9rem" }}
                >
                  Back to form
                </button>
              </div>
            </>
          ) : registrationStatus === "finalizing" ? (
            <>
              <h2>FINALIZING</h2>
              <p>
                The VORTEX is still syncing your squad… hang tight. Do not close this window.
              </p>
            </>
          ) : (
            <>
              <h2>VORTEX ENGAGED</h2>
              <p>
                Your squad has been swallowed by the <strong>VORTEX</strong>. The only way out is{" "}
                <strong>victory</strong>. Suit up.
                {registrationResult?.insertedMemberCount ? (
                  <> <br /> <strong>{registrationResult.insertedMemberCount}</strong> members locked in.</>
                ) : null}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
