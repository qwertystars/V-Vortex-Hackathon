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

        const role = session?.user?.app_metadata?.role;
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
        .select('team_name, team_size, lead_name, lead_email, lead_reg_no, is_vit_chennai, team_members(member_name, member_reg_no, member_email, institution)');

      if (error) throw error;

      // Build XLSX rows (one row per member; if no members, include single row with empty member fields)
      const header = [
        'Team Name', 'Team Size',
        'Lead Name', 'Lead Email', 'Lead Reg No', 'Lead Is VIT Chennai',
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
            '', '', '', ''
          ]);
        } else {
          members.forEach(m => {
            const memberIsVit = (m.institution === 'VIT Chennai') || !!m.member_reg_no;
            rows.push([
              team.team_name || '', team.team_size || '',
              team.lead_name || '', team.lead_email || '', team.lead_reg_no || '', leadIsVit,
              m.member_name || '', m.member_email || '', m.member_reg_no || '', !!memberIsVit
            ]);
          });
        }
      });

      // Use ExcelJS to generate the workbook in-memory
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Teams');
      worksheet.addRow(header);
      rows.forEach(r => worksheet.addRow(r));

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
      <div className="adminPanel">
        <h2 className="panelTitle">Recent Activity Logs</h2>

        <div className="logBox">
          <p>User DEV01 logged in.</p>
          <p>Permission granted to TEAM-ALPHA.</p>
          <p>New registration request: user_57.</p>
          <p>System scan completed successfully.</p>
        </div>
      </div>
    </div>
  );
}
