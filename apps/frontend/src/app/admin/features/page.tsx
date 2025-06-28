'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from '@/hooks/useAuth'
import { useSiteContext } from '@/contexts/SiteContext'
import Link from 'next/link'

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: string
  order: number
}

export default function AdminFeaturesPage() {
  const { data: session } = useSession()
  const { featureCards: contextCards, refreshFeatureCards } = useSiteContext()
  const [cards, setCards] = useState<FeatureCard[]>(contextCards)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is admin
  const isAdmin = session?.user?.discordId === '1207434980855259206' || session?.user?.isAdmin

  useEffect(() => {
    setCards(contextCards)
  }, [contextCards])

  const saveCards = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cards)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save feature cards')
      }

      await refreshFeatureCards()
      alert('Feature cards saved successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save feature cards')
    } finally {
      setLoading(false)
    }
  }

  const addCard = () => {
    const newCard: FeatureCard = {
      id: String(cards.length + 1),
      title: 'New Feature',
      description: 'Enter feature description',
      icon: '⚓',
      order: cards.length + 1
    }
    setCards([...cards, newCard])
  }

  const updateCard = (id: string, field: keyof FeatureCard, value: string | number) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ))
  }

  const removeCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id))
  }

  const moveCard = (id: string, direction: 'up' | 'down') => {
    const currentIndex = cards.findIndex(card => card.id === id)
    if (currentIndex === -1) return

    const newCards = [...cards]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex >= 0 && targetIndex < cards.length) {
      [newCards[currentIndex], newCards[targetIndex]] = [newCards[targetIndex], newCards[currentIndex]]
      
      // Update order values
      newCards.forEach((card, index) => {
        card.order = index + 1
      })

      setCards(newCards)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⚓</div>
          <h1 className="text-2xl font-bold text-yellow-400 mb-4">Authentication Required</h1>
          <p className="text-slate-300 mb-6">You must be logged in to access the Admiral's quarters.</p>
          <Link 
            href="/auth/signin" 
            className="bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Set Sail → Login
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-red-600/30 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-6">Only the Admiral may enter these quarters.</p>
          <Link 
            href="/" 
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Return to Port
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin" 
              className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium"
            >
              ← Admiral's Quarters
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            🏴‍☠️ Fleet Advantages
          </h1>
          <p className="text-slate-300">Manage the key benefits displayed to potential recruits</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-slate-800/80 backdrop-blur-sm border border-yellow-600/30 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-yellow-400" style={{ fontFamily: 'Cinzel, serif' }}>
              Feature Cards
            </h2>
            <button
              onClick={addCard}
              className="bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors"
            >
              + Add Feature
            </button>
          </div>

          <div className="space-y-4">
            {cards.map((card, index) => (
              <div key={card.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      value={card.icon}
                      onChange={(e) => updateCard(card.id, 'icon', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-center text-xl focus:outline-none focus:border-yellow-500"
                      placeholder="🔥"
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-yellow-500"
                      placeholder="Feature title"
                    />
                  </div>
                  
                  <div className="md:col-span-5">
                    <textarea
                      value={card.description}
                      onChange={(e) => updateCard(card.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-yellow-500"
                      placeholder="Feature description"
                    />
                  </div>
                  
                  <div className="md:col-span-3 flex gap-2">
                    <button
                      onClick={() => moveCard(card.id, 'up')}
                      disabled={index === 0}
                      className="p-2 text-yellow-400 hover:text-yellow-300 disabled:opacity-30 transition-colors"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveCard(card.id, 'down')}
                      disabled={index === cards.length - 1}
                      className="p-2 text-yellow-400 hover:text-yellow-300 disabled:opacity-30 transition-colors"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeCard(card.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cards.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-4">📝</div>
              <p>No feature cards configured. Add one to get started.</p>
            </div>
          )}

          <div className="flex gap-4 pt-6 mt-6 border-t border-slate-600">
            <button
              onClick={saveCards}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? '⚓ Saving...' : '⚓ Save Changes'}
            </button>
            <Link
              href="/admin"
              className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
