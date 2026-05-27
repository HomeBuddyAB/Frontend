/** Coerce API price / listPrice fields (camelCase + PascalCase, number | string decimal). */
export function coerceMoneyField(value: unknown): number | undefined {
  if (value == null) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function getListPriceFromRow(row: Record<string, unknown>): number | undefined {
  return coerceMoneyField(row.listPrice ?? row.ListPrice);
}

/** Integer percent off when list price is above current price; null if not on sale. */
export function saleDiscountPercent(price: number, listPrice?: number | null): number | null {
  if (listPrice == null || Number.isNaN(Number(listPrice))) return null;
  const lp = Number(listPrice);
  const p = Number(price);
  if (!(lp > 0) || !(p >= 0) || p >= lp - 0.004) return null;
  const raw = Math.round((1 - p / lp) * 100);
  if (raw < 1) return null;
  return Math.min(99, raw);
}

export function maxSaleDiscountAcrossVariants(
  rows: Array<{ price: number; listPrice?: number | null }>
): number | null {
  let max = 0;
  for (const row of rows) {
    const d = saleDiscountPercent(row.price, row.listPrice);
    if (d != null && d > max) max = d;
  }
  return max > 0 ? max : null;
}
