import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  ListTodo, 
  FolderKanban, 
  BarChart3, 
  Sparkles,
  Bell,
  Settings,
  Calendar,
  Target,
  Zap,
  Shield,
  Search
} from 'lucide-react';
import { cn } from '../utils/cn.js';

export function Documentation() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    {
      id: 'overview',
      title: t('docs.overview'),
      icon: BookOpen,
      content: [
        { type: 'title', text: t('docs.overviewTitle') },
        { type: 'paragraph', text: t('docs.overviewDesc') },
        { type: 'list', items: t('docs.overviewFeatures', { returnObjects: true }) }
      ]
    },
    {
      id: 'tasks',
      title: t('docs.tasksManagement'),
      icon: ListTodo,
      content: [
        { type: 'title', text: t('docs.tasksTitle') },
        { type: 'paragraph', text: t('docs.tasksDesc') },
        { type: 'subtitle', text: t('docs.creatingTasks') },
        { type: 'steps', items: t('docs.creatingTasksSteps', { returnObjects: true }) },
        { type: 'subtitle', text: t('docs.taskProperties') },
        { type: 'list', items: t('docs.taskPropertiesList', { returnObjects: true }) }
      ]
    },
    {
      id: 'categories',
      title: t('docs.categories'),
      icon: FolderKanban,
      content: [
        { type: 'title', text: t('docs.categoriesTitle') },
        { type: 'paragraph', text: t('docs.categoriesDesc') },
        { type: 'subtitle', text: t('docs.usingCategories') },
        { type: 'list', items: t('docs.usingCategoriesList', { returnObjects: true }) }
      ]
    },
    {
      id: 'analytics',
      title: t('docs.analytics'),
      icon: BarChart3,
      content: [
        { type: 'title', text: t('docs.analyticsTitle') },
        { type: 'paragraph', text: t('docs.analyticsDesc') },
        { type: 'subtitle', text: t('docs.analyticsFeatures') },
        { type: 'list', items: t('docs.analyticsFeaturesList', { returnObjects: true }) }
      ]
    },
    {
      id: 'ai',
      title: t('docs.aiFeatures'),
      icon: Sparkles,
      content: [
        { type: 'title', text: t('docs.aiTitle') },
        { type: 'paragraph', text: t('docs.aiDesc') },
        { type: 'subtitle', text: t('docs.aiCapabilities') },
        { type: 'list', items: t('docs.aiCapabilitiesList', { returnObjects: true }) }
      ]
    },
    {
      id: 'notifications',
      title: t('docs.notifications'),
      icon: Bell,
      content: [
        { type: 'title', text: t('docs.notificationsTitle') },
        { type: 'paragraph', text: t('docs.notificationsDesc') },
        { type: 'list', items: t('docs.notificationsList', { returnObjects: true }) }
      ]
    },
    {
      id: 'focus',
      title: t('docs.focusMode'),
      icon: Target,
      content: [
        { type: 'title', text: t('docs.focusModeTitle') },
        { type: 'paragraph', text: t('docs.focusModeDesc') },
        { type: 'subtitle', text: t('docs.focusModeHow') },
        { type: 'steps', items: t('docs.focusModeSteps', { returnObjects: true }) }
      ]
    },
    {
      id: 'tips',
      title: t('docs.tipsAndTricks'),
      icon: Zap,
      content: [
        { type: 'title', text: t('docs.tipsTitle') },
        { type: 'paragraph', text: t('docs.tipsDesc') },
        { type: 'list', items: t('docs.tipsList', { returnObjects: true }) }
      ]
    }
  ];

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.content.some(item => 
      item.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.items?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  const renderContent = (content) => {
    return content.map((item, index) => {
      switch (item.type) {
        case 'title':
          return (
            <h2 key={index} className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {item.text}
            </h2>
          );
        case 'subtitle':
          return (
            <h3 key={index} className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
              {item.text}
            </h3>
          );
        case 'paragraph':
          return (
            <p key={index} className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {item.text}
            </p>
          );
        case 'list':
          return (
            <ul key={index} className="space-y-2 mb-4">
              {item.items.map((listItem, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>{listItem}</span>
                </li>
              ))}
            </ul>
          );
        case 'steps':
          return (
            <ol key={index} className="space-y-3 mb-4">
              {item.items.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-semibold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sticky top-20">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('docs.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('docs.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {t('docs.subtitle')}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {renderContent(
                sections.find(s => s.id === activeSection)?.content || []
              )}
            </div>

            {/* Help Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {t('docs.stillNeedHelp')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('docs.stillNeedHelpDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Documentation;
