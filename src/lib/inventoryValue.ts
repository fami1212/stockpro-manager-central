export function inventoryValue(product: { stock?: number | null; buy_price?: number | null; buyPrice?: number | null }): number {
  return (product.stock ?? 0) * (product.buy_price ?? product.buyPrice ?? 0);
}