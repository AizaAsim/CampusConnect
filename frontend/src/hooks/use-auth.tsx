import { createContext, ReactNode, useContext } from 'react';
import { 
  useQuery, 
  useMutation, 
  UseMutationResult,
  useQueryClient 
} from '@tanstack/react-query';
import { User, LoginCredentials, RegisterData, Role } from '@/types';
import { post, get } from '@/lib/api-client';
import { useToast } from './use-toast';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  logoutMutation: UseMutationResult<void, Error, void>;
}

export const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for getting the current user
  const { 
    data: user, 
    error, 
    isLoading 
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => get<User>('/auth/profile'),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Don't throw an error if the user isn't logged in
    useErrorBoundary: false
  });

  // Mutation for logging in
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      post<User>('/auth/login', credentials),
    onSuccess: (data) => {
      // Store token if returned from API
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      // Update user data in cache
      queryClient.setQueryData(['auth', 'user'], data);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.fullName}!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message || 'There was an error logging in. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for registering
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => 
      post<User>('/auth/register', data),
    onSuccess: (data) => {
      // Store token if returned from API
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      // Update user data in cache
      queryClient.setQueryData(['auth', 'user'], data);
      toast({
        title: 'Registration successful',
        description: `Welcome to CampusConnect, ${data.fullName}!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'There was an error registering. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for logging out
  const logoutMutation = useMutation({
    mutationFn: () => post<void>('/auth/logout', {}),
    onSuccess: () => {
      // Clear token
      localStorage.removeItem('auth_token');
      // Clear user data from cache
      queryClient.setQueryData(['auth', 'user'], null);
      // Invalidate all queries
      queryClient.invalidateQueries();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message || 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        registerMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};