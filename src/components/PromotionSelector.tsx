import { Tag, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePromotions } from '@/hooks/usePromotions';

interface PromotionSelectorProps {
  onSelectPromotion: (discountValue: number) => void;
  subtotal: number;
  totalQuantity: number;
}

export const PromotionSelector = ({ onSelectPromotion, subtotal, totalQuantity }: PromotionSelectorProps) => {
  const { getApplicablePromotions } = usePromotions();
  
  const applicablePromotions = getApplicablePromotions('sale', undefined, totalQuantity, subtotal);

  if (applicablePromotions.length === 0) {
    return null;
  }

  const calculateDiscountValue = (promotion: any) => {
    if (promotion.discount_type === 'percentage') {
      return promotion.discount_value;
    }
    // Convert fixed amount to percentage of subtotal
    return (promotion.discount_value / subtotal) * 100;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Tag className="w-4 h-4" />
          Appliquer une promotion
          <Badge variant="secondary" className="ml-1">
            {applicablePromotions.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Promotions disponibles</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {applicablePromotions.map((promotion) => (
              <button
                key={promotion.id}
                onClick={() => onSelectPromotion(calculateDiscountValue(promotion))}
                className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{promotion.name}</div>
                    {promotion.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {promotion.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    {promotion.discount_type === 'percentage' ? (
                      <>
                        <Percent className="w-3 h-3" />
                        {promotion.discount_value}%
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-3 h-3" />
                        {promotion.discount_value.toLocaleString()}
                      </>
                    )}
                  </div>
                </div>
                {promotion.min_quantity > 1 && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Minimum {promotion.min_quantity} articles
                  </div>
                )}
                {promotion.min_amount > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Minimum {promotion.min_amount.toLocaleString()} CFA
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};