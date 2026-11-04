/** Formats integer cents. Currency and locale default to USD and en-US. */
export function formatCurrencyFromCents(cents: number, currency = 'USD', locale = 'en-US'): string {
  if (!Number.isSafeInteger(cents)) throw new RangeError('Money must be a safe integer number of cents.');
  const units = BigInt(cents) / 100n;
  const fraction = String(Math.abs(cents % 100)).padStart(2, '0');
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  // Format whole units exactly, then supply cents without floating-point rounding.
  // Preserve the sign for negative amounts smaller than one whole unit.
  return formatter.formatToParts(cents < 0 && units === 0n ? -0 : units)
    .map((part) => part.type === 'fraction' ? fraction : part.value).join('');
}
