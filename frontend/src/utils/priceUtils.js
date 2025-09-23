//priceUtils.js
export const formatPriceWithImages = (copper) => {
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
};