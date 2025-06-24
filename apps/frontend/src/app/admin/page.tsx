'use client';

import { useState } from 'react';

// Mock data - this would come from your database
const mockUsers = [
  { id: 1, discordId: '123456789', username: 'CHOSEN', avatar: null, role: 'Clan Founder' },
  { id: 2, discordId: '234567890', username: 'Tommy Templeman', avatar: null, role: 'Clan Leader' },
  { id: 3, discordId: '345678901', username: 'ODDBALL', avatar: null, role: 'Clan Leader' },
  { id: 4, discordId: '456789012', username: 'Yawnek', avatar: null, role: 'Clan 1st Officer' },
  { id: 5, discordId: '567890123', username: 'William Poe', avatar: null, role: 'Clan 1st Officer' },
  { id: 6, discordId: '678901234', username: 'Ash1586', avatar: null, role: 'Member' },
  { id: 7, discordId: '789012345', username: 'Consang', avatar: null, role: 'Member' },
  { id: 8, discordId: '890123456', username: 'Cpt Nelson', avatar: null, role: 'Member' },
  { id: 9, discordId: '901234567', username: 'Honey Badger', avatar: null, role: 'Member' },
  { id: 10, discordId: '012345678', username: 'Henry Henryson', avatar: null, role: 'Member' },
  { id: 11, discordId: '123450987', username: 'JustHarry', avatar: null, role: 'Member' },
];

const navalPositions = [
  'Chairman of the Defence Council and First Sea Lord',
  'Vice Chairman of the Defence Council and Second Sea Lord',
  'Vice Chairman of the Defence Council - Admiralty Board and Third Sea Lord',
  'Admiral of the Fleet',
  'Admiral - Home Fleet',
  'Vice Admiral - Home Fleet',
  'Admiral and Chairman of the Victualling Board',
  'Rear Admiral - Home Fleet',
  'Rear Admiral - Naval Attache to the People of the United States',
  'Rear Admiral - Caribbean Fleet',
  'Rear Admiral - Far East Fleet',
];

export default function AdminPage() {
  const [users] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');

  const handleAssignPosition = () => {
    if (!selectedUser || !selectedPosition) {
      alert('Please select both a user and a position');
      return;
    }

    // TODO: Implement API call to assign position
    console.log(`Assigning ${selectedUser} to position: ${selectedPosition}`);
    alert(`${selectedUser} has been assigned to: ${selectedPosition}`);

    // Reset selections
    setSelectedUser('');
    setSelectedPosition('');
  };

  return (
    <main className="min-h-screen bg-sandstone-light pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Naval Command Administration
          </h1>
          <p className="text-lg text-navy-dark/80">
            Manage officer assignments and Discord profile integration
          </p>
        </div>

        {/* Position Assignment Panel */}
        <div className="neo-brutal-box mb-8 p-6">
          <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Assign Naval Position
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Select Officer
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-3 border-2 border-brass bg-sail-white text-navy-dark font-medium"
                style={{fontFamily: 'Crimson Text, serif'}}
              >
                <option value="">Choose an officer...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.username}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-sm font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                Select Position
              </label>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full p-3 border-2 border-brass bg-sail-white text-navy-dark font-medium"
                style={{fontFamily: 'Crimson Text, serif'}}
              >
                <option value="">Choose a position...</option>
                {navalPositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAssignPosition}
            className="cta-button-brutal"
          >
            Assign Position
          </button>
        </div>

        {/* Users List */}
        <div className="neo-brutal-box p-6">
          <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            Registered Officers
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-brass">
                  <th className="text-left py-3 px-4 font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                    Username
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                    Discord ID
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                    Current Role
                  </th>
                  <th className="text-left py-3 px-4 font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                    Profile Picture
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-brass/30 hover:bg-brass/10">
                    <td className="py-3 px-4 text-navy-dark font-medium">
                      {user.username}
                    </td>
                    <td className="py-3 px-4 text-navy-dark/70 font-mono text-sm">
                      {user.discordId}
                    </td>
                    <td className="py-3 px-4 text-navy-dark/80">
                      {user.role}
                    </td>
                    <td className="py-3 px-4">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.username} avatar`}
                          className="w-8 h-8 rounded border-2 border-brass"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 border-2 border-brass flex items-center justify-center text-xs text-gray-600">
                          No Image
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-brass/20 border-l-4 border-brass">
          <h3 className="font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
            Instructions
          </h3>
          <ul className="text-navy-dark/80 space-y-1">
            <li>• Users must login with Discord to appear in this list</li>
            <li>• Profile pictures are automatically pulled from Discord profiles</li>
            <li>• Assigned positions will display the user&apos;s Discord avatar in the Naval Command section</li>
            <li>• Each officer card shows a small American flag in the top right corner</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
