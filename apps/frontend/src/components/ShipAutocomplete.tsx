'use client'

import { useState, useRef, useEffect } from 'react'
import { searchShips, getShipByName, type Ship } from '@/data/ships'

interface ShipAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  label?: string
  showBR?: boolean
}

export default function ShipAutocomplete({
  value,
  onChange,
  placeholder = "Enter ship name...",
  className = "",
  required = false,
  label,
  showBR = true
}: ShipAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Ship[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue)

    if (inputValue.trim() === '') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Filter ships that match the input using the new ships data
    const filteredSuggestions = searchShips(inputValue)

    setSuggestions(filteredSuggestions)
    setShowSuggestions(filteredSuggestions.length > 0)
    setActiveSuggestion(-1)
  }

  const handleSuggestionClick = (suggestion: Ship) => {
    onChange(suggestion.name)
    setShowSuggestions(false)
    setSuggestions([])
    setActiveSuggestion(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveSuggestion(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (activeSuggestion >= 0) {
          handleSuggestionClick(suggestions[activeSuggestion])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setActiveSuggestion(-1)
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
        setActiveSuggestion(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
          {label} {required && '*'}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border-2 border-navy-dark rounded focus:outline-none focus:border-brass transition-colors ${className}`}
          style={{fontFamily: 'Crimson Text, serif'}}
          required={required}
          autoComplete="off"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-sail-white border-2 border-navy-dark rounded shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.name}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-3 py-2 text-left text-navy-dark hover:bg-brass/20 focus:bg-brass/20 focus:outline-none transition-colors border-b border-navy-dark/20 last:border-b-0 ${
                index === activeSuggestion ? 'bg-brass/30' : 'bg-sail-white'
              }`}
              style={{fontFamily: 'Crimson Text, serif'}}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{suggestion.name}</span>
                {showBR && (
                  <div className="text-sm text-navy-dark/70 flex gap-2">
                    <span>Rate {suggestion.rate}</span>
                    <span>BR {suggestion.br}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && value.length >= 2 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-sail-white border-2 border-navy-dark rounded shadow-lg"
        >
          <div className="px-3 py-2 text-navy-dark/70 bg-sail-white" style={{fontFamily: 'Crimson Text, serif'}}>
            No ships found matching "{value}"
          </div>
        </div>
      )}
    </div>
  )
}
