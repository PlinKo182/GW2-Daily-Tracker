// hooks/useEventFilters.js
import { useState, useEffect } from 'react';
import { eventsData } from '../utils/eventsData';

export const useEventFilters = () => {
  const [eventFilters, setEventFilters] = useState({});

  useEffect(() => {
    // Carregar filtros do localStorage
    const savedFilters = localStorage.getItem('tyriaTracker_eventFilters');
    
    if (savedFilters) {
      setEventFilters(JSON.parse(savedFilters));
    } else {
      // Inicializar com todas as categorias selecionadas
      const initialFilters = {};
      Object.keys(eventsData).forEach(category => {
        initialFilters[category] = true;
      });
      setEventFilters(initialFilters);
    }
  }, []);

  const updateEventFilters = (newFilters) => {
    setEventFilters(newFilters);
    localStorage.setItem('tyriaTracker_eventFilters', JSON.stringify(newFilters));
  };

  return { eventFilters, updateEventFilters };
};