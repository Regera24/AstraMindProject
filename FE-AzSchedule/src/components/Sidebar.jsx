import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban,
  BarChart3,
  Bell,
  Settings,
  Shield,
  BookOpen,
  Crown
} from 'lucide-react';
import { cn } from '../utils/cn.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { TutorialButton } from './TutorialButton.jsx';

export function Sidebar({ isMobileMenuOpen = false, onClose = () => {} }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'ADMIN';

  const navigation = [
    {
      name: t('sidebar.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: t('sidebar.tasks'),
      href: '/tasks',
      icon: CheckSquare,
    },
    {
      name: t('sidebar.categories'),
      href: '/categories',
      icon: FolderKanban,
    },
    {
      name: t('sidebar.analytics'),
      href: '/analytics',
      icon: BarChart3,
    },
    {
      name: t('sidebar.notifications'),
      href: '/notifications',
      icon: Bell,
    },
    {
      name: t('sidebar.subscription'),
      href: '/subscription',
      icon: Crown,
    },
  ];

  const helpNavigation = [
    {
      name: t('sidebar.documentation'),
      href: '/docs',
      icon: BookOpen,
    },
  ];

  const handleLinkClick = () => {
    // Close mobile menu when a link is clicked
    if (isMobileMenuOpen) {
      onClose();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:pt-16">
        <div className="flex grow flex-col overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <nav className="flex flex-1 flex-col px-4 py-6">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const tutorialId = item.href === '/tasks' ? 'tasks-menu' 
                  : item.href === '/categories' ? 'categories-menu'
                  : item.href === '/analytics' ? 'analytics-menu'
                  : null;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      data-tutorial={tutorialId}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-700 dark:group-hover:text-primary-300'
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              
              {/* Separator */}
              <li className="my-4">
                <div className="border-t border-gray-200 dark:border-gray-700" />
              </li>

              {/* Help Section */}
              {helpNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200',
                        isActive
                          ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-accent-700 dark:hover:text-accent-300 hover:bg-accent-50 dark:hover:bg-accent-900/10'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive
                            ? 'text-accent-700 dark:text-accent-300'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-accent-700 dark:group-hover:text-accent-300'
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}

              {/* Admin Section - Only visible to admins */}
              {isAdmin && (
                <>
                  <li className="my-4">
                    <div className="border-t border-gray-200 dark:border-gray-700" />
                  </li>
                  <li>
                    <Link
                      to="/admin"
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200',
                        location.pathname === '/admin'
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                      )}
                    >
                      <Shield
                        className={cn(
                          'h-5 w-5 shrink-0',
                          location.pathname === '/admin'
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-purple-700 dark:group-hover:text-purple-300'
                        )}
                      />
                      {t('sidebar.admin')}
                    </Link>
                  </li>
                </>
              )}
              
              {/* Separator */}
              <li className="my-4">
                <div className="border-t border-gray-200 dark:border-gray-700" />
              </li>
              
              {/* Settings */}
              <li>
                <Link
                  to="/settings"
                  className={cn(
                    'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200',
                    location.pathname === '/settings'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <Settings
                    className={cn(
                      'h-5 w-5 shrink-0',
                      location.pathname === '/settings'
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-700 dark:group-hover:text-primary-300'
                    )}
                  />
                  {t('sidebar.settings')}
                </Link>
              </li>
            </ul>

            {/* Help Button at Bottom - Desktop */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
              <TutorialButton variant="sidebar" />
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16">
          <nav className="flex flex-1 flex-col px-4 py-6 overflow-y-auto">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const tutorialId = item.href === '/tasks' ? 'tasks-menu' 
                  : item.href === '/categories' ? 'categories-menu'
                  : item.href === '/analytics' ? 'analytics-menu'
                  : null;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      data-tutorial={tutorialId}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-700 dark:group-hover:text-primary-300'
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              
              {/* Separator */}
              <li className="my-4">
                <div className="border-t border-gray-200 dark:border-gray-700" />
              </li>

              {/* Help Section */}
              {helpNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={handleLinkClick}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200',
                        isActive
                          ? 'bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-accent-700 dark:hover:text-accent-300 hover:bg-accent-50 dark:hover:bg-accent-900/10'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive
                            ? 'text-accent-700 dark:text-accent-300'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-accent-700 dark:group-hover:text-accent-300'
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}

              {/* Admin Section - Only visible to admins */}
              {isAdmin && (
                <>
                  <li className="my-4">
                    <div className="border-t border-gray-200 dark:border-gray-700" />
                  </li>
                  <li>
                    <Link
                      to="/admin"
                      onClick={handleLinkClick}
                      className={cn(
                        'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200',
                        location.pathname === '/admin'
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 shadow-sm'
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'
                      )}
                    >
                      <Shield
                        className={cn(
                          'h-5 w-5 shrink-0',
                          location.pathname === '/admin'
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-purple-700 dark:group-hover:text-purple-300'
                        )}
                      />
                      {t('sidebar.admin')}
                    </Link>
                  </li>
                </>
              )}
              
              {/* Separator */}
              <li className="my-4">
                <div className="border-t border-gray-200 dark:border-gray-700" />
              </li>
              
              {/* Settings */}
              <li>
                <Link
                  to="/settings"
                  onClick={handleLinkClick}
                  className={cn(
                    'group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200',
                    location.pathname === '/settings'
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <Settings
                    className={cn(
                      'h-5 w-5 shrink-0',
                      location.pathname === '/settings'
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-700 dark:group-hover:text-primary-300'
                    )}
                  />
                  {t('sidebar.settings')}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
