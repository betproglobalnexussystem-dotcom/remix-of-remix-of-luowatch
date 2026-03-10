import { useState } from "react";
import { Link } from "react-router-dom";
import { useMusicVideos } from "@/hooks/useFirestore";
import { categories } from "@/data/categories";
import { ChevronRight, Mail, Music as MusicIcon } from "lucide-react";
import { FireMusic } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import CreatorAuthModal from "@/components/CreatorAuthModal";

const musicCategories = ["All", "Afrobeat", "Hip Hop", "Gospel", "Dancehall", "RnB", "Traditional", "Live", "Trending"];

const MusicVideoCard = ({ video }: { video: FireMusic }) => (
  <Link to={`/music/${video.id}`} className="cursor-pointer group block">
    <div className="relative rounded overflow-hidden mb-1.5">
      {video.thumbnailUrl ? (
        <img src={video.thumbnailUrl} alt={video.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
      ) : (
        <div className="w-full aspect-video bg-secondary flex items-center justify-center">
          <span className="text-muted-foreground text-[9px]">No Thumbnail</span>
        </div>
      )}
      {video.duration && (
        <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 py-0.5 rounded bg-background/80 text-primary-foreground">{video.duration}</span>
      )}
    </div>
    <div className="flex gap-1.5">
      <div className="w-6 h-6 rounded-full bg-secondary flex-shrink-0 overflow-hidden mt-0.5 flex items-center justify-center text-[9px] text-muted-foreground font-bold">
        {video.musicianName?.[0]?.toUpperCase() || "M"}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2">{video.title}</h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
          {video.musicianName || video.artist}
          {video.verified && <span className="text-muted-foreground">✓</span>}
        </p>
        <p className="text-[10px] text-muted-foreground">{video.plays} plays</p>
      </div>
    </div>
  </Link>
);

const MusicPage = () => {
  const { music, loading } = useMusicVideos();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [showMusicianModal, setShowMusicianModal] = useState(false);

  const filteredMusic = activeCategory === "All"
    ? music
    : music.filter(v => v.genre?.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {musicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold whitespace-nowrap transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-4">
          <main className="flex-1 min-w-0">
            {loading ? (
              <p className="text-muted-foreground text-[10px]">Loading music...</p>
            ) : filteredMusic.length === 0 ? (
              <p className="text-muted-foreground text-[10px]">No music videos found{activeCategory !== "All" ? ` in "${activeCategory}"` : ""}.</p>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {filteredMusic.map((video) => (
                  <MusicVideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
            {!user && (
              <div className="md:hidden bg-card border border-border rounded p-3 mt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-[11px] font-bold flex items-center gap-1"><MusicIcon className="w-3.5 h-3.5 text-primary" /> Become a Musician</h3>
                  <p className="text-muted-foreground text-[9px]">Upload & manage music videos</p>
                </div>
                <button onClick={() => setShowMusicianModal(true)} className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-[10px] font-bold hover:bg-primary/90 transition-colors whitespace-nowrap">
                  Join as Musician
                </button>
              </div>
            )}
          </main>
          <aside className="w-56 flex-shrink-0 space-y-4 hidden md:block">
            <div className="bg-card rounded p-3 border border-border">
              <h3 className="text-foreground text-xs font-bold mb-2">Contact or Report Us.</h3>
              <a href="https://wa.me/256760734679?text=Hello%20LUO%20WATCH%2C%20" target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-primary/80 text-primary-foreground px-4 py-1.5 rounded font-bold text-[11px] flex items-center gap-1.5 transition-colors mx-auto">
                <Mail className="w-3 h-3" /> Contact Us
              </a>
            </div>
            <div className="bg-card rounded p-3 border border-border">
              <h3 className="text-foreground text-xs font-bold mb-2">Categories</h3>
              <ul className="space-y-0.5">
                {categories.slice(0, 12).map((cat) => (
                  <li key={cat.name} className="category-link text-[11px]">
                    <ChevronRight className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            {!user && (
              <div className="bg-card rounded p-3 border border-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <MusicIcon className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-foreground text-[11px] font-bold">Become a Musician</h3>
                </div>
                <p className="text-muted-foreground text-[9px] mb-2">Upload & manage music videos on LUO WATCH</p>
                <button onClick={() => setShowMusicianModal(true)} className="w-full bg-primary text-primary-foreground py-1.5 rounded text-[10px] font-bold hover:bg-primary/90 transition-colors">
                  Join as Musician
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
      <CreatorAuthModal open={showMusicianModal} onClose={() => setShowMusicianModal(false)} role="musician" />
    </div>
  );
};

export default MusicPage;
