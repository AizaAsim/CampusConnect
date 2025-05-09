import React from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useWebSocket } from '@/hooks/use-websocket';

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useWebSocket();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening the dropdown
      markAllAsRead();
    }
  };

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none flex items-center"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2 px-3 bg-primary flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Notifications</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => markAllAsRead()}
                title="Mark all as read"
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => clearNotifications()}
                title="Clear all notifications"
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-4 px-3 text-sm text-gray-500 text-center">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`py-2 px-3 border-b border-gray-100 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <button
                      onClick={(e) => notification.id && handleMarkAsRead(notification.id, e)}
                      title="Mark as read"
                      className={`text-gray-400 hover:text-primary focus:outline-none ${
                        notification.read ? 'invisible' : 'visible'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="py-2 px-3 text-xs text-center border-t border-gray-100">
            <a href="/notifications" className="text-primary hover:text-primary-hover">
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;