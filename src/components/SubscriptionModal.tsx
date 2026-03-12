import { Crown, Smartphone, X, Gamepad2, Loader2 } from "lucide-react";
import { contentPlans, gamesPlan, SubscriptionPlan } from "@/data/subscriptionPlans";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, activateSubscription } from "@/contexts/SubscriptionContext";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { requestPayment, pollPaymentStatus, formatPhone } from "@/lib/payments";

const SubscriptionModal = () => {
  const { user } = useAuth();
  const { showSubModal, setShowSubModal, subModalType, refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const stopPollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => { stopPollRef.current?.(); };
  }, []);

  if (!showSubModal) return null;

  const plans = subModalType === "games" ? [gamesPlan] : contentPlans;

  const handlePayment = async (plan: SubscriptionPlan) => {
    if (!user) return;
    if (!phone) { toast.error("Enter your Mobile Money number"); return; }
    
    setLoading(plan.id);
    setStatus("Sending payment request...");
    
    try {
      const msisdn = formatPhone(phone);
      const description = `LUO WATCH ${plan.name} - ${plan.description}`;
      const res = await requestPayment(msisdn, plan.price, description);
      
      if (!res.success && !res.internal_reference) {
        toast.error(res.message || "Failed to initiate payment");
        setLoading(null);
        setStatus("");
        return;
      }

      const ref = res.internal_reference || "";
      setStatus("Check your phone and approve the payment...");
      toast.info("Payment request sent! Approve on your phone.");

      stopPollRef.current = pollPaymentStatus(
        ref,
        async (data) => {
          // SUCCESS
          setStatus("Payment successful! Activating...");
          try {
            await activateSubscription(
              user.id, plan.type, plan.id, plan.duration,
              data.provider_transaction_id || data.internal_reference || ref
            );
            await refreshSubscription();
            toast.success(`${plan.name} activated! Enjoy!`);
            setShowSubModal(false);
          } catch {
            toast.error("Payment received but activation failed. Contact support.");
          }
          setLoading(null);
          setStatus("");
        },
        (data) => {
          // FAILED
          toast.error(data.message || "Payment failed");
          setLoading(null);
          setStatus("");
        },
        () => {
          // PENDING
          setStatus("Waiting for payment confirmation...");
        }
      );
    } catch (err: any) {
      toast.error("Payment failed: " + (err.message || "Unknown error"));
      setLoading(null);
      setStatus("");
    }
  };

  const handleClose = () => {
    stopPollRef.current?.();
    setLoading(null);
    setStatus("");
    setShowSubModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="bg-card border border-border rounded-2xl w-[90%] max-w-sm max-h-[80vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-4 text-center">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
            {subModalType === "games" ? <Gamepad2 className="w-4 h-4 text-primary" /> : <Crown className="w-4 h-4 text-primary" />}
          </div>
          <h2 className="text-foreground text-sm font-bold mb-2">
            {subModalType === "games" ? "Select Games Pass" : "Select Plan"}
          </h2>

          {/* Phone input */}
          <div className="mb-3">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Mobile Money Number (e.g. 0770 000 000)"
              className="w-full bg-secondary text-foreground text-xs px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary text-center"
            />
          </div>

          {status && (
            <div className="bg-primary/10 text-primary text-[10px] font-semibold px-3 py-2 rounded-lg mb-3 flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> {status}
            </div>
          )}

          <div className={`grid gap-2 ${subModalType === "games" ? "grid-cols-1" : "grid-cols-2"}`}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-background border rounded-xl p-3 text-center transition-all hover:border-primary/50 ${
                  plan.id === "1week" ? "border-primary ring-1 ring-primary/30" : plan.id === "1year" ? "border-accent ring-1 ring-accent/30" : "border-border"
                }`}
              >
                {plan.id === "3months" && (
                  <span className="bg-primary text-primary-foreground text-[8px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block">BEST VALUE</span>
                )}
                {plan.id === "1year" && (
                  <span className="bg-accent text-accent-foreground text-[8px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block">UNLIMITED</span>
                )}
                <h3 className="text-foreground text-xs font-bold">{plan.name}</h3>
                <div className="text-primary text-base font-bold">{plan.priceFormatted}</div>
                <p className="text-muted-foreground text-[9px] mb-1">{plan.description}</p>
                {plan.downloadLimit > 0 && (
                  <p className="text-primary text-[8px] font-bold mb-1">📥 {plan.downloadLimit} downloads</p>
                )}
                {plan.downloadLimit === -1 && plan.type === "content" && (
                  <p className="text-accent text-[8px] font-bold mb-1">📥 Unlimited downloads</p>
                )}
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={!!loading}
                  className="w-full bg-primary text-primary-foreground py-1.5 rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {loading === plan.id ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</> : <><Smartphone className="w-3 h-3" /> Subscribe</>}
                </button>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-[9px] mt-3">Secure payment via MTN & Airtel Mobile Money</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
