import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { getNotifications, markNotificationAsRead, deleteNotification, markAllAsRead } from '../services/notificationService.js';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import { formatDateTime, getRelativeTime } from '../utils/dateUtils.js';
import toast from 'react-hot-toast';

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { refreshNotifications } = useNotifications();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getNotifications({ pageNo: currentPage, pageSize: 10 });
      setNotifications(response.data.data || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load notifications';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      toast.success('Notification marked as read');
      fetchNotifications();
      refreshNotifications();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark as read';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success('Notification deleted');
      fetchNotifications();
      refreshNotifications();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete notification';
      toast.error(errorMessage);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
      refreshNotifications();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to mark all as read';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Stay updated with your latest notifications.</p>
        </div>
        {notifications.length > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <Check className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading notifications..." />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className={`hover:shadow-md transition-shadow ${
                !notification.isRead ? 'border-l-4 border-l-primary-600' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-semibold ${
                          !notification.isRead 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>From: {notification.sendAccountUsername || 'System'}</span>
                        <span>•</span>
                        <span>{getRelativeTime(notification.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
