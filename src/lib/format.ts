/** Serbian number/price/date formatting helpers. */

/** 1180 -> "1.180 RSD" (dot as thousands separator, as on Serbian menus). */
export function formatPrice(value: number, currency = 'RSD'): string {
  const rounded = Math.round(value);
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${rounded < 0 ? '−' : ''}${digits} ${currency}`;
}

export const WEEKDAYS_SR = ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'] as const;
export const WEEKDAYS_SR_SHORT = ['ned', 'pon', 'uto', 'sre', 'čet', 'pet', 'sub'] as const;
export const MONTHS_SR_SHORT = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'] as const;

/** "2026-10-16" -> "16.10.2026." */
export function formatDateSR(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}.`;
}

/** 4.4 -> "4,4" */
export const formatDecimalSR = (n: number, digits = 1): string => n.toFixed(digits).replace('.', ',');
