'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GalleryItem {
  id: string;
  type: 'image' | 'video' | 'collection';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  uploader: string;
  uploaderId: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  viewCount: number;
  tags: string[];
  // Collection support
  images?: string[]; // Array of image URLs for collections
  imageCount?: number; // Number of images in collection
}

interface GalleryFavorite {
  id: string;
  galleryItemId: string;
  userId: string;
  createdAt: string;
}

const LazyImage = ({
  src,
  alt,
  className = '',
  onError
}: {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      if (onError) onError();
    };
    img.src = src;
  }, [src, onError]);

  return (
    <div className={`${className} relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-navy-dark/10 animate-pulse flex items-center justify-center">
          <div className="text-navy-dark">⚓</div>
        </div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          onLoad={() => setIsLoading(false)}
          onError={onError}
        />
      )}
      {!imageSrc && !isLoading && (
        <div className={`${className} bg-navy-dark/5 flex items-center justify-center`}>
          <div className="text-navy-dark/50">Failed to load</div>
        </div>
      )}
    </div>
  );
};

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<{item: GalleryItem, type: 'image' | 'video' | 'collection'} | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/gallery');
    }
  }, [session, status, router]);

  const fetchFavorites = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      // First get user's favorite IDs
      const favoritesResponse = await fetch(`/api/gallery?feature=favorites&userId=${session.user.id || 'dev-user'}`);
      const favoritesData = await favoritesResponse.json();

      if (favoritesData.favorites && favoritesData.favorites.length > 0) {
        // Get all gallery items
        const galleryResponse = await fetch('/api/gallery?limit=1000');
        const galleryData = await galleryResponse.json();

        // Filter to only favorited items
        const favoriteItemIds = favoritesData.favorites.map((fav: GalleryFavorite) => fav.galleryItemId);
        const favoriteItems = galleryData.items.filter((item: GalleryItem) =>
          favoriteItemIds.includes(item.id)
        );

        // Sort by favorite date (most recent first)
        const sortedFavorites = favoriteItems.sort((a: GalleryItem, b: GalleryItem) => {
          const aFav = favoritesData.favorites.find((f: GalleryFavorite) => f.galleryItemId === a.id);
          const bFav = favoritesData.favorites.find((f: GalleryFavorite) => f.galleryItemId === b.id);
          return new Date(bFav?.createdAt || 0).getTime() - new Date(aFav?.createdAt || 0).getTime();
        });

        setFavorites(sortedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchFavorites();
    }
  }, [session, fetchFavorites]);

  const handleRemoveFavorite = async (itemId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/gallery?feature=favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryItemId: itemId,
          userId: session.user.id || 'dev-user'
        })
      });

      if (response.ok) {
        // Remove from local state
        setFavorites(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const generateShareUrl = (item: GalleryItem) => {
    return `${window.location.origin}/gallery/${item.id}`;
  };

  const handleShare = async (item: GalleryItem) => {
    const shareUrl = generateShareUrl(item);

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: shareUrl,
        });
      } catch (error) {
        // Fall back to copying to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      }
    } else {
      // Fall back to copying to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-sail-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-navy-dark">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-sail-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            My Favorites
          </h1>
          <p className="text-lg text-navy-dark/70">
            Your collection of favorited gallery items
          </p>
          <Link
            href="/gallery"
            className="inline-block mt-4 text-brass hover:text-brass-bright transition-colors duration-200"
            style={{fontFamily: 'Cinzel, serif'}}
          >
            ← Back to Gallery
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-navy-dark">Loading your favorites...</div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-navy-dark/70 mb-4">You haven't favorited any items yet.</div>
            <Link
              href="/gallery"
              className="neo-brutal-button bg-brass text-navy-dark px-6 py-3"
              style={{fontFamily: 'Cinzel, serif'}}
            >
              Browse Gallery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <div key={item.id} className="neo-brutal-box p-4 bg-sail-white hover:shadow-lg transition-shadow duration-200">
                <div
                  className="cursor-pointer"
                  onClick={() => setSelectedMedia({ item, type: item.type })}
                >
                  {item.type === 'image' ? (
                    <LazyImage
                      src={item.thumbnail || item.url}
                      alt={item.title}
                      className="w-full h-48 object-cover mb-3"
                    />
                  ) : (
                    <div className="relative w-full h-48 mb-3">
                      <LazyImage
                        src={item.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMmEyYTJhIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiM0ZDRkNGQiLz4KPC9zdmc+'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-12 h-12 bg-brass rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-navy-dark" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-navy-dark mb-2 line-clamp-2" style={{fontFamily: 'Cinzel, serif'}}>
                  {item.title}
                </h3>
                <p className="text-sm text-navy-dark/70 mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-xs text-navy-dark/60 mb-3">
                  <span>By {item.uploader}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-navy-dark/60 mb-3">
                  <span>▲ {item.upvotes} upvotes</span>
                  <span>{item.viewCount} views</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(item)}
                    className="flex-1 neo-brutal-button bg-brass/20 text-navy-dark py-2 text-sm hover:bg-brass/40 transition-colors duration-200"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => handleRemoveFavorite(item.id)}
                    className="flex-1 neo-brutal-button bg-red-100 text-red-700 py-2 text-sm hover:bg-red-200 transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for viewing images/videos */}
        {selectedMedia && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200"
              >
                ✕
              </button>

              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.item.url}
                  alt={selectedMedia.item.title}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={selectedMedia.item.url}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
