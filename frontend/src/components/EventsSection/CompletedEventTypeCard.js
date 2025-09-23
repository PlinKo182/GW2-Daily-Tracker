import React from 'react';
import { formatPriceWithImages } from '../../utils/priceUtils';

const CompletedEventTypeCard = ({ eventType, onToggle, itemPrices }) => {
  if (!eventType || !eventType.instances || eventType.instances.length === 0) {
    return null;
  }

  // Função para renderizar uma única recompensa
  const renderReward = (reward, index) => {
    if (!reward) return null;

    if (reward.type === 'item' && reward.itemId) {
      return (
        <div key={index} className="flex items-center gap-1 text-sm mt-1">
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
        <div key={index} className="flex items-center gap-1 text-sm mt-1">
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
        <div key={index} className="flex items-center gap-1 text-sm mt-1">
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

  // Obter a primeira instância para mostrar informações (assumindo que todas as instâncias têm as mesmas recompensas)
  const firstInstance = eventType.instances[0];
  
  // Suporte para recompensa única (backward compatibility) e múltiplas recompensas
  const rewards = Array.isArray(firstInstance.rewards) ? firstInstance.rewards : 
                 firstInstance.reward ? [firstInstance.reward] : [];

  const handleToggle = () => {
    if (eventType.instances.length > 0) {
      // Usar a primeira instância para desfazer a marcação
      onToggle(eventType.instances[0].id, eventType.eventKey);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 flex flex-col relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group opacity-70">
      <input
        type="checkbox"
        checked={true}
        onChange={handleToggle}
        className="absolute top-3 right-3 rounded bg-gray-700 border-gray-600 text-emerald-400 focus:ring-emerald-400/50 focus:ring-2"
      />

      <div className="p-6 flex-grow pt-12">
        <h3 className="text-xl font-bold text-emerald-400 mb-2">{eventType.name || 'Unknown Event'}</h3>
        <div className="text-sm text-gray-400 mb-4">
          Completed manually
        </div>
        
        <div className="text-xs text-gray-400 mb-2">
          {eventType.instances.length} occurrence(s) marked as completed
        </div>

        {/* SEÇÃO DE RECOMPENSAS ATUALIZADA PARA MÚLTIPLAS RECOMPENSAS */}
        {rewards.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-400 font-semibold mb-1">Rewards:</div>
            <div className="space-y-1">
              {rewards.map((reward, index) => renderReward(reward, index))}
            </div>
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