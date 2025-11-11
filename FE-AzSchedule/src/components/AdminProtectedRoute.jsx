import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getRoleFromToken } from '../utils/jwtUtils.js';
import { LoadingSpinner } from './ui/LoadingSpinner.jsx';
import { Card, CardContent } from './ui/Card.jsx';
import { AlertCircle } from 'lucide-react';

/**
 * Admin Protected Route Component
 * Requires user to be authenticated AND have ADMIN role
 * Checks JWT token's "scope" claim
 */
export function AdminProtectedRoute({ children }) {
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

  // Check role from JWT token
  const token = localStorage.getItem('accessToken');
  const role = getRoleFromToken(token);

  // If not ADMIN, show access denied page
  if (role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have permission to access this page. This area is restricted to administrators only.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Your role:</strong> {role || 'Unknown'}
                <br />
                <strong>Required role:</strong> ADMIN
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and is ADMIN, render children
  return children;
}
