export const mockData = {
  gatheringTasks: [
    {
      id: 'vine_bridge',
      name: 'Vine Bridge',
      waypoint: '[&BIYHAAA=]',
      availability: {
        times: [
          "00:50","01:50","02:50","03:50","04:50","05:50","06:50","07:50","08:50","09:50","10:50","11:50","12:50",
          "13:50","14:50","15:50","16:50","17:50","18:50","19:50","20:50","21:50","22:50","23:50"
        ],
        duration: 10
      }
    },
    { id: 'prosperity', name: 'Prosperity', waypoint: '[&BHoHAAA=]' },
    { id: 'destinys_gorge', name: "Destiny's Gorge", waypoint: '[&BJMKAAA=]' }
  ],

  craftingTasks: [
    { id: 'mithrillium', name: 'Lump of Mithrillium' },
    { id: 'elonian_cord', name: 'Spool of Thick Elonian Cord' },
    { id: 'spirit_residue', name: 'Glob of Elder Spirit Residue' },
    { id: 'gossamer', name: 'Gossamer Stuffing' }
  ],

  specialTasks: [
    { id: 'psna', name: getPSNAName(), waypoint: getPSNAWaypoint() },
    { id: 'home_instance', name: 'Home Instance', waypoint: '[&BLQEAAA=]' }
  ],

  eventConfig: {
    events: {
      tt_triple_trouble: {
        event_name: "Triple Trouble",
        location: "Bloodtide Coast",
        duration_minutes: 30,
        rewards: [
          { amount: 2, currency: "gold" }
        ],
        utc_times: ["01:00", "04:00", "08:00", "12:30", "17:00", "20:00"],
        waypoint: "Triple Trouble - [&BKoBAAA=]"
      },
      vb_night_boss: {
        event_name: "Night Bosses",
        location: "Verdant Brink",
        duration_minutes: 20,
        rewards: [
          { amount: 1, currency: "gold" }
        ],
        utc_times: ["00:10","02:10","04:10","06:10","08:10","10:10","12:10","14:10","16:10","18:10","20:10","22:10"],
        waypoint: "Night Bosses - [&BAgIAAA=]"
      },
      td_chak_gerent: {
        event_name: "Chak Gerent",
        location: "Tangled Depths",
        duration_minutes: 20,
        rewards: [
          {
            type: "item",
            name: "Chak Egg Sac",
            link: "https://wiki.guildwars2.com/wiki/Chak_Egg_Sac",
            itemId: 72021
          }
        ],
        utc_times: ["00:30","02:30","04:30","06:30","08:30","10:30","12:30","14:30","16:30","18:30","20:30","22:30"],
        waypoint: "Chak Gerent - [&BPUHAAA=]"
      },
      tt_tequatl: {
        event_name: "Tequatl the Sunless",
        location: "Sparkfly Fen",
        duration_minutes: 15,
        rewards: [
          { amount: 1, currency: "gold" }
        ],
        utc_times: ["00:00","03:00","06:00","07:00","11:30","16:00","19:00"],
        waypoint: "Tequatl - [&BNABAAA=]"
      },
      lla: {
        event_name: "Ley-Line Anomaly",
        duration_minutes: 15,
        locations: [
          {
            map: "Timberline Falls",
            waypoint: "Timberline Falls - [&BEwCAAA=]",
            utc_times: ["00:20","06:20","12:20","18:20"],
            rewards: [
              {
                type: "item",
                name: "Ley-Line Anomaly Tonic",
                link: "https://wiki.guildwars2.com/wiki/Endless_Ley-Line_Anomaly_Tonic_(container)",
                itemId: 79034
              },
              { amount: 1, currency: "mystic_coin" }
            ]
          },
          {
            map: "Iron Marches",
            waypoint: "Iron Marches - [&BOYBAAA=]",
            utc_times: ["02:20","08:20","14:20","20:20"],
            rewards: [
              {
                type: "item",
                name: "Ley-Line Anomaly Tonic",
                link: "https://wiki.guildwars2.com/wiki/Endless_Ley-Line_Anomaly_Tonic_(container)",
                itemId: 79034
              },
              { amount: 1, currency: "mystic_coin" }
            ]
          },
          {
            map: "Gendarran Fields",
            waypoint: "Gendarran Fields - [&BOQAAAA=]",
            utc_times: ["04:20","10:20","16:20","22:20"],
            rewards: [
              {
                type: "item",
                name: "Ley-Line Anomaly Tonic",
                link: "https://wiki.guildwars2.com/wiki/Endless_Ley-Line_Anomaly_Tonic_(container)",
                itemId: 79034
              },
              { amount: 1, currency: "mystic_coin" }
            ]
          }
        ]
      },
      ds_dragonstorm: {
        event_name: "Dragonstorm",
        location: "Eye of the North",
        duration_minutes: 15,
        rewards: [
          {
            type: "item",
            name: "Pristine Dragon's Right Eye",
            link: "https://wiki.guildwars2.com/wiki/Pristine_Dragon%27s_Right_Eye",
            itemId: 94982
          },
          { amount: 2, currency: "gold" }
        ],
        utc_times: ["01:00","03:00","05:00","07:00","09:00","11:00","13:00","15:00","17:00","19:00","21:00","23:00"],
        waypoint: "Dragonstorm - [&BAkMAAA=]"
      },
      sb_shadow_behemoth: {
        event_name: "Shadow Behemoth",
        location: "Queensdale",
        duration_minutes: 10,
        rewards: [
          {
            type: "item",
            name: "Pristine Dragon's Right Eye",
            link: "https://wiki.guildwars2.com/wiki/Pristine_Dragon%27s_Right_Eye",
            itemId: 94982
          }
        ],
        utc_times: ["01:45","03:45","05:45","07:45","09:45","11:45","13:45","15:45","17:45","19:45","21:45","23:45"],
        waypoint: "Shadow Behemoth - [&BPcAAAA=]"
      },
      gjw_great_jungle_wurm: {
        event_name: "Great Jungle Wurm",
        location: "Caledon Forest",
        duration_minutes: 10,
        rewards: [
          { amount: 2, currency: "gold" }
        ],
        utc_times: ["01:15","03:15","05:15","07:15","09:15","11:15","13:15","15:15","17:15","19:15","21:15","23:15"],
        waypoint: "Great Jungle Wurm - [&BEEFAAA=]"
      },
      coj_claw_of_jormag: {
        event_name: "Claw of Jormag",
        location: "Frostgorge Sound",
        duration_minutes: 15,
        rewards: [
          {
            type: "item",
            name: "Icy Dragon Sword",
            link: "https://wiki.guildwars2.com/wiki/Icy_Dragon_Sword",
            itemId: 31065
          },
          { amount: 1, currency: "gold" }
        ],
        utc_times: ["02:30","05:30","08:30","11:30","14:30","17:30","20:30","23:30"],
        waypoint: "Claw of Jormag - [&BHoCAAA=]"
      },
      ab_auric_basin: {
        event_name: "Auric Basin Octovine",
        location: "Auric Basin",
        duration_minutes: 20,
        rewards: [
          {
            type: "item",
            name: "Vial of Liquid Aurillium",
            link: "https://wiki.guildwars2.com/wiki/Vial_of_Liquid_Aurillium",
            itemId: 76063
          }
        ],
        utc_times: ["01:00","03:00","05:00","07:00","09:00","11:00","13:00","15:00","17:00","19:00","21:00","23:00"],
        waypoint: "Octovine - [&BMYHAAA=]"
      }
    }
  }
};

// -------------------------
// PSNA helpers
// -------------------------
function getPSNAName() {
  const psnaData = {
    0: "Repair Station",       // Sunday
    1: "Restoration Refuge",   // Monday
    2: "Camp Resolve",         // Tuesday
    3: "Town of Prosperity",   // Wednesday
    4: "Blue Oasis",           // Thursday
    5: "Repair Station",       // Friday
    6: "Camp Resolve"          // Saturday
  };
  return `PSNA: ${psnaData[new Date().getDay()]}`;
}

function getPSNAWaypoint() {
  const psnaWaypoints = {
    0: "[&BIkHAAA=]", // Sunday
    1: "[&BIcHAAA=]", // Monday
    2: "[&BH8HAAA=]", // Tuesday
    3: "[&BH4HAAA=]", // Wednesday
    4: "[&BKsHAAA=]", // Thursday
    5: "[&BJQHAAA=]", // Friday
    6: "[&BH8HAAA=]"  // Saturday
  };
  return psnaWaypoints[new Date().getDay()];
}

// -------------------------
// Reorder Rewards (garante item primeiro)
// -------------------------
function reorderRewards(data) {
  Object.values(data.eventConfig.events).forEach(event => {
    if (event.rewards && event.rewards.length > 1) {
      event.rewards.sort((a, b) => (a.type === 'item' ? -1 : 1));
    }
    if (event.locations) {
      event.locations.forEach(loc => {
        if (loc.rewards && loc.rewards.length > 1) {
          loc.rewards.sort((a, b) => (a.type === 'item' ? -1 : 1));
        }
      });
    }
  });
}

// executa logo ao carregar
reorderRewards(mockData);
