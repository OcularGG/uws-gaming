'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
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

interface GalleryComment {
  id: string;
  galleryItemId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
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

export default function GalleryItemPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<GalleryComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentCollectionImageIndex, setCurrentCollectionImageIndex] = useState(0);

  const itemId = params.id as string;

  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      // Get all gallery items and find the specific one
      const response = await fetch('/api/gallery?limit=1000');
      const data = await response.json();

      const foundItem = data.items.find((i: GalleryItem) => i.id === itemId);

      if (!foundItem) {
        router.push('/gallery');
        return;
      }

      setItem(foundItem);

      // Fetch comments
      const commentsResponse = await fetch(`/api/gallery?feature=comments&galleryItemId=${itemId}`);
      const commentsData = await commentsResponse.json();
      setComments(commentsData.comments || []);

      // Fetch user's vote and favorite status if logged in
      if (session?.user) {
        const userId = session.user.id || 'dev-user';

        // Get vote
        const voteResponse = await fetch(`/api/gallery?feature=votes&galleryItemId=${itemId}&userId=${userId}`);
        const voteData = await voteResponse.json();
        setUserVote(voteData.vote?.voteType || null);

        // Get favorite status
        const favoriteResponse = await fetch(`/api/gallery?feature=favorites&userId=${userId}&galleryItemId=${itemId}`);
        const favoriteData = await favoriteResponse.json();
        setIsFavorited(favoriteData.isFavorited || false);
      }
    } catch (error) {
      console.error('Failed to fetch item:', error);
      router.push('/gallery');
    } finally {
      setLoading(false);
    }
  }, [itemId, session, router]);

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
  }, [itemId, fetchItem]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!session?.user || !item) return;

    try {
      const response = await fetch('/api/gallery?feature=vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryItemId: item.id,
          userId: session.user.id || 'dev-user',
          voteType
        })
      });

      if (response.ok) {
        setUserVote(prev => prev === voteType ? null : voteType);
        fetchItem(); // Refresh to get updated vote counts
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleFavorite = async () => {
    if (!session?.user || !item) return;

    try {
      const response = await fetch('/api/gallery?feature=favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryItemId: item.id,
          userId: session.user.id || 'dev-user'
        })
      });

      if (response.ok) {
        setIsFavorited(prev => !prev);
      }
    } catch (error) {
      console.error('Failed to favorite:', error);
    }
  };

  const handleComment = async () => {
    if (!session?.user || !item || !newComment.trim()) return;

    try {
      const response = await fetch('/api/gallery?feature=comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryItemId: item.id,
          userId: session.user.id || 'dev-user',
          userName: session.user.name || 'Anonymous Captain',
          content: newComment.trim()
        })
      });

      if (response.ok) {
        setNewComment('');
        // Refresh comments
        const commentsResponse = await fetch(`/api/gallery?feature=comments&galleryItemId=${item.id}`);
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
      }
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };

  const handleShare = async () => {
    if (!item) return;

    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: shareUrl,
        });
      } catch (error) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sail-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-navy-dark">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-sail-white pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-navy-dark">Item not found</div>
            <Link href="/gallery" className="text-brass hover:text-brass-bright">
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sail-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/gallery"
          className="inline-block mb-6 text-brass hover:text-brass-bright transition-colors duration-200"
          style={{fontFamily: 'Cinzel, serif'}}
        >
          ← Back to Gallery
        </Link>

        {/* Main content */}
        <div className="neo-brutal-box p-6 bg-sail-white">
          {/* Media */}
          <div className="mb-6">
            {item.type === 'collection' && item.images ? (
              <div className="relative">
                <div className="relative aspect-video bg-navy-dark/10 flex items-center justify-center">
                  {/* Collection Navigation */}
                  {item.images.length > 1 && (
                    <button
                      onClick={() => {
                        setCurrentCollectionImageIndex(prev =>
                          prev > 0 ? prev - 1 : item.images!.length - 1
                        );
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 neo-brutal-button bg-brass text-navy-dark w-12 h-12 flex items-center justify-center text-xl shadow-lg hover:bg-brass/80 transition-colors"
                      title="Previous image"
                    >
                      ←
                    </button>
                  )}

                  <LazyImage
                    src={item.images[currentCollectionImageIndex]}
                    alt={`${item.title} - Image ${currentCollectionImageIndex + 1}`}
                    className="w-full max-h-96 object-contain mx-auto"
                  />

                  {item.images.length > 1 && (
                    <button
                      onClick={() => {
                        setCurrentCollectionImageIndex(prev =>
                          prev < item.images!.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 neo-brutal-button bg-brass text-navy-dark w-12 h-12 flex items-center justify-center text-xl shadow-lg hover:bg-brass/80 transition-colors"
                      title="Next image"
                    >
                      →
                    </button>
                  )}
                </div>

                {/* Collection Counter */}
                {item.images.length > 1 && (
                  <div className="text-center mt-2 text-sm text-navy-dark/70">
                    Image {currentCollectionImageIndex + 1} of {item.images.length}
                  </div>
                )}
              </div>
            ) : item.type === 'image' ? (
              <LazyImage
                src={item.url}
                alt={item.title}
                className="w-full max-h-96 object-contain mx-auto"
              />
            ) : (
              <video
                src={item.url}
                controls
                className="w-full max-h-96 mx-auto"
              />
            )}
          </div>

          {/* Title and description */}
          <h1 className="text-3xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
            {item.title}
          </h1>
          <p className="text-navy-dark/70 mb-6">
            {item.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-between mb-6 text-sm text-navy-dark/60">
            <div>
              <span>By {item.uploader}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(item.createdAt)}</span>
              {item.type === 'collection' && item.imageCount && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-brass">📸 {item.imageCount} images</span>
                </>
              )}
            </div>
            <div>
              <span>{item.viewCount} views</span>
            </div>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="neo-brutal-button bg-brass/20 text-navy-dark px-3 py-1 text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            {session && (
              <>
                <button
                  onClick={() => handleVote('upvote')}
                  className={`neo-brutal-button px-4 py-2 ${
                    userVote === 'upvote' ? 'bg-green-200 text-green-800' : 'bg-sail-white text-navy-dark'
                  }`}
                >
                  ▲ {item.upvotes}
                </button>
                <button
                  onClick={() => handleVote('downvote')}
                  className={`neo-brutal-button px-4 py-2 ${
                    userVote === 'downvote' ? 'bg-red-200 text-red-800' : 'bg-sail-white text-navy-dark'
                  }`}
                >
                  ▼ {item.downvotes}
                </button>
                <button
                  onClick={handleFavorite}
                  className={`neo-brutal-button px-4 py-2 ${
                    isFavorited ? 'bg-red-200 text-red-800' : 'bg-sail-white text-navy-dark'
                  }`}
                >
                  {isFavorited ? '❤️' : '🤍'} Favorite
                </button>
              </>
            )}
            <button
              onClick={handleShare}
              className="neo-brutal-button bg-brass text-navy-dark px-4 py-2"
            >
              Share
            </button>
          </div>

          {/* Comments section */}
          <div className="border-t border-navy-dark/20 pt-6">
            <h2 className="text-xl font-semibold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              Comments ({comments.length})
            </h2>

            {/* Add comment */}
            {session ? (
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 border-2 border-navy-dark text-navy-dark resize-none"
                  rows={3}
                />
                <button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  className="neo-brutal-button bg-brass text-navy-dark px-4 py-2 mt-2 disabled:opacity-50"
                >
                  Post Comment
                </button>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-brass/10 border border-brass/20">
                <p className="text-navy-dark">
                  <Link href="/gallery" className="text-brass hover:text-brass-bright">
                    Sign in
                  </Link> to leave a comment.
                </p>
              </div>
            )}

            {/* Comments list */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-sail-white/50 p-4 border border-navy-dark/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
                      {comment.userName}
                    </span>
                    <span className="text-sm text-navy-dark/60">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-navy-dark">
                    {comment.content}
                  </p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-navy-dark/60 text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
