import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Loader2, AlertCircle,
  PictureInPicture2
} from "lucide-react";

interface LuoWatchPlayerProps {
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
      return `https://black-band-8860.arthurdimpoz.workers.dev/download?fileId=${match[1]}&fileName=stream.mp4`;
    }
  }
  return url;
};

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

const LuoWatchPlayer = ({ src, poster, title }: LuoWatchPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);

  const streamUrl = getStreamUrl(src);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    if (playing) {
      hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => { if (!isSeeking) setCurrentTime(v.currentTime); };
    const onDuration = () => setDuration(v.duration);
    const onProgress = () => {
      if (v.buffered.length > 0) {
        setBuffered(v.buffered.end(v.buffered.length - 1));
      }
    };
    const onCanPlay = () => setIsLoading(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onError = () => { setIsLoading(false); setHasError(true); };

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("durationchange", onDuration);
    v.addEventListener("progress", onProgress);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("error", onError);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("durationchange", onDuration);
      v.removeEventListener("progress", onProgress);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("error", onError);
    };
  }, [isSeeking]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.volume = volume;
      v.muted = muted;
    }
  }, [volume, muted]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
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

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleProgressClick(e);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-controls]")) return;
        togglePlay();
      }}
    >
      <video
        ref={videoRef}
        src={streamUrl}
        poster={poster}
        preload="auto"
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="text-foreground/70 text-xs">Loading...</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <AlertCircle className="w-10 h-10 text-primary" />
            <span className="text-foreground text-sm font-semibold">Failed to load video</span>
            <button
              onClick={(e) => { e.stopPropagation(); setHasError(false); setIsLoading(true); videoRef.current?.load(); }}
              className="mt-2 px-4 py-1.5 bg-primary text-primary-foreground rounded text-xs font-bold hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Big play button */}
      {!playing && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Title bar */}
      {showControls && title && (
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/70 to-transparent z-20 pointer-events-none transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="LuoWatch" className="h-5 w-auto" />
            <span className="text-foreground text-xs font-semibold truncate">{title}</span>
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div
        data-controls
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative h-5 px-3 cursor-pointer flex items-end group/progress"
          onClick={handleProgressClick}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={() => setIsSeeking(false)}
          onMouseMove={handleProgressDrag}
        >
          <div className="w-full h-1 group-hover/progress:h-1.5 bg-foreground/20 rounded-full transition-all relative">
            {/* Buffered */}
            <div className="absolute top-0 left-0 h-full bg-foreground/30 rounded-full" style={{ width: `${bufferedPercent}%` }} />
            {/* Progress */}
            <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: `${progress}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-foreground hover:text-primary transition-colors">
              {playing ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); skip(-10); }} className="text-foreground hover:text-primary transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); skip(10); }} className="text-foreground hover:text-primary transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/vol">
              <button onClick={(e) => { e.stopPropagation(); setMuted(!muted); }} className="text-foreground hover:text-primary transition-colors">
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0" max="1" step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                onClick={(e) => e.stopPropagation()}
                className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-primary h-1 cursor-pointer"
              />
            </div>

            <span className="text-foreground/70 text-[10px] ml-1 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                className="text-foreground hover:text-primary transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
              {showSettings && (
                <div className="absolute bottom-8 right-0 bg-card border border-border rounded-lg p-2 min-w-[120px] shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <p className="text-[10px] text-muted-foreground mb-1 px-1">Playback Speed</p>
                  {PLAYBACK_RATES.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setPlaybackRate(r); setShowSettings(false); }}
                      className={`block w-full text-left px-2 py-1 rounded text-xs transition-colors ${r === playbackRate ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}
                    >
                      {r === 1 ? "Normal" : `${r}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={(e) => { e.stopPropagation(); togglePiP(); }} className="text-foreground hover:text-primary transition-colors">
              <PictureInPicture2 className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-foreground hover:text-primary transition-colors">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuoWatchPlayer;
