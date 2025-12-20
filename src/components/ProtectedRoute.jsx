import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES, routeForContext } from "../utils/authRouting";

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole = null,
  requireTeam = null,
  requireOnboarding = null,
}) {
  const { user, loading, context, contextLoading } = useAuth();

  if (loading || contextLoading) {
    return <div className="loading">SYNCING AUTH MATRIX…</div>;
  }

  if (requireAuth && !user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!requireAuth) {
    return children;
  }

  if (!context) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (requireRole && context.role !== requireRole) {
    return <Navigate to={routeForContext(context)} replace />;
  }

  if (requireTeam === true && !context.teamId) {
    return <Navigate to={ROUTES.leaderRegister} replace />;
  }

  if (requireTeam === false && context.teamId) {
    return <Navigate to={ROUTES.leaderDashboard} replace />;
  }

  if (requireOnboarding === true && !context.onboardingComplete) {
    return <Navigate to={ROUTES.memberOnboarding} replace />;
  }

  if (requireOnboarding === false && context.onboardingComplete) {
    return <Navigate to={ROUTES.memberDashboard} replace />;
  }

  if (context.role === "team_member" && !context.teamId) {
    return <Navigate to={ROUTES.waiting} replace />;
  }

  return children;
}
