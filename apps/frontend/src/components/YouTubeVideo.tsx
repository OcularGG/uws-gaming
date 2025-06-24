'use client';

import { useEffect, useRef } from 'react';

// Type declarations for YouTube API
interface YouTubePlayer {
  destroy(): void;
  setPlaybackQuality(quality: string): void;
  seekTo(seconds: number): void;
  playVideo(): void;
  setVolume(volume: number): void;
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

interface YouTubeVideoProps {
  videoId: string;
  startTime?: number;
  endTime?: number;
  className?: string;
}

export function YouTubeVideo({
  videoId,
  startTime = 0,
  endTime = 30,
  className = ''
}: YouTubeVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    const loadYouTubeAPI = () => {
      return new Promise<typeof window.YT>((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve(window.YT);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.body.appendChild(script);

        window.onYouTubeIframeAPIReady = () => {
          resolve(window.YT);
        };
      });
    };

    const initializePlayer = async () => {
      const YT = await loadYouTubeAPI();

      if (containerRef.current && !playerRef.current) {
        playerRef.current = new (YT as any).Player(containerRef.current, { // eslint-disable-line @typescript-eslint/no-explicit-any
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 1,
            playlist: videoId,
            controls: 0,
            showinfo: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            rel: 0,
            start: startTime,
            end: endTime,
          },
          events: {
            onReady: (event: YouTubeEvent) => {
              event.target.setVolume(0);
              event.target.playVideo();
            },
            onStateChange: (event: YouTubeEvent) => {
              // Loop the video when it ends
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.seekTo(startTime);
                event.target.playVideo();
              }
            },
          },
        });
      }
    };

    initializePlayer();

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startTime, endTime]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          minHeight: '100%',
          minWidth: '100%',
          transform: 'scale(1.1)', // Slight zoom to hide black bars
        }}
      />
    </div>
  );
}
