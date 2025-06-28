'use client'

import { useState, useEffect } from 'react'
import { 
  type PerkSelection, 
  ALL_PERKS, 
  getPerkByName, 
  calculateTotalPerkCost, 
  getRemainingPoints, 
  getRemainingSlots,
  canAffordPerk,
  getAvailablePerks,
  MAX_PERK_POINTS,
  MAX_PERK_SLOTS
} from '@/data/perks'

interface PerkSelectorProps {
  perks: PerkSelection[]
  onChange: (perks: PerkSelection[]) => void
  className?: string
}

export default function PerkSelector({
  perks,
  onChange,
  className = ""
}: PerkSelectorProps) {
  const remainingPoints = getRemainingPoints(perks)
  const remainingSlots = getRemainingSlots(perks)
  const totalCost = calculateTotalPerkCost(perks)

  const updatePerk = (index: number, field: keyof PerkSelection, value: string | number) => {
    const newPerks = [...perks]
    
    // Ensure we have enough slots
    while (newPerks.length <= index) {
      newPerks.push({ perkName: '', level: 0 })
    }
    
    if (field === 'perkName') {
      // If changing perk name, reset level
      newPerks[index] = { perkName: value as string, level: 0 }
    } else if (field === 'level') {
      newPerks[index] = { ...newPerks[index], level: value as number }
    }
    
    // Only clean up completely empty selections (no perk name and no level)
    const cleanedPerks = newPerks.filter((perk, idx) => {
      return perk.perkName !== '' || perk.level > 0
    })
    
    onChange(cleanedPerks)
  }

  const getMaxAffordableLevel = (perkName: string, currentIndex: number): number => {
    if (!perkName) return 0
    
    const perk = getPerkByName(perkName)
    if (!perk) return 0
    
    // Calculate remaining points excluding current selection
    const otherPerks = perks.filter((_, idx) => idx !== currentIndex)
    const remainingForThis = MAX_PERK_POINTS - calculateTotalPerkCost(otherPerks)
    
    // Find highest level we can afford
    for (let level = perk.maxLevel; level >= 1; level--) {
      const levelData = perk.levels.find(l => l.level === level)
      if (levelData && levelData.cost <= remainingForThis) {
        return level
      }
    }
    
    return 0
  }

  // Ensure we always have 5 slots to show
  const displayPerks = [...perks]
  while (displayPerks.length < MAX_PERK_SLOTS) {
    displayPerks.push({ perkName: '', level: 0 })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary */}
      <div className="bg-sail-white/30 border border-navy-dark/30 rounded-lg p-3">
        <div className="flex justify-between items-center text-sm" style={{fontFamily: 'Crimson Text, serif'}}>
          <span className="text-navy-dark">
            Points Used: <span className={`font-bold ${totalCost > MAX_PERK_POINTS ? 'text-red-600' : 'text-green-600'}`}>
              {totalCost} / {MAX_PERK_POINTS}
            </span>
          </span>
          <span className="text-navy-dark">
            Perks: <span className="font-bold text-navy-dark">
              {perks.filter(p => p.perkName && p.level > 0).length} / {MAX_PERK_SLOTS}
            </span>
          </span>
        </div>
      </div>

      {/* Perk Selection */}
      <div className="space-y-3">
        {displayPerks.map((perk, index) => {
          const availablePerks = getAvailablePerks(perks.filter((_, idx) => idx !== index))
          const selectedPerk = getPerkByName(perk.perkName)
          const maxLevel = selectedPerk ? getMaxAffordableLevel(perk.perkName, index) : 0
          const isSlotDisabled = remainingSlots <= 0 && !perk.perkName

          return (
            <div key={index} className="flex gap-3 items-center">
              <span className="text-xs text-navy-dark w-12" style={{fontFamily: 'Cinzel, serif'}}>
                Perk {index + 1}:
              </span>
              
              {/* Perk Name Selector */}
              <div className="flex-1">
                <select
                  value={perk.perkName}
                  onChange={(e) => updatePerk(index, 'perkName', e.target.value)}
                  className="w-full border-2 border-navy-dark rounded px-2 py-1 text-sm focus:outline-none focus:border-brass transition-colors"
                  style={{fontFamily: 'Crimson Text, serif'}}
                  disabled={isSlotDisabled}
                >
                  <option value="">Select Perk...</option>
                  {availablePerks.map(perkName => (
                    <option key={perkName} value={perkName}>
                      {perkName}
                    </option>
                  ))}
                  {perk.perkName && !availablePerks.includes(perk.perkName) && (
                    <option value={perk.perkName}>{perk.perkName}</option>
                  )}
                </select>
              </div>
              
              {/* Level Selector */}
              <div className="w-20">
                <select
                  value={perk.level}
                  onChange={(e) => updatePerk(index, 'level', parseInt(e.target.value))}
                  className="w-full border-2 border-navy-dark rounded px-2 py-1 text-sm focus:outline-none focus:border-brass transition-colors"
                  style={{fontFamily: 'Crimson Text, serif'}}
                  disabled={!perk.perkName || maxLevel === 0}
                >
                  <option value={0}>Level</option>
                  {selectedPerk && selectedPerk.levels.map(levelData => (
                    <option 
                      key={levelData.level} 
                      value={levelData.level}
                      disabled={levelData.level > maxLevel}
                    >
                      L{levelData.level} ({levelData.cost}pts)
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Cost Display */}
              <div className="w-12 text-xs text-navy-dark text-right" style={{fontFamily: 'Crimson Text, serif'}}>
                {perk.perkName && perk.level > 0 && (
                  <span className="font-medium">
                    {selectedPerk?.levels.find(l => l.level === perk.level)?.cost || 0}pts
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Warning if over limits */}
      {totalCost > MAX_PERK_POINTS && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm" style={{fontFamily: 'Crimson Text, serif'}}>
          ⚠️ Over point limit by {totalCost - MAX_PERK_POINTS} points
        </div>
      )}
    </div>
  )
}
