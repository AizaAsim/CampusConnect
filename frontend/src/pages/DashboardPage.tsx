import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader, MoveVertical, PanelRightClose, PanelRightOpen, Plus, X } from 'lucide-react';
import React, { useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useDashboardLayout } from '@/hooks/use-dashboard-layout';
import { useStatistics } from '@/hooks/use-statistics';

import WelcomeWidget from '@/components/dashboard/WelcomeWidget';

import { Widget as WidgetType } from '@/types';

// Dashboard widgets

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { widgets, isLoading, addWidget, removeWidget, updateWidget, reorderWidgets, resetLayout } = useDashboardLayout();
  const { useUserStats } = useStatistics();
  const { data: userStats, isLoading: statsLoading } = useUserStats(user?.id || 0);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Render the appropriate widget based on its type
  const renderWidget = (widget: WidgetType) => {
    switch (widget.type) {
      case 'welcome':
        return <WelcomeWidget user={user} />;
      case 'quickStats':
        return <QuickStatsWidget stats={userStats} isLoading={statsLoading} />;
      case 'recentActivity':
        return <RecentActivityWidget activities={userStats?.recentActivity} isLoading={statsLoading} />;
      case 'upcomingEvents':
        return <UpcomingEventsWidget events={userStats?.upcomingEvents} isLoading={statsLoading} />;
      case 'myClubs':
        return <MyClubsWidget userId={user?.id} />;
      case 'clubAnalytics':
        return <ClubAnalyticsWidget userId={user?.id} />;
      case 'eventCalendar':
        return <EventCalendarWidget />;
      case 'weather':
        return <WeatherWidget />;
      case 'activityTrend':
        return <ActivityTrendWidget userId={user?.id} />;
      case 'quickLinks':
        return <QuickLinksWidget />;
      case 'notes':
        return <NotesWidget />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  // Widget component with drag-and-drop functionality
  const Widget = ({ widget }: { widget: WidgetType }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: widget.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      gridColumn: `span ${widget.colSpan || 1} / span ${widget.colSpan || 1}`,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div {...attributes} {...listeners} className="cursor-move p-1">
            <MoveVertical className="h-4 w-4 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-700 capitalize">
            {widget.type.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <button
            onClick={() => removeWidget(widget.id)}
            className="p-1 text-gray-400 hover:text-error focus:outline-none"
            aria-label={`Remove ${widget.type} widget`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          {renderWidget(widget)}
        </div>
      </div>
    );
  };

  // Available widget types for adding new widgets
  const availableWidgetTypes: { type: WidgetType; name: string; description: string; colSpan: 1 | 2; }[] = [
    { type: 'quickStats', name: 'Quick Stats', description: 'View your activity statistics', colSpan: 2 },
    { type: 'recentActivity', name: 'Recent Activity', description: 'Your latest actions and updates', colSpan: 2 },
    { type: 'upcomingEvents', name: 'Upcoming Events', description: 'Events you\'re interested in', colSpan: 2 },
    { type: 'myClubs', name: 'My Clubs', description: 'Clubs you\'re a member of', colSpan: 2 },
    { type: 'clubAnalytics', name: 'Club Analytics', description: 'Stats about your clubs', colSpan: 2 },
    { type: 'eventCalendar', name: 'Event Calendar', description: 'Calendar view of upcoming events', colSpan: 2 },
    { type: 'weather', name: 'Weather', description: 'Current weather on campus', colSpan: 1 },
    { type: 'activityTrend', name: 'Activity Trend', description: 'Your activity over time', colSpan: 2 },
    { type: 'quickLinks', name: 'Quick Links', description: 'Shortcuts to important pages', colSpan: 1 },
    { type: 'notes', name: 'Notes', description: 'Personal notes and reminders', colSpan: 1 },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle widget sidebar"
              >
                {sidebarOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
              </button>
              <button
                onClick={resetLayout}
                className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-md hover:bg-primary hover:text-white focus:outline-none transition-colors"
              >
                Reset Layout
              </button>
            </div>
          </div>

          <div className="mt-6 flex">
            {/* Main content */}
            <div className={`${sidebarOpen ? 'w-3/4 pr-4' : 'w-full'} transition-all duration-300`}>
              <div className="grid grid-cols-4 gap-4">
                {widgets
                  .sort((a, b) => a.order - b.order)
                  .map((widget) => (
                    <Widget key={widget.id} widget={widget} />
                  ))}
              </div>
            </div>

            {/* Sidebar for adding widgets */}
            {sidebarOpen && (
              <div className="w-1/4 pl-4 transition-all duration-300">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Add Widgets</h2>
                  <div className="space-y-3">
                    {availableWidgetTypes.map((widgetType) => (
                      <div
                        key={widgetType.type}
                        className="p-3 border border-gray-200 rounded-md hover:border-primary cursor-pointer transition-colors"
                        onClick={() => addWidget(widgetType.type, widgetType.colSpan)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-700">{widgetType.name}</h3>
                          <Plus className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{widgetType.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;