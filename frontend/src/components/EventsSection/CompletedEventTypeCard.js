import React from 'react';
import { formatPriceWithImages } from '../../utils/priceUtils';

const CompletedEventTypeCard = ({ eventType, onToggle, itemPrices }) => {
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
};

export default React.memo(CompletedEventTypeCard);