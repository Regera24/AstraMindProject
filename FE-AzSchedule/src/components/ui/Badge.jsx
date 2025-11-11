import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/80',
        secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80',
        success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        danger: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        primary: 'border-transparent bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
        outline: 'text-gray-950 dark:text-gray-50 border border-gray-200 dark:border-gray-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
