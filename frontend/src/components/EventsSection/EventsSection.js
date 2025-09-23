import React, { useState, useMemo, useCallback } from 'react';
import { Eye, EyeOff, Undo } from 'lucide-react';
import { mockData } from '../../utils/mockData';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import { useEvents } from '../../hooks/useEvents';
import { useItemPrices } from '../../hooks/useItemPrices';
import EventCard from './EventCard';
import CompletedEventTypeCard from './CompletedEventTypeCard';

const EventsSection = ({ completedEvents, completedEventTypes, onEventToggle }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  const currentTime = useCurrentTime();
  const { allEvents, eventsData } = useEvents(mockData, currentTime);
  const itemPrices = useItemPrices(allEvents);

  // Filtrar eventos não concluídos manualmente
  const filteredEvents = useMemo(() => {
    return eventsData.filter(event => {
      const isManuallyCompleted = completedEventTypes[event.eventKey] || completedEvents[event.id];
      return !isManuallyCompleted;
    });
  }, [eventsData, completedEvents, completedEventTypes]);

  // Obter eventos concluídos manualmente
  const completedEventsByType = useMemo(() => {
    const eventsByType = {};
    
    allEvents.forEach(event => {
      const isManuallyCompleted = completedEventTypes[event.eventKey] || completedEvents[event.id];
      
      if (isManuallyCompleted) {
        if (!eventsByType[event.eventKey]) {
          eventsByType[event.eventKey] = {
            eventKey: event.eventKey,
            name: event.name,
            instances: []
          };
        }
        
        eventsByType[event.eventKey].instances.push(event);
      }
    });
    
    return Object.values(eventsByType);
  }, [allEvents, completedEvents, completedEventTypes]);

  const handleEventToggle = useCallback((eventId, eventKey) => {
    onEventToggle(eventId, eventKey);
  }, [onEventToggle]);

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Events & World Bosses</h2>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-400 italic">
          Showing events within the next 2 hours
        </div>
        
        {completedEventsByType.length > 0 && (
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {showCompleted ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Completed
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Completed ({completedEventsByType.length})
              </>
            )}
          </button>
        )}
      </div>
      
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              isCompleted={false}
              onToggle={handleEventToggle}
              itemPrices={itemPrices}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No events in the next 2 hours.</p>
          <p className="mt-2">Check back later for upcoming events.</p>
        </div>
      )}
      
      {showCompleted && completedEventsByType.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-2xl font-bold text-emerald-400">Manually Completed Events</h3>
            <button
              onClick={() => setShowCompleted(false)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300"
            >
              <Undo className="w-4 h-4" />
              Hide
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedEventsByType.map(eventType => (
              <CompletedEventTypeCard 
                key={eventType.eventKey} 
                eventType={eventType}
                onToggle={handleEventToggle}
                itemPrices={itemPrices}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EventsSection);