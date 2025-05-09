import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/hooks/use-posts';
import { Post, CreatePostDto } from '@/types';
import { Loader, PlusCircle, Edit2, Trash2, MessageSquare, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PostsPage: React.FC = () => {
  const { user } = useAuth();
  const { useAllPosts, useCreatePost, useUpdatePost, useDeletePost } = usePosts();
  
  const { data: posts, isLoading } = useAllPosts();
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost(0); // Will be updated when editing a post
  const deletePostMutation = useDeletePost();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<CreatePostDto>({
    title: '',
    content: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({ title: '', content: '' });
        setShowCreateForm(false);
      },
    });
  };
  
  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updatePostMutation.mutate(formData, {
        onSuccess: () => {
          setFormData({ title: '', content: '' });
          setEditingPost(null);
        },
      });
    }
  };
  
  const startEditing = (post: Post) => {
    setEditingPost(post);
    setFormData({ title: post.title, content: post.content });
  };
  
  const cancelEditing = () => {
    setEditingPost(null);
    setFormData({ title: '', content: '' });
  };
  
  const handleDelete = (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(postId);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Campus Posts</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              {showCreateForm ? 'Cancel' : 'Create Post'}
            </button>
          </div>
          
          {/* Create Form */}
          {showCreateForm && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create a New Post</h2>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    name="content"
                    id="content"
                    rows={4}
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={createPostMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none disabled:opacity-70 flex items-center"
                  >
                    {createPostMutation.isPending ? (
                      <>
                        <Loader className="h-4 w-4 mr-1 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Post'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Edit Form */}
          {editingPost && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Post</h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="edit-title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    name="content"
                    id="edit-content"
                    rows={4}
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={updatePostMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none disabled:opacity-70 flex items-center"
                  >
                    {updatePostMutation.isPending ? (
                      <>
                        <Loader className="h-4 w-4 mr-1 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Post'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Posts List */}
          <div className="mt-6 space-y-6">
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                      {post.authorId === user?.id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditing(post)}
                            className="p-1 text-gray-400 hover:text-primary focus:outline-none"
                            aria-label="Edit post"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1 text-gray-400 hover:text-error focus:outline-none"
                            aria-label="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-gray-600 whitespace-pre-wrap">{post.content}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>{post.author?.fullName || 'Unknown user'}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{post._count?.comments || 0} comments</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts yet. Be the first to create a post!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsPage;