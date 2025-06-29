// Cache for port data to avoid repeated API calls
let cachedPorts: string[] = [];
let dataLoaded = false;

// Import official port list
import { OFFICIAL_NAVAL_ACTION_PORTS } from './official-ports';

// Naval Action port data interface
interface Port {
  Id: number;
  Name: string;
  Nation: number;
  sourcePosition: {
    x: number;
    y: number;
    z: number;
  };
}

// Function to load port data from Naval Action API
const loadPortData = async (): Promise<string[]> => {
  if (dataLoaded && cachedPorts.length > 0) {
    return cachedPorts;
  }

  try {
    // Try to load from the main PVP server first (most comprehensive data)
    const response = await fetch('https://storage.googleapis.com/nacleanopenworldprodshards/Ports_live.json');

    if (!response.ok) {
      throw new Error('Failed to load live server data');
    }

    const ports: Port[] = await response.json();
    cachedPorts = ports.map(port => port.Name).sort();
    dataLoaded = true;

    return cachedPorts;
  } catch (error) {
    console.warn('Failed to load live port data, falling back to official static list:', error);

    // Fallback to official static list (207 ports as of June 2025)
    cachedPorts = [...OFFICIAL_NAVAL_ACTION_PORTS];
    dataLoaded = true;
    return cachedPorts;
  }
};

// Main export function to get all ports
export const getAllPorts = async (): Promise<string[]> => {
  return await loadPortData();
};

// Legacy function for PortAutocomplete compatibility
export const getPortList = async (): Promise<string[]> => {
  return await loadPortData();
};

// Synchronous search function for PortAutocomplete
export const searchPortsSync = (query: string): string[] => {
  // Use cached data or fallback to official list
  const allPorts = cachedPorts.length > 0 ? cachedPorts : OFFICIAL_NAVAL_ACTION_PORTS;

  if (!query || query.trim() === '') {
    return allPorts.slice(0, 10); // Return first 10 for empty query
  }

  const searchTerm = query.toLowerCase().trim();

  return allPorts.filter(port =>
    port.toLowerCase().includes(searchTerm)
  ).sort((a, b) => {
    // Prioritize exact matches and starts-with matches
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    if (aLower === searchTerm) return -1;
    if (bLower === searchTerm) return 1;

    if (aLower.startsWith(searchTerm) && !bLower.startsWith(searchTerm)) return -1;
    if (bLower.startsWith(searchTerm) && !aLower.startsWith(searchTerm)) return 1;

    return a.localeCompare(b);
  }).slice(0, 20); // Limit to 20 results
};

// Function to search ports by name (case insensitive)
export const searchPorts = async (query: string): Promise<string[]> => {
  const allPorts = await loadPortData();

  if (!query || query.trim() === '') {
    return allPorts;
  }

  const searchTerm = query.toLowerCase().trim();

  return allPorts.filter(port =>
    port.toLowerCase().includes(searchTerm)
  ).sort((a, b) => {
    // Prioritize exact matches and starts-with matches
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    if (aLower === searchTerm) return -1;
    if (bLower === searchTerm) return 1;

    if (aLower.startsWith(searchTerm) && !bLower.startsWith(searchTerm)) return -1;
    if (bLower.startsWith(searchTerm) && !aLower.startsWith(searchTerm)) return 1;

    return a.localeCompare(b);
  });
};

// Function to get a specific port by name (exact match)
export const getPortByName = async (name: string): Promise<string | null> => {
  const allPorts = await loadPortData();
  return allPorts.find(port => port.toLowerCase() === name.toLowerCase()) || null;
};

// Function to validate if a port name exists
export const isValidPort = async (name: string): Promise<boolean> => {
  const port = await getPortByName(name);
  return port !== null;
};

// Export official ports for direct use
export { OFFICIAL_NAVAL_ACTION_PORTS };

// Commonly used port categories for filtering
export const PORT_CATEGORIES = {
  SPANISH_MAIN: [
    'Cartagena de Indias',
    'Santa Marta',
    'Maracaibo',
    'Coro',
    'Puerto Cabello',
    'Caracas',
    'Cumaná',
    'Trinidad'
  ],
  CARIBBEAN_ISLANDS: [
    'Kingston / Port Royal',
    'Port Antonio',
    'Nassau',
    'La Habana',
    'Santiago de Cuba',
    'Santo Domingo',
    'San Juan',
    'Bridgetown'
  ],
  GULF_OF_MEXICO: [
    'Nouvelle-Orléans',
    'Penzacola',
    'Campeche',
    'Vera Cruz',
    'Tampa',
    'Key West'
  ],
  LESSER_ANTILLES: [
    'Fort-Royal',
    'Basseterre Town',
    'Roseau',
    'Kingstown',
    'Saint George',
    'Pointe-à-Pitre'
  ]
};
