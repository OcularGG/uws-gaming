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
  title: 'Letter of Marque and Reprisal',
  content: `George the Second, by the Grace of God, King of Great Britain, France and Ireland, Defender of the Faith, &c.

To all who shall see these Presents, Greeting:

Know Ye, that We, reposing especial Trust and Confidence in the Loyalty, Courage and good Conduct of the Officers and Crew of the United We Stand naval command, do by these Presents grant unto them full Power and Authority to arm and equip suitable Vessels of War, and therewith by Force of Arms to attack, subdue, and take all Ships and other Vessels belonging to the Crown of France, or to any of the Subjects of the French King.

We do hereby authorize and empower the said United We Stand to bring such Vessels, with their Tackle, Apparel, Furniture, and Lading, into any of Our Ports within Our Dominions; and We do further will and require all Our Officers, both Civil and Military, and all others Our loving Subjects whatsoever, to be aiding and assisting unto the said United We Stand in the Execution of these Our Letters.

Given under Our Royal Seal at Our Palace of Westminster, this Twenty-eighth Day of June, in the Year of Our Lord One Thousand Seven Hundred and Twenty-five, and in the Eleventh Year of Our Reign.

By His Majesty's Command,
The Lords Commissioners of the Admiralty`,
  author: 'By Royal Authority',
  role: 'Letter of Marque issued to United We Stand'
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
