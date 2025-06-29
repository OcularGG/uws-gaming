import { PrismaClient } from '@prisma/client';

// Import port data manually
const naPortNames = [
  "Port-au-Prince", "La Habana", "Kingston", "Cartagena", "Caracas", "Willemstad",
  "Gustavia", "Road Town", "Bridgetown", "Fort-de-France", "Pointe-à-Pitre", "Basse-Terre",
  "Roseau", "Castries", "Port of Spain", "George Town", "Nassau", "Marsh Harbour",
  // Add more ports as needed
];

const ships = [
  "Santisima", "L'Ocean", "Santa Ana", "Victory", "DLC Victory", "Christian VII",
  "Bucentaure", "Redoutable", "Implacable", "St. Pavel", "Bellona", "3rd Rate (74)",
  // Add more ships as needed
];

const defaultClans = [
  { name: "Kraken Gaming", tag: "KG", description: "Main clan" },
  { name: "Pirates United", tag: "PU", description: "Pirate crew" },
  { name: "Naval Academy", tag: "NA", description: "Training clan" },
  // Add more clans as needed
];

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed ports
  console.log('Seeding ports...');
  for (const portName of naPortNames) {
    await prisma.port.upsert({
      where: { name: portName },
      update: {},
      create: {
        name: portName,
        region: null, // You can add regions later if needed
        isActive: true
      }
    });
  }

  // Seed clans
  console.log('Seeding clans...');
  for (const clanData of defaultClans) {
    await prisma.clan.upsert({
      where: { name: clanData.name },
      update: {},
      create: {
        name: clanData.name,
        tag: clanData.tag,
        description: clanData.description,
        isActive: true
      }
    });
  }

  // Create admin users
  console.log('Creating admin users...');

  // Hash the default admin password
  const bcrypt = require('bcryptjs');
  const defaultAdminPassword = 'KrakenAdmin2025!'; // Default admin password
  const hashedPassword = await bcrypt.hash(defaultAdminPassword, 12);

  // Main admin user with Discord ID and email
  const discordAdmin = await prisma.user.upsert({
    where: { discordId: '1207434980855259206' },
    update: {
      canCreatePortBattles: true,
      email: 'admin@krakengaming.org',
      password: hashedPassword
    },
    create: {
      email: 'admin@krakengaming.org',
      username: 'KrakenAdmin',
      discordId: '1207434980855259206',
      password: hashedPassword,
      canCreatePortBattles: true
    }
  });

  // Email-based admin user (create separate if needed)
  let emailAdmin = discordAdmin;

  // Check if we need a separate email-only admin
  const existingEmailAdmin = await prisma.user.findUnique({
    where: { email: 'admin@krakengaming.org' }
  });

  if (!existingEmailAdmin && discordAdmin.email !== 'admin@krakengaming.org') {
    emailAdmin = await prisma.user.create({
      data: {
        email: 'admin@krakengaming.org',
        username: 'AdminUser',
        password: hashedPassword,
        canCreatePortBattles: true
      }
    });
  }

  // Use the admin user for port battle creation
  const testUser = emailAdmin;

  console.log('✅ Admin users created:');
  console.log(`   Email: admin@krakengaming.org`);
  console.log(`   Password: ${defaultAdminPassword}`);
  console.log(`   Discord ID: ${discordAdmin.discordId || 'N/A'}`);
  console.log(`   Username: ${emailAdmin.username}`);

  // Create a sample port battle
  console.log('Creating sample port battle...');
  const portBattle = await prisma.portBattle.create({
    data: {
      creatorId: testUser.id,
      portName: 'Havana',
      meetupTime: new Date('2025-06-30T18:00:00.000Z'),
      battleStartTime: new Date('2025-06-30T19:00:00.000Z'),
      isDeepWater: true,
      meetupLocation: 'Havana Port',
      brLimit: 2500,
      commanderName: 'Admiral Nelson',
      secondICName: 'Captain Hardy',
      reqCommanderName: 'Captain Pellew',
      fleetSetups: {
        create: {
          setupName: 'Main Fleet',
          isActive: true,
          setupOrder: 1,
          roles: {
            create: [
              {
                roleOrder: 1,
                shipName: 'Victory',
                brValue: 500
              },
              {
                roleOrder: 2,
                shipName: 'Bellona',
                brValue: 350
              },
              {
                roleOrder: 3,
                shipName: 'Endymion',
                brValue: 250
              },
              {
                roleOrder: 4,
                shipName: 'Hermes',
                brValue: 150
              }
            ]
          }
        }
      }
    }
  });

  // Create a captains code for testing
  console.log('Creating test captains code...');
  await prisma.captainsCode.create({
    data: {
      code: 'TESTKRAKEN',
      portBattleId: portBattle.id,
      description: 'Test code for development',
      isActive: true,
      maxUsage: 10,
      expiresAt: new Date('2025-12-31T23:59:59.000Z')
    }
  });

  // Seed command structure roles
  console.log('Seeding command structure roles...');

  const commandRoles = [
    {
      title: 'Fleet Admiral',
      description: 'Supreme naval command authority for all operations',
      level: 5,
      permissions: ['ALL', 'CREATE_PORT_BATTLES', 'MANAGE_FLEETS', 'ADMIN_PANEL', 'ASSIGN_ROLES'],
      flagCountry: 'us'
    },
    {
      title: 'Port Battle Commander',
      description: 'Leads and coordinates port battle operations',
      level: 4,
      permissions: ['CREATE_PORT_BATTLES', 'MANAGE_FLEETS', 'COMMAND_FLEETS'],
      flagCountry: 'gb'
    },
    {
      title: 'Fleet Captain',
      description: 'Commands individual fleets during port battles',
      level: 3,
      permissions: ['COMMAND_FLEETS', 'MANAGE_SHIPS'],
      flagCountry: 'fr'
    },
    {
      title: 'Quartermaster',
      description: 'Manages fleet logistics and supplies',
      level: 2,
      permissions: ['MANAGE_SUPPLIES', 'VIEW_REPORTS'],
      flagCountry: 'es'
    },
    {
      title: 'Scout Commander',
      description: 'Leads reconnaissance and intelligence operations',
      level: 2,
      permissions: ['LEAD_SCOUTS', 'GATHER_INTEL'],
      flagCountry: 'pirates'
    }
  ];

  for (const role of commandRoles) {
    // Check if role already exists
    const existingRole = await prisma.commandStructureRole.findFirst({
      where: { title: role.title }
    });

    if (!existingRole) {
      await prisma.commandStructureRole.create({
        data: {
          title: role.title,
          description: role.description,
          level: role.level,
          permissions: JSON.stringify(role.permissions),
          flagCountry: role.flagCountry,
          isActive: true
        }
      });
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
