import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Header from "./components/Header";
import MobileHeader from "./components/MobileHeader";
import MobileNav from "./components/MobileNav";
import AuthModal from "./components/AuthModal";
import SubscriptionModal from "./components/SubscriptionModal";
import ProtectedDashboard from "./components/ProtectedDashboard";
import CreatorPaymentGate from "./components/CreatorPaymentGate";
import LoadingScreen from "./components/LoadingScreen";
import Index from "./pages/Index";
import MusicPage from "./pages/MusicPage";
import LiveTVPage from "./pages/LiveTVPage";
import GamesPage from "./pages/GamesPage";
import TikTokPage from "./pages/TikTokPage";
import VJDashboard from "./pages/VJDashboard";
import MusicianDashboard from "./pages/MusicianDashboard";
import TikTokerDashboard from "./pages/TikTokerDashboard";
import MoviePlayerPage from "./pages/MoviePlayerPage";
import MusicPlayerPage from "./pages/MusicPlayerPage";
import TVPlayerPage from "./pages/TVPlayerPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <LoadingScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <Header />
              <MobileHeader />
              <AuthModal />
              <SubscriptionModal />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/music" element={<MusicPage />} />
                <Route path="/live-tv" element={<LiveTVPage />} />
                <Route path="/tiktok" element={<TikTokPage />} />
                <Route path="/movie/:id" element={<MoviePlayerPage />} />
                <Route path="/live-tv/:id" element={<TVPlayerPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/music/:id" element={<MusicPlayerPage />} />
                <Route
                  path="/vj-dashboard"
                  element={
                    <ProtectedDashboard allowedRole="vj">
                      <CreatorPaymentGate role="vj">
                        <VJDashboard />
                      </CreatorPaymentGate>
                    </ProtectedDashboard>
                  }
                />
                <Route
                  path="/musician-dashboard"
                  element={
                    <ProtectedDashboard allowedRole="musician">
                      <CreatorPaymentGate role="musician">
                        <MusicianDashboard />
                      </CreatorPaymentGate>
                    </ProtectedDashboard>
                  }
                />
                <Route
                  path="/tiktoker-dashboard"
                  element={<ProtectedDashboard allowedRole="tiktoker"><TikTokerDashboard /></ProtectedDashboard>}
                />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileNav />
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
