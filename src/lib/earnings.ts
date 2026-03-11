import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, setDoc,
  query, where, orderBy, increment, serverTimestamp, Timestamp, onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

// ============ TYPES ============

export interface CreatorEarning {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorRole: "vj" | "musician";
  totalDownloads: number;
  totalEarned: number;
  totalWithdrawn: number;
  balance: number;
  // For musicians: monthly milestone tracking
  monthlyDownloads: number;
  currentMonth: string; // "2026-03" format
  updatedAt: Timestamp | null;
}

export interface EarningTransaction {
  id: string;
  creatorId: string;
  creatorName: string;
  type: "download_credit" | "withdrawal" | "milestone_bonus";
  amount: number;
  contentId: string;
  contentTitle: string;
  downloadedByUserId: string;
  downloadedByName: string;
  status: "completed" | "pending" | "failed";
  phone?: string;
  createdAt: Timestamp | null;
}

// ============ VJ EARNINGS: 250 UGX PER DOWNLOAD ============

const VJ_RATE_PER_DOWNLOAD = 250;
const MUSICIAN_MONTHLY_THRESHOLD = 10000;
const MUSICIAN_MONTHLY_PAYOUT = 50000;

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Get or create earning record for a creator
export async function getOrCreateEarning(creatorId: string, creatorName: string, role: "vj" | "musician"): Promise<CreatorEarning> {
  const ref = doc(db, "creator_earnings", creatorId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    const earning = { id: snap.id, ...data } as CreatorEarning;
    // Reset monthly downloads if new month (for musicians)
    const currentMonth = getCurrentMonth();
    if (role === "musician" && earning.currentMonth !== currentMonth) {
      await updateDoc(ref, { monthlyDownloads: 0, currentMonth });
      earning.monthlyDownloads = 0;
      earning.currentMonth = currentMonth;
    }
    return earning;
  }
  // Create new
  const newEarning = {
    creatorId,
    creatorName,
    creatorRole: role,
    totalDownloads: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    balance: 0,
    monthlyDownloads: 0,
    currentMonth: getCurrentMonth(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, newEarning);
  return { id: creatorId, ...newEarning, updatedAt: null } as CreatorEarning;
}

// Record a confirmed download and credit the creator
export async function creditVJDownload(
  vjId: string,
  vjName: string,
  contentId: string,
  contentTitle: string,
  downloadedByUserId: string,
  downloadedByName: string
): Promise<void> {
  const ref = doc(db, "creator_earnings", vjId);
  
  // Ensure record exists
  await getOrCreateEarning(vjId, vjName, "vj");
  
  // Credit 250 UGX
  await updateDoc(ref, {
    totalDownloads: increment(1),
    totalEarned: increment(VJ_RATE_PER_DOWNLOAD),
    balance: increment(VJ_RATE_PER_DOWNLOAD),
    updatedAt: serverTimestamp(),
  });

  // Log the transaction
  await addDoc(collection(db, "earning_transactions"), {
    creatorId: vjId,
    creatorName: vjName,
    type: "download_credit",
    amount: VJ_RATE_PER_DOWNLOAD,
    contentId,
    contentTitle,
    downloadedByUserId,
    downloadedByName,
    status: "completed",
    createdAt: serverTimestamp(),
  });
}

// Record a confirmed download for musician (monthly milestone)
export async function creditMusicianDownload(
  musicianId: string,
  musicianName: string,
  contentId: string,
  contentTitle: string,
  downloadedByUserId: string,
  downloadedByName: string
): Promise<void> {
  const ref = doc(db, "creator_earnings", musicianId);
  const currentMonth = getCurrentMonth();
  
  // Ensure record exists
  const earning = await getOrCreateEarning(musicianId, musicianName, "musician");
  
  // Increment monthly downloads
  const newMonthlyDownloads = (earning.monthlyDownloads || 0) + 1;
  
  await updateDoc(ref, {
    totalDownloads: increment(1),
    monthlyDownloads: increment(1),
    currentMonth,
    updatedAt: serverTimestamp(),
  });

  // Check if they just hit the milestone
  if (newMonthlyDownloads === MUSICIAN_MONTHLY_THRESHOLD) {
    await updateDoc(ref, {
      totalEarned: increment(MUSICIAN_MONTHLY_PAYOUT),
      balance: increment(MUSICIAN_MONTHLY_PAYOUT),
    });

    // Log milestone bonus
    await addDoc(collection(db, "earning_transactions"), {
      creatorId: musicianId,
      creatorName: musicianName,
      type: "milestone_bonus",
      amount: MUSICIAN_MONTHLY_PAYOUT,
      contentId: "",
      contentTitle: `Monthly milestone reached (${MUSICIAN_MONTHLY_THRESHOLD} downloads)`,
      downloadedByUserId: "",
      downloadedByName: "",
      status: "completed",
      createdAt: serverTimestamp(),
    });
  }

  // Log the download (no direct earnings per download for musicians)
  await addDoc(collection(db, "earning_transactions"), {
    creatorId: musicianId,
    creatorName: musicianName,
    type: "download_credit",
    amount: 0,
    contentId,
    contentTitle,
    downloadedByUserId,
    downloadedByName,
    status: "completed",
    createdAt: serverTimestamp(),
  });
}

// Record withdrawal
export async function recordWithdrawal(
  creatorId: string,
  creatorName: string,
  amount: number,
  phone: string,
  status: "completed" | "pending" | "failed"
): Promise<void> {
  if (status === "completed" || status === "pending") {
    await updateDoc(doc(db, "creator_earnings", creatorId), {
      totalWithdrawn: increment(amount),
      balance: increment(-amount),
      updatedAt: serverTimestamp(),
    });
  }

  await addDoc(collection(db, "earning_transactions"), {
    creatorId,
    creatorName,
    type: "withdrawal",
    amount,
    contentId: "",
    contentTitle: "Withdrawal to Mobile Money",
    downloadedByUserId: "",
    downloadedByName: "",
    status,
    phone,
    createdAt: serverTimestamp(),
  });
}

// Get creator's earning record
export async function getCreatorEarning(creatorId: string): Promise<CreatorEarning | null> {
  const snap = await getDoc(doc(db, "creator_earnings", creatorId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as CreatorEarning;
}

// Subscribe to creator's earning record
export function subscribeCreatorEarning(creatorId: string, callback: (earning: CreatorEarning | null) => void) {
  return onSnapshot(doc(db, "creator_earnings", creatorId), (snap) => {
    if (!snap.exists()) { callback(null); return; }
    callback({ id: snap.id, ...snap.data() } as CreatorEarning);
  });
}

// Get all creator earnings (for admin)
export async function getAllCreatorEarnings(): Promise<CreatorEarning[]> {
  const snap = await getDocs(collection(db, "creator_earnings"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CreatorEarning));
}

// Get transactions for a creator
export async function getCreatorTransactions(creatorId: string): Promise<EarningTransaction[]> {
  const q = query(
    collection(db, "earning_transactions"),
    where("creatorId", "==", creatorId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as EarningTransaction));
}

// Get all transactions (for admin)
export async function getAllEarningTransactions(): Promise<EarningTransaction[]> {
  const q = query(collection(db, "earning_transactions"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as EarningTransaction));
}

// Check if a subscription was admin-activated (not paid by user)
export async function isAdminActivatedSub(userId: string): Promise<boolean> {
  const contentDoc = await getDoc(doc(db, "subscriptions", `${userId}_content`));
  if (!contentDoc.exists()) return false;
  const data = contentDoc.data();
  return data.transactionRef?.startsWith("admin_manual_") || data.transactionRef === "admin_bypass";
}

// Reset all movie/music download & view counts to 0
export async function resetAllContentCounts(): Promise<void> {
  // Reset movies
  const moviesSnap = await getDocs(collection(db, "movies"));
  const movieUpdates = moviesSnap.docs.map(d => updateDoc(d.ref, { views: 0, downloads: 0 }));
  
  // Reset music
  const musicSnap = await getDocs(collection(db, "music"));
  const musicUpdates = musicSnap.docs.map(d => updateDoc(d.ref, { plays: 0, downloads: 0 }));
  
  await Promise.all([...movieUpdates, ...musicUpdates]);
}
