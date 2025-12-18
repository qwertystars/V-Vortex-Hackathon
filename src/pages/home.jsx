// src/pages/home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition"; // re-used pattern
import "../styles/home.css";
import logo from "/logo.jpg"; // use your project logo

export default function Home({ setTransition }) {
  const navigate = useNavigate();

  const goTo = (path) => {
    // play your transition.mp4 then navigate (App will clear it via PageTransition onFinished)
    setTransition(
      <PageTransition
        videoSrc="/transition.mp4"
        onFinished={() => {
          setTransition(null);
          navigate(path);
        }}
      />
    );
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
              <p>8th - 9th January</p>
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
          <div className="round-card"><span className="round-number">01</span><h3>ROUND 1</h3><p>Online PPT Submission - Showcase your revolutionary idea and initial game plan. Let your innovation speak through slides that captivate and convince.</p></div>
          <div className="round-card"><span className="round-number">02</span><h3>ROUND 2</h3><p>Offline Hackathon - The real battle begins. 24 hours of non-stop coding, building, and creating. Transform your vision into reality.</p></div>
          <div className="round-card"><span className="round-number">03</span><h3>ROUND 3</h3><p>Shark Tank - Face the legends. Pitch your creation to industry experts. Prove your solution can change the world.</p></div>
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
              <h4 className="member-name">Sugeeth Jayaraj S.A</h4>
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
    </div>
  );
}




