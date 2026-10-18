export interface PurchaseInput {
  supplier_id: string;
  expected_date?: string | null;
  items: { product_id: string; quantity: number; unit_price: number }[];
}

export function preparePurchase(input: PurchaseInput) {
  if (!input.supplier_id) throw new Error('Sélectionnez un fournisseur.');
  if (!input.items?.length) throw new Error('Ajoutez au moins un article.');
  const items = input.items.map(item => {
    if (!item.product_id) throw new Error('Sélectionnez un produit pour chaque article.');
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new Error('La quantité doit être un entier positif.');
    if (!Number.isFinite(item.unit_price) || item.unit_price < 0) throw new Error('Le prix de revient doit être positif ou nul.');
    return { ...item, total: item.quantity * item.unit_price };
  });
  return { expected_date: input.expected_date?.trim() || null, items, total: items.reduce((sum, item) => sum + item.total, 0) };
}