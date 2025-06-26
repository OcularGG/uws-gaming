// Shared data storage for gallery items (in-memory for development)
// In production, this should be replaced with a proper database

export interface GalleryItem {
  id: string;
  type: 'image' | 'video' | 'collection';
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
  // Collection support
  images?: string[]; // Array of image URLs for collections
  imageCount?: number; // Number of images in collection
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

// Helper function to create gallery items with default enhanced fields
export const createGalleryItem = (item: Partial<GalleryItem>): GalleryItem => ({
  upvotes: Math.floor(Math.random() * 20),
  downvotes: Math.floor(Math.random() * 3),
  viewCount: Math.floor(Math.random() * 500) + 50,
  tags: [],
  ...item,
} as GalleryItem);

// Shared in-memory storage (replace with database in production)
export const galleryItems: GalleryItem[] = [
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
  }),
  // Example collection
  createGalleryItem({
    id: 'collection_demo',
    type: 'collection',
    url: 'https://www.directart.co.uk/mall/images/800s/dhm1519.jpg',
    thumbnail: 'https://www.directart.co.uk/mall/images/800s/dhm1519.jpg',
    title: 'Epic Naval Battle Collection',
    description: 'A collection of dramatic naval battle scenes showcasing the power and glory of maritime warfare',
    uploader: 'Admiral Collection',
    uploaderId: 'demo6',
    createdAt: new Date('2024-06-23T12:00:00Z').toISOString(),
    tags: ['collection', 'naval-battles', 'epic', 'maritime'],
    images: [
      'https://www.directart.co.uk/mall/images/800s/dhm1519.jpg',
      'https://www.directart.co.uk/mall/images/800s/dhm6802pc.jpg',
      'https://www.directart.co.uk/mall/images/800s/dhm1165.jpg',
      'https://www.directart.co.uk/mall/images/800s/dhm0150.jpg'
    ],
    imageCount: 4,
    upvotes: 25,
    downvotes: 1,
    viewCount: 450,
  })
];

export const comments: GalleryComment[] = [];
export const votes: GalleryVote[] = [];
export const favorites: GalleryFavorite[] = [];
export const searchHistoryItems: SearchHistory[] = [];
