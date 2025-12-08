import { useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InvoiceSettings {
  company_name: string;
  company_logo_url: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  company_tax_id: string;
  primary_color: string;
  secondary_color: string;
  text_color: string;
  logo_position: 'left' | 'center' | 'right';
  show_header: boolean;
  show_footer: boolean;
  footer_text: string;
  invoice_prefix: string;
  invoice_notes: string;
  payment_terms: string;
}

interface InvoicePreviewProps {
  settings: InvoiceSettings;
  logoPreview: string;
}

export const InvoicePreview = ({ settings, logoPreview }: InvoicePreviewProps) => {
  const sampleData = useMemo(() => ({
    invoiceNumber: `${settings.invoice_prefix || 'INV'}-2024-00001`,
    date: format(new Date(), 'dd/MM/yyyy', { locale: fr }),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy', { locale: fr }),
    client: {
      name: 'Client Exemple',
      address: '123 Rue Exemple\nDakar, Sénégal',
      phone: '+221 77 123 45 67',
      email: 'client@exemple.com'
    },
    items: [
      { description: 'Produit A', quantity: 2, unitPrice: 5000, total: 10000 },
      { description: 'Service B', quantity: 1, unitPrice: 15000, total: 15000 },
      { description: 'Produit C', quantity: 5, unitPrice: 2500, total: 12500 }
    ],
    subtotal: 37500,
    tax: 6750,
    discount: 1500,
    total: 42750
  }), [settings.invoice_prefix]);

  const logoPositionClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }[settings.logo_position || 'left'];

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden"
      style={{ 
        aspectRatio: '210 / 297',
        maxHeight: '600px',
        fontSize: '8px'
      }}
    >
      <div className="p-4 h-full flex flex-col" style={{ color: settings.text_color }}>
        {/* Header */}
        {settings.show_header && (
          <div className="mb-3">
            {/* Logo */}
            {logoPreview && (
              <div className={`flex ${logoPositionClass} mb-2`}>
                <img 
                  src={logoPreview} 
                  alt="Logo entreprise"
                  className="max-h-10 max-w-24 object-contain"
                />
              </div>
            )}
            
            <div className="flex justify-between items-start">
              {/* Company Info */}
              <div className="space-y-0.5">
                <h2 
                  className="font-bold text-sm"
                  style={{ color: settings.primary_color }}
                >
                  {settings.company_name || 'Votre Entreprise'}
                </h2>
                {settings.company_address && (
                  <p className="text-[7px] whitespace-pre-line max-w-28">
                    {settings.company_address}
                  </p>
                )}
                {settings.company_phone && (
                  <p className="text-[7px]">Tél: {settings.company_phone}</p>
                )}
                {settings.company_email && (
                  <p className="text-[7px]">Email: {settings.company_email}</p>
                )}
                {settings.company_tax_id && (
                  <p className="text-[7px]">IF: {settings.company_tax_id}</p>
                )}
              </div>

              {/* Invoice Info */}
              <div className="text-right">
                <h1 
                  className="text-lg font-bold"
                  style={{ color: settings.primary_color }}
                >
                  FACTURE
                </h1>
                <p className="text-[8px]">N°: {sampleData.invoiceNumber}</p>
                <p className="text-[7px]">Date: {sampleData.date}</p>
                <p className="text-[7px]">Échéance: {sampleData.dueDate}</p>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div 
          className="h-0.5 mb-3"
          style={{ backgroundColor: settings.primary_color }}
        />

        {/* Client Info */}
        <div className="mb-3">
          <h3 className="font-bold text-[8px] mb-1" style={{ color: settings.primary_color }}>
            FACTURÉ À:
          </h3>
          <div className="space-y-0.5">
            <p className="font-medium text-[8px]">{sampleData.client.name}</p>
            <p className="text-[7px] whitespace-pre-line">{sampleData.client.address}</p>
            <p className="text-[7px]">Tél: {sampleData.client.phone}</p>
            <p className="text-[7px]">Email: {sampleData.client.email}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="flex-1 mb-3">
          <table className="w-full text-[7px]">
            <thead>
              <tr 
                className="text-white"
                style={{ backgroundColor: settings.primary_color }}
              >
                <th className="text-left p-1 rounded-tl">Description</th>
                <th className="text-center p-1">Qté</th>
                <th className="text-right p-1">Prix unit.</th>
                <th className="text-right p-1 rounded-tr">Total</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.items.map((item, index) => (
                <tr 
                  key={index}
                  className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                >
                  <td className="p-1">{item.description}</td>
                  <td className="text-center p-1">{item.quantity}</td>
                  <td className="text-right p-1">{item.unitPrice.toLocaleString()} DH</td>
                  <td className="text-right p-1">{item.total.toLocaleString()} DH</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-3">
          <div className="w-32 space-y-0.5 text-[7px]">
            <div className="flex justify-between">
              <span>Sous-total:</span>
              <span>{sampleData.subtotal.toLocaleString()} DH</span>
            </div>
            <div className="flex justify-between">
              <span>Remise:</span>
              <span>-{sampleData.discount.toLocaleString()} DH</span>
            </div>
            <div className="flex justify-between">
              <span>TVA (18%):</span>
              <span>{sampleData.tax.toLocaleString()} DH</span>
            </div>
            <div 
              className="flex justify-between font-bold pt-1 mt-1 border-t text-[8px]"
              style={{ color: settings.primary_color, borderColor: settings.primary_color }}
            >
              <span>TOTAL:</span>
              <span>{sampleData.total.toLocaleString()} DH</span>
            </div>
          </div>
        </div>

        {/* Payment Terms & Notes */}
        <div className="space-y-1 text-[7px]">
          {settings.payment_terms && (
            <div>
              <span className="font-bold">Conditions de paiement: </span>
              <span>{settings.payment_terms}</span>
            </div>
          )}
          {settings.invoice_notes && (
            <div>
              <span className="font-bold">Notes: </span>
              <span>{settings.invoice_notes}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {settings.show_footer && settings.footer_text && (
          <div 
            className="mt-auto pt-2 text-center text-[6px] border-t"
            style={{ color: '#888', borderColor: '#ddd' }}
          >
            {settings.footer_text}
          </div>
        )}
      </div>
    </div>
  );
};
