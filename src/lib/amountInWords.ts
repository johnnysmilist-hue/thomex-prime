const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function convertHundreds(num: number): string {
  let result = "";
  if (num > 99) {
    result += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  if (num > 19) {
    result += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }
  if (num > 0) {
    result += ones[num] + " ";
  }
  return result;
}

// Converts a currency amount into words, e.g. 1499.50 -> "One Thousand Four Hundred Ninety Nine and 50/100"
export function amountInWords(amount: number): string {
  const whole = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - whole) * 100);

  if (whole === 0 && cents === 0) return "Zero";

  let num = whole;
  let words = "";
  const units = ["", "Thousand", "Million", "Billion"];
  let unitIndex = 0;

  if (num === 0) {
    words = "Zero";
  } else {
    const parts: string[] = [];
    while (num > 0) {
      const chunk = num % 1000;
      if (chunk > 0) {
        parts.unshift(convertHundreds(chunk).trim() + (units[unitIndex] ? " " + units[unitIndex] : ""));
      }
      num = Math.floor(num / 1000);
      unitIndex++;
    }
    words = parts.join(" ").trim();
  }

  return words + " and " + String(cents).padStart(2, "0") + "/100";
}
