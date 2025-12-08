import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

export interface InvoiceTemplateSettings {
  company_name?: string;
  company_logo_url?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  company_tax_id?: string;
  primary_color?: string;
  secondary_color?: string;
  text_color?: string;
  logo_position?: 'left' | 'center' | 'right';
  show_header?: boolean;
  show_footer?: boolean;
  footer_text?: string;
  invoice_prefix?: string;
  invoice_notes?: string;
  payment_terms?: string;
}

export interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  due_date?: string;
  client: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amount_paid?: number;
  notes?: string;
}

// Helper function to load image as base64
const loadImageAsBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

export const generateInvoicePDF = async (
  invoiceData: InvoiceData,
  templateSettings?: InvoiceTemplateSettings
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Default colors
  const primaryColor = templateSettings?.primary_color || '#1e40af';
  const textColor = templateSettings?.text_color || '#1f2937';
  
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 30, g: 64, b: 175 };
  };
  
  const primaryRgb = hexToRgb(primaryColor);
  const textRgb = hexToRgb(textColor);
  
  let yPosition = 20;

  // Header section
  if (templateSettings?.show_header !== false) {
    // Logo
    if (templateSettings?.company_logo_url) {
      try {
        const logoPosition = templateSettings.logo_position || 'left';
        let logoX = 14;
        
        if (logoPosition === 'center') {
          logoX = pageWidth / 2 - 20;
        } else if (logoPosition === 'right') {
          logoX = pageWidth - 54;
        }
        
        // Load and embed the logo
        const logoBase64 = await loadImageAsBase64(templateSettings.company_logo_url);
        const logoWidth = 40;
        const logoHeight = 20;
        doc.addImage(logoBase64, 'PNG', logoX, yPosition, logoWidth, logoHeight);
        yPosition += logoHeight + 5;
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    }

    // Company info
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(templateSettings?.company_name || 'Votre Entreprise', 14, yPosition);
    
    yPosition += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    
    if (templateSettings?.company_address) {
      const addressLines = doc.splitTextToSize(templateSettings.company_address, 80);
      addressLines.forEach((line: string) => {
        doc.text(line, 14, yPosition);
        yPosition += 4;
      });
    }
    
    if (templateSettings?.company_phone) {
      doc.text(`Tél: ${templateSettings.company_phone}`, 14, yPosition);
      yPosition += 4;
    }
    
    if (templateSettings?.company_email) {
      doc.text(`Email: ${templateSettings.company_email}`, 14, yPosition);
      yPosition += 4;
    }
    
    if (templateSettings?.company_tax_id) {
      doc.text(`IF: ${templateSettings.company_tax_id}`, 14, yPosition);
      yPosition += 4;
    }
  }

  // Invoice title and number
  yPosition = Math.max(yPosition, 35);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text('FACTURE', pageWidth - 14, yPosition, { align: 'right' });
  
  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  doc.text(`N°: ${invoiceData.invoice_number}`, pageWidth - 14, yPosition, { align: 'right' });
  
  yPosition += 6;
  doc.setFontSize(10);
  doc.text(`Date: ${invoiceData.invoice_date}`, pageWidth - 14, yPosition, { align: 'right' });
  
  if (invoiceData.due_date) {
    yPosition += 5;
    doc.text(`Échéance: ${invoiceData.due_date}`, pageWidth - 14, yPosition, { align: 'right' });
  }

  // Client information
  yPosition += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À:', 14, yPosition);
  
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoiceData.client.name, 14, yPosition);
  
  if (invoiceData.client.address) {
    yPosition += 5;
    const clientAddressLines = doc.splitTextToSize(invoiceData.client.address, 80);
    clientAddressLines.forEach((line: string) => {
      doc.text(line, 14, yPosition);
      yPosition += 4;
    });
  }
  
  if (invoiceData.client.phone) {
    yPosition += 5;
    doc.text(`Tél: ${invoiceData.client.phone}`, 14, yPosition);
  }
  
  if (invoiceData.client.email) {
    yPosition += 5;
    doc.text(`Email: ${invoiceData.client.email}`, 14, yPosition);
  }

  // Items table
  yPosition += 15;
  
  const tableData = invoiceData.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unit_price.toFixed(2)} DH`,
    `${item.total.toFixed(2)} DH`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Description', 'Quantité', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [primaryRgb.r, primaryRgb.g, primaryRgb.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      textColor: [textRgb.r, textRgb.g, textRgb.b],
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  } as UserOptions);

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
  const totalsX = pageWidth - 14;
  let totalsY = finalY + 10;

  doc.setFontSize(10);
  doc.text(`Sous-total:`, totalsX - 50, totalsY);
  doc.text(`${invoiceData.subtotal.toFixed(2)} DH`, totalsX, totalsY, { align: 'right' });

  if (invoiceData.discount > 0) {
    totalsY += 6;
    doc.text(`Remise:`, totalsX - 50, totalsY);
    doc.text(`-${invoiceData.discount.toFixed(2)} DH`, totalsX, totalsY, { align: 'right' });
  }

  if (invoiceData.tax > 0) {
    totalsY += 6;
    doc.text(`TVA:`, totalsX - 50, totalsY);
    doc.text(`${invoiceData.tax.toFixed(2)} DH`, totalsX, totalsY, { align: 'right' });
  }

  totalsY += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(`TOTAL:`, totalsX - 50, totalsY);
  doc.text(`${invoiceData.total.toFixed(2)} DH`, totalsX, totalsY, { align: 'right' });

  if (invoiceData.amount_paid && invoiceData.amount_paid > 0) {
    totalsY += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    doc.text(`Montant payé:`, totalsX - 50, totalsY);
    doc.text(`${invoiceData.amount_paid.toFixed(2)} DH`, totalsX, totalsY, { align: 'right' });

    const balance = invoiceData.total - invoiceData.amount_paid;
    if (balance > 0) {
      totalsY += 6;
      doc.setFont('helvetica', 'bold');
      doc.text(`Solde dû:`, totalsX - 50, totalsY);
      doc.text(`${balance.toFixed(2)} DH`, totalsX, totalsY, { align: 'right' });
    }
  }

  // Payment terms
  totalsY += 15;
  if (templateSettings?.payment_terms) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Conditions de paiement:', 14, totalsY);
    totalsY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(templateSettings.payment_terms, 14, totalsY);
    totalsY += 8;
  }

  // Notes
  const notes = invoiceData.notes || templateSettings?.invoice_notes;
  if (notes) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, totalsY);
    totalsY += 5;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(notes, pageWidth - 28);
    notesLines.forEach((line: string) => {
      doc.text(line, 14, totalsY);
      totalsY += 4;
    });
  }

  // Footer
  if (templateSettings?.show_footer !== false && templateSettings?.footer_text) {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(templateSettings.footer_text, pageWidth / 2, pageHeight - 15, { 
      align: 'center' 
    });
  }

  return doc;
};

export const downloadInvoicePDF = async (
  invoiceData: InvoiceData,
  templateSettings?: InvoiceTemplateSettings
) => {
  const doc = await generateInvoicePDF(invoiceData, templateSettings);
  doc.save(`Facture_${invoiceData.invoice_number}.pdf`);
};