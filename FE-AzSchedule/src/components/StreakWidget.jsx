import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, TrendingUp, Trophy, Zap, Award, Target } from 'lucide-react';
import { getUserStreak } from '../services/streakService.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.jsx';
import { LoadingSpinner } from './ui/LoadingSpinner.jsx';
import { getErrorMessage } from '../utils/errorHandler.js';
import toast from 'react-hot-toast';

// Animated Fire Component
const AnimatedFire = ({ size = 'default', intensity = 1 }) => {
  const sizes = {
    small: { width: 'w-8', height: 'h-10', text: 'text-2xl' },
    default: { width: 'w-12', height: 'h-16', text: 'text-4xl' },
    large: { width: 'w-20', height: 'h-24', text: 'text-6xl' },
    huge: { width: 'w-32', height: 'h-40', text: 'text-8xl' }
  };

  const { width, height, text } = sizes[size] || sizes.default;

  // Different fire colors based on intensity
  const getFireColors = () => {
    if (intensity >= 30) return ['#FF0000', '#FF4500', '#FFD700']; // Red-Orange-Gold
    if (intensity >= 14) return ['#FF4500', '#FF6B35', '#FFA500']; // Orange
    if (intensity >= 7) return ['#FF6347', '#FF7F50', '#FFA07A']; // Light Orange
    return ['#FFA07A', '#FFB6C1', '#FFE4B5']; // Very Light
  };

  const colors = getFireColors();

  return (
    <div className={`relative ${width} ${height} flex items-center justify-center`}>
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 blur-xl opacity-60"
        animate={{
          background: [
            `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`,
            `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`,
            `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main fire emoji with animation */}
      <motion.div
        className={text}
        animate={{
          scale: [1, 1.1, 0.95, 1.05, 1],
          y: [0, -3, 0, -2, 0],
          rotate: [-2, 2, -1, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🔥
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-orange-400"
          initial={{ opacity: 0, y: 10, x: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [10, -20, -40],
            x: [0, (i - 1) * 5, (i - 1) * 8]
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Extinguished Fire Component
const ExtinguishedFire = ({ size = 'default' }) => {
  const sizes = {
    small: { width: 'w-8', height: 'h-10', text: 'text-2xl' },
    default: { width: 'w-12', height: 'h-16', text: 'text-4xl' },
    large: { width: 'w-20', height: 'h-24', text: 'text-6xl' }
  };

  const { width, height, text } = sizes[size] || sizes.default;

  return (
    <div className={`relative ${width} ${height} flex items-center justify-center opacity-50 grayscale`}>
      <motion.div
        className={text}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 0.95, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        💨
      </motion.div>
    </div>
  );
};

// Week Activity Bar
const WeekActivityBar = ({ weekActivity }) => {
  return (
    <div className="flex items-end justify-between gap-1.5 h-16">
      {weekActivity?.map((day, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            className={`w-full rounded-t-lg transition-all ${
              day.isActive
                ? day.isToday
                  ? 'bg-gradient-to-t from-orange-500 to-yellow-400 shadow-lg shadow-orange-500/50'
                  : 'bg-gradient-to-t from-orange-400 to-orange-300'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
            initial={{ height: 0 }}
            animate={{ height: day.isActive ? '100%' : '20%' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {day.isActive && day.tasksCompleted > 0 && (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {day.tasksCompleted}
                </span>
              </div>
            )}
          </motion.div>
          <span className={`text-xs ${
            day.isToday 
              ? 'font-bold text-orange-600 dark:text-orange-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {day.date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
          </span>
        </div>
      ))}
    </div>
  );
};

// Milestone Badge
const MilestoneBadge = ({ milestone, isNext = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        milestone.achieved
          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-2 border-yellow-400 dark:border-yellow-600'
          : isNext
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 border-dashed'
          : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 opacity-60'
      }`}
    >
      <span className="text-2xl">{milestone.emoji}</span>
      <div>
        <p className={`text-sm font-semibold ${
          milestone.achieved 
            ? 'text-orange-900 dark:text-orange-100' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {milestone.title}
        </p>
        <p className={`text-xs ${
          milestone.achieved 
            ? 'text-orange-700 dark:text-orange-300' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {milestone.days} days
        </p>
      </div>
      {milestone.achieved && (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Award className="w-5 h-5 text-yellow-600" />
        </motion.div>
      )}
    </motion.div>
  );
};

export const StreakWidget = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      setLoading(true);
      const response = await getUserStreak();
      setStreak(response.data);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load streak data');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (!streak) {
    return null;
  }

  const { currentStreak, longestStreak, isActiveToday, weekActivity, milestones, nextMilestone, motivationalMessage } = streak;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 border-2 border-orange-200 dark:border-orange-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Streak Fire
          </CardTitle>
          {isActiveToday && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Active Today
            </motion.div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Streak Display */}
        <div className="flex items-center justify-center gap-8">
          {/* Current Streak */}
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              {currentStreak > 0 ? (
                <motion.div
                  key="fire"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <AnimatedFire size="large" intensity={currentStreak} />
                </motion.div>
              ) : (
                <motion.div
                  key="extinguished"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <ExtinguishedFire size="large" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.div
              className="mt-2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {currentStreak}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Current Streak
              </p>
            </motion.div>
          </div>

          {/* Longest Streak */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-20 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl border-2 border-yellow-400 dark:border-yellow-600 shadow-lg">
              <Trophy className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="mt-2 text-center">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {longestStreak}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Best Streak
              </p>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center p-4 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border border-orange-300 dark:border-orange-800"
        >
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {motivationalMessage}
          </p>
        </motion.div>

        {/* Week Activity */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            This Week
          </h4>
          <WeekActivityBar weekActivity={weekActivity?.map(day => ({
            ...day,
            date: new Date(day.date)
          }))} />
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Next Milestone
            </h4>
            <MilestoneBadge milestone={nextMilestone} isNext={true} />
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStreak / nextMilestone.days) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {nextMilestone.days - currentStreak} days left
              </span>
            </div>
          </div>
        )}

        {/* Milestones Grid */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Milestones
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {milestones?.slice(0, 4).map((milestone, index) => (
              <MilestoneBadge key={index} milestone={milestone} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
