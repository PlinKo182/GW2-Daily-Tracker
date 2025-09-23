// hooks/useItemPrices.js
import { useState, useEffect } from 'react';

export const useItemPrices = (events) => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const fetchPrices = async () => {
      const itemIds = [
        ...new Set(
          events
            .map(event => event.reward?.itemId)
            .filter(id => typeof id === 'number')
        )
      ];

      if (itemIds.length === 0) return;

      try {
        const response = await fetch(`https://api.guildwars2.com/v2/commerce/prices?ids=${itemIds.join(',')}`);
        const data = await response.json();

        const priceMap = {};
        data.forEach(item => {
          if (item.sells?.unit_price) {
            const goldPrice = item.sells.unit_price / 10000;
            priceMap[item.id] = Math.round(goldPrice);
          }
        });

        setPrices(priceMap);
      } catch (error) {
        console.error('Erro ao buscar preços:', error);
        // Fallback manual
        const fallback = {
          31051: 15,   // Spirit Links
          31065: 25,   // Icy Dragon Sword
          76063: 120,  // Vial of Liquid Aurillium
          74988: 8     // Chak Egg Sac
        };
        setPrices(fallback);
      }
    };

    fetchPrices();
  }, [events]);

  return prices;
};