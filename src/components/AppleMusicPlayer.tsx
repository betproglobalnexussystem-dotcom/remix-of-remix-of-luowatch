import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, Maximize, Minimize,
  Loader2, AlertCircle, Volume2, VolumeX
} from "lucide-react";

interface AppleMusicPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  artist?: string;
}

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const AppleMusicPlayer = ({ src, poster, title, artist }: AppleMusicPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3500);
    }
  }, [playing]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(v.currentTime);
    const onDur = () => setDuration(v.duration);
    const onBuf = () => { if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1)); };
    const onCan = () => setIsLoading(false);
    const onWait = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onErr = () => { setIsLoading(false); setHasError(true); };
    v.addEventListener("play", onPlay); v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime); v.addEventListener("durationchange", onDur);
    v.addEventListener("progress", onBuf); v.addEventListener("canplay", onCan);
    v.addEventListener("waiting", onWait); v.addEventListener("playing", onPlaying);
    v.addEventListener("error", onErr);
    return () => {
      v.removeEventListener("play", onPlay); v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime); v.removeEventListener("durationchange", onDur);
      v.removeEventListener("progress", onBuf); v.removeEventListener("canplay", onCan);
      v.removeEventListener("waiting", onWait); v.removeEventListener("playing", onPlaying);
      v.removeEventListener("error", onErr);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (v) { v.volume = volume; v.muted = muted; }
  }, [volume, muted]);

  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
    resetHideTimer();
  };

  const seek = (time: number) => {
    const v = videoRef.current;
    if (v) { v.currentTime = time; setCurrentTime(time); }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full group select-none overflow-hidden"
      style={{ background: "#000" }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-controls]")) return;
        togglePlay();
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="auto"
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />

      {/* Loading */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(255,255,255,0.7)" }} />
        </div>
      )}

      {/* Error */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <AlertCircle className="w-8 h-8" style={{ color: "rgba(255,100,100,0.9)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.9)" }}>Failed to load</span>
            <button
              onClick={(e) => { e.stopPropagation(); setHasError(false); setIsLoading(true); videoRef.current?.load(); }}
              className="px-4 py-1.5 rounded-full text-[10px] font-semibold"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
            >Retry</button>
          </div>
        </div>
      )}

      {/* Big play button */}
      {!playing && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)" }}>
            <Play className="w-7 h-7 ml-0.5" fill="rgba(255,255,255,0.9)" style={{ color: "rgba(255,255,255,0.9)" }} />
          </div>
        </div>
      )}

      {/* Slim bottom control bar */}
      <div
        data-controls
        className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}
      >
        {/* Progress bar */}
        <div className="px-2 md:px-3">
          <div
            ref={progressRef}
            className="relative h-3 cursor-pointer flex items-center group/prog"
            onClick={handleProgressClick}
            onMouseDown={(e) => {
              const onMove = (ev: MouseEvent) => {
                const rect = progressRef.current?.getBoundingClientRect();
                if (rect && duration) { seek(Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)) * duration); }
              };
              const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
              window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
            }}
          >
            <div className="w-full h-[3px] group-hover/prog:h-1 rounded-full transition-all" style={{ background: "rgba(255,255,255,0.2)" }}>
              <div className="absolute top-1/2 -translate-y-1/2 left-0 h-[3px] group-hover/prog:h-1 rounded-full transition-all" style={{ width: `${bufferedPct}%`, background: "rgba(255,255,255,0.25)" }} />
              <div className="absolute top-1/2 -translate-y-1/2 left-0 h-[3px] group-hover/prog:h-1 rounded-full transition-all" style={{ width: `${progress}%`, background: "#fa2d6a" }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover/prog:opacity-100 transition-opacity" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-1.5 px-2 pb-1.5 pt-0.5 md:px-3 md:pb-2">
          <button onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="p-1 md:p-1.5" style={{ color: "rgba(255,255,255,0.9)" }}>
            {playing ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
          </button>

          <span className="text-[9px] md:text-[10px] tabular-nums whitespace-nowrap" style={{ color: "rgba(255,255,255,0.6)" }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {title && (
            <span className="text-[9px] md:text-[10px] truncate max-w-[120px] md:max-w-[200px] hidden sm:block" style={{ color: "rgba(255,255,255,0.5)" }}>
              {title}
            </span>
          )}

          <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
            className="p-1 hidden md:block" style={{ color: "rgba(255,255,255,0.6)" }}>
            {muted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="p-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppleMusicPlayer;