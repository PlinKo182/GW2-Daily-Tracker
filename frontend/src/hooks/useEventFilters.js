// hooks/useEventFilters.js
import { useState, useEffect } from 'react';
import { eventsData } from '../utils/eventsData';

// Função para construir a estrutura completa de filtros
const buildCompleteFilterStructure = (eventsData) => {
  const filters = {
    expansions: {},
    selectedCount: 0,
    totalCount: 0
  };

  let totalEvents = 0;

  Object.entries(eventsData).forEach(([expansion, zones]) => {
    filters.expansions[expansion] = {
      enabled: true,
      zones: {},
      eventCount: 0
    };

    Object.entries(zones).forEach(([zone, events]) => {
      filters.expansions[expansion].zones[zone] = {
        enabled: true,
        events: {},
        eventCount: 0
      };

      Object.keys(events).forEach(eventName => {
        filters.expansions[expansion].zones[zone].events[eventName] = true;
        filters.expansions[expansion].zones[zone].eventCount++;
        filters.expansions[expansion].eventCount++;
        totalEvents++;
      });
    });
  });

  filters.totalCount = totalEvents;
  filters.selectedCount = totalEvents;

  console.log('Built filter structure with', totalEvents, 'total events');
  return filters;
};

export const useEventFilters = () => {
  const [eventFilters, setEventFilters] = useState({ 
    expansions: {}, 
    selectedCount: 0, 
    totalCount: 0 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeFilters = () => {
      console.log('Initializing event filters...');
      
      try {
        const savedFilters = localStorage.getItem('tyriaTracker_eventFilters');
        
        if (savedFilters) {
          console.log('Found saved filters in localStorage');
          const parsedFilters = JSON.parse(savedFilters);
          
          // Verificar se a estrutura salva é válida
          if (parsedFilters.expansions && Object.keys(parsedFilters.expansions).length > 0) {
            console.log('Using saved filters structure');
            setEventFilters(parsedFilters);
          } else {
            console.log('Saved filters structure is invalid, using default');
            initializeDefaultFilters();
          }
        } else {
          console.log('No saved filters found, using default');
          initializeDefaultFilters();
        }
      } catch (error) {
        console.error('Error initializing filters:', error);
        initializeDefaultFilters();
      }
      
      setIsLoading(false);
    };

    const initializeDefaultFilters = () => {
      const defaultFilters = buildCompleteFilterStructure(eventsData);
      setEventFilters(defaultFilters);
      localStorage.setItem('tyriaTracker_eventFilters', JSON.stringify(defaultFilters));
      console.log('Initialized default filters');
    };

    initializeFilters();
  }, []);

  const updateEventFilters = (newFilters) => {
    console.log('Updating filters:', newFilters);
    setEventFilters(newFilters);
    localStorage.setItem('tyriaTracker_eventFilters', JSON.stringify(newFilters));
  };

  return { eventFilters, updateEventFilters, isLoading };
};