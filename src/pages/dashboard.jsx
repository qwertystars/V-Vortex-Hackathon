import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";
import logo from "/logo.jpg";

export default function TeamDashboard() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user, context } = useAuth();

  const [team, setTeam] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const [leaderProfile, setLeaderProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [activeTab, setActiveTab] = useState("vortex");
  const [showSidebar, setShowSidebar] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [domains, setDomains] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [submissionForm, setSubmissionForm] = useState({
    domainId: "",
    problemStatementId: "",
    trackType: "regular",
    title: "",
    abstract: "",
    drivePdfUrl: "",
  });
  const [submissionError, setSubmissionError] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [submissionSaving, setSubmissionSaving] = useState(false);
  
  // Calculated stats
  const myRank = leaderboard.find(row => row.team_name === team?.team_name)?.position ?? "—";
  const totalTeams = leaderboard.length;
  const topScore = leaderboard[0]?.score ?? 0;
  const myScore = scorecard?.total_score ?? 0;
  const gapToAlpha = myRank === 1 ? 0 : Math.max(0, topScore - myScore);
  const isFinalSubmission = submission?.is_final;
  const filteredProblemStatements = submissionForm.domainId
    ? problemStatements.filter(
        (statement) => String(statement.domain_id) === submissionForm.domainId
      )
    : problemStatements;
  const submissionDomainName = submission?.domain_id
    ? domains.find((domain) => domain.id === submission.domain_id)?.name ?? "—"
    : "—";
  const submissionProblemTitle = submission?.problem_statement_id
    ? problemStatements.find(
        (statement) => statement.id === submission.problem_statement_id
      )?.title ?? "—"
    : "—";
  const submissionTrackLabel =
    submission?.track_type === "open_innovation"
      ? "Open Innovation"
      : "Regular";
  const draftButtonLabel = submission ? "Save Draft" : "Create Draft";


  /* ===============================
     AUTH + DATA FETCH
  =============================== */
  useEffect(() => {
    const init = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      const activeTeamId = context?.teamId;
      if (!activeTeamId) {
        navigate("/register");
        return;
      }

      if (teamId && teamId !== activeTeamId) {
        navigate("/dashboard", { replace: true });
        return;
      }

      try {
        const [
          { data: teamData, error: teamError },
          { data: submissionData, error: submissionFetchError },
          { data: domainsData, error: domainsError },
          { data: problemData, error: problemError },
          { count, error: memberError },
          { data: profile, error: profileError },
        ] = await Promise.all([
          supabase.from("teams").select("*").eq("id", activeTeamId).single(),
          supabase
            .from("ideathon_submissions")
            .select("*")
            .eq("team_id", activeTeamId)
            .maybeSingle(),
          supabase.from("domains").select("id, name").order("name", {
            ascending: true,
          }),
          supabase
            .from("problem_statements")
            .select("id, title, domain_id")
            .order("title", { ascending: true }),
          supabase
            .from("team_members")
            .select("user_id", { count: "exact", head: true })
            .eq("team_id", activeTeamId),
          supabase.from("users").select("name, email").eq("id", user.id).single(),
        ]);

        if (teamError) throw teamError;
        if (submissionFetchError) {
          console.error("Ideathon submission fetch error:", submissionFetchError);
        }
        if (domainsError) {
          console.error("Domains fetch error:", domainsError);
        }
        if (problemError) {
          console.error("Problem statements fetch error:", problemError);
        }
        if (memberError) {
          console.error("Member count fetch error:", memberError);
        }
        if (profileError) {
          console.error("Profile fetch error:", profileError);
        }

        setTeam(teamData);
        setSubmission(submissionData || null);
        setDomains(domainsData || []);
        setProblemStatements(problemData || []);
        setMemberCount(count ?? 0);
        setLeaderProfile(profile || null);
        setScorecard(null);
        setLeaderboard([]);

        const baseDomainId =
          submissionData?.domain_id ?? teamData?.domain_id ?? "";
        setSubmissionForm({
          domainId: baseDomainId ? String(baseDomainId) : "",
          problemStatementId: submissionData?.problem_statement_id
            ? String(submissionData.problem_statement_id)
            : "",
          trackType: submissionData?.track_type || "regular",
          title: submissionData?.title || "",
          abstract: submissionData?.abstract || "",
          drivePdfUrl: submissionData?.drive_pdf_url || "",
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [teamId, navigate, user, context]);

  /* ===============================
     LIVE CLOCK
  =============================== */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
      );
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  /* ===============================
     LOGOUT
  =============================== */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleCopyTeamCode = async () => {
    if (!team?.team_code) return;

    try {
      await navigator.clipboard.writeText(team.team_code);
      setCopyStatus("Team code copied.");
    } catch (error) {
      console.error("Clipboard error:", error);
      setCopyStatus("Unable to copy. Copy manually.");
    }

    window.setTimeout(() => setCopyStatus(""), 2000);
  };

  const formatSubmissionDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString();
  };

  const isValidUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const updateSubmissionField = (field, value) => {
    setSubmissionForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "domainId") {
        next.problemStatementId = "";
      }
      return next;
    });
    if (submissionError) setSubmissionError("");
    if (submissionStatus) setSubmissionStatus("");
  };

  const handleSubmissionSave = async (finalize) => {
    if (!team?.id) return;
    if (submission?.is_final) {
      setSubmissionError("Final submission is locked.");
      return;
    }

    setSubmissionError("");
    setSubmissionStatus("");

    const payload = {
      team_id: team.id,
      domain_id: submissionForm.domainId
        ? Number(submissionForm.domainId)
        : null,
      problem_statement_id: submissionForm.problemStatementId
        ? Number(submissionForm.problemStatementId)
        : null,
      track_type: submissionForm.trackType,
      title: submissionForm.title.trim(),
      abstract: submissionForm.abstract.trim(),
      drive_pdf_url: submissionForm.drivePdfUrl.trim(),
      is_final: finalize,
    };

    if (!payload.domain_id) {
      setSubmissionError("Select a domain for the submission.");
      return;
    }
    if (!payload.title) {
      setSubmissionError("Provide a project title.");
      return;
    }
    if (!payload.abstract) {
      setSubmissionError("Add a concise abstract.");
      return;
    }
    if (!payload.drive_pdf_url) {
      setSubmissionError("Provide a Drive PDF URL.");
      return;
    }
    if (!isValidUrl(payload.drive_pdf_url)) {
      setSubmissionError("Drive PDF URL must be a valid http(s) link.");
      return;
    }

    if (finalize) {
      const confirmed = window.confirm(
        "Final submission locks edits. Continue?"
      );
      if (!confirmed) return;
    }

    setSubmissionSaving(true);
    try {
      let saved;
      if (submission?.id) {
        const { data, error } = await supabase
          .from("ideathon_submissions")
          .update(payload)
          .eq("id", submission.id)
          .select("*")
          .single();
        if (error) throw error;
        saved = data;
      } else {
        const { data, error } = await supabase
          .from("ideathon_submissions")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw error;
        saved = data;
      }

      setSubmission(saved);
      setSubmissionStatus(
        finalize ? "Final submission locked." : "Draft saved."
      );
      setSubmissionForm({
        domainId: saved?.domain_id ? String(saved.domain_id) : "",
        problemStatementId: saved?.problem_statement_id
          ? String(saved.problem_statement_id)
          : "",
        trackType: saved?.track_type || "regular",
        title: saved?.title || "",
        abstract: saved?.abstract || "",
        drivePdfUrl: saved?.drive_pdf_url || "",
      });
    } catch (error) {
      console.error("Ideathon save error:", error);
      setSubmissionError(
        error?.message || "Unable to save the submission right now."
      );
    } finally {
      setSubmissionSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">SYNCING VORTEX DATA…</div>;
  }

  if (!team) {
    return <div className="loading">TEAM DATA UNAVAILABLE</div>;
  }

  return (
    <div className="dashboardWrapper">

      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebarLogo">
          <img src={logo} alt="V-VORTEX logo" className="sidebarLogoImg" />
          <span>HACKVORTEX</span>
        </div>
        <div className="sidebarSub">ALPHA SECTOR</div>

        <div className="sidebarNav">
          <button
            className={activeTab === "vortex" ? "active" : ""}
            onClick={() => { setActiveTab("vortex"); setShowSidebar(false); }}
          >
            Vortex Hub
          </button>

          <button
            className={activeTab === "team-code" ? "active" : ""}
            onClick={() => { setActiveTab("team-code"); setShowSidebar(false); }}
          >
            Team Code
          </button>

          <button
            className={activeTab === "ideathon" ? "active" : ""}
            onClick={() => { setActiveTab("ideathon"); setShowSidebar(false); }}
          >
            Ideathon Submission
          </button>

          <button
            className={activeTab === "leaderboard" ? "active" : ""}
            onClick={() => { setActiveTab("leaderboard"); setShowSidebar(false); }}
          >
            Leaderboard
          </button>

          <button
            className={activeTab === "nexus" ? "active" : ""}
            onClick={() => { setActiveTab("nexus"); setShowSidebar(false); }}
          >
            Nexus Entry
          </button>

          <button
            className={activeTab === "mission" ? "active" : ""}
            onClick={() => { setActiveTab("mission"); setShowSidebar(false); }}
          >
            The Mission
          </button>
        </div>

        <div className="sidebarFooter">
          <div className="userCard">
            <strong>{leaderProfile?.name || user?.email || "Team Leader"}</strong>
            <div style={{ fontSize: "11px", color: "#e879f9" }}>
              Team Leader · {memberCount}/4 members
            </div>
          </div>

          <button className="disconnectBtn" onClick={handleLogout}>
            DISCONNECT
          </button>
        </div>
      </aside>

      {showSidebar && <div className="sidebarOverlay" onClick={() => setShowSidebar(false)} /> }

      {/* ================= MAIN ================= */}
      <div className="mainArea">

        {/* HEADER */}
        <header className="mainHeader">
          <div className="headerLeft">
            <button className="menuBtn" onClick={() => setShowSidebar(s => !s)} aria-label="Toggle sidebar">☰</button>

            <div>
              <div className="headerTitle">
                {activeTab === "vortex" && "Vortex Hub"}
                {activeTab === "team-code" && "Team Code"}
                {activeTab === "ideathon" && "Ideathon Submission"}
                {activeTab === "leaderboard" && "Leaderboard"}
                {activeTab === "nexus" && "Nexus Entry"}
                {activeTab === "mission" && "The Mission"}
              </div>

              <div className="headerSub">
                OPERATIONAL OBJECTIVE DECRYPTION
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div className="systemLabel">SYSTEM TIME</div>
            <div className="systemTime">{time}</div>
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <div className="pageContent">

          {/* ===== VORTEX HUB ===== */}
          {activeTab === "vortex" && (
            <div className="vortexHub">
              <div className="vortexGrid">
                <div className="vortexCard" onClick={() => setActiveTab("leaderboard")}>
                  <div className="vortexIcon">↗</div>
                  <h3>Leaderboard</h3>
                  <p>Analyze the competitive landscape and track your climb.</p>
                </div>

                <div className="vortexCard" onClick={() => setActiveTab("team-code")}>
                  <div className="vortexIcon">#</div>
                  <h3>Team Code</h3>
                  <p>Share this code so members can join your squad.</p>
                </div>

                <div className="vortexCard" onClick={() => setActiveTab("ideathon")}>
                  <div className="vortexIcon">✦</div>
                  <h3>Ideathon Submission</h3>
                  <p>Submit your Round 1 abstract and lock in your idea.</p>
                </div>

                <div className="vortexCard" onClick={() => setActiveTab("nexus")}>
                  <div className="vortexIcon">⌁</div>
                  <h3>Nexus Entry</h3>
                  <p>Generate encrypted access credentials.</p>
                </div>

                <div className="vortexCard" onClick={() => setActiveTab("mission")}>
                  <div className="vortexIcon">💡</div>
                  <h3>The Mission</h3>
                  <p>Decrypt objectives and evaluation matrix.</p>
                </div>
              </div>

              <div className="teamSummary">
                <div className="teamLeft">
                  <div className="teamBadge">
                    {team.team_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2>{team.team_name}</h2>
                    <p>ELITE SQUAD · LIVE RANKING</p>
                  </div>
                </div>

                <div className="teamRight">
                  <span>CURRENT YIELD</span>
                  <strong>{scorecard?.total_score ?? "—"} PTS</strong>
                </div>
              </div>
            </div>
          )}

          {/* ===== TEAM CODE ===== */}
          {activeTab === "team-code" && (
            <div className="vortexHub">
              <div className="teamSummary" style={{ marginBottom: "18px" }}>
                <div className="teamLeft">
                  <div className="teamBadge">
                    {team.team_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2>{team.team_name}</h2>
                    <p>ROSTER STATUS · {memberCount}/4 MEMBERS</p>
                  </div>
                </div>
                <div className="teamRight">
                  <span>TEAM CODE</span>
                  <strong>{team.team_code || "—"}</strong>
                </div>
              </div>

              <div className="vortexCard" style={{ cursor: "default" }}>
                <h3>Share Team Code</h3>
                <p>Give this code to members so they can register and join.</p>
                <div className="teamCodeBox">{team.team_code || "PENDING"}</div>
                <button
                  className="verifyBtn"
                  type="button"
                  onClick={handleCopyTeamCode}
                  disabled={!team.team_code}
                >
                  {team.team_code ? "COPY CODE" : "CODE UNAVAILABLE"}
                </button>
                {copyStatus && (
                  <p className="helper" style={{ marginTop: "10px" }}>
                    {copyStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ===== IDEATHON SUBMISSION ===== */}
          {activeTab === "ideathon" && (
            <div className="vortexHub ideathonPanel">
              <div className="ideathonHeader">
                <div>
                  <h2>Ideathon Submission</h2>
                  <p>
                    Draft your Round 1 submission. Final submit locks edits and
                    timestamps your entry.
                  </p>
                </div>
                <div
                  className={`ideathonStatus ${
                    isFinalSubmission ? "final" : "draft"
                  }`}
                >
                  {isFinalSubmission
                    ? "FINALIZED"
                    : submission
                      ? "DRAFT"
                      : "NOT STARTED"}
                </div>
              </div>

              <div className="vortexCard ideathonCard">
                {isFinalSubmission ? (
                  <div className="ideathonSummary">
                    <div className="summaryRow">
                      <span>Status</span>
                      <strong>Final submission</strong>
                    </div>
                    <div className="summaryRow">
                      <span>Submitted at</span>
                      <strong>{formatSubmissionDate(submission?.submitted_at)}</strong>
                    </div>
                    <div className="summaryRow">
                      <span>Track</span>
                      <strong>{submissionTrackLabel}</strong>
                    </div>
                    <div className="summaryRow">
                      <span>Domain</span>
                      <strong>{submissionDomainName}</strong>
                    </div>
                    <div className="summaryRow">
                      <span>Problem statement</span>
                      <strong>{submissionProblemTitle}</strong>
                    </div>
                    <div className="summaryBlock">
                      <span>Title</span>
                      <strong>{submission?.title || "—"}</strong>
                    </div>
                    <div className="summaryBlock">
                      <span>Abstract</span>
                      <p>{submission?.abstract || "—"}</p>
                    </div>
                    <div className="summaryBlock">
                      <span>Drive PDF</span>
                      {submission?.drive_pdf_url ? (
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
                  <form
                    className="ideathonForm"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSubmissionSave(false);
                    }}
                  >
                    <div className="submissionGrid">
                      <div className="submissionField">
                        <label htmlFor="ideathon-domain">Domain</label>
                        <select
                          id="ideathon-domain"
                          className="inputField"
                          value={submissionForm.domainId}
                          onChange={(event) =>
                            updateSubmissionField("domainId", event.target.value)
                          }
                        >
                          <option value="">Select a domain</option>
                          {domains.map((domain) => (
                            <option key={domain.id} value={domain.id}>
                              {domain.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="submissionField">
                        <label htmlFor="ideathon-track">Track Type</label>
                        <select
                          id="ideathon-track"
                          className="inputField"
                          value={submissionForm.trackType}
                          onChange={(event) =>
                            updateSubmissionField("trackType", event.target.value)
                          }
                        >
                          <option value="regular">Regular</option>
                          <option value="open_innovation">Open Innovation</option>
                        </select>
                      </div>
                      <div className="submissionField">
                        <label htmlFor="ideathon-problem">
                          Problem Statement (optional)
                        </label>
                        <select
                          id="ideathon-problem"
                          className="inputField"
                          value={submissionForm.problemStatementId}
                          onChange={(event) =>
                            updateSubmissionField(
                              "problemStatementId",
                              event.target.value
                            )
                          }
                        >
                          <option value="">Unassigned</option>
                          {filteredProblemStatements.map((statement) => (
                            <option key={statement.id} value={statement.id}>
                              {statement.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="submissionField">
                        <label htmlFor="ideathon-title">Project Title</label>
                        <input
                          id="ideathon-title"
                          className="inputField"
                          type="text"
                          value={submissionForm.title}
                          onChange={(event) =>
                            updateSubmissionField("title", event.target.value)
                          }
                          placeholder="e.g., GreenPulse Intelligence"
                        />
                      </div>
                    </div>

                    <div className="submissionField full">
                      <label htmlFor="ideathon-abstract">Abstract</label>
                      <textarea
                        id="ideathon-abstract"
                        className="inputField"
                        rows={5}
                        value={submissionForm.abstract}
                        onChange={(event) =>
                          updateSubmissionField("abstract", event.target.value)
                        }
                        placeholder="Summarize the problem, approach, and impact."
                      />
                    </div>

                    <div className="submissionField full">
                      <label htmlFor="ideathon-drive">Drive PDF URL</label>
                      <input
                        id="ideathon-drive"
                        className="inputField"
                        type="url"
                        value={submissionForm.drivePdfUrl}
                        onChange={(event) =>
                          updateSubmissionField("drivePdfUrl", event.target.value)
                        }
                        placeholder="https://drive.google.com/..."
                      />
                    </div>

                    {submissionError && (
                      <p className="helper error">{submissionError}</p>
                    )}
                    {submissionStatus && (
                      <p className="helper success">{submissionStatus}</p>
                    )}

                    <div className="submissionActions">
                      <button
                        className="verifyBtn"
                        type="submit"
                        disabled={submissionSaving}
                      >
                        {submissionSaving ? "Saving..." : draftButtonLabel}
                      </button>
                      <button
                        className="verifyBtn ghost"
                        type="button"
                        onClick={() => handleSubmissionSave(true)}
                        disabled={submissionSaving}
                      >
                        {submissionSaving ? "Submitting..." : "Final Submit"}
                      </button>
                    </div>
                    <p className="helper">
                      Final submission is irreversible. Make sure your PDF is ready.
                    </p>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ===== LEADERBOARD ===== */}
          {activeTab === "leaderboard" && (
            <>
              <div className="statsGrid">
                <div className="statCard">
                  <div className="statLabel">TACTICAL RANK</div>
                  <div className="statValue">{myRank} <span className="statSub">/{totalTeams}</span></div>
                </div>
                <div className="statCard">
                  <div className="statLabel">ACCUMULATED DATA</div>
                  <div className="statValue">{scorecard?.total_score ?? "—"}</div>
                </div>
                <div className="statCard">
                  <div className="statLabel">GAP TO ALPHA</div>
                  <div className="statValue">{gapToAlpha} <span className="statSub">PTS</span></div>
                </div>
              </div>

              <div className="leaderboardTable">
                <div className="lbHeader">
                  <div>POSITION</div>
                  <div>SQUAD DESIGNATION</div>
                  <div style={{ textAlign: "right" }}>PAYLOAD</div>
                </div>

                {leaderboard.map((row) => {
                  const isYou = row.team_name === team.team_name;

                  const rankText =
                    row.position === 1 ? "ULTRA-1" :
                    row.position === 2 ? "ELITE-2" :
                    row.position === 3 ? "APEX-3" :
                    `#${row.position}`;

                  const rankClass =
                    row.position === 1 ? "rank-ultra" :
                    row.position === 2 ? "rank-elite" :
                    row.position === 3 ? "rank-apex" :
                    "rankDefault";

                  return (
                    <div key={row.team_name} className={`lbRow ${isYou ? "you" : ""}`}>
                      <div className={`rankBadge ${rankClass}`}>{rankText}</div>

                      <div className="teamCell">
                        <div className="teamIcon">
                          {row.team_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="teamMeta">
                          <strong>{row.team_name}</strong>
                          <span>{isYou ? "YOUR SQUAD" : "ACTIVE"}</span>
                        </div>
                      </div>

                      <div className="payload">
                        <strong>{row.score}</strong>
                        <div className={row.delta >= 0 ? "deltaUp" : "deltaDown"}>
                          {row.delta >= 0 ? "+" : ""}{row.delta} PTS
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ===== NEXUS ENTRY ===== */}
          {activeTab === "nexus" && (
            <div className="nexusWrapper">
              <div className="nexusCard">
                <div className="qrBox">
                  <div className="lockIcon">🔒</div>
                </div>

                <div className="nexusTitle">SQUAD: {team.team_name}</div>

                <div className="nexusDesc">
                  Authorized personnel must scan this encrypted vortex key
                  to gain access to the secure development environment.
                </div>

                <div className="nexusCodeBar">
                  HCK-2024-{team.team_name.slice(0, 2).toUpperCase()}-{team.id}-EPSILON
                </div>
              </div>
            </div>
          )}

          {/* ===== THE MISSION ===== */}
          {activeTab === "mission" && (
            <div className="missionWrapper">

              <div className="missionTag">OBJECTIVE PRIMARY</div>

              <div className="missionTitle">
                Synthesize AI-Powered <br />
                <span>Eco-Intelligence</span>
              </div>

              <div className="missionGrid">

                <div className="missionCard">
                  <div className="reqTitle">Requirements</div>
                  <ul className="reqList">
                    <li><span className="reqDot">✓</span> Real-time neural tracking of carbon outputs</li>
                    <li><span className="reqDot">✓</span> Autonomous green-protocol recommendations</li>
                    <li><span className="reqDot">✓</span> IoT Matrix integration for global analytics</li>
                  </ul>
                </div>

                <div className="missionCard">
                  <div className="reqTitle">Evaluation Matrix</div>

                  <div className="evalRow">
                    <div className="evalHeader"><span>INNOVATION ALPHA</span><span>30%</span></div>
                    <div className="evalBar"><div className="evalFill" style={{ width: "30%" }} /></div>
                  </div>

                  <div className="evalRow">
                    <div className="evalHeader"><span>TECH EXECUTION</span><span>40%</span></div>
                    <div className="evalBar"><div className="evalFill" style={{ width: "40%" }} /></div>
                  </div>

                  <div className="evalRow">
                    <div className="evalHeader"><span>UI SYNAPSE</span><span>30%</span></div>
                    <div className="evalBar"><div className="evalFill" style={{ width: "30%" }} /></div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
