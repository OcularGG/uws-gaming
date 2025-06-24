import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (shared with main gallery route in production use database)
const favorites: { id: string; galleryItemId: string; userId: string; createdAt: string }[] = [];

export async function POST(request: NextRequest) {
  try {
    const { itemId, userId } = await request.json();

    if (!itemId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already favorited
    const existingFavorite = favorites.find(
      fav => fav.galleryItemId === itemId && fav.userId === userId
    );

    if (existingFavorite) {
      return NextResponse.json({ error: 'Item already favorited' }, { status: 400 });
    }

    // Add to favorites
    const newFavorite = {
      id: Date.now().toString(),
      galleryItemId: itemId,
      userId,
      createdAt: new Date().toISOString()
    };
    favorites.push(newFavorite);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Favorite POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { itemId, userId } = await request.json();

    if (!itemId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Remove from favorites
    const favoriteIndex = favorites.findIndex(
      fav => fav.galleryItemId === itemId && fav.userId === userId
    );

    if (favoriteIndex !== -1) {
      favorites.splice(favoriteIndex, 1);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Favorite DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const userFavorites = favorites.filter(fav => fav.userId === userId);

    return NextResponse.json({ favorites: userFavorites }, { status: 200 });
  } catch (error) {
    console.error('Favorite GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
