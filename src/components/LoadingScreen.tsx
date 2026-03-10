const LogoIcon = () => (
  <svg viewBox="0 0 64 64" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff6b00" />
        <stop offset="50%" stopColor="#ff00aa" />
        <stop offset="100%" stopColor="#6633ff" />
      </linearGradient>
      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffcc00" />
        <stop offset="100%" stopColor="#ff6600" />
      </linearGradient>
    </defs>
    <polygon points="10,4 58,32 10,60" fill="url(#g1)" rx="4" />
    <polygon points="10,14 46,32 10,50" fill="url(#g2)" opacity="0.9" />
  </svg>
);

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg className="absolute w-10 h-10 animate-[spin_1s_linear_infinite]" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="28 85" className="opacity-60" />
        </svg>
        <div className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden">
          <LogoIcon />
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <div className="w-[3px] h-[3px] rounded-full bg-primary animate-[bounce_0.8s_ease-in-out_infinite]" />
        <div className="w-[3px] h-[3px] rounded-full bg-primary animate-[bounce_0.8s_ease-in-out_infinite_0.1s]" />
        <div className="w-[3px] h-[3px] rounded-full bg-primary animate-[bounce_0.8s_ease-in-out_infinite_0.2s]" />
      </div>
    </div>
  );
};

export default LoadingScreen;
