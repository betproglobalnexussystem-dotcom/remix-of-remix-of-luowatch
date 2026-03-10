import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc, Timestamp, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Subscription {
  type: "content" | "games";
  planId: string;
  expiresAt: Date;
  active: boolean;
}

interface SubscriptionContextType {
  contentSub: Subscription | null;
  gamesSub: Subscription | null;
  hasContentAccess: boolean;
  hasGamesAccess: boolean;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  showSubModal: boolean;
  setShowSubModal: (show: boolean) => void;
  subModalType: "content" | "games";
  setSubModalType: (type: "content" | "games") => void;
  openSubModal: (type: "content" | "games") => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    return {
      contentSub: null, gamesSub: null, hasContentAccess: false, hasGamesAccess: false,
      isLoading: true, refreshSubscription: async () => {}, showSubModal: false,
      setShowSubModal: () => {}, subModalType: "content" as const, setSubModalType: () => {},
      openSubModal: () => {},
    };
  }
  return ctx;
};

const ADMIN_EMAILS = ["luowatch0@gmail.com", "mainplatform.nexus@gmail.com"];
const CREATOR_ROLES = ["vj", "musician", "tiktoker"];

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [contentSub, setContentSub] = useState<Subscription | null>(null);
  const [gamesSub, setGamesSub] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subModalType, setSubModalType] = useState<"content" | "games">("content");
  const [isCreator, setIsCreator] = useState(false);

  const openSubModal = (type: "content" | "games") => {
    setSubModalType(type);
    setShowSubModal(true);
  };

  const fetchSubscription = async () => {
    if (!user) {
      setContentSub(null);
      setGamesSub(null);
      setIsCreator(false);
      setIsLoading(false);
      return;
    }

    try {
      // Check if user is a registered creator (VJ/Artist/TikToker)
      const profileDoc = await getDoc(doc(db, "profiles", user.id));
      if (profileDoc.exists()) {
        const role = profileDoc.data().role;
        setIsCreator(CREATOR_ROLES.includes(role));
      }

      const contentDoc = await getDoc(doc(db, "subscriptions", `${user.id}_content`));
      if (contentDoc.exists()) {
        const data = contentDoc.data();
        const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt);
        const active = expiresAt > new Date();
        setContentSub({ type: "content", planId: data.planId, expiresAt, active });
      } else {
        setContentSub(null);
      }

      const gamesDoc = await getDoc(doc(db, "subscriptions", `${user.id}_games`));
      if (gamesDoc.exists()) {
        const data = gamesDoc.data();
        const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt);
        const active = expiresAt > new Date();
        setGamesSub({ type: "games", planId: data.planId, expiresAt, active });
      } else {
        setGamesSub(null);
      }
    } catch (err) {
      console.error("Error fetching subscription:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email);
  // Admin and registered creators (VJs, Artists, TikTokers) get free content access
  const hasContentAccess = isAdmin || isCreator || (contentSub?.active ?? false);
  const hasGamesAccess = isAdmin || (gamesSub?.active ?? false);

  return (
    <SubscriptionContext.Provider value={{ contentSub, gamesSub, hasContentAccess, hasGamesAccess, isLoading, refreshSubscription: fetchSubscription, showSubModal, setShowSubModal, subModalType, setSubModalType, openSubModal }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Activate subscription after payment
export async function activateSubscription(userId: string, type: "content" | "games", planId: string, durationDays: number, transactionRef: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  await setDoc(doc(db, "subscriptions", `${userId}_${type}`), {
    userId,
    type,
    planId,
    expiresAt: Timestamp.fromDate(expiresAt),
    transactionRef,
    activatedAt: Timestamp.now(),
  });

  // Log payment
  await setDoc(doc(db, "payments", transactionRef), {
    userId,
    type,
    planId,
    amount: 0,
    transactionRef,
    status: "completed",
    createdAt: Timestamp.now(),
  });
}
