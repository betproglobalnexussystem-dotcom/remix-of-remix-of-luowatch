import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { Lock, Crown, LogIn } from "lucide-react";

interface Props {
  type: "content" | "games";
  children: ReactNode;
}

const SubscriptionGate = ({ type, children }: Props) => {
  const { user, setShowAuthModal, setAuthModalTab } = useAuth();
  const { hasContentAccess, hasGamesAccess, isLoading } = useSubscription();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-xs">
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-16 md:pb-0">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-foreground text-lg font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground text-xs mb-6">
            Please login or create an account to access this content.
          </p>
          <button
            onClick={() => { setAuthModalTab("login"); setShowAuthModal(true); }}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Login / Sign Up
          </button>
        </div>
      </div>
    );
  }

  // Check access
  const hasAccess = type === "content" ? hasContentAccess : hasGamesAccess;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-16 md:pb-0">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-foreground text-lg font-bold mb-2">
            {type === "content" ? "Subscription Required" : "Games Pass Required"}
          </h2>
          <p className="text-muted-foreground text-xs mb-2">
            {type === "content"
              ? "Subscribe to watch movies, listen to music, and access Live TV channels."
              : "Get a Games Pass to play all games."}
          </p>
          <p className="text-muted-foreground text-[10px] mb-6">
            {type === "content"
              ? "Plans start from UGX 3,500/day"
              : "Only UGX 1,000/day"}
          </p>
          <button
            onClick={() => navigate("/subscribe")}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <Crown className="w-4 h-4" /> View Plans & Subscribe
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGate;
