import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { doc, getDoc, setDoc, updateDoc, Timestamp, increment as fbIncrement } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { contentPlans } from "@/data/subscriptionPlans";

interface Subscription {
  type: "content" | "games";
  planId: string;
  expiresAt: Date;
  active: boolean;
  downloadLimit: number;
  downloadsUsed: number;
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
  canDownload: () => boolean;
  recordDownloadUsage: () => Promise<boolean>;
  downloadsRemaining: () => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    return {
      contentSub: null, gamesSub: null, hasContentAccess: false, hasGamesAccess: false,
      isLoading: true, refreshSubscription: async () => {}, showSubModal: false,
      setShowSubModal: () => {}, subModalType: "content" as const, setSubModalType: () => {},
      openSubModal: () => {}, canDownload: () => false, recordDownloadUsage: async () => false,
      downloadsRemaining: () => 0,
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
        const plan = contentPlans.find(p => p.id === data.planId);
        const downloadLimit = plan?.downloadLimit ?? -1;
        const downloadsUsed = data.downloadsUsed || 0;
        setContentSub({ type: "content", planId: data.planId, expiresAt, active, downloadLimit, downloadsUsed });
      } else {
        setContentSub(null);
      }

      const gamesDoc = await getDoc(doc(db, "subscriptions", `${user.id}_games`));
      if (gamesDoc.exists()) {
        const data = gamesDoc.data();
        const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt);
        const active = expiresAt > new Date();
        setGamesSub({ type: "games", planId: data.planId, expiresAt, active, downloadLimit: -1, downloadsUsed: 0 });
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
  const hasContentAccess = isAdmin || isCreator || (contentSub?.active ?? false);
  const hasGamesAccess = isAdmin || (gamesSub?.active ?? false);

  const canDownload = (): boolean => {
    if (isAdmin || isCreator) return true;
    if (!contentSub?.active) return false;
    if (contentSub.downloadLimit === -1) return true; // unlimited
    return contentSub.downloadsUsed < contentSub.downloadLimit;
  };

  const downloadsRemaining = (): number => {
    if (isAdmin || isCreator) return -1; // unlimited
    if (!contentSub?.active) return 0;
    if (contentSub.downloadLimit === -1) return -1; // unlimited
    return Math.max(0, contentSub.downloadLimit - contentSub.downloadsUsed);
  };

  const recordDownloadUsage = async (): Promise<boolean> => {
    if (!user || !contentSub?.active) return false;
    if (isAdmin || isCreator) return true; // don't track for internal
    if (contentSub.downloadLimit !== -1 && contentSub.downloadsUsed >= contentSub.downloadLimit) return false;
    
    try {
      await updateDoc(doc(db, "subscriptions", `${user.id}_content`), {
        downloadsUsed: fbIncrement(1),
      });
      // Update local state
      setContentSub(prev => prev ? { ...prev, downloadsUsed: prev.downloadsUsed + 1 } : null);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <SubscriptionContext.Provider value={{ contentSub, gamesSub, hasContentAccess, hasGamesAccess, isLoading, refreshSubscription: fetchSubscription, showSubModal, setShowSubModal, subModalType, setSubModalType, openSubModal, canDownload, recordDownloadUsage, downloadsRemaining }}>
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
    downloadsUsed: 0,
  });

  // Log payment
  const plan = contentPlans.find(p => p.id === planId);
  await setDoc(doc(db, "payments", transactionRef), {
    userId,
    type,
    planId,
    amount: plan?.price || 0,
    transactionRef,
    status: "completed",
    createdAt: Timestamp.now(),
  });
}
