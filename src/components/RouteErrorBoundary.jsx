import { useLocation } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";

export default function RouteErrorBoundary({ children, fallback }) {
  const location = useLocation();
  return (
    <ErrorBoundary key={location.pathname} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

