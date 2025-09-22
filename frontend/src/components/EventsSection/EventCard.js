import React from 'react';
import { MapPin } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { formatTime } from '../../utils/timeUtils';
import { copyToClipboard } from '../../utils/clipboardUtils';
import { formatPriceWithImages } from '../../utils/priceUtils';

const EventCard = ({ event, isCompleted = false, onToggle, itemPrices }) => {
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
                className="text-emerald-400"
              >
                <span className="hover:underline">{event.reward.name}</span>
                {itemPrices[event.reward.itemId] !== undefined ? (
                  <span className="ml-1">
                    {formatPriceWithImages(itemPrices[event.reward.itemId])}
                  </span>
                ) : (
                  <span className="text-yellow-400 ml-1">Carregando...</span>
                )}
              </a>
            ) : event.reward.type === 'item' ? (
              <a 
                href={event.reward.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400"
              >
                <span className="hover:underline">{event.reward.name}</span>
                <span className="text-yellow-400 ml-1">({event.reward.price})</span>
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
};

export default React.memo(EventCard);