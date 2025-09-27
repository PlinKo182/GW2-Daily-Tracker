// components/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import DailyProgress from './DailyProgress';
import DailyTasks from './DailyTasks';
import EventsSection from './EventsSection/EventsSection';
import Footer from './Footer';
import { useEventFilters } from '../hooks/useEventFilters';
import * as Tabs from '@radix-ui/react-tabs';
import useStore from '../store/useStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ProfileSwitcher } from './ui/ProfileSwitcher';

const Dashboard = () => {
  // Local state for UI that doesn't need to be global
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Get state and actions from the Zustand store
  const {
    notification,
    loadInitialData,
    handleTaskToggle,
    handleEventToggle,
    setNotification,
    checkAndResetDailyProgress,
    getActiveDailyProgress,
    getActiveCompletedEventTypes,
    activeProfile,
  } = useStore();

  // Get active profile data using selectors
  const dailyProgress = getActiveDailyProgress();
  const completedEventTypes = getActiveCompletedEventTypes();

  const { eventFilters, updateEventFilters, isLoading } = useEventFilters();

  // React Query for checking API status
  const { data: apiStatus } = useQuery({
    queryKey: ['apiStatus'],
    queryFn: async () => {
      if (!isOnline) return 'offline';
      try {
        const response = await axios.get('https://api.guildwars2.com/v2/build');
        return response.data && response.data.id ? 'online' : 'unavailable';
      } catch (error) {
        return 'unavailable';
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Effect for initial data load, timers, and online status
  useEffect(() => {
    loadInitialData();
    checkAndResetDailyProgress();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
      // The daily reset check is now handled inside the store, but we still need to trigger it
      checkAndResetDailyProgress();
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timeInterval);
    };
  }, [loadInitialData, checkAndResetDailyProgress]);

  // Progress calculation logic (now depends on store state)
  const calculateOverallProgress = useCallback(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    Object.values(dailyProgress).forEach((category) => {
      Object.values(category).forEach((task) => {
        totalTasks++;
        if (task) completedTasks++;
      });
    });
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [dailyProgress]);

  const calculateCategoryProgress = useCallback(
    (category) => {
      const tasks = dailyProgress[category];
      if (!tasks) return { completed: 0, total: 0, percentage: 0 };
      const totalTasks = Object.keys(tasks).length;
      const completedTasks = Object.values(tasks).filter(Boolean).length;
      return {
        completed: completedTasks,
        total: totalTasks,
        percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      };
    },
    [dailyProgress]
  );

  // React Query for saving progress to MongoDB
  const mutation = useMutation({
    mutationFn: (progressData) =>
      axios.put('https://gw-2-daily-tracker.vercel.app/api/progress', progressData),
    onSuccess: () => {
      setNotification({ type: 'success', message: 'Saved on MongoDB!' });
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (error) => {
      setNotification({ type: 'error', message: `Error: ${error.response?.data?.error || error.message}` });
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const saveProgressToMongo = useCallback(() => {
    const date = new Date().toISOString().slice(0, 10);
    mutation.mutate({
      date,
      dailyProgress,
      completedEventTypes,
      userName: activeProfile, // Use activeProfile for the userName field
      eventFilters,
    });
  }, [dailyProgress, completedEventTypes, activeProfile, eventFilters, mutation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event filters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentTime={currentTime} apiStatus={apiStatus} isOnline={isOnline} />

      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 min-w-[220px] shadow-lg px-4 py-2 rounded text-sm font-semibold ${
            notification.type === 'success'
              ? 'bg-primary text-primary-foreground'
              : 'bg-destructive text-destructive-foreground'
          }`}
        >
          {notification.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Daily Dashboard</h2>
          <p className="text-muted-foreground">Track your daily progress in Guild Wars 2</p>
          <p className="text-xs text-muted-foreground mt-2">
            💾 Data stored localmente no navegador - sem conta!
          </p>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <ProfileSwitcher />
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              onClick={saveProgressToMongo}
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? 'Saving...' : 'Save to MongoDB'}
            </button>
            <Link
              to="/history"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              View History
            </Link>
          </div>
        </div>

        <DailyProgress overallProgress={calculateOverallProgress()} />

        <Tabs.Root defaultValue="tasks" className="mt-8">
          <Tabs.List className="border-b border-border flex items-center gap-4">
            <Tabs.Trigger
              value="tasks"
              className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Daily Tasks
            </Tabs.Trigger>
            <Tabs.Trigger
              value="events"
              className="px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Live Events
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tasks" className="py-6 focus:outline-none">
            <DailyTasks
              dailyProgress={dailyProgress}
              onTaskToggle={handleTaskToggle}
              calculateCategoryProgress={calculateCategoryProgress}
              currentTime={currentTime}
            />
          </Tabs.Content>
          <Tabs.Content value="events" className="py-6 focus:outline-none">
            <EventsSection
              completedEventTypes={completedEventTypes}
              onEventToggle={handleEventToggle}
              currentTime={currentTime}
              eventFilters={eventFilters}
              onEventFilterChange={updateEventFilters}
            />
          </Tabs.Content>
        </Tabs.Root>
      </main>

      <Footer />
    </div>
  );
};

export default React.memo(Dashboard);