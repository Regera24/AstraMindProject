import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Clock, Target, AlertCircle, Award, BarChart3, Brain, Lightbulb, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { getTaskAnalytics, getAIInsights } from '../services/analyticsService.js';
import { getErrorMessage } from '../utils/errorHandler.js';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, subtitle, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const HeatmapCell = ({ hour, day, intensity, count }) => {
  const getColor = (intensity) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity < 0.2) return 'bg-blue-100 dark:bg-blue-900/30';
    if (intensity < 0.4) return 'bg-blue-200 dark:bg-blue-800/50';
    if (intensity < 0.6) return 'bg-blue-300 dark:bg-blue-700/70';
    if (intensity < 0.8) return 'bg-blue-400 dark:bg-blue-600';
    return 'bg-blue-500 dark:bg-blue-500';
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div 
      className={`${getColor(intensity)} rounded transition-all hover:ring-2 hover:ring-blue-400 cursor-pointer`}
      title={`${dayNames[day - 1]} ${hour}:00 - ${count} tasks`}
    />
  );
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Load main analytics only (fast - stats, charts, heatmap)
      const response = await getTaskAnalytics();
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load analytics');
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleGenerateAIInsights = async () => {
    setAiInsightsLoading(true);
    try {
      const insightsResponse = await getAIInsights();
      setAiInsights(insightsResponse.data);
      toast.success('AI insights generated successfully!');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to generate AI insights');
      toast.error(errorMessage);
    } finally {
      setAiInsightsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Unable to load analytics data</p>
      </div>
    );
  }

  const { statistics, statusDistribution, priorityDistribution, categoryDistribution, heatmapData, productivityTrends } = analytics;

  const getProductivityScoreColor = (score) => {
    switch (score) {
      case 'Excellent': return 'text-green-600 dark:text-green-400';
      case 'Good': return 'text-blue-600 dark:text-blue-400';
      case 'Average': return 'text-yellow-600 dark:text-yellow-400';
      case 'Needs Improvement': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreEmoji = (score) => {
    switch (score) {
      case 'Excellent': return '';
      case 'Good': return '';
      case 'Average': return '';
      case 'Needs Improvement': return '';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your productivity and get AI-powered recommendations</p>
      </div>

      {/* AI Insights Section */}
      {aiInsightsLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-pulse" />
                <CardTitle>AI-Powered Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-3/4"></div>
                <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-full"></div>
                <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-2/3"></div>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="h-32 bg-white dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-32 bg-white dark:bg-gray-800 rounded-lg"></div>
                </div>
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-sm text-purple-600 dark:text-purple-400">Analyzing your productivity patterns...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : !aiInsights ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <CardTitle>AI-Powered Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-purple-500 dark:text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Get AI-Powered Productivity Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Let AI analyze your task patterns and provide personalized recommendations to boost your productivity.
                </p>
                <button
                  onClick={handleGenerateAIInsights}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate AI Insights
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <CardTitle>AI-Powered Insights</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getScoreEmoji(aiInsights.productivityScore)}</span>
                  <span className={`text-lg font-bold ${getProductivityScoreColor(aiInsights.productivityScore)}`}>
                    {aiInsights.productivityScore}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">{aiInsights.summary}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Suggestions</h3>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="text-yellow-500 mr-2">💡</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {aiInsights.weaknesses && aiInsights.weaknesses.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Areas for Improvement</h3>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="text-orange-500 mr-2">→</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <span className="text-sm text-purple-900 dark:text-purple-100 font-medium">Productivity Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all"
                      style={{ width: `${aiInsights.scorePercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-purple-900 dark:text-purple-100">
                    {Math.round(aiInsights.scorePercentage)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={statistics.totalTasks}
          icon={BarChart3}
          subtitle={`${statistics.completionRate}% completion rate`}
          color="blue"
        />
        <StatCard
          title="Completed"
          value={statistics.completedTasks}
          icon={CheckCircle2}
          subtitle={`${statistics.tasksCompletedToday} today`}
          color="green"
        />
        <StatCard
          title="In Progress"
          value={statistics.inProgressTasks}
          icon={TrendingUp}
          subtitle={`${statistics.todoTasks} to do`}
          color="orange"
        />
        <StatCard
          title="Overdue"
          value={statistics.overdueTasks}
          icon={AlertCircle}
          subtitle={`${statistics.highPriorityTasks} high priority`}
          color="red"
        />
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Activity Heatmap</CardTitle>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your task activity by day and hour
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Hour labels */}
            <div className="grid grid-cols-25 gap-1 mb-2">
              <div className="text-xs text-gray-500"></div>
              {[...Array(24)].map((_, hour) => (
                <div key={hour} className="text-xs text-gray-500 text-center">
                  {hour % 6 === 0 ? hour : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="grid grid-cols-25 gap-1">
                <div className="text-xs text-gray-500 flex items-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1]}
                </div>
                {[...Array(24)].map((_, hour) => {
                  const cellData = heatmapData.find(d => d.dayOfWeek === day && d.hour === hour) || { intensity: 0, taskCount: 0 };
                  return (
                    <HeatmapCell
                      key={`${day}-${hour}`}
                      hour={hour}
                      day={day}
                      intensity={cellData.intensity}
                      count={cellData.taskCount}
                    />
                  );
                })}
              </div>
            ))}
            
            {/* Legend */}
            <div className="flex items-center justify-end space-x-2 mt-4">
              <span className="text-xs text-gray-500">Less</span>
              <div className="flex space-x-1">
                {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                  <div
                    key={intensity}
                    className={`w-3 h-3 rounded ${
                      intensity === 0 ? 'bg-gray-100 dark:bg-gray-800' :
                      intensity < 0.2 ? 'bg-blue-100 dark:bg-blue-900/30' :
                      intensity < 0.4 ? 'bg-blue-200 dark:bg-blue-800/50' :
                      intensity < 0.6 ? 'bg-blue-300 dark:bg-blue-700/70' :
                      intensity < 0.8 ? 'bg-blue-400 dark:bg-blue-600' :
                      'bg-blue-500 dark:bg-blue-500'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">More</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusDistribution || {}).map(([status, count]) => {
                const colors = {
                  TODO: 'bg-gray-500',
                  IN_PROGRESS: 'bg-blue-500',
                  DONE: 'bg-green-500',
                  PAUSED: 'bg-yellow-500',
                };
                const percentage = statistics.totalTasks > 0 ? (count / statistics.totalTasks) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{status.replace('_', ' ')}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[status]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(priorityDistribution || {}).map(([priority, count]) => {
                const colors = {
                  LOW: 'bg-green-500',
                  MEDIUM: 'bg-yellow-500',
                  HIGH: 'bg-red-500',
                };
                const totalPriority = Object.values(priorityDistribution).reduce((a, b) => a + b, 0);
                const percentage = totalPriority > 0 ? (count / totalPriority) * 100 : 0;
                return (
                  <div key={priority}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{priority}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[priority]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Productivity Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productivity Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Most Productive Day</span>
                </div>
                <p className="text-lg font-semibold">{productivityTrends.mostProductiveDay}</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Most Productive Hour</span>
                </div>
                <p className="text-lg font-semibold">{productivityTrends.mostProductiveHour}</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Tasks/Day</span>
                </div>
                <p className="text-lg font-semibold">{productivityTrends.averageTasksPerDay}</p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Award className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Completion Time</span>
                </div>
                <p className="text-lg font-semibold">{statistics.averageCompletionTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution (if available) */}
      {categoryDistribution && Object.keys(categoryDistribution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryDistribution).map(([category, count]) => (
                <div key={category} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
