import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES, routeForContext } from "../utils/authRouting";

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole = null,
  requireTeam = null,
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
    return <Navigate to={ROUTES.register} replace />;
  }

  return children;
}
