import { useState, useEffect, useMemo } from 'react';
import { convertUTCTimeToLocal } from '../utils/timeUtils';

export const useEvents = (mockData, currentTime) => {
  const [allEvents, setAllEvents] = useState([]);

  // Carregar todos os eventos apenas uma vez
  useEffect(() => {
    const loadAllEvents = () => {
      const events = [];
      const now = new Date();

      Object.entries(mockData.eventConfig.events).forEach(([key, event]) => {
        if (event.locations) {
          event.locations.forEach(location => {
            location.utc_times.forEach(utcTimeStr => {
              const eventTime = convertUTCTimeToLocal(utcTimeStr);
              
              // Criar eventos para hoje e amanhã para cobrir todos os cenários
              for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
                const adjustedEventTime = new Date(eventTime);
                adjustedEventTime.setDate(adjustedEventTime.getDate() + dayOffset);
                
                const endTime = new Date(adjustedEventTime.getTime() + event.duration_minutes * 60000);
                
                // Só adicionar se o evento não tiver terminado completamente
                if (endTime > now) {
                  events.push({
                    id: `${key}_${location.map}_${utcTimeStr}_${dayOffset}`,
                    eventKey: key,
                    name: event.event_name,
                    location: location.map,
                    waypoint: location.waypoint,
                    startTime: new Date(adjustedEventTime),
                    endTime: endTime,
                    duration: event.duration_minutes,
                    reward: location.reward || event.reward
                  });
                }
              }
            });
          });
        } else {
          event.utc_times.forEach(utcTimeStr => {
            const eventTime = convertUTCTimeToLocal(utcTimeStr);
            
            // Criar eventos para hoje e amanhã
            for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
              const adjustedEventTime = new Date(eventTime);
              adjustedEventTime.setDate(adjustedEventTime.getDate() + dayOffset);
              
              const endTime = new Date(adjustedEventTime.getTime() + event.duration_minutes * 60000);
              
              if (endTime > now) {
                events.push({
                  id: `${key}_${utcTimeStr}_${dayOffset}`,
                  eventKey: key,
                  name: event.event_name,
                  location: event.location,
                  waypoint: event.waypoint,
                  startTime: new Date(adjustedEventTime),
                  endTime: endTime,
                  duration: event.duration_minutes,
                  reward: event.reward
                });
              }
            }
          });
        }
      });

      // Ordenar por hora de início
      events.sort((a, b) => a.startTime - b.startTime);
      setAllEvents(events);
    };

    loadAllEvents();
  }, [mockData]);

  // Filtrar eventos visíveis - CORREÇÃO CRÍTICA AQUI
  const eventsData = useMemo(() => {
    const now = currentTime;
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return allEvents.filter(event => {
      // MOSTRAR eventos que:
      // 1. Começaram dentro das próximas 2 horas E não terminaram
      // 2. OU estão em andamento (ongoing) - mesmo que tenham começado há mais de 2 horas
      // 3. E não terminaram completamente
      
      const startsWithinTwoHours = event.startTime <= twoHoursFromNow;
      const isOngoing = event.startTime <= now && event.endTime > now;
      const notEnded = event.endTime > now;
      
      return (startsWithinTwoHours || isOngoing) && notEnded;
    });
  }, [allEvents, currentTime]);

  return { allEvents, eventsData };
};