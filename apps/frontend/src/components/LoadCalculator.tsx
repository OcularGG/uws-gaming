'use client'

import { useState } from 'react'
import { getShipByName } from '@/data/ships'
import { calculateWoodModifiers, applyWoodModifiers, applyCaps } from '@/data/wood-properties'

interface LoadoutCalculation {
  broadsides: number
  repairSets: number
  balls: number
  ballsTons: number
  gunpowder: number
  gunpowderTons: number
  hullRepairs: number
  hullRepairsTons: number
  rigRepairs: number
  rigRepairsTons: number
  medicine: number
  medicineTons: number
  totalTons: number
  cargoPercentage: number
  speedKnots: number
}

interface ShipLoadData {
  ballsPerBroadside: number
  ballsTonsPerBroadside: number
  gunpowderPerBroadside: number
  gunpowderTonsPerBroadside: number
  hullRepairsPerSet: number
  hullRepairsTonsPerSet: number
  rigRepairsPerSet: number
  rigRepairsTonsPerSet: number
  medicinePerSet: number
  medicineTonsPerSet: number
  baseCargoCapacity: number
  baseSpeed: number
}

// Ship load data - starting with Duke of Kent
const SHIP_LOAD_DATA: Record<string, ShipLoadData> = {
  'Duke Of Kent': {
    ballsPerBroadside: 88,
    ballsTonsPerBroadside: 1.8,
    gunpowderPerBroadside: 840,
    gunpowderTonsPerBroadside: 8.4,
    hullRepairsPerSet: 30,
    hullRepairsTonsPerSet: 38,
    rigRepairsPerSet: 87,
    rigRepairsTonsPerSet: 110,
    medicinePerSet: 477,
    medicineTonsPerSet: 24,
    baseCargoCapacity: 860,
    baseSpeed: 9
  },
  'Victory': {
    ballsPerBroadside: 96,
    ballsTonsPerBroadside: 2.4,
    gunpowderPerBroadside: 960,
    gunpowderTonsPerBroadside: 9.6,
    hullRepairsPerSet: 35,
    hullRepairsTonsPerSet: 45,
    rigRepairsPerSet: 95,
    rigRepairsTonsPerSet: 120,
    medicinePerSet: 520,
    medicineTonsPerSet: 26,
    baseCargoCapacity: 950,
    baseSpeed: 8.5
  },
  'Santísima Trinidad': {
    ballsPerBroadside: 108,
    ballsTonsPerBroadside: 2.7,
    gunpowderPerBroadside: 1080,
    gunpowderTonsPerBroadside: 10.8,
    hullRepairsPerSet: 40,
    hullRepairsTonsPerSet: 50,
    rigRepairsPerSet: 105,
    rigRepairsTonsPerSet: 135,
    medicinePerSet: 580,
    medicineTonsPerSet: 29,
    baseCargoCapacity: 1100,
    baseSpeed: 8
  },
  'Bellona': {
    ballsPerBroadside: 74,
    ballsTonsPerBroadside: 1.5,
    gunpowderPerBroadside: 740,
    gunpowderTonsPerBroadside: 7.4,
    hullRepairsPerSet: 28,
    hullRepairsTonsPerSet: 35,
    rigRepairsPerSet: 80,
    rigRepairsTonsPerSet: 100,
    medicinePerSet: 420,
    medicineTonsPerSet: 21,
    baseCargoCapacity: 720,
    baseSpeed: 9.5
  },
  'Endymion': {
    ballsPerBroadside: 40,
    ballsTonsPerBroadside: 0.8,
    gunpowderPerBroadside: 400,
    gunpowderTonsPerBroadside: 4.0,
    hullRepairsPerSet: 18,
    hullRepairsTonsPerSet: 22,
    rigRepairsPerSet: 48,
    rigRepairsTonsPerSet: 60,
    medicinePerSet: 250,
    medicineTonsPerSet: 12.5,
    baseCargoCapacity: 420,
    baseSpeed: 12
  },
  'Trincomalee': {
    ballsPerBroadside: 38,
    ballsTonsPerBroadside: 0.76,
    gunpowderPerBroadside: 380,
    gunpowderTonsPerBroadside: 3.8,
    hullRepairsPerSet: 17,
    hullRepairsTonsPerSet: 21,
    rigRepairsPerSet: 45,
    rigRepairsTonsPerSet: 56,
    medicinePerSet: 240,
    medicineTonsPerSet: 12,
    baseCargoCapacity: 400,
    baseSpeed: 12.5
  }
}

interface LoadCalculatorProps {
  shipName: string
  broadsides: number
  repairSets: number
  onChange: (broadsides: number, repairSets: number) => void
  className?: string
  showFullCalculator?: boolean // Show full calculator or simplified view
  frame?: string // Frame wood selection
  planking?: string // Planking wood selection
  alwaysExpanded?: boolean // If true, skip the collapsible header and show content directly
}

export default function LoadCalculator({
  shipName,
  broadsides,
  repairSets,
  onChange,
  className = "",
  showFullCalculator = true,
  frame,
  planking,
  alwaysExpanded = false
}: LoadCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const shipData = SHIP_LOAD_DATA[shipName]
  
  // Calculate wood modifiers for dynamic values
  const woodModifiers = calculateWoodModifiers(frame, planking)
  
  // Apply wood modifiers to base ship stats
  const modifiedCargoCapacity = Math.round(applyWoodModifiers(shipData?.baseCargoCapacity || 0, woodModifiers['Hold weight'] || 0))
  const modifiedSpeed = applyCaps(
    applyWoodModifiers(shipData?.baseSpeed || 0, woodModifiers['Max speed'] || 0),
    'Max speed'
  )
  
  if (!shipData) {
    return (
      <div className={`border border-navy-dark/30 rounded-lg p-3 ${className}`}>
        <div className="text-sm font-medium text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
          Load Calculator
          <span className="text-xs text-navy-dark/60 ml-2">
            (Not available for {shipName})
          </span>
        </div>
      </div>
    )
  }

  // ...existing calculation code...

  const calculation: LoadoutCalculation = {
    broadsides,
    repairSets,
    balls: shipData.ballsPerBroadside * broadsides,
    ballsTons: shipData.ballsTonsPerBroadside * broadsides,
    gunpowder: shipData.gunpowderPerBroadside * broadsides,
    gunpowderTons: shipData.gunpowderTonsPerBroadside * broadsides,
    hullRepairs: shipData.hullRepairsPerSet * repairSets,
    hullRepairsTons: shipData.hullRepairsTonsPerSet * repairSets,
    rigRepairs: shipData.rigRepairsPerSet * repairSets,
    rigRepairsTons: shipData.rigRepairsTonsPerSet * repairSets,
    medicine: shipData.medicinePerSet * repairSets,
    medicineTons: shipData.medicineTonsPerSet * repairSets,
    totalTons: 0,
    cargoPercentage: 0,
    speedKnots: modifiedSpeed // Use modified speed instead of base speed
  }

  calculation.totalTons = calculation.ballsTons + calculation.gunpowderTons + 
                         calculation.hullRepairsTons + calculation.rigRepairsTons + 
                         calculation.medicineTons

  calculation.cargoPercentage = Math.round((calculation.totalTons / modifiedCargoCapacity) * 100)

  // Content to display
  const calculatorContent = (
    <div className="space-y-4">
      {/* Input Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-navy-dark mb-1" style={{fontFamily: 'Cinzel, serif'}}>
            Broadsides
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={broadsides}
            onChange={(e) => onChange(parseInt(e.target.value) || 0, repairSets)}
            className="w-full border border-navy-dark rounded px-2 py-1 text-sm focus:outline-none focus:border-brass transition-colors"
            style={{fontFamily: 'Crimson Text, serif'}}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-dark mb-1" style={{fontFamily: 'Cinzel, serif'}}>
            Repair Sets
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={repairSets}
            onChange={(e) => onChange(broadsides, parseInt(e.target.value) || 0)}
            className="w-full border border-navy-dark rounded px-2 py-1 text-sm focus:outline-none focus:border-brass transition-colors"
            style={{fontFamily: 'Crimson Text, serif'}}
          />
        </div>
      </div>

      {/* Calculations Display */}
      <div className="space-y-2 text-xs" style={{fontFamily: 'Crimson Text, serif'}}>
        <div className="font-medium text-navy-dark border-b border-navy-dark/20 pb-1" style={{fontFamily: 'Cinzel, serif'}}>
          {showFullCalculator ? 'Ammunition & Supplies:' : 'Required Supplies:'}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-navy-dark">
            <span className="font-medium">{calculation.balls}</span> balls
          </div>
          <div className="text-navy-dark/70">
            {calculation.ballsTons}t
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-navy-dark">
            <span className="font-medium">{calculation.gunpowder}</span> gunpowder
          </div>
          <div className="text-navy-dark/70">
            {calculation.gunpowderTons}t
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-navy-dark">
            <span className="font-medium">{calculation.hullRepairs}</span> hull repairs
          </div>
          <div className="text-navy-dark/70">
            {calculation.hullRepairsTons}t
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-navy-dark">
            <span className="font-medium">{calculation.rigRepairs}</span> rig repairs
          </div>
          <div className="text-navy-dark/70">
            {calculation.rigRepairsTons}t
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="text-navy-dark">
            <span className="font-medium">{calculation.medicine}</span> medicine
          </div>
          <div className="text-navy-dark/70">
            {calculation.medicineTons}t
          </div>
        </div>

        {showFullCalculator && (
          <>
            {/* Wood Modifiers Section */}
            {(frame || planking) && (
              <div className="border-t border-navy-dark/20 pt-2 mt-2">
                <div className="font-medium text-navy-dark border-b border-navy-dark/20 pb-1 mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                  Wood Effects:
                </div>
                {frame && (
                  <div className="text-xs text-navy-dark mb-1">
                    Frame: <span className="font-medium">{frame}</span>
                  </div>
                )}
                {planking && (
                  <div className="text-xs text-navy-dark mb-1">
                    Planking: <span className="font-medium">{planking}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-navy-dark">
                    Hold Capacity: <span className="font-medium">{modifiedCargoCapacity}t</span>
                  </div>
                  <div className="text-navy-dark">
                    {woodModifiers['Hold weight'] !== 0 && (
                      <span className={woodModifiers['Hold weight'] > 0 ? 'text-green-600' : 'text-red-600'}>
                        ({woodModifiers['Hold weight'] > 0 ? '+' : ''}{woodModifiers['Hold weight']}%)
                      </span>
                    )}
                  </div>
                  <div className="text-navy-dark">
                    Max Speed: <span className="font-medium">{modifiedSpeed.toFixed(1)} knots</span>
                  </div>
                  <div className="text-navy-dark">
                    {woodModifiers['Max speed'] !== 0 && (
                      <span className={woodModifiers['Max speed'] > 0 ? 'text-green-600' : 'text-red-600'}>
                        ({woodModifiers['Max speed'] > 0 ? '+' : ''}{woodModifiers['Max speed']}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Ship Performance Section */}
            <div className="border-t border-navy-dark/20 pt-2 mt-2">
              <div className="font-medium text-navy-dark border-b border-navy-dark/20 pb-1 mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Ship Performance:
              </div>
              <div className="grid grid-cols-2 gap-2 font-medium text-navy-dark">
                <div>Total Weight:</div>
                <div>{calculation.totalTons}t</div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-medium text-navy-dark">
                <div>Cargo Used:</div>
                <div className={calculation.cargoPercentage > 95 ? 'text-red-600' : 'text-green-600'}>
                  {calculation.cargoPercentage}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 font-medium text-navy-dark">
                <div>Speed:</div>
                <div>{calculation.speedKnots.toFixed(1)} knots</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // If alwaysExpanded, return content directly without collapsible header
  if (alwaysExpanded) {
    return (
      <div className={`border border-navy-dark/30 rounded-lg p-3 ${className}`}>
        {calculatorContent}
      </div>
    )
  }

  // Default collapsible behavior
  return (
    <div className={`border border-navy-dark/30 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-3 text-sm font-medium text-navy-dark flex justify-between items-center hover:bg-navy-dark/5 transition-colors"
        style={{fontFamily: 'Cinzel, serif'}}
      >
        Load Calculator
        <span className="text-xs text-navy-dark/60">
          {calculation.totalTons}t ({calculation.cargoPercentage}%) {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-navy-dark/30 p-3">
          {calculatorContent}
        </div>
      )}
    </div>
  )
}

// Export calculation function for other components to use
export function calculateShipLoad(
  shipName: string, 
  broadsides: number, 
  repairSets: number, 
  frame?: string, 
  planking?: string
) {
  const shipData = SHIP_LOAD_DATA[shipName]
  if (!shipData) return null

  // Calculate wood modifiers for dynamic values
  const woodModifiers = calculateWoodModifiers(frame, planking)
  const modifiedCargoCapacity = Math.round(applyWoodModifiers(shipData.baseCargoCapacity, woodModifiers['Hold weight'] || 0))
  const modifiedSpeed = applyCaps(
    applyWoodModifiers(shipData.baseSpeed, woodModifiers['Max speed'] || 0),
    'Max speed'
  )

  const balls = shipData.ballsPerBroadside * broadsides
  const gunpowder = shipData.gunpowderPerBroadside * broadsides
  const hullRepairs = shipData.hullRepairsPerSet * repairSets
  const rigRepairs = shipData.rigRepairsPerSet * repairSets
  const medicine = shipData.medicinePerSet * repairSets
  
  const totalTons = (shipData.ballsTonsPerBroadside * broadsides) +
                   (shipData.gunpowderTonsPerBroadside * broadsides) +
                   (shipData.hullRepairsTonsPerSet * repairSets) +
                   (shipData.rigRepairsTonsPerSet * repairSets) +
                   (shipData.medicineTonsPerSet * repairSets)

  return {
    balls,
    gunpowder,
    hullRepairs,
    rigRepairs,
    medicine,
    totalTons,
    cargoCapacity: modifiedCargoCapacity,
    cargoPercentage: Math.round((totalTons / modifiedCargoCapacity) * 100),
    speed: modifiedSpeed
  }
}
