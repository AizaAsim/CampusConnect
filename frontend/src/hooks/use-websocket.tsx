import { createContext, ReactNode, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { Notification } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface WebSocketContextProps {
  connected: boolean;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const WebSocketContext = createContext<WebSocketContextProps | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Calculate unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Connect to WebSocket
  useEffect(() => {
    // Only connect if user is logged in
    if (!user) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') || window.location.host;
    const wsUrl = `${protocol}//${host}/notifications`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      console.log('WebSocket connected');
      
      // Send authentication message
      if (user) {
        socket.send(JSON.stringify({ 
          type: 'authenticate', 
          userId: user.id 
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          // Add a unique ID and read status to each notification
          const newNotification: Notification = {
            ...data,
            id: uuidv4(),
            read: false,
            timestamp: data.timestamp || new Date().toISOString()
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show system notification if browser supports it and permission granted
          if (Notification && Notification.permission === 'granted') {
            new Notification(data.title, {
              body: data.message,
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (user && socketRef.current?.readyState !== WebSocket.OPEN) {
          console.log('Attempting to reconnect WebSocket...');
          socketRef.current = null; // Reset the ref to trigger useEffect
        }
      }, 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);

  // Request notification permissions when needed
  useEffect(() => {
    if (Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, read: true } 
        : notification
    ));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};