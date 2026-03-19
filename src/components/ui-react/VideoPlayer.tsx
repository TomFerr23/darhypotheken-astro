import { useState, useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoFallback: string;
}

export default function VideoPlayer({ videoFallback }: VideoPlayerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.controls = true;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
      <video
        ref={videoRef}
        loop
        playsInline
        poster="/images/poster-image.jpg"
        preload="metadata"
        className="w-full"
        key={isMobile ? "mobile" : "desktop"}
      >
        <source
          src={isMobile ? "/videos/intro-dar-v8.mp4" : "/videos/DAR-Mo-Chara-WebOptimized.mp4"}
          type="video/mp4"
        />
        {videoFallback}
      </video>

      {!isPlaying && (
        <div
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 transition-opacity duration-400"
          onClick={handlePlay}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110 active:scale-95 md:h-24 md:w-24">
            <svg
              className="ml-1.5 h-8 w-8 text-[#1c3349] md:h-10 md:w-10"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
