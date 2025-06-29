import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultClans = [
  'UWS',           // United We Stand
  'HAVOC',         // High Activity Veteran Officers Corps
  'ELITE',         // Elite Naval Academy
  'CREW',          // Caribbean Regional Elite Warriors
  'STORM',         // Strategic Tactical Operations and Reconnaissance Marines
  'TIDE',          // Tactical Intelligence and Defense Engineers
  'WIND',          // Warriors in Naval Defense
  'WAVE',          // Warriors and Veteran Expeditionary
  'REEF',          // Reconnaissance Elite Expeditionary Force
  'SALT',          // Strategic Assault and Logistics Team
  'FURY',          // Fleet United Reconnaissance Yards
  'BLADE',         // Brotherhood of Loyal and Dedicated Elites
  'HONOR',         // Heroes of Naval Operations and Reconnaissance
  'VALOR',         // Veteran Alliance of Loyal Officers and Recruits
  'GLORY',         // Guardians of Liberty and Oceanic Reconnaissance Yards
  'Independent'    // For players not in a clan
];

async function seedClans() {
  console.log('🌱 Seeding clans...');

  for (const clanName of defaultClans) {
    await prisma.clan.upsert({
      where: { name: clanName },
      update: {},
      create: {
        name: clanName,
        isActive: true
      }
    });
  }

  console.log(`✅ Seeded ${defaultClans.length} clans`);
}

async function main() {
  try {
    await seedClans();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
