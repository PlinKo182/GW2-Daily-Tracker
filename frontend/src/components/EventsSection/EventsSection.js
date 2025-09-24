import React, { useState, useMemo, useCallback } from 'react';
import { Eye, EyeOff, Undo } from 'lucide-react';
import { mockData } from '../../utils/mockData';
import { useEvents } from '../../hooks/useEvents';
import { useItemPrices } from '../../hooks/useItemPrices';
import EventCard from './EventCard';
import CompletedEventTypeCard from './CompletedEventTypeCard';

const EventsSection = ({ completedEvents, completedEventTypes, onEventToggle, currentTime }) => {
  const [showCompleted, setShowCompleted] = useState(false);
  
  const safeCurrentTime = currentTime || new Date();
  
  const { allEvents, eventsData } = useEvents(mockData, safeCurrentTime);
  const itemPrices = useItemPrices(allEvents);

  // DEBUG: Verificar o que está nos estados
  console.log('=== EVENTS SECTION DEBUG ===');
  console.log('completedEvents:', completedEvents);
  console.log('completedEventTypes:', completedEventTypes);
  console.log('allEvents count:', allEvents?.length);
  console.log('eventsData count:', eventsData?.length);

  // Filtrar eventos não concluídos para mostrar na seção principal - VERSÃO CORRIGIDA
const filteredEvents = useMemo(() => {
  if (!eventsData || !Array.isArray(eventsData)) return [];
  
  return eventsData.filter(event => {
    if (!event || !event.id || !event.eventKey) return true;
    
    // Lógica corrigida: para LLA usar completedEventTypes, para outros usar completedEvents
    const isCompleted = event.eventKey === "lla" 
      ? completedEventTypes[event.eventKey] 
      : completedEvents[event.id];
    
    console.log(`Event ${event.id} (${event.eventKey}) - completed:`, isCompleted);
    return !isCompleted;
  });
}, [eventsData, completedEvents, completedEventTypes]);

// Obter eventos concluídos - VERSÃO CORRIGIDA
const completedEventsByType = useMemo(() => {
  if (!allEvents || !Array.isArray(allEvents)) return [];
  
  const eventsByType = {};
  
  allEvents.forEach(event => {
    if (!event || !event.eventKey || !event.id) return;
    
    // Lógica corrigida: para LLA usar completedEventTypes, para outros usar completedEvents
    const isCompleted = event.eventKey === "lla" 
      ? completedEventTypes[event.eventKey] 
      : completedEvents[event.id];
    
    if (isCompleted) {
      if (!eventsByType[event.eventKey]) {
        eventsByType[event.eventKey] = {
          eventKey: event.eventKey,
          name: event.name || 'Unknown Event',
          instances: []
        };
      }
      
      // Só adicionar se não existir ainda
      const existingInstance = eventsByType[event.eventKey].instances.find(
        inst => inst.id === event.id
      );
      if (!existingInstance) {
        eventsByType[event.eventKey].instances.push(event);
      }
    }
  });
  
  console.log('completedEventsByType found:', Object.values(eventsByType).length, 'types');
  console.log('eventsByType details:', eventsByType);
  
  return Object.values(eventsByType);
}, [allEvents, completedEvents, completedEventTypes]);

  const handleEventToggle = useCallback((eventId, eventKey) => {
    console.log('Toggling event:', eventId, eventKey);
    onEventToggle(eventId, eventKey);
  }, [onEventToggle]);

  if (!eventsData || !allEvents) {
    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Events & World Bosses</h2>
        <div className="text-center py-8 text-gray-400">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">Events & World Bosses</h2>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-400 italic">
          Showing events within the next 2 hours
        </div>
        
        {/* BOTÃO SEMPRE VISÍVEL SE HOUVER EVENTOS COMPLETOS */}
        {completedEventsByType.length > 0 ? (
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
        ) : (
          <div className="text-sm text-gray-500">
            No completed events
          </div>
        )}
      </div>
      
      {/* SEÇÃO DE EVENTOS ATIVOS/UPCOMING */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard 
              key={`${event.id}_${event.startTime?.getTime()}`} 
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
          {eventsData.length > 0 && (
            <p className="text-sm mt-4 text-amber-400">
              All upcoming events have been marked as completed.
            </p>
          )}
        </div>
      )}
      
      {/* SEÇÃO DE EVENTOS COMPLETOS (APENAS QUANDO VISÍVEL) */}
      {showCompleted && completedEventsByType.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-2xl font-bold text-emerald-400">Completed Events</h3>
            <button
              onClick={() => setShowCompleted(false)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
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