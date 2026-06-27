import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const decimalCurrencyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number, { decimals = false }: { decimals?: boolean } = {}): string {
  return decimals ? decimalCurrencyFormatter.format(value) : currencyFormatter.format(value);
}

export function formatArea(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return `${value} m²`;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return formatDistanceToNow(date, { locale: pt, addSuffix: true });
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
