import React, { useState, useEffect } from 'react';
import Header from './Header';
import DailyProgress from './DailyProgress';
import DailyTasks from './DailyTasks';
import EventsSection from './EventsSection';
import Footer from './Footer';
import { mockData } from '../utils/mockData';

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

  // Load saved data on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('tyriaTracker_dailyProgress');
    const savedCompletedEvents = localStorage.getItem('tyriaTracker_completedEvents');
    const savedCompletedEventTypes = localStorage.getItem('tyriaTracker_completedEventTypes');

    if (savedProgress) {
      setDailyProgress(JSON.parse(savedProgress));
    }
    if (savedCompletedEvents) {
      setCompletedEvents(JSON.parse(savedCompletedEvents));
    }
    if (savedCompletedEventTypes) {
      setCompletedEventTypes(JSON.parse(savedCompletedEventTypes));
    }

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Daily reset at UTC midnight
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

        // Save reset data
        localStorage.setItem('tyriaTracker_dailyProgress', JSON.stringify(resetProgress));
        localStorage.setItem('tyriaTracker_completedEvents', JSON.stringify({}));
        localStorage.setItem('tyriaTracker_completedEventTypes', JSON.stringify({}));

        // Schedule next reset
        scheduleDailyReset();
      }, timeUntilReset);
    };

    scheduleDailyReset();

    return () => clearInterval(timeInterval);
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    localStorage.setItem('tyriaTracker_dailyProgress', JSON.stringify(dailyProgress));
  }, [dailyProgress]);

  useEffect(() => {
    localStorage.setItem('tyriaTracker_completedEvents', JSON.stringify(completedEvents));
  }, [completedEvents]);

  useEffect(() => {
    localStorage.setItem('tyriaTracker_completedEventTypes', JSON.stringify(completedEventTypes));
  }, [completedEventTypes]);

  const handleTaskToggle = (category, task) => {
    setDailyProgress(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [task]: !prev[category][task]
      }
    }));
  };

  const handleEventToggle = (eventId, eventKey) => {
    if (completedEvents[eventId] || completedEventTypes[eventKey]) {
      // Uncomplete the event
      const newCompletedEvents = { ...completedEvents };
      const newCompletedEventTypes = { ...completedEventTypes };
      
      delete newCompletedEvents[eventId];
      
      if (eventKey === "lla") {
        newCompletedEventTypes["lla"] = false;
      }
      
      setCompletedEvents(newCompletedEvents);
      setCompletedEventTypes(newCompletedEventTypes);
    } else {
      // Complete the event
      setCompletedEvents(prev => ({
        ...prev,
        [eventId]: true
      }));

      if (eventKey === "lla") {
        setCompletedEventTypes(prev => ({
          ...prev,
          ["lla"]: true
        }));
      }
    }
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
      <Header currentTime={currentTime} />
      
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