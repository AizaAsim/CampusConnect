import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Post, CreatePostDto, UpdatePostDto } from '@/types';
import { get, post, patch, del } from '@/lib/api-client';
import { useToast } from './use-toast';

export const usePosts = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all posts
  const useAllPosts = () => 
    useQuery<Post[]>({
      queryKey: ['posts'],
      queryFn: () => get<Post[]>('/posts'),
    });

  // Get a specific post by ID
  const usePost = (id: number) => 
    useQuery<Post>({
      queryKey: ['posts', id],
      queryFn: () => get<Post>(`/posts/${id}`),
      enabled: !!id,
    });

  // Get posts by user ID
  const useUserPosts = (userId: number) => 
    useQuery<Post[]>({
      queryKey: ['posts', 'user', userId],
      queryFn: () => get<Post[]>(`/posts/user/${userId}`),
      enabled: !!userId,
    });

  // Create a new post
  const useCreatePost = () => {
    return useMutation({
      mutationFn: (newPost: CreatePostDto) => post<Post>('/posts', newPost),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        toast({
          title: 'Post created',
          description: 'Your post has been published successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error creating post',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Update an existing post
  const useUpdatePost = (id: number) => {
    return useMutation({
      mutationFn: (postData: UpdatePostDto) => patch<Post>(`/posts/${id}`, postData),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['posts', id] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        toast({
          title: 'Post updated',
          description: 'Your post has been updated successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error updating post',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Delete a post
  const useDeletePost = () => {
    return useMutation({
      mutationFn: (id: number) => del<void>(`/posts/${id}`),
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        toast({
          title: 'Post deleted',
          description: 'Your post has been deleted successfully.',
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        toast({
          title: 'Error deleting post',
          description: error.message || 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  return {
    useAllPosts,
    usePost,
    useUserPosts,
    useCreatePost,
    useUpdatePost,
    useDeletePost,
  };
};