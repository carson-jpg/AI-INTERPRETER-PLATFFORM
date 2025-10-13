
import { Camera, BookOpen, Settings, User, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

interface NavigationProps {
  activeMode: 'interpret' | 'learn' | 'settings' | 'profile' | 'materials';
  onModeChange: (mode: 'interpret' | 'learn' | 'settings' | 'profile' | 'materials') => void;
}

const Navigation = ({ activeMode, onModeChange }: NavigationProps) => {
  const { user, signOut, isConfigured } = useAuth();

  const navItems = [
    { id: 'interpret' as const, label: 'Interpret', icon: Camera, path: '/' },
    { id: 'learn' as const, label: 'Learn', icon: BookOpen, path: '/' },
    { id: 'materials' as const, label: 'Materials', icon: GraduationCap, path: isConfigured ? '/materials' : '/' },
    { id: 'profile' as const, label: 'Profile', icon: User, path: isConfigured ? '/profile' : '/' },
    { id: 'settings' as const, label: 'Settings', icon: Settings, path: '/' },
  ];

  const handleSignOut = async () => {
    if (!isConfigured) return;
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
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
