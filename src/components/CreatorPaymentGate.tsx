import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, CreditCard, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestPayment, pollPaymentStatus, formatPhone } from "@/lib/payments";

interface Props {
  children: React.ReactNode;
  role: "vj" | "musician";
}

const FEE_AMOUNT = 10000; // UGX

export async function checkCreatorPayment(userId: string, role: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "creator_payments", `${userId}_${role}`));
  return snap.exists() && snap.data()?.paid === true;
}

export async function recordCreatorPayment(userId: string, role: string, transactionRef: string) {
  await setDoc(doc(db, "creator_payments", `${userId}_${role}`), {
    userId, role, amount: FEE_AMOUNT, transactionRef, paid: true, paidAt: Timestamp.now(),
  });
}

const CreatorPaymentGate = ({ children, role }: Props) => {
  const { user } = useAuth();
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("");
  const stopPollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user) return;
    checkCreatorPayment(user.id, role).then(setHasPaid);
    return () => { stopPollRef.current?.(); };
  }, [user, role]);

  if (hasPaid === null) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-xs">Loading...</div>;
  }

  if (hasPaid) return <>{children}</>;

  const handlePayment = async () => {
    if (!phoneNumber) { toast.error("Enter your phone number"); return; }
    if (!user) return;
    setLoading(true);
    setStatus("Sending payment request...");
    
    try {
      const msisdn = formatPhone(phoneNumber);
      const res = await requestPayment(msisdn, FEE_AMOUNT, `LUO WATCH ${role.toUpperCase()} Access Fee`);
      
      if (!res.success && !res.internal_reference) {
        toast.error(res.message || "Payment failed");
        setLoading(false); setStatus("");
        return;
      }

      const ref = res.internal_reference || "";
      setStatus("Check your phone and approve...");
      toast.info("Payment request sent!");

      stopPollRef.current = pollPaymentStatus(
        ref,
        async (data) => {
          setStatus("Payment successful!");
          await recordCreatorPayment(user.id, role, data.provider_transaction_id || ref);
          setHasPaid(true);
          toast.success(`${role.toUpperCase()} access activated!`);
          setLoading(false); setStatus("");
        },
        (data) => {
          toast.error(data.message || "Payment failed");
          setLoading(false); setStatus("");
        },
        () => setStatus("Waiting for confirmation...")
      );
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
      setLoading(false); setStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-foreground text-sm font-bold mb-1">{role.toUpperCase()} Dashboard Access</h2>
        <p className="text-muted-foreground text-[11px] mb-4">
          A one-time payment of <span className="text-primary font-bold">10,000 UGX</span> is required. Pay once, access forever.
        </p>
        <div className="bg-secondary/50 rounded p-3 mb-4 text-left">
          <p className="text-foreground text-[10px] font-semibold mb-2">What you get:</p>
          <ul className="space-y-1">
            {role === "vj" ? (
              <>
                <li className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><CheckCircle className="w-3 h-3 text-primary flex-shrink-0" /> Upload & manage movies & series</li>
                <li className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><CheckCircle className="w-3 h-3 text-primary flex-shrink-0" /> Track views, downloads & earnings</li>
                <li className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><CheckCircle className="w-3 h-3 text-primary flex-shrink-0" /> Withdraw earnings to Mobile Money</li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><CheckCircle className="w-3 h-3 text-primary flex-shrink-0" /> Upload & manage music videos</li>
                <li className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><CheckCircle className="w-3 h-3 text-primary flex-shrink-0" /> Track plays & downloads</li>
                <li className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><CheckCircle className="w-3 h-3 text-primary flex-shrink-0" /> Withdraw earnings to Mobile Money</li>
              </>
            )}
          </ul>
        </div>
        {status && (
          <div className="bg-primary/10 text-primary text-[10px] font-semibold px-3 py-2 rounded-lg mb-3 flex items-center justify-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" /> {status}
          </div>
        )}
        <div className="space-y-2">
          <input type="tel" placeholder="Phone number (e.g. 0770 000 000)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-secondary text-foreground text-xs px-3 py-2 rounded border border-border focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={handlePayment} disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</> : <><CreditCard className="w-3.5 h-3.5" /> Pay 10,000 UGX via Mobile Money</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorPaymentGate;
