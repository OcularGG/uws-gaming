export interface PerkLevel {
  level: number;
  cost: number;
}

export interface Perk {
  name: string;
  levels: PerkLevel[];
  maxLevel: number;
}

// Standard perks with 5 levels
const STANDARD_PERKS: string[] = [
  'Gunnery',
  'Gunpowder',
  'Maneuver',
  'Mast Reinforcement',
  'Repair Control',
  'Sail Reinforcement',
  'Sail Trim',
  'Sailmaster',
  'Seamanship',
  'Survival',
  'Yard Trim',
  'Carpenter'
];

// Create standard perk objects
const createStandardPerk = (name: string): Perk => ({
  name,
  maxLevel: 5,
  levels: [
    { level: 1, cost: 1 },
    { level: 2, cost: 3 },
    { level: 3, cost: 6 },
    { level: 4, cost: 13 },
    { level: 5, cost: 30 }
  ]
});

// Special perks with custom levels and costs
const SPECIAL_PERKS: Perk[] = [
  {
    name: 'Bravery',
    maxLevel: 2,
    levels: [
      { level: 1, cost: 1 },
      { level: 2, cost: 3 }
    ]
  },
  {
    name: 'Fleet Control',
    maxLevel: 2,
    levels: [
      { level: 1, cost: 1 },
      { level: 2, cost: 3 }
    ]
  },
  {
    name: 'Brawler',
    maxLevel: 1,
    levels: [
      { level: 1, cost: 15 }
    ]
  },
  {
    name: 'Combat Repairs',
    maxLevel: 1,
    levels: [
      { level: 1, cost: 5 }
    ]
  },
  {
    name: 'Merchant',
    maxLevel: 1,
    levels: [
      { level: 1, cost: 5 }
    ]
  },
  {
    name: 'Mortar Officer',
    maxLevel: 1,
    levels: [
      { level: 1, cost: 15 }
    ]
  },
  {
    name: 'Privateer',
    maxLevel: 1,
    levels: [
      { level: 1, cost: 15 }
    ]
  },
  {
    name: 'Sextant',
    maxLevel: 1,
    levels: [
      { level: 1, cost: 1 }
    ]
  },
  {
    name: 'Sniper',
    maxLevel: 1,
    levels: [
      { level: 1, cost: 15 }
    ]
  }
];

// All available perks
export const ALL_PERKS: Perk[] = [
  ...STANDARD_PERKS.map(createStandardPerk),
  ...SPECIAL_PERKS
].sort((a, b) => a.name.localeCompare(b.name));

// Perk selection interface
export interface PerkSelection {
  perkName: string;
  level: number;
}

// Constants
export const MAX_PERK_POINTS = 100;
export const MAX_PERK_SLOTS = 5;

// Helper functions
export const getPerkByName = (name: string): Perk | undefined => {
  return ALL_PERKS.find(perk => perk.name === name);
};

export const calculatePerkCost = (perkName: string, level: number): number => {
  const perk = getPerkByName(perkName);
  if (!perk) return 0;
  
  const perkLevel = perk.levels.find(l => l.level === level);
  return perkLevel ? perkLevel.cost : 0;
};

export const calculateTotalPerkCost = (selections: PerkSelection[]): number => {
  return selections.reduce((total, selection) => {
    return total + calculatePerkCost(selection.perkName, selection.level);
  }, 0);
};

export const getRemainingPoints = (selections: PerkSelection[]): number => {
  return MAX_PERK_POINTS - calculateTotalPerkCost(selections);
};

export const getRemainingSlots = (selections: PerkSelection[]): number => {
  return MAX_PERK_SLOTS - selections.filter(s => s.perkName && s.level > 0).length;
};

export const canAffordPerk = (selections: PerkSelection[], perkName: string, level: number): boolean => {
  const cost = calculatePerkCost(perkName, level);
  const remaining = getRemainingPoints(selections);
  return cost <= remaining;
};

export const getAvailablePerks = (selections: PerkSelection[]): string[] => {
  const selectedPerkNames = selections.map(s => s.perkName).filter(Boolean);
  return ALL_PERKS.map(p => p.name).filter(name => !selectedPerkNames.includes(name));
};
