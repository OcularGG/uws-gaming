import { useEffect, useRef } from 'react';

interface YouTubeHeroProps {
  videoId: string;
  startTime?: number;
  endTime?: number;
  className?: string;
}

export default function YouTubeHero({
  videoId,
  startTime = 0,
  endTime = 30,
  className = ""
}: YouTubeHeroProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-hero-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          loop: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          start: startTime,
          end: endTime,
          playlist: videoId, // Required for looping
        },
        events: {
          onReady: (event: YouTubeEvent) => {
            event.target.setPlaybackQuality('hd1080');
          },
          onStateChange: (event: YouTubeEvent) => {
            // Restart video when it ends
            if (event.data === window.YT.PlayerState.ENDED) {
              event.target.seekTo(startTime);
              event.target.playVideo();
            }
          },
        },
      });
    };

    // If API is already loaded
    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, startTime, endTime]);

  return (
    <div
      ref={containerRef}
      className={`hero-video-container ${className}`}
    >
      <div
        id="youtube-hero-player"
        className="youtube-player"
      />
      <div className="hero-video-overlay" />
    </div>
  );
}

// Type declarations for YouTube API
interface YouTubePlayer {
  destroy(): void;
  setPlaybackQuality(quality: string): void;
  seekTo(seconds: number): void;
  playVideo(): void;
}

interface YouTubeEvent {
  target: YouTubePlayer;
  data: number;
}

declare global {
  interface Window {
    YT: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onYouTubeIframeAPIReady: () => void;
  }
}
