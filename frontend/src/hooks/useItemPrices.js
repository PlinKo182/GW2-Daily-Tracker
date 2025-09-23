// useItemPrices.js
export const useItemPrices = (events) => {
  const [itemPrices, setItemPrices] = useState({});

  useEffect(() => {
    const fetchItemPrices = async () => {
      const itemIds = [];
      
      events.forEach(event => {
        // Suporte para array de recompensas
        if (event.rewards && Array.isArray(event.rewards)) {
          event.rewards.forEach(reward => {
            if (reward && reward.itemId) {
              itemIds.push(reward.itemId);
            }
          });
        }
        // Backward compatibility para recompensa única
        else if (event.reward && event.reward.itemId) {
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
  }, [events]);

  return itemPrices;
};