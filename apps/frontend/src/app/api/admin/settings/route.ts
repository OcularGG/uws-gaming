import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'site-settings.json');

interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  commandStructure: Array<{ role: string; name: string }>;
}

const defaultSettings: SiteSettings = {
  siteName: 'KrakenGaming',
  tagline: 'Legendary Fleet Command',
  description: 'Join the most prestigious naval command in the Caribbean. Elite captains, strategic warfare, and maritime dominance await.',
  commandStructure: [
    { role: 'Fleet Admiral', name: 'Supreme Commander' },
    { role: 'Admiral', name: 'Fleet Operations' },
    { role: 'Commodore', name: 'Squadron Leader' },
    { role: 'Captain', name: 'Ship Commander' }
  ]
};

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readSettings(): Promise<SiteSettings> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultSettings;
  }
}

async function writeSettings(settings: SiteSettings): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(defaultSettings);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.siteName || !data.tagline || !data.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const settings: SiteSettings = {
      siteName: data.siteName,
      tagline: data.tagline,
      description: data.description,
      commandStructure: data.commandStructure || []
    };

    await writeSettings(settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error saving site settings:', error);
    return NextResponse.json(
      { error: 'Failed to save site settings' },
      { status: 500 }
    );
  }
}
