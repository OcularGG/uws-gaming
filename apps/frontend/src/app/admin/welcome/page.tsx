'use client'

import React, { useState, useEffect } from 'react'
import { useSiteContext } from '@/contexts/SiteContext'

interface WelcomeContent {
  id?: string
  title: string
  subtitle?: string
  description?: string
  isActive?: boolean
  content?: string
}

export default function AdminWelcomePage() {
  const { welcomeContent, refreshWelcomeContent, settings } = useSiteContext()
  const [content, setContent] = useState<WelcomeContent>(welcomeContent)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setContent(welcomeContent)
  }, [welcomeContent])

  const handleSave = () => {
    // TODO: Implement API call to save welcome content
    // For now, save to localStorage
    localStorage.setItem('welcome-content', JSON.stringify(content))
    refreshWelcomeContent()
    setHasChanges(false)
    alert('Welcome content saved successfully!')
  }

  const handleChange = (field: keyof WelcomeContent, value: string | boolean) => {
    setContent(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      setContent(welcomeContent)
      setHasChanges(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            📢 FLEET WELCOME ORDERS 📢
          </h1>
          <p className="text-sail-white/90 text-xl mb-2" style={{fontFamily: 'Crimson Text, serif'}}>
            Captain's Welcome Message & Fleet Introduction
          </p>
        </div>

        {/* Navigation & Actions */}
        <div className="flex justify-center mb-8">
          <div className="neo-brutal-box bg-sail-white p-4">
            <div className="flex gap-4 flex-wrap justify-center">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded border-2 border-gray-700 font-bold transition-all"
                  style={{fontFamily: 'Cinzel, serif'}}
                >
                  ⚓ Reset Changes
                </button>
              )}
              <button
                onClick={handleSave}
                className={`px-6 py-2 rounded border-2 font-bold transition-all ${
                  hasChanges 
                    ? 'bg-brass hover:bg-brass-bright text-navy-dark border-brass-bright' 
                    : 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed'
                }`}
                style={{fontFamily: 'Cinzel, serif'}}
                disabled={!hasChanges}
              >
                💾 Update Orders
              </button>
              <a
                href="/admin"
                className="bg-navy-dark hover:bg-navy text-sail-white px-6 py-2 rounded border-2 border-navy-dark font-bold transition-all"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                ⚓ Command Center
              </a>
            </div>
          </div>
        </div>

        <div className="neo-brutal-box bg-sail-white p-8">
          <div className="space-y-6">
            {/* Active Toggle */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={content.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Show welcome section on homepage</span>
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Section Title</label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="Welcome Aboard, Captain"
              />
              <p className="text-xs text-gray-400 mt-1">
                Tip: Use a comma to split the title. Text before the comma will be normal, text after will be highlighted in the clan color.
              </p>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="Command your fleet through treacherous waters"
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional subtitle that appears below the main title.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={content.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white h-32"
                placeholder="Set sail with Kraken and the British Admiralty in Naval Action. Command your fleet through treacherous waters and claim victory in the age of wooden ships and iron men."
              />
              <p className="text-xs text-gray-400 mt-1">
                Main description text that appears in the neo-brutal box.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            {content.isActive ? (
              <div className="bg-yellow-100 p-8">
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-12" style={{fontFamily: 'serif'}}>
                    {content.title ? (
                      <>
                        {content.title.split(',')[0]}, <span className="text-yellow-600">{content.title.split(',')[1]}</span>
                      </>
                    ) : (
                      'Section Title'
                    )}
                  </h2>

                  {content.subtitle && (
                    <p className="text-xl text-gray-600 mb-8">
                      {content.subtitle}
                    </p>
                  )}

                  <div className="bg-white border-4 border-black p-8 shadow-lg max-w-4xl mx-auto">
                    <p className="text-xl md:text-2xl text-gray-800 leading-relaxed" style={{fontFamily: 'serif'}}>
                      {content.description || 'Description will appear here...'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>Welcome section is currently disabled and will not appear on the homepage.</p>
              </div>
            )}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Usage Tips</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• The welcome section appears right after the hero section on the homepage</li>
            <li>• Use a comma in the title to split it into two parts - the second part will be highlighted</li>
            <li>• The description appears in a prominent neo-brutal styled box</li>
            <li>• Keep the description concise but impactful to make a strong first impression</li>
            <li>• This section sets the tone for new visitors before they read the admiralty letter</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
