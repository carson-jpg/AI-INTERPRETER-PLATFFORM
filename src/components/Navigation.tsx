
import { Camera, BookOpen, Settings, User, GraduationCap, Users, Bell, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserNotifications } from '../services/mongoApi';
import { INotification } from '../lib/mongo';

interface NavigationProps {
  activeMode: 'interpret' | 'learn' | 'settings' | 'profile' | 'materials' | 'community' | 'schedule';
  onModeChange: (mode: 'interpret' | 'learn' | 'settings' | 'profile' | 'materials' | 'community' | 'schedule') => void;
}

const Navigation = ({ activeMode, onModeChange }: NavigationProps) => {
  const { user, signOut, isConfigured } = useAuth();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = [
    { id: 'interpret' as const, label: 'Interpret', icon: Camera, path: '/' },
    { id: 'learn' as const, label: 'Learn', icon: BookOpen, path: '/' },
    { id: 'materials' as const, label: 'Materials', icon: GraduationCap, path: isConfigured ? '/materials' : '/' },
    { id: 'schedule' as const, label: 'Schedule', icon: Calendar, path: '/' },
    { id: 'community' as const, label: 'Community', icon: Users, path: isConfigured ? '/community' : '/' },
    { id: 'profile' as const, label: 'Profile', icon: User, path: isConfigured ? '/profile' : '/' },
    { id: 'settings' as const, label: 'Settings', icon: Settings, path: '/' },
  ];

  useEffect(() => {
    if (user && isConfigured) {
      loadNotifications();
    }
  }, [user, isConfigured]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const userNotifications = await getUserNotifications(user.id);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleSignOut = async () => {
    if (!isConfigured) return;
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center space-x-4">
      <nav className="flex space-x-1">
        {navItems.map(({ id, label, icon: Icon, path }) => (
          <div key={id}>
            {path === '/' ? (
              <button
                onClick={() => onModeChange(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeMode === id
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ) : (
              <Link
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeMode === id
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {user && isConfigured && (
        <div className="flex items-center space-x-2">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">{unreadCount} unread</p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(notification.created_at)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 10 && (
                  <div className="p-3 text-center border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <span className="text-sm text-gray-600 hidden md:inline">
            {user.user_metadata?.full_name || user.email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Navigation;
