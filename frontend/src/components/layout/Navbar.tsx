import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { LogOut, Menu, X, User, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Close mobile menu on location change
  React.useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isActive = (path: string) => {
    return location === path ? 'text-primary font-medium' : 'text-text-primary';
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    CampusConnect
                  </span>
                </a>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  location === '/dashboard' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent hover:border-gray-300 text-text-primary hover:text-gray-700'
                } text-sm font-medium`}>
                  Dashboard
                </a>
              </Link>
              
              <Link href="/posts">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  location === '/posts' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent hover:border-gray-300 text-text-primary hover:text-gray-700'
                } text-sm font-medium`}>
                  Posts
                </a>
              </Link>
              
              <Link href="/clubs">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  location === '/clubs' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent hover:border-gray-300 text-text-primary hover:text-gray-700'
                } text-sm font-medium`}>
                  Clubs
                </a>
              </Link>
              
              <Link href="/events">
                <a className={`inline-flex items-center px-1 pt-1 border-b-2 ${
                  location === '/events' 
                    ? 'border-primary text-primary' 
                    : 'border-transparent hover:border-gray-300 text-text-primary hover:text-gray-700'
                } text-sm font-medium`}>
                  Events
                </a>
              </Link>
            </div>
          </div>
          
          {/* Right side menus */}
          <div className="flex items-center">
            {user ? (
              <div className="hidden sm:flex sm:items-center sm:space-x-2">
                <NotificationDropdown />
                
                <div className="relative ml-3">
                  <div className="flex space-x-3">
                    <Link href="/profile">
                      <a className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary">
                        <User className="h-5 w-5" />
                        <span>{user.fullName}</span>
                      </a>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-full text-gray-600 hover:text-primary hover:bg-gray-100 focus:outline-none"
                      aria-label="Log out"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex sm:items-center">
                <Link href="/auth">
                  <a className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none">
                    Sign In
                  </a>
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`sm:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/dashboard">
            <a className={`block pl-3 pr-4 py-2 border-l-4 ${
              location === '/dashboard'
                ? 'border-primary text-primary bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } text-base font-medium`}>
              Dashboard
            </a>
          </Link>
          
          <Link href="/posts">
            <a className={`block pl-3 pr-4 py-2 border-l-4 ${
              location === '/posts'
                ? 'border-primary text-primary bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } text-base font-medium`}>
              Posts
            </a>
          </Link>
          
          <Link href="/clubs">
            <a className={`block pl-3 pr-4 py-2 border-l-4 ${
              location === '/clubs'
                ? 'border-primary text-primary bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } text-base font-medium`}>
              Clubs
            </a>
          </Link>
          
          <Link href="/events">
            <a className={`block pl-3 pr-4 py-2 border-l-4 ${
              location === '/events'
                ? 'border-primary text-primary bg-indigo-50'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            } text-base font-medium`}>
              Events
            </a>
          </Link>
        </div>
        
        {/* Mobile user menu */}
        {user ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                  {user.fullName.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                <div className="text-sm font-medium text-gray-500">{user.username}</div>
              </div>
              <div className="ml-auto flex items-center space-x-3">
                <NotificationDropdown />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link href="/profile">
                <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                  Your Profile
                </a>
              </Link>
              <Link href="/settings">
                <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                  Settings
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 space-y-1">
              <Link href="/auth">
                <a className="block text-center px-4 py-2 text-base font-medium text-white bg-primary rounded-md hover:bg-primary-hover">
                  Sign In
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;