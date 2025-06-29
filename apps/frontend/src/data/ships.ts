export interface Ship {
  name: string;
  rate: number;
  br: number;
}

export interface ShipConfiguration {
  shipName: string;
  brValue: number;
  frame?: string;
  planking?: string;
}

// Frame options available in Naval Action
export const FRAME_OPTIONS = [
  'African Oak',
  'African Teak',
  'Bermuda Cedar (S)',
  'Bermuda Cedar',
  'Danzic Oak',
  'Fir (S)',
  'Fir',
  'Greenheart',
  'Italian Larch',
  'Live Oak (S)',
  'Live Oak',
  'Locust (S)',
  'Locust',
  'Mahogany (S)',
  'Mahogany',
  'Malabar Teak',
  'Moulmein Teak',
  'New England Fir',
  'Oak (S)',
  'Oak',
  'Rangoon Teak',
  'Riga Fir',
  'Sabicu (S)',
  'Sabicu',
  'Teak (S)',
  'Teak',
  'Virginia Pine',
  'White Oak (S)',
  'White Oak'
];

// Planking options available in Naval Action
export const PLANKING_OPTIONS = [
  'African Teak',
  'Bermuda Cedar (S)',
  'Bermuda Cedar',
  'Danzic Fir',
  'Danzic Oak',
  'Fir (S)',
  'Fir',
  'Italian Larch',
  'Mahogany (S)',
  'Mahogany',
  'Malabar Teak',
  'Moulmein Teak',
  'New England Fir',
  'Oak (S)',
  'Oak',
  'Rangoon Teak',
  'Riga Fir',
  'Sabicu (S)',
  'Sabicu',
  'Teak (S)',
  'Teak',
  'Virginia Pine',
  'White Oak (S)',
  'White Oak',
  'Crew Space'
];

export const NAVAL_ACTION_SHIPS: Ship[] = [
  // 1st Rate Ships
  { name: 'Duke Of Kent', rate: 1, br: 353 },
  { name: 'Santísima Trinidad', rate: 1, br: 278 },
  { name: 'L\'Océan', rate: 1, br: 239 },
  { name: 'Santa Ana', rate: 1, br: 225 },
  { name: 'Victory 1765 (i)', rate: 1, br: 224 },
  { name: 'Victory', rate: 1, br: 216 },

  // 2nd Rate Ships
  { name: 'San Pedro', rate: 2, br: 164 },
  { name: 'Christian', rate: 2, br: 164 },
  { name: 'Implacable', rate: 2, br: 163 },
  { name: 'Le Bucentaure', rate: 2, br: 161 },
  { name: 'St. Pavel', rate: 2, br: 150 },
  { name: 'Redoutable (i)', rate: 2, br: 149 },

  // 3rd Rate Ships
  { name: 'Admiraal de Ruyter', rate: 3, br: 143 },
  { name: 'Bellona', rate: 3, br: 133 },
  { name: '3rd Rate', rate: 3, br: 132 },
  { name: 'Wapen von Hamburg', rate: 3, br: 119 },
  { name: 'Wasa', rate: 3, br: 116 },
  { name: 'Agamemnon', rate: 3, br: 114 },
  { name: 'Ingermanland', rate: 3, br: 110 },
  { name: 'Rättvisan (i)', rate: 3, br: 107 },

  // 4th Rate Ships
  { name: 'USS United States', rate: 4, br: 96 },
  { name: 'Constitution', rate: 4, br: 96 },
  { name: 'Leopard (i)', rate: 4, br: 95 },

  // 5th Rate Ships
  { name: 'Trincomalee', rate: 5, br: 87 },
  { name: 'Endymion', rate: 5, br: 85 },
  { name: 'Indefatigable', rate: 5, br: 79 },
  { name: 'Diana', rate: 5, br: 78 },
  { name: 'L\'Hermione (i)', rate: 5, br: 72 },
  { name: 'Santa Cecilia', rate: 5, br: 72 },
  { name: 'Essex', rate: 5, br: 70 },
  { name: 'Pirate Frigate', rate: 5, br: 67 },
  { name: 'Frigate', rate: 5, br: 67 },
  { name: 'La Belle-Poule', rate: 5, br: 65 },
  { name: 'Pandora (i)', rate: 5, br: 65 },
  { name: 'Surprise', rate: 5, br: 64 },
  { name: 'Hercules (i)', rate: 5, br: 58 },
  { name: 'Galleon (i)', rate: 5, br: 50 },
  { name: 'Le Gros Ventre Refit', rate: 5, br: 40 },
  { name: 'La Renommée', rate: 5, br: 38 },
  { name: 'Indiaman', rate: 5, br: 37 },
  { name: 'Cerberus', rate: 5, br: 33 },
  { name: 'Rattlesnake Heavy', rate: 5, br: 32 },
  { name: 'Le Requin (i)', rate: 5, br: 30 },

  // 6th Rate Ships
  { name: 'Snow', rate: 6, br: 27 },
  { name: 'Trader Snow', rate: 6, br: 27 },
  { name: 'Le Gros Ventre', rate: 6, br: 25 },
  { name: 'Niagara', rate: 6, br: 25 },
  { name: 'Prince de Neufchâtel', rate: 6, br: 25 },
  { name: 'Mercury', rate: 6, br: 25 },
  { name: 'Rattlesnake', rate: 6, br: 22 },
  { name: 'Navy Brig', rate: 6, br: 22 },
  { name: 'Brig', rate: 6, br: 20 },
  { name: 'Trader Brig', rate: 6, br: 19 },

  // Small Ships
  { name: 'Mortar Brig', rate: 7, br: 15 },
  { name: 'Pickle', rate: 7, br: 15 },
  { name: 'Yacht (i)', rate: 7, br: 15 },
  { name: 'Privateer', rate: 7, br: 15 },
  { name: 'Cutter', rate: 7, br: 15 },
  { name: 'Trader Cutter', rate: 7, br: 14 },
  { name: 'Lynx', rate: 7, br: 13 },
  { name: 'Trader Lynx', rate: 7, br: 13 }
];

// Get ship by name
export const getShipByName = (name: string): Ship | undefined => {
  return NAVAL_ACTION_SHIPS.find(ship => ship.name === name);
};

// Search ships by name
export const searchShips = (query: string): Ship[] => {
  if (!query || query.length < 2) return [];

  const searchTerm = query.toLowerCase();
  return NAVAL_ACTION_SHIPS.filter(ship =>
    ship.name.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
};

// Get ships by rate
export const getShipsByRate = (rate: number): Ship[] => {
  return NAVAL_ACTION_SHIPS.filter(ship => ship.rate === rate);
};

// Calculate total BR for a list of ships
export const calculateTotalBR = (ships: string[]): number => {
  return ships.reduce((total, shipName) => {
    const ship = getShipByName(shipName);
    return total + (ship?.br || 0);
  }, 0);
};
