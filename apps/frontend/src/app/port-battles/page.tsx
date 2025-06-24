'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Constants for the PB system
const SHIP_NAMES = {
  "Santisima": 278,
  "L'Ocean": 239,
  "Santa Ana": 225,
  "Victory": 216,
  "DLC Victory": 224,
  "Christian VII": 164,
  "Bucentaure": 161,
  "Redoutable": 148,
  "Implacable": 163,
  "St. Pavel": 150,
  "Bellona": 134,
  "3rd Rate (74)": 132,
  "Wasa": 125,
  "USS United States": 96,
  "Constitution": 96,
  "Rättvisan": 107,
  "Agamemnon": 114,
  "Leopard": 95,
  "Indefatigable": 79,
  "Ingermanland": 111,
  "Wapen von Hamburg III": 120,
  "Endymion": 85,
  "Trincomalee": 87,
  "Diana": 78,
  "L'Hermione": 72,
  "Santa Cecilia": 72,
  "Essex": 71,
  "Pirate Frigate(Cherubim)": 67,
  "Belle Poule": 65,
  "Frigate (Cherubim)": 66,
  "LGV Refit": 40,
  "Indiaman": 37,
  "Surprise": 64,
  "Renommee": 38,
  "Le Gros Ventre": 28,
  "Hercules": 58,
  "Rattlesnake Heavy": 32,
  "Pandora": 65,
  "Le Requin": 30,
  "Cerberus": 33,
  "Niagara": 25,
  "Mortar Brig": 15,
  "Prince de Neufchatel": 25,
  "Snow (Ontario)": 27,
  "Mercury": 25,
  "Rattlesnake": 22,
  "Navy Brig (Fair American)": 22,
  "Trader Snow": 26,
  "Brig (Fair American)": 20,
  "Pickle": 15,
  "Yacht": 15,
  "Privateer": 15,
  "Cutter (Alert)": 15,
  "Trader Lynx": 13,
  "Lynx": 13,
  "ADR": 143,
  "Duke Of Kent": 353,
  "San Pedro": 164
};

const CLAN_NAMES = [
  "CLAN1", "CLAN2", "CLAN3", "CLAN4", "CLAN5", "Independent"
];

const NATIONS = [
  "Great Britain",
  "United States of America (USA)",
  "France",
  "the Pirates",
  "Russia",
  "Sweden"
];

// TypeScript interfaces
interface FleetRole {
  id: string;
  roleName: string;
  expectedShip?: string;
}

interface FleetComposition {
  id: string;
  name: string; // "Main", "Alternate 1", "Alternate 2"
  roles: FleetRole[];
}

interface SignUpEntry {
  id: string;
  roleId: string;
  captainName: string;
  clan: string;
  ship: string;
  books: number;
  alternateShip: string;
  alternateBooks: number;
  willingToScreen: boolean;
  comments: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
}

interface ScreeningFleet {
  id: string;
  portBattleId: string;
  screeningType: 'Offensive' | 'Defensive';
  observation: string;
  shipsSpecific?: string[];
  rateCategories?: string[];
  nation: string;
  commander: string;
  captains: Array<{
    name: string;
    clan: string;
  }>;
}

interface PortBattle {
  id: string;
  portName: string;
  meetupTime: string; // UTC
  battleStartTime: string; // UTC
  waterType: 'Deep Water' | 'Shallow Water';
  meetupLocation: string;
  pbCommander: string;
  secondICCommander: string;
  reqCommander: string;
  totalBRLimit: number;
  creatorId: string;
  fleetCompositions: FleetComposition[];
  activeFleetId: string; // ID of currently active fleet composition
  signUps: SignUpEntry[];
  screeningFleets: ScreeningFleet[];
  createdAt: string;
}

export default function PortBattlePage() {
  const { data: session } = useSession();
  const [portBattles, setPortBattles] = useState<PortBattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPB, setSelectedPB] = useState<PortBattle | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'create' | 'manage'>('list');

  // Create form state
  const [createForm, setCreateForm] = useState({
    portName: '',
    meetupTime: '',
    battleStartTime: '',
    waterType: 'Deep Water' as 'Deep Water' | 'Shallow Water',
    meetupLocation: '',
    pbCommander: '',
    secondICCommander: '',
    reqCommander: '',
    totalBRLimit: 2000,
    mainFleetRoles: 1,
    alt1FleetRoles: 0,
    alt2FleetRoles: 0
  });

  useEffect(() => {
    fetchPortBattles();
  }, []);

  const fetchPortBattles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/port-battles');
      if (response.ok) {
        const data = await response.json();
        setPortBattles(data.portBattles || []);
      }
    } catch (error) {
      console.error('Failed to fetch port battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short'
    });
  };

  const calculateUsedBR = (pb: PortBattle) => {
    const activeFleet = pb.fleetCompositions.find(f => f.id === pb.activeFleetId);
    if (!activeFleet) return 0;

    let totalBR = 0;
    activeFleet.roles.forEach(role => {
      const signUp = pb.signUps.find(s => s.roleId === role.id && s.status === 'approved');
      if (signUp) {
        const shipBR = SHIP_NAMES[signUp.ship as keyof typeof SHIP_NAMES] || 0;
        totalBR += shipBR;
      }
    });

    return totalBR;
  };

  const renderPortBattleList = () => {
    if (loading) {
      return (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 loading-anchor">⚓</div>
          <p className="text-navy-dark text-xl" style={{fontFamily: 'Cinzel, serif'}}>
            Loading Port Battles...
          </p>
        </div>
      );
    }

    if (portBattles.length === 0) {
      return (
        <div className="neo-brutal-box max-w-2xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            No Port Battles Scheduled
          </h2>
          <p className="text-navy-dark mb-6" style={{fontFamily: 'Crimson Text, serif'}}>
            Be the first to organize a port battle and rally the fleet!
          </p>
          {session && (
            <button
              onClick={() => setViewMode('create')}
              className="neo-brutal-button bg-brass text-navy-dark px-6 py-3"
            >
              Create Port Battle
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {portBattles.map((pb) => {
          const usedBR = calculateUsedBR(pb);
          const remainingBR = pb.totalBRLimit - usedBR;
          const activeFleet = pb.fleetCompositions.find(f => f.id === pb.activeFleetId);
          const filledRoles = activeFleet ? pb.signUps.filter(s =>
            activeFleet.roles.some(r => r.id === s.roleId) && s.status === 'approved'
          ).length : 0;
          const totalRoles = activeFleet ? activeFleet.roles.length : 0;

          return (
            <div key={pb.id} className="neo-brutal-box p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                    {pb.portName}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Meetup:</strong> {formatDateTime(pb.meetupTime)}</p>
                      <p><strong>Battle Start:</strong> {formatDateTime(pb.battleStartTime)}</p>
                      <p><strong>Water Type:</strong> {pb.waterType}</p>
                    </div>
                    <div>
                      <p><strong>Location:</strong> {pb.meetupLocation}</p>
                      <p><strong>PB Commander:</strong> {pb.pbCommander}</p>
                      <p><strong>BR Used:</strong> {usedBR}/{pb.totalBRLimit} ({remainingBR} remaining)</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPB(pb);
                      setViewMode('detail');
                    }}
                    className="neo-brutal-button bg-brass text-navy-dark px-4 py-2"
                  >
                    View Details
                  </button>
                  {session?.user && session.user.discordId === pb.creatorId && (
                    <button
                      onClick={() => {
                        setSelectedPB(pb);
                        setViewMode('manage');
                      }}
                      className="neo-brutal-button bg-sail-white text-navy-dark px-4 py-2"
                    >
                      Manage
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-sandstone-100 p-4 border-2 border-navy-dark">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Fleet Status:</span>
                  <span className={`px-3 py-1 rounded ${
                    filledRoles === totalRoles ? 'bg-green-200 text-green-800' :
                    filledRoles > totalRoles * 0.7 ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {filledRoles}/{totalRoles} roles filled
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-sandstone-light pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
            <span className="text-brass">Port Battle</span> Command
          </h1>
          <p className="text-xl text-navy-dark/80 max-w-3xl mx-auto" style={{fontFamily: 'Crimson Text, serif'}}>
            Organize and join strategic port battle operations
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`neo-brutal-button px-6 py-3 ${
                viewMode === 'list' ? 'bg-brass-bright text-navy-dark' : 'bg-sail-white text-navy-dark'
              }`}
            >
              All Port Battles
            </button>
            {session && (
              <button
                onClick={() => setViewMode('create')}
                className={`neo-brutal-button px-6 py-3 ${
                  viewMode === 'create' ? 'bg-brass-bright text-navy-dark' : 'bg-sail-white text-navy-dark'
                }`}
              >
                Create New
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' && renderPortBattleList()}

        {viewMode === 'create' && (
          <div className="max-w-4xl mx-auto">
            <div className="neo-brutal-box p-8">
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Create New Port Battle
              </h2>
              <p className="text-navy-dark/80 mb-8">Coming soon - Full creation form with fleet composition setup</p>
              <button
                onClick={() => setViewMode('list')}
                className="neo-brutal-button bg-cannon-smoke text-sail-white px-6 py-3"
              >
                Back to List
              </button>
            </div>
          </div>
        )}

        {viewMode === 'detail' && selectedPB && (
          <div className="max-w-6xl mx-auto">
            <div className="neo-brutal-box p-8">
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                {selectedPB.portName} - Details
              </h2>
              <p className="text-navy-dark/80 mb-8">Coming soon - Detailed view with sign-up sheet</p>
              <button
                onClick={() => setViewMode('list')}
                className="neo-brutal-button bg-cannon-smoke text-sail-white px-6 py-3"
              >
                Back to List
              </button>
            </div>
          </div>
        )}

        {viewMode === 'manage' && selectedPB && (
          <div className="max-w-6xl mx-auto">
            <div className="neo-brutal-box p-8">
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Manage {selectedPB.portName}
              </h2>
              <p className="text-navy-dark/80 mb-8">Coming soon - Management interface with approval queue</p>
              <button
                onClick={() => setViewMode('list')}
                className="neo-brutal-button bg-cannon-smoke text-sail-white px-6 py-3"
              >
                Back to List
              </button>
            </div>
          </div>
        )}

        {/* Subtle Login Prompt for Non-authenticated Users */}
        {!session && (
          <div className="text-center mt-12">
            <p className="text-navy-dark/70 mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
              Want to create or join port battles?
              <Link
                href="/api/auth/signin"
                className="text-brass hover:text-brass-bright underline ml-2 font-semibold"
              >
                Join the Fleet
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
