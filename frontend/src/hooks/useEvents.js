// hooks/useEvents.js
import { useState, useEffect, useMemo } from 'react';
import { convertUTCTimeToLocal } from '../utils/timeUtils';

// Função para normalizar chaves (igual à usada nos filtros)
const normalizeKey = (key) => {
  if (!key) return '';
  return key.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

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
          if (rewardsObj.item && (rewardsObj.item.name || rewardsObj.item.type || rewardsObj.item.itemId)) {
            rewardsArray.push({
              type: 'item',
              name: rewardsObj.item.name || '',
              link: rewardsObj.item.link || '',
              itemId: rewardsObj.item.itemId || null,
              price: rewardsObj.item.price || ''
            });
          }
          
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

      // Função para verificar se um evento deve ser incluído com base nos filtros
      const shouldIncludeEvent = (expansion, zone, eventName) => {
        const normalizedExpansion = normalizeKey(expansion);
        const normalizedZone = normalizeKey(zone);
        const normalizedEvent = normalizeKey(eventName);

        console.log('Checking event:', { expansion, zone, eventName });
        console.log('Normalized keys:', { normalizedExpansion, normalizedZone, normalizedEvent });

        // Se não há filtros definidos, incluir tudo
        if (!eventFilters.expansions || Object.keys(eventFilters.expansions).length === 0) {
          console.log('No filters defined, including event');
          return true;
        }

        // Verificar se a expansão existe nos filtros
        if (!eventFilters.expansions[normalizedExpansion]) {
          console.log(`Expansion "${normalizedExpansion}" not found in filters, excluding event`);
          return false;
        }

        // Primeiro verificar se o evento específico está habilitado
        const eventConfig = eventFilters.expansions[normalizedExpansion]?.zones?.[normalizedZone]?.events?.[normalizedEvent];
        if (eventConfig && typeof eventConfig === 'object' && eventConfig.enabled === true) {
          console.log(`Event "${normalizedEvent}" is specifically enabled, including event`);
          return true;
        }

        // Se o evento não está especificamente habilitado, verificar se a zona está habilitada
        if (eventFilters.expansions[normalizedExpansion]?.zones?.[normalizedZone]?.enabled === true) {
          console.log(`Zone "${normalizedZone}" is enabled, including event`);
          return true;
        }

        // Se nem o evento nem a zona estão habilitados, verificar se a expansão está habilitada
        if (eventFilters.expansions[normalizedExpansion].enabled === true) {
          console.log(`Expansion "${normalizedExpansion}" is enabled, including event`);
          return true;
        }

        console.log(`Event "${normalizedEvent}" is not enabled at any level, excluding event`);
        return false;
      };

      // Processar estrutura de eventos
      const processEventsData = (eventsData) => {
        Object.entries(eventsData).forEach(([expansion, zones]) => {
          Object.entries(zones).forEach(([zone, eventsGroup]) => {
            Object.entries(eventsGroup).forEach(([eventName, eventData]) => {
              // Verificar filtros antes de processar o evento
              if (!shouldIncludeEvent(expansion, zone, eventName)) {
                return;
              }

              // Processar cada horário UTC do evento
              if (eventData.utc_times && Array.isArray(eventData.utc_times)) {
                eventData.utc_times.forEach(utcTimeStr => {
                  const eventTime = convertUTCTimeToLocal(utcTimeStr);
                  
                  // Considerar hoje e amanhã
                  for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
                    const adjustedEventTime = new Date(eventTime);
                    adjustedEventTime.setDate(adjustedEventTime.getDate() + dayOffset);
                    
                    const endTime = new Date(adjustedEventTime.getTime() + (eventData.duration_minutes || 15) * 60000);
                    
                    // Só adicionar se o evento ainda não terminou
                    if (endTime > now) {
                      const rewards = convertRewardsToArray(eventData.rewards);
                      
                      const eventId = `${expansion}_${zone}_${eventName}_${utcTimeStr}_${dayOffset}`
                        .toLowerCase()
                        .replace(/\s+/g, '_')
                        .replace(/[^a-z0-9_]/g, '');
                      
                      const eventKey = `${expansion}_${zone}_${eventName}`
                        .toLowerCase()
                        .replace(/\s+/g, '_')
                        .replace(/[^a-z0-9_]/g, '');
                      
                      events.push({
                        id: eventId,
                        eventKey: eventKey,
                        name: eventName,
                        location: `${expansion} - ${zone}`,
                        waypoint: eventData.waypoint || '',
                        startTime: new Date(adjustedEventTime),
                        endTime: endTime,
                        duration: eventData.duration_minutes || 15,
                        rewards: rewards,
                        category: expansion,
                        subcategory: zone
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
        console.log('Starting to process events data with filters:', eventFilters);
        processEventsData(eventsData);
      }

      // Ordenar eventos por hora de início
      events.sort((a, b) => a.startTime - b.startTime);
      console.log(`Loaded ${events.length} events with current filters`);
      setAllEvents(events);
    };

    loadAllEvents();
  }, [eventsData, eventFilters]);

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

    console.log(`Time filtering: ${filtered.length} events within next 2 hours out of ${allEvents.length} total events`);
    return filtered;
  }, [allEvents, currentTime]);

  return { allEvents, eventsData: eventsDataFiltered };
};