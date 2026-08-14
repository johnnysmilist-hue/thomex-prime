const symbols: Record<string, string> = {
  KES: "KSh",
  USD: "$",
  EUR: "€",
  GBP: "£",
  UGX: "USh",
  TZS: "TSh",
  NGN: "₦",
  ZAR: "R",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
};

export function getCurrencySymbol(code: string): string {
  return symbols[code] || code + " ";
}

export async function detectUserCurrency(): Promise<string> {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();
    if (data && data.success !== false && data.currency && data.currency.code) {
      return data.currency.code;
    }
  } catch {
    // fall through to default
  }
  return "KES";
}

export async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/KES");
    const data = await res.json();
    if (data && data.rates) {
      return data.rates;
    }
  } catch {
    // fall through to default
  }
  return { KES: 1 };
}

export function convertPrice(amountInKES: number, currency: string, rates: Record<string, number>): number {
  const rate = rates[currency];
  if (!rate) return amountInKES;
  return amountInKES * rate;
}

export function formatPrice(amountInKES: number, currency: string, rates: Record<string, number>): string {
  const converted = convertPrice(amountInKES, currency, rates);
  const symbol = getCurrencySymbol(currency);
  return symbol + converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
