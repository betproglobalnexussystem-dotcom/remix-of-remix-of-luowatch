import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { saveProfileToFirestore, getProfile } from "@/lib/firestore";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalTab: "login" | "register";
  setAuthModalTab: (tab: "login" | "register") => void;
  presetRole: string;
  setPresetRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

async function buildUser(fbUser: FirebaseUser): Promise<User> {
  const profile = await getProfile(fbUser.uid);
  return {
    id: fbUser.uid,
    email: fbUser.email || "",
    firstName: profile?.firstName || fbUser.displayName?.split(" ")[0] || "",
    lastName: profile?.lastName || fbUser.displayName?.split(" ").slice(1).join(" ") || "",
    role: profile?.role || "viewer",
    phone: profile?.phone,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [presetRole, setPresetRole] = useState("viewer");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const u = await buildUser(fbUser);
        setUser(u);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowAuthModal(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Login failed" };
    }
  };

  const register = async (data: {
    email: string; password: string; firstName: string; lastName: string; role: string; phone?: string;
  }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(cred.user, { displayName: `${data.firstName} ${data.lastName}` });
      await saveProfileToFirestore(cred.user.uid, {
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        email: data.email,
      });
      const u = await buildUser(cred.user);
      setUser(u);
      setShowAuthModal(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Registration failed" };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const existing = await getProfile(result.user.uid);
      if (!existing) {
        await saveProfileToFirestore(result.user.uid, {
          firstName: result.user.displayName?.split(" ")[0] || "",
          lastName: result.user.displayName?.split(" ").slice(1).join(" ") || "",
          role: "viewer",
          email: result.user.email || "",
        });
      }
      const u = await buildUser(result.user);
      setUser(u);
      setShowAuthModal(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Google sign-in failed" };
    }
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, logout, showAuthModal, setShowAuthModal, authModalTab, setAuthModalTab, presetRole, setPresetRole }}>
      {children}
    </AuthContext.Provider>
  );
};
