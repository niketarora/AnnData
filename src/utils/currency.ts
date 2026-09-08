// Currency formatting utilities adhering to DESIGN_SOURCE.md
// Rule: No whitespace between ₹ and numbers, tabular figures, and proper lakh/crore commas

export function formatRupee(amount: number, options?: { includeDecimals?: boolean }): string {
  if (isNaN(amount)) return '₹0';

  const fixed = options?.includeDecimals ? amount.toFixed(2) : Math.round(amount).toString();
  const parts = fixed.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? `.${parts[1]}` : '';

  // Indian numbering system format (last 3 digits, then pairs of 2)
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  } else {
    integerPart = lastThree;
  }

  return `₹${integerPart}${decimalPart}`;
}

export function formatLakh(amount: number): string {
  if (amount >= 100000) {
    const inLakhs = (amount / 100000).toFixed(1);
    return `₹${inLakhs}L`;
  }
  return formatRupee(amount);
}

export function formatRatePerQuintal(rate: number): string {
  return `${formatRupee(rate)} / QTL`;
}

export function parseRupee(value: string): number {
  const clean = value.replace(/[^0-9.-]/g, '');
  return parseFloat(clean) || 0;
}
