// hooks/useEventFilters.js
import { useState, useEffect } from 'react';
import { eventsData } from '../utils/eventsData';

export const useEventFilters = () => {
  const [eventFilters, setEventFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeFilters = () => {
      // Carregar filtros do localStorage
      const savedFilters = localStorage.getItem('tyriaTracker_eventFilters');
      
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          // Garantir que todas as categorias atuais estejam no objeto de filtros
          const updatedFilters = { ...parsedFilters };
          let hasChanges = false;
          
          Object.keys(eventsData).forEach(category => {
            if (!(category in updatedFilters)) {
              updatedFilters[category] = true; // Nova categoria, ativar por padrão
              hasChanges = true;
            }
          });
          
          if (hasChanges) {
            localStorage.setItem('tyriaTracker_eventFilters', JSON.stringify(updatedFilters));
            setEventFilters(updatedFilters);
            console.log('Updated event filters with new categories:', updatedFilters);
          } else {
            setEventFilters(parsedFilters);
            console.log('Loaded saved event filters:', parsedFilters);
          }
        } catch (error) {
          console.error('Error parsing saved filters:', error);
          initializeDefaultFilters();
        }
      } else {
        // Inicializar com todas as categorias selecionadas
        initializeDefaultFilters();
      }
      setIsLoading(false);
    };

    const initializeDefaultFilters = () => {
      const initialFilters = {};
      Object.keys(eventsData).forEach(category => {
        initialFilters[category] = true;
      });
      setEventFilters(initialFilters);
      localStorage.setItem('tyriaTracker_eventFilters', JSON.stringify(initialFilters));
      console.log('Initialized default event filters:', initialFilters);
    };

    initializeFilters();
  }, []);

  const updateEventFilters = (newFilters) => {
    setEventFilters(newFilters);
    localStorage.setItem('tyriaTracker_eventFilters', JSON.stringify(newFilters));
    console.log('Updated event filters:', newFilters);
  };

  return { eventFilters, updateEventFilters, isLoading };
};