// Thermal receipt printer utility for 58mm and 80mm POS printers

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

interface ReceiptData {
  reference: string;
  date: string;
  clientName?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
}

const LINE_58MM = 32; // characters per line for 58mm
const LINE_80MM = 48; // characters per line for 80mm

function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

function leftRight(left: string, right: string, width: number): string {
  const spaces = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(spaces) + right;
}

function separator(width: number, char = '-'): string {
  return char.repeat(width);
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.substring(0, maxLen - 1) + '.' : text;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' FCFA';
}

function generateReceiptLines(data: ReceiptData, width: number): string[] {
  const lines: string[] = [];
  
  // Header
  if (data.companyName) {
    lines.push(centerText(data.companyName.toUpperCase(), width));
  }
  if (data.companyAddress) {
    lines.push(centerText(data.companyAddress, width));
  }
  if (data.companyPhone) {
    lines.push(centerText(`Tél: ${data.companyPhone}`, width));
  }
  
  lines.push(separator(width, '='));
  lines.push(centerText('TICKET DE CAISSE', width));
  lines.push(separator(width, '='));
  
  // Info
  lines.push(leftRight('N°:', data.reference, width));
  lines.push(leftRight('Date:', data.date, width));
  if (data.clientName) {
    lines.push(leftRight('Client:', truncate(data.clientName, width - 9), width));
  }
  
  lines.push(separator(width));
  
  // Items header
  const nameW = width - 20;
  lines.push(leftRight('Article', 'Qté   Total', width));
  lines.push(separator(width));
  
  // Items
  for (const item of data.items) {
    const itemName = truncate(item.name, nameW);
    const totalStr = formatCurrency(item.total);
    const qtyStr = `x${item.quantity}`;
    lines.push(itemName);
    lines.push(leftRight(`  ${qtyStr} @ ${formatCurrency(item.price)}`, totalStr, width));
    if (item.discount && item.discount > 0) {
      lines.push(`  Remise: -${item.discount}%`);
    }
  }
  
  lines.push(separator(width));
  
  // Totals
  lines.push(leftRight('Sous-total:', formatCurrency(data.subtotal), width));
  if (data.discount > 0) {
    lines.push(leftRight('Remise:', `-${formatCurrency(data.discount)}`, width));
  }
  if (data.tax > 0) {
    lines.push(leftRight('TVA:', formatCurrency(data.tax), width));
  }
  lines.push(separator(width, '='));
  lines.push(leftRight('TOTAL:', formatCurrency(data.total), width));
  lines.push(separator(width, '='));
  
  // Payment
  if (data.paymentMethod) {
    lines.push(leftRight('Paiement:', data.paymentMethod, width));
  }
  
  lines.push('');
  lines.push(centerText('Merci de votre visite !', width));
  lines.push(centerText('***', width));
  lines.push('');
  
  return lines;
}

export function generateReceiptText(data: ReceiptData, printerWidth: '58mm' | '80mm' = '80mm'): string {
  const width = printerWidth === '58mm' ? LINE_58MM : LINE_80MM;
  return generateReceiptLines(data, width).join('\n');
}

export function printReceipt(data: ReceiptData, printerWidth: '58mm' | '80mm' = '80mm'): void {
  const receiptText = generateReceiptText(data, printerWidth);
  const width = printerWidth === '58mm' ? '58mm' : '80mm';
  
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ticket - ${data.reference}</title>
      <style>
        @page {
          size: ${width} auto;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 4mm;
          font-family: 'Courier New', monospace;
          font-size: ${printerWidth === '58mm' ? '10px' : '12px'};
          line-height: 1.3;
          width: ${width};
        }
        pre {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-all;
          font-family: inherit;
          font-size: inherit;
        }
        @media print {
          body { margin: 0; padding: 2mm; }
        }
      </style>
    </head>
    <body>
      <pre>${receiptText}</pre>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 1000);
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export function buildReceiptFromSale(sale: any, products: any[], clients: any[], settings?: any): ReceiptData {
  const client = clients?.find(c => c.id === sale.client_id);
  
  const items: ReceiptItem[] = (sale.items || []).map((item: any) => {
    const product = products?.find(p => p.id === item.product_id);
    return {
      name: product?.name || item.product || 'Produit',
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      total: item.total || (item.price * item.quantity * (1 - (item.discount || 0) / 100))
    };
  });
  
  return {
    reference: sale.reference,
    date: new Date(sale.date || sale.created_at).toLocaleString('fr-FR'),
    clientName: client?.name,
    items,
    subtotal: sale.subtotal || 0,
    discount: sale.discount || 0,
    tax: sale.tax || 0,
    total: sale.total || 0,
    paymentMethod: sale.payment_method,
    companyName: settings?.company_name || 'StockPro',
    companyAddress: settings?.company_address,
    companyPhone: settings?.company_phone
  };
}
