import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { Button } from './ui/Button.jsx';
import { Menu as HeadlessMenu } from '@headlessui/react';
import { NotificationDropdown } from './NotificationDropdown.jsx';

export function Header({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/dashboard" className="ml-2 lg:ml-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AstraMind
              </h1>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* User menu */}
            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.fullName || user?.username || 'User'}
                </span>
              </HeadlessMenu.Button>

              <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700/50 focus:outline-none">
                <div className="py-1">
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <Link
                        to="/settings"
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                    )}
                  </HeadlessMenu.Item>
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <button
                        onClick={logout}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    )}
                  </HeadlessMenu.Item>
                </div>
              </HeadlessMenu.Items>
            </HeadlessMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
