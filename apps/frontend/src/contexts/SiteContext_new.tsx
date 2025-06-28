'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface SiteSettings {
  siteName: string
  tagline: string
  description: string
  commandStructure: Array<{ role: string; name: string }>
}

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: string
  order: number
}

interface AdmiraltyLetter {
  title: string
  content: string
  author: string
}

interface WelcomeContent {
  title: string
  content: string
}

interface SiteContextType {
  settings: SiteSettings
  featureCards: FeatureCard[]
  admiraltyLetter: AdmiraltyLetter
  welcomeContent: WelcomeContent
  loading: boolean
  refreshSettings: () => Promise<void>
  refreshFeatureCards: () => Promise<void>
  refreshAdmiraltyLetter: () => Promise<void>
  refreshWelcomeContent: () => Promise<void>
  refreshAll: () => Promise<void>
}

const defaultSettings: SiteSettings = {
  siteName: 'KrakenGaming',
  tagline: 'Legendary Fleet Command',
  description: 'Join the most prestigious naval command in the Caribbean. Elite captains, strategic warfare, and maritime dominance await.',
  commandStructure: [
    { role: 'Fleet Admiral', name: 'Supreme Commander' },
    { role: 'Admiral', name: 'Fleet Operations' },
    { role: 'Commodore', name: 'Squadron Leader' },
    { role: 'Captain', name: 'Ship Commander' }
  ]
}

const defaultFeatureCards: FeatureCard[] = [
  {
    id: '1',
    title: 'Elite Naval Command',
    description: 'Lead legendary fleets across the Caribbean with tactical precision and strategic mastery.',
    icon: '⚓',
    order: 1
  },
  {
    id: '2',
    title: 'Strategic Port Battles',
    description: 'Engage in massive coordinated naval warfare with up to 50 ships per battle.',
    icon: '🏴‍☠️',
    order: 2
  },
  {
    id: '3',
    title: 'Brotherhood of the Sea',
    description: 'Join a community of dedicated captains united under the Kraken banner.',
    icon: '🦑',
    order: 3
  }
]

const defaultAdmiraltyLetter: AdmiraltyLetter = {
  title: 'Letter from the Admiralty',
  content: 'Esteemed Captain, The winds of change blow across the Caribbean...',
  author: 'The Admiralty'
}

const defaultWelcomeContent: WelcomeContent = {
  title: 'Welcome Aboard Captain',
  content: 'Congratulations on taking the first step toward joining the most elite naval command...'
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [featureCards, setFeatureCards] = useState<FeatureCard[]>(defaultFeatureCards)
  const [admiraltyLetter, setAdmiraltyLetter] = useState<AdmiraltyLetter>(defaultAdmiraltyLetter)
  const [welcomeContent, setWelcomeContent] = useState<WelcomeContent>(defaultWelcomeContent)
  const [loading, setLoading] = useState(true)

  const refreshSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const refreshFeatureCards = async () => {
    try {
      const response = await fetch('/api/admin/features')
      if (response.ok) {
        const data = await response.json()
        setFeatureCards(data)
      }
    } catch (error) {
      console.error('Error fetching feature cards:', error)
    }
  }

  const refreshAdmiraltyLetter = async () => {
    try {
      const response = await fetch('/api/admin/letter')
      if (response.ok) {
        const data = await response.json()
        setAdmiraltyLetter(data)
      }
    } catch (error) {
      console.error('Error fetching admiralty letter:', error)
    }
  }

  const refreshWelcomeContent = async () => {
    try {
      const response = await fetch('/api/admin/welcome')
      if (response.ok) {
        const data = await response.json()
        setWelcomeContent(data)
      }
    } catch (error) {
      console.error('Error fetching welcome content:', error)
    }
  }

  const refreshAll = async () => {
    setLoading(true)
    await Promise.all([
      refreshSettings(),
      refreshFeatureCards(),
      refreshAdmiraltyLetter(),
      refreshWelcomeContent()
    ])
    setLoading(false)
  }

  useEffect(() => {
    refreshAll()
  }, [])

  return (
    <SiteContext.Provider value={{
      settings,
      featureCards,
      admiraltyLetter,
      welcomeContent,
      loading,
      refreshSettings,
      refreshFeatureCards,
      refreshAdmiraltyLetter,
      refreshWelcomeContent,
      refreshAll
    }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSiteContext() {
  const context = useContext(SiteContext)
  if (context === undefined) {
    throw new Error('useSiteContext must be used within a SiteProvider')
  }
  return context
}
