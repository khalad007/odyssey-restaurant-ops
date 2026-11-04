/** Parse the display amount without multiplying a floating-point decimal. */
export function priceInputToCents(value: string) {
  const parts = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!parts) return Number.NaN;
  return Number(parts[1]) * 100 + Number((parts[2] ?? '').padEnd(2, '0'));
}
