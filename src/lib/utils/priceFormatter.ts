export function toEnDigit(s: string | number): string {
  return String(s)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export function formatPrice(amount: number | null | undefined, suffix = ' تومان'): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('fa-IR') + suffix;
}

export function parsePrice(value: string | number | null | undefined): number {
  const raw = toEnDigit(value || '').replace(/[^0-9]/g, '');
  return parseInt(raw, 10) || 0;
}

export function formatPriceInput(value: string): string {
  const raw = toEnDigit(value).replace(/[^0-9]/g, '');
  if (!raw) return '';
  return Number(raw).toLocaleString('fa-IR');
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fa-IR');
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms = 300): (...args: A) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
