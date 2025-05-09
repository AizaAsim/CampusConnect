import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useClubs } from '@/hooks/use-clubs';
import { Club, CreateClubDto, Role } from '@/types';
import { Loader, Plus, Users, Calendar, UserPlus, X, Edit, Trash } from 'lucide-react';

const ClubsPage: React.FC = () => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'mine'>('all');
  const [formData, setFormData] = useState<CreateClubDto>({
    name: '',
    description: '',
    category: '',
    meetingTime: '',
  });
  
  const { 
    useAllClubs, 
    useUserClubs,
    useCreateClub, 
    useUpdateClub, 
    useDeleteClub,
    useJoinClub,
    useLeaveClub 
  } = useClubs();
  
  const { data: allClubs, isLoading: allClubsLoading } = useAllClubs();
  const { data: userClubs, isLoading: userClubsLoading } = useUserClubs(user?.id || 0);
  const createClubMutation = useCreateClub();
  const updateClubMutation = useUpdateClub(selectedClub?.id || 0);
  const deleteClubMutation = useDeleteClub();
  const joinClubMutation = useJoinClub();
  const leaveClubMutation = useLeaveClub();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateClub = () => {
    createClubMutation.mutate(formData, {
      onSuccess: () => {
        resetForm();
      }
    });
  };

  const handleEditClub = (club: Club) => {
    setSelectedClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      category: club.category || '',
      meetingTime: club.meetingTime || '',
    });
    setIsCreating(true);
  };

  const handleUpdateClub = () => {
    if (!selectedClub) return;
    
    updateClubMutation.mutate(formData, {
      onSuccess: () => {
        resetForm();
      }
    });
  };

  const handleDeleteClub = (id: number) => {
    if (window.confirm('Are you sure you want to delete this club?')) {
      deleteClubMutation.mutate(id);
    }
  };

  const handleJoinClub = (clubId: number) => {
    joinClubMutation.mutate({ clubId });
  };

  const handleLeaveClub = (clubId: number, userId: number) => {
    if (window.confirm('Are you sure you want to leave this club?')) {
      leaveClubMutation.mutate({ clubId, userId });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      meetingTime: '',
    });
    setSelectedClub(null);
    setIsCreating(false);
  };

  const isFormValid = formData.name.trim() && formData.description.trim();
  const isLoading = allClubsLoading || userClubsLoading;
  const displayedClubs = selectedView === 'all' ? allClubs : userClubs;
  const canCreateClub = user?.role === Role.ADMIN || user?.role === Role.CLUB_ADMIN;

  const isUserClubAdmin = (club: Club) => {
    return club.adminId === user?.id;
  };

  const isUserClubMember = (club: Club) => {
    return userClubs?.some(c => c.id === club.id);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campus Clubs</h2>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setSelectedView('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedView === 'all'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              All Clubs
            </button>
            <button
              onClick={() => setSelectedView('mine')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedView === 'mine'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              My Clubs
            </button>
          </div>
          {canCreateClub && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
            >
              <Plus size={16} className="mr-2" />
              New Club
            </button>
          )}
        </div>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {selectedClub ? 'Edit Club' : 'Create New Club'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="club-name" className="block text-sm font-medium text-text-primary mb-1">
                Club Name
              </label>
              <input
                id="club-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter club name"
              />
            </div>
            <div>
              <label htmlFor="club-description" className="block text-sm font-medium text-text-primary mb-1">
                Description
              </label>
              <textarea
                id="club-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary h-32"
                placeholder="Describe the club's purpose and activities"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="club-category" className="block text-sm font-medium text-text-primary mb-1">
                  Category
                </label>
                <select
                  id="club-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a category</option>
                  <option value="Academic">Academic</option>
                  <option value="Arts">Arts</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Technology">Technology</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="club-meeting-time" className="block text-sm font-medium text-text-primary mb-1">
                  Meeting Time (optional)
                </label>
                <input
                  id="club-meeting-time"
                  name="meetingTime"
                  type="text"
                  value={formData.meetingTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="e.g., Tuesdays at 5 PM"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-text-primary bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={selectedClub ? handleUpdateClub : handleCreateClub}
                disabled={createClubMutation.isPending || updateClubMutation.isPending || !isFormValid}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(createClubMutation.isPending || updateClubMutation.isPending) ? (
                  <Loader className="h-4 w-4 animate-spin mx-auto" />
                ) : selectedClub ? 'Update Club' : 'Create Club'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : displayedClubs && displayedClubs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedClubs.map((club) => (
            <div key={club.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mr-3">
                    {club.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{club.name}</h3>
                    {club.category && (
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs text-text-secondary">
                        {club.category}
                      </span>
                    )}
                  </div>
                </div>
                {isUserClubAdmin(club) && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditClub(club)}
                      className="text-gray-400 hover:text-primary p-1"
                      title="Edit club"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="text-gray-400 hover:text-error p-1"
                      title="Delete club"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-text-secondary mb-4 flex-grow">{club.description}</p>
              {club.meetingTime && (
                <div className="flex items-center text-text-secondary text-sm mb-4">
                  <Calendar size={14} className="mr-2" />
                  {club.meetingTime}
                </div>
              )}
              <div className="flex items-center text-text-secondary text-sm mb-4">
                <Users size={14} className="mr-2" />
                {club._count?.members || 0} members
              </div>
              <div className="mt-auto pt-4 border-t border-gray-100">
                {isUserClubMember(club) ? (
                  <button
                    onClick={() => handleLeaveClub(club.id, user?.id || 0)}
                    className="w-full py-2 text-sm font-medium text-text-secondary border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    Leave Club
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinClub(club.id)}
                    disabled={joinClubMutation.isPending}
                    className="w-full py-2 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white flex items-center justify-center"
                  >
                    {joinClubMutation.isPending ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={14} className="mr-2" />
                        Join Club
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {selectedView === 'all' ? 'No Clubs Found' : 'You haven\'t joined any clubs yet'}
          </h3>
          <p className="text-text-secondary mb-6">
            {selectedView === 'all' 
              ? 'There are no clubs available at the moment.'
              : 'Join a club to connect with others who share your interests.'}
          </p>
          {selectedView === 'mine' && (
            <button
              onClick={() => setSelectedView('all')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
            >
              Browse All Clubs
            </button>
          )}
          {selectedView === 'all' && canCreateClub && (
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-sm"
            >
              <Plus size={16} className="mr-2" />
              Create Club
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClubsPage;