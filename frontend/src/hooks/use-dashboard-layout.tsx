import { useState, useEffect, useCallback } from 'react';
import { Widget, WidgetType, DashboardLayout } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Default layout when a user hasn't customized their dashboard yet
const DEFAULT_LAYOUT: Widget[] = [
  { id: uuidv4(), type: 'welcome', order: 0, colSpan: 4 },
  { id: uuidv4(), type: 'quickStats', order: 1, colSpan: 4 },
  { id: uuidv4(), type: 'upcomingEvents', order: 2, colSpan: 2 },
  { id: uuidv4(), type: 'myClubs', order: 3, colSpan: 2 },
  { id: uuidv4(), type: 'recentActivity', order: 4, colSpan: 2 },
  { id: uuidv4(), type: 'notes', order: 5, colSpan: 2 },
];

// Storage key for saving dashboard layout in localStorage
const STORAGE_KEY = 'campusconnect_dashboard_layout';

export const useDashboardLayout = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load layout from localStorage on initial render
  useEffect(() => {
    const loadLayout = () => {
      try {
        const savedLayout = localStorage.getItem(STORAGE_KEY);
        if (savedLayout) {
          const parsedLayout = JSON.parse(savedLayout);
          setWidgets(parsedLayout.widgets || DEFAULT_LAYOUT);
        } else {
          setWidgets(DEFAULT_LAYOUT);
        }
      } catch (error) {
        console.error('Error loading dashboard layout:', error);
        setWidgets(DEFAULT_LAYOUT);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayout();
  }, []);

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ widgets })
        );
      } catch (error) {
        console.error('Error saving dashboard layout:', error);
      }
    }
  }, [widgets, isLoading]);

  // Add a new widget
  const addWidget = useCallback((type: WidgetType, colSpan: 1 | 2 | 3 | 4 = 2) => {
    // Find the highest order to place new widget at the end
    const maxOrder = Math.max(...widgets.map(w => w.order), -1);
    
    const newWidget: Widget = {
      id: uuidv4(),
      type,
      order: maxOrder + 1,
      colSpan,
    };
    
    setWidgets(prev => [...prev, newWidget]);
    return newWidget;
  }, [widgets]);

  // Remove a widget
  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const filtered = prev.filter(widget => widget.id !== id);
      
      // Re-order the remaining widgets
      return filtered.map((widget, index) => ({
        ...widget,
        order: index,
      }));
    });
  }, []);

  // Update a widget's properties
  const updateWidget = useCallback((id: string, updates: Partial<Omit<Widget, 'id'>>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ));
  }, []);

  // Reorder widgets by updating their order property
  const reorderWidgets = useCallback((reorderedWidgets: Widget[]) => {
    setWidgets(reorderedWidgets.map((widget, index) => ({
      ...widget,
      order: index,
    })));
  }, []);

  // Reset layout to default
  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_LAYOUT);
  }, []);

  return {
    widgets,
    isLoading,
    addWidget,
    removeWidget,
    updateWidget,
    reorderWidgets,
    resetLayout,
  };
};