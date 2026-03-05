import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckSquare, FolderKanban, ListTodo, CheckCircle2, Plus, TrendingUp, Target, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { StreakWidget } from '../components/StreakWidget.jsx';
import { getTaskStatistics } from '../services/taskService.js';
import { getAllCategories } from '../services/categoryService.js';
import { getTaskStatusLabel } from '../utils/constants.js';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, categoriesResponse] = await Promise.all([
          getTaskStatistics(),
          getAllCategories()
        ]);
        
        setStatistics(statsResponse.data);
        setCategories(categoriesResponse.data || []);
      } catch (error) {
        const errorMessage = error.response?.data?.message || t('dashboard.failedToLoad');
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text={t('dashboard.loadingDashboard')} />
      </div>
    );
  }

  const statsCards = [
    {
      title: t('dashboard.totalTasks'),
      value: statistics?.totalTasks || 0,
      icon: CheckSquare,
      color: 'text-red-600 bg-gradient-to-br from-red-100 to-red-50 dark:bg-gradient-to-br dark:from-red-900/30 dark:to-red-800/20',
    },
    {
      title: t('dashboard.completedTasks'),
      value: statistics?.completedTasks || 0,
      icon: CheckCircle2,
      color: 'text-green-600 bg-gradient-to-br from-green-100 to-emerald-50 dark:bg-gradient-to-br dark:from-green-900/30 dark:to-emerald-800/20',
    },
    {
      title: t('dashboard.inProgress'),
      value: statistics?.inProgressTasks || 0,
      icon: ListTodo,
      color: 'text-orange-600 bg-gradient-to-br from-orange-100 to-amber-50 dark:bg-gradient-to-br dark:from-orange-900/30 dark:to-amber-800/20',
    },
    {
      title: t('dashboard.categories'),
      value: categories.length,
      icon: FolderKanban,
      color: 'text-yellow-600 bg-gradient-to-br from-yellow-100 to-amber-50 dark:bg-gradient-to-br dark:from-yellow-900/30 dark:to-amber-800/20',
    },
  ];

  return (
    <div className="space-y-6" data-tutorial="dashboard">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.welcomeBack')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Streak Widget, Task Status, and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Streak Widget */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StreakWidget />
        </motion.div>

        {/* Right Column - Task Status and Quick Actions */}
        <div className="space-y-6">
          {/* Task Status Distribution */}
          {statistics && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.taskStatusDistribution')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['TODO', 'IN_PROGRESS', 'DONE', 'PAUSED'].map((status) => {
                  // Map frontend status to backend field names
                  let count = 0;
                  if (status === 'TODO') count = statistics.todoTasks || 0;
                  else if (status === 'IN_PROGRESS') count = statistics.inProgressTasks || 0;
                  else if (status === 'DONE') count = statistics.completedTasks || 0;
                  else if (status === 'PAUSED') count = statistics.pausedTasks || 0;
                  
                  const percentage = statistics.totalTasks > 0 
                    ? Math.round((count / statistics.totalTasks) * 100) 
                    : 0;

                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getTaskStatusLabel(t, status)}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {/* Overdue Tasks */}
                {statistics.overdueTasks > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">⚠️ {t('dashboard.overdueTasks')}</span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">{statistics.overdueTasks || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/tasks"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-red-200 dark:border-red-800/50 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                >
                  <div className="p-3 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 group-hover:from-red-200 group-hover:to-orange-200 dark:group-hover:from-red-900/50 dark:group-hover:to-orange-900/50 transition-colors mb-2">
                    <Plus className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.newTask')}</span>
                </Link>

                <Link
                  to="/analytics"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-orange-200 dark:border-orange-800/50 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group"
                >
                  <div className="p-3 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 group-hover:from-orange-200 group-hover:to-yellow-200 dark:group-hover:from-orange-900/50 dark:group-hover:to-yellow-900/50 transition-colors mb-2">
                    <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.viewAnalytics')}</span>
                </Link>

                <Link
                  to="/categories"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-green-200 dark:border-green-800/50 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group"
                >
                  <div className="p-3 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 group-hover:from-green-200 group-hover:to-emerald-200 dark:group-hover:from-green-900/50 dark:group-hover:to-emerald-900/50 transition-colors mb-2">
                    <FolderKanban className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.categories')}</span>
                </Link>

                <Link
                  to="/focus-mode"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-yellow-200 dark:border-yellow-800/50 hover:border-yellow-500 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-all group"
                >
                  <div className="p-3 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 group-hover:from-yellow-200 group-hover:to-amber-200 dark:group-hover:from-yellow-900/50 dark:group-hover:to-amber-900/50 transition-colors mb-2">
                    <Target className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.focusMode')}</span>
                </Link>
              </div>

              {/* Productivity Tip */}
              <div className="mt-4 p-4 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:to-yellow-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      💡 {t('dashboard.productivityTip')}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t('dashboard.productivityTipText')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}