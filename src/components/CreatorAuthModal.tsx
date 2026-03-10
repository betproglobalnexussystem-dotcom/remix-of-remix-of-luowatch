import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Phone, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { saveProfileToFirestore, getProfile } from "@/lib/firestore";
import { signInWithPopup, updateProfile as fbUpdateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface Props {
  open: boolean;
  onClose: () => void;
  role: "vj" | "musician" | "tiktoker";
}

const roleLabels: Record<string, { title: string; nameLabel: string; namePlaceholder: string }> = {
  vj: { title: "Join as VJ", nameLabel: "VJ Name", namePlaceholder: "Enter your VJ name" },
  musician: { title: "Join as Musician", nameLabel: "Artist Name", namePlaceholder: "Enter your artist name" },
  tiktoker: { title: "Join as TikToker", nameLabel: "TikToker Name", namePlaceholder: "Enter your TikToker name" },
};

const CreatorAuthModal = ({ open, onClose, role }: Props) => {
  const { register, login } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<"register" | "login">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register fields
  const [creatorName, setCreatorName] = useState("");
  const [phone, setPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Google extra info step
  const [googleStep, setGoogleStep] = useState(false);
  const [googleUid, setGoogleUid] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");

  const info = roleLabels[role];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName || !phone || !regEmail || !regPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (regPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await register({
      email: regEmail,
      password: regPassword,
      firstName: creatorName,
      lastName: "",
      role,
      phone,
    });
    setLoading(false);
    if (result.success) {
      toast({ title: "Account created!", description: `Welcome to LUO WATCH as a ${role.toUpperCase()}` });
      onClose();
      resetForm();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);
    if (result.success) {
      toast({ title: "Welcome back!", description: "You have signed in successfully" });
      onClose();
      resetForm();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const existing = await getProfile(result.user.uid);
      if (existing && existing.role === role) {
        // Already registered as this role, just log in
        toast({ title: "Welcome back!", description: "Signed in with Google" });
        onClose();
        resetForm();
        // Force re-auth state
        window.location.reload();
      } else if (existing) {
        // Existing user but different role - still let them in
        toast({ title: "Welcome back!", description: "Signed in with Google" });
        onClose();
        resetForm();
        window.location.reload();
      } else {
        // New user - need extra info
        setGoogleUid(result.user.uid);
        setGoogleEmail(result.user.email || "");
        setGoogleStep(true);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Google sign-in failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleGoogleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName || !phone) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await fbUpdateProfile(currentUser, { displayName: creatorName });
      }
      await saveProfileToFirestore(googleUid, {
        firstName: creatorName,
        lastName: "",
        role,
        phone,
        email: googleEmail,
      });
      toast({ title: "Account created!", description: `Welcome to LUO WATCH as a ${role.toUpperCase()}` });
      onClose();
      resetForm();
      window.location.reload();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save profile", variant: "destructive" });
    }
    setLoading(false);
  };

  const resetForm = () => {
    setCreatorName("");
    setPhone("");
    setRegEmail("");
    setRegPassword("");
    setLoginEmail("");
    setLoginPassword("");
    setGoogleStep(false);
    setGoogleUid("");
    setGoogleEmail("");
    setTab("register");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); resetForm(); } }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-card border-border overflow-y-auto max-h-[90vh]">
        <DialogTitle className="sr-only">{info.title}</DialogTitle>

        {/* Header */}
        <div className="p-4 pb-2 text-center border-b border-border">
          <h2 className="text-foreground text-sm font-bold">{info.title}</h2>
          <p className="text-muted-foreground text-[10px] mt-0.5">
            {role === "tiktoker" ? "Free to join!" : "One-time fee of 10,000 UGX after registration"}
          </p>
        </div>

        {googleStep ? (
          /* Google extra info step */
          <div className="p-5">
            <p className="text-foreground text-[11px] font-semibold mb-3">Complete your profile</p>
            <form className="space-y-3" onSubmit={handleGoogleComplete}>
              <div>
                <label className="text-foreground text-[11px] font-semibold mb-1 block">{info.nameLabel}</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder={info.namePlaceholder} value={creatorName} onChange={(e) => setCreatorName(e.target.value)} className="w-full bg-secondary text-foreground text-xs pl-8 pr-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="text-foreground text-[11px] font-semibold mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="tel" placeholder="0770 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-secondary text-foreground text-xs pl-8 pr-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {loading ? "Saving..." : "Complete Registration"}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-border">
              <button onClick={() => setTab("register")} className={`flex-1 py-2.5 text-xs font-bold transition-colors ${tab === "register" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                Create Account
              </button>
              <button onClick={() => setTab("login")} className={`flex-1 py-2.5 text-xs font-bold transition-colors ${tab === "login" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                Sign In
              </button>
            </div>

            <div className="p-5">
              {tab === "register" ? (
                <form className="space-y-3" onSubmit={handleRegister}>
                  <div>
                    <label className="text-foreground text-[11px] font-semibold mb-1 block">{info.nameLabel}</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder={info.namePlaceholder} value={creatorName} onChange={(e) => setCreatorName(e.target.value)} className="w-full bg-secondary text-foreground text-xs pl-8 pr-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-foreground text-[11px] font-semibold mb-1 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="tel" placeholder="0770 000 000" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-secondary text-foreground text-xs pl-8 pr-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-foreground text-[11px] font-semibold mb-1 block">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="email" placeholder="Enter your email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full bg-secondary text-foreground text-xs pl-8 pr-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-foreground text-[11px] font-semibold mb-1 block">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showPassword ? "text" : "password"} placeholder="Create a password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full bg-secondary text-foreground text-xs pl-8 pr-8 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center"><span className="bg-card px-2 text-[10px] text-muted-foreground">or</span></div>
                  </div>

                  <button type="button" onClick={handleGoogle} disabled={loading} className="w-full bg-secondary text-foreground py-2 rounded text-xs font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 border border-border disabled:opacity-50">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                </form>
              ) : (
                <form className="space-y-3" onSubmit={handleLogin}>
                  <div>
                    <label className="text-foreground text-[11px] font-semibold mb-1 block">Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="email" placeholder="Enter your email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-secondary text-foreground text-xs pl-8 pr-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="text-foreground text-[11px] font-semibold mb-1 block">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-secondary text-foreground text-xs pl-8 pr-8 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-2 rounded text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {loading ? "Signing In..." : "Sign In"}
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center"><span className="bg-card px-2 text-[10px] text-muted-foreground">or</span></div>
                  </div>

                  <button type="button" onClick={handleGoogle} disabled={loading} className="w-full bg-secondary text-foreground py-2 rounded text-xs font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 border border-border disabled:opacity-50">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreatorAuthModal;
