import { Crown, Smartphone, X, Gamepad2, Loader2, ArrowLeft, Check } from "lucide-react";
import { contentPlans, gamesPlan, SubscriptionPlan } from "@/data/subscriptionPlans";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription, activateSubscription } from "@/contexts/SubscriptionContext";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { requestPayment, pollPaymentStatus, formatPhone } from "@/lib/payments";

type Step = "select-plan" | "enter-phone";

const SubscriptionModal = () => {
  const { user } = useAuth();
  const { showSubModal, setShowSubModal, subModalType, refreshSubscription } = useSubscription();
  const [step, setStep] = useState<Step>("select-plan");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const stopPollRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => { stopPollRef.current?.(); };
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (showSubModal) {
      setStep("select-plan");
      setSelectedPlan(null);
      setPhone("");
      setStatus("");
      setLoading(false);
    }
  }, [showSubModal]);

  if (!showSubModal) return null;

  const plans = subModalType === "games" ? [gamesPlan] : contentPlans;

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setStep("enter-phone");
  };

  const handlePay = async () => {
    if (!user || !selectedPlan) return;
    if (!phone.trim()) { toast.error("Enter your Mobile Money number"); return; }

    setLoading(true);
    setStatus("Sending payment request...");

    try {
      const msisdn = formatPhone(phone.trim());
      const description = `LUO WATCH ${selectedPlan.name} - ${selectedPlan.description}`;
      const res = await requestPayment(msisdn, selectedPlan.price, description);

      if (!res.success && !res.internal_reference) {
        toast.error(res.message || "Failed to initiate payment");
        setLoading(false);
        setStatus("");
        return;
      }

      const ref = res.internal_reference || "";
      setStatus("Check your phone and approve the payment...");
      toast.info("Payment request sent! Approve on your phone.");

      stopPollRef.current = pollPaymentStatus(
        ref,
        async (data) => {
          setStatus("Payment successful! Activating...");
          try {
            await activateSubscription(
              user.id, selectedPlan.type, selectedPlan.id, selectedPlan.duration,
              data.provider_transaction_id || data.internal_reference || ref
            );
            await refreshSubscription();
            toast.success(`${selectedPlan.name} activated! Enjoy!`);
            setShowSubModal(false);
          } catch {
            toast.error("Payment received but activation failed. Contact support.");
          }
          setLoading(false);
          setStatus("");
        },
        (data) => {
          toast.error(data.message || "Payment failed");
          setLoading(false);
          setStatus("");
        },
        () => {
          setStatus("Waiting for payment confirmation...");
        }
      );
    } catch (err: any) {
      toast.error("Payment failed: " + (err.message || "Unknown error"));
      setLoading(false);
      setStatus("");
    }
  };

  const handleClose = () => {
    stopPollRef.current?.();
    setLoading(false);
    setStatus("");
    setShowSubModal(false);
  };

  const handleBack = () => {
    stopPollRef.current?.();
    setLoading(false);
    setStatus("");
    setStep("select-plan");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-[90%] max-w-sm max-h-[85vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          {step === "enter-phone" ? (
            <button
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-4" />
          )}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
              {subModalType === "games"
                ? <Gamepad2 className="w-3 h-3 text-primary" />
                : <Crown className="w-3 h-3 text-primary" />
              }
            </div>
            <h2 className="text-foreground text-sm font-bold">
              {step === "select-plan"
                ? (subModalType === "games" ? "Choose Games Pass" : "Choose Your Plan")
                : "Complete Payment"
              }
            </h2>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 px-4 pb-3">
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${
              step === "select-plan" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary"
            }`}>
              {step === "enter-phone" ? <Check className="w-3 h-3" /> : "1"}
            </div>
            <span className="text-[9px] text-muted-foreground">Select Plan</span>
          </div>
          <div className="h-px w-6 bg-border" />
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${
              step === "enter-phone" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              2
            </div>
            <span className="text-[9px] text-muted-foreground">Payment</span>
          </div>
        </div>

        <div className="px-4 pb-4">
          {/* ── STEP 1: Plan Selection ── */}
          {step === "select-plan" && (
            <div className={`grid gap-2 ${subModalType === "games" ? "grid-cols-1" : "grid-cols-2"}`}>
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-background border rounded-xl p-3 text-center transition-all cursor-pointer hover:border-primary/60 active:scale-[0.98] ${
                    plan.id === "1week"
                      ? "border-primary ring-1 ring-primary/30"
                      : plan.id === "1year"
                      ? "border-accent ring-1 ring-accent/30"
                      : "border-border"
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.id === "3months" && (
                    <span className="bg-primary text-primary-foreground text-[8px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block">
                      BEST VALUE
                    </span>
                  )}
                  {plan.id === "1year" && (
                    <span className="bg-accent text-accent-foreground text-[8px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block">
                      UNLIMITED
                    </span>
                  )}
                  <h3 className="text-foreground text-xs font-bold">{plan.name}</h3>
                  <div className="text-primary text-base font-bold">{plan.priceFormatted}</div>
                  <p className="text-muted-foreground text-[9px] mb-2">{plan.description}</p>
                  {plan.downloadLimit > 0 && (
                    <p className="text-primary text-[8px] font-bold mb-2">📥 {plan.downloadLimit} downloads</p>
                  )}
                  {plan.downloadLimit === -1 && plan.type === "content" && (
                    <p className="text-accent text-[8px] font-bold mb-2">📥 Unlimited downloads</p>
                  )}
                  <button
                    className="w-full bg-primary text-primary-foreground py-1.5 rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-colors"
                    onClick={e => { e.stopPropagation(); handleSelectPlan(plan); }}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── STEP 2: Phone Number ── */}
          {step === "enter-phone" && selectedPlan && (
            <div className="flex flex-col gap-3">
              {/* Selected plan summary */}
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-foreground text-xs font-bold">{selectedPlan.name}</p>
                  <p className="text-muted-foreground text-[9px]">{selectedPlan.description}</p>
                </div>
                <div className="text-primary text-sm font-bold">{selectedPlan.priceFormatted}</div>
              </div>

              {/* Phone input */}
              <div>
                <label className="block text-foreground text-[10px] font-semibold mb-1.5 text-left">
                  Mobile Money Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 0770 000 000"
                  disabled={loading}
                  className="w-full bg-secondary text-foreground text-xs px-3 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary text-center disabled:opacity-50"
                  autoFocus
                />
                <p className="text-muted-foreground text-[9px] mt-1 text-center">
                  MTN or Airtel Mobile Money
                </p>
              </div>

              {/* Status */}
              {status && (
                <div className="bg-primary/10 text-primary text-[10px] font-semibold px-3 py-2 rounded-lg flex items-center justify-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" /> {status}
                </div>
              )}

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={loading || !phone.trim()}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                  : <><Smartphone className="w-3.5 h-3.5" /> Pay {selectedPlan.priceFormatted}</>
                }
              </button>

              <p className="text-muted-foreground text-[9px] text-center">
                Secure payment via MTN &amp; Airtel Mobile Money
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
