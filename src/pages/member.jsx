import { useEffect, useState } from "react";
import "../styles/member.css";
import logo from "/logo.jpg";

export default function HackVortexDashboard() {
  const [activePage, setActivePage] = useState("details");
  const [time, setTime] = useState("00:00:00");

  // ===============================
  // LIVE CLOCK
  // ===============================
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setTime(`${h}:${m}:${s}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // ===============================
  // PAGE TITLES
  // ===============================
  const titles = {
    details: {
      title: "Member Identity",
      subtitle: "Authenticated session",
    },
    qr: {
      title: "Access Gateway",
      subtitle: "Team verification portal",
    },
    problem: {
      title: "Mission Logic",
      subtitle: "Strategic challenge overview",
    },
  };

  return (
    <>
      {/* BACKGROUND */}
      <div className="mesh-bg"></div>

      <div className="dashboard">
        {/* ===============================
            SIDEBAR (DESKTOP)
        =============================== */}
        <aside className="sidebar glass">
          <div className="sidebar-header">
            <div className="sidebar-title">
              <img src={logo} alt="V-VORTEX logo" className="sidebarLogoImg" />
              HACKVORTEX
            </div>
            <div className="sidebar-subtitle">Developer Terminal</div>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`sidebar-btn ${
                activePage === "details" ? "active" : ""
              }`}
              onClick={() => setActivePage("details")}
            >
              Member Identity
            </button>

            <button
              className={`sidebar-btn ${
                activePage === "qr" ? "active" : ""
              }`}
              onClick={() => setActivePage("qr")}
            >
              Access Gate
            </button>

            <button
              className={`sidebar-btn ${
                activePage === "problem" ? "active" : ""
              }`}
              onClick={() => setActivePage("problem")}
            >
              Mission Logic
            </button>
          </nav>

          {/* USER CARD */}
          <div className="sidebar-user">
            <div className="user-box glass">
              <div className="user-avatar">AJ</div>
              <div className="user-meta">
                <p>Alex Johnson</p>
                <p>0x4582...BCA3</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ===============================
            MAIN AREA
        =============================== */}
        <main className="main">
          {/* HEADER */}
          <header className="header glass">
            <div>
              <h1>{titles[activePage].title}</h1>
              <p>{titles[activePage].subtitle}</p>
            </div>

            <div className="clock glass">
              <span>System Pulse</span>
              <strong>{time}</strong>
            </div>
          </header>

          {/* CONTENT */}
          <section className="content">
            {/* DETAILS PAGE */}
            {activePage === "details" && (
              <div className="page">
                <div className="card glass center">
                  <h2>Alex Johnson</h2>
                  <p>
                    Lead Full Stack Architect <br />
                    <strong>CodeCrafters</strong>
                  </p>
                </div>
              </div>
            )}

            {/* QR PAGE */}
            {activePage === "qr" && (
              <div className="page">
                <div className="card glass center">
                  <h2>Gateway Access</h2>
                  <div className="qr-box">QR</div>
                  <button className="primary-btn">
                    Export Credential
                  </button>
                </div>
              </div>
            )}

            {/* PROBLEM PAGE */}
            {activePage === "problem" && (
              <div className="page">
                <div className="card glass">
                  <h2>AI-Powered Sustainability Platform</h2>
                  <p>
                    Design and develop a platform that leverages artificial
                    intelligence to track, analyze, and reduce carbon
                    footprints in real time.
                  </p>
                  <button className="primary-btn">
                    Initialize Mission Workspace
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
