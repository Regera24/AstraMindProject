import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, RotateCcw, X, BookOpen, Sparkles, Play } from 'lucide-react';
import { useTutorial } from '../contexts/TutorialContext.jsx';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn.js';

export function TutorialButton({ className, variant = 'header', onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startTutorial, hasSeenTutorial } = useTutorial();
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClose = () => {
    setShowMenu(false);
    if (onClose) onClose();
  };

  // Sidebar variant - full width button at bottom
  if (variant === 'sidebar') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all',
            'bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20',
            'hover:from-primary-100 hover:to-accent-100 dark:hover:from-primary-900/30 dark:hover:to-accent-900/30',
            'border border-primary-200 dark:border-primary-800',
            'text-primary-700 dark:text-primary-300',
            'shadow-sm hover:shadow-md',
            className
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold">{t('tutorial.helpCenter')}</div>
            <div className="text-xs opacity-75">{t('tutorial.getStarted')}</div>
          </div>
          {!hasSeenTutorial && (
            <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse flex-shrink-0" />
          )}
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={handleMenuClose}
            />
            
            {/* Menu - positioned above button */}
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-up">
              {/* Header */}
              <div className="relative p-4 bg-gradient-to-r from-primary-500 to-accent-500 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{t('tutorial.helpCenter')}</h3>
                    <p className="text-xs text-white/80">{t('tutorial.helpCenterDesc')}</p>
                  </div>
                  <button
                    onClick={handleMenuClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {/* Interactive Tutorial */}
                <button
                  onClick={() => {
                    startTutorial();
                    handleMenuClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-left group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {hasSeenTutorial ? (
                      <RotateCcw className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    ) : (
                      <Play className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {hasSeenTutorial ? t('tutorial.restart') : t('tutorial.start')}
                      </span>
                      {!hasSeenTutorial && (
                        <span className="px-1.5 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-xs font-medium rounded">
                          {t('tutorial.new')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('tutorial.interactiveGuide')}
                    </div>
                  </div>
                </button>

                {/* Documentation */}
                <button
                  onClick={() => {
                    navigate('/docs');
                    handleMenuClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-left group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/30 dark:to-accent-900/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-5 w-5 text-accent-600 dark:text-accent-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {t('sidebar.documentation')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('tutorial.fullGuide')}
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {t('tutorial.needHelpFooter')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Header variant (not used anymore but kept for compatibility)
  return null;
}
