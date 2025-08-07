// src/utils/exportPDF.ts
import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

interface PurchaseData {
  id: number;
  product: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

export const exportPurchasesToPDF = (data: PurchaseData[]) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Liste des Achats', 14, 22);

  const tableColumn = ['ID', 'Produit', 'Quantité', 'Prix', 'Total', 'Date'];
  const tableRows: (string | number)[][] = [];

  data.forEach((purchase) => {
    const purchaseData = [
      purchase.id,
      purchase.product,
      purchase.quantity,
      `${purchase.price.toFixed(2)} DH`,
      `${purchase.total.toFixed(2)} DH`,
      purchase.date,
    ];
    tableRows.push(purchaseData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  } as UserOptions);

  doc.save('purchases.pdf');
};
