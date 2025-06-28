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
  role?: string
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
  content: `Esteemed Captain,

The winds of change blow across the Caribbean, and the time has come for those of exceptional skill and unwavering loyalty to step forward. The Kraken Gaming naval command seeks captains of the highest caliber to join our prestigious fleet.

Our operations span the vast expanse of the Caribbean, where strategic warfare and tactical brilliance determine the fate of nations. Under our banner, you will command some of the finest vessels ever to grace these waters, leading elite crews in battles that will be remembered for generations.

We offer not merely a position, but a brotherhood forged in the crucible of naval combat. Our captains are bound by honor, united in purpose, and relentless in their pursuit of maritime supremacy.

Should you possess the courage, skill, and dedication required to serve under the Kraken banner, we invite you to submit your application. Only those who demonstrate exceptional leadership and unwavering commitment to our cause will be considered.

The sea calls, Captain. Will you answer?`,
  author: 'The Admiralty',
  role: 'Naval High Command'
}

const defaultWelcomeContent: WelcomeContent = {
  title: 'Welcome Aboard Captain',
  content: `Congratulations on taking the first step toward joining the most elite naval command in the Caribbean. Your journey with Kraken Gaming begins with understanding what it means to sail under our colors.

**What We Stand For:**
• **Excellence in Leadership** - Every captain commands with skill and honor
• **Brotherhood of the Sea** - United we sail, divided we sink
• **Strategic Mastery** - Victory through superior tactics and coordination
• **Maritime Tradition** - Respecting the rich history of naval warfare

**Your Next Steps:**
1. **Complete Your Application** - Provide detailed information about your naval experience
2. **Discord Integration** - Join our communication channels for real-time coordination
3. **Training Period** - Demonstrate your skills in training exercises
4. **Fleet Assignment** - Receive your official position and ship assignment

The Caribbean awaits your command, Captain. Together, we shall rule the seas.`
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
