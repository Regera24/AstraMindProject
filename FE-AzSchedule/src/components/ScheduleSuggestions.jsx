import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx';
import { LoadingSpinner } from './ui/LoadingSpinner.jsx';
import { getScheduleSuggestions } from '../services/aiService.js';
import { updateTask, getTaskById } from '../services/taskService.js';
import { getErrorMessage } from '../utils/errorHandler.js';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn.js';

export function ScheduleSuggestions() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());
  const [applyingIds, setApplyingIds] = useState(new Set());
  const [expandedCards, setExpandedCards] = useState(new Set());

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await getScheduleSuggestions(currentYear, currentMonth);
      setSuggestions(response.data);
      setAppliedSuggestions(new Set());
      toast.success(t('ai.scheduleSuggestions'));
    } catch (error) {
      const errorMessage = getErrorMessage(error, t('ai.failedToLoad'));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (suggestion) => {
    try {
      setApplyingIds(prev => new Set([...prev, suggestion.taskId]));
      
      // Get the current task data first to preserve required fields
      const taskResponse = await getTaskById(suggestion.taskId);
      const currentTask = taskResponse.data;
      
      // Use the structured datetime fields from backend
      await updateTask(suggestion.taskId, {
        title: currentTask.title,
        description: currentTask.description,
        status: currentTask.status,
        priority: currentTask.priority,
        categoryId: currentTask.category?.id || null,
        startTime: suggestion.suggestedStartTime,
        endTime: suggestion.suggestedEndTime
      });

      setAppliedSuggestions(prev => new Set([...prev, suggestion.taskId]));
      toast.success(t('ai.suggestionApplied'));
    } catch (error) {
      const errorMessage = getErrorMessage(error, t('error.somethingWentWrong'));
      toast.error(errorMessage);
    } finally {
      setApplyingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(suggestion.taskId);
        return newSet;
      });
    }
  };

  const applyAllSuggestions = async () => {
    if (!suggestions?.suggestions) return;

    const unappliedSuggestions = suggestions.suggestions.filter(
      s => !appliedSuggestions.has(s.taskId)
    );

    for (const suggestion of unappliedSuggestions) {
      await applySuggestion(suggestion);
    }
  };

  const toggleExpand = (taskId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (score) => {
    if (score >= 80) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    if (score >= 60) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
  };

  const getPriorityLabel = (score) => {
    if (score >= 80) return t('ai.urgent');
    if (score >= 60) return t('ai.high');
    if (score >= 40) return t('ai.medium');
    return t('ai.low');
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-blue-600 dark:text-blue-400">{t('ai.analyzingSchedule')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>{t('ai.scheduleSuggestions')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('ai.scheduleOptimization')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('ai.intelligentSuggestions')}
            </p>
            <button
              onClick={fetchSuggestions}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {t('ai.refreshAnalysis')}
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, suggestions: taskSuggestions, analysis } = suggestions;
  const unappliedCount = taskSuggestions.filter(s => !appliedSuggestions.has(s.taskId)).length;

  return (
    <div className="space-y-6" data-tutorial="schedule-suggestions">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>{t('ai.scheduleSuggestions')}</CardTitle>
            </div>
            <button
              onClick={fetchSuggestions}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              {t('ai.refreshAnalysis')}
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-gray-700 dark:text-gray-300">{summary}</p>
          </div>

          {/* Analysis Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('ai.totalTasks')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.totalTasks}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('ai.overdue')}</span>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{analysis.overdueTasks}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('ai.highPriority')}</span>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysis.highPriorityTasks}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('ai.suggestions')}</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{taskSuggestions.length}</p>
            </div>
          </div>

          {/* Productivity Pattern */}
          {analysis.productivityPattern && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('ai.productivityPattern')}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{analysis.productivityPattern}</p>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('ai.recommendations')}</span>
              </div>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-yellow-500 mt-0.5">💡</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply All Button */}
          {unappliedCount > 0 && (
            <button
              onClick={applyAllSuggestions}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{t('ai.applyAllSuggestions')} ({unappliedCount})</span>
            </button>
          )}
        </CardContent>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{t('ai.suggestedChanges')}</span>
        </h3>

        <AnimatePresence>
          {taskSuggestions.map((suggestion, index) => {
            const isApplied = appliedSuggestions.has(suggestion.taskId);
            const isApplying = applyingIds.has(suggestion.taskId);
            const isExpanded = expandedCards.has(suggestion.taskId);

            return (
              <motion.div
                key={suggestion.taskId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  'transition-all duration-300',
                  isApplied && 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                )}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {suggestion.taskTitle}
                            </h4>
                            <span className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              getPriorityColor(suggestion.priorityScore)
                            )}>
                              {getPriorityLabel(suggestion.priorityScore)} ({suggestion.priorityScore})
                            </span>
                          </div>
                        </div>
                        {isApplied && (
                          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">{t('ai.applied')}</span>
                          </div>
                        )}
                      </div>

                      {/* Schedule Comparison */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Current Schedule */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('ai.current')}</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {suggestion.currentSchedule}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="hidden md:flex items-center justify-center -mx-8">
                          <ArrowRight className="h-6 w-6 text-blue-500" />
                        </div>

                        {/* Suggested Schedule */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{t('ai.suggested')}</span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            {suggestion.suggestedSchedule}
                          </p>
                        </div>
                      </div>

                      {/* Reason - Expandable */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                        <button
                          onClick={() => toggleExpand(suggestion.taskId)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <div className="flex items-center space-x-2">
                            <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">{t('ai.reason')}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          )}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-yellow-900 dark:text-yellow-100 mt-2 leading-relaxed">
                                {suggestion.reason}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Action Buttons */}
                      {!isApplied && (
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => applySuggestion(suggestion)}
                            disabled={isApplying}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            {isApplying ? (
                              <>
                                <LoadingSpinner size="sm" />
                                <span>{t('ai.applying')}</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                <span>{t('ai.applySuggestion')}</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setAppliedSuggestions(prev => new Set([...prev, suggestion.taskId]))}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {taskSuggestions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('ai.scheduleOptimized')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('ai.noChangesNeeded')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
