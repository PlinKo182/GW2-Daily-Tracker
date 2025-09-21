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
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'

  // Load data from localStorage on component mount
  useEffect(() => {
    loadInitialData();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Monitor online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      checkApiStatus();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setApiStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check API status on load
    checkApiStatus();

    // Daily reset at UTC midnight
    scheduleDailyReset();

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkApiStatus = async () => {
    if (!isOnline) {
      setApiStatus('offline');
      return;
    }

    try {
      const response = await api.healthCheck();
      setApiStatus(response ? 'online' : 'offline');
    } catch (error) {
      setApiStatus('offline');
    }
  };

  const loadInitialData = () => {
    // Load from localStorage (primary data source)
    const savedProgressData = localStorageAPI.getProgress();
    const savedEventsData = localStorageAPI.getEvents();

    if (savedProgressData && savedProgressData.dailyProgress) {
      setDailyProgress(savedProgressData.dailyProgress);
    }

    if (savedEventsData) {
      setCompletedEvents(savedEventsData.completedEvents);
      setCompletedEventTypes(savedEventsData.completedEventTypes);
    }
  };

  const handleTaskToggle = (category, task) => {
    const newProgress = {
      ...dailyProgress,
      [category]: {
        ...dailyProgress[category],
        [task]: !dailyProgress[category][task]
      }
    };

    // Update state and localStorage
    setDailyProgress(newProgress);
    localStorageAPI.saveProgress(newProgress);
  };

  const handleEventToggle = (eventId, eventKey) => {
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

    // Update state and localStorage
    setCompletedEvents(newCompletedEvents);
    setCompletedEventTypes(newCompletedEventTypes);
    localStorageAPI.saveEvents(newCompletedEvents, newCompletedEventTypes);
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

      // Clear localStorage
      localStorageAPI.clearAll();

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
      <Header currentTime={currentTime} apiStatus={apiStatus} isOnline={isOnline} />
      
      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Daily Dashboard</h2>
          <p className="text-gray-400">Track your daily progress in Guild Wars 2</p>
          <p className="text-xs text-gray-500 mt-2">
            💾 Data stored locally in your browser - no account required!
          </p>
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