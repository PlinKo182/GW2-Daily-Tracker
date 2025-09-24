import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import DailyProgress from './DailyProgress';
import DailyTasks from './DailyTasks';
import EventsSection from './EventsSection/EventsSection';
import Footer from './Footer';
import { mockData } from '../utils/mockData';
import api, { localStorageAPI } from '../services/api';

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('tyriaTracker_userName') || 'PlinKo';
  });

  const lastResetDateRef = useRef(getCurrentUTCDate());

  // Função auxiliar para obter data UTC atual
  function getCurrentUTCDate() {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }

  // Função para verificar e executar reset diário
  const checkAndResetDailyProgress = useCallback(() => {
    const currentUTCDate = getCurrentUTCDate();
    
    if (currentUTCDate !== lastResetDateRef.current) {
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
      
      // Update last reset date
      lastResetDateRef.current = currentUTCDate;
      
      console.log('Daily progress reset executed');
    }
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadInitialData();

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

    // Setup time updater
    const timeInterval = setInterval(() => {
      const newTime = new Date();
      setCurrentTime(newTime);
      checkAndResetDailyProgress(); // Check for reset on each time update
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timeInterval);
    };
  }, [checkAndResetDailyProgress]);

  const checkApiStatus = async () => {
    if (!isOnline) {
      setApiStatus('offline');
      return;
    }

    try {
      // Test direct GW2 API connection instead of your api.healthCheck()
      const response = await fetch('https://api.guildwars2.com/v2/build', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data && data.id ? 'online' : 'unavailable');
      } else {
        setApiStatus('unavailable');
      }
    } catch (error) {
      console.error('API check failed:', error);
      setApiStatus('unavailable');
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
      setCompletedEvents(savedEventsData.completedEvents || {});
      setCompletedEventTypes(savedEventsData.completedEventTypes || {});
    }
  };

  const handleTaskToggle = useCallback((category, task) => {
    setDailyProgress(prev => {
      const newProgress = {
        ...prev,
        [category]: {
          ...prev[category],
          [task]: !prev[category][task]
        }
      };

      // Update localStorage
      localStorageAPI.saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  const handleEventToggle = useCallback((eventId, eventKey) => {
  console.log('Toggling event:', { eventId, eventKey });
  
  setCompletedEvents(prevEvents => {
    const currentEventTypes = completedEventTypes;
    
    // Verificar se é um evento LLA
    const isLLA = eventKey === "lla";
    
    // Para eventos LLA, verificar completedEventTypes; para outros, verificar completedEvents
    const isEventCompleted = prevEvents[eventId] || false;
    const isEventTypeCompleted = currentEventTypes[eventKey] || false;
    
    // Lógica definitiva: para LLA usar tipo, para outros usar evento individual
    const isCurrentlyCompleted = isLLA ? isEventTypeCompleted : isEventCompleted;
    
    console.log('Current completion status:', {
      eventId,
      eventKey,
      isLLA,
      isEventCompleted,
      isEventTypeCompleted,
      isCurrentlyCompleted
    });

    let newCompletedEvents = { ...prevEvents };
    let newCompletedEventTypes = { ...currentEventTypes };

    if (isCurrentlyCompleted) {
      // REMOVER completude
      if (isLLA) {
        // Para LLA: remover o tipo de evento
        delete newCompletedEventTypes[eventKey];
        // Também remover todos os eventos LLA individuais
        Object.keys(newCompletedEvents).forEach(id => {
          if (id.includes("lla")) {
            delete newCompletedEvents[id];
          }
        });
        console.log('Removing LLA event type completion:', eventKey);
      } else {
        // Para eventos normais: remover apenas este evento específico
        delete newCompletedEvents[eventId];
        console.log('Removing individual event completion:', eventId);
      }
    } else {
      // MARCAR como completo
      if (isLLA) {
        // Para LLA: marcar o tipo de evento como completo
        newCompletedEventTypes[eventKey] = true;
        console.log('Marking LLA event type as completed:', eventKey);
      } else {
        // Para outros eventos: marcar individualmente
        newCompletedEvents[eventId] = true;
        console.log('Marking individual event as completed:', eventId);
      }
    }

    console.log('New states:', {
      newCompletedEvents: Object.keys(newCompletedEvents).length,
      newCompletedEventTypes: Object.keys(newCompletedEventTypes).length
    });

    // Update both states separately
    setCompletedEventTypes(newCompletedEventTypes);
    
    // Save to localStorage
    localStorageAPI.saveEvents(newCompletedEvents, newCompletedEventTypes);
    
    return newCompletedEvents;
  });
}, [completedEventTypes]);

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
    if (!tasks) return { completed: 0, total: 0, percentage: 0 };
    
    const totalTasks = Object.keys(tasks).length;
    const completedTasks = Object.values(tasks).filter(Boolean).length;
    
    return {
      completed: completedTasks,
      total: totalTasks,
      percentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  }, [dailyProgress]);

  // Função para salvar progresso no MongoDB
  const saveProgressToMongo = useCallback(() => {
    const date = new Date().toISOString().slice(0, 10);
    fetch('https://gw-2-daily-tracker-emergent.vercel.app/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        date, 
        dailyProgress, 
        completedEvents, 
        completedEventTypes, 
        userName 
      })
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
  }, [dailyProgress, completedEvents, completedEventTypes, userName]);

  const handleUserNameChange = useCallback((e) => {
    const newUserName = e.target.value;
    setUserName(newUserName);
    localStorage.setItem('tyriaTracker_userName', newUserName);
  }, []);

  // Debug effect
  useEffect(() => {
    console.log('=== DASHBOARD STATE UPDATE ===');
    console.log('completedEvents:', completedEvents);
    console.log('completedEventTypes:', completedEventTypes);
    console.log('completedEvents count:', Object.keys(completedEvents).length);
    console.log('completedEventTypes count:', Object.keys(completedEventTypes).length);
  }, [completedEvents, completedEventTypes]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header currentTime={currentTime} apiStatus={apiStatus} isOnline={isOnline} />

      {/* Notificação */}
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
              className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              style={{ minWidth: 100 }}
              placeholder="Seu nome"
            />
            <button
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              onClick={saveProgressToMongo}
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
          currentTime={currentTime}
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
}

export default React.memo(Dashboard);