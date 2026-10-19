import { describe, expect, test } from 'bun:test';
import { inventoryValue } from './inventoryValue';
import { preparePurchase } from './purchaseOrderInput';
import { normalizePhone } from './phone';
import { prepareWhatsAppQueue, whatsappLink } from './whatsappQueue';
import { parseCSV, parseVCard } from './contactsImport';

describe('Inventory at cost price', () => {
  test('values 10 units at cost 200, not selling price 500', () => {
    const product = { stock: 10, buy_price: 200, sell_price: 500 };
    expect(inventoryValue(product)).toBe(2000);
  });
  test('zero cost must not fall back to a different alias', () => {
    expect(inventoryValue({ stock: 10, buy_price: 0, buyPrice: 500 })).toBe(0);
  });
});
const input = { supplier_id: 'supplier', expected_date: '', items: [{ product_id: 'product', quantity: 2, unit_price: 125 }] };
test('purchase without delivery date has null date and calculated total', () => {
  expect(preparePurchase(input)).toEqual({ expected_date: null, items: [{ product_id: 'product', quantity: 2, unit_price: 125, total: 250 }], total: 250 });
});
test('purchase rejects an unselected product', () => {
  expect(() => preparePurchase({ ...input, items: [{ product_id: '', quantity: 1, unit_price: 10 }] })).toThrow();
});
test('purchase rejects fractional quantities', () => {
  expect(() => preparePurchase({ ...input, items: [{ product_id: 'product', quantity: 1.5, unit_price: 10 }] })).toThrow();
});
test('precise Senegal and France numbers normalize; malformed lengths are excluded', () => {
  expect(normalizePhone('77 123 45 67', '221')).toBe('221771234567');
  expect(normalizePhone('00221771234567')).toBe('221771234567');
  expect(normalizePhone('06 12 34 56 78', '33')).toBe('33612345678');
  expect(normalizePhone('+22177123')).toBeNull();
});
test('queue excludes invalid numbers and sends each distinct number only once', () => {
  const result = prepareWhatsAppQueue([{ id: '1', name: 'A', phone: '771234567' }, { id: '2', name: 'A duplicate', phone: '+221771234567' }, { id: '3', name: 'B', phone: 'bad' }], '221');
  expect(result.valid.map(c => c.id)).toEqual(['1']);
  expect(result.invalid.map(c => c.id)).toEqual(['3']);
});
test('WhatsApp links personalize and encode text without credentials', () => {
  const link = new URL(whatsappLink('221771234567', 'Bonjour {nom} & merci', 'Anna'));
  expect(link.protocol).toBe('https:');
  expect(link.host).toBe('wa.me');
  expect(link.pathname).toBe('/221771234567');
  expect(link.searchParams.get('text')).toBe('Bonjour Anna & merci');
});
test('CSV import preserves quoted names containing delimiters', () => {
  expect(parseCSV('nom,phone,email\n"Lo, Ibrahima",+221771234567,ibra@example.com')[0]).toEqual({ name: 'Lo, Ibrahima', phone: '+221771234567', email: 'ibra@example.com' });
});
test('vCard imports the exported contact phone', () => {
  expect(parseVCard('BEGIN:VCARD\nVERSION:3.0\nFN:Anna Camara\nTEL:+221771234567\nEND:VCARD')[0]).toEqual({ name: 'Anna Camara', phone: '+221771234567', email: null });
});