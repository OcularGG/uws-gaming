import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for port battles (replace with database in production)
let portBattles: any[] = [];
let signUps: any[] = [];
let screeningFleets: any[] = [];

// Sample data for testing
const samplePortBattles = [
  {
    id: "pb-1",
    portName: "Havana",
    meetupTime: "2025-06-30T18:00:00.000Z",
    battleStartTime: "2025-06-30T19:00:00.000Z",
    waterType: "Deep Water",
    meetupLocation: "Havana Port",
    pbCommander: "Admiral Nelson",
    secondICCommander: "Captain Hardy",
    reqCommander: "Captain Pellew",
    totalBRLimit: 2500,
    creatorId: "user-1",
    activeFleetId: "fleet-main-1",
    fleetCompositions: [
      {
        id: "fleet-main-1",
        name: "Main",
        roles: [
          { id: "role-1", roleName: "Main Line DPS", expectedShip: "Victory" },
          { id: "role-2", roleName: "Support Line", expectedShip: "Bellona" },
          { id: "role-3", roleName: "Escort Frigate", expectedShip: "Endymion" },
          { id: "role-4", roleName: "Scout", expectedShip: "Diana" },
          { id: "role-5", roleName: "Reserve Line", expectedShip: "3rd Rate (74)" }
        ]
      },
      {
        id: "fleet-alt1-1",
        name: "Alternate 1",
        roles: [
          { id: "role-alt1-1", roleName: "Heavy Line", expectedShip: "Santisima" },
          { id: "role-alt1-2", roleName: "Support", expectedShip: "Bucentaure" },
          { id: "role-alt1-3", roleName: "Frigate Screen", expectedShip: "Trincomalee" }
        ]
      }
    ],
    signUps: [
      {
        id: "signup-1",
        roleId: "role-1",
        captainName: "Captain Smith",
        clan: "CLAN1",
        ship: "Victory",
        books: 5,
        alternateShip: "Bellona",
        alternateBooks: 4,
        willingToScreen: true,
        comments: "Ready for battle!",
        status: "approved",
        submittedAt: "2025-06-25T10:00:00.000Z"
      },
      {
        id: "signup-2",
        roleId: "role-2",
        captainName: "Captain Jones",
        clan: "CLAN2",
        ship: "Bellona",
        books: 4,
        alternateShip: "Agamemnon",
        alternateBooks: 4,
        willingToScreen: false,
        comments: "",
        status: "pending",
        submittedAt: "2025-06-25T11:00:00.000Z"
      }
    ],
    screeningFleets: [],
    createdAt: "2025-06-24T10:00:00.000Z"
  },
  {
    id: "pb-2",
    portName: "Cartagena",
    meetupTime: "2025-07-02T17:30:00.000Z",
    battleStartTime: "2025-07-02T18:30:00.000Z",
    waterType: "Shallow Water",
    meetupLocation: "Cartagena Port",
    pbCommander: "Admiral Collingwood",
    secondICCommander: "Captain Troubridge",
    reqCommander: "Captain Fremantle",
    totalBRLimit: 2000,
    creatorId: "user-2",
    activeFleetId: "fleet-main-2",
    fleetCompositions: [
      {
        id: "fleet-main-2",
        name: "Main",
        roles: [
          { id: "role-2-1", roleName: "Line Ship", expectedShip: "Christian VII" },
          { id: "role-2-2", roleName: "Support", expectedShip: "Wasa" },
          { id: "role-2-3", roleName: "Frigate", expectedShip: "L'Hermione" },
          { id: "role-2-4", roleName: "Fast Scout", expectedShip: "Mercury" }
        ]
      }
    ],
    signUps: [],
    screeningFleets: [],
    createdAt: "2025-06-24T14:00:00.000Z"
  }
];

// Initialize with sample data
if (portBattles.length === 0) {
  portBattles = [...samplePortBattles];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pbId = searchParams.get('id');

    if (pbId) {
      // Return specific port battle
      const pb = portBattles.find(p => p.id === pbId);
      if (!pb) {
        return NextResponse.json({ error: 'Port battle not found' }, { status: 404 });
      }
      return NextResponse.json({ portBattle: pb });
    }

    // Return all port battles
    return NextResponse.json({ portBattles });
  } catch (error) {
    console.error('Port battles GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create') {
      // Create new port battle
      const data = await request.json();
      
      const newPB = {
        id: `pb-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        signUps: [],
        screeningFleets: []
      };

      portBattles.unshift(newPB);
      return NextResponse.json({ success: true, portBattle: newPB }, { status: 201 });
    }

    if (action === 'signup') {
      // Handle sign-up submission
      const { pbId, roleId, signUpData } = await request.json();
      
      const newSignUp = {
        id: `signup-${Date.now()}`,
        roleId,
        ...signUpData,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      // Find the port battle and add the sign-up
      const pbIndex = portBattles.findIndex(p => p.id === pbId);
      if (pbIndex === -1) {
        return NextResponse.json({ error: 'Port battle not found' }, { status: 404 });
      }

      portBattles[pbIndex].signUps.push(newSignUp);
      return NextResponse.json({ success: true, signUp: newSignUp }, { status: 201 });
    }

    if (action === 'approve-signup') {
      // Handle sign-up approval/denial
      const { signUpId, status } = await request.json();
      
      for (const pb of portBattles) {
        const signUpIndex = pb.signUps.findIndex((s: any) => s.id === signUpId);
        if (signUpIndex !== -1) {
          pb.signUps[signUpIndex].status = status;
          return NextResponse.json({ success: true });
        }
      }

      return NextResponse.json({ error: 'Sign-up not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Port battles POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pbId = searchParams.get('id');
    const action = searchParams.get('action');

    if (!pbId) {
      return NextResponse.json({ error: 'Port battle ID required' }, { status: 400 });
    }

    const pbIndex = portBattles.findIndex(p => p.id === pbId);
    if (pbIndex === -1) {
      return NextResponse.json({ error: 'Port battle not found' }, { status: 404 });
    }

    if (action === 'update-active-fleet') {
      const { activeFleetId } = await request.json();
      portBattles[pbIndex].activeFleetId = activeFleetId;
      return NextResponse.json({ success: true });
    }

    if (action === 'move-signup') {
      const { signUpId, newRoleId } = await request.json();
      const signUpIndex = portBattles[pbIndex].signUps.findIndex((s: any) => s.id === signUpId);
      
      if (signUpIndex !== -1) {
        portBattles[pbIndex].signUps[signUpIndex].roleId = newRoleId;
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Sign-up not found' }, { status: 404 });
    }

    // Update entire port battle
    const updates = await request.json();
    portBattles[pbIndex] = { ...portBattles[pbIndex], ...updates };
    
    return NextResponse.json({ success: true, portBattle: portBattles[pbIndex] });
  } catch (error) {
    console.error('Port battles PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pbId = searchParams.get('id');

    if (!pbId) {
      return NextResponse.json({ error: 'Port battle ID required' }, { status: 400 });
    }

    const pbIndex = portBattles.findIndex(p => p.id === pbId);
    if (pbIndex === -1) {
      return NextResponse.json({ error: 'Port battle not found' }, { status: 404 });
    }

    portBattles.splice(pbIndex, 1);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Port battles DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
