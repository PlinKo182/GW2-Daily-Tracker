// utils/mockData.js
import { convertUTCTimeToLocal } from './timeUtils';

export const mockData = {
  gatheringTasks: [
    {
      id: 'vine_bridge',
      name: 'Vine Bridge',
      waypoint: '[&BIYHAAA=]'
    },
    {
      id: 'prosperity',
      name: 'Prosperity',
      waypoint: '[&BHoHAAA=]'
    },
    {
      id: 'destinys_gorge',
      name: "Destiny's Gorge",
      waypoint: '[&BJMKAAA=]'
    }
  ],

  craftingTasks: [
    {
      id: 'mithrillium',
      name: 'Lump of Mithrillium'
    },
    {
      id: 'elonian_cord',
      name: 'Spool of Thick Elonian Cord'
    },
    {
      id: 'spirit_residue',
      name: 'Glob of Elder Spirit Residue'
    },
    {
      id: 'gossamer',
      name: 'Gossamer Stuffing'
    }
  ],

  specialTasks: [
    {
      id: 'psna',
      name: getPSNAName(),
      waypoint: getPSNAWaypoint()
    },
    {
      id: 'home_instance',
      name: 'Home Instance',
      waypoint: '[&BLQEAAA=]'
    }
  ],

  eventConfig: {
    events: {
      "tt_triple_trouble": {
        "event_name": "Triple Trouble",
        "location": "Bloodtide Coast",
        "duration_minutes": 30,
        "reward": {
          "amount": 2,
          "currency": "gold"
        },
        "utc_times": ["01:00", "04:00", "08:00", "12:30", "17:00", "20:00"],
        "waypoint": "Triple Trouble - [&BKoBAAA=]"
      },
      "vb_night_boss": {
        "event_name": "Night Bosses",
        "location": "Verdant Brink",
        "duration_minutes": 20,
        "utc_times": ["00:10", "02:10", "04:10", "06:10", "08:10", "10:10", "12:10", "14:10", "16:10", "18:10", "20:10", "22:10"],
        "waypoint": "Night Bosses - [&BAgIAAA=]"
      },
      "td_chak_gerent": {
        "event_name": "Chak Gerent",
        "location": "Tangled Depths",
        "duration_minutes": 20,
        "reward": {
          "type": "item",
          "name": "Chak Egg Sac",
          "link": "https://wiki.guildwars2.com/wiki/Chak_Egg_Sac",
          "itemId": 74988, // ← ID CORRETO (API)
          "currency": "gold"
        },
        "utc_times": ["00:00", "03:00", "06:00", "07:00", "11:30", "16:00", "19:00"],
        "waypoint": "Tequatl - [&BNABAAA=]"
      },
      "lla": {
        "event_name": "Ley-Line Anomaly",
        "duration_minutes": 15,
        "locations": [
          {
            "map": "Timberline Falls",
            "waypoint": "Timberline Falls - [&BEwCAAA=]",
            "utc_times": ["00:20", "06:20", "12:20", "18:20"],
            "reward": {
              "amount": 1,
              "currency": "mystic_coin"
            }
          },
          {
            "map": "Iron Marches",
            "waypoint": "Iron Marches - [&BOYBAAA=]",
            "utc_times": ["02:20", "08:20", "14:20", "20:20"],
            "reward": {
              "amount": 1,
              "currency": "mystic_coin"
            }
          },
          {
            "map": "Gendarran Fields",
            "waypoint": "Gendarran Fields - [&BOQAAAA=]",
            "utc_times": ["04:20", "10:20", "16:20", "22:20"],
            "reward": {
              "amount": 1,
              "currency": "mystic_coin"
            }
          }
        ]
      },
      "ds_dragonstorm": {
        "event_name": "Dragonstorm",
        "location": "Eye of the North",
        "duration_minutes": 15,
        "reward": {
          "amount": 2,
          "currency": "gold"
        },
        "utc_times": ["01:00", "03:00", "05:00", "07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
        "waypoint": "Dragonstorm - [&BAkMAAA=]"
      },
      "sb_shadow_behemoth": {
        "event_name": "Shadow Behemoth",
        "location": "Queensdale",
        "duration_minutes": 10,
        "reward": {
          "type": "item",
          "name": "Spirit Links",
          "link": "https://wiki.guildwars2.com/wiki/Spirit_Links",
          "itemId": 31051, // ← Correto
          "currency": "gold"
        },
        "utc_times": ["01:45", "03:45", "05:45", "07:45", "09:45", "11:45", "13:45", "15:45", "17:45", "19:45", "21:45", "23:45"],
        "waypoint": "Shadow Behemoth - [&BPcAAAA=]"
      },
      "gjw_great_jungle_wurm": {
        "event_name": "Great Jungle Wurm",
        "location": "Caledon Forest",
        "duration_minutes": 10,
        "utc_times": ["01:15", "03:15", "05:15", "07:15", "09:15", "11:15", "13:15", "15:15", "17:15", "19:15", "21:15", "23:15"],
        "waypoint": "Great Jungle Wurm - [&BEEFAAA=]"
      },
      "coj_claw_of_jormag": {
        "event_name": "Claw of Jormag",
        "location": "Frostgorge Sound",
        "duration_minutes": 15,
        "reward": {
          "type": "item",
          "name": "Icy Dragon Sword",
          "link": "https://wiki.guildwars2.com/wiki/Icy_Dragon_Sword",
          "itemId": 31065, // ← Correto
          "currency": "gold"
        },
        "utc_times": ["02:30", "05:30", "08:30", "11:30", "14:30", "17:30", "20:30", "23:30"],
        "waypoint": "Claw of Jormag - [&BHoCAAA=]"
      },
      "ab_auric_basin": {
        "event_name": "Auric Basin Octovine",
        "location": "Auric Basin",
        "duration_minutes": 20,
        "reward": {
          "type": "item",
          "name": "Vial of Liquid Aurillium",
          "link": "https://wiki.guildwars2.com/wiki/Vial_of_Liquid_Aurillium",
          "itemId": 76063, // ← Correto
          "currency": "gold"
        },
        "utc_times": ["01:00", "03:00", "05:00", "07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
        "waypoint": "Octovine - [&BMYHAAA=]"
      },
      "fractal_incursion_snowden": {
        "event_name": "Fractal Incursion",
        "location": "Snowden Drifts",
        "duration_minutes": 20,
        "utc_times": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
        "waypoint": "Fractal Incursion - [&BLQAAAA=]"
      },
      "fractal_incursion_kessex": {
        "event_name": "Fractal Incursion",
        "location": "Kessex Hills",
        "duration_minutes": 20,
        "utc_times": ["01:00", "05:00", "09:00", "13:00", "17:00", "21:00"],
        "waypoint": "Fractal Incursion - [&BBIAAAA=]"
      },
      "fractal_incursion_diessa": {
        "event_name": "Fractal Incursion",
        "location": "Diessa Plateau",
        "duration_minutes": 20,
        "utc_times": ["02:00", "06:00", "10:00", "14:00", "18:00", "22:00"],
        "waypoint": "Fractal Incursion - [&BN0AAAA=]"
      }
    }
  }
};

// PSNA helper functions
function getPSNAName() {
  const psnaData = {
    0: "Repair Station",        // Sunday
    1: "Restoration Refuge",   // Monday
    2: "Camp Resolve",         // Tuesday
    3: "Town of Prosperity",   // Wednesday
    4: "Blue Oasis",          // Thursday
    5: "Repair Station",      // Friday
    6: "Camp Resolve"         // Saturday
  };
  const today = new Date().getDay();
  return `PSNA: ${psnaData[today]}`;
}

function getPSNAWaypoint() {
  const psnaWaypoints = {
    0: "[&BIkHAAA=]",  // Sunday
    1: "[&BIcHAAA=]",  // Monday
    2: "[&BH8HAAA=]",  // Tuesday
    3: "[&BH4HAAA=]",  // Wednesday
    4: "[&BKsHAAA=]",  // Thursday
    5: "[&BJQHAAA=]",  // Friday
    6: "[&BH8HAAA=]"   // Saturday
  };
  const today = new Date().getDay();
  return psnaWaypoints[today];
}

// ✅ Função principal: gera todos os eventos com tempos normalizados
export const generateEvents = () => {
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const allEvents = [];

  for (const [eventKey, eventData] of Object.entries(mockData.eventConfig.events)) {
    if (eventData.locations) {
      eventData.locations.forEach(location => {
        location.utc_times.forEach(utcTime => {
          const [hours, minutes] = utcTime.split(':').map(Number);
          const utcDate = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            hours,
            minutes
          ));
          utcDate.setMilliseconds(0);

          // Se o horário já passou hoje, use amanhã
          let startTime = utcDate;
          if (startTime < now) {
            startTime.setDate(startTime.getDate() + 1);
          }

          const endTime = new Date(startTime.getTime() + eventData.duration_minutes * 60 * 1000);
          endTime.setMilliseconds(0);

          const todayInstance = createEventInstance(eventKey, eventData, location, startTime, endTime, now, twoHoursLater);
          if (todayInstance) allEvents.push(todayInstance);
        });
      });
    } else {
      eventData.utc_times.forEach(utcTime => {
        const [hours, minutes] = utcTime.split(':').map(Number);
        const utcDate = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          hours,
          minutes
        ));
        utcDate.setMilliseconds(0);

        let startTime = utcDate;
        if (startTime < now) {
          startTime.setDate(startTime.getDate() + 1);
        }

        const endTime = new Date(startTime.getTime() + eventData.duration_minutes * 60 * 1000);
        endTime.setMilliseconds(0);

        const todayInstance = createEventInstance(eventKey, eventData, null, startTime, endTime, now, twoHoursLater);
        if (todayInstance) allEvents.push(todayInstance);
      });
    }
  }

  return allEvents.sort((a, b) => a.startTime - b.startTime);
};

// ✅ Função auxiliar: cria instância de evento
function createEventInstance(eventKey, eventData, location, startTime, endTime, now, cutoffTime) {
  // Só inclui se estiver ativo agora OU começar nas próximas 2h
  if (startTime > cutoffTime && startTime > now) {
    return null;
  }

  let reward = null;
  if (eventData.reward) {
    reward = { ...eventData.reward };
  } else if (location?.reward) {
    reward = { ...location.reward };
  }

  // Garante link para itens
  if (reward?.type === 'item' && !reward.link) {
    reward.link = `https://wiki.guildwars2.com/wiki/${encodeURIComponent(reward.name)}`;
  }

  return {
    id: `${eventKey}-${startTime.getTime()}`,
    eventKey,
    name: eventData.event_name,
    location: location ? location.map : eventData.location,
    startTime,
    endTime,
    duration: eventData.duration_minutes,
    reward,
    waypoint: location ? location.waypoint : eventData.waypoint
  };
}