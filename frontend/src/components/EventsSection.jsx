import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, MapPin, RefreshCw } from 'lucide-react';
import { mockData } from '../utils/mockData';

// Componente isolado para o timer com estado interno
const CountdownTimer = React.memo(({ startTime, endTime }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (targetTime) => {
    const difference = targetTime - currentTime;
    
    if (difference <= 0) {
      return { total: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    
    return { total: difference, hours, minutes, seconds };
  };

  const formatTimeRemaining = (timeObj) => {
    return `${timeObj.hours.toString().padStart(2, '0')}:${timeObj.minutes.toString().padStart(2, '0')}:${timeObj.seconds.toString().padStart(2, '0')}`;
  };

  const eventActive = startTime <= currentTime && endTime >= currentTime;
  const eventUpcoming = startTime > currentTime;

  let countdownText = '';
  if (eventActive) {
    const remaining = getTimeRemaining(endTime);
    countdownText = `Ends in: ${formatTimeRemaining(remaining)}`;
  } else if (eventUpcoming) {
    const remaining = getTimeRemaining(startTime);
    countdownText = `Starts in: ${formatTimeRemaining(remaining)}`;
  } else {
    countdownText = 'Event completed';
  }

  return (
    <div className={`font-mono mb-4 flex items-center gap-2 ${eventActive ? 'text-emerald-300 animate-pulse' : eventUpcoming ? 'text-amber-300' : 'text-gray-400'}`}>
      <Clock className="w-4 h-4" />
      {countdownText}
    </div>
  );
});

const EventsSection = ({ completedEvents, completedEventTypes, onEventToggle }) => {
  const [eventsData, setEventsData] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  // Carregar todos os eventos uma vez
  useEffect(() => {
    const loadAllEvents = () => {
      const events = [];
      const now = new Date();

      Object.entries(mockData.eventConfig.events).forEach(([key, event]) => {
        if (event.locations) {
          event.locations.forEach(location => {
            location.utc_times.forEach(utcTimeStr => {
              const eventTime = convertUTCTimeToLocal(utcTimeStr);
              const endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

              // Se o evento já passou, agenda para o próximo dia
              if (endTime < now) {
                eventTime.setDate(eventTime.getDate() + 1);
                endTime.setDate(endTime.getDate() + 1);
              }

              events.push({
                id: `${key}_${location.map}`,
                eventKey: key,
                name: event.event_name,
                location: location.map,
                waypoint: location.waypoint,
                startTime: eventTime,
                endTime: endTime,
                duration: event.duration_minutes
              });
            });
          });
        } else {
          event.utc_times.forEach(utcTimeStr => {
            const eventTime = convertUTCTimeToLocal(utcTimeStr);
            const endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

            // Se o evento já passou, agenda para o próximo dia
            if (endTime < now) {
              eventTime.setDate(eventTime.getDate() + 1);
              endTime.setDate(endTime.getDate() + 1);
            }

            events.push({
              id: key,
              eventKey: key,
              name: event.event_name,
              location: event.location,
              waypoint: event.waypoint,
              startTime: eventTime,
              endTime: endTime,
              duration: event.duration_minutes
            });
          });
        }
      });

      events.sort((a, b) => a.startTime - b.startTime);
      setAllEvents(events);
    };

    loadAllEvents();
  }, []);

  // Atualizar eventos visíveis a cada segundo
  useEffect(() => {
    const updateVisibleEvents = () => {
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const filteredEvents = allEvents.filter(event => {
        // Não mostrar eventos concluídos
        if (completedEventTypes[event.eventKey] || completedEvents[event.id]) {
          return false;
        }
        
        // Mostrar apenas eventos que começam nas próximas 2 horas
        return event.startTime <= twoHoursFromNow;
      });
      
      setEventsData(filteredEvents);
    };

    updateVisibleEvents();
    
    // Atualizar a cada segundo
    const interval = setInterval(updateVisibleEvents, 1000);
    return () => clearInterval(interval);
  }, [allEvents, completedEvents, completedEventTypes]);

  const convertUTCTimeToLocal = (utcTimeString) => {
    const now = new Date();
    const [hours, minutes] = utcTimeString.split(':').map(Number);
    
    const utcDate = new Date(Date.UTC(
      now.getUTCFullYear(), 
      now.getUTCMonth(), 
      now.getUTCDate(), 
      hours, 
      minutes
    ));
    
    return new Date(utcDate);
  };

  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text.trim()).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text.trim();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  }, []);

  // Componente de cartão de evento com memoização
  const EventCard = useMemo(() => React.memo(({ event }) => {
    const now = new Date();
    const eventActive = event.startTime <= now && event.endTime >= now;
    const eventUpcoming = event.startTime > now;

    let statusClass = '';
    let statusText = '';

    if (eventActive) {
      statusClass = 'bg-emerald-500/20 text-emerald-300';
      statusText = 'Active';
    } else if (eventUpcoming) {
      statusClass = 'bg-amber-500/20 text-amber-300';
      statusText = 'Upcoming';
    } else {
      statusClass = 'bg-gray-500/20 text-gray-300';
      statusText = 'Completed';
    }

    return (
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
        <input
          type="checkbox"
          checked={completedEvents[event.id] || completedEventTypes[event.eventKey]}
          onChange={() => onEventToggle(event.id, event.eventKey)}
          className="absolute top-3 right-3 rounded bg-gray-700 border-gray-600 text-emerald-400 focus:ring-emerald-400/50"
        />

        <div className="p-6 flex-grow pt-12">
          <h3 className="text-xl font-bold text-emerald-400 mb-2">{event.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
          
          <CountdownTimer 
            startTime={event.startTime} 
            endTime={event.endTime} 
          />
          
          <div className="text-xs text-gray-400 mb-2">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>
        </div>
        
        <div className="px-6 pb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => copyToClipboard(event.waypoint)}
              className="text-emerald-400 hover:underline text-sm font-mono hover:bg-gray-700 px-2 py-1 rounded transition-colors duration-150"
              title="Click to copy waypoint"
            >
              {event.waypoint}
            </button>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusClass}`}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
    );
  }), [completedEvents, completedEventTypes, copyToClipboard, formatTime, onEventToggle]);

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Events & World Bosses</h2>
      
      <div className="mb-6 flex justify-end">
        <div className="text-sm text-gray-400 italic">
          Showing events within the next 2 hours
        </div>
      </div>
      
      {eventsData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsData.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No events in the next 2 hours.</p>
          <p className="mt-2">Check back later for upcoming events.</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(EventsSection);