import { NextRequest, NextResponse } from 'next/server';
import {
  galleryItems,
  comments,
  votes,
  favorites,
  searchHistoryItems,
  createGalleryItem,
  type GalleryItem,
  type GalleryComment,
  type GalleryVote,
  type GalleryFavorite,
  type SearchHistory
} from './data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if this is a request for a specific feature
    const feature = searchParams.get('feature');
    const galleryItemId = searchParams.get('galleryItemId');
    const userId = searchParams.get('userId');

    // Handle comments endpoint
    if (feature === 'comments' && galleryItemId) {
      const itemComments = comments.filter(c => c.galleryItemId === galleryItemId);
      return NextResponse.json({ comments: itemComments });
    }

    // Handle votes endpoint
    if (feature === 'votes' && galleryItemId && userId) {
      const userVote = votes.find(v => v.galleryItemId === galleryItemId && v.userId === userId);
      return NextResponse.json({ vote: userVote || null });
    }

    // Handle favorites endpoint
    if (feature === 'favorites' && userId) {
      if (galleryItemId) {
        const isFavorited = favorites.some(f => f.galleryItemId === galleryItemId && f.userId === userId);
        return NextResponse.json({ isFavorited });
      } else {
        const userFavorites = favorites.filter(f => f.userId === userId);
        return NextResponse.json({ favorites: userFavorites });
      }
    }

    // Handle search history endpoint
    if (feature === 'search-history' && userId) {
      const userSearchHistory = searchHistoryItems.filter(s => s.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10); // Last 10 searches
      return NextResponse.json({ searchHistory: userSearchHistory });
    }

    // Regular gallery items endpoint
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Search parameter
    const search = searchParams.get('search') || '';

    // Date filtering parameters
    const dateFilter = searchParams.get('dateFilter') || '';
    const dateRangeEnd = searchParams.get('dateRangeEnd') || '';

    // Filter items based on search
    let filteredItems = galleryItems;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = galleryItems.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.uploader.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by date if provided
    if (dateFilter || dateRangeEnd) {
      filteredItems = filteredItems.filter(item => {
        const itemDate = new Date(item.createdAt);

        if (dateFilter && dateRangeEnd) {
          // Date range
          const startDate = new Date(dateFilter);
          const endDate = new Date(dateRangeEnd);
          endDate.setHours(23, 59, 59, 999); // Include the entire end day
          return itemDate >= startDate && itemDate <= endDate;
        } else if (dateFilter) {
          // Exact date (or starting date)
          const filterDate = new Date(dateFilter);
          const nextDay = new Date(filterDate);
          nextDay.setDate(nextDay.getDate() + 1);
          return itemDate >= filterDate && itemDate < nextDay;
        }

        return true;
      });
    }

    // Sort items
    filteredItems.sort((a, b) => {
      let aValue: string | Date | number, bValue: string | Date | number;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'uploader':
          aValue = a.uploader.toLowerCase();
          bValue = b.uploader.toLowerCase();
          break;
        case 'upvotes':
          aValue = a.upvotes;
          bValue = b.upvotes;
          break;
        case 'viewCount':
          aValue = a.viewCount;
          bValue = b.viewCount;
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Calculate pagination
    const totalItems = filteredItems.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    // Return paginated results with metadata
    return NextResponse.json({
      items: paginatedItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        search,
        sortBy,
        sortOrder,
        dateFilter,
        dateRangeEnd
      }
    });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature');

    // Handle different POST features
    if (feature === 'vote') {
      const { galleryItemId, userId, voteType } = await request.json();

      if (!galleryItemId || !userId || !voteType) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Remove existing vote
      const existingVoteIndex = votes.findIndex(v => v.galleryItemId === galleryItemId && v.userId === userId);
      if (existingVoteIndex !== -1) {
        const existingVote = votes[existingVoteIndex];
        votes.splice(existingVoteIndex, 1);

        // Update gallery item vote counts
        const item = galleryItems.find(i => i.id === galleryItemId);
        if (item) {
          if (existingVote.voteType === 'upvote') {
            item.upvotes = Math.max(0, item.upvotes - 1);
          } else {
            item.downvotes = Math.max(0, item.downvotes - 1);
          }
        }

        // If same vote type, just remove (toggle off)
        if (existingVote.voteType === voteType) {
          return NextResponse.json({ success: true, vote: null });
        }
      }

      // Add new vote
      const newVote: GalleryVote = {
        id: Date.now().toString(),
        galleryItemId,
        userId,
        voteType: voteType as 'upvote' | 'downvote',
        createdAt: new Date().toISOString()
      };

      votes.push(newVote);

      // Update gallery item vote counts
      const item = galleryItems.find(i => i.id === galleryItemId);
      if (item) {
        if (voteType === 'upvote') {
          item.upvotes++;
        } else {
          item.downvotes++;
        }
      }

      return NextResponse.json({ success: true, vote: newVote });
    }

    if (feature === 'favorite') {
      const { galleryItemId, userId } = await request.json();

      if (!galleryItemId || !userId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Check if already favorited
      const existingFavoriteIndex = favorites.findIndex(f => f.galleryItemId === galleryItemId && f.userId === userId);

      if (existingFavoriteIndex !== -1) {
        // Remove favorite (toggle off)
        favorites.splice(existingFavoriteIndex, 1);
        return NextResponse.json({ success: true, isFavorited: false });
      } else {
        // Add favorite
        const newFavorite: GalleryFavorite = {
          id: Date.now().toString(),
          galleryItemId,
          userId,
          createdAt: new Date().toISOString()
        };

        favorites.push(newFavorite);
        return NextResponse.json({ success: true, isFavorited: true });
      }
    }

    if (feature === 'comment') {
      const { galleryItemId, userId, userName, content } = await request.json();

      if (!galleryItemId || !userId || !userName || !content?.trim()) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const newComment: GalleryComment = {
        id: Date.now().toString(),
        galleryItemId,
        userId,
        userName,
        content: content.trim(),
        createdAt: new Date().toISOString()
      };

      comments.push(newComment);
      return NextResponse.json({ success: true, comment: newComment });
    }

    if (feature === 'search-history') {
      const { userId, searchTerm } = await request.json();

      if (!userId || !searchTerm?.trim()) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Remove existing search term if it exists
      const existingIndex = searchHistoryItems.findIndex(s => s.userId === userId && s.searchTerm === searchTerm.trim());
      if (existingIndex !== -1) {
        searchHistoryItems.splice(existingIndex, 1);
      }

      // Add new search history item
      const newSearchHistory: SearchHistory = {
        id: Date.now().toString(),
        userId,
        searchTerm: searchTerm.trim(),
        createdAt: new Date().toISOString()
      };

      searchHistoryItems.unshift(newSearchHistory); // Add to beginning

      // Keep only last 20 searches per user
      const userSearches = searchHistoryItems.filter(s => s.userId === userId);
      if (userSearches.length > 20) {
        const oldestSearchIndex = searchHistoryItems.findIndex(s => s.id === userSearches[userSearches.length - 1].id);
        if (oldestSearchIndex !== -1) {
          searchHistoryItems.splice(oldestSearchIndex, 1);
        }
      }

      return NextResponse.json({ success: true, searchHistory: newSearchHistory });
    }

    if (feature === 'report') {
      const { type, itemId, galleryItemId, reporterId, reporterName, reason } = await request.json();

      if (!type || !itemId || !reporterId || !reporterName || !reason) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // In a real app, this would save to a reports database table
      console.log('Content reported:', {
        type, // 'gallery' or 'comment'
        itemId,
        galleryItemId,
        reporterId,
        reporterName,
        reason,
        reportedAt: new Date().toISOString()
      });

      // For now, just log the report - in production this would:
      // 1. Save to database
      // 2. Send notification to moderators
      // 3. Maybe auto-hide content based on report count/type

      return NextResponse.json({ success: true, message: 'Report submitted successfully' });
    }

    // Regular gallery item upload
    const { type, url, title, description, tags, uploaderName, uploaderId } = await request.json();

    if (!type || !url || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Process tags if provided
    let processedTags: string[] = [];
    if (tags && typeof tags === 'string') {
      processedTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5); // Limit to 5 tags
    }

    // Generate thumbnail for video URLs
    let thumbnail = '';
    if (type === 'video') {
      thumbnail = generateVideoThumbnail(url);
    } else {
      thumbnail = url; // For images, use the image itself as thumbnail
    }

    // Format the uploader name
    let formattedUploaderName = uploaderName || 'Anonymous Captain';
    if (uploaderName && !uploaderName.toLowerCase().includes('captain')) {
      formattedUploaderName = `${uploaderName}`;
    }

    const newItem = createGalleryItem({
      id: Date.now().toString(),
      type,
      url,
      thumbnail,
      title,
      description: description || '',
      uploader: formattedUploaderName,
      uploaderId: uploaderId || 'dev-user',
      createdAt: new Date().toISOString(),
      tags: processedTags,
      upvotes: 0,
      downvotes: 0,
      viewCount: 0,
    });

    galleryItems.unshift(newItem); // Add to beginning of array

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Gallery POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const itemIndex = galleryItems.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    galleryItems.splice(itemIndex, 1);

    // Also remove related comments, votes, and favorites
    const commentsToRemove = comments.filter(c => c.galleryItemId === itemId);
    commentsToRemove.forEach(comment => {
      const index = comments.indexOf(comment);
      if (index > -1) comments.splice(index, 1);
    });

    const votesToRemove = votes.filter(v => v.galleryItemId === itemId);
    votesToRemove.forEach(vote => {
      const index = votes.indexOf(vote);
      if (index > -1) votes.splice(index, 1);
    });

    const favoritesToRemove = favorites.filter(f => f.galleryItemId === itemId);
    favoritesToRemove.forEach(favorite => {
      const index = favorites.indexOf(favorite);
      if (index > -1) favorites.splice(index, 1);
    });

    return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Gallery DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateVideoThumbnail(url: string): string {
  // YouTube thumbnail extraction
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  if (youtubeMatch) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
  }

  // Vimeo thumbnail (would need API call in production)
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
  }

  // Default video placeholder
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMmEyYTJhIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTIwLDcwIDEyMCwxMzAgMTgwLDEwMCIgZmlsbD0iIzRkNGQ0ZCIvPgo8L3N2Zz4=';
}
