import React, { useEffect, useRef } from 'react';

interface LoopingVideoProps {
  src: string;
  className?: string;
}

export const LoopingVideo: React.FC<LoopingVideoProps> = ({ src, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Strictly enforce muted properties on DOM node for strict browser autoplay policies
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      if (video) {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If initial play was deferred by browser, attempt play again on canplay
          });
        }
      }
    };

    tryPlay();

    const handleLoadedData = () => {
      tryPlay();
    };

    const handleEnded = () => {
      if (video) {
        video.currentTime = 0;
        tryPlay();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tryPlay();
      }
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleLoadedData);
    video.addEventListener('ended', handleEnded);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleLoadedData);
      video.removeEventListener('ended', handleEnded);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={className}
    />
  );
};
