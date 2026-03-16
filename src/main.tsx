import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initMusicCache } from "./lib/musicCache";

// Start fetching all music data immediately at app boot,
// before any component mounts, so videos are ready to play instantly.
initMusicCache();

createRoot(document.getElementById("root")!).render(<App />);
