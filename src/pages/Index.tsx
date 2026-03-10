import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Film } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BannerSlider from "@/components/BannerSlider";
import FeaturedSection from "@/components/FeaturedSection";
import LatestMovies from "@/components/LatestMovies";
import Sidebar from "@/components/Sidebar";
import VJFilter from "@/components/VJFilter";
import CreatorAuthModal from "@/components/CreatorAuthModal";

const Index = () => {
  const [selectedVJ, setSelectedVJ] = useState("");
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const genreFilter = searchParams.get("genre") || "";
  const typeFilter = searchParams.get("type") || "";
  const [showVJModal, setShowVJModal] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex gap-4">
          <main className="flex-1 min-w-0">
            <BannerSlider />
            <VJFilter selectedVJ={selectedVJ} onSelectVJ={setSelectedVJ} />
            {genreFilter && (
              <div className="mb-3 flex items-center gap-2">
                <span className="text-foreground text-xs font-bold">Genre: {genreFilter}</span>
                <a href="/" className="text-primary text-[10px] hover:underline">Clear</a>
              </div>
            )}
            <FeaturedSection selectedVJ={selectedVJ} genreFilter={genreFilter} typeFilter={typeFilter} />
            <LatestMovies selectedVJ={selectedVJ} genreFilter={genreFilter} typeFilter={typeFilter} />
            {!user && (
              <div className="md:hidden bg-card border border-border rounded p-3 mt-3 flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-[11px] font-bold flex items-center gap-1"><Film className="w-3.5 h-3.5 text-primary" /> Become a VJ</h3>
                  <p className="text-muted-foreground text-[9px]">Upload & manage movies/series</p>
                </div>
                <button onClick={() => setShowVJModal(true)} className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-[10px] font-bold hover:bg-primary/90 transition-colors whitespace-nowrap">
                  Join as VJ
                </button>
              </div>
            )}
          </main>
          <div className="w-56 flex-shrink-0 hidden md:block">
            <Sidebar />
            {!user && (
              <div className="bg-card border border-border rounded p-3 mt-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Film className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-foreground text-[11px] font-bold">Become a VJ</h3>
                </div>
                <p className="text-muted-foreground text-[9px] mb-2">Upload & manage movies/series on LUO WATCH</p>
                <button onClick={() => setShowVJModal(true)} className="w-full bg-primary text-primary-foreground py-1.5 rounded text-[10px] font-bold hover:bg-primary/90 transition-colors">
                  Join as VJ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <CreatorAuthModal open={showVJModal} onClose={() => setShowVJModal(false)} role="vj" />
    </div>
  );
};

export default Index;
