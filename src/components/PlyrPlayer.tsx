import { useEffect, useRef } from "react";
// @ts-ignore
import Plyr from "plyr";
import "plyr/dist/plyr.css";

interface PlyrPlayerProps {
  src: string;
  poster?: string;
}

const PlyrPlayer = ({ src, poster }: PlyrPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = new Plyr(videoRef.current, {
      controls: [
        "play-large", "rewind", "play", "fast-forward", "progress",
        "current-time", "duration", "mute", "volume", "settings",
        "pip", "airplay", "fullscreen",
      ],
      settings: ["quality", "speed"],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    });

    return () => {
      playerRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.source = {
        type: "video",
        sources: [{ src, type: "video/mp4" }],
        poster: poster || "",
      };
    }
  }, [src, poster]);

  return (
    <div className="plyr-wrapper w-full h-full [&_.plyr]:w-full [&_.plyr]:h-full [&_.plyr--video]:bg-black [&_.plyr__control--overlaid]:bg-primary [&_.plyr--full-ui_input[type=range]]:text-primary">
      <video ref={videoRef} className="w-full h-full" poster={poster} crossOrigin="anonymous">
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};

export default PlyrPlayer;
