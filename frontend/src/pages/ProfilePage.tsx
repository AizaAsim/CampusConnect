import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useStatistics } from '@/hooks/use-statistics';
import { User } from '@/types';
import { Loader, UserCircle, Edit, Calendar, MessageSquare, Users, Award } from 'lucide-react';
import { format } from 'date-fns';

type EditableField = 'fullName' | null;

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { useUserStats } = useStatistics();
  const { data: userStats, isLoading } = useUserStats(user?.id || 0);
  
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    fullName: user?.fullName || '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    // In a real app, we would update the user profile via API here
    setEditingField(null);
  };
  
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-primary-hover text-white rounded-full flex items-center justify-center text-4xl font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    {editingField === 'fullName' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="border border-gray-300 rounded px-3 py-1 text-lg font-medium"
                        />
                        <button
                          onClick={handleSave}
                          className="px-3 py-1 bg-primary text-white rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
                        <button
                          onClick={() => setEditingField('fullName')}
                          className="p-1 text-gray-400 hover:text-primary focus:outline-none"
                          aria-label="Edit name"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-500">@{user.username}</p>
                  <p className="mt-1 text-gray-500 flex items-center">
                    <UserCircle className="h-4 w-4 mr-1" />
                    Role: {user.role}
                  </p>
                  <p className="text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            {userStats && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{userStats.clubCount}</div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center justify-center">
                      <Users className="h-4 w-4 mr-1" />
                      Clubs Joined
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{userStats.clubAdminCount}</div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center justify-center">
                      <Award className="h-4 w-4 mr-1" />
                      Clubs Administered
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{userStats.postCount}</div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Posts Created
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary">{userStats.eventCount}</div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center justify-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Events Attended
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upcoming Events */}
            {userStats && userStats.upcomingEvents.length > 0 && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  {userStats.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center p-3 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0 bg-primary text-white p-2 rounded-md">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                        <p className="text-xs text-gray-500">
                          {format(new Date(event.dateTime), 'PPp')}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          event.status === 'GOING' 
                            ? 'bg-success bg-opacity-10 text-success' 
                            : event.status === 'INTERESTED'
                              ? 'bg-accent bg-opacity-10 text-accent'
                              : 'bg-error bg-opacity-10 text-error'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent Activity */}
            {userStats && userStats.recentActivity.length > 0 && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {userStats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-8">
                        {activity.type === 'post' && <MessageSquare className="h-5 w-5 text-accent" />}
                        {activity.type === 'comment' && <MessageSquare className="h-5 w-5 text-primary" />}
                        {activity.type === 'club' && <Users className="h-5 w-5 text-success" />}
                        {activity.type === 'event' && <Calendar className="h-5 w-5 text-primary" />}
                        {activity.type === 'attendance' && <Calendar className="h-5 w-5 text-accent" />}
                      </div>
                      <div className="ml-2 flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.type === 'post' && 'Created a post: '}
                          {activity.type === 'comment' && 'Commented on: '}
                          {activity.type === 'club' && 'Joined club: '}
                          {activity.type === 'event' && 'Created event: '}
                          {activity.type === 'attendance' && 'RSVP to event: '}
                          <span className="font-medium">{activity.title}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(activity.createdAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;