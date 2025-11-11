import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { oauthAuthenticate } from '../services/authService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getCurrentAccount } from '../services/accountService.js';
import { getRoleFromToken } from '../utils/jwtUtils.js';
import toast from 'react-hot-toast';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setUserRole } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setErrorMessage('Google authentication was cancelled or failed');
          toast.error('Authentication cancelled');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code received');
          toast.error('Invalid OAuth response');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Send code to backend for authentication
        const response = await oauthAuthenticate(code);

        // Check if token was stored (authService already handles this)
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          setStatus('success');
          toast.success('Login successful!');

          try {
            const userResponse = await getCurrentAccount();
            const user = userResponse.data;
            localStorage.setItem('user', JSON.stringify(user));
            
            const role = getRoleFromToken(token);
            
            if (setUser && setUserRole) {
              setUser(user);
              setUserRole(role);
            }
          } catch (userError) {
            console.error('Failed to fetch user data:', userError);
          }
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          throw new Error('Authentication failed - no token received');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        const errorMsg = error.response?.data?.message || error.message || 'Authentication failed';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setUser, setUserRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-96 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              {status === 'processing' && (
                <>
                  <LoadingSpinner size="lg" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Completing sign in...
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Please wait while we authenticate your account
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                    <svg
                      className="h-12 w-12 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Authentication successful!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Redirecting to dashboard...
                  </p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
                    <svg
                      className="h-12 w-12 text-red-600 dark:text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Authentication failed
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {errorMessage}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Redirecting to login page...
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
