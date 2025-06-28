import { searchShips, getShipByName, NAVAL_ACTION_SHIPS } from '../data/ships'

// Test ship search functionality
export const testShipSearch = () => {
  console.log('Testing ship search functionality...')
  
  // Test search for "Victory"
  const victoryResults = searchShips('Victory')
  console.log('Search for "Victory":', victoryResults)
  
  // Test search for "Belle"
  const belleResults = searchShips('Belle')
  console.log('Search for "Belle":', belleResults)
  
  // Test get specific ship
  const victory = getShipByName('Victory')
  console.log('Get Victory ship:', victory)
  
  const santisima = getShipByName('Santisima Trinidad')
  console.log('Get Santisima Trinidad:', santisima)
  
  // Test BR values
  console.log('Total ships in database:', NAVAL_ACTION_SHIPS.length)
  console.log('Ships by rate:')
  for (let rate = 1; rate <= 8; rate++) {
    const shipsOfRate = NAVAL_ACTION_SHIPS.filter(ship => ship.rate === rate)
    console.log(`Rate ${rate}: ${shipsOfRate.length} ships`)
  }
  
  // Test some specific BR values
  const testShips = ['Victory', 'Santisima Trinidad', 'L\'Ocean', 'Christian', 'Bellona', 'Endymion', 'Trincomalee']
  testShips.forEach(shipName => {
    const ship = getShipByName(shipName)
    console.log(`${shipName}: ${ship ? `BR ${ship.br}, Rate ${ship.rate}` : 'Not found'}`)
  })
}

// Run test in browser console
if (typeof window !== 'undefined') {
  (window as any).testShipSearch = testShipSearch
}
