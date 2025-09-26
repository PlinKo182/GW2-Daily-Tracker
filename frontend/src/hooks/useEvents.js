// hooks/useEvents.js
import { useState, useEffect, useMemo } from 'react';
import { convertUTCTimeToLocal } from '../utils/timeUtils';

export const useEvents = (eventsData, currentTime, eventFilters = {}) => {
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const loadAllEvents = () => {
      const events = [];
      const now = new Date();

      // Função para converter recompensas em array
      const convertRewardsToArray = (rewardsObj) => {
        const rewardsArray = [];

        if (rewardsObj) {
          // Item
          if (rewardsObj.item && (rewardsObj.item.name || rewardsObj.item.type)) {
            rewardsArray.push({
              type: 'item',
              name: rewardsObj.item.name || '',
              link: rewardsObj.item.link || '',
              itemId: rewardsObj.item.itemId || null,
              price: rewardsObj.item.price || ''
            });
          }

          // Currency
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

      // Processar dados em 3 níveis: Categoria -> Subcategoria -> Evento
      const processEventsData = (eventsData) => {
        Object.entries(eventsData).forEach(([category, subcategories]) => {
          // Filtro: ignorar categorias desativadas
          if (eventFilters[category] === false) {
            return;
          }

          Object.entries(subcategories).forEach(([subcategory, eventsGroup]) => {
            Object.entries(eventsGroup).forEach(([eventName, eventData]) => {
              const eventKey = `${category}_${subcategory}_${eventName}`
                .toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');

              if (eventData.utc_times && Array.isArray(eventData.utc_times)) {
                eventData.utc_times.forEach((utcTimeStr) => {
                  const eventTime = convertUTCTimeToLocal(utcTimeStr);

                  // Hoje e amanhã (eventos que cruzam a meia-noite)
                  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
                    const adjustedEventTime = new Date(eventTime);
                    adjustedEventTime.setDate(adjustedEventTime.getDate() + dayOffset);

                    const endTime = new Date(
                      adjustedEventTime.getTime() +
                        (eventData.duration_minutes || 15) * 60000
                    );

                    // Só adicionar se ainda não terminou
                    if (endTime > now) {
                      const rewards = convertRewardsToArray(eventData.rewards);

                      events.push({
                        id: `${eventKey}_${utcTimeStr}_${dayOffset}`,
                        eventKey,
                        name: eventName,
                        location: `${category} - ${subcategory}`,
                        waypoint: eventData.waypoint || '',
                        startTime: new Date(adjustedEventTime),
                        endTime,
                        duration: eventData.duration_minutes || 15,
                        rewards
                      });
                    }
                  }
                });
              }
            });
          });
        });
      };

      if (eventsData) {
        processEventsData(eventsData);
      }

      // Ordenar eventos por hora de início
      events.sort((a, b) => a.startTime - b.startTime);
      setAllEvents(events);
    };

    loadAllEvents();
  }, [eventsData, eventFilters]);

  // Filtrar eventos para mostrar só os próximos 2h ou em andamento
  const eventsDataFiltered = useMemo(() => {
    if (!currentTime) return [];

    const now = currentTime;
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    return allEvents.filter((event) => {
      const startsWithinTwoHours = event.startTime <= twoHoursFromNow;
      const isOngoing = event.startTime <= now && event.endTime > now;
      const notEnded = event.endTime > now;

      return (startsWithinTwoHours || isOngoing) && notEnded;
    });
  }, [allEvents, currentTime]);

  return { allEvents, eventsData: eventsDataFiltered };
};
