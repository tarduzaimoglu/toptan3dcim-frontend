type Row = { productId: string; qty: number; variant?: { colorName: string } | null; [key: string]: unknown };
type Paid = { productId: string; sourceProductId?: string; qty: number; variant?: { colorName: string } | null };
export function settleGuestCart(saved: { items?: Row[]; settledOrders?: string[] }, order: string, paid: Paid[]) {
  const settledOrders = saved.settledOrders || [];
  if (settledOrders.includes(order)) return saved;
  const quantities = new Map(paid.map(l => [`${l.sourceProductId || l.productId}:${l.variant?.colorName || ''}`, l.qty]));
  return { ...saved, items: (saved.items || []).map(l => ({ ...l, qty: Math.max(0, l.qty - (quantities.get(`${l.productId}:${l.variant?.colorName || ''}`) || 0)) })).filter(l => l.qty > 0), settledOrders: [...settledOrders, order] };
}
