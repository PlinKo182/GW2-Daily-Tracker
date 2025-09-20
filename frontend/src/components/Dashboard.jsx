import React, { useState, useEffect } from 'react';
import Header from './Header';
import DailyProgress from './DailyProgress';
import DailyTasks from './DailyTasks';
import EventsSection from './EventsSection';
import Footer from './Footer';
import { mockData } from '../utils/mockData';
import api, { localStorageAPI } from '../services/api';

const Dashboard = () => {
  const [dailyProgress, setDailyProgress] = useState({
    gathering: {
      vine_bridge: false,
      prosperity: false,
      destinys_gorge: false
    },
    crafting: {
      mithrillium: false,
      elonian_cord: false,
      spirit_residue: false,
      gossamer: false
    },
    specials: {
      psna: false,
      home_instance: false
    }
  });

  const [completedEvents, setCompletedEvents] = useState({});
  const [completedEventTypes, setCompletedEventTypes] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'offline'

  // Load data from backend or localStorage on component mount
  useEffect(() => {
    loadInitialData();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      syncWithBackend();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Daily reset at UTC midnight
    scheduleDailyReset();

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      // Try to load from backend first
      if (isOnline) {
        setSyncStatus('syncing');
        
        const [progressData, eventsData] = await Promise.all([
          api.getProgress(),
          api.getEvents()
        ]);

        if (progressData && progressData.dailyProgress) {
          setDailyProgress(progressData.dailyProgress);
          localStorageAPI.saveProgress(progressData.dailyProgress);
        }

        if (eventsData) {
          setCompletedEvents(eventsData.completedEvents || {});
          setCompletedEventTypes(eventsData.completedEventTypes || {});
          localStorageAPI.saveEvents(
            eventsData.completedEvents || {}, 
            eventsData.completedEventTypes || {}
          );
        }

        setSyncStatus('synced');
      } else {
        // Fallback to localStorage
        loadLocalData();
        setSyncStatus('offline');
      }
    } catch (error) {
      console.warn('Failed to load from backend, using local data:', error);
      loadLocalData();
      setSyncStatus('offline');
    }
  };

  const loadLocalData = () => {
    // Load from localStorage as fallback
    const savedProgress = localStorageAPI.getProgress();
    const savedEventsData = localStorageAPI.getEvents();

    if (savedProgress) {
      setDailyProgress(savedProgress);
    }

    if (savedEventsData) {
      setCompletedEvents(savedEventsData.completedEvents);
      setCompletedEventTypes(savedEventsData.completedEventTypes);
    }
  };

  const syncWithBackend = async () => {
    if (!isOnline) return;

    try {
      setSyncStatus('syncing');
      
      // Sync progress
      await api.updateProgress(dailyProgress);
      
      // Sync events
      await api.updateEvents(completedEvents, completedEventTypes);
      
      setSyncStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('offline');
    }
  };

  const handleTaskToggle = async (category, task) => {
    const newProgress = {
      ...dailyProgress,
      [category]: {
        ...dailyProgress[category],
        [task]: !dailyProgress[category][task]
      }
    };

    // Optimistic update
    setDailyProgress(newProgress);
    localStorageAPI.saveProgress(newProgress);

    // Sync with backend if online
    if (isOnline) {
      try {
        setSyncStatus('syncing');
        await api.updateProgress(newProgress);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to sync progress:', error);
        setSyncStatus('offline');
      }
    }
  };

  const handleEventToggle = async (eventId, eventKey) => {
    let newCompletedEvents = { ...completedEvents };
    let newCompletedEventTypes = { ...completedEventTypes };

    if (completedEvents[eventId] || completedEventTypes[eventKey]) {
      // Uncomplete the event
      delete newCompletedEvents[eventId];
      
      if (eventKey === "lla") {
        newCompletedEventTypes["lla"] = false;
      }
    } else {
      // Complete the event
      newCompletedEvents[eventId] = true;

      if (eventKey === "lla") {
        newCompletedEventTypes["lla"] = true;
      }
    }

    // Optimistic update
    setCompletedEvents(newCompletedEvents);
    setCompletedEventTypes(newCompletedEventTypes);
    localStorageAPI.saveEvents(newCompletedEvents, newCompletedEventTypes);

    // Sync with backend if online
    if (isOnline) {
      try {
        setSyncStatus('syncing');
        await api.updateEvents(newCompletedEvents, newCompletedEventTypes);
        setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to sync events:', error);
        setSyncStatus('offline');
      }
    }
  };

  const scheduleDailyReset = () => {
    const now = new Date();
    const utcMidnight = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate() + 1, 
      0, 0, 0
    ));
    const timeUntilReset = utcMidnight - now;

    setTimeout(() => {
      // Reset all progress
      const resetProgress = {
        gathering: {
          vine_bridge: false,
          prosperity: false,
          destinys_gorge: false
        },
        crafting: {
          mithrillium: false,
          elonian_cord: false,
          spirit_residue: false,
          gossamer: false
        },
        specials: {
          psna: false,
          home_instance: false
        }
      };

      setDailyProgress(resetProgress);
      setCompletedEvents({});
      setCompletedEventTypes({});

      // Save reset data locally
      localStorageAPI.saveProgress(resetProgress);
      localStorageAPI.saveEvents({}, {});

      // Sync with backend if online
      if (isOnline) {
        api.updateProgress(resetProgress).catch(console.error);
        api.updateEvents({}, {}).catch(console.error);
      }

      // Schedule next reset
      scheduleDailyReset();
    }, timeUntilReset);
  };

  const calculateOverallProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;

    Object.values(dailyProgress).forEach(category => {
      Object.values(category).forEach(task => {
        totalTasks++;
        if (task) completedTasks++;
      });
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const calculateCategoryProgress = (category) => {
    const tasks = dailyProgress[category];
    const totalTasks = Object.keys(tasks).length;
    const completedTasks = Object.values(tasks).filter(Boolean).length;
    
    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header currentTime={currentTime} syncStatus={syncStatus} isOnline={isOnline} />
      
      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Daily Dashboard</h2>
          <p className="text-gray-400">Track your daily progress in Guild Wars 2</p>
        </div>

        <DailyProgress 
          overallProgress={calculateOverallProgress()}
        />

        <DailyTasks 
          dailyProgress={dailyProgress}
          onTaskToggle={handleTaskToggle}
          calculateCategoryProgress={calculateCategoryProgress}
        />

        <EventsSection 
          completedEvents={completedEvents}
          completedEventTypes={completedEventTypes}
          onEventToggle={handleEventToggle}
          currentTime={currentTime}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;