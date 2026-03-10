import { useState } from "react";
import { Gamepad2, Star, X, Maximize } from "lucide-react";

const HAZMOB_URL = "https://playgama.com/export/game/hazmob-fps-online-shooter";
const HAZMOB_IMG = "https://playgama.com/cdn-cgi/imagedelivery/LN2S-4p3-GgZvEx3IPaKUA/c1f0c7c3-3611-4f93-49ae-3b779e216c00/enlarged";

const BUBBLE_URL = "https://playgama.com/export/game/bubble-shooter-tap--pop";
const BUBBLE_IMG = "https://playgama.com/cdn-cgi/imagedelivery/LN2S-4p3-GgZvEx3IPaKUA/f47c7f88-b80b-4acd-b006-5a5cc4745700/enlarged";

const games = [
  { id: 1, title: "Hazmob FPS Online Shooter", genre: "Shooter", rating: 4.7, image: HAZMOB_IMG, players: "15M+", url: HAZMOB_URL },
  { id: 2, title: "Bubble Shooter Tap & Pop", genre: "Puzzle", rating: 4.5, image: BUBBLE_IMG, players: "10M+", url: BUBBLE_URL },
];

const GamesPage = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <>
      {/* Fullscreen game overlay */}
      {activeGame && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 bg-card border-b border-border">
            <span className="text-foreground text-xs font-bold">Bubble Tower 3D</span>
            <button onClick={() => setActiveGame(null)} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <iframe
            src={activeGame}
            className="flex-1 w-full border-0"
            allow="fullscreen; autoplay; gyroscope; accelerometer"
            allowFullScreen
            title="Game"
          />
        </div>
      )}

      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <h1 className="text-foreground text-base font-bold mb-4 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" /> Games
          </h1>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => game.url && setActiveGame(game.url)}
                className="bg-card rounded overflow-hidden border border-border cursor-pointer group hover:scale-105 transition-transform duration-200 relative"
              >
                {game.url && (
                  <div className="absolute top-1 right-1 z-10 bg-primary/80 rounded p-0.5">
                    <Maximize className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
                <div className="aspect-video overflow-hidden">
                  <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                </div>
                <div className="p-2">
                  <h3 className="text-[11px] font-bold text-foreground truncate">{game.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">{game.genre}</span>
                    <span className="flex items-center gap-0.5 text-[9px] text-accent">
                      <Star className="w-2.5 h-2.5 fill-current" /> {game.rating}
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{game.players} players</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GamesPage;
