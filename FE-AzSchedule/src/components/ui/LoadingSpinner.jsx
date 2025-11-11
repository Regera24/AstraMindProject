import { cn } from '../../utils/cn.js';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function LoadingSpinner({ className, size = 'md', text }) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400',
          sizeMap[size],
          className
        )}
      />
      {text && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
}
