const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
});

export function formatPrice(cents: number): string {
  return nairaFormatter.format(cents / 100);
}
