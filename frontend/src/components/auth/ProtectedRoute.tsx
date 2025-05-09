import React from 'react';
import { Route, Redirect, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <Route
      {...rest}
      render={(props) => {
        // Show loading spinner while checking authentication
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="mt-2 text-gray-600">Verifying your account...</p>
              </div>
            </div>
          );
        }

        // Redirect to auth page if not authenticated
        if (!user) {
          setLocation('/auth');
          return null;
        }

        // Render the protected component if authenticated
        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;