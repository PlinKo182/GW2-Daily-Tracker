// components/EventCard.jsx
import React from 'react';
import { CheckCircle, Circle, MapPin, Clock, Gift } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

const EventCard = ({ event, isCompleted, onToggle, itemPrices, currentTime }) => {
  const isExpired = event.endTime <= currentTime;

  // Se expirou e não está completado manualmente, não renderizar
  if (isExpired && !isCompleted) {
    return null;
  }

  const handleToggle = () => {
    onToggle(event.id, event.eventKey);
  };

  const getWaypointCode = (waypoint) => {
    if (!waypoint) return '';
    const match = waypoint.match(/\[&([^\]]+)\]/);
    return match ? match[1] : waypoint;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`bg-gray-800 rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
        isCompleted ? 'border-emerald-500 bg-emerald-900/20' : 
        isExpired ? 'border-red-500 bg-red-900/20 event-expiring' : 
        'border-gray-700 hover:border-gray-600'
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{event.name}</h3>
            <div className="flex items-center text-gray-400 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              <span>@{event.location}</span>
            </div>
          </div>
          <button
            onClick={handleToggle}
            className={`flex-shrink-0 ml-3 p-2 rounded-full transition-all ${
              isCompleted 
                ? 'text-emerald-400 hover:text-emerald-300 bg-emerald-900/50' 
                : 'text-gray-400 hover:text-gray-300 bg-gray-700/50'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer 
          startTime={event.startTime}
          endTime={event.endTime}
          currentTime={currentTime}
        />

        {/* Event Details */}
        <div className="space-y-3">
          {/* Reward */}
          <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center text-gray-400">
              <Gift className="w-4 h-4 mr-2" />
              <span className="text-sm">Reward</span>
            </div>
            <div className="text-right">
              {event.reward?.type === 'item' ? (
                <a 
                  href={event.reward.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-300 hover:underline block"
                >
                  {event.reward.name}
                  {itemPrices[event.reward.itemId] !== undefined ? (
                    <span className="text-yellow-400 text-xs ml-1">
                      ({itemPrices[event.reward.itemId]} gems)
                    </span>
                  ) : event.reward.price ? (
                    <span className="text-yellow-400 text-xs ml-1">
                      ({event.reward.price})
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs ml-1">(Carregando...)</span>
                  )}
                </a>
              ) : event.reward?.currency === 'gold' ? (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">{event.reward.amount}</span>
                  <img 
                    src="https://wiki.guildwars2.com/images/d/d1/Gold_coin.png" 
                    alt="Gold" 
                    className="w-4 h-4"
                  />
                </div>
              ) : event.reward?.currency === 'mystic_coin' ? (
                <div className="flex items-center gap-1">
                  <span className="text-purple-400">{event.reward.amount}</span>
                  <img 
                    src="https://wiki.guildwars2.com/images/b/b5/Mystic_Coin.png" 
                    alt="Mystic Coin" 
                    className="w-4 h-4"
                  />
                </div>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </div>

          {/* Time Info */}
          <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">Schedule</span>
            </div>
            <div className="text-right">
              <span className="text-gray-300 font-mono text-sm block">
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </span>
              <span className="text-gray-400 text-xs">{event.duration} minutes</span>
            </div>
          </div>

          {/* Waypoint */}
          {event.waypoint && (
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">Waypoint</div>
              <code className="text-blue-300 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                {getWaypointCode(event.waypoint)}
              </code>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="mt-4">
          {isCompleted ? (
            <div className="bg-emerald-900/50 text-emerald-300 px-3 py-2 rounded-lg text-center text-sm font-medium">
              ✓ Manually Completed
            </div>
          ) : isExpired ? (
            <div className="bg-red-900/50 text-red-300 px-3 py-2 rounded-lg text-center text-sm font-medium">
              ⚠️ Event Expired
            </div>
          ) : currentTime >= event.startTime ? (
            <div className="bg-green-900/50 text-green-300 px-3 py-2 rounded-lg text-center text-sm font-medium animate-pulse">
              🔥 Active Now
            </div>
          ) : (
            <div className="bg-amber-900/50 text-amber-300 px-3 py-2 rounded-lg text-center text-sm font-medium">
              ⏰ Upcoming
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(EventCard);