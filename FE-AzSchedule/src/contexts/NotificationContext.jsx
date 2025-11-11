import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { countUnreadNotifications, getNotifications, markNotificationAsRead, markAllAsRead } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const { isLoggedIn, user } = useAuth(); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const stompClientRef = useRef(null); 

  const fetchUnreadCount = async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      const countResponse = await countUnreadNotifications();
      setUnreadCount(countResponse.data || 0);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!isLoggedIn) return;
    
    try {
      const response = await getNotifications({ pageNo: 0, pageSize: 8, sortBy: 'createdAt', sortDir: 'desc' });
      
      const notificationsList = response.data?.data || [];
      
      setNotifications(notificationsList);
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
    }
  };

  const refreshNotifications = async () => {
    try {
      const countResponse = await countUnreadNotifications();
      setUnreadCount(countResponse.data || 0);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to refresh notification count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };


  useEffect(() => {
    if (isLoggedIn && user?.username) {
      fetchUnreadCount();
      fetchNotifications();
      
      const socket = new SockJS('http://localhost:8080/ws'); // URL từ WebSocketConfig
      const client = Stomp.over(socket);

      client.debug = () => {}; 
      
      client.connect(
        {}, 
        (frame) => {
          console.log('Connected to WebSocket:', frame);
          stompClientRef.current = client;

          client.subscribe(`/user/${user.username}/queue/new-notification`, (message) => {
            try {
              const notification = JSON.parse(message.body);
              
              toast.success(
                (t) => (
                  <div onClick={() => toast.dismiss(t.id)}>
                    <p className="font-bold">{notification.title}</p>
                    <p>{notification.message}</p>
                  </div>
                ), { 
                  icon: '⏰',
                  duration: 10000 
                }
              );

              setUnreadCount(prev => prev + 1);
              fetchNotifications();
            } catch (e) {
              console.error("Lỗi khi parse thông báo WebSocket:", e);
            }
          });
        },
        (error) => {
          console.error('WebSocket connection error:', error);
        }
      );

      return () => {
        if (stompClientRef.current) {
          stompClientRef.current.disconnect(() => {
            console.log('WebSocket disconnected');
          });
          stompClientRef.current = null;
        }
      };
    } else {
      setUnreadCount(0);
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
        stompClientRef.current = null;
      }
    }
  }, [isLoggedIn, user?.username]); 

  const value = {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    fetchNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}