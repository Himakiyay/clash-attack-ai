// Complete Clash of Clans Data for TH1-18

export const ELIXIR_TROOPS = [
  "Barbarian", "Archer", "Giant", "Goblin", "Wall Breaker",
  "Balloon", "Wizard", "Healer", "Dragon", "P.E.K.K.A",
  "Baby Dragon", "Miner", "Electro Dragon", "Yeti", "Dragon Rider",
  "Electro Titan", "Root Rider", "Thrower", "Meteor Golem"
];

export const DARK_TROOPS = [
  "Minion", "Hog Rider", "Valkyrie", "Golem", "Witch",
  "Lava Hound", "Bowler", "Ice Golem", "Headhunter",
  "Apprentice Warden", "Druid", "Furnace"
];

export const HEROES = [
  "Barbarian King", "Archer Queen", "Grand Warden", 
  "Royal Champion", "Minion Prince"
];

export const HERO_PETS = [
  "L.A.S.S.I", "Electro Owl", "Mighty Yak", "Unicorn",
  "Frosty", "Diggy", "Poison Lizard", "Phoenix",
  "Spirit Fox", "Angry Jelly", "Hog Puppet", "Sneezy"
];

export const ALL_SPELLS = [
  "Lightning", "Healing", "Rage", "Jump", 
  "Freeze", "Clone", "Invisibility", "Recall",
  "Poison", "Earthquake", "Haste", 
  "Skeleton", "Bat", "Overgrowth"
];

export const SIEGE_MACHINES = [
  "Wall Wrecker", "Battle Blimp", "Stone Slammer",
  "Siege Barracks", "Log Launcher", "Flame Flinger", "Battle Drill"
];

// Meta attack strategies by Town Hall (2025 Meta)
export const TOWN_HALL_DATA = {
  1: {
    bestAttacks: ["Barbarian Rush"],
    upgradePriority: ["Army Camps", "Barracks"],
    metaComps: [
      { name: "All Barbarians", troops: ["Barbarian"] }
    ]
  },
  2: {
    bestAttacks: ["Barbarian + Archer"],
    upgradePriority: ["Army Camps", "Barracks", "Archer Tower"],
    metaComps: [
      { name: "Barch", troops: ["Barbarian", "Archer"] }
    ]
  },
  3: {
    bestAttacks: ["Giant Healer"],
    upgradePriority: ["Army Camps", "Giants", "Air Defense"],
    metaComps: [
      { name: "Giant Healer", troops: ["Giant", "Healer", "Archer"] }
    ]
  },
  4: {
    bestAttacks: ["Giant Healer", "Dragon Rush"],
    upgradePriority: ["Laboratory", "Army Camps", "Spell Factory"],
    metaComps: [
      { name: "Mass Dragons", troops: ["Dragon"], spells: ["Rage"] }
    ]
  },
  5: {
    bestAttacks: ["Dragon Rush", "Giant Wizard"],
    upgradePriority: ["Spell Factory", "Laboratory", "Wizards"],
    metaComps: [
      { name: "DragonLoon", troops: ["Dragon", "Balloon"], spells: ["Rage", "Lightning"] }
    ]
  },
  6: {
    bestAttacks: ["Dragon Rush", "Giant Healer Wiz"],
    upgradePriority: ["Spell Factory", "Clan Castle", "Laboratory"],
    metaComps: [
      { name: "Mass Dragons", troops: ["Dragon"], spells: ["Rage", "Lightning", "Healing"] }
    ]
  },
  7: {
    bestAttacks: ["Dragon Rush", "HogRider"],
    upgradePriority: ["Barbarian King", "Dark Spell Factory", "Dragons"],
    heroes: ["Barbarian King"],
    metaComps: [
      { name: "Mass Dragons", troops: ["Dragon"], spells: ["Lightning", "Rage"], heroes: ["Barbarian King"] },
      { name: "HogRider", troops: ["Hog Rider", "Wizard"], spells: ["Healing"], heroes: ["Barbarian King"] }
    ]
  },
  8: {
    bestAttacks: ["GoHo", "Dragon Rush"],
    upgradePriority: ["Barbarian King", "P.E.K.K.A", "Golems", "Hog Riders"],
    heroes: ["Barbarian King"],
    metaComps: [
      { name: "GoHo", troops: ["Golem", "Hog Rider", "Wizard", "Valkyrie"], spells: ["Healing", "Poison"], heroes: ["Barbarian King"] }
    ]
  },
  9: {
    bestAttacks: ["GoHo", "LavaLoon", "Queen Walk Healer"],
    upgradePriority: ["Archer Queen", "Barbarian King", "Army Camps", "Spell Factory"],
    heroes: ["Barbarian King", "Archer Queen"],
    defenseWeaknesses: ["Poor Air Sweeper placement", "Centralized Air Defenses"],
    metaComps: [
      { name: "GoHo", troops: ["Golem", "Hog Rider", "Wizard"], spells: ["Healing", "Poison"], heroes: ["Barbarian King", "Archer Queen"] },
      { name: "LavaLoon", troops: ["Lava Hound", "Balloon", "Minion"], spells: ["Rage", "Haste"], heroes: ["Barbarian King", "Archer Queen"] }
    ]
  },
  10: {
    bestAttacks: ["Queen Walk Hybrid", "Bowler Witch", "Miner Hog"],
    upgradePriority: ["Inferno Towers", "Archer Queen", "Clan Castle", "Army Camps"],
    heroes: ["Barbarian King", "Archer Queen"],
    defenseWeaknesses: ["Multi-Infernos vulnerable to Hogs", "Exposed Eagle Artillery"],
    metaComps: [
      { name: "Queen Walk Hybrid", troops: ["Miner", "Hog Rider", "Healer"], spells: ["Healing", "Rage"], heroes: ["Barbarian King", "Archer Queen"] },
      { name: "Bowler Witch", troops: ["Bowler", "Witch", "Healer"], spells: ["Jump", "Rage"], heroes: ["Barbarian King", "Archer Queen"] }
    ]
  },
  11: {
    bestAttacks: ["Hybrid", "Electro Dragons", "Queen Charge Lalo"],
    upgradePriority: ["Eagle Artillery", "Grand Warden", "Archer Queen", "Army Camps"],
    heroes: ["Barbarian King", "Archer Queen", "Grand Warden"],
    defenseWeaknesses: ["Spread bases vs E-Drags", "Single Infernos vs Queen Charge"],
    metaComps: [
      { name: "Hybrid", troops: ["Miner", "Hog Rider"], spells: ["Healing", "Freeze"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden"] },
      { name: "E-Drag Spam", troops: ["Electro Dragon", "Balloon"], spells: ["Rage", "Freeze"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden"] }
    ]
  },
  12: {
    bestAttacks: ["Yeti Smash", "Hybrid", "Queen Charge Hybrid"],
    upgradePriority: ["Heroes", "Siege Workshop", "Electro Dragons"],
    heroes: ["Barbarian King", "Archer Queen", "Grand Warden"],
    siegeMachines: ["Wall Wrecker", "Siege Barracks"],
    metaComps: [
      { name: "Yeti Smash", troops: ["Yeti", "Bowler", "Wizard"], spells: ["Rage", "Freeze", "Jump"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden"], siege: ["Wall Wrecker"] }
    ]
  },
  13: {
    bestAttacks: ["Hybrid", "Yeti Smash", "Queen Charge Hybrid"],
    upgradePriority: ["Royal Champion", "Heroes", "Scattershot"],
    heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"],
    siegeMachines: ["Log Launcher", "Wall Wrecker"],
    metaComps: [
      { name: "Hybrid", troops: ["Miner", "Hog Rider"], spells: ["Healing", "Freeze"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"], siege: ["Log Launcher"] }
    ]
  },
  14: {
    bestAttacks: ["Hybrid", "Super Witch Smash", "Queen Charge Lalo"],
    upgradePriority: ["Heroes", "Pet House", "Army Camps"],
    heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"],
    pets: ["Phoenix", "Unicorn", "Electro Owl", "Frosty"],
    metaComps: [
      { name: "Hybrid", troops: ["Miner", "Hog Rider"], spells: ["Healing", "Freeze"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"], pets: ["Phoenix", "Unicorn"] }
    ]
  },
  15: {
    bestAttacks: ["RC Charge Mass Dragons", "Super Yeti Smash", "Hybrid", "Electro Dragons"],
    upgradePriority: ["Royal Champion", "Archer Queen", "Grand Warden", "Spell Factory"],
    heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"],
    pets: ["Phoenix", "Unicorn", "Electro Owl", "Frosty", "Angry Jelly"],
    metaComps: [
      { name: "RC Charge Mass Dragons", troops: ["Dragon", "Balloon"], spells: ["Invisibility", "Rage", "Freeze"], heroes: ["Archer Queen", "Grand Warden", "Royal Champion"], pets: ["Electro Owl", "Phoenix"] },
      { name: "Super Yeti Smash", troops: ["Yeti", "Balloon", "Wizard"], spells: ["Rage", "Freeze", "Jump"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden"], pets: ["Phoenix", "Frosty"] }
    ]
  },
  16: {
    bestAttacks: ["Warden Charge Rocket Balloons", "Mass Electro Dragons", "Queen Charge Hybrid"],
    upgradePriority: ["Heroes", "Monolith", "Eagle Artillery"],
    heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"],
    pets: ["Phoenix", "Unicorn", "Electro Owl", "Diggy", "Hog Puppet"],
    metaComps: [
      { name: "Warden Charge Rocket Balloons", troops: ["Balloon", "Minion"], spells: ["Rage", "Freeze", "Haste"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"], pets: ["Electro Owl", "Hog Puppet"] },
      { name: "Mass E-Drags", troops: ["Electro Dragon", "Balloon"], spells: ["Rage", "Freeze"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"], pets: ["Phoenix", "Unicorn"] }
    ]
  },
  17: {
    bestAttacks: ["Root Rider Smash", "Queen Charge Hydra", "Dragon Rider Push"],
    upgradePriority: ["Minion Prince", "Heroes", "Root Riders"],
    heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion", "Minion Prince"],
    pets: ["Phoenix", "Unicorn", "Electro Owl", "Angry Jelly", "Sneezy"],
    metaComps: [
      { name: "Double OG Root Riders", troops: ["Root Rider", "Wizard", "Archer"], spells: ["Overgrowth", "Rage", "Freeze"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion", "Minion Prince"], pets: ["Angry Jelly", "Phoenix"] }
    ]
  },
  18: {
    bestAttacks: ["Fireball Meteor Golem", "Hydra", "RC Walk Dragons"],
    upgradePriority: ["Heroes", "Meteor Golems", "Army Camps"],
    heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion", "Minion Prince"],
    pets: ["Phoenix", "Unicorn", "Electro Owl", "Angry Jelly", "Sneezy", "Hog Puppet"],
    metaComps: [
      { name: "Fireball Meteor Golem", troops: ["Meteor Golem", "Wizard", "Balloon"], spells: ["Rage", "Freeze", "Jump"], heroes: ["Barbarian King", "Archer Queen", "Grand Warden", "Royal Champion"], pets: ["Angry Jelly", "Phoenix"] },
      { name: "Hydra", troops: ["Dragon Rider", "Electro Dragon", "Balloon"], spells: ["Rage", "Freeze"], heroes: ["All"], pets: ["Electro Owl", "Phoenix"] }
    ]
  }
};

// Troop synergy data
export const TROOP_SYNERGY = {
  "Hog Rider": { 
    strongAgainst: ["Single Inferno", "Ground-focused bases"], 
    weakAgainst: ["Multi Inferno", "Giant Bombs"],
    synergizesWith: ["Healer", "Miner"]
  },
  "Miner": { 
    strongAgainst: ["Eagle Artillery", "Compartmentalized bases"], 
    weakAgainst: ["Giant Bombs", "Skeleton Traps"],
    synergizesWith: ["Hog Rider"]
  },
  "Electro Dragon": { 
    strongAgainst: ["Compact Bases", "Low-level Air Defenses"], 
    weakAgainst: ["Spread Bases", "High-level Air Defenses"],
    synergizesWith: ["Balloon", "Dragon Rider"]
  },
  "Healer": { 
    strongAgainst: ["Single-target defenses"], 
    weakAgainst: ["Air Defenses", "Multi-target defenses"],
    synergizesWith: ["Hog Rider", "Archer Queen", "Barbarian King"]
  },
  "Dragon": {
    strongAgainst: ["Low-level air defenses", "Compact bases"],
    weakAgainst: ["Air Sweepers", "Spread bases"],
    synergizesWith: ["Balloon", "Rage"]
  },
  "Balloon": {
    strongAgainst: ["Point defenses", "Wizard Towers"],
    weakAgainst: ["Air Defenses", "Seeking Air Mines"],
    synergizesWith: ["Lava Hound", "Dragon", "Haste"]
  },
  "Lava Hound": {
    strongAgainst: ["Air Defenses"],
    weakAgainst: ["Inferno Towers"],
    synergizesWith: ["Balloon", "Minion"]
  },
  "Yeti": {
    strongAgainst: ["Core defenses", "Splash damage"],
    weakAgainst: ["Scattershots", "Spread layouts"],
    synergizesWith: ["Bowler", "Wizard", "Jump"]
  },
  "Root Rider": {
    strongAgainst: ["Compartmentalized bases"],
    weakAgainst: ["Spread defenses"],
    synergizesWith: ["Overgrowth", "Archer Queen"]
  },
  "Meteor Golem": {
    strongAgainst: ["Grouped defenses"],
    weakAgainst: ["Spread layouts"],
    synergizesWith: ["Rage", "Grand Warden"]
  }
};

// Hero-Pet optimal pairings (2025 Meta)
export const HERO_PET_COMBOS = {
  "Barbarian King": ["Phoenix", "Frosty", "Mighty Yak"],
  "Archer Queen": ["Unicorn", "Phoenix"],
  "Grand Warden": ["Electro Owl", "Poison Lizard", "Phoenix"],
  "Royal Champion": ["Hog Puppet", "Angry Jelly", "Phoenix"],
  "Minion Prince": ["Angry Jelly", "Sneezy", "Electro Owl"]
};