import {
  collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp, Timestamp, onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

export interface FireCarousel {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  description: string;
  createdAt: Timestamp | null;
}

export async function addCarousel(data: Omit<FireCarousel, "id" | "createdAt">) {
  return addDoc(collection(db, "carousels"), { ...data, createdAt: serverTimestamp() });
}

export async function getCarousels() {
  const q = query(collection(db, "carousels"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FireCarousel));
}

export async function deleteCarousel(id: string) {
  return deleteDoc(doc(db, "carousels", id));
}

export function subscribeCarousels(callback: (carousels: FireCarousel[]) => void) {
  const q = query(collection(db, "carousels"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as FireCarousel)));
  });
}
