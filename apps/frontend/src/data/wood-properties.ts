// Wood properties based on Naval Action data
// Each wood has modifiers that affect ship characteristics

export interface WoodProperty {
  modifier: string;
  amount: number;
  isPercentage: boolean;
}

export interface Wood {
  name: string;
  type: 'frame' | 'planking';
  family: 'regular' | 'seasoned' | 'rare';
  properties: WoodProperty[];
}

// Wood data extracted from na-map repository
export const WOOD_DATA: Wood[] = [
  // Frame Woods
  {
    name: 'Fir',
    type: 'frame',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 0, isPercentage: true },
      { modifier: 'Hold weight', amount: 0, isPercentage: true },
    ]
  },
  {
    name: 'Oak',
    type: 'frame', 
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 0, isPercentage: true },
      { modifier: 'Hold weight', amount: 5, isPercentage: true },
      { modifier: 'Armour hit points', amount: 2, isPercentage: true },
    ]
  },
  {
    name: 'Live Oak',
    type: 'frame',
    family: 'regular', 
    properties: [
      { modifier: 'Max speed', amount: -2, isPercentage: true },
      { modifier: 'Hold weight', amount: 10, isPercentage: true },
      { modifier: 'Armour hit points', amount: 5, isPercentage: true },
    ]
  },
  {
    name: 'Teak',
    type: 'frame',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 1, isPercentage: true },
      { modifier: 'Hold weight', amount: 2, isPercentage: true },
      { modifier: 'Armour hit points', amount: 3, isPercentage: true },
    ]
  },
  {
    name: 'White Oak',
    type: 'frame',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: -1, isPercentage: true },
      { modifier: 'Hold weight', amount: 8, isPercentage: true },
      { modifier: 'Armour hit points', amount: 4, isPercentage: true },
    ]
  },
  {
    name: 'Mahogany',
    type: 'frame',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 2, isPercentage: true },
      { modifier: 'Hold weight', amount: -2, isPercentage: true },
      { modifier: 'Armour hit points', amount: 1, isPercentage: true },
    ]
  },
  {
    name: 'Sabicu',
    type: 'frame',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 3, isPercentage: true },
      { modifier: 'Hold weight', amount: -5, isPercentage: true },
      { modifier: 'Armour hit points', amount: 0, isPercentage: true },
    ]
  },
  {
    name: 'Locust',
    type: 'frame',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 4, isPercentage: true },
      { modifier: 'Hold weight', amount: -8, isPercentage: true },
      { modifier: 'Armour hit points', amount: -2, isPercentage: true },
    ]
  },
  
  // Planking/Trim Woods
  {
    name: 'Crew Space',
    type: 'planking',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 0, isPercentage: true },
      { modifier: 'Hold weight', amount: 0, isPercentage: true },
      { modifier: 'Crew', amount: 15, isPercentage: true },
    ]
  },
  {
    name: 'Oak',
    type: 'planking',
    family: 'regular', 
    properties: [
      { modifier: 'Max speed', amount: 0, isPercentage: true },
      { modifier: 'Hold weight', amount: 3, isPercentage: true },
      { modifier: 'Armour hit points', amount: 1, isPercentage: true },
    ]
  },
  {
    name: 'Fir',
    type: 'planking',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 1, isPercentage: true },
      { modifier: 'Hold weight', amount: -1, isPercentage: true },
    ]
  },
  {
    name: 'Teak',
    type: 'planking',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 2, isPercentage: true },
      { modifier: 'Hold weight', amount: 0, isPercentage: true },
      { modifier: 'Armour hit points', amount: 2, isPercentage: true },
    ]
  },
  {
    name: 'White Oak',
    type: 'planking',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: -1, isPercentage: true },
      { modifier: 'Hold weight', amount: 5, isPercentage: true },
      { modifier: 'Armour hit points', amount: 3, isPercentage: true },
    ]
  },
  {
    name: 'Mahogany',
    type: 'planking',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 3, isPercentage: true },
      { modifier: 'Hold weight', amount: -2, isPercentage: true },
    ]
  },
  {
    name: 'Sabicu',
    type: 'planking',
    family: 'regular',
    properties: [
      { modifier: 'Max speed', amount: 4, isPercentage: true },
      { modifier: 'Hold weight', amount: -3, isPercentage: true },
    ]
  }
];

// Helper functions for wood calculations
export const getWoodByName = (name: string, type: 'frame' | 'planking'): Wood | undefined => {
  return WOOD_DATA.find(wood => wood.name === name && wood.type === type);
};

export const calculateWoodModifiers = (frameName?: string, plankingName?: string): Record<string, number> => {
  const modifiers: Record<string, number> = {
    'Max speed': 0,
    'Hold weight': 0,
    'Armour hit points': 0,
    'Crew': 0
  };

  const frame = frameName ? getWoodByName(frameName, 'frame') : null;
  const planking = plankingName ? getWoodByName(plankingName, 'planking') : null;

  // Combine frame and planking modifiers
  [frame, planking].filter(Boolean).forEach(wood => {
    wood!.properties.forEach(property => {
      if (modifiers.hasOwnProperty(property.modifier)) {
        modifiers[property.modifier] += property.amount;
      }
    });
  });

  return modifiers;
};

export const applyWoodModifiers = (baseValue: number, modifier: number): number => {
  // Apply percentage modifiers (Naval Action style)
  return baseValue * (1 + modifier / 100);
};

// Speed cap as per na-map
export const MAX_SPEED_CAP = 20;

export const applyCaps = (value: number, modifier: string): number => {
  switch (modifier) {
    case 'Max speed':
      return Math.min(value, MAX_SPEED_CAP);
    default:
      return value;
  }
};
