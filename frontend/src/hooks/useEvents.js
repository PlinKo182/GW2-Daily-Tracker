// hooks/useEvents.js
import { useState, useEffect, useMemo } from 'react';
import { convertUTCTimeToLocal } from '../utils/timeUtils';

export const useEvents = (mockData, currentTime) => {
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    const loadAllEvents = () => {
      const events = [];
      const now = currentTime || new Date();

      Object.entries(mockData.eventConfig.events).forEach(([key, event]) => {
        if (event.locations) {
          event.locations.forEach(location => {
            location.utc_times.forEach(utcTimeStr => {
              let eventTime = convertUTCTimeToLocal(utcTimeStr);
              let endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

              // Avançar para o próximo dia se o evento já terminou
              while (endTime < now) {
                eventTime.setDate(eventTime.getDate() + 1);
                endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);
              }

              events.push({
                id: `${key}_${location.map}_${eventTime.getTime()}`,
                eventKey: key,
                name: event.event_name,
                location: location.map,
                waypoint: location.waypoint,
                startTime: new Date(eventTime),
                endTime: new Date(endTime),
                duration: event.duration_minutes,
                reward: location.reward || event.reward
              });
            });
          });
        } else {
          event.utc_times.forEach(utcTimeStr => {
            let eventTime = convertUTCTimeToLocal(utcTimeStr);
            let endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

            // Avançar para o próximo dia se o evento já terminou
            while (endTime < now) {
              eventTime.setDate(eventTime.getDate() + 1);
              endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);
            }

            events.push({
              id: `${key}_${eventTime.getTime()}`,
              eventKey: key,
              name: event.event_name,
              location: event.location,
              waypoint: event.waypoint,
              startTime: new Date(eventTime),
              endTime: new Date(endTime),
              duration: event.duration_minutes,
              reward: event.reward
            });
          });
        }
      });

      events.sort((a, b) => a.startTime - b.startTime);
      setAllEvents(events);
    };

    loadAllEvents();
  }, [mockData, currentTime]);

  const eventsData = useMemo(() => {
    const now = currentTime || new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return allEvents.filter(event => {
      // Filtrar eventos que já terminaram
      if (event.endTime <= now) {
        return false;
      }
      
      // Mostrar apenas eventos que começam dentro das próximas 2 horas
      return event.startTime <= twoHoursFromNow;
    });
  }, [allEvents, currentTime]);

  return { allEvents, eventsData };
};