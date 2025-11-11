import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, TrendingUp, AlertCircle, CheckCircle2, Calendar, Clock, Sparkles } from 'lucide-react';
import { Modal } from './ui/Modal.jsx';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { LoadingSpinner } from './ui/LoadingSpinner.jsx';
import { getScheduleSuggestions } from '../services/aiService.js';
import { getErrorMessage } from '../utils/errorHandler.js';
import toast from 'react-hot-toast';

export function AIScheduleSuggestionModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    if (isOpen && !suggestions) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // JavaScript months are 0-indexed
      
      const response = await getScheduleSuggestions(year, month);
      setSuggestions(response.data);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch schedule suggestions');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setSuggestions(null);
    setSelectedSuggestion(null);
    fetchSuggestions();
  };

  const handleClose = () => {
    setSuggestions(null);
    setSelectedSuggestion(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Schedule Optimization</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Intelligent suggestions for this month</p>
          </div>
        </div>
      }
      size="xl"
      showCloseButton={false}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Analyzing your schedule...</p>
        </div>
      ) : suggestions ? (
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Summary</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">{suggestions.summary}</p>
              </div>
            </div>
          </div>

          {/* Analysis Section */}
          {suggestions.analysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.analysis.totalTasks}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{suggestions.analysis.overdueTasks}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">High Priority</span>
                  <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{suggestions.analysis.highPriorityTasks}</p>
              </div>
            </div>
          )}

          {/* Productivity Pattern */}
          {suggestions.analysis?.productivityPattern && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Productivity Pattern
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">{suggestions.analysis.productivityPattern}</p>
            </div>
          )}

          {/* Recommendations */}
          {suggestions.analysis?.recommendations && suggestions.analysis.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                Recommendations
              </h4>
              <div className="space-y-2">
                {suggestions.analysis.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-600 dark:bg-green-400 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-200">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task Suggestions */}
          {suggestions.suggestions && suggestions.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Suggested Schedule Changes ({suggestions.suggestions.length})
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {suggestions.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.taskId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedSuggestion(selectedSuggestion?.taskId === suggestion.taskId ? null : suggestion)}
                    className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${selectedSuggestion?.taskId === suggestion.taskId
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-semibold text-gray-900 dark:text-white">{suggestion.taskTitle}</h5>
                          <Badge variant="outline" className="text-xs">
                            Score: {suggestion.priorityScore}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Current:</span> {suggestion.currentSchedule}
                              </p>
                              <p className="text-purple-600 dark:text-purple-400 mt-1">
                                <span className="font-medium">Suggested:</span> {suggestion.suggestedSchedule}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {selectedSuggestion?.taskId === suggestion.taskId && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800"
                            >
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium text-purple-600 dark:text-purple-400">Reason:</span> {suggestion.reason}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Suggestions */}
          {(!suggestions.suggestions || suggestions.suggestions.length === 0) && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Your schedule is already optimized! No changes needed.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={handleRefresh}>
              Refresh Analysis
            </Button>
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Failed to load suggestions. Please try again.</p>
          <Button onClick={handleRefresh} className="mt-4">
            Retry
          </Button>
        </div>
      )}
    </Modal>
  );
}
