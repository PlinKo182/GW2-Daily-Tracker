import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, MapPin, Eye, EyeOff, Undo } from 'lucide-react';
import { mockData } from '../utils/mockData';

// CountdownTimer com estado interno - isolado das re-renderizações do pai
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
  const [showCompleted, setShowCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [itemPrices, setItemPrices] = useState({});

  // Atualizar o tempo atual a cada segundo apenas para lógica de filtragem
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

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
              let endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

              if (endTime < now) {
                eventTime.setDate(eventTime.getDate() + 1);
                endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);
              }

              events.push({
                id: `${key}_${location.map}`,
                eventKey: key,
                name: event.event_name,
                location: location.map,
                waypoint: location.waypoint,
                startTime: eventTime,
                endTime: endTime,
                duration: event.duration_minutes,
                reward: location.reward || event.reward
              });
            });
          });
        } else {
          event.utc_times.forEach(utcTimeStr => {
            const eventTime = convertUTCTimeToLocal(utcTimeStr);
            let endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);

            if (endTime < now) {
              eventTime.setDate(eventTime.getDate() + 1);
              endTime = new Date(eventTime.getTime() + event.duration_minutes * 60000);
            }

            events.push({
              id: key,
              eventKey: key,
              name: event.event_name,
              location: event.location,
              waypoint: event.waypoint,
              startTime: eventTime,
              endTime: endTime,
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
  }, []);

  // Buscar preços dos itens via API
  useEffect(() => {
    const fetchItemPrices = async () => {
      const itemIds = [];
      
      allEvents.forEach(event => {
        if (event.reward && event.reward.itemId) {
          itemIds.push(event.reward.itemId);
        }
      });
      
      const uniqueItemIds = [...new Set(itemIds)];
      
      if (uniqueItemIds.length === 0) return;
      
      try {
        const response = await fetch(`https://api.guildwars2.com/v2/commerce/prices?ids=${uniqueItemIds.join(',')}`);
        const data = await response.json();
        
        const prices = {};
        data.forEach(item => {
          const copper = item.sells?.unit_price || item.buys?.unit_price || 0;
          prices[item.id] = copper;
        });
        
        setItemPrices(prices);
      } catch (error) {
        console.error('Falha ao buscar preços de itens:', error);
      }
    };

    fetchItemPrices();
  }, [allEvents]);

  // Função para formatar preço com imagens de moedas
  const formatPriceWithImages = useCallback((copper) => {
    if (!copper) return null;
    
    const gold = Math.floor(copper / 10000);
    const silver = Math.floor((copper % 10000) / 100);
    const copperRemaining = copper % 100;
    
    return (
      <div className="flex items-center gap-1 text-yellow-400">
        {gold > 0 && (
          <>
            <span>{gold}</span>
            <img 
              src="https://wiki.guildwars2.com/images/d/d1/Gold_coin.png" 
              alt="Gold coin" 
              className="w-4 h-4 object-contain" 
            />
          </>
        )}
        {silver > 0 && (
          <>
            <span>{silver}</span>
            <img 
              src="https://wiki.guildwars2.com/images/3/3c/Silver_coin.png" 
              alt="Silver coin" 
              className="w-4 h-4 object-contain" 
            />
          </>
        )}
        {copperRemaining > 0 && (
          <>
            <span>{copperRemaining}</span>
            <img 
              src="https://wiki.guildwars2.com/images/e/eb/Copper_coin.png" 
              alt="Copper coin" 
              className="w-4 h-4 object-contain" 
            />
          </>
        )}
      </div>
    );
  }, []);

  // Atualizar eventos visíveis
  useEffect(() => {
    const updateVisibleEvents = () => {
      const now = currentTime;
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const filteredEvents = allEvents.filter(event => {
        const isManuallyCompleted = completedEventTypes[event.eventKey] || completedEvents[event.id];
        if (isManuallyCompleted) {
          return false;
        }
        
        if (event.endTime <= now) {
          return false;
        }
        
        return event.startTime <= twoHoursFromNow;
      });
      
      setEventsData(filteredEvents);
    };

    updateVisibleEvents();
  }, [allEvents, completedEvents, completedEventTypes, currentTime]);

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

  const handleEventToggle = useCallback((eventId, eventKey) => {
    onEventToggle(eventId, eventKey);
  }, [onEventToggle]);

  // Componente de cartão de evento - AGORA SEM DEPENDÊNCIA DE currentTime
  const EventCard = useMemo(() => React.memo(({ event, isCompleted = false, onToggle }) => {
    // Usamos new Date() estático para o status (não precisa ser em tempo real)
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
      <div className={`bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${isCompleted ? 'opacity-70' : ''}`}>
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(event.id, event.eventKey)}
          className="absolute top-3 right-3 rounded bg-gray-700 border-gray-600 text-emerald-400 focus:ring-emerald-400/50"
        />

        <div className="p-6 flex-grow pt-12">
          <h3 className="text-xl font-bold text-emerald-400 mb-2">{event.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            {event.location}
          </div>
          
          {!isCompleted && (
            <CountdownTimer 
              startTime={event.startTime} 
              endTime={event.endTime}
              // Não passamos currentTime - o timer gerencia seu próprio estado
            />
          )}
          
          <div className="text-xs text-gray-400 mb-2">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>

          {event.reward && (
            <div className="flex items-center gap-1 text-sm mt-1">
              {event.reward.type === 'item' && event.reward.itemId ? (
                <a 
                  href={event.reward.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {event.reward.name} 
                  {itemPrices[event.reward.itemId] !== undefined ? (
                    formatPriceWithImages(itemPrices[event.reward.itemId])
                  ) : (
                    <span className="text-yellow-400">Carregando...</span>
                  )}
                </a>
              ) : event.reward.type === 'item' ? (
                <a 
                  href={event.reward.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {event.reward.name} <span className="text-yellow-400">({event.reward.price})</span>
                </a>
              ) : (
                <>
                  <span className={event.reward.currency === 'gold' ? 'text-yellow-400' : 'text-purple-400'}>
                    {event.reward.amount}
                  </span>
                  {event.reward.currency === 'gold' ? (
                    <img 
                      src="https://wiki.guildwars2.com/images/d/d1/Gold_coin.png" 
                      alt="Gold coin" 
                      className="w-4 h-4 object-contain" 
                    />
                  ) : (
                    <img 
                      src="https://wiki.guildwars2.com/images/b/b5/Mystic_Coin.png" 
                      alt="Mystic Coin" 
                      className="w-4 h-4 object-contain" 
                    />
                  )}
                </>
              )}
            </div>
          )}
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
              {isCompleted ? 'Completed' : statusText}
            </span>
          </div>
        </div>
      </div>
    );
  }), [copyToClipboard, formatTime, itemPrices, formatPriceWithImages]);

  // Componente para eventos concluídos manualmente
  const CompletedEventTypeCard = useMemo(() => React.memo(({ eventType, onToggle }) => {
    return (
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group opacity-70">
        <input
          type="checkbox"
          checked={true}
          onChange={() => onToggle(eventType.instances[0].id, eventType.eventKey)}
          className="absolute top-3 right-3 rounded bg-gray-700 border-gray-600 text-emerald-400 focus:ring-emerald-400/50"
        />

        <div className="p-6 flex-grow pt-12">
          <h3 className="text-xl font-bold text-emerald-400 mb-2">{eventType.name}</h3>
          <div className="text-sm text-gray-400 mb-4">
            Completed manually
          </div>
          
          <div className="text-xs text-gray-400 mb-2">
            {eventType.instances.length} occurrence(s) marked as completed
          </div>

          {/* Exibe o reward também nos eventos concluídos */}
          {eventType.instances[0]?.reward && (
            <div className="flex items-center gap-1 text-sm mt-1">
              {eventType.instances[0].reward.type === 'item' && eventType.instances[0].reward.itemId ? (
                <a 
                  href={eventType.instances[0].reward.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {eventType.instances[0].reward.name} 
                  {itemPrices[eventType.instances[0].reward.itemId] !== undefined ? (
                    formatPriceWithImages(itemPrices[eventType.instances[0].reward.itemId])
                  ) : (
                    <span className="text-yellow-400">Carregando...</span>
                  )}
                </a>
              ) : eventType.instances[0].reward.type === 'item' ? (
                <a 
                  href={eventType.instances[0].reward.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {eventType.instances[0].reward.name} <span className="text-yellow-400">({eventType.instances[0].reward.price})</span>
                </a>
              ) : (
                <>
                  <span className={eventType.instances[0].reward.currency === 'gold' ? 'text-yellow-400' : 'text-purple-400'}>
                    {eventType.instances[0].reward.amount}
                  </span>
                  {eventType.instances[0].reward.currency === 'gold' ? (
                    <img 
                      src="https://wiki.guildwars2.com/images/d/d1/Gold_coin.png" 
                      alt="Gold coin" 
                      className="w-4 h-4 object-contain" 
                    />
                  ) : (
                    <img 
                      src="https://wiki.guildwars2.com/images/b/b5/Mystic_Coin.png" 
                      alt="Mystic Coin" 
                      className="w-4 h-4 object-contain" 
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="px-6 pb-4">
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 text-sm font-mono">
              Click checkbox to undo
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
              Manually Completed
            </span>
          </div>
        </div>
      </div>
    );
  }), [itemPrices, formatPriceWithImages]);

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
      
      {/* Eventos ativos/upcoming - AGORA COM HOVER ESTÁVEL */}
      {eventsData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventsData.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              isCompleted={false}
              onToggle={handleEventToggle}
              // Não passamos currentTime - o cartão é estável
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <p>No events in the next 2 hours.</p>
          <p className="mt-2">Check back later for upcoming events.</p>
        </div>
      )}
      
      {/* Eventos concluídos manualmente */}
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EventsSection);