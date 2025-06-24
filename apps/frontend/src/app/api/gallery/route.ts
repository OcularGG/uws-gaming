import { NextRequest, NextResponse } from 'next/server';

// Helper function to create gallery items with default enhanced fields
const createGalleryItem = (item: Partial<GalleryItem>): GalleryItem => ({
  upvotes: Math.floor(Math.random() * 20),
  downvotes: Math.floor(Math.random() * 3),
  viewCount: Math.floor(Math.random() * 500) + 50,
  tags: [],
  ...item,
} as GalleryItem);

// Interfaces
export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  uploader: string;
  uploaderId: string;
  createdAt: string;
  // New fields for enhanced features
  upvotes: number;
  downvotes: number;
  viewCount: number;
  tags: string[];
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  originalFileName?: string;
  mimeType?: string;
}

export interface GalleryComment {
  id: string;
  galleryItemId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GalleryVote {
  id: string;
  galleryItemId: string;
  userId: string;
  voteType: 'upvote' | 'downvote';
  createdAt: string;
}

export interface GalleryFavorite {
  id: string;
  galleryItemId: string;
  userId: string;
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  userId: string;
  searchTerm: string;
  createdAt: string;
}

// In-memory storage for development (replace with database in production)
const galleryItems: GalleryItem[] = [
  createGalleryItem({
    id: '1',
    type: 'image',
    url: 'https://www.directart.co.uk/mall/images/800s/dhm1519.jpg',
    thumbnail: 'https://www.directart.co.uk/mall/images/800s/dhm1519.jpg',
    title: 'The Battle of Trafalgar',
    description: 'The decisive naval engagement that broke the combined French and Spanish fleets, securing British naval supremacy',
    uploader: 'Admiral Nelson',
    uploaderId: 'demo1',
    createdAt: new Date('2024-06-20T10:30:00Z').toISOString(),
    tags: ['naval-battle', 'trafalgar', 'nelson', 'historic'],
    upvotes: 15,
    downvotes: 2,
    viewCount: 324,
  }),
  createGalleryItem({
    id: '2',
    type: 'image',
    url: 'https://www.directart.co.uk/mall/images/800s/dhm6802pc.jpg',
    thumbnail: 'https://www.directart.co.uk/mall/images/800s/dhm6802pc.jpg',
    title: 'Ships of the Line in Formation',
    description: 'Majestic warships maintaining battle formation, displaying the power and discipline of the Royal Navy',
    uploader: 'Captain Blackwood',
    uploaderId: 'demo2',
    createdAt: new Date('2024-06-21T14:15:00Z').toISOString(),
    tags: ['ships', 'formation', 'royal-navy', 'tactics'],
    upvotes: 8,
    downvotes: 1,
    viewCount: 156,
  }),
  createGalleryItem({
    id: '3',
    type: 'image',
    url: 'https://www.directart.co.uk/mall/images/800s/dhm1165.jpg',
    thumbnail: 'https://www.directart.co.uk/mall/images/800s/dhm1165.jpg',
    title: 'Naval Battle in Stormy Seas',
    description: 'Ships engaging in fierce combat amidst turbulent waters, showcasing the courage of sailors in battle',
    uploader: 'Captain Hardy',
    uploaderId: 'demo3',
    createdAt: new Date('2024-06-21T16:45:00Z').toISOString(),
    tags: ['storm', 'battle', 'courage', 'naval-combat'],
    upvotes: 12,
    downvotes: 0,
    viewCount: 289,
  }),
  createGalleryItem({
    id: '4',
    type: 'image',
    url: 'https://www.directart.co.uk/mall/images/800s/dhm0150.jpg',
    thumbnail: 'https://www.directart.co.uk/mall/images/800s/dhm0150.jpg',
    title: 'Victory at Sea',
    description: 'A triumphant moment as British ships claim victory over enemy vessels in the age of wooden walls',
    uploader: 'Admiral Collingwood',
    uploaderId: 'demo4',
    createdAt: new Date('2024-06-22T09:20:00Z').toISOString(),
    tags: ['victory', 'triumph', 'british-navy'],
  }),
  createGalleryItem({
    id: '5',
    type: 'image',
    url: 'https://www.directart.co.uk/mall/images/800s/dhm0515.jpg',
    thumbnail: 'https://www.directart.co.uk/mall/images/800s/dhm0515.jpg',
    title: 'Fleet Engagement',
    description: 'Multiple ships of the line engaging in a grand naval battle, with cannon smoke filling the horizon',
    uploader: 'Captain Troubridge',
    uploaderId: 'demo5',
    createdAt: new Date('2024-06-22T11:30:00Z').toISOString(),
    tags: ['fleet', 'engagement', 'cannons', 'smoke'],
  })
];

// In-memory storage for development
const comments: GalleryComment[] = [];
const votes: GalleryVote[] = [];
const favorites: GalleryFavorite[] = [];
const searchHistoryItems: SearchHistory[] = [];

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
  return '/api/placeholder/video-thumbnail';
}
