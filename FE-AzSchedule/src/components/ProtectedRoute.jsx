import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LoadingSpinner } from './ui/LoadingSpinner.jsx';

/**
 * Protected Route Component
 * Requires user to be authenticated
 * Both USER and ADMIN can access
 */
export function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Verifying authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render children
  return children;
}
