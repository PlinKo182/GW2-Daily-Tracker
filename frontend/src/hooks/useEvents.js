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
        // Se não há filtros definidos ou a estrutura está vazia, incluir tudo
        if (!eventFilters || !eventFilters.expansions || Object.keys(eventFilters.expansions).length === 0) {
          console.log('No filters defined, including all events');
          return true;
        }

        // Verificar se a expansão existe nos filtros
        if (!eventFilters.expansions[expansion]) {
          console.log(`Expansion "${expansion}" not found in filters, including event`);
          return true; // Se a expansão não está nos filtros, incluir por padrão
        }

        // Verificar se a expansão está desabilitada
        if (eventFilters.expansions[expansion].enabled === false) {
          console.log(`Expansion "${expansion}" is disabled, excluding event`);
          return false;
        }

        // Verificar se a zona existe nos filtros
        if (!eventFilters.expansions[expansion].zones || !eventFilters.expansions[expansion].zones[zone]) {
          console.log(`Zone "${zone}" not found in filters for expansion "${expansion}", including event`);
          return true; // Se a zona não está nos filtros, incluir por padrão
        }

        // Verificar se a zona está desabilitada
        if (eventFilters.expansions[expansion].zones[zone].enabled === false) {
          console.log(`Zone "${zone}" is disabled, excluding event`);
          return false;
        }

        // Verificar se o evento específico está desabilitado
        if (eventFilters.expansions[expansion].zones[zone].events && 
            eventFilters.expansions[expansion].zones[zone].events[eventName] === false) {
          console.log(`Event "${eventName}" is disabled, excluding event`);
          return false;
        }

        console.log(`Event "${eventName}" in zone "${zone}" of expansion "${expansion}" is enabled`);
        return true;
      };

      // Processar estrutura de eventos
      const processEventsData = (eventsData) => {
        Object.entries(eventsData).forEach(([expansion, zones]) => {
          Object.entries(zones).forEach(([zone, eventsGroup]) => {
            Object.entries(eventsGroup).forEach(([eventName, eventData]) => {
              console.log('Processing event:', expansion, '->', zone, '->', eventName);
              
              // Verificar filtros antes de processar o evento
              if (!shouldIncludeEvent(expansion, zone, eventName)) {
                console.log('Event excluded by filters:', eventName);
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
    if (!currentTime) {
      console.log('No current time provided');
      return [];
    }
    
    const now = currentTime;
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    const filtered = allEvents.filter(event => {
      const startsWithinTwoHours = event.startTime <= twoHoursFromNow;
      const isOngoing = event.startTime <= now && event.endTime > now;
      const notEnded = event.endTime > now;
      
      const shouldInclude = (startsWithinTwoHours || isOngoing) && notEnded;
      
      if (!shouldInclude) {
        console.log('Event filtered by time:', event.name, {
          startTime: event.startTime,
          endTime: event.endTime,
          now: now,
          startsWithinTwoHours,
          isOngoing,
          notEnded
        });
      }
      
      return shouldInclude;
    });

    console.log(`Time filtering: ${filtered.length} events within next 2 hours out of ${allEvents.length} total events`);
    return filtered;
  }, [allEvents, currentTime]);

  return { allEvents, eventsData: eventsDataFiltered };
};