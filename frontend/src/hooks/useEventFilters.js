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
  filters.selectedCount = totalEvents; // Inicialmente todos selecionados

  return filters;
};

// Função para contar eventos selecionados
const countSelectedEvents = (filters) => {
  let selected = 0;
  let total = 0;

  Object.values(filters.expansions).forEach(expansion => {
    Object.values(expansion.zones).forEach(zone => {
      Object.values(zone.events).forEach(isSelected => {
        total++;
        if (isSelected) selected++;
      });
    });
  });

  return { selected, total };
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
      const savedFilters = localStorage.getItem('tyriaTracker_eventFilters');
      
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          
          // Mesclar com a estrutura atual para garantir que novos eventos sejam incluídos
          const currentStructure = buildCompleteFilterStructure(eventsData);
          const mergedFilters = mergeFilterStructures(currentStructure, parsedFilters);
          const counts = countSelectedEvents(mergedFilters);
          
          mergedFilters.selectedCount = counts.selected;
          mergedFilters.totalCount = counts.total;
          
          setEventFilters(mergedFilters);
          console.log('Loaded saved event filters:', mergedFilters);
        } catch (error) {
          console.error('Error parsing saved filters:', error);
          initializeDefaultFilters();
        }
      } else {
        initializeDefaultFilters();
      }
      setIsLoading(false);
    };

    const initializeDefaultFilters = () => {
      const defaultFilters = buildCompleteFilterStructure(eventsData);
      setEventFilters(defaultFilters);
      localStorage.setItem('tyriaTracker_eventFilters', JSON.stringify(defaultFilters));
      console.log('Initialized default event filters:', defaultFilters);
    };

    // Função para mesclar estruturas de filtro
    const mergeFilterStructures = (current, saved) => {
      const merged = JSON.parse(JSON.stringify(current)); // Deep clone
      
      Object.keys(merged.expansions).forEach(expansion => {
        if (saved.expansions && saved.expansions[expansion]) {
          // Mesclar configuração da expansão
          merged.expansions[expansion].enabled = saved.expansions[expansion].enabled;
          
          Object.keys(merged.expansions[expansion].zones).forEach(zone => {
            if (saved.expansions[expansion].zones && saved.expansions[expansion].zones[zone]) {
              // Mesclar configuração da zona
              merged.expansions[expansion].zones[zone].enabled = 
                saved.expansions[expansion].zones[zone].enabled;
              
              Object.keys(merged.expansions[expansion].zones[zone].events).forEach(event => {
                if (saved.expansions[expansion].zones[zone].events && 
                    saved.expansions[expansion].zones[zone].events[event] !== undefined) {
                  // Mesclar configuração do evento
                  merged.expansions[expansion].zones[zone].events[event] = 
                    saved.expansions[expansion].zones[zone].events[event];
                }
              });
            }
          });
        }
      });
      
      return merged;
    };

    initializeFilters();
  }, []);

  const updateEventFilters = (newFilters) => {
    const counts = countSelectedEvents(newFilters);
    newFilters.selectedCount = counts.selected;
    newFilters.totalCount = counts.total;
    
    setEventFilters(newFilters);
    localStorage.setItem('tyriaTracker_eventFilters', JSON.stringify(newFilters));
    console.log('Updated event filters:', newFilters);
  };

  return { eventFilters, updateEventFilters, isLoading };
};