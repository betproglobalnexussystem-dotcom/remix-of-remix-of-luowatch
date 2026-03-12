import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Loader2, AlertCircle,
  PictureInPicture2
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

  const skip = (delta: number) => {
    const v = videoRef.current;
    if (v) seek(Math.max(0, Math.min(v.duration, v.currentTime + delta)));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {}
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
      style={{ background: "linear-gradient(145deg, #1a1a2e 0%, #0d0d1a 50%, #16213e 100%)" }}
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
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgba(255,255,255,0.9)" }} />
          </div>
        </div>
      )}

      {/* Error */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}>
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <AlertCircle className="w-10 h-10" style={{ color: "rgba(255,100,100,0.9)" }} />
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.9)" }}>Failed to load video</span>
            <button
              onClick={(e) => { e.stopPropagation(); setHasError(false); setIsLoading(true); videoRef.current?.load(); }}
              className="px-5 py-2 rounded-full text-xs font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)" }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Big play button - Apple style */}
      {!playing && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-20 h-20 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
            <Play className="w-9 h-9 ml-1" fill="rgba(255,255,255,0.95)" style={{ color: "rgba(255,255,255,0.95)" }} />
          </div>
        </div>
      )}

      {/* Title bar - frosted glass */}
      {showControls && (title || artist) && (
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none transition-opacity duration-500"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)" }}>
          <div className="px-4 py-3 flex items-center gap-3">
            <img src="/logo.png" alt="LuoWatch" className="h-5 w-auto opacity-80" />
            <div className="min-w-0">
              {title && <p className="text-xs font-semibold truncate" style={{ color: "rgba(255,255,255,0.95)" }}>{title}</p>}
              {artist && <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.55)" }}>{artist}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Controls - Apple frosted glass bar */}
      <div
        data-controls
        className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-500 ${showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
      >
        <div className="mx-3 mb-3 rounded-2xl overflow-hidden"
          style={{ background: "rgba(30,30,40,0.65)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)", boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          
          {/* Progress bar */}
          <div className="px-4 pt-3">
            <div
              ref={progressRef}
              className="relative h-6 cursor-pointer flex items-center group/prog"
              onClick={handleProgressClick}
              onMouseDown={(e) => { const onMove = (ev: MouseEvent) => { const rect = progressRef.current?.getBoundingClientRect(); if (rect && duration) { const r = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)); seek(r * duration); } }; const onUp = () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); }; window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp); }}
            >
              <div className="w-full h-1 group-hover/prog:h-1.5 rounded-full transition-all" style={{ background: "rgba(255,255,255,0.12)" }}>
                <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 group-hover/prog:h-1.5 rounded-full transition-all" style={{ width: `${bufferedPct}%`, background: "rgba(255,255,255,0.18)" }} />
                <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 group-hover/prog:h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #fa2d6a, #a855f7)" }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full opacity-0 group-hover/prog:opacity-100 transition-opacity"
                    style={{ background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }} />
                </div>
              </div>
            </div>
            <div className="flex justify-between -mt-1 mb-1">
              <span className="text-[10px] tabular-nums" style={{ color: "rgba(255,255,255,0.45)" }}>{formatTime(currentTime)}</span>
              <span className="text-[10px] tabular-nums" style={{ color: "rgba(255,255,255,0.45)" }}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.7)" }}>
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                onClick={(e) => e.stopPropagation()}
                className="w-16 h-1 cursor-pointer accent-white/80"
              />
            </div>

            {/* Center controls */}
            <div className="flex items-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); skip(-10); }}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.8)" }}>
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="p-3 rounded-full transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.95)" }}>
                {playing ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-0.5" fill="currentColor" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); skip(10); }}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.8)" }}>
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); togglePiP(); }}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.7)" }}>
                <PictureInPicture2 className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="p-2 rounded-full transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.7)" }}>
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppleMusicPlayer;
