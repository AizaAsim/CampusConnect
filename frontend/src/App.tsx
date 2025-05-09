import React from 'react';
import { Switch, Route, Redirect } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import { AuthProvider } from './hooks/use-auth';
import { WebSocketProvider } from './hooks/use-websocket';
import Navbar from './components/layout/Navbar';
import ToastContainer from './components/ui/ToastContainer';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import PostsPage from './pages/PostsPage';
import ClubsPage from './pages/ClubsPage';
import EventsPage from './pages/EventsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Switch>
                <Route path="/auth" component={AuthPage} />
                <ProtectedRoute path="/" component={DashboardPage} exact />
                <ProtectedRoute path="/dashboard" component={DashboardPage} />
                <ProtectedRoute path="/posts" component={PostsPage} />
                <ProtectedRoute path="/clubs" component={ClubsPage} />
                <ProtectedRoute path="/events" component={EventsPage} />
                <ProtectedRoute path="/profile" component={ProfilePage} />
                <Route path="/404" component={NotFoundPage} />
                <Route>
                  <Redirect to="/404" />
                </Route>
              </Switch>
            </main>
          </div>
          <ToastContainer />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;