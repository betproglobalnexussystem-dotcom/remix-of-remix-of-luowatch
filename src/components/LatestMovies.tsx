import { useMovies } from "@/hooks/useFirestore";
import MovieCard from "./MovieCard";
import MovieCardSkeleton from "./MovieCardSkeleton";

interface LatestMoviesProps {
  selectedVJ?: string;
  genreFilter?: string;
  typeFilter?: string;
}

const LatestMovies = ({ selectedVJ, genreFilter, typeFilter }: LatestMoviesProps) => {
  const { movies, loading } = useMovies();
  let filtered = movies;
  if (selectedVJ) filtered = filtered.filter(m => m.vjName === selectedVJ);
  if (genreFilter) filtered = filtered.filter(m => m.genre.toLowerCase().includes(genreFilter.toLowerCase()));
  if (typeFilter) filtered = filtered.filter(m => m.type === typeFilter);

  return (
    <section className="mb-4">
      <h2 className="text-foreground text-xs font-bold flex items-center gap-1.5 mb-2">
        <span className="text-primary">●</span> Latest Movies
      </h2>
      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-[10px]">No movies found.</p>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
};

export default LatestMovies;
