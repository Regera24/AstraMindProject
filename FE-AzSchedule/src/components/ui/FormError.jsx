import { AlertCircle } from 'lucide-react';

/**
 * FormError Component
 * Display validation error messages with better UX
 */
export function FormError({ error, className = '' }) {
  if (!error) return null;

  return (
    <div className={`flex items-start gap-2 mt-1 ${className}`}>
      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    </div>
  );
}

/**
 * FormErrorList Component
 * Display multiple errors in a list
 */
export function FormErrorList({ errors, className = '' }) {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
            Please fix the following errors:
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field} className="text-sm text-red-800 dark:text-red-300">
                {message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
