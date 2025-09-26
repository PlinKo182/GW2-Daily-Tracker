// hooks/useEvents.js
import { useState, useEffect, useMemo } from 'react';
import { convertUTCTimeToLocal } from '../utils/timeUtils';

export const useEvents = (eventsData, currentTime, eventFilters = {}) => {
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const loadAllEvents = () => {
      const events = [];
      const now = new Date();

      // Função para converter recompensas de objeto para array
      const convertRewardsToArray = (rewardsObj) => {
        const rewardsArray = [];
        
        if (rewardsObj) {
          // Adicionar item se existir
          if (rewardsObj.item && (rewardsObj.item.name || rewardsObj.item.type)) {
            rewardsArray.push({
              type: 'item',
              name: rewardsObj.item.name || '',
              link: rewardsObj.item.link || '',
              itemId: rewardsObj.item.itemId || null,
              price: rewardsObj.item.price || ''
            });
          }
          
          // Adicionar currency se existir
          if (rewardsObj.currency && rewardsObj.currency.amount) {
            rewardsArray.push({
              type: 'currency',
              amount: rewardsObj.currency.amount,
              currency: rewardsObj.currency.type || 'gold'
            });
          }
        }
        
        return rewardsArray;
      };

      // Processar estrutura de 3 níveis: Categoria -> Subcategoria -> Evento
      const processEventsData = (eventsData) => {
        Object.entries(eventsData).forEach(([category, subcategories]) => {
          // Verificar se a categoria está ativa nos filtros (se não estiver definida, assume true)
          if (eventFilters[category] === false) {
            console.log(`Skipping category due to filter: ${category}`);
            return; // Pular categoria se não estiver selecionada
          }

          Object.entries(subcategories).forEach(([subcategory, eventsGroup]) => {
            Object.entries(eventsGroup).forEach(([eventName, eventData]) => {
              // Criar eventKey único
              const eventKey = `${category}_${subcategory}_${eventName}`
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
              
              // Processar cada horário UTC do evento
              if (eventData.utc_times && Array.isArray(eventData.utc_times)) {
                eventData.utc_times.forEach(utcTimeStr => {
                  const eventTime = convertUTCTimeToLocal(utcTimeStr);
                  
                  // Considerar hoje e amanhã (para eventos que cruzam a meia-noite)
                  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
                    const adjustedEventTime = new Date(eventTime);
                    adjustedEventTime.setDate(adjustedEventTime.getDate() + dayOffset);
                    
                    const endTime = new Date(adjustedEventTime.getTime() + (eventData.duration_minutes || 15) * 60000);
                    
                    // Só adicionar se o evento ainda não terminou
                    if (endTime > now) {
                      const rewards = convertRewardsToArray(eventData.rewards);
                      
                      events.push({
                        id: `${eventKey}_${utcTimeStr}_${dayOffset}`,
                        eventKey: eventKey,
                        name: eventName,
                        location: `${category} - ${subcategory}`,
                        waypoint: eventData.waypoint || '',
                        startTime: new Date(adjustedEventTime),
                        endTime: endTime,
                        duration: eventData.duration_minutes || 15,
                        rewards: rewards
                      });
                    }
                  }
                });
              }
            });
          });
        });
      };

      // Processar os eventos do eventsData
      if (eventsData) {
        processEventsData(eventsData);
      }

      // Ordenar eventos por hora de início
      events.sort((a, b) => a.startTime - b.startTime);
      console.log(`Loaded ${events.length} events with current filters`);
      setAllEvents(events);
    };

    loadAllEvents();
  }, [eventsData, eventFilters]); // Adicionar eventFilters como dependência

  const eventsDataFiltered = useMemo(() => {
    if (!currentTime) return [];
    
    const now = currentTime;
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const filtered = allEvents.filter(event => {
      const startsWithinTwoHours = event.startTime <= twoHoursFromNow;
      const isOngoing = event.startTime <= now && event.endTime > now;
      const notEnded = event.endTime > now;
      
      return (startsWithinTwoHours || isOngoing) && notEnded;
    });

    console.log(`Filtered to ${filtered.length} events within next 2 hours`);
    return filtered;
  }, [allEvents, currentTime]);

  return { allEvents, eventsData: eventsDataFiltered };
};