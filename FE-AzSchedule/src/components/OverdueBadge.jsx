import { AlertCircle } from 'lucide-react';
import { Badge } from './ui/Badge.jsx';
import { getOverdueMessage } from '../utils/dateUtils.js';

export function OverdueBadge({ endTime, className = '' }) {
  return (
    <Badge 
      variant="outline" 
      className={`bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700 ${className}`}
      title={getOverdueMessage(endTime)}
    >
      <AlertCircle className="h-3 w-3 mr-1" />
      Overdue
    </Badge>
  );
}
