import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/admin.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [teams, setTeams] = useState([]);
  const [teamQuery, setTeamQuery] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [leaderboardPublic, setLeaderboardPublic] = useState(false);
  const [lbToggleLoading, setLbToggleLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [review1Open, setReview1Open] = useState(false);
  const [review1Scores, setReview1Scores] = useState({});
  const [review2Open, setReview2Open] = useState(false);
  const [review2Scores, setReview2Scores] = useState({});
  const [review3Open, setReview3Open] = useState(false);
  const [review3Scores, setReview3Scores] = useState({});
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [ideaScores, setIdeaScores] = useState({});
  const [pitchOpen, setPitchOpen] = useState(false);
  const [pitchScores, setPitchScores] = useState({});

  useEffect(() => {
    const checkAdmin = async () => {
      setChecking(true);
      setUnauthorized(false);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: { session } } = await supabase.auth.getSession();

        if (!user || !session) {
          // not signed in -> show login form
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        const role = user?.app_metadata?.role;
        if (role === "admin") {
          setIsAdmin(true);
        } else {
          setUnauthorized(true);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("admin check error:", err);
      } finally {
        setChecking(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  // Load teams when admin is confirmed
  useEffect(() => {
    if (!isAdmin) return;
    const loadTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('id, team_name, lead_name, lead_email, domain, problem_statement, team_members(member_name)')
          .order('team_name', { ascending: true });
        if (error) throw error;
        setTeams(data || []);
      } catch (err) {
        console.error('Failed to load teams for admin:', err);
        setTeams([]);
      }
    };

    loadTeams();
  }, [isAdmin]);

  // Helper to refresh leaderboard from the DB
  const refreshLeaderboard = async () => {
    setLbLoading(true);
    try {
      const { data, error } = await supabase.from('leaderboard_view').select('*').order('position', { ascending: true });
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Failed to refresh leaderboard:', err);
      setLeaderboard([]);
    } finally {
      setLbLoading(false);
    }
  };

  // Load leaderboard when admin is confirmed
  useEffect(() => {
    if (!isAdmin) return;
    refreshLeaderboard();
  }, [isAdmin]);

  // Load leaderboard visibility setting
  useEffect(() => {
    if (!isAdmin) return;
    const loadSetting = async () => {
      try {
        const { data, error } = await supabase.from('app_settings').select('leaderboard_public').eq('id', 'main').single();
        if (!error && data) setLeaderboardPublic(!!data.leaderboard_public);
      } catch (err) {
        console.error('Failed to load leaderboard visibility setting:', err);
      }
    };
    loadSetting();
  }, [isAdmin]);

  // Toggle leaderboard visibility
  const toggleLeaderboardPublic = async () => {
    setLbToggleLoading(true);
    try {
      const newVal = !leaderboardPublic;
      const { error } = await supabase.from('app_settings').update({ leaderboard_public: newVal, updated_at: new Date().toISOString() }).eq('id', 'main');
      if (error) throw error;
      setLeaderboardPublic(newVal);
    } catch (err) {
      console.error('Failed to toggle leaderboard visibility:', err);
      alert('Failed to update setting: ' + (err.message || err));
    } finally {
      setLbToggleLoading(false);
    }
  };

  // Sign in handler for admin access via URL only (no button on main pages)
  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message || "Sign-in failed");
        setAuthLoading(false);
        return;
      }

      // Re-check session/role
      const { data: { session } } = await supabase.auth.getSession();
      const role = session?.user?.app_metadata?.role;
      if (role === "admin") {
        setIsAdmin(true);
        setUnauthorized(false);
      } else {
        setUnauthorized(true);
      }
    } catch (err) {
      console.error(err);
      setAuthError("Unexpected error during sign-in");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    navigate("/");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Lazy-load exceljs to avoid adding it to the main bundle
      const ExcelJS = (await import('exceljs')).default;
      // Fetch teams with their members (exclude ids)
      const { data, error } = await supabase
        .from('teams')
        .select('team_name, team_size, lead_name, lead_email, lead_reg_no, is_vit_chennai, institution, receipt_link, team_members(member_name, member_reg_no, member_email, institution)');

      if (error) throw error;

      // Build XLSX rows (one row per member; if no members, include single row with empty member fields)
      const header = [
        'Team Name', 'Team Size',
        'Lead Name', 'Lead Email', 'Lead Reg No', 'Lead Is VIT Chennai',
        'Team Institution', 'Payment Link',
        'Member Name', 'Member Email', 'Member Reg No', 'Member Is VIT Chennai'
      ];

      const rows = [];
      (data || []).forEach(team => {
        const leadIsVit = !!team.is_vit_chennai || !!team.lead_reg_no;
        const members = team.team_members || [];
        if (members.length === 0) {
          rows.push([
            team.team_name || '', team.team_size || '',
            team.lead_name || '', team.lead_email || '', team.lead_reg_no || '', leadIsVit,
              team.institution || '', team.receipt_link || '', '', '', ''
          ]);
        } else {
          members.forEach(m => {
            const memberIsVit = (m.institution === 'VIT Chennai') || !!m.member_reg_no;
            rows.push([
              team.team_name || '', team.team_size || '',
              team.lead_name || '', team.lead_email || '', team.lead_reg_no || '', leadIsVit,
                team.institution || '', team.receipt_link || '', m.member_name || '', m.member_email || '', m.member_reg_no || '', !!memberIsVit
            ]);
          });
        }
      });

      // Use ExcelJS to generate the workbook in-memory
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Teams');
      worksheet.addRow(header);
      rows.forEach(r => worksheet.addRow(r));

      // Turn Payment Link column into clickable hyperlinks (column 8 after adding Team Institution)
      const paymentCol = 8;
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const cell = row.getCell(paymentCol);
        const val = cell.value;
        if (typeof val === 'string' && val.trim()) {
          cell.value = { text: val, hyperlink: val };
          cell.font = { color: { argb: 'FF0000FF' }, underline: true };
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const now = new Date().toISOString().slice(0,10);
      a.download = `teams_export_${now}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error', err);
      alert('Failed to export teams: ' + (err.message || err));
    } finally {
      setExporting(false);
    }
  };

  const handleReview1Change = (teamId, key, value) => {
    setReview1Scores(prev => {
      const teamScores = prev[teamId] || { faculty:0, idea:0, technical:0, architecture:0, innovation:0, planning:0, review_1_total:0 };
      const updated = { ...teamScores, [key]: Number(value) };
      const total = (Number(updated.faculty||0) + Number(updated.idea||0) + Number(updated.technical||0) + Number(updated.architecture||0) + Number(updated.innovation||0) + Number(updated.planning||0));
      return { ...prev, [teamId]: { ...updated, review_1_total: total } };
    });
  };

  const handleReview2Change = (teamId, key, value) => {
    setReview2Scores(prev => {
      const teamScores = prev[teamId] || { progress:0, demo:0, code:0, difficulty:0, fit:0, workflow:0, roadmap:0, review_2_total:0 };
      const updated = { ...teamScores, [key]: Number(value) };
      const total = (Number(updated.progress||0) + Number(updated.demo||0) + Number(updated.code||0) + Number(updated.difficulty||0) + Number(updated.fit||0) + Number(updated.workflow||0) + Number(updated.roadmap||0));
      return { ...prev, [teamId]: { ...updated, review_2_total: total } };
    });
  };

  const closeReview2 = () => setReview2Open(false);

  const handleReview3Change = (teamId, key, value) => {
    setReview3Scores(prev => {
      const teamScores = prev[teamId] || { final_product:0, technical:0, innovation:0, uiux:0, impact:0, presentation:0, docs:0, response:0, review_3_total:0 };
      const updated = { ...teamScores, [key]: Number(value) };
      const total = (Number(updated.final_product||0) + Number(updated.technical||0) + Number(updated.innovation||0) + Number(updated.uiux||0) + Number(updated.impact||0) + Number(updated.presentation||0) + Number(updated.docs||0) + Number(updated.response||0));
      return { ...prev, [teamId]: { ...updated, review_3_total: total } };
    });
  };

  const closeReview3 = () => setReview3Open(false);

  const handleIdeaChange = (teamId, key, value) => {
    setIdeaScores(prev => {
      const teamScores = prev[teamId] || { problem:0, innovation:0, approach:0, impact:0, presentation:0, idea_total:0 };
      const updated = { ...teamScores, [key]: Number(value) };
      const total = (Number(updated.problem||0) + Number(updated.innovation||0) + Number(updated.approach||0) + Number(updated.impact||0) + Number(updated.presentation||0));
      return { ...prev, [teamId]: { ...updated, idea_total: total } };
    });
  };

  const closeIdea = () => setIdeaOpen(false);

  const closeReview1 = () => setReview1Open(false);

  if (checking) return <div className="adminWrapper"><p style={{paddingTop:80}}>Checking credentials…</p></div>;

  if (!isAdmin) {
    // If unauthorized user signed in
    if (unauthorized) {
      return (
        <div className="adminWrapper">
          <nav className="adminNav">
            <div className="adminLeft">
              <img src="/logo.jpg" className="adminLogo" alt="Logo" />
              <span className="adminTitle">ADMIN CONTROL PANEL</span>
            </div>

            <div className="adminRight">
              <button className="logoutBtn" onClick={handleSignOut}>
                Logout
              </button>
            </div>
          </nav>

          <div style={{paddingTop:120, textAlign:'center'}}>
            <h2>Access Denied</h2>
            <p>You are signed in but do not have admin permissions.</p>
          </div>
        </div>
      );
    }

    // Not signed in -> show login form (admins must access via URL)
    return (
      <div className="adminWrapper">
        <nav className="adminNav">
          <div className="adminLeft">
            <img src="/logo.jpg" className="adminLogo" alt="Logo" />
            <span className="adminTitle">ADMIN CONTROL PANEL</span>
          </div>

          <div className="adminRight">
          </div>
        </nav>

        <div style={{maxWidth:420, margin:'140px auto 0', padding:20, background:'rgba(0,0,0,0.5)', borderRadius:8}}>
          <h3 style={{color:'#00ffae'}}>Admin Login</h3>
          <form onSubmit={handleSignIn}>
            <div style={{marginBottom:10}}>
              <label style={{display:'block', color:'#cfffec'}}>Email</label>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required style={{width:'100%', padding:8, borderRadius:6}} />
            </div>
            <div style={{marginBottom:10}}>
              <label style={{display:'block', color:'#cfffec'}}>Password</label>
              <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required style={{width:'100%', padding:8, borderRadius:6}} />
            </div>
            {authError && <div style={{color:'salmon', marginBottom:10}}>{authError}</div>}
            <button className="logoutBtn" type="submit" disabled={authLoading} style={{background:'#00ff9d'}}>
              {authLoading ? 'Signing in…' : 'Sign in as Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // isAdmin === true -> render dashboard
  return (
    <div className="adminWrapper">

      {/* TOP NAVBAR */}
      <nav className="adminNav">
        <div className="adminLeft">
          <img src="/logo.jpg" className="adminLogo" alt="Logo" />
          <span className="adminTitle">ADMIN CONTROL PANEL</span>
        </div>

        <div className="adminRight">
          <button className="logoutBtn" onClick={handleExport} disabled={exporting} style={{marginRight:10}}>
            {exporting ? 'Exporting…' : 'Export Teams'}
          </button>
          <button className="logoutBtn" onClick={() => navigate("/")}> 
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN GRID */}
      <div className="adminGrid">

        <div className="adminCard">
          <h2>Active Users</h2>
          <p className="metric">128</p>
        </div>

        <div className="adminCard">
          <h2>Pending Requests</h2>
          <p className="metric yellow">7</p>
        </div>

        <div className="adminCard">
          <h2>System Health</h2>
          <p className="metric green">Optimal</p>
        </div>

        <div className="adminCard">
          <h2>Security Alerts</h2>
          <p className="metric red">0</p>
        </div>

      </div>

      {/* LARGE PANEL BELOW */}
      <div className="adminPanel" style={{display:'flex', gap:20, alignItems:'flex-start'}}>
        <div style={{flex:'0 0 320px'}}>
          <h2 className="panelTitle">Teams <span style={{fontSize:12, color:'#9ca3af', marginLeft:8}}>{teams.length} total</span></h2>
          <div style={{marginBottom:8, display:'flex', gap:8, alignItems:'center'}}>
            <input
              aria-label="Search teams by name"
              placeholder="Search team name..."
              value={teamQuery}
              onChange={(e) => setTeamQuery(e.target.value)}
              style={{flex:1, padding:8, borderRadius:6, border:'1px solid rgba(255,255,255,0.06)'}}
            />
            {teamQuery && (
              <button onClick={() => setTeamQuery('')} className="logoutBtn" style={{padding:'8px 10px'}}>Clear</button>
            )}
          </div>
          <div style={{background:'rgba(0,0,0,0.5)', borderRadius:8, padding:12, maxHeight:480, overflow:'auto'}}>
            {teams.length === 0 && <div style={{color:'#9ca3af'}}>No teams found.</div>}
                {teams
                  .filter(t => {
                    if (!teamQuery) return true;
                    try {
                      return (t.team_name || '').toLowerCase().includes(teamQuery.toLowerCase());
                    } catch (e) { return true; }
                  })
                  .map(t => (
                  <div key={t.id} onClick={() => setSelectedTeam(t)} style={{padding:10, borderRadius:6, cursor:'pointer', marginBottom:8, background: selectedTeam?.id === t.id ? 'rgba(0,255,157,0.07)' : 'transparent'}}>
                    <strong style={{color:'#e6fffa'}}>{t.team_name || '(Unnamed)'}</strong>
                    <div style={{fontSize:12, color:'#9ca3af'}}>{t.lead_name || t.lead_email || ''}</div>
                  </div>
                ))}
                </div>

          <div style={{marginTop:12}}>
            <h3 style={{margin:'6px 0', color:'#e6fffa', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span>Leaderboard</span>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <label style={{display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:12, color: leaderboardPublic ? '#00ff9d' : '#9ca3af'}}>
                  <input type="checkbox" checked={leaderboardPublic} onChange={toggleLeaderboardPublic} disabled={lbToggleLoading} style={{width:16, height:16, accentColor:'#00ff9d'}} />
                  {leaderboardPublic ? 'Public' : 'Hidden'}
                </label>
                <button className="logoutBtn" onClick={refreshLeaderboard} style={{padding:'6px 8px', fontSize:12}} disabled={lbLoading}>{lbLoading ? 'Refreshing…' : 'Refresh'}</button>
              </div>
            </h3>
            <div style={{background:'rgba(0,0,0,0.5)', borderRadius:8, padding:10, maxHeight:400, overflow:'auto'}}>
              {leaderboard.length === 0 && !lbLoading && <div style={{color:'#9ca3af'}}>No leaderboard data.</div>}
              {lbLoading && <div style={{color:'#9ca3af'}}>Loading…</div>}
              {leaderboard.map((row, idx) => (
                <div key={row.team_id || idx} style={{display:'flex', justifyContent:'space-between', padding:'8px 6px', borderBottom:'1px solid rgba(255,255,255,0.02)'}}>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <div style={{width:28, height:28, borderRadius:6, background:'rgba(255,255,255,0.02)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>{row.position}</div>
                    <div style={{color:'#e6fffa'}}>{row.team_name}</div>
                  </div>
                  <div style={{color:'#9ca3af'}}>{row.score ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>

            </div>

            {ideaOpen && selectedTeam && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1200}}>
                  <div style={{width:'min(920px,96%)', maxHeight:'90vh', overflowY:'auto', background:'#0b1620', borderRadius:10, padding:18, boxShadow:'0 10px 30px rgba(0,0,0,0.6)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                      <h3 style={{margin:0, color:'#fff'}}>IdeaVortex — {selectedTeam.team_name}</h3>
                      <div>
                        <button onClick={closeIdea} className="logoutBtn" style={{marginLeft:8}}>Close</button>
                      </div>
                    </div>

                    <div style={{color:'#cbd5e1', marginBottom:12}}>Score each category using the sliders. Raw total is scaled by 1.3 and rounded.</div>

                    {(() => {
                      const scores = ideaScores[selectedTeam.id] || { problem:0, innovation:0, approach:0, impact:0, presentation:0, idea_total:0 };
                      const weighted = Math.round((scores.idea_total ?? (Number(scores.problem||0)+Number(scores.innovation||0)+Number(scores.approach||0)+Number(scores.impact||0)+Number(scores.presentation||0))) * 1.3);
                      return (
                        <div style={{display:'grid', gridTemplateColumns:'1fr', gap:12}}>
                          <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                            <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Problem Understanding & Research</div>
                            <input type="range" min={0} max={15} step={1} value={scores.problem} onChange={(e)=>handleIdeaChange(selectedTeam.id, 'problem', e.target.value)} />
                            <div style={{color:'#9ca3af'}}>{scores.problem}</div>
                          </div>

                          <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                            <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Innovation & Creativity</div>
                            <input type="range" min={0} max={15} step={1} value={scores.innovation} onChange={(e)=>handleIdeaChange(selectedTeam.id, 'innovation', e.target.value)} />
                            <div style={{color:'#9ca3af'}}>{scores.innovation}</div>
                          </div>

                          <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                            <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Technical/Business Approach</div>
                            <input type="range" min={0} max={7} step={1} value={scores.approach} onChange={(e)=>handleIdeaChange(selectedTeam.id, 'approach', e.target.value)} />
                            <div style={{color:'#9ca3af'}}>{scores.approach}</div>
                          </div>

                          <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                            <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Impact & Scalability</div>
                            <input type="range" min={0} max={7} step={1} value={scores.impact} onChange={(e)=>handleIdeaChange(selectedTeam.id, 'impact', e.target.value)} />
                            <div style={{color:'#9ca3af'}}>{scores.impact}</div>
                          </div>

                          <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                            <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Presentation Quality</div>
                            <input type="range" min={0} max={6} step={1} value={scores.presentation} onChange={(e)=>handleIdeaChange(selectedTeam.id, 'presentation', e.target.value)} />
                            <div style={{color:'#9ca3af'}}>{scores.presentation}</div>
                          </div>

                          <div style={{display:'flex', justifyContent:'flex-end', marginTop:6, gap:8}}>
                            <div style={{background:'rgba(255,255,255,0.02)', padding:'8px 12px', borderRadius:8, color:'#e6fffa'}}>
                              <strong>IdeaVortex Weighted Total:</strong> {weighted} / 65
                            </div>
                            <div>
                              <button className="logoutBtn" onClick={async () => {
                                try {
                                  const { error } = await supabase.from('scorecards').upsert({ team_id: selectedTeam.id, ideavortex: Number(weighted) }, { onConflict: 'team_id' });
                                  if (error) throw error;
                                  const { data: refreshedTeams } = await supabase.from('teams').select('id, team_name, lead_name, lead_email, domain, problem_statement, team_members(member_name)').order('team_name', { ascending: true });
                                  setTeams(refreshedTeams || []);
                                  const updated = refreshedTeams?.find(t => t.id === selectedTeam.id) || selectedTeam;
                                  setSelectedTeam(updated);
                                  setIdeaOpen(false);
                                } catch (err) {
                                  console.error('Failed to save idea score:', err);
                                  alert('Failed to save idea score: ' + (err.message || err));
                                }
                              }}>Update Score</button>
                              <button className="logoutBtn" onClick={closeIdea} style={{marginLeft:8}}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

        <div style={{flex:1}}>
          <h2 className="panelTitle">Team Details</h2>
          {!selectedTeam && (
            <div className="logBox">Select a team from the left to view details.</div>
          )}

          {selectedTeam && (
            <div>
              <div style={{background:'rgba(0,0,0,0.5)', borderRadius:8, padding:16}}>
                <h3 style={{marginTop:0, color:'#fff'}}>{selectedTeam.team_name}</h3>
                <p style={{color:'#9ca3af', margin:'6px 0'}}><strong>Leader:</strong> {selectedTeam.lead_name || selectedTeam.lead_email}</p>
                <p style={{color:'#9ca3af', margin:'6px 0'}}><strong>Domain:</strong> {selectedTeam.domain ?? 'null'}</p>
                <p style={{color:'#9ca3af', margin:'6px 0'}}><strong>Problem Statement:</strong> {selectedTeam.problem_statement ?? 'null'}</p>
                <div style={{marginTop:8}}>
                  <div style={{color:'#cbd5e1', fontWeight:700, marginBottom:6}}>Team Members</div>
                  {(selectedTeam.team_members || []).length === 0 && <div style={{color:'#9ca3af'}}>No members listed.</div>}
                  <ul style={{margin:0, paddingLeft:18}}>
                    {(selectedTeam.team_members || []).map((m, i) => (
                      <li key={i} style={{color:'#e6fffa'}}>{m.member_name || 'Unnamed Member'}</li>
                    ))}
                  </ul>
                </div>

                <div style={{display:'flex', gap:12, marginTop:16, flexWrap:'wrap'}}>
                  <div onClick={() => { if(selectedTeam) { setIdeaOpen(true); setIdeaScores(prev=>({ ...prev, [selectedTeam.id]: prev[selectedTeam.id] ?? { problem:0, innovation:0, approach:0, impact:0, presentation:0, idea_total:0 } })) } }} style={{cursor: selectedTeam ? 'pointer' : 'not-allowed', flex:'1 1 180px', minWidth:140, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.03)', padding:12, borderRadius:8}}>
                    <div style={{fontSize:12, color:'#9ca3af', marginBottom:8}}>IdeaVortex</div>
                    <div style={{height:60, background:'rgba(0,0,0,0.35)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <small style={{color:'#9ca3af'}}>{selectedTeam ? 'Click to open' : 'Select a team'}</small>
                    </div>
                  </div>

                  <div onClick={() => { if(selectedTeam) { setReview1Open(true); setReview1Scores(prev=>({ ...prev, [selectedTeam.id]: prev[selectedTeam.id] ?? { faculty:0, idea:0, technical:0, architecture:0, innovation:0, planning:0, review_1_total:0 } })) } }} style={{cursor: selectedTeam ? 'pointer' : 'not-allowed', flex:'1 1 140px', minWidth:140, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.03)', padding:12, borderRadius:8}}>
                    <div style={{fontSize:12, color:'#9ca3af', marginBottom:8}}>Review 1</div>
                    <div style={{height:60, background:'rgba(0,0,0,0.35)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <small style={{color:'#9ca3af'}}>{selectedTeam ? 'Click to open' : 'Select a team'}</small>
                    </div>
                  </div>

                  <div onClick={() => { if(selectedTeam) { setReview2Open(true); setReview2Scores(prev=>({ ...prev, [selectedTeam.id]: prev[selectedTeam.id] ?? { progress:0, demo:0, code:0, difficulty:0, fit:0, workflow:0, roadmap:0, review_2_total:0 } })) } }} style={{cursor: selectedTeam ? 'pointer' : 'not-allowed', flex:'1 1 140px', minWidth:140, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.03)', padding:12, borderRadius:8}}>
                    <div style={{fontSize:12, color:'#9ca3af', marginBottom:8}}>Review 2</div>
                    <div style={{height:60, background:'rgba(0,0,0,0.35)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <small style={{color:'#9ca3af'}}>{selectedTeam ? 'Click to open' : 'Select a team'}</small>
                    </div>
                  </div>

                  <div onClick={() => { if(selectedTeam) { setReview3Open(true); setReview3Scores(prev=>({ ...prev, [selectedTeam.id]: prev[selectedTeam.id] ?? { final_product:0, technical:0, innovation:0, uiux:0, impact:0, presentation:0, docs:0, response:0, review_3_total:0 } })) } }} style={{cursor: selectedTeam ? 'pointer' : 'not-allowed', flex:'1 1 140px', minWidth:140, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.03)', padding:12, borderRadius:8}}>
                    <div style={{fontSize:12, color:'#9ca3af', marginBottom:8}}>Review 3</div>
                    <div style={{height:60, background:'rgba(0,0,0,0.35)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <small style={{color:'#9ca3af'}}>{selectedTeam ? 'Click to open' : 'Select a team'}</small>
                    </div>
                  </div>

                  <div onClick={async () => {
                      if (!selectedTeam) return;
                      setPitchOpen(true);
                      // load existing pitch score if any
                      try {
                        const { data, error } = await supabase.from('scorecards').select('pitch_vortex').eq('team_id', selectedTeam.id).single();
                        if (!error && data) {
                          setPitchScores(prev => ({ ...prev, [selectedTeam.id]: data.pitch_vortex ?? 0 }));
                        } else {
                          setPitchScores(prev => ({ ...prev, [selectedTeam.id]: 0 }));
                        }
                      } catch (e) {
                        setPitchScores(prev => ({ ...prev, [selectedTeam.id]: 0 }));
                      }
                    }} style={{cursor: selectedTeam ? 'pointer' : 'not-allowed', flex:'1 1 180px', minWidth:140, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.03)', padding:12, borderRadius:8}}>
                    <div style={{fontSize:12, color:'#9ca3af', marginBottom:8}}>PitchVortex</div>
                    <div style={{height:60, background:'rgba(0,0,0,0.35)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <small style={{color:'#9ca3af'}}>{selectedTeam ? 'Click to enter manual score' : 'Select a team'}</small>
                    </div>
                  </div>
                </div>

                {review1Open && selectedTeam && (
                  <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1200}}>
                    <div style={{width:'min(920px,96%)', maxHeight:'90vh', overflowY:'auto', background:'#0b1620', borderRadius:10, padding:18, boxShadow:'0 10px 30px rgba(0,0,0,0.6)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <h3 style={{margin:0, color:'#fff'}}>Review 1 — {selectedTeam.team_name}</h3>
                        <div>
                          <button onClick={closeReview1} className="logoutBtn" style={{marginLeft:8}}>Close</button>
                        </div>
                      </div>

                      <div style={{color:'#cbd5e1', marginBottom:12}}>Use the sliders to score each category (0–10).</div>

                      {(() => {
                        const scores = review1Scores[selectedTeam.id] || { faculty:0, idea:0, technical:0, architecture:0, innovation:0, planning:0 };
                        return (
                          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:12}}>
                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Faculty Appease Score</div>
                              <input type="range" min={0} max={10} step={1} value={scores.faculty} onChange={(e)=>handleReview1Change(selectedTeam.id, 'faculty', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.faculty}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Idea Feasibility & Solution Approach</div>
                              <input type="range" min={0} max={10} step={1} value={scores.idea} onChange={(e)=>handleReview1Change(selectedTeam.id, 'idea', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.idea}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Initial Technical Implementation</div>
                              <input type="range" min={0} max={10} step={1} value={scores.technical} onChange={(e)=>handleReview1Change(selectedTeam.id, 'technical', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.technical}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Architecture / System Design Readiness</div>
                              <input type="range" min={0} max={8} step={1} value={scores.architecture} onChange={(e)=>handleReview1Change(selectedTeam.id, 'architecture', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.architecture}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Innovation & Uniqueness of Approach</div>
                              <input type="range" min={0} max={6} step={1} value={scores.innovation} onChange={(e)=>handleReview1Change(selectedTeam.id, 'innovation', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.innovation}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Team Planning & Execution Strategy</div>
                              <input type="range" min={0} max={6} step={1} value={scores.planning} onChange={(e)=>handleReview1Change(selectedTeam.id, 'planning', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.planning}</div>
                            </div>

                            <div style={{display:'flex', justifyContent:'flex-end', marginTop:6, gap:8}}>
                              <div style={{background:'rgba(255,255,255,0.02)', padding:'8px 12px', borderRadius:8, color:'#e6fffa'}}>
                                <strong>Review 1 Total:</strong> {scores.review_1_total ?? (Number(scores.faculty||0)+Number(scores.idea||0)+Number(scores.technical||0)+Number(scores.architecture||0)+Number(scores.innovation||0)+Number(scores.planning||0))} / 50
                              </div>
                              <div>
                                <button className="logoutBtn" onClick={async () => {
                                  const total = Number(scores.review_1_total ?? (Number(scores.faculty||0)+Number(scores.idea||0)+Number(scores.technical||0)+Number(scores.architecture||0)+Number(scores.innovation||0)+Number(scores.planning||0)));
                                  try {
                                    const { error } = await supabase.from('scorecards').upsert({ team_id: selectedTeam.id, review_1: total }, { onConflict: 'team_id' });
                                    if (error) throw error;
                                    // refresh teams list and selected team
                                    const { data: refreshedTeams } = await supabase.from('teams').select('id, team_name, lead_name, lead_email, domain, problem_statement, team_members(member_name)').order('team_name', { ascending: true });
                                    setTeams(refreshedTeams || []);
                                    const updated = refreshedTeams?.find(t => t.id === selectedTeam.id) || selectedTeam;
                                    setSelectedTeam(updated);
                                    setReview1Open(false);
                                  } catch (err) {
                                    console.error('Failed to save review1 score:', err);
                                    alert('Failed to save review score: ' + (err.message || err));
                                  }
                                }}>Update Score</button>
                                <button className="logoutBtn" onClick={closeReview1} style={{marginLeft:8}}>Cancel</button>
                              </div>
                            </div>

                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {review2Open && selectedTeam && (
                  <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1200}}>
                    <div style={{width:'min(920px,96%)', maxHeight:'90vh', overflowY:'auto', background:'#0b1620', borderRadius:10, padding:18, boxShadow:'0 10px 30px rgba(0,0,0,0.6)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <h3 style={{margin:0, color:'#fff'}}>Review 2 — {selectedTeam.team_name}</h3>
                        <div>
                          <button onClick={closeReview2} className="logoutBtn" style={{marginLeft:8}}>Close</button>
                        </div>
                      </div>

                      <div style={{color:'#cbd5e1', marginBottom:12}}>Use the sliders to score each category.</div>

                      {(() => {
                        const scores = review2Scores[selectedTeam.id] || { progress:0, demo:0, code:0, difficulty:0, fit:0, workflow:0, roadmap:0, review_2_total:0 };
                        return (
                          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:12}}>
                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Progress & Completion Level</div>
                              <input type="range" min={0} max={10} step={1} value={scores.progress} onChange={(e)=>handleReview2Change(selectedTeam.id, 'progress', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.progress}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Functionality Demo</div>
                              <input type="range" min={0} max={10} step={1} value={scores.demo} onChange={(e)=>handleReview2Change(selectedTeam.id, 'demo', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.demo}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Code Quality & Structure</div>
                              <input type="range" min={0} max={8} step={1} value={scores.code} onChange={(e)=>handleReview2Change(selectedTeam.id, 'code', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.code}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Technical Difficulty & Innovation</div>
                              <input type="range" min={0} max={8} step={1} value={scores.difficulty} onChange={(e)=>handleReview2Change(selectedTeam.id, 'difficulty', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.difficulty}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Problem–Solution Fit & Value</div>
                              <input type="range" min={0} max={6} step={1} value={scores.fit} onChange={(e)=>handleReview2Change(selectedTeam.id, 'fit', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.fit}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Team Workflow & Role Division</div>
                              <input type="range" min={0} max={4} step={1} value={scores.workflow} onChange={(e)=>handleReview2Change(selectedTeam.id, 'workflow', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.workflow}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Roadmap to 100% Completion</div>
                              <input type="range" min={0} max={4} step={1} value={scores.roadmap} onChange={(e)=>handleReview2Change(selectedTeam.id, 'roadmap', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.roadmap}</div>
                            </div>

                            <div style={{display:'flex', justifyContent:'flex-end', marginTop:6, gap:8}}>
                              <div style={{background:'rgba(255,255,255,0.02)', padding:'8px 12px', borderRadius:8, color:'#e6fffa'}}>
                                <strong>Review 2 Total:</strong> {scores.review_2_total ?? (Number(scores.progress||0)+Number(scores.demo||0)+Number(scores.code||0)+Number(scores.difficulty||0)+Number(scores.fit||0)+Number(scores.workflow||0)+Number(scores.roadmap||0))} / 50
                              </div>
                              <div>
                                <button className="logoutBtn" onClick={async () => {
                                  const total = Number(scores.review_2_total ?? (Number(scores.progress||0)+Number(scores.demo||0)+Number(scores.code||0)+Number(scores.difficulty||0)+Number(scores.fit||0)+Number(scores.workflow||0)+Number(scores.roadmap||0)));
                                  try {
                                    const { error } = await supabase.from('scorecards').upsert({ team_id: selectedTeam.id, review_2: total }, { onConflict: 'team_id' });
                                    if (error) throw error;
                                    const { data: refreshedTeams } = await supabase.from('teams').select('id, team_name, lead_name, lead_email, domain, problem_statement, team_members(member_name)').order('team_name', { ascending: true });
                                    setTeams(refreshedTeams || []);
                                    const updated = refreshedTeams?.find(t => t.id === selectedTeam.id) || selectedTeam;
                                    setSelectedTeam(updated);
                                    setReview2Open(false);
                                  } catch (err) {
                                    console.error('Failed to save review2 score:', err);
                                    alert('Failed to save review score: ' + (err.message || err));
                                  }
                                }}>Update Score</button>
                                <button className="logoutBtn" onClick={closeReview2} style={{marginLeft:8}}>Cancel</button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {review3Open && selectedTeam && (
                  <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1200}}>
                    <div style={{width:'min(960px,96%)', maxHeight:'90vh', overflowY:'auto', background:'#0b1620', borderRadius:10, padding:18, boxShadow:'0 10px 30px rgba(0,0,0,0.6)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <h3 style={{margin:0, color:'#fff'}}>Review 3 — {selectedTeam.team_name}</h3>
                        <div>
                          <button onClick={closeReview3} className="logoutBtn" style={{marginLeft:8}}>Close</button>
                        </div>
                      </div>

                      <div style={{color:'#cbd5e1', marginBottom:12}}>Use the sliders to score each category.</div>

                      {(() => {
                        const scores = review3Scores[selectedTeam.id] || { final_product:0, technical:0, innovation:0, uiux:0, impact:0, presentation:0, docs:0, response:0, review_3_total:0 };
                        return (
                          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:12}}>
                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Final Product Completion & Functionality</div>
                              <input type="range" min={0} max={10} step={1} value={scores.final_product} onChange={(e)=>handleReview3Change(selectedTeam.id, 'final_product', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.final_product}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Technical Implementation & Complexity</div>
                              <input type="range" min={0} max={10} step={1} value={scores.technical} onChange={(e)=>handleReview3Change(selectedTeam.id, 'technical', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.technical}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Innovation & Creativity</div>
                              <input type="range" min={0} max={6} step={1} value={scores.innovation} onChange={(e)=>handleReview3Change(selectedTeam.id, 'innovation', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.innovation}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>UI/UX Quality</div>
                              <input type="range" min={0} max={6} step={1} value={scores.uiux} onChange={(e)=>handleReview3Change(selectedTeam.id, 'uiux', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.uiux}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Real-World Usefulness & Impact</div>
                              <input type="range" min={0} max={6} step={1} value={scores.impact} onChange={(e)=>handleReview3Change(selectedTeam.id, 'impact', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.impact}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Presentation & Pitch Delivery</div>
                              <input type="range" min={0} max={5} step={1} value={scores.presentation} onChange={(e)=>handleReview3Change(selectedTeam.id, 'presentation', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.presentation}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Documentation & Code Quality</div>
                              <input type="range" min={0} max={2} step={1} value={scores.docs} onChange={(e)=>handleReview3Change(selectedTeam.id, 'docs', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.docs}</div>
                            </div>

                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <div style={{fontSize:13, color:'#e6fffa', marginBottom:6}}>Response Time</div>
                              <input type="range" min={0} max={5} step={1} value={scores.response} onChange={(e)=>handleReview3Change(selectedTeam.id, 'response', e.target.value)} />
                              <div style={{color:'#9ca3af'}}>{scores.response}</div>
                            </div>

                            <div style={{display:'flex', justifyContent:'flex-end', marginTop:6, gap:8}}>
                              <div style={{background:'rgba(255,255,255,0.02)', padding:'8px 12px', borderRadius:8, color:'#e6fffa'}}>
                                <strong>Review 3 Total (weighted):</strong> {Math.round((scores.review_3_total ?? (Number(scores.final_product||0)+Number(scores.technical||0)+Number(scores.innovation||0)+Number(scores.uiux||0)+Number(scores.impact||0)+Number(scores.presentation||0)+Number(scores.docs||0)+Number(scores.response||0))) * 3.3)} / 165
                              </div>
                              <div>
                                <button className="logoutBtn" onClick={async () => {
                                  const raw = Number(scores.review_3_total ?? (Number(scores.final_product||0)+Number(scores.technical||0)+Number(scores.innovation||0)+Number(scores.uiux||0)+Number(scores.impact||0)+Number(scores.presentation||0)+Number(scores.docs||0)+Number(scores.response||0)));
                                  const weighted = Math.round(raw * 3.3);
                                  try {
                                    const { error } = await supabase.from('scorecards').upsert({ team_id: selectedTeam.id, review_3: weighted }, { onConflict: 'team_id' });
                                    if (error) throw error;
                                    const { data: refreshedTeams } = await supabase.from('teams').select('id, team_name, lead_name, lead_email, domain, problem_statement, team_members(member_name)').order('team_name', { ascending: true });
                                    setTeams(refreshedTeams || []);
                                    const updated = refreshedTeams?.find(t => t.id === selectedTeam.id) || selectedTeam;
                                    setSelectedTeam(updated);
                                    setReview3Open(false);
                                  } catch (err) {
                                    console.error('Failed to save review3 score:', err);
                                    alert('Failed to save review score: ' + (err.message || err));
                                  }
                                }}>Update Score</button>
                                <button className="logoutBtn" onClick={closeReview3} style={{marginLeft:8}}>Cancel</button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
                {pitchOpen && selectedTeam && (
                  <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1200}}>
                    <div style={{width:'min(520px,96%)', maxHeight:'90vh', overflowY:'auto', background:'#0b1620', borderRadius:10, padding:18, boxShadow:'0 10px 30px rgba(0,0,0,0.6)'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                        <h3 style={{margin:0, color:'#fff'}}>PitchVortex — {selectedTeam.team_name}</h3>
                        <div>
                          <button onClick={() => setPitchOpen(false)} className="logoutBtn" style={{marginLeft:8}}>Close</button>
                        </div>
                      </div>

                      <div style={{color:'#cbd5e1', marginBottom:12}}>Enter a manual overall score for the Pitch round (0–100).</div>

                      {(() => {
                        const current = pitchScores[selectedTeam.id] ?? 0;
                        return (
                          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:12}}>
                            <div style={{background:'rgba(255,255,255,0.02)', padding:12, borderRadius:8}}>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                value={current}
                                onChange={(e) => setPitchScores(prev => ({ ...prev, [selectedTeam.id]: Number(e.target.value) }))}
                                style={{width:'100%', padding:8, borderRadius:6}}
                              />
                              <div style={{color:'#9ca3af', marginTop:8}}>Current: {current}</div>
                            </div>

                            <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                              <button className="logoutBtn" onClick={async () => {
                                const val = Number(pitchScores[selectedTeam.id] ?? 0);
                                try {
                                  // upsert the pitch_vortex value for the team's scorecard
                                  const { data, error } = await supabase.from('scorecards').upsert(
                                    { team_id: selectedTeam.id, pitch_vortex: val },
                                    { onConflict: 'team_id' }
                                  );
                                  if (error) throw error;
                                  setPitchOpen(false);
                                  // Optionally refresh leaderboard/teams if needed
                                } catch (err) {
                                  console.error('Failed to save pitch score:', err);
                                  alert('Failed to save pitch score: ' + (err.message || err));
                                }
                              }}>Save</button>
                              <button className="logoutBtn" onClick={() => setPitchOpen(false)}>Cancel</button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
