import { useMovies } from "@/hooks/useFirestore";
import { useMemo } from "react";

interface VJFilterProps {
  selectedVJ: string;
  onSelectVJ: (vj: string) => void;
}

const vjColors = [
  "from-[hsl(0,72%,50%)] to-[hsl(30,80%,50%)]",
  "from-[hsl(210,80%,50%)] to-[hsl(240,70%,55%)]",
  "from-[hsl(150,60%,40%)] to-[hsl(180,70%,45%)]",
  "from-[hsl(270,60%,55%)] to-[hsl(300,70%,50%)]",
  "from-[hsl(40,90%,50%)] to-[hsl(20,85%,45%)]",
  "from-[hsl(330,70%,50%)] to-[hsl(350,80%,45%)]",
  "from-[hsl(190,80%,45%)] to-[hsl(220,70%,50%)]",
  "from-[hsl(100,60%,40%)] to-[hsl(130,70%,35%)]",
];

const VJFilter = ({ selectedVJ, onSelectVJ }: VJFilterProps) => {
  const { movies } = useMovies();

  const vjNames = useMemo(() => {
    const names = new Set<string>();
    movies.forEach((m) => {
      if (m.vjName) names.add(m.vjName);
    });
    return Array.from(names);
  }, [movies]);

  if (vjNames.length === 0) return null;

  return (
    <section className="mb-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground text-[9px] font-semibold mr-0.5">VJ:</span>
        <button
          onClick={() => onSelectVJ("")}
          className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
            selectedVJ === ""
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          All
        </button>
        {vjNames.map((name, i) => (
          <button
            key={name}
            onClick={() => onSelectVJ(name)}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
              selectedVJ === name
                ? `bg-gradient-to-r ${vjColors[i % vjColors.length]} text-white`
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </section>
  );
};

export default VJFilter;
