import { Link } from "react-router-dom";
import { FireMovie } from "@/lib/firestore";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: FireMovie;
}

const vjBadgeColors = [
  "bg-gradient-to-r from-[hsl(280,70%,50%)] to-[hsl(320,80%,45%)]",
  "bg-gradient-to-r from-[hsl(200,80%,45%)] to-[hsl(230,70%,50%)]",
  "bg-gradient-to-r from-[hsl(150,70%,40%)] to-[hsl(170,80%,35%)]",
  "bg-gradient-to-r from-[hsl(30,90%,50%)] to-[hsl(10,80%,45%)]",
  "bg-gradient-to-r from-[hsl(340,70%,50%)] to-[hsl(0,80%,45%)]",
  "bg-gradient-to-r from-[hsl(50,80%,45%)] to-[hsl(30,90%,40%)]",
  "bg-gradient-to-r from-[hsl(180,60%,40%)] to-[hsl(210,70%,45%)]",
  "bg-gradient-to-r from-[hsl(260,60%,50%)] to-[hsl(290,70%,45%)]",
];

function getVJColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return vjBadgeColors[Math.abs(hash) % vjBadgeColors.length];
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link to={`/movie/${movie.id}`} className="movie-card group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-[10px]">No Poster</span>
          </div>
        )}
        <span className="movie-badge bg-primary text-primary-foreground" style={{ fontSize: '8px', padding: '1px 4px' }}>
          {movie.quality}
        </span>
        {movie.vjName && (
          <span className={`absolute top-1 right-1 ${getVJColor(movie.vjName)} text-white px-1.5 py-0.5 text-[8px] font-bold rounded-full shadow-md`}>
            {movie.vjName}
          </span>
        )}
        {movie.views > 0 && (
          <div className="absolute bottom-0.5 left-0.5 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-accent" fill="currentColor" />
            <span className="text-primary-foreground text-[10px] font-semibold">{movie.views}</span>
          </div>
        )}
      </div>
      <div className="mt-1 px-0.5">
        <h3 className="text-[10px] font-semibold text-foreground truncate leading-tight">
          {movie.title} ({movie.year})
        </h3>
        <p className="text-[9px] text-muted-foreground mt-0.5">
          {movie.genre}
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;
