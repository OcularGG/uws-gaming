import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const WELCOME_FILE = path.join(process.cwd(), 'data', 'welcome-content.json');

interface WelcomeContent {
  title: string;
  content: string;
}

const defaultWelcome: WelcomeContent = {
  title: 'Welcome Aboard Captain',
  content: `Congratulations on taking the first step toward joining the most elite naval command in the Caribbean. Your journey with Kraken Gaming begins with understanding what it means to sail under our colors.

**What We Stand For:**
• **Excellence in Leadership** - Every captain commands with skill and honor
• **Brotherhood of the Sea** - United we sail, divided we sink
• **Strategic Mastery** - Victory through superior tactics and coordination
• **Maritime Tradition** - Respecting the rich history of naval warfare

**Your Next Steps:**
1. **Complete Your Application** - Provide detailed information about your naval experience
2. **Discord Integration** - Join our communication channels for real-time coordination
3. **Training Period** - Demonstrate your skills in training exercises
4. **Fleet Assignment** - Receive your official position and ship assignment

The Caribbean awaits your command, Captain. Together, we shall rule the seas.`
};

async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readWelcome(): Promise<WelcomeContent> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(WELCOME_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultWelcome;
  }
}

async function writeWelcome(welcome: WelcomeContent): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(WELCOME_FILE, JSON.stringify(welcome, null, 2));
}

export async function GET() {
  try {
    const welcome = await readWelcome();
    return NextResponse.json(welcome);
  } catch (error) {
    console.error('Error fetching welcome content:', error);
    return NextResponse.json(defaultWelcome);
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

    const welcome: WelcomeContent = {
      title: data.title,
      content: data.content
    };

    await writeWelcome(welcome);
    return NextResponse.json(welcome);
  } catch (error) {
    console.error('Error saving welcome content:', error);
    return NextResponse.json(
      { error: 'Failed to save welcome content' },
      { status: 500 }
    );
  }
}
