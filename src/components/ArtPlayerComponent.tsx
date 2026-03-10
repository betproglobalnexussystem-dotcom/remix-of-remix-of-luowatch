import { useEffect, useRef } from "react";

interface ArtPlayerComponentProps {
  src: string;
  poster?: string;
  title?: string;
}

const getStreamUrl = (url: string): string => {
  if (!url) return "";
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const fileId = match[1];
      return `https://black-band-8860.arthurdimpoz.workers.dev/download?fileId=${fileId}&fileName=stream.mp4`;
    }
  }
  return url;
};

const ArtPlayerComponent = ({ src, poster, title }: ArtPlayerComponentProps) => {
  const artRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const streamUrl = getStreamUrl(src);

  useEffect(() => {
    if (!artRef.current) return;

    // Dynamic import to avoid React duplication issues
    import("artplayer").then((mod) => {
      const Artplayer = mod.default;
      
      if (!artRef.current) return;
      
      // Destroy previous instance if exists
      if (playerRef.current) {
        playerRef.current.destroy(false);
        playerRef.current = null;
      }

      playerRef.current = new Artplayer({
        container: artRef.current,
        url: streamUrl,
        poster: poster || "",
        volume: 0.7,
        autoplay: true,
        pip: true,
        autoSize: false,
        autoMini: true,
        screenshot: false,
        setting: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        airplay: true,
        theme: "#e11d48",
        preload: "auto",
        fastForward: true,
      });
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy(false);
        playerRef.current = null;
      }
    };
  }, [streamUrl, poster]);

  return <div ref={artRef} className="w-full h-full" />;
};

export default ArtPlayerComponent;
