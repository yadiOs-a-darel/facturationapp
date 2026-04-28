/**
 * Format a number as currency (DZD - Algerian Dinar)
 */
export function formatCurrency(n, currency = "DZD") {
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
export function formatDate(d) {
    if (!d)
        return "—";
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
export function formatDateTime(d) {
    if (!d)
        return "—";
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
export function initials(name) {
    if (!name)
        return "?";
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? "")
        .join("");
}
