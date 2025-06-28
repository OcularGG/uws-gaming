import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FEATURES_FILE = path.join(process.cwd(), 'data', 'feature-cards.json');

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

const defaultFeatures: FeatureCard[] = [
  {
    id: '1',
    title: 'Elite Naval Command',
    description: 'Lead legendary fleets across the Caribbean with tactical precision and strategic mastery.',
    icon: '⚓',
    order: 1
  },
  {
    id: '2',
    title: 'Strategic Port Battles',
    description: 'Engage in massive coordinated naval warfare with up to 50 ships per battle.',
    icon: '🏴‍☠️',
    order: 2
  },
  {
    id: '3',
    title: 'Brotherhood of the Sea',
    description: 'Join a community of dedicated captains united under the Kraken banner.',
    icon: '🦑',
    order: 3
  }
];

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readFeatures(): Promise<FeatureCard[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(FEATURES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultFeatures;
  }
}

async function writeFeatures(features: FeatureCard[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(FEATURES_FILE, JSON.stringify(features, null, 2));
}

export async function GET() {
  try {
    const features = await readFeatures();
    return NextResponse.json(features.sort((a, b) => a.order - b.order));
  } catch (error) {
    console.error('Error fetching feature cards:', error);
    return NextResponse.json(defaultFeatures);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Expected array of feature cards' },
        { status: 400 }
      );
    }

    // Validate and clean the data
    const features: FeatureCard[] = data.map((feature, index) => ({
      id: feature.id || String(index + 1),
      title: feature.title || '',
      description: feature.description || '',
      icon: feature.icon || '⚓',
      order: feature.order || index + 1
    }));

    await writeFeatures(features);
    return NextResponse.json(features.sort((a, b) => a.order - b.order));
  } catch (error) {
    console.error('Error saving feature cards:', error);
    return NextResponse.json(
      { error: 'Failed to save feature cards' },
      { status: 500 }
    );
  }
}
