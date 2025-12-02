import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type InvoiceStyle = 'modern' | 'classic' | 'minimal';

interface InvoiceStyleSelectorProps {
  value: InvoiceStyle;
  onChange: (style: InvoiceStyle) => void;
}

const styles: { id: InvoiceStyle; name: string; description: string; preview: React.ReactNode }[] = [
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Design épuré avec dégradés et couleurs vives',
    preview: (
      <div className="w-full h-32 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg p-3 text-white">
        <div className="flex justify-between items-start">
          <div className="w-8 h-8 bg-white/20 rounded" />
          <div className="text-right">
            <div className="text-xs font-bold">FACTURE</div>
            <div className="text-[8px] opacity-80">INV-2024-001</div>
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <div className="h-1 bg-white/30 rounded w-3/4" />
          <div className="h-1 bg-white/30 rounded w-1/2" />
        </div>
        <div className="mt-3 flex justify-end">
          <div className="bg-white/20 rounded px-2 py-1 text-[8px]">1,500 MAD</div>
        </div>
      </div>
    )
  },
  {
    id: 'classic',
    name: 'Classique',
    description: 'Style traditionnel et professionnel',
    preview: (
      <div className="w-full h-32 bg-white border-2 border-gray-300 rounded-lg p-3">
        <div className="flex justify-between items-start border-b border-gray-200 pb-2">
          <div className="w-8 h-8 bg-gray-300 rounded" />
          <div className="text-right">
            <div className="text-xs font-serif font-bold text-gray-800">FACTURE</div>
            <div className="text-[8px] text-gray-600">INV-2024-001</div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <div className="h-1 bg-gray-200 rounded w-3/4" />
          <div className="h-1 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="mt-3 flex justify-end">
          <div className="border border-gray-300 rounded px-2 py-1 text-[8px] text-gray-700">1,500 MAD</div>
        </div>
      </div>
    )
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple et élégant, moins c\'est plus',
    preview: (
      <div className="w-full h-32 bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-start">
          <div className="text-[10px] font-light tracking-widest text-gray-400">ENTREPRISE</div>
          <div className="text-right">
            <div className="text-[10px] text-gray-800">#001</div>
          </div>
        </div>
        <div className="mt-6 space-y-1">
          <div className="h-px bg-gray-200 w-full" />
          <div className="h-px bg-gray-200 w-full" />
        </div>
        <div className="mt-4 flex justify-end">
          <div className="text-xs font-medium text-gray-800">1,500 MAD</div>
        </div>
      </div>
    )
  }
];

export const InvoiceStyleSelector = ({ value, onChange }: InvoiceStyleSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {styles.map((style) => (
        <Card
          key={style.id}
          className={cn(
            "cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
            value === style.id 
              ? "ring-2 ring-primary border-primary" 
              : "hover:border-primary/50"
          )}
          onClick={() => onChange(style.id)}
        >
          {value === style.id && (
            <div className="absolute top-2 right-2 z-10 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
          <CardContent className="p-4">
            {style.preview}
            <div className="mt-3">
              <h4 className="font-medium text-foreground">{style.name}</h4>
              <p className="text-xs text-muted-foreground">{style.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper function to get style-specific settings
export const getInvoiceStyleSettings = (style: InvoiceStyle) => {
  switch (style) {
    case 'modern':
      return {
        headerStyle: 'gradient',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        fontFamily: 'sans-serif',
        borderRadius: 'rounded',
        shadowIntensity: 'medium'
      };
    case 'classic':
      return {
        headerStyle: 'bordered',
        primaryColor: '#1f2937',
        secondaryColor: '#6b7280',
        fontFamily: 'serif',
        borderRadius: 'none',
        shadowIntensity: 'light'
      };
    case 'minimal':
      return {
        headerStyle: 'simple',
        primaryColor: '#374151',
        secondaryColor: '#9ca3af',
        fontFamily: 'sans-serif',
        borderRadius: 'subtle',
        shadowIntensity: 'none'
      };
    default:
      return {
        headerStyle: 'gradient',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        fontFamily: 'sans-serif',
        borderRadius: 'rounded',
        shadowIntensity: 'medium'
      };
  }
};
