'use client'

import { useState } from 'react'

interface Ship {
  name: string
  rate: string
  br: number
  guns?: number
  crew?: { min: number, max: number }
}

interface Cannon {
  name: string
  type: 'long' | 'medium' | 'carronade' | 'special'
  size: number
}

interface Upgrade {
  name: string
  category: 'hull' | 'rigging' | 'gunnery' | 'crew'
  description?: string
}

interface Resource {
  name: string
  category: 'basic' | 'rare' | 'crafting'
  description?: string
}

interface Port {
  name: string
  nation: string
  waterType: 'Deep Water' | 'Shallow Water'
}

// Static data based on the Port Battle ship list and BR values provided
const SHIPS_DATA: Ship[] = [
  // 1st Rates
  { name: 'Santisima', rate: '1st', br: 278, guns: 112 },
  { name: "L'Ocean", rate: '1st', br: 239, guns: 118 },
  { name: 'Santa Ana', rate: '1st', br: 225, guns: 112 },
  
  // 2nd Rates  
  { name: 'Victory', rate: '2nd', br: 216, guns: 104 },
  { name: 'DLC Victory', rate: '2nd', br: 224, guns: 104 },
  { name: 'Christian VII', rate: '2nd', br: 164, guns: 80 },
  { name: 'Bucentaure', rate: '2nd', br: 161, guns: 80 },
  { name: 'Redoutable', rate: '2nd', br: 148, guns: 74 },
  { name: 'Implacable', rate: '2nd', br: 163, guns: 74 },
  { name: 'St. Pavel', rate: '2nd', br: 150, guns: 74 },
  
  // 3rd Rates
  { name: 'Bellona', rate: '3rd', br: 134, guns: 74 },
  { name: '3rd Rate (74)', rate: '3rd', br: 132, guns: 74 },
  { name: 'Wasa', rate: '3rd', br: 125, guns: 64 },
  { name: 'Agamemnon', rate: '3rd', br: 114, guns: 64 },
  { name: 'Ingermanland', rate: '3rd', br: 111, guns: 66 },
  { name: 'Wapen von Hamburg III', rate: '3rd', br: 120, guns: 64 },
  { name: 'Rättvisan', rate: '3rd', br: 107, guns: 64 },
  
  // 4th Rates
  { name: 'USS United States (previously Constitution)', rate: '4th', br: 96, guns: 44 },
  { name: 'Constitution (previously classic)', rate: '4th', br: 96, guns: 44 },
  { name: 'Leopard', rate: '4th', br: 95, guns: 50 },
  { name: 'Endymion', rate: '4th', br: 85, guns: 40 },
  { name: 'Trincomalee', rate: '4th', br: 87, guns: 46 },
  
  // 5th Rates
  { name: 'Indefatigable', rate: '5th', br: 79, guns: 44 },
  { name: 'Diana', rate: '5th', br: 78, guns: 38 },
  { name: "L'Hermione", rate: '5th', br: 72, guns: 32 },
  { name: 'Santa Cecilia', rate: '5th', br: 72, guns: 36 },
  { name: 'Essex', rate: '5th', br: 71, guns: 32 },
  { name: 'Pirate Frigate(Cherubim)', rate: '5th', br: 67, guns: 36 },
  { name: 'Belle Poule', rate: '5th', br: 65, guns: 30 },
  { name: 'Frigate (Cherubim)', rate: '5th', br: 66, guns: 36 },
  { name: 'Surprise', rate: '5th', br: 64, guns: 28 },
  { name: 'Hercules', rate: '5th', br: 58, guns: 32 },
  
  // 6th Rates
  { name: 'Pandora', rate: '6th', br: 65, guns: 24 },
  { name: 'LGV Refit', rate: '6th', br: 40, guns: 18 },
  { name: 'Renommee', rate: '6th', br: 38, guns: 26 },
  { name: 'Cerberus', rate: '6th', br: 33, guns: 32 },
  { name: 'Rattlesnake Heavy', rate: '6th', br: 32, guns: 20 },
  { name: 'Le Requin', rate: '6th', br: 30, guns: 20 },
  { name: 'Le Gros Ventre', rate: '6th', br: 28, guns: 26 },
  
  // 7th Rates & Specialists
  { name: 'Snow (Ontario)', rate: '7th', br: 27, guns: 22 },
  { name: 'Trader Snow', rate: '7th', br: 26, guns: 16 },
  { name: 'Niagara', rate: '7th', br: 25, guns: 20 },
  { name: 'Prince de Neufchatel', rate: '7th', br: 25, guns: 16 },
  { name: 'Mercury', rate: '7th', br: 25, guns: 24 },
  { name: 'Rattlesnake', rate: '7th', br: 22, guns: 20 },
  { name: 'Navy Brig (Fair American)', rate: '7th', br: 22, guns: 18 },
  { name: 'Brig (Fair American)', rate: '7th', br: 20, guns: 18 },
  { name: 'Mortar Brig', rate: 'specialist', br: 15, guns: 15 },
  { name: 'Pickle', rate: '7th', br: 15, guns: 10 },
  { name: 'Yacht', rate: 'specialist', br: 15, guns: 12 },
  { name: 'Privateer', rate: '7th', br: 15, guns: 14 },
  { name: 'Cutter (Alert)', rate: '7th', br: 15, guns: 14 },
  { name: 'Trader Lynx', rate: '7th', br: 13, guns: 6 },
  { name: 'Lynx', rate: '7th', br: 13, guns: 6 },
  { name: 'Indiaman', rate: 'specialist', br: 37, guns: 26 },
  { name: 'ADR', rate: 'specialist', br: 143, guns: 0 },
  { name: 'Duke Of Kent', rate: 'specialist', br: 353, guns: 0 },
  { name: 'San Pedro', rate: 'specialist', br: 164, guns: 0 }
]

// Sample cannons data
const CANNONS_DATA: Cannon[] = [
  { name: '42pd Long Gun', type: 'long', size: 42 },
  { name: '32pd Long Gun', type: 'long', size: 32 },
  { name: '24pd Long Gun', type: 'long', size: 24 },
  { name: '18pd Long Gun', type: 'long', size: 18 },
  { name: '12pd Long Gun', type: 'long', size: 12 },
  { name: '9pd Long Gun', type: 'long', size: 9 },
  { name: '6pd Long Gun', type: 'long', size: 6 },
  { name: '4pd Long Gun', type: 'long', size: 4 },
  
  { name: '32pd Medium Gun', type: 'medium', size: 32 },
  { name: '24pd Medium Gun', type: 'medium', size: 24 },
  { name: '18pd Medium Gun', type: 'medium', size: 18 },
  { name: '12pd Medium Gun', type: 'medium', size: 12 },
  { name: '9pd Medium Gun', type: 'medium', size: 9 },
  { name: '6pd Medium Gun', type: 'medium', size: 6 },
  
  { name: '68pd Carronade', type: 'carronade', size: 68 },
  { name: '42pd Carronade', type: 'carronade', size: 42 },
  { name: '32pd Carronade', type: 'carronade', size: 32 },
  { name: '24pd Carronade', type: 'carronade', size: 24 },
  { name: '18pd Carronade', type: 'carronade', size: 18 },
  { name: '12pd Carronade', type: 'carronade', size: 12 },
  
  { name: '13" Mortar', type: 'special', size: 0 },
  { name: 'Congreve Rocket', type: 'special', size: 0 }
]

// Sample upgrades data
const UPGRADES_DATA: Upgrade[] = [
  // Hull upgrades
  { name: 'Copper Plating', category: 'hull', description: 'Reduces fouling and increases speed' },
  { name: 'Additional Planking', category: 'hull', description: 'Increases hull HP' },
  { name: 'Iron Bracings', category: 'hull', description: 'Increases structure' },
  { name: 'Sailing Crew', category: 'hull', description: 'Improves sailing performance' },
  { name: 'Reinforced Hull', category: 'hull', description: 'Extra protection against damage' },
  
  // Rigging upgrades
  { name: 'Navy Sails', category: 'rigging', description: 'Improved sail efficiency' },
  { name: 'Additional Stay Sails', category: 'rigging', description: 'Better acceleration' },
  { name: 'Fine Cordage', category: 'rigging', description: 'Improved turning' },
  { name: 'Admiralty Compass', category: 'rigging', description: 'Better navigation' },
  { name: 'Rigging Refit', category: 'rigging', description: 'Overall rigging improvement' },
  
  // Gunnery upgrades
  { name: 'Naval Gunnery', category: 'gunnery', description: 'Improved gun accuracy' },
  { name: 'Gunpowder', category: 'gunnery', description: 'Increased damage' },
  { name: 'Cartridges', category: 'gunnery', description: 'Faster reload' },
  { name: 'Marines', category: 'gunnery', description: 'Better boarding and musket fire' },
  { name: 'Boarding Axes', category: 'gunnery', description: 'Improved boarding attack' },
  
  // Crew upgrades
  { name: 'Surgery', category: 'crew', description: 'Faster crew repair' },
  { name: 'Hammocks', category: 'crew', description: 'Improved crew capacity' },
  { name: 'Provisions', category: 'crew', description: 'Extended sailing range' },
  { name: 'Rum Ration', category: 'crew', description: 'Crew morale bonus' },
  { name: 'Crafting Tools', category: 'crew', description: 'Repair modules at sea' }
]

// Sample resources data
const RESOURCES_DATA: Resource[] = [
  // Basic resources
  { name: 'Oak', category: 'basic', description: 'Primary wood for shipbuilding' },
  { name: 'Iron', category: 'basic', description: 'Essential metal for cannons and fittings' },
  { name: 'Hemp', category: 'basic', description: 'Used for ropes and sails' },
  { name: 'Cotton', category: 'basic', description: 'Alternative sail material' },
  { name: 'Provisions', category: 'basic', description: 'Food and supplies for crew' },
  
  // Rare resources
  { name: 'Teak', category: 'rare', description: 'Premium wood with superior properties' },
  { name: 'Live Oak', category: 'rare', description: 'Extremely durable American wood' },
  { name: 'White Oak', category: 'rare', description: 'High-quality European oak' },
  { name: 'Sabicu', category: 'rare', description: 'Tropical hardwood' },
  { name: 'Copper', category: 'rare', description: 'For hull plating and fittings' },
  
  // Crafting materials
  { name: 'Coal', category: 'crafting', description: 'Fuel for forges' },
  { name: 'Saltpeter', category: 'crafting', description: 'Gunpowder ingredient' },
  { name: 'Charcoal', category: 'crafting', description: 'Smelting fuel' },
  { name: 'Tar', category: 'crafting', description: 'Ship maintenance' },
  { name: 'Pitch', category: 'crafting', description: 'Waterproofing material' }
]

// Sample ports data based on common Naval Action ports
const PORTS_DATA: Port[] = [
  { name: 'Kingston', nation: 'Great Britain', waterType: 'Deep Water' },
  { name: 'Havana', nation: 'Spain', waterType: 'Deep Water' },
  { name: 'Cartagena', nation: 'Spain', waterType: 'Shallow Water' },
  { name: 'Port Royal', nation: 'Great Britain', waterType: 'Shallow Water' },
  { name: 'Charleston', nation: 'United States', waterType: 'Deep Water' },
  { name: 'New Orleans', nation: 'United States', waterType: 'Shallow Water' },
  { name: 'Cap Francais', nation: 'France', waterType: 'Deep Water' },
  { name: 'Fort Royal', nation: 'France', waterType: 'Shallow Water' },
  { name: 'Willemstad', nation: 'Dutch', waterType: 'Deep Water' },
  { name: 'La Tortue', nation: 'Pirates', waterType: 'Shallow Water' },
  { name: 'Nassau', nation: 'Pirates', waterType: 'Deep Water' },
  { name: 'Christiansted', nation: 'Denmark', waterType: 'Shallow Water' }
]

export default function NavalActionDataPage() {
  const [activeCategory, setActiveCategory] = useState<string>('ships')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchNavalActionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try EU server first, fallback to other servers if needed
      const serverIds = ['cleanopenworldprodeu1', 'cleanopenworldprodus1', 'cleanopenworldprodau1']
      
      let itemData = null
      let portData = null
      let shopData = null
      let nationData = null

      for (const serverId of serverIds) {
        try {
          console.log(`Trying server: ${serverId}`)
          
          const [itemRes, portRes, shopRes, nationRes] = await Promise.all([
            fetch(`https://storage.googleapis.com/nacleanopenworldprodshards/ItemTemplates_${serverId}.json`, {
              mode: 'cors',
              headers: {
                'Accept': 'application/json',
              }
            }),
            fetch(`https://storage.googleapis.com/nacleanopenworldprodshards/Ports_${serverId}.json`, {
              mode: 'cors',
              headers: {
                'Accept': 'application/json',
              }
            }),
            fetch(`https://storage.googleapis.com/nacleanopenworldprodshards/Shops_${serverId}.json`, {
              mode: 'cors',
              headers: {
                'Accept': 'application/json',
              }
            }),
            fetch(`https://storage.googleapis.com/nacleanopenworldprodshards/Nations_${serverId}.json`, {
              mode: 'cors',
              headers: {
                'Accept': 'application/json',
              }
            })
          ])

          if (itemRes.ok && portRes.ok && shopRes.ok && nationRes.ok) {
            itemData = await itemRes.json()
            portData = await portRes.json()
            shopData = await shopRes.json()
            nationData = await nationRes.json()
            console.log(`Successfully loaded data from server: ${serverId}`)
            break
          }
        } catch (err) {
          console.log(`Failed to load from server ${serverId}:`, err)
          continue
        }
      }

      if (!itemData) {
        throw new Error('Failed to load data from any server')
      }

      setItemTemplates(itemData || [])
      setPorts(portData || [])
      setShops(shopData || [])
      setNations(nationData || [])

      // Categorize the data
      const categorized = categorizeData(itemData || [])
      setCategorizedData(categorized)

    } catch (err) {
      console.error('Error fetching Naval Action data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const categorizeData = (items: ItemTemplate[]): CategorizedData => {
    const categorized: CategorizedData = {
      ships: {
        '1stRate': [],
        '2ndRate': [],
        '3rdRate': [],
        '4thRate': [],
        '5thRate': [],
        '6thRate': [],
        '7thRate': [],
        specialists: []
      },
      cannons: {
        long: [],
        medium: [],
        carronades: [],
        special: []
      },
      upgrades: {
        hull: [],
        rigging: [],
        gunnery: [],
        crew: []
      },
      resources: {
        basic: [],
        rare: [],
        crafting: []
      },
      other: []
    }

    items.forEach(item => {
      const name = item.name?.toLowerCase() || ''
      const type = item.type?.toLowerCase() || ''

      // Categorize Ships
      if (type.includes('ship') || type.includes('vessel') || (item.guns?.quantity && item.guns.quantity > 0)) {
        const gunCount = item.guns?.quantity || 0
        
        if (gunCount >= 100) {
          categorized.ships['1stRate'].push(item)
        } else if (gunCount >= 80) {
          categorized.ships['2ndRate'].push(item)
        } else if (gunCount >= 64) {
          categorized.ships['3rdRate'].push(item)
        } else if (gunCount >= 50) {
          categorized.ships['4thRate'].push(item)
        } else if (gunCount >= 32) {
          categorized.ships['5thRate'].push(item)
        } else if (gunCount >= 20) {
          categorized.ships['6thRate'].push(item)
        } else if (gunCount > 0) {
          categorized.ships['7thRate'].push(item)
        } else {
          categorized.ships.specialists.push(item)
        }
      }
      // Categorize Cannons
      else if (type.includes('cannon') || type.includes('gun') || name.includes('pounder')) {
        if (name.includes('carronade')) {
          categorized.cannons.carronades.push(item)
        } else if (name.includes('long')) {
          categorized.cannons.long.push(item)
        } else if (name.includes('medium')) {
          categorized.cannons.medium.push(item)
        } else {
          categorized.cannons.special.push(item)
        }
      }
      // Categorize Upgrades
      else if (type.includes('upgrade') || type.includes('modification')) {
        if (name.includes('hull') || name.includes('armor') || name.includes('structure')) {
          categorized.upgrades.hull.push(item)
        } else if (name.includes('sail') || name.includes('speed') || name.includes('rigging')) {
          categorized.upgrades.rigging.push(item)
        } else if (name.includes('gun') || name.includes('reload') || name.includes('penetration')) {
          categorized.upgrades.gunnery.push(item)
        } else if (name.includes('crew') || name.includes('boarding') || name.includes('repair')) {
          categorized.upgrades.crew.push(item)
        } else {
          categorized.upgrades.hull.push(item) // Default to hull
        }
      }
      // Categorize Resources
      else if (type.includes('resource') || type.includes('material') || type.includes('good')) {
        if (name.includes('rare') || name.includes('exotic') || name.includes('precious')) {
          categorized.resources.rare.push(item)
        } else if (name.includes('craft') || name.includes('component')) {
          categorized.resources.crafting.push(item)
        } else {
          categorized.resources.basic.push(item)
        }
      }
      // Everything else
      else {
        categorized.other.push(item)
      }
    })

    // Sort each category by name
    Object.keys(categorized.ships).forEach(key => {
      categorized.ships[key as keyof typeof categorized.ships].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      )
    })
    Object.keys(categorized.cannons).forEach(key => {
      categorized.cannons[key as keyof typeof categorized.cannons].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      )
    })
    Object.keys(categorized.upgrades).forEach(key => {
      categorized.upgrades[key as keyof typeof categorized.upgrades].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      )
    })
    Object.keys(categorized.resources).forEach(key => {
      categorized.resources[key as keyof typeof categorized.resources].sort((a, b) => 
        (a.name || '').localeCompare(b.name || '')
      )
    })
    categorized.other.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    return categorized
  }

  const filteredData = () => {
    if (!categorizedData || !searchTerm) return categorizedData

    const filtered: CategorizedData = {
      ships: {
        '1stRate': [],
        '2ndRate': [],
        '3rdRate': [],
        '4thRate': [],
        '5thRate': [],
        '6thRate': [],
        '7thRate': [],
        specialists: []
      },
      cannons: {
        long: [],
        medium: [],
        carronades: [],
        special: []
      },
      upgrades: {
        hull: [],
        rigging: [],
        gunnery: [],
        crew: []
      },
      resources: {
        basic: [],
        rare: [],
        crafting: []
      },
      other: []
    }

    const searchLower = searchTerm.toLowerCase()

    // Filter each category
    Object.keys(categorizedData.ships).forEach(key => {
      filtered.ships[key as keyof typeof filtered.ships] = categorizedData.ships[key as keyof typeof categorizedData.ships]
        .filter(item => (item.name || '').toLowerCase().includes(searchLower))
    })
    Object.keys(categorizedData.cannons).forEach(key => {
      filtered.cannons[key as keyof typeof filtered.cannons] = categorizedData.cannons[key as keyof typeof categorizedData.cannons]
        .filter(item => (item.name || '').toLowerCase().includes(searchLower))
    })
    Object.keys(categorizedData.upgrades).forEach(key => {
      filtered.upgrades[key as keyof typeof filtered.upgrades] = categorizedData.upgrades[key as keyof typeof categorizedData.upgrades]
        .filter(item => (item.name || '').toLowerCase().includes(searchLower))
    })
    Object.keys(categorizedData.resources).forEach(key => {
      filtered.resources[key as keyof typeof filtered.resources] = categorizedData.resources[key as keyof typeof categorizedData.resources]
        .filter(item => (item.name || '').toLowerCase().includes(searchLower))
    })
    filtered.other = categorizedData.other.filter(item => 
      (item.name || '').toLowerCase().includes(searchLower)
    )

    return filtered
  }

  const renderItemCard = (item: ItemTemplate) => (
    <div key={item.id} className="bg-dark-bg border border-gold/20 rounded p-4">
      <h4 className="text-gold font-semibold mb-2">{item.name || 'Unknown'}</h4>
      <div className="text-gray-300 text-sm space-y-1">
        <p><strong>Type:</strong> {item.type || 'Unknown'}</p>
        {item.guns?.quantity && <p><strong>Guns:</strong> {item.guns.quantity}</p>}
        {item.crew?.max && <p><strong>Crew:</strong> {item.crew.min}-{item.crew.max}</p>}
        {item.cargo && <p><strong>Cargo:</strong> {item.cargo}</p>}
        {item.weight && <p><strong>Weight:</strong> {item.weight}</p>}
        {item.hp && <p><strong>HP:</strong> {item.hp}</p>}
      </div>
    </div>
  )

  const renderCategory = () => {
    const data = filteredData()
    if (!data) return null

    if (activeCategory === 'ships') {
      return (
        <div className="space-y-8">
          {Object.entries(data.ships).map(([rate, ships]) => (
            <div key={rate}>
              <h3 className="text-xl font-semibold text-gold mb-4">
                {rate} ({ships.length} ships)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ships.map(renderItemCard)}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeCategory === 'cannons') {
      return (
        <div className="space-y-8">
          {Object.entries(data.cannons).map(([type, cannons]) => (
            <div key={type}>
              <h3 className="text-xl font-semibold text-gold mb-4 capitalize">
                {type} Cannons ({cannons.length} items)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cannons.map(renderItemCard)}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeCategory === 'upgrades') {
      return (
        <div className="space-y-8">
          {Object.entries(data.upgrades).map(([type, upgrades]) => (
            <div key={type}>
              <h3 className="text-xl font-semibold text-gold mb-4 capitalize">
                {type} Upgrades ({upgrades.length} items)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upgrades.map(renderItemCard)}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeCategory === 'resources') {
      return (
        <div className="space-y-8">
          {Object.entries(data.resources).map(([type, resources]) => (
            <div key={type}>
              <h3 className="text-xl font-semibold text-gold mb-4 capitalize">
                {type} Resources ({resources.length} items)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map(renderItemCard)}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeCategory === 'ports') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gold mb-4">
            Ports ({ports.length} ports)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ports.map((port) => (
              <div key={port.id} className="bg-dark-bg border border-gold/20 rounded p-4">
                <h4 className="text-gold font-semibold mb-2">{port.name}</h4>
                <div className="text-gray-300 text-sm space-y-1">
                  <p><strong>Nation:</strong> {port.nation}</p>
                  <p><strong>Type:</strong> {port.portType}</p>
                  <p><strong>Depth:</strong> {port.depth}m</p>
                  {port.coordinates && (
                    <p><strong>Coordinates:</strong> {port.coordinates[0]}, {port.coordinates[1]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeCategory === 'other') {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gold mb-4">
            Other Items ({data.other.length} items)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.other.map(renderItemCard)}
          </div>
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="text-gold text-lg mb-4">Loading Naval Action API Data...</div>
          <div className="text-gray-400">Fetching from game servers...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
          <h2 className="text-red-400 text-xl mb-2">Error Loading Data</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchNavalActionData}
            className="bg-gold text-dark-bg px-4 py-2 rounded hover:bg-gold/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gold mb-4">Naval Action Game Data</h1>
        <p className="text-gray-300 mb-6">
          Real-time game data from Naval Action servers, organized by category for easy browsing.
        </p>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-3 bg-dark-bg border border-gold/20 rounded text-white"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'ships', label: 'Ships', count: categorizedData ? Object.values(categorizedData.ships).flat().length : 0 },
            { key: 'cannons', label: 'Cannons', count: categorizedData ? Object.values(categorizedData.cannons).flat().length : 0 },
            { key: 'upgrades', label: 'Upgrades', count: categorizedData ? Object.values(categorizedData.upgrades).flat().length : 0 },
            { key: 'resources', label: 'Resources', count: categorizedData ? Object.values(categorizedData.resources).flat().length : 0 },
            { key: 'ports', label: 'Ports', count: ports.length },
            { key: 'other', label: 'Other', count: categorizedData ? categorizedData.other.length : 0 }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded transition-colors ${
                activeCategory === key
                  ? 'bg-gold text-dark-bg'
                  : 'bg-dark-panel text-gray-300 hover:bg-gold/20 border border-gold/20'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderCategory()}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gold/20 text-center text-gray-400">
        <p>
          Data provided by Naval Action public API • 
          <span className="text-gold ml-2">
            Total Items: {itemTemplates.length} • Ports: {ports.length} • Nations: {nations.length}
          </span>
        </p>
      </div>
    </div>
  )
}
