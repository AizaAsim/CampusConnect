import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import NotificationDropdown from '../notifications/NotificationDropdown';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Posts', href: '/posts', icon: MessageSquare },
    { name: 'Clubs', href: '/clubs', icon: Users },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="p-2 rounded-full bg-white shadow-md text-text-primary"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-primary">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-hover">
            <Link href="/">
              <a className="flex items-center">
                <span className="text-xl font-bold text-white">CampusConnect</span>
              </a>
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary-hover text-white'
                          : 'text-white hover:bg-primary-hover'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-primary-hover">
              {user && (
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-hover flex items-center justify-center text-white">
                      {user.fullName.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user.fullName}</p>
                    <p className="text-xs text-gray-300">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-auto p-1 rounded-full text-gray-300 hover:text-white"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black opacity-50" 
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />
          
          {/* Sidebar component */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-hover">
              <Link href="/">
                <a className="flex items-center">
                  <span className="text-xl font-bold text-white">CampusConnect</span>
                </a>
              </Link>
              <button
                className="ml-auto p-2 text-white"
                onClick={toggleMobileMenu}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-hover text-white'
                            : 'text-white hover:bg-primary-hover'
                        }`}
                        onClick={toggleMobileMenu}
                      >
                        <item.icon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-primary-hover">
                {user && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-hover flex items-center justify-center text-white">
                        {user.fullName.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user.fullName}</p>
                      <p className="text-xs text-gray-300">{user.role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="ml-auto p-1 rounded-full text-gray-300 hover:text-white"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-bold text-text-primary">
                {navigation.find(item => item.href === location)?.name || 'CampusConnect'}
              </h1>
              <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <div className="lg:hidden">
                  {user && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CampusConnect. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;