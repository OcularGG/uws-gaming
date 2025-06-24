import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (shared with main gallery route in production use database)
const comments: { 
  id: string; 
  galleryItemId: string; 
  userId: string; 
  userName: string; 
  content: string; 
  createdAt: string; 
  updatedAt?: string;
}[] = [];

export async function POST(request: NextRequest) {
  try {
    const { itemId, userId, userName, content } = await request.json();

    if (!itemId || !userId || !userName || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 characters)' }, { status: 400 });
    }

    // Create new comment
    const newComment = {
      id: Date.now().toString(),
      galleryItemId: itemId,
      userId,
      userName,
      content: content.trim(),
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error) {
    console.error('Comment POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const itemComments = comments
      .filter(comment => comment.galleryItemId === itemId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ comments: itemComments }, { status: 200 });
  } catch (error) {
    console.error('Comment GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const userId = searchParams.get('userId');

    if (!commentId || !userId) {
      return NextResponse.json({ error: 'Comment ID and User ID required' }, { status: 400 });
    }

    const commentIndex = comments.findIndex(comment => 
      comment.id === commentId && comment.userId === userId
    );

    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found or unauthorized' }, { status: 404 });
    }

    comments.splice(commentIndex, 1);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Comment DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { commentId, userId, content } = await request.json();

    if (!commentId || !userId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 characters)' }, { status: 400 });
    }

    const commentIndex = comments.findIndex(comment => 
      comment.id === commentId && comment.userId === userId
    );

    if (commentIndex === -1) {
      return NextResponse.json({ error: 'Comment not found or unauthorized' }, { status: 404 });
    }

    comments[commentIndex] = {
      ...comments[commentIndex],
      content: content.trim(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({ comment: comments[commentIndex] }, { status: 200 });
  } catch (error) {
    console.error('Comment PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
