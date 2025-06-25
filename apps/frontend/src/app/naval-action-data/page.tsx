'use client'

import { useState, useEffect } from 'react'

interface NavalActionItem {
  Name?: string
  ItemType?: string
  MaxStack?: number
  SortingGroup?: string
  ItemGroup?: string
  Requirements?: any
  Results?: any
  FullRequirements?: any
  UpgradeItem?: any
  Gold?: number
  Labor?: number
  [key: string]: any
}

interface OrganizedItem {
  index: number
  name: string
  type?: string
  sortingGroup?: string
  itemGroup?: string
  maxStack?: number
  gold?: number
  labor?: number
  requirements?: any
  results?: any
  fullData: NavalActionItem
}

interface SubCategory {
  name: string
  count: number
  items: { index: number; name: string; fullData: NavalActionItem }[]
}

interface Category {
  name: string
  count: number
  subcategories: Record<string, SubCategory>
  items: OrganizedItem[]
}

interface OrganizedData {
  categories: Record<string, Category>
  totalItems: number
  items: NavalActionItem[]
}

export default function NavalActionDataPage() {
  const [organizedData, setOrganizedData] = useState<OrganizedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeSubCategory, setActiveSubCategory] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/naval-action')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Debug logging
        console.log('Organized data received:', data)
        
        // Handle error response from API
        if (data.error) {
          throw new Error(data.error)
        }
        
        setOrganizedData(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
        console.error('Error fetching Naval Action data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get categories from organized data
  const getCategories = () => {
    if (!organizedData) return []
    return Object.keys(organizedData.categories).sort()
  }

  // Get subcategories for active category
  const getSubCategories = () => {
    if (!organizedData || activeCategory === 'all') return []
    const category = organizedData.categories[activeCategory]
    return category ? Object.keys(category.subcategories).sort() : []
  }

  // Get filtered items based on search, category, and subcategory
  const getFilteredItems = (): OrganizedItem[] => {
    if (!organizedData) return []
    
    let items: OrganizedItem[] = []
    
    // Get items from selected category or all categories
    if (activeCategory === 'all') {
      // Get all items from all categories
      Object.values(organizedData.categories).forEach(category => {
        items = items.concat(category.items)
      })
    } else {
      // Get items from specific category
      const category = organizedData.categories[activeCategory]
      if (category) {
        if (activeSubCategory === 'all') {
          items = category.items
        } else {
          // Get items from specific subcategory
          const subCategory = category.subcategories[activeSubCategory]
          if (subCategory) {
            items = subCategory.items.map(item => ({
              index: item.index,
              name: item.name,
              type: item.fullData.ItemType,
              sortingGroup: item.fullData.SortingGroup,
              itemGroup: item.fullData.ItemGroup,
              maxStack: item.fullData.MaxStack,
              gold: item.fullData.Gold,
              labor: item.fullData.Labor,
              requirements: item.fullData.Requirements,
              results: item.fullData.Results,
              fullData: item.fullData
            }))
          }
        }
      }
    }
    
    // Apply search filter
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sortingGroup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemGroup?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return items
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gold mb-4">Naval Action Data</h1>
        <p className="text-gray-300">Loading and organizing data from Naval Action servers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gold mb-4">Naval Action Data</h1>
        <p className="text-red-400">Error loading data: {error}</p>
      </div>
    )
  }

  if (!organizedData) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gold mb-4">Naval Action Data</h1>
        <p className="text-gray-400">No data available</p>
      </div>
    )
  }

  const filteredItems = getFilteredItems()
  const categories = getCategories()
  const subCategories = getSubCategories()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gold mb-4">Naval Action Data</h1>
        <p className="text-gray-300 mb-6">
          Organized data from Naval Action servers: {organizedData.totalItems} items in {categories.length} categories.
        </p>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-3 bg-gray-800 border border-gray-600 rounded text-white"
          />
        </div>

        {/* Category Filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2">Category:</label>
            <select
              value={activeCategory}
              onChange={(e) => {
                setActiveCategory(e.target.value)
                setActiveSubCategory('all')
              }}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
            >
              <option value="all">All Categories ({organizedData.totalItems})</option>
              {categories.map(category => {
                const count = organizedData.categories[category].count
                return (
                  <option key={category} value={category}>
                    {category} ({count})
                  </option>
                )
              })}
            </select>
          </div>

          {/* Subcategory Filter */}
          {activeCategory !== 'all' && subCategories.length > 0 && (
            <div>
              <label className="block text-gray-300 mb-2">Subcategory:</label>
              <select
                value={activeSubCategory}
                onChange={(e) => setActiveSubCategory(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white"
              >
                <option value="all">All Subcategories</option>
                {subCategories.map(subCategory => {
                  const count = organizedData.categories[activeCategory].subcategories[subCategory].count
                  return (
                    <option key={subCategory} value={subCategory}>
                      {subCategory} ({count})
                    </option>
                  )
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gold">
          Results ({filteredItems.length} items)
        </h2>
        
        {filteredItems.length === 0 ? (
          <p className="text-gray-400">No items found matching your criteria.</p>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, index) => (
              <div key={`${item.index}-${index}`} className="bg-gray-800 p-4 rounded border border-gray-600">
                <h3 className="text-white font-medium mb-2">{item.name}</h3>
                <div className="text-gray-300 text-sm space-y-1">
                  {item.type && <div><strong>Type:</strong> {item.type}</div>}
                  {item.sortingGroup && <div><strong>Sorting Group:</strong> {item.sortingGroup}</div>}
                  {item.itemGroup && <div><strong>Item Group:</strong> {item.itemGroup}</div>}
                  {item.maxStack && <div><strong>Max Stack:</strong> {item.maxStack}</div>}
                  {item.gold && <div><strong>Gold Value:</strong> {item.gold}</div>}
                  {item.labor && <div><strong>Labor Cost:</strong> {item.labor}</div>}
                  {item.requirements && (
                    <div><strong>Requirements:</strong> {JSON.stringify(item.requirements).substring(0, 100)}...</div>
                  )}
                  {item.results && (
                    <div><strong>Results:</strong> {JSON.stringify(item.results).substring(0, 100)}...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-600 text-center text-gray-400">
        <p>
          Data organized from Naval Action game servers • 
          <span className="text-gold ml-2">
            Total Items: {organizedData.totalItems} • Categories: {categories.length} • Filtered: {filteredItems.length}
          </span>
        </p>
      </div>
    </div>
  )
}
