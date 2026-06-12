/** Taux TVA : 0 % est valide. `fallback` si valeur absente ou invalide. */
export function coerceTaxRate(value: unknown, fallback = 19): number {
  if (value === null || value === undefined || value === "") return fallback;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

/** Parse saisie utilisateur TVA (0 % autorisé). */
export function parseTaxRateInput(value: string): number {
  if (value.trim() === "") return 0;
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

/**
 * Format a number as currency (DZD - Algerian Dinar)
 */
export function formatCurrency(
  n: number | string | null | undefined,
  currency = "DZD"
): string {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(v || 0);
}

/**
 * Format a date string or Date object to French locale
 */
export function formatDate(
  d: string | Date | null | undefined
): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(
  d: string | Date | null | undefined
): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get initials from a name
 */
export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}
