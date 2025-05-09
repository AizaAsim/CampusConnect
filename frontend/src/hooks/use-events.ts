import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event, CreateEventDto, UpdateEventDto, EventAttendee, CreateEventAttendeeDto, UpdateEventAttendeeDto, Status } from '@/types';
import { get, post, patch, del } from '@/lib/api-client';
import { useToast } from './use-toast';

export const useEvents = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all events
  const useAllEvents = () => 
    useQuery<Event[]>({
      queryKey: ['events'],
      queryFn: () => get<Event[]>('/events'),
    });

  // Get future events
  const useFutureEvents = () => 
    useQuery<Event[]>({
      queryKey: ['events', 'future'],
      queryFn: () => get<Event[]>('/events/future'),
    });

  // Get a specific event by ID
  const useEvent = (id: number) => 
    useQuery<Event>({
      queryKey: ['events', id],
      queryFn: () => get<Event>(`/events/${id}`),
      enabled: !!id,
    });

  // Get events for a specific club
  const useClubEvents = (clubId: number) => 
    useQuery<Event[]>({
      queryKey: ['events', 'club', clubId],
      queryFn: () => get<Event[]>(`/events/club/${clubId}`),
      enabled: !!clubId,
    });

  // Get events a user is attending
  const useUserEvents = (userId: number) => 
    useQuery<EventAttendee[]>({
      queryKey: ['events', 'user', userId],
      queryFn: () => get<EventAttendee[]>(`/events/user/${userId}`),
      enabled: !!userId,
    });

  // Create a new event
  const useCreateEvent = () => {
    return useMutation({
      mutationFn: (newEvent: CreateEventDto) => post<Event>('/events', newEvent),
      onSuccess: (data) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['events'] });
        if (data.clubId) {
          queryClient.invalidateQueries({ queryKey: ['events', 'club', data.clubId] });
        }
        toast({
          title: 'Event created',
          description: 'Your event has been created successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error creating event',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Update an existing event
  const useUpdateEvent = (id: number) => {
    return useMutation({
      mutationFn: (eventData: UpdateEventDto) => patch<Event>(`/events/${id}`, eventData),
      onSuccess: (data) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['events', id] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
        if (data.clubId) {
          queryClient.invalidateQueries({ queryKey: ['events', 'club', data.clubId] });
        }
        toast({
          title: 'Event updated',
          description: 'The event has been updated successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error updating event',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Delete an event
  const useDeleteEvent = () => {
    return useMutation({
      mutationFn: (id: number) => del<void>(`/events/${id}`),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['events'] });
        toast({
          title: 'Event deleted',
          description: 'The event has been deleted successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error deleting event',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Event attendance
  const useEventAttendees = (eventId: number) => 
    useQuery<EventAttendee[]>({
      queryKey: ['events', eventId, 'attendees'],
      queryFn: () => get<EventAttendee[]>(`/events/${eventId}/attendees`),
      enabled: !!eventId,
    });

  // Respond to event (going, interested, not going)
  const useRespondToEvent = () => {
    return useMutation({
      mutationFn: (data: CreateEventAttendeeDto) => post<EventAttendee>('/event-attendees', data),
      onSuccess: (_, variables) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'attendees'] });
        queryClient.invalidateQueries({ queryKey: ['events', 'user'] });
        
        const responseMessages = {
          [Status.GOING]: 'You are now attending this event.',
          [Status.INTERESTED]: 'You have marked yourself as interested in this event.',
          [Status.NOT_GOING]: 'You have declined this event.',
        };
        
        toast({
          title: 'Response updated',
          description: responseMessages[variables.status],
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error updating response',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Update response to event
  const useUpdateEventResponse = () => {
    return useMutation({
      mutationFn: ({ eventId, userId, data }: { eventId: number; userId: number; data: UpdateEventAttendeeDto }) => 
        patch<EventAttendee>(`/event-attendees/${eventId}/user/${userId}`, data),
      onSuccess: (_, variables) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'attendees'] });
        queryClient.invalidateQueries({ queryKey: ['events', 'user'] });
        
        const responseMessages = {
          [Status.GOING]: 'You are now attending this event.',
          [Status.INTERESTED]: 'You have marked yourself as interested in this event.',
          [Status.NOT_GOING]: 'You have declined this event.',
        };
        
        toast({
          title: 'Response updated',
          description: responseMessages[variables.data.status],
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error updating response',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Remove response to event
  const useRemoveEventResponse = () => {
    return useMutation({
      mutationFn: ({ eventId, userId }: { eventId: number; userId: number }) => 
        del<void>(`/event-attendees/${eventId}/user/${userId}`),
      onSuccess: (_, variables) => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['events', variables.eventId, 'attendees'] });
        queryClient.invalidateQueries({ queryKey: ['events', 'user'] });
        toast({
          title: 'Response removed',
          description: 'Your response to this event has been removed.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error removing response',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  return {
    useAllEvents,
    useFutureEvents,
    useEvent,
    useClubEvents,
    useUserEvents,
    useCreateEvent,
    useUpdateEvent,
    useDeleteEvent,
    useEventAttendees,
    useRespondToEvent,
    useUpdateEventResponse,
    useRemoveEventResponse,
  };
};