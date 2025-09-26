// hooks/useEventFilters.js
import { useState, useEffect } from 'react';
import { eventsData } from '../utils/eventsData';

export const useEventFilters = () => {
  const [eventFilters, setEventFilters] = useState({});

  useEffect(() => {
    // Carregar filtros do localStorage
    const savedFilters = localStorage.getItem('tyriaTracker_eventFilters');
    
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        setEventFilters(parsedFilters);
        console.log('Loaded saved event filters:', parsedFilters);
      } catch (error) {
        console.error('Error parsing saved filters:', error);
        // Se houver erro, inicializar com todas as categorias selecionadas
        initializeDefaultFilters();
      }
    } else {
      // Inicializar com todas as categorias selecionadas
      initializeDefaultFilters();
    }
  }, []);

  const initializeDefaultFilters = () => {
    const initialFilters = {};
    Object.keys(eventsData).forEach(category => {
      initialFilters[category] = true;
    });
    setEventFilters(initialFilters);
    console.log('Initialized default event filters:', initialFilters);
  };

  const updateEventFilters = (newFilters) => {
    setEventFilters(newFilters);
    localStorage.setItem('tyriaTracker_eventFilters', JSON.stringify(newFilters));
    console.log('Updated event filters:', newFilters);
  };

  return { eventFilters, updateEventFilters };
};