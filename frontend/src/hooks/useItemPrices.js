import { useState, useEffect } from 'react';

export const useItemPrices = (events) => {
  const [itemPrices, setItemPrices] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchItemPrices = async () => {
      if (!events || !Array.isArray(events) || events.length === 0) {
        return;
      }

      try {
        const itemIds = [];
        
        events.forEach(event => {
          if (event.rewards && Array.isArray(event.rewards)) {
            event.rewards.forEach(reward => {
              if (reward && reward.itemId) {
                itemIds.push(reward.itemId);
              }
            });
          } else if (event.reward && event.reward.itemId) {
            itemIds.push(event.reward.itemId);
          }
        });
        
        const uniqueItemIds = [...new Set(itemIds)];
        
        if (uniqueItemIds.length === 0) return;
        
        const response = await fetch(`https://api.guildwars2.com/v2/commerce/prices?ids=${uniqueItemIds.join(',')}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch prices: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (mounted) {
          const prices = {};
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item && item.id) {
                const copper = item.sells?.unit_price || item.buys?.unit_price || 0;
                prices[item.id] = copper;
              }
            });
          }
          setItemPrices(prices);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.warn('Price fetch error (non-critical):', err);
          setError(err.message);
          // Não quebrar a aplicação - continuar com preços vazios
        }
      }
    };

    fetchItemPrices();

    return () => {
      mounted = false;
    };
  }, [events]);

  return itemPrices;
};