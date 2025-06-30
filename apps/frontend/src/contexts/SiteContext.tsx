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
    title: 'Brotherhood of the Sea',
    description: 'Join a community of dedicated Privateers working throughout the Caribbean',
    icon: '🤝',
    order: 1
  },
  {
    id: '2',
    title: 'Strategic RvR',
    description: 'We engage in daily RvR focused on the best combat experience in an Age of Sail game',
    icon: '⚔️',
    order: 2
  },
  {
    id: '3',
    title: 'Daily Ganking and PvP',
    description: 'We take every fight that comes along and engage in piracy on the high seas in the name of King George III',
    icon: '🏴‍☠️',
    order: 3
  },
  {
    id: '4',
    title: 'At-Cost Resources',
    description: 'We offer resources and crafting materials through dedicated suppliers at or slightly above cost',
    icon: '💰',
    order: 4
  },
  {
    id: '5',
    title: 'Active Shipyard',
    description: 'Our Shipyards turn out fresh hulls daily at low costs',
    icon: '🚢',
    order: 5
  },
  {
    id: '6',
    title: 'Active Crafters',
    description: 'Our crafters keep the fleet supplied and ready to fight at a moments notice',
    icon: '🔨',
    order: 6
  }
]

const defaultAdmiraltyLetter: AdmiraltyLetter = {
  title: 'Letter of Marque and Reprisal',
  content: `George the Second, by the Grace of God, King of Great Britain, France and Ireland, Defender of the Faith, &c.

To all who shall see these Presents, Greeting:

Know Ye, that We, reposing especial Trust and Confidence in the Loyalty, Courage and good Conduct of the Officers and Crew of the United We Stand naval command, do by these Presents grant unto them full Power and Authority to arm and equip suitable Vessels of War, and therewith by Force of Arms to attack, subdue, and take all Ships and other Vessels belonging to the Crown of France, or to any of the Subjects of the French King.

We do hereby authorize and empower the said United We Stand to bring such Vessels, with their Tackle, Apparel, Furniture, and Lading, into any of Our Ports within Our Dominions; and We do further will and require all Our Officers, both Civil and Military, and all others Our loving Subjects whatsoever, to be aiding and assisting unto the said United We Stand in the Execution of these Our Letters.

Given under Our Royal Seal at Our Palace of Westminster, this Twenty-eighth Day of June, in the Year of Our Lord One Thousand Seven Hundred and Twenty-five, and in the Eleventh Year of Our Reign.

By His Majesty's Command,
The Lords Commissioners of the Admiralty`,
  author: 'By Royal Authority',
  role: 'Letter of Marque issued to United We Stand'
}

const defaultWelcomeContent: WelcomeContent = {
  title: 'Welcome Aboard, Captain',
  content: ``
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
