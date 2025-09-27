// components/Dashboard.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import DailyProgress from './DailyProgress';
import DailyTasks from './DailyTasks';
import EventsSection from './EventsSection/EventsSection';
import Footer from './Footer';
import { localStorageAPI } from '../services/api';
import { useEventFilters } from '../hooks/useEventFilters';
import * as Tabs from '@radix-ui/react-tabs';

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

  const [completedEventTypes, setCompletedEventTypes] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [apiStatus, setApiStatus] = useState('checking');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('tyriaTracker_userName') || 'PlinKo';
  });

  const { eventFilters, updateEventFilters, isLoading } = useEventFilters();
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
      setCompletedEventTypes({});

      // Clear localStorage
      localStorageAPI.clearAll();
      
      // Update last reset date
      lastResetDateRef.current = currentUTCDate;
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
      // Test direct GW2 API connection
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

    if (savedEventsData && savedEventsData.completedEventTypes) {
      setCompletedEventTypes(savedEventsData.completedEventTypes);
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

  // Função para obter eventos relacionados que devem ser completados juntos
  const getRelatedEventKeys = useCallback((eventKey) => {
    // Ley-Line Anomaly events - todos devem ser completados juntos
    const leyLineEvents = [
      'coretyria_leylineanomaly_timberlinefalls',
      'coretyria_leylineanomaly_ironmarches', 
      'coretyria_leylineanomaly_gendarranfields'
    ];
    
    if (leyLineEvents.includes(eventKey)) {
      return leyLineEvents;
    }
    
    // Adicionar outros grupos de eventos relacionados aqui no futuro
    
    return [eventKey]; // Por padrão, retorna apenas o próprio evento
  }, []);

  const handleEventToggle = useCallback((eventId, eventKey) => {
    setCompletedEventTypes(prevTypes => {
      const isCurrentlyCompleted = prevTypes[eventKey];
      const relatedEventKeys = getRelatedEventKeys(eventKey);
      
      const newCompletedEventTypes = { ...prevTypes };

      if (isCurrentlyCompleted) {
        // REMOVER completude - eliminar todos os eventos relacionados
        relatedEventKeys.forEach(key => {
          delete newCompletedEventTypes[key];
        });
      } else {
        // MARCAR como completo - todos os eventos relacionados
        relatedEventKeys.forEach(key => {
          newCompletedEventTypes[key] = true;
        });
      }

      // Save to localStorage
      localStorageAPI.saveEvents({}, newCompletedEventTypes);
      
      return newCompletedEventTypes;
    });
  }, [getRelatedEventKeys]);

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
    fetch('https://gw-2-daily-tracker.vercel.app/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        date, 
        dailyProgress, 
        completedEventTypes, 
        userName,
        eventFilters
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
  }, [dailyProgress, completedEventTypes, userName, eventFilters]);

  const handleUserNameChange = useCallback((e) => {
    const newUserName = e.target.value;
    setUserName(newUserName);
    localStorage.setItem('tyriaTracker_userName', newUserName);
  }, []);

  // Mostrar loading enquanto os filtros estão sendo carregados
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

      {/* Notificação */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 min-w-[220px] shadow-lg px-4 py-2 rounded text-sm font-semibold ${
          notification.type === 'success' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
        }`}>
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
            <label htmlFor="userName" className="text-sm text-muted-foreground">Nome do usuário:</label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={handleUserNameChange}
              className="px-2 py-1 rounded bg-input text-foreground border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
              style={{ minWidth: 100 }}
              placeholder="Seu nome"
            />
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              onClick={saveProgressToMongo}
            >
              Save to MongoDB
            </button>
          </div>
        </div>

        <DailyProgress 
          overallProgress={calculateOverallProgress()}
        />

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
}

export default React.memo(Dashboard);