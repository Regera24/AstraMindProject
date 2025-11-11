import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { LoadingProvider } from './contexts/LoadingContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { Layout } from './components/Layout.jsx';
import { LoadingSpinner } from './components/ui/LoadingSpinner.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AdminProtectedRoute } from './components/AdminProtectedRoute.jsx';

// Lazy load pages
const Landing = lazy(() => import('./pages/Landing.jsx').then(module => ({ default: module.Landing })));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx').then(module => ({ default: module.Dashboard })));
const Login = lazy(() => import('./pages/Login.jsx').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register.jsx').then(module => ({ default: module.Register })));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback.jsx').then(module => ({ default: module.OAuthCallback })));
const Tasks = lazy(() => import('./pages/Tasks.jsx').then(module => ({ default: module.Tasks })));
const Categories = lazy(() => import('./pages/Categories.jsx').then(module => ({ default: module.Categories })));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx').then(module => ({ default: module.Notifications })));
const Settings = lazy(() => import('./pages/Settings.jsx').then(module => ({ default: module.Settings })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx').then(module => ({ default: module.AdminDashboard })));

// Public Route Component (redirect to dashboard if logged in)
function PublicRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <Landing />
          </Suspense>
        }
      />

      {/* Auth routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Login />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Register />
            </Suspense>
          </PublicRoute>
        }
      />
      {/* OAuth Callback Route */}
      <Route
        path="/oauth/callback"
        element={
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <OAuthCallback />
          </Suspense>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <AdminDashboard />
              </Suspense>
            </Layout>
          </AdminProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-96">
                    <LoadingSpinner size="lg" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <LoadingProvider>
          <AuthProvider>
            <NotificationProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 7000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 10000, 
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 7000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <AppContent />
            </NotificationProvider>
          </AuthProvider>
        </LoadingProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
