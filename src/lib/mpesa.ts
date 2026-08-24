// Server-only helper for Safaricom Daraja M-Pesa API (STK Push / Lipa na M-Pesa Online).
// Requires these environment variables to be set (in Vercel: Project Settings -> Environment Variables):
//   MPESA_ENV              "sandbox" or "production"
//   MPESA_CONSUMER_KEY
//   MPESA_CONSUMER_SECRET
//   MPESA_SHORTCODE        Your Paybill or Till number
//   MPESA_PASSKEY          Lipa na M-Pesa Online Passkey (from Daraja app)
//   MPESA_CALLBACK_URL     Public HTTPS URL Safaricom will POST results to,
//                          e.g. https://your-site.vercel.app/api/mpesa/callback

function baseUrl() {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

export async function getMpesaAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;

  if (!key || !secret) {
    throw new Error("M-Pesa credentials are not configured on the server.");
  }

  const credentials = Buffer.from(key + ":" + secret).toString("base64");

  const res = await fetch(baseUrl() + "/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: "Basic " + credentials },
  });

  if (!res.ok) {
    throw new Error("Failed to get M-Pesa access token (" + res.status + ")");
  }

  const data = await res.json();
  return data.access_token as string;
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

// Normalizes a Kenyan phone number to the 2547XXXXXXXX / 2541XXXXXXXX format Safaricom requires.
export function normalizeMpesaPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return "254" + digits.slice(1);
  if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) return "254" + digits;
  return null;
}

export async function initiateStkPush(params: {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  if (!shortcode || !passkey || !callbackUrl) {
    throw new Error("M-Pesa shortcode, passkey, or callback URL is not configured on the server.");
  }

  const ts = timestamp();
  const password = Buffer.from(shortcode + passkey + ts).toString("base64");
  const accessToken = await getMpesaAccessToken();

  const res = await fetch(baseUrl() + "/mpesa/stkpush/v1/processrequest", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(params.amount),
      PartyA: params.phone,
      PartyB: shortcode,
      PhoneNumber: params.phone,
      CallBackURL: callbackUrl,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.errorCode) {
    throw new Error(data.errorMessage || "M-Pesa declined the payment request.");
  }

  return data as {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
  };
}

export async function queryStkStatus(checkoutRequestId: string) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortcode || !passkey) {
    throw new Error("M-Pesa shortcode or passkey is not configured on the server.");
  }

  const ts = timestamp();
  const password = Buffer.from(shortcode + passkey + ts).toString("base64");
  const accessToken = await getMpesaAccessToken();

  const res = await fetch(baseUrl() + "/mpesa/stkpushquery/v1/query", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  return res.json();
}
