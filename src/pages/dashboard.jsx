import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/dashboard.css";

export default function TeamDashboard() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchTeamData();
  }, [teamId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
    }
  };

  const fetchTeamData = async () => {
    try {
      // Fetch team details
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      // Fetch scorecard
      const { data: scorecardData } = await supabase
        .from('scorecards')
        .select('*')
        .eq('team_id', teamId)
        .single();

      setScorecard(scorecardData);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboardWrapper">
      <nav className="dashboardNav">
        <div className="navLeft">
          <h1>V-VORTEX Dashboard</h1>
        </div>
        <button className="logoutBtn" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboardContent">
        <div className="teamInfo">
          <h2>{team?.team_name}</h2>
          <p>Team Leader: {team?.lead_name}</p>
          <p>Registration: {team?.lead_reg_no}</p>
          <p>Team Size: {team?.team_size} members</p>
        </div>

        <div className="scorecardSection">
          <h3>Your Scorecard</h3>
          {scorecard ? (
            <div className="scorecard">
              <div className="scoreItem">
                <span>Innovation</span>
                <span className="score">{scorecard.innovation_score}/100</span>
              </div>
              <div className="scoreItem">
                <span>Implementation</span>
                <span className="score">{scorecard.implementation_score}/100</span>
              </div>
              <div className="scoreItem">
                <span>Presentation</span>
                <span className="score">{scorecard.presentation_score}/100</span>
              </div>
              <div className="scoreItem">
                <span>Impact</span>
                <span className="score">{scorecard.impact_score}/100</span>
              </div>
              <div className="scoreItem total">
                <span>Total Score</span>
                <span className="score">{scorecard.total_score}/400</span>
              </div>
              {scorecard.judge_comments && (
                <div className="comments">
                  <h4>Judge Comments:</h4>
                  <p>{scorecard.judge_comments}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="noScore">Your team hasn't been scored yet. Check back later!</p>
          )}
        </div>
      </div>
    </div>
  );
}
