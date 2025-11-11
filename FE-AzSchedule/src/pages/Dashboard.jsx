import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, FolderKanban, ListTodo, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { StreakWidget } from '../components/StreakWidget.jsx';
import { getTaskStatistics } from '../services/taskService.js';
import { getAllCategories } from '../services/categoryService.js';
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '../utils/constants.js';
import toast from 'react-hot-toast';

export function Dashboard() {
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
        const errorMessage = error.response?.data?.message || 'Failed to load dashboard data';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Tasks',
      value: statistics?.totalTasks || 0,
      icon: CheckSquare,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Completed Tasks',
      value: statistics?.completedTasks || 0,
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-100 dark:bg-green-900',
    },
    {
      title: 'In Progress',
      value: statistics?.inProgressTasks || 0,
      icon: ListTodo,
      color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900',
    },
    {
      title: 'Categories',
      value: categories.length,
      icon: FolderKanban,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your task overview.</p>
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

      {/* Streak Widget and Task Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Streak Widget */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StreakWidget />
        </motion.div>

        {/* Task Status Distribution */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(TASK_STATUS_LABELS).map(([status, label]) => {
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
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
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
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">⚠️ Overdue Tasks</span>
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">{statistics.overdueTasks || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
