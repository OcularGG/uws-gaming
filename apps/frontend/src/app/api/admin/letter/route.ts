import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const LETTER_FILE = path.join(process.cwd(), 'data', 'admiralty-letter.json');

interface AdmiraltyLetter {
  title: string;
  content: string;
  author: string;
  role?: string;
}

const defaultLetter: AdmiraltyLetter = {
  title: 'Letter from the Admiralty',
  content: `Esteemed Captain,

The winds of change blow across the Caribbean, and the time has come for those of exceptional skill and unwavering loyalty to step forward. The Kraken Gaming naval command seeks captains of the highest caliber to join our prestigious fleet.

Our operations span the vast expanse of the Caribbean, where strategic warfare and tactical brilliance determine the fate of nations. Under our banner, you will command some of the finest vessels ever to grace these waters, leading elite crews in battles that will be remembered for generations.

We offer not merely a position, but a brotherhood forged in the crucible of naval combat. Our captains are bound by honor, united in purpose, and relentless in their pursuit of maritime supremacy.

Should you possess the courage, skill, and dedication required to serve under the Kraken banner, we invite you to submit your application. Only those who demonstrate exceptional leadership and unwavering commitment to our cause will be considered.

The sea calls, Captain. Will you answer?`,
  author: 'The Admiralty',
  role: 'Naval High Command'
};

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readLetter(): Promise<AdmiraltyLetter> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(LETTER_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultLetter;
  }
}

async function writeLetter(letter: AdmiraltyLetter): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(LETTER_FILE, JSON.stringify(letter, null, 2));
}

export async function GET() {
  try {
    const letter = await readLetter();
    return NextResponse.json(letter);
  } catch (error) {
    console.error('Error fetching admiralty letter:', error);
    return NextResponse.json(defaultLetter);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const letter: AdmiraltyLetter = {
      title: data.title,
      content: data.content,
      author: data.author || 'The Admiralty'
    };

    await writeLetter(letter);
    return NextResponse.json(letter);
  } catch (error) {
    console.error('Error saving admiralty letter:', error);
    return NextResponse.json(
      { error: 'Failed to save admiralty letter' },
      { status: 500 }
    );
  }
}
