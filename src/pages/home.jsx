// src/pages/home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition"; // re-used pattern
import "../styles/home.css";
import logo from "/logo.jpg"; // use your project logo

export default function Home({ setTransition }) {
  const navigate = useNavigate();

  const goTo = (path) => {
    console.log("GO TO CLICKED:", path);
    setTransition(
      <PageTransition
        videoSrc="/transition.mp4"
        onFinished={() => {
          console.log("TRANSITION FINISHED");
          setTransition(null);
          navigate(path);
        }}
      />
    );
  };

  const rounds = {
    r1: {
      title: "ROUND 1: CONCEPTUALIZATION",
      desc: "The Ideathon will be conducted by the V-Vortex team via a dedicated platform. The problem statements will be displayed on January 7, 2026; with the problem statements for IOT and Robotics to be revealed sooner (by a week sooner) for better preparation.",
      blocks: {
        Rules: [
          "10–15 slides maximum",
          "Clear problem & solution",
          "Market & feasibility analysis",
          "Timeline: 07th Jan 2026 - 08th Jan 2026",
          "Mode: Online"
        ],
        Evaluation: [
          "Innovation (30%)",
          "Feasibility (25%)",
          "Market Impact (25%)",
          "Presentation (20%)",
        ],
      },
    },
    r2: {
      title: "ROUND 2: CONSTRUCTION",
      desc: "The hackathon will commence offline at VIT Chennai on January 9, 2025 from 9 AM onwards. Participants are requested to report to MG Auditorium before 8:30 AM in order to facilitate smooth registrations!!!",
      blocks: {
        Rules: ["No pre-written code", "Any tech stack allowed", "Mentors available"],
        Evaluation: ["Working Prototype (35%)", "Code Quality (25%)", "UX/UI (20%)"],
      },
    },
    r3: {
      title: "ROUND 3: VALIDATION",
      desc: "On January 10, 2026; the finalists will be selected for a exclusive investor pitch with the director of V-Nest and a team of industry domain experts.",
      blocks: {
        Pitch: ["10 min pitch + Q&A", "Selected teams pitch to Industry Entrepreneurs for feedback, mentorship & opportunities."],
        Rewards: ["₹ 15,000 Winner","₹ 7,000 First Runner-Up","₹ 5,000 Second Runner-Up","₹ 3,000 Special Mentions","Participation certificate For every participant in the finale", "Internships"],
      },
    },
  };

  const [activeRound, setActiveRound] = useState(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openModal(key) {
    setActiveRound(rounds[key]);
    document.body.style.overflow = "hidden";
  }

  function closeModal(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    setActiveRound(null);
    document.body.style.overflow = "";
  }

  // Inline styles to ensure modal layout works even if CSS isn't updated yet.
  // Prefer moving these to home.css, but inline ensures the layout/visual fix you requested.
  const overlayStyle = {
    position:  "fixed",
    inset: 0,
    display: activeRound ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(0deg, rgba(0,0,0,0.7), rgba(0,0,0,0.6))",
    zIndex: 1000,
    padding: "40px 20px",
    overflowY: "auto",
  };

  const modalStyle = {
    width: "100%",
    maxWidth: 1100,
    background: "linear-gradient(180deg, rgba(10,4,14,0.98) 0%, rgba(5,2,8,0.98) 100%)",
    border: "2px solid #00e6ff",
    borderRadius:   12,
    padding: "28px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
    color: "#9ffcff",
    position: "relative",
  };

  const headerBarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  };

  const titleStyle = {
    fontFamily: "'Courier New', Courier, monospace",
    fontWeight: 700,
    letterSpacing: 1.5,
    fontSize: 22,
    color: "#00e6ff",
    margin: 0,
  };

  const closeBtnStyle = {
    background: "#0b0b0b",
    color: "#00e6ff",
    border: "2px solid rgba(255,255,255,0.03)",
    height: 30,
    width: 30,
    borderRadius: 6,
    cursor: "pointer",
    fontSize:   18,
    lineHeight: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const bodyGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginTop: 16,
    alignItems: "start",
  };

  const blockTitleStyle = {
    color: "#e8fefe",
    fontWeight: 700,
    marginBottom: 8,
    letterSpacing: 0.6,
  };

  const listStyle = {
    margin: 0,
    paddingLeft: 20,
    color: "#bfeffb",
    lineHeight: 1.9,
  };

  return (
    <div className="vv-home">
      {/* scanline */}
      <div className="scanline" aria-hidden />

      {/* NAV */}
      <nav className="vv-nav">
        <div className="logo">
          <img src={logo} alt="V-VORTEX" />
          <h1>V-VORTEX</h1>
        </div>

        <div className="nav-buttons">
          <button className="nav-btn" onClick={() => goTo("/register")}>
            <span>⚡REGISTER</span>
          </button>
          <button className="nav-btn" onClick={() => goTo("/login")}>
            <span>🌀 LOGIN</span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="hero-content">
          <h2>V-VORTEX</h2>
          <p className="hero-subtitle">UNLEASH YOUR INNOVATION</p>
          <p className="hero-desc">
            The ultimate national-level hackathon from VIT Chennai where champions
            are forged, ideas become reality, and innovation knows no bounds.
            Join us for 24 hours of pure adrenaline, groundbreaking solutions,
            and the chance to etch your name in the hall of legends.
          </p>

          <div className="event-info">
            <div className="info-card">
              <h3>📍 VENUE</h3>
              <p>VIT Chennai</p>
            </div>
            <div className="info-card">
              <h3>📅 DATES</h3>
              <p>07th - 08th Jan -- IdeaVortex</p>
              <p>09th - 10th Jan -- HackVortex</p>
              <p>10th Jan -- PitchVortex</p>
            </div>
            <div className="info-card">
              <h3>⚡LEVEL</h3>
              <p>National</p>
            </div>
          </div>
        </div>
      </header>

      {/* DOMAINS */}
      <section className="domains">
        <h2 className="section-title">⟨ BATTLE DOMAINS ⟩</h2>
        <div className="domains-grid">
          <div className="domain-card"><div className="domain-icon">🤖</div><h3>AI/ML</h3></div>
          <div className="domain-card"><div className="domain-icon">🛡️</div><h3>Cybersecurity</h3></div>
          <div className="domain-card selected"><div className="domain-icon">🏥</div><h3>Healthcare</h3></div>
          <div className="domain-card"><div className="domain-icon">💰</div><h3>Fintech</h3></div>
          <div className="domain-card"><div className="domain-icon">🔌</div><h3>IoT & Robotics</h3></div>
        </div>
      </section>

      {/* EVALUATION / ROUNDS */}
      <section className="evaluation">
        <h2 className="section-title">⟨ PATH TO VICTORY ⟩</h2>
        <div className="rounds">
          {Object.keys(rounds).map((k, idx) => (
            <div
              className="round-card"
              key={k}
              onClick={() => openModal(k)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openModal(k);
              }}
            >
              <span className="round-number">0{idx + 1}</span>
              <h3>{`ROUND ${idx + 1}`}</h3>
              <p>{rounds[k].desc}</p>
              <a
                href="#"
                className="access"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openModal(k);
                }}
                aria-label={`Open ${rounds[k].title} details`}
              >
                ACCESS DATA →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM / COORDINATORS */}
      <section className="team">
        <h2 className="section-title">⟨ THE ARCHITECTS ⟩</h2>

        <div className="coordinator-section">
          <h3 className="coord-title">▸ FACULTY COORDINATOR</h3>
          <div className="coordinator-cards">
            <div className="coordinator-card">
              <div className="member-photo">DP</div>
              <h4 className="member-name">Dr. Pavithra Sekar</h4>
              <p className="member-role">Faculty Coordinator</p>
            </div>
            <div className="coordinator-card">
              <div className="member-photo">RP</div>
              <h4 className="member-name">Dr. Rama Parvathy</h4>
              <p className="member-role">Faculty Coordinator</p>
            </div>
          </div>
        </div>

        <div className="coordinator-section">
          <h3 className="coord-title" style={{paddingTop: "60px"}}>▸ STUDENT COORDINATORS</h3>
          <div className="coordinator-cards">
            <div className="coordinator-card">
              <div className="member-photo">SJ</div>
              <h4 className="member-name">Suggest Jayaraj S.A</h4>
              <p className="member-role">Student Coordinator</p>
              <p class="member-role">Feel free to reach out</p>
              <p className="member-role">+91 81226 54796</p>
            </div>
            <div className="coordinator-card">
              <div className="member-photo">PM</div>
              <h4 className="member-name">Prasanna M</h4>
              <p className="member-role">Student Coordinator</p>
              <p class="member-role">Need Help?</p>
              <p className="member-role">+91 97909 70726</p>
            </div>
          </div>
        </div>

        <h3 className="section-title alt" style={{paddingTop: "60px"}}>⟨ TEAM LEADS ⟩</h3>
        <div className="team-grid">
          <div className="team-member"><div className="member-photo">MS</div><h4 className="member-name">M. Shree</h4><p className="member-role">Team Lead Guests, Sponsorship & Awards Committee</p></div>
          <div className="team-member"><div className="member-photo">YG</div><h4 className="member-name">Yashwant Gokul</h4><p className="member-role">Technical Suppor Committee</p></div>
          <div className="team-member"><div className="member-photo">KD</div><h4 className="member-name">L. Kevin Daniel</h4><p className="member-role">Web Development Committee</p></div>
          <div className="team-member"><div className="member-photo">SJ</div><h4 className="member-name">Sanjay</h4><p className="member-role">Security Committee</p></div>
          <div className="team-member"><div className="member-photo">JK</div><h4 className="member-name">Jaidev Karthikeyan</h4><p className="member-role">Reg & Marketing Committee</p></div>
          <div className="team-member"><div className="member-photo">SV</div><h4 className="member-name">Suprajha V M</h4><p className="member-role">Design & Social Media Committee</p></div>
          <div className="team-member"><div className="member-photo">SN</div><h4 className="member-name">Sanjana</h4><p className="member-role">Design & Social Media Committee</p></div>
        </div>

        <h3 className="section-title special" style={{paddingTop: "60px"}}>⟨ DEV TEAM ⟩</h3>
        <div className="team-grid special-grid">
          <div className="team-member">
            <div className="member-photo">IM</div>
            <h4 className="member-name">Ibhan Mukherjee</h4>
            <p className="member-role">Special Contributor</p>
          </div>
          <div className="team-member">
            <div className="member-photo">DP</div>
            <h4 className="member-name">Devangshu Pandey</h4>
            <p className="member-role">Special Contributor</p>
          </div>
          <div className="team-member">
            <div className="member-photo">SG</div>
            <h4 className="member-name">Srijan Guchhait</h4>
            <p className="member-role">Special Contributor</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>🌀 V-VORTEX 2026 • WHERE LEGENDS ARE BORN 🌀</p>
        <p className="muted">VIT Chennai • National Level Hackathon</p>
      </footer>

      {/* Modal overlay */}
      <div
        className={`modal-overlay ${activeRound ? "active" :   ""}`}
        onClick={closeModal}
        role="dialog"
        aria-modal={activeRound ? "true" : "false"}
        aria-hidden={!activeRound}
        style={overlayStyle}
      >
        {activeRound && (
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={modalStyle}
          >
            <div style={headerBarStyle}>
              <h2 style={titleStyle}>{activeRound.title}</h2>
              <button
                onClick={closeModal}
                aria-label="Close details"
                style={closeBtnStyle}
              >
                ×
              </button>
            </div>

            <div style={{ fontStyle: "italic", color: "#bfeffb", marginBottom: 8 }}>
              "{activeRound.desc}"
            </div>

            <div style={{ height: 1, background: "rgba(255,255,255,0.03)", margin: "12px 0" }} />

            {/* Two column layout similar to the mock */}
            <div style={bodyGridStyle}>
              {Object.entries(activeRound.blocks).map(([heading, items]) => (
                <div key={heading}>
                  <h4 style={blockTitleStyle}>{heading.  toUpperCase()}</h4>
                  <ul style={listStyle}>
                    {items.map((it, i) => (
                      <li key={i} style={{ listStyleType: "none", marginBottom: 8 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width:   10,
                            height: 10,
                            background: "#ff2fe6",
                            borderRadius: 2,
                            marginRight: 10,
                            transform: "translateY(-1px)",
                          }}
                          aria-hidden
                        />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}









