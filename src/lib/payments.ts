const API_BASE = "https://api.livrauganda.workers.dev/api";

export interface PaymentResponse {
  success: boolean;
  status?: string;
  message?: string;
  internal_reference?: string;
  customer_reference?: string;
  msisdn?: string;
  amount?: number;
  currency?: string;
  provider?: string;
  charge?: number;
  request_status?: string;
  provider_transaction_id?: string;
  completed_at?: string;
  [key: string]: any;
}

export interface WalletBalance {
  success: boolean;
  balance?: number;
  currency?: string;
  [key: string]: any;
}

export interface Transaction {
  id?: string;
  type: string;
  amount: number;
  msisdn: string;
  status: string;
  reference?: string;
  description?: string;
  created_at?: string;
  [key: string]: any;
}

// Request payment from user (deposit)
export async function requestPayment(msisdn: string, amount: number, description: string): Promise<PaymentResponse> {
  const res = await fetch(`${API_BASE}/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msisdn, amount, description }),
  });
  return res.json();
}

// Send money to user (withdraw)
export async function sendWithdrawal(msisdn: string, amount: number, description: string): Promise<PaymentResponse> {
  const res = await fetch(`${API_BASE}/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msisdn, amount, description }),
  });
  return res.json();
}

// Validate phone number
export async function validatePhone(msisdn: string): Promise<any> {
  const res = await fetch(`${API_BASE}/validate-phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msisdn }),
  });
  return res.json();
}

// Check wallet balance
export async function getWalletBalance(): Promise<WalletBalance> {
  const res = await fetch(`${API_BASE}/wallet/balance`);
  return res.json();
}

// Check request status
export async function checkRequestStatus(internalReference: string): Promise<PaymentResponse> {
  const res = await fetch(`${API_BASE}/request-status?internal_reference=${encodeURIComponent(internalReference)}`);
  return res.json();
}

// Get transaction history
export async function getTransactionHistory(): Promise<any> {
  const res = await fetch(`${API_BASE}/transactions`);
  return res.json();
}

// Format phone number to +256 format
export function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("0")) cleaned = "+256" + cleaned.slice(1);
  if (cleaned.startsWith("256") && !cleaned.startsWith("+")) cleaned = "+" + cleaned;
  if (!cleaned.startsWith("+")) cleaned = "+256" + cleaned;
  return cleaned;
}

// Poll payment status until success/failure
export function pollPaymentStatus(
  internalReference: string,
  onSuccess: (data: PaymentResponse) => void,
  onFailed: (data: PaymentResponse) => void,
  onPending?: (data: PaymentResponse) => void,
  intervalMs = 5000,
  maxAttempts = 60
): () => void {
  let attempts = 0;
  let stopped = false;

  const poll = async () => {
    if (stopped || attempts >= maxAttempts) {
      if (!stopped) onFailed({ success: false, message: "Payment timeout - please check your phone" });
      return;
    }
    attempts++;
    try {
      const data = await checkRequestStatus(internalReference);
      console.log("Payment status poll:", data);
      
      if (data.success && (data.request_status === "success" || data.status === "success")) {
        onSuccess(data);
        return;
      } else if (data.request_status === "failed" || data.status === "failed") {
        onFailed(data);
        return;
      } else {
        onPending?.(data);
        setTimeout(poll, intervalMs);
      }
    } catch (err) {
      console.error("Poll error:", err);
      setTimeout(poll, intervalMs);
    }
  };

  poll();
  return () => { stopped = true; };
}
