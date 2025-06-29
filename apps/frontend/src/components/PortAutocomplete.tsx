'use client'

import { useState, useRef, useEffect } from 'react'
import { searchPortsSync, getPortList } from '@/data/ports'

interface PortAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  label?: string
}

export default function PortAutocomplete({
  value,
  onChange,
  placeholder = "Enter port name...",
  className = "",
  required = false,
  label
}: PortAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load port data on component mount
  useEffect(() => {
    const loadPorts = async () => {
      setIsLoading(true)
      try {
        await getPortList() // This will cache the data
      } catch (error) {
        console.error('Failed to load port data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPorts()
  }, [])

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue)

    if (inputValue.trim() === '') {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Filter ports that match the input using the sync search
    const filteredSuggestions = searchPortsSync(inputValue)

    setSuggestions(filteredSuggestions)
    setShowSuggestions(filteredSuggestions.length > 0)
    setActiveSuggestion(-1)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
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
          placeholder={isLoading ? "Loading ports..." : placeholder}
          className={`w-full px-3 py-2 border-2 border-navy-dark rounded focus:outline-none focus:border-brass transition-colors ${className}`}
          style={{fontFamily: 'Crimson Text, serif'}}
          required={required}
          autoComplete="off"
          disabled={isLoading}
        />

        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-4 w-4 border-2 border-brass border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-sail-white border-2 border-navy-dark rounded shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-3 py-2 text-left text-navy-dark hover:bg-brass/20 focus:bg-brass/20 focus:outline-none transition-colors border-b border-navy-dark/20 last:border-b-0 ${
                index === activeSuggestion ? 'bg-brass/30' : 'bg-sail-white'
              }`}
              style={{fontFamily: 'Crimson Text, serif'}}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && value.length >= 2 && !isLoading && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-sail-white border-2 border-navy-dark rounded shadow-lg"
        >
          <div className="px-3 py-2 text-navy-dark/70 bg-sail-white" style={{fontFamily: 'Crimson Text, serif'}}>
            No ports found matching "{value}"
          </div>
        </div>
      )}
    </div>
  )
}
