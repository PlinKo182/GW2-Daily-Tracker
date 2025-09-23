// EventCard.js - Modifique a seção de recompensas
import React from 'react';
import { MapPin } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { formatTime } from '../../utils/timeUtils';
import { copyToClipboard } from '../../utils/clipboardUtils';
import { formatPriceWithImages } from '../../utils/priceUtils';

const EventCard = ({ event, isCompleted = false, onToggle, itemPrices }) => {
  if (!event) return null;

  const now = new Date();
  const eventActive = event.startTime <= now && event.endTime >= now;
  const eventUpcoming = event.startTime > now;

  // Função para renderizar uma única recompensa
  const renderReward = (reward, index) => {
    if (!reward) return null;

    if (reward.type === 'item' && reward.itemId) {
      return (
        <div key={index} className="flex items-center gap-1 text-sm">
          <a 
            href={reward.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            <span className="hover:underline">{reward.name}</span>
            {itemPrices[reward.itemId] !== undefined ? (
              <span className="ml-1">
                {formatPriceWithImages(itemPrices[reward.itemId])}
              </span>
            ) : (
              <span className="text-yellow-400 ml-1">Carregando...</span>
            )}
          </a>
        </div>
      );
    } else if (reward.type === 'item') {
      return (
        <div key={index} className="flex items-center gap-1 text-sm">
          <a 
            href={reward.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            <span className="hover:underline">{reward.name}</span>
            <span className="text-yellow-400 ml-1">({reward.price})</span>
          </a>
        </div>
      );
    } else if (reward.amount && reward.currency) {
      return (
        <div key={index} className="flex items-center gap-1 text-sm">
          <span className={reward.currency === 'gold' ? 'text-yellow-400' : 'text-purple-400'}>
            {reward.amount}
          </span>
          {reward.currency === 'gold' ? (
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
          <span className="text-gray-400 text-xs">({reward.currency})</span>
        </div>
      );
    }
    
    return null;
  };

  // Suporte para recompensa única (backward compatibility) e múltiplas
  const rewards = Array.isArray(event.rewards) ? event.rewards : 
                 event.reward ? [event.reward] : [];

  let statusClass = '';
  let statusText = '';

  if (eventActive) {
    statusClass = 'bg-emerald-500/20 text-emerald-300';
    statusText = 'Ongoing';
  } else if (eventUpcoming) {
    statusClass = 'bg-amber-500/20 text-amber-300';
    statusText = 'Upcoming';
  } else {
    statusClass = 'bg-gray-500/20 text-gray-300';
    statusText = 'Completed';
  }

  const handleToggle = () => {
    if (event.id && event.eventKey) {
      onToggle(event.id, event.eventKey);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${isCompleted ? 'opacity-70' : ''}`}>
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleToggle}
        className="absolute top-3 right-3 rounded bg-gray-700 border-gray-600 text-emerald-400 focus:ring-emerald-400/50"
      />

      <div className="p-6 flex-grow pt-12">
        <h3 className="text-xl font-bold text-emerald-400 mb-2">{event.name || 'Unknown Event'}</h3>
        <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
          <MapPin className="w-4 h-4" />
          {event.location || 'Unknown Location'}
        </div>
        
        {!isCompleted && event.startTime && event.endTime && (
          <CountdownTimer 
            startTime={event.startTime} 
            endTime={event.endTime}
          />
        )}
        
        <div className="text-xs text-gray-400 mb-2">
          {event.startTime ? formatTime(event.startTime) : '--:--'} - {event.endTime ? formatTime(event.endTime) : '--:--'}
        </div>

        {/* SEÇÃO DE RECOMPENSAS ATUALIZADA */}
        {rewards.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-gray-400 font-semibold">Rewards:</div>
            <div className="space-y-1">
              {rewards.map((reward, index) => renderReward(reward, index))}
            </div>
          </div>
        )}
      </div>
      
      <div className="px-6 pb-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => event.waypoint && copyToClipboard(event.waypoint)}
            className="text-emergent-400 hover:underline text-sm font-mono hover:bg-gray-700 px-2 py-1 rounded transition-colors duration-150"
            title="Click to copy waypoint"
          >
            {event.waypoint || 'No waypoint'}
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