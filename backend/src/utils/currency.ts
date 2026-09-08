export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatRupee(amount: number): string {
  const rounded = roundToTwoDecimals(amount);
  const parts = rounded.toFixed(2).split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  // Indian number formatting: 3 digits from right, then groups of 2
  const lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  const formattedInt =
    otherNumbers !== ''
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
      : lastThree;

  return decPart === '00' ? `₹${formattedInt}` : `₹${formattedInt}.${decPart}`;
}

export function parseRupee(formatted: string): number {
  const clean = formatted.replace(/[₹,\s]/g, '');
  return parseFloat(clean) || 0;
}
