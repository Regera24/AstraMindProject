import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { getNotifications, markNotificationAsRead, deleteNotification, markAllAsRead } from '../services/notificationService.js';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import { formatDateTime, getRelativeTime } from '../utils/dateUtils.js';
import { formatNotification, getNotificationIcon } from '../utils/notificationUtils.js';
import toast from 'react-hot-toast';

export function Notifications() {
  const { t } = useTranslation();
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
      const errorMessage = error.response?.data?.message || t('notifications.toast.failedToLoad');
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
      toast.success(t('notifications.toast.markedAsRead'));
      fetchNotifications();
      refreshNotifications();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('notifications.toast.failedToMarkAsRead');
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success(t('notifications.toast.deleted'));
      fetchNotifications();
      refreshNotifications();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('notifications.toast.failedToDelete');
      toast.error(errorMessage);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success(t('notifications.toast.allMarkedAsRead'));
      fetchNotifications();
      refreshNotifications();
    } catch (error) {
      const errorMessage = error.response?.data?.message || t('notifications.toast.failedToMarkAllAsRead');
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('notifications.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('notifications.stayUpdated')}</p>
        </div>
        {notifications.length > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <Check className="mr-2 h-4 w-4" />
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text={t('notifications.loading')} />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('notifications.noNotifications')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const formattedNotif = formatNotification(notification, t);
            
            return (
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
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-2xl mt-1">
                          {formattedNotif.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-semibold ${
                              !notification.isRead 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {formattedNotif.displayTitle}
                            </h3>
                            {!notification.isRead && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                                {t('notifications.new')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {formattedNotif.displayMessage}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                            <span>{t('notifications.from')}: {notification.sendAccountUsername || t('notifications.system')}</span>
                            <span>•</span>
                            <span>{getRelativeTime(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                            title={t('notifications.actions.markRead')}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                          title={t('notifications.actions.delete')}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('pagination.page')} {currentPage + 1} {t('pagination.of')} {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
