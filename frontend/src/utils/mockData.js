// Mock data for Tyria Tracker

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
        "utc_times": ["01:00", "04:00", "08:00", "12:30", "17:00", "20:00"],
        "waypoint": "[&BKgBAAA=]"
      },
      "vb_night_boss": {
      "event_name": "Night Bosses",
      "location": "Verdant Brink",
      "duration_minutes": 20,
      "utc_times": ["00:10", "02:10", "04:10", "06:10", "08:10", "10:10", "12:10", "14:10", "16:10", "18:10", "20:10", "22:10"],
      "waypoint": "[&BAgIAAA=]"
      },
      "td_chak_gerent": {
        "event_name": "Chak Gerent",
        "location": "Tangled Depths",
        "duration_minutes": 20,
        "utc_times": ["00:30", "02:30", "04:30", "06:30", "08:30", "10:30", "12:30", "14:30", "16:30", "18:30", "20:30", "22:30"],
        "waypoint": "[&BIsCAAA=]"
      },
      "tt_tequatl": {
        "event_name": "Tequatl the Sunless",
        "location": "Sparkfly Fen",
        "duration_minutes": 15,
        "utc_times": ["00:00", "03:00", "06:00", "07:00", "11:30", "16:00", "19:00"],
        "waypoint": "[&BEMCAAA=]"
      },
      "lla": {
        "event_name": "Ley-Line Anomaly",
        "duration_minutes": 15,
        "locations": [
          {
            "map": "Timberline Falls",
            "waypoint": "[&BH4BAAA=]",
            "utc_times": ["00:20", "06:20", "12:20", "18:20"]
          },
          {
            "map": "Iron Marches",
            "waypoint": "[&BHoAAAA=]",
            "utc_times": ["02:20", "08:20", "14:20", "20:20"]
          },
          {
            "map": "Gendarran Fields",
            "waypoint": "[&BEEAAAA=]",
            "utc_times": ["04:20", "10:20", "16:20", "22:20"]
          }
        ]
      },
      "ds_dragonstorm": {
        "event_name": "Dragonstorm",
        "location": "Eye of the North",
        "duration_minutes": 15,
        "utc_times": ["01:00", "03:00", "05:00", "07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
        "waypoint": "[&BPEHAAA=]"
      },
      "sb_shadow_behemoth": {
        "event_name": "Shadow Behemoth",
        "location": "Queensdale",
        "duration_minutes": 10,
        "utc_times": ["01:45", "03:45", "05:45", "07:45", "09:45", "11:45", "13:45", "15:45", "17:45", "19:45", "21:45", "23:45"],
        "waypoint": "[&BPcAAAA=]"
      },
      "gjw_great_jungle_wurm": {
        "event_name": "Great Jungle Wurm",
        "location": "Caledon Forest",
        "duration_minutes": 10,
        "utc_times": ["01:15", "03:15", "05:15", "07:15", "09:15", "11:15", "13:15", "15:15", "17:15", "19:15", "21:15", "23:15"],
        "waypoint": "[&BDAAAAA=]"
      },
      "coj_claw_of_jormag": {
        "event_name": "Claw of Jormag",
        "location": "Frostgorge Sound",
        "duration_minutes": 15,
        "utc_times": ["02:30", "05:30", "08:30", "11:30", "14:30", "17:30", "20:30", "23:30"],
        "waypoint": "[&BHMHAAA=]"
      },
      "ab_auric_basin": {
        "event_name": "Auric Basin Octovine",
        "location": "Auric Basin",
        "duration_minutes": 20,
        "utc_times": ["01:00", "03:00", "05:00", "07:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00", "23:00"],
        "waypoint": "[&BIMHAAA=]"
      }
    }
  }
};

// PSNA (Pact Supply Network Agent) helper functions
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
    0: "[&BIkHAAA=]",  // Sunday - Repair Station
    1: "[&BIcHAAA=]",  // Monday - Restoration Refuge
    2: "[&BH8HAAA=]",  // Tuesday - Camp Resolve
    3: "[&BH4HAAA=]",  // Wednesday - Town of Prosperity
    4: "[&BKsHAAA=]",  // Thursday - Blue Oasis
    5: "[&BJQHAAA=]",  // Friday - Repair Station
    6: "[&BH8HAAA=]"   // Saturday - Camp Resolve
  };
  
  const today = new Date().getDay();
  return psnaWaypoints[today];
}
