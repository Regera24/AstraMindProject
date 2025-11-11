import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button.jsx';

export function NotificationIcon() {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9"
      onClick={() => navigate('/notifications')}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Button>
  );
}
