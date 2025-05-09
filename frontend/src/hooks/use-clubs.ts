import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Club, CreateClubDto, UpdateClubDto, ClubMember, CreateClubMemberDto, UpdateClubMemberDto } from '@/types';
import { get, post, patch, del } from '@/lib/api-client';
import { useToast } from './use-toast';

export const useClubs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all clubs
  const useAllClubs = () => 
    useQuery<Club[]>({
      queryKey: ['clubs'],
      queryFn: () => get<Club[]>('/clubs'),
    });

  // Get a specific club by ID
  const useClub = (id: number) => 
    useQuery<Club>({
      queryKey: ['clubs', id],
      queryFn: () => get<Club>(`/clubs/${id}`),
      enabled: !!id,
    });

  // Get clubs associated with a user
  const useUserClubs = (userId: number) => 
    useQuery<Club[]>({
      queryKey: ['clubs', 'user', userId],
      queryFn: () => get<Club[]>(`/clubs/user/${userId}`),
      enabled: !!userId,
    });

  // Create a new club
  const useCreateClub = () => {
    return useMutation({
      mutationFn: (newClub: CreateClubDto) => post<Club>('/clubs', newClub),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['clubs'] });
        toast({
          title: 'Club created',
          description: 'Your club has been created successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error creating club',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Update an existing club
  const useUpdateClub = (id: number) => {
    return useMutation({
      mutationFn: (clubData: UpdateClubDto) => patch<Club>(`/clubs/${id}`, clubData),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['clubs', id] });
        queryClient.invalidateQueries({ queryKey: ['clubs'] });
        toast({
          title: 'Club updated',
          description: 'The club has been updated successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error updating club',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Delete a club
  const useDeleteClub = () => {
    return useMutation({
      mutationFn: (id: number) => del<void>(`/clubs/${id}`),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['clubs'] });
        toast({
          title: 'Club deleted',
          description: 'The club has been deleted successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error deleting club',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Club membership
  const useClubMembers = (clubId: number) => 
    useQuery<ClubMember[]>({
      queryKey: ['clubs', clubId, 'members'],
      queryFn: () => get<ClubMember[]>(`/clubs/${clubId}/members`),
      enabled: !!clubId,
    });

  // Join a club
  const useJoinClub = () => {
    return useMutation({
      mutationFn: (data: CreateClubMemberDto) => post<ClubMember>('/club-members', data),
      onSuccess: (_, variables) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['clubs', variables.clubId, 'members'] });
        queryClient.invalidateQueries({ queryKey: ['clubs', 'user'] });
        toast({
          title: 'Club joined',
          description: 'You have successfully joined the club.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error joining club',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Leave a club
  const useLeaveClub = () => {
    return useMutation({
      mutationFn: ({ clubId, userId }: { clubId: number; userId: number }) => 
        del<void>(`/club-members/${clubId}/user/${userId}`),
      onSuccess: (_, variables) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['clubs', variables.clubId, 'members'] });
        queryClient.invalidateQueries({ queryKey: ['clubs', 'user'] });
        toast({
          title: 'Club left',
          description: 'You have successfully left the club.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error leaving club',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Update club member (e.g., make admin)
  const useUpdateClubMember = () => {
    return useMutation({
      mutationFn: ({ clubId, userId, data }: { clubId: number; userId: number; data: UpdateClubMemberDto }) => 
        patch<ClubMember>(`/club-members/${clubId}/user/${userId}`, data),
      onSuccess: (_, variables) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['clubs', variables.clubId, 'members'] });
        toast({
          title: 'Member updated',
          description: 'The club member has been updated successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error updating member',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  return {
    useAllClubs,
    useClub,
    useUserClubs,
    useCreateClub,
    useUpdateClub,
    useDeleteClub,
    useClubMembers,
    useJoinClub,
    useLeaveClub,
    useUpdateClubMember,
  };
};