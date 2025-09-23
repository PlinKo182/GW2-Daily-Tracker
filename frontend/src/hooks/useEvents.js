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
              
              // Ajustar para o próximo dia se o evento já passou hoje
              if (eventTime < now) {
                eventTime.setDate(eventTime.getDate() + 1);
              }
              
              const endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

              events.push({
                id: `${key}_${location.map}_${utcTimeStr}`,
                eventKey: key,
                name: event.event_name,
                location: location.map,
                waypoint: location.waypoint,
                startTime: new Date(eventTime),
                endTime: endTime,
                duration: event.duration_minutes,
                reward: location.reward || event.reward
              });
            });
          });
        } else {
          event.utc_times.forEach(utcTimeStr => {
            const eventTime = convertUTCTimeToLocal(utcTimeStr);
            
            // Ajustar para o próximo dia se o evento já passou hoje
            if (eventTime < now) {
              eventTime.setDate(eventTime.getDate() + 1);
            }
            
            const endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

            events.push({
              id: `${key}_${utcTimeStr}`,
              eventKey: key,
              name: event.event_name,
              location: event.location,
              waypoint: event.waypoint,
              startTime: new Date(eventTime),
              endTime: endTime,
              duration: event.duration_minutes,
              reward: event.reward
            });
          });
        }
      });

      // Ordenar por hora de início
      events.sort((a, b) => a.startTime - b.startTime);
      setAllEvents(events);
    };

    loadAllEvents();
  }, [mockData]); // Remover currentTime das dependências

  // Filtrar eventos visíveis baseado no currentTime
  const eventsData = useMemo(() => {
    const now = currentTime;
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return allEvents.filter(event => {
      // Mostrar eventos que começam dentro das próximas 2 horas E não terminaram
      return event.startTime <= twoHoursFromNow && event.endTime > now;
    });
  }, [allEvents, currentTime]);

  return { allEvents, eventsData };
};