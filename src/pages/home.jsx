// src/pages/home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/PageTransition";
import "../styles/home.css";
import logo from "/logo.jpg";

export default function Home({ setTransition }) {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRound, setCurrentRound] = useState(null);

  const goTo = (path) => {
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

  const roundData = {
    round1: {
      title: "ROUND 1: CONCEPTUALIZATION",
      subtitle: "Online PPT Submission",
      description: "Submit your vision to our digital gateway for initial processing.",
      sections: [
        {
          heading: "Rules & Guidelines",
          items: [
            "Submit a comprehensive PPT (10-15 slides maximum)",
            "Clearly articulate your problem statement and proposed solution",
            "Include market research and feasibility analysis",
            "Demonstrate innovation and uniqueness of your approach",
            "Submission deadline: 3rd January 2026, 11:59 PM"
          ]
        },
        {
          heading: "Timeline",
          text: "Registration opens: 15th Dec 2025<br/>Submission: 20th Dec - 3rd Jan 2026<br/>Results: 5th Jan 2026"
        },
        {
          heading: "Evaluation Metrics",
          items: [
            "Innovation & Creativity (30%)",
            "Technical Feasibility (25%)",
            "Market Potential (25%)",
            "Presentation Quality (20%)"
          ]
        }
      ]
    },
    round2: {
      title: "ROUND 2: CONSTRUCTION",
      subtitle: "Offline Hackathon",
      description: "24-hour intensive coding marathon at VIT Chennai. Transform vision into code.",
      sections: [
        {
          heading: "Rules & Guidelines",
          items: [
            "24-hour intensive coding at VIT Chennai campus",
            "Teams must be present throughout the entire duration",
            "Use any programming language or framework",
            "Pre-written code is strictly prohibited",
            "Access to mentors and technical support provided"
          ]
        },
        {
          heading: "Timeline",
          text: "Check-in: 7th Jan, 9:00 AM<br/>Hacking: 7th Jan 11:00 AM to 8th Jan 11:00 AM<br/>Freeze: 8th Jan, 12:00 PM"
        },
        {
          heading: "Evaluation Metrics",
          items: [
            "Working Prototype (35%)",
            "Code Quality & Architecture (25%)",
            "Innovation (20%)",
            "UX/UI Design (20%)"
          ]
        }
      ]
    },
    round3: {
      title: "ROUND 3: VALIDATION",
      subtitle: "Shark Tank Pitch",
      description: "Face the titans of industry and secure your victory in the final arena.",
      sections: [
        {
          heading: "Rules & Guidelines",
          items: [
            "10-minute pitch + 10-minute Q&A session",
            "Live working prototype demonstration required",
            "Present business model and monetization strategy",
            "Professional attire recommended",
            "Explain scalability and impact"
          ]
        },
        {
          heading: "Victory Rewards",
          items: [
            "Winner: ₹1,00,000 + Trophy + Certificates",
            "Runner Up: ₹50,000 + Trophy",
            "Special Category Awards and Goodies",
            "Internship opportunities with partners"
          ]
        },
        {
          heading: "Final Timeline",
          text: "Prep: 8th Jan, 1:00 PM - 3:00 PM<br/>Pitching: 3:00 PM - 7:00 PM<br/>Awards: 8:00 PM"
        }
      ]
    }
  };

  const openModal = (roundKey) => {
    setCurrentRound(roundKey);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentRound(null);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const renderModalContent = () => {
    if (!currentRound) return null;
    const data = roundData[currentRound];

    return (
      <div className="modal-header">
        <h2 className="modal-title font-orbitron">{data.title}</h2>
        <p className="modal-subtitle">{data.subtitle}</p>
        <div className="modal-divider"></div>
        <p className="modal-description">"{data.description}"</p>
        
        <div className="modal-sections">
          {data.sections.map((section, idx) => (
            <div key={idx} className="modal-section">
              <h4>{section.heading}</h4>
              {section.items ? (
                <ul>
                  {section.items.map((item, i) => (
                    <li key={i}>
                      <span className="bullet">▶</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: section.text }} />
              )}
            </div>
          ))}
        </div>
      </div>
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
              <p>7th - 8th January</p>
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
          <div className="domain-card"><div className="domain-icon">⛓️</div><h3>Blockchain</h3></div>
          <div className="domain-card"><div className="domain-icon">🛡️</div><h3>Cybersecurity</h3></div>
          <div className="domain-card selected"><div className="domain-icon">🏥</div><h3>Healthcare</h3></div>
          <div className="domain-card"><div className="domain-icon">💰</div><h3>Fintech</h3></div>
          <div className="domain-card"><div className="domain-icon">🔌</div><h3>IoT & Robotics</h3></div>
        </div>
      </section>

      {/* EVALUATION / ROUNDS - UPDATED WITH MODAL */}
      <section className="evaluation">
        <h2 className="section-title">⟨ PATH TO VICTORY ⟩</h2>
        <div className="rounds-grid">
          <div className="round-card-modal" onClick={() => openModal('round1')}>
            <div className="scanline-card"></div>
            <div className="round-number-large">01</div>
            <h3 className="font-orbitron text-xl">ROUND 1</h3>
            <p className="mt-4 text-sm text-gray-400">Online PPT Submission - Showcase your revolutionary idea and initial game plan.</p>
            <div className="access-data">Access Data <span>→</span></div>
          </div>

          <div className="round-card-modal" onClick={() => openModal('round2')}>
            <div className="scanline-card"></div>
            <div className="round-number-large">02</div>
            <h3 className="font-orbitron text-xl">ROUND 2</h3>
            <p className="mt-4 text-sm text-gray-400">Offline Hackathon - 24 hours of non-stop coding, building, and creating.</p>
            <div className="access-data">Access Data <span>→</span></div>
          </div>

          <div className="round-card-modal" onClick={() => openModal('round3')}>
            <div className="scanline-card"></div>
            <div className="round-number-large">03</div>
            <h3 className="font-orbitron text-xl">ROUND 3</h3>
            <p className="mt-4 text-sm text-gray-400">Shark Tank - Pitch your creation to industry experts. Prove your solution.</p>
            <div className="access-data">Access Data <span>→</span></div>
          </div>
        </div>
      </section>

      {/* Modal Overlay */}
      {modalOpen && (
        <div className="modal-overlay active" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>&times;</button>
            <div id="modalContent">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}

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
          </div>
          <div className="coordinator-cards" style={{ marginTop: "40px" }}>
            <div className="coordinator-card">
              <div className="member-photo">RP</div>
              <h4 className="member-name"> Dr Rama Parvathy L</h4>
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
              <p className="member-role">Feel free to reach out</p>
              <p className="member-role">+91 81226 54796</p>
            </div>
            <div className="coordinator-card">
              <div className="member-photo">PM</div>
              <h4 className="member-name">Prasanna M</h4>
              <p className="member-role">Student Coordinator</p>
              <p className="member-role">Need Help?</p>
              <p className="member-role">+91 97909 70726</p>
            </div>
          </div>
        </div>

        <h3 className="section-title alt" style={{paddingTop: "60px"}}>⟨ TEAM LEADS ⟩</h3>
        <div className="team-grid">
          <div className="team-member"><div className="member-photo">MS</div><h4 className="member-name">M. Shree</h4><p className="member-role">Guests, Sponsorship & Awards Committee</p></div>
          <div className="team-member"><div className="member-photo">YG</div><h4 className="member-name">Yashwant Gokul</h4><p className="member-role">Technical Support Committee</p></div>
          <div className="team-member"><div className="member-photo">KD</div><h4 className="member-name">L. Kevin Daniel</h4><p className="member-role">Web Development Committee</p></div>
          <div className="team-member"><div className="member-photo">SJ</div><h4 className="member-name">Sanjay</h4><p className="member-role">Security Committee</p></div>
          <div className="team-member"><div className="member-photo">JK</div><h4 className="member-name">Jaidev Karthikeyan</h4><p className="member-role">Reg & Marketing Committee</p></div>
          <div className="team-member"><div className="member-photo">SV</div><h4 className="member-name">Suprajha V M</h4><p className="member-role">Design & Social Media Committee</p></div>
          <div className="team-member"><div className="member-photo">SN</div><h4 className="member-name">Sanjana</h4><p className="member-role">Design & Social Media Committee</p></div>
        </div>

        <h3 className="section-title special" style={{paddingTop: "60px"}}>⟨ DEV TEAM ⟩</h3>
        <div className="team-grid special-grid">
          <div className="team-member"><div className="member-photo">IM</div><h4 className="member-name">Ibhan Mukherjee</h4><p className="member-role">Special Contributor</p></div>
          <div className="team-member"><div className="member-photo">DP</div><h4 className="member-name">Devangshu Pandey</h4><p className="member-role">Special Contributor</p></div>
          <div className="team-member"><div className="member-photo">SG</div><h4 className="member-name">Srijan Guchhait</h4><p className="member-role">Special Contributor</p></div>
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
