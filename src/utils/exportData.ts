import * as XLSX from 'xlsx';

export interface ExportConfig {
  filename: string;
  sheetName: string;
  data: any[];
  columns?: { header: string; key: string; width?: number }[];
}

export const exportToExcel = (config: ExportConfig) => {
  const { filename, sheetName, data, columns } = config;

  // If columns are specified, map data to match column keys
  const exportData = columns
    ? data.map(row => {
        const newRow: any = {};
        columns.forEach(col => {
          newRow[col.header] = row[col.key] !== undefined ? row[col.key] : '';
        });
        return newRow;
      })
    : data;

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Set column widths if specified
  if (columns) {
    ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
  }

  // Create workbook and add worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToCSV = (config: ExportConfig) => {
  const { filename, data, columns } = config;

  // If columns are specified, map data to match column keys
  const exportData = columns
    ? data.map(row => {
        const newRow: any = {};
        columns.forEach(col => {
          newRow[col.header] = row[col.key] !== undefined ? row[col.key] : '';
        });
        return newRow;
      })
    : data;

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate CSV file
  XLSX.writeFile(wb, `${filename}.csv`);
};

// Format data for export with common transformations
export const formatDataForExport = (data: any[], type: 'products' | 'sales' | 'clients' | 'suppliers') => {
  switch (type) {
    case 'products':
      return data.map(item => ({
        'Reference': item.reference || '',
        'Code-barres': item.barcode || '',
        'Nom': item.name,
        'Categorie': item.category_name || '',
        'Stock': item.stock,
        'Prix Achat': item.buy_price,
        'Prix Vente': item.sell_price,
        'Unite': item.unit_symbol || '',
        'Statut': item.status,
        'Cree le': new Date(item.created_at).toLocaleDateString('fr-FR')
      }));

    case 'sales':
      return data.map(item => ({
        'Reference': item.reference,
        'Date': new Date(item.date).toLocaleDateString('fr-FR'),
        'Client': item.client_name || 'Client anonyme',
        'Sous-total': item.subtotal,
        'Remise': item.discount,
        'Taxe': item.tax,
        'Total': item.total,
        'Mode paiement': item.payment_method || '',
        'Statut': item.status
      }));

    case 'clients':
      return data.map(item => ({
        'Nom': item.name,
        'Email': item.email || '',
        'Telephone': item.phone || '',
        'Adresse': item.address || '',
        'Total Commandes': item.total_orders,
        'Montant Total': item.total_amount,
        'Derniere Commande': item.last_order ? new Date(item.last_order).toLocaleDateString('fr-FR') : '',
        'Statut': item.status
      }));

    case 'suppliers':
      return data.map(item => ({
        'Nom': item.name,
        'Contact': item.contact || '',
        'Email': item.email || '',
        'Telephone': item.phone || '',
        'Adresse': item.address || '',
        'Total Commandes': item.total_orders,
        'Montant Total': item.total_amount,
        'Derniere Commande': item.last_order ? new Date(item.last_order).toLocaleDateString('fr-FR') : '',
        'Statut': item.status
      }));

    default:
      return data;
  }
};
