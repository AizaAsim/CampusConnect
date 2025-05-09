import { useQuery } from '@tanstack/react-query';
import { OverviewStatistics, UserStatistics } from '@/types';
import { get } from '@/lib/api-client';

export const useStatistics = () => {
  // Get overview statistics
  const useOverviewStats = () => 
    useQuery<OverviewStatistics>({
      queryKey: ['statistics', 'overview'],
      queryFn: () => get<OverviewStatistics>('/statistics/overview'),
      // Statistics can be slightly stale for performance
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Get user-specific statistics
  const useUserStats = (userId: number) => 
    useQuery<UserStatistics>({
      queryKey: ['statistics', 'user', userId],
      queryFn: () => get<UserStatistics>(`/statistics/user/${userId}`),
      enabled: !!userId,
      // Statistics can be slightly stale for performance
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  return {
    useOverviewStats,
    useUserStats,
  };
};