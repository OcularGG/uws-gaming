'use client'

import React, { useState, useEffect } from 'react'
import { useSiteContext } from '@/contexts/SiteContext'

interface AdmiraltyLetter {
  id?: string
  title: string
  content: string
  signature?: string
  date?: string
  isActive?: boolean
  author?: string
  role?: string
}

export default function AdminAdmiraltyPage() {
  const { admiraltyLetter, refreshAdmiraltyLetter } = useSiteContext()
  const [letter, setLetter] = useState<AdmiraltyLetter>(admiraltyLetter)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLetter(admiraltyLetter)
  }, [admiraltyLetter])

  const handleSave = () => {
    // TODO: Implement API call to save admiralty letter
    // For now, save to localStorage
    localStorage.setItem('admiralty-letter', JSON.stringify(letter))
    refreshAdmiraltyLetter()
    setHasChanges(false)
    alert('Admiralty letter saved successfully!')
  }

  const handleChange = (field: keyof AdmiraltyLetter, value: string | boolean) => {
    setLetter(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      setLetter(admiraltyLetter)
      setHasChanges(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-sail-white mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            📜 ADMIRALTY CORRESPONDENCE 📜
          </h1>
          <p className="text-sail-white/90 text-xl mb-2" style={{fontFamily: 'Crimson Text, serif'}}>
            Official Communications from the Naval High Command
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
                💾 Dispatch Letter
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
                  checked={letter.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Show admiralty letter on homepage</span>
              </label>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Letter Title</label>
              <input
                type="text"
                value={letter.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="A Letter from the Admiralty"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Letter Content</label>
              <textarea
                value={letter.content}
                onChange={(e) => handleChange('content', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white h-64"
                placeholder="Write the letter content here. Use double line breaks (\\n\\n) to separate paragraphs."
              />
              <p className="text-xs text-gray-400 mt-1">
                Tip: Use double line breaks to create new paragraphs. The first letter of the first paragraph will be automatically styled as a drop cap.
              </p>
            </div>

            {/* Signature */}
            <div>
              <label className="block text-sm font-medium mb-2">Signature Name</label>
              <input
                type="text"
                value={letter.signature}
                onChange={(e) => handleChange('signature', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white"
                placeholder="Tommy Templeman"
              />
            </div>

            {/* Date/Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title/Position</label>
              <textarea
                value={letter.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded text-white h-20"
                placeholder="Vice Chairman of the Defence Council&#10;Second Sea Lord, British Admiralty"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use line breaks to separate multiple lines in the title/position.
              </p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Preview</h2>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            {letter.isActive ? (
              <div className="letter-container bg-white border-4 border-gray-800 p-8 shadow-2xl transform rotate-1">
                <div className="text-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800" style={{fontFamily: 'serif'}}>
                    {letter.title || 'Letter Title'}
                  </h3>
                </div>

                <div className="space-y-6 text-gray-800" style={{fontFamily: 'serif'}}>
                  {(letter.content || 'Letter content will appear here...').split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-lg leading-relaxed">
                      {index === 0 && paragraph ? (
                        <>
                          <span className="text-2xl font-bold float-left mr-2 leading-none" style={{fontFamily: 'serif'}}>
                            {paragraph.charAt(0)}
                          </span>
                          {paragraph.slice(1)}
                        </>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}

                  <div className="text-right">
                    <p className="text-xl italic mb-2" style={{fontFamily: 'serif'}}>
                      With deepest respect and fair winds,
                    </p>
                    <div className="signature-line">
                      <div className="w-48 h-12 mx-auto bg-gray-200 flex items-center justify-center text-gray-600 text-sm mb-2">
                        [Signature Image]
                      </div>
                      <p className="text-lg font-bold mt-2" style={{fontFamily: 'serif'}}>
                        {letter.signature || 'Signature Name'}
                      </p>
                      <p className="text-sm text-yellow-600">
                        {(letter.date || 'Title/Position').split('\n').map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < (letter.date || '').split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>Letter is currently disabled and will not appear on the homepage.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
