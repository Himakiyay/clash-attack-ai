export const TOWN_HALL_DATA = {
  9: {
    bestAttacks: ["GoHo", "LavaLoon"],
    upgradePriority: ["Army Camps", "Heroes", "Spell Factory"],
    defenseWeaknesses: ["Poor Air Sweeper placement"]
  },
  10: {
    bestAttacks: ["Queen Walk Hybrid", "Bowler Witch"],
    upgradePriority: ["Inferno Towers", "Clan Castle", "Army Camps"],
    defenseWeaknesses: ["Multi-Infernos vs Hogs"]
  },
  11: {
    bestAttacks: ["Hybrid", "Electro Dragons"],
    upgradePriority: ["Eagle Artillery", "Heroes", "Army Camps"],
    defenseWeaknesses: ["Spread bases vs E-Drags"]
  }
};

export const ARMY_SYNERGY = {
  "Hogs": { strongAgainst: ["Single Inferno"], weakAgainst: ["Multi Inferno"] },
  "Miners": { strongAgainst: ["Eagle Artillery"], weakAgainst: ["Giant Bombs"] },
  "E-Drags": { strongAgainst: ["Compact Bases"], weakAgainst: ["Spread Bases"] },
  "Healers": { strongAgainst: ["Heroes"], weakAgainst: [] }
};
