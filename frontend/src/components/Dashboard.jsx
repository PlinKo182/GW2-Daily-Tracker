import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import DailyProgress from './DailyProgress';
import DailyTasks from './DailyTasks';
import EventsSection from './EventsSection';
import Footer from './Footer';
import { mockData } from '../utils/mockData';
import api, { localStorageAPI } from '../services/api';

// Componente isolado para atualização do tempo
const TimeUpdater = ({ onTimeUpdate }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      onTimeUpdate(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [onTimeUpdate]);
  
  return null;
};

const Dashboard = () => {
  const [notification, setNotification] = useState(null);
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
  const [apiStatus, setApiStatus] = useState('checking');
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('tyriaTracker_userName') || 'PlinKo';
  });

  // Usar useRef para valores que não devem causar re-renderização
  const currentTimeRef = useRef(currentTime);
  
  // Atualizar both state and ref
  const updateCurrentTime = useCallback((newTime) => {
    currentTimeRef.current = newTime;
    setCurrentTime(newTime);
  }, []);

  // Função para salvar progresso no MongoDB
  const saveProgressToMongo = useCallback((dailyProgress, completedEvents, completedEventTypes, userName) => {
    const date = new Date().toISOString().slice(0, 10);
    fetch('https://gw-2-daily-tracker-emergent.vercel.app/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, dailyProgress, completedEvents, completedEventTypes, userName })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotification({ type: 'success', message: 'Saved on MongoDB!' });
        } else {
          setNotification({ type: 'error', message: 'Error: ' + data.error });
        }
        setTimeout(() => setNotification(null), 4000);
      })
      .catch(error => {
        setNotification({ type: 'error', message: 'Connection error: ' + error.message });
        setTimeout(() => setNotification(null), 4000);
      });
  }, []);

  const handleUserNameChange = useCallback((e) => {
    setUserName(e.target.value);
    localStorage.setItem('tyriaTracker_userName', e.target.value);
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadInitialData();

    // Monitor online/offline status
    const handleOnline = () => {
      checkApiStatus();
    };
    
    const handleOffline = () => {
      setApiStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check API status on load
    checkApiStatus();

    // Daily reset at UTC midnight
    scheduleDailyReset();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkApiStatus = async () => {
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

  const handleTaskToggle = useCallback((category, task) => {
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
  }, [dailyProgress]);

  const handleEventToggle = useCallback((eventId, eventKey) => {
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
  }, [completedEvents, completedEventTypes]);

  const scheduleDailyReset = useCallback(() => {
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
  }, []);

  const calculateOverallProgress = useCallback(() => {
    let totalTasks = 0;
    let completedTasks = 0;

    Object.values(dailyProgress).forEach(category => {
      Object.values(category).forEach(task => {
        totalTasks++;
        if (task) completedTasks++;
      });
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [dailyProgress]);

  const calculateCategoryProgress = useCallback((category) => {
    const tasks = dailyProgress[category];
    const totalTasks = Object.keys(tasks).length;
    const completedTasks = Object.values(tasks).filter(Boolean).length;
    
    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  }, [dailyProgress]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header currentTime={currentTime} apiStatus={apiStatus} isOnline={isOnline} />

      {/* Componente isolado para atualização do tempo */}
      <TimeUpdater onTimeUpdate={updateCurrentTime} />

      {/* Notificação no canto inferior direito */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 min-w-[220px] shadow-lg px-4 py-2 rounded text-sm font-semibold ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-2">Daily Dashboard</h2>
          <p className="text-gray-400">Track your daily progress in Guild Wars 2</p>
          <p className="text-xs text-gray-500 mt-2">
            💾 Data stored localmente no navegador - sem conta!
          </p>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <label htmlFor="userName" className="text-sm text-gray-300">Nome do usuário:</label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={handleUserNameChange}
              className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
              style={{ minWidth: 100 }}
            />
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
              onClick={() => saveProgressToMongo(dailyProgress, completedEvents, completedEventTypes, userName)}
            >
              Save to MongoDB
            </button>
          </div>
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
          currentTime={currentTimeRef.current} // Passar a referência, não o estado
        />
      </main>

      <Footer />
    </div>
  );
}

export default React.memo(Dashboard);