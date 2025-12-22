import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../styles/member.css";
import logo from "/logo.jpg";

export default function HackVortexDashboard() {
  const [activePage, setActivePage] = useState("details");
  const [time, setTime] = useState("00:00:00");
  const [profile, setProfile] = useState(null);
  const [team, setTeam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, context } = useAuth();

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

  useEffect(() => {
    const hydrate = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (!context?.teamId) {
        navigate("/register");
        return;
      }

      try {
        const [
          { data: profileData, error: profileError },
          { data: teamData, error: teamError },
          { data: submissionData, error: submissionError },
        ] = await Promise.all([
          supabase
            .from("users")
            .select("name, email, university_name")
            .eq("id", user.id)
            .single(),
          supabase
            .from("teams")
            .select("team_name, team_code")
            .eq("id", context.teamId)
            .single(),
          supabase
            .from("ideathon_submissions")
            .select(
              "title, abstract, drive_pdf_url, is_final, submitted_at, track_type"
            )
            .eq("team_id", context.teamId)
            .maybeSingle(),
        ]);

        if (profileError) {
          console.error("Profile fetch error:", profileError);
        }
        if (teamError) {
          console.error("Team fetch error:", teamError);
        }
        if (submissionError) {
          console.error("Submission fetch error:", submissionError);
        }

        setProfile(profileData || null);
        setTeam(teamData || null);
        setSubmission(submissionData || null);
      } catch (error) {
        console.error("Member dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [user, context, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const formatSubmissionDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString();
  };

  const submissionTrackLabel =
    submission?.track_type === "open_innovation"
      ? "Open Innovation"
      : "Regular";

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
    ideathon: {
      title: "Ideathon Submission",
      subtitle: "Round 1 team snapshot",
    },
    problem: {
      title: "Mission Logic",
      subtitle: "Strategic challenge overview",
    },
  };

  if (loading) {
    return <div className="loading">SYNCING MEMBER DATA…</div>;
  }

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
                activePage === "ideathon" ? "active" : ""
              }`}
              onClick={() => setActivePage("ideathon")}
            >
              Ideathon Submission
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
              <div className="user-avatar">
                {(profile?.name || user?.email || "ME").slice(0, 2).toUpperCase()}
              </div>
              <div className="user-meta">
                <p>{profile?.name || user?.email || "Member"}</p>
                <p>{team?.team_name || "Roster Pending"}</p>
              </div>
            </div>
            <button className="primary-btn" style={{ marginTop: "12px" }} onClick={handleLogout}>
              Disconnect
            </button>
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
                  <h2>{profile?.name || "Member"}</h2>
                  <p>
                    {profile?.university_name || "University"} <br />
                    <strong>{team?.team_name || "Team Pending"}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* QR PAGE */}
            {activePage === "qr" && (
              <div className="page">
                <div className="card glass center">
                  <h2>Gateway Access</h2>
                  <div className="qr-box">{team?.team_code || "PENDING"}</div>
                  <button className="primary-btn">
                    Export Credential
                  </button>
                </div>
              </div>
            )}

            {/* IDEATHON PAGE */}
            {activePage === "ideathon" && (
              <div className="page">
                <div className="card glass">
                  <h2>Ideathon Submission</h2>
                  {submission ? (
                    <div className="submissionDetails">
                      <div className="submissionRow">
                        <span>Status</span>
                        <strong>
                          {submission.is_final ? "Final" : "Draft"}
                        </strong>
                      </div>
                      <div className="submissionRow">
                        <span>Submitted</span>
                        <strong>
                          {formatSubmissionDate(submission.submitted_at)}
                        </strong>
                      </div>
                      <div className="submissionRow">
                        <span>Track</span>
                        <strong>{submissionTrackLabel}</strong>
                      </div>
                      <div className="submissionBlock">
                        <span>Title</span>
                        <strong>{submission.title || "—"}</strong>
                      </div>
                      <div className="submissionBlock">
                        <span>Abstract</span>
                        <p>{submission.abstract || "—"}</p>
                      </div>
                      <div className="submissionBlock">
                        <span>Drive PDF</span>
                        {submission.drive_pdf_url ? (
                          <a
                            href={submission.drive_pdf_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open PDF
                          </a>
                        ) : (
                          <strong>—</strong>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p>
                      No submission yet. Your team leader will submit the
                      ideathon entry here.
                    </p>
                  )}
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
