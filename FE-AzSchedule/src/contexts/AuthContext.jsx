import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentAccount } from '../services/accountService';
import * as authService from '../services/authService';
import { getRoleFromToken } from '../utils/jwtUtils.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Verify token and get current user data
          const response = await getCurrentAccount();
          setUser(response.data);
          // Extract role from JWT token
          const role = getRoleFromToken(token);
          setUserRole(role);
        } catch (error) {
          console.error('Failed to get user data:', error);
          // Token might be expired, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUser(null);
          setUserRole(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const refreshUserData = async () => {
    try {
      const response = await getCurrentAccount();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const loginUser = async (credentials) => {
    const response = await authService.login(credentials);
    // After login, fetch actual user data
    try {
      const userResponse = await getCurrentAccount();
      setUser(userResponse.data);
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      // Extract role from JWT token
      const token = localStorage.getItem('accessToken');
      const role = getRoleFromToken(token);
      setUserRole(role);
    } catch (error) {
      console.error('Failed to get user data after login:', error);
      // If can't get user data, at least we have the token
      // User will be fetched on next page load
    }
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setUserRole(null);
  };

  const value = {
    user,
    userRole,
    loading,
    isLoggedIn: !!user,
    login: loginUser,
    logout,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
