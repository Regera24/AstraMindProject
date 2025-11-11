import { useState, useEffect } from 'react';
import { Users, Shield, Activity, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * Admin Dashboard Page
 * Only accessible by users with ADMIN role
 * Displays system-wide statistics and admin functions
 */
export function AdminDashboard() {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          System administration and management
        </p>
      </div>

      {/* Admin Info Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Shield className="h-16 w-16" />
            <div>
              <h2 className="text-2xl font-bold">Welcome, {user?.fullName || user?.username}</h2>
              <p className="text-purple-100">Role: {userRole}</p>
              <p className="text-purple-100 text-sm mt-1">You have full administrative access to the system</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? '...' : '156'}
                </p>
              </div>
              <Users className="h-12 w-12 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? '...' : '2,847'}
                </p>
              </div>
              <Activity className="h-12 w-12 text-secondary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {loading ? '...' : '42'}
                </p>
              </div>
              <Shield className="h-12 w-12 text-accent-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  Healthy
                </p>
              </div>
              <Database className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Functions */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Functions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors">
              <Users className="h-8 w-8 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">User Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage user accounts and permissions</p>
            </button>

            <button className="p-4 bg-secondary-50 dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">
              <Activity className="h-8 w-8 text-secondary-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Activity Logs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View system activity and audit logs</p>
            </button>

            <button className="p-4 bg-accent-50 dark:bg-accent-900 border border-accent-200 dark:border-accent-700 rounded-lg hover:bg-accent-100 dark:hover:bg-accent-800 transition-colors">
              <Database className="h-8 w-8 text-accent-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">System Settings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure system-wide settings</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Admin Access Notice</h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                This page is only accessible to administrators. All actions performed here are logged for security purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
