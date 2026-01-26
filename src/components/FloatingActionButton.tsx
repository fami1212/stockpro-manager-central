
import { useState } from 'react';
import { Plus, ShoppingCart, Package, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onNewSale?: () => void;
  onNewProduct?: () => void;
  onNewClient?: () => void;
}

export const FloatingActionButton = ({ 
  onNewSale, 
  onNewProduct,
  onNewClient 
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { 
      icon: ShoppingCart, 
      label: 'Nouvelle vente', 
      onClick: onNewSale,
      color: 'bg-success hover:bg-success/90 text-success-foreground'
    },
    { 
      icon: Package, 
      label: 'Nouveau produit', 
      onClick: onNewProduct,
      color: 'bg-info hover:bg-info/90 text-info-foreground'
    },
    { 
      icon: Users, 
      label: 'Nouveau client', 
      onClick: onNewClient,
      color: 'bg-accent hover:bg-accent/90 text-accent-foreground'
    },
  ];

  return (
    <div className="fixed bottom-20 left-4 z-40 flex lg:hidden">
      {/* Action buttons */}
      <div className={cn(
        "flex flex-col-reverse gap-3 mb-3 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        {actions.map((action, index) => (
          <div 
            key={action.label}
            className="flex items-center gap-3 animate-scale-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="bg-card text-foreground text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg border border-border/50 whitespace-nowrap">
              {action.label}
            </span>
            <Button
              size="icon"
              className={cn(
                "w-12 h-12 rounded-full shadow-lg transition-all duration-200 hover:scale-110",
                action.color
              )}
              onClick={() => {
                action.onClick?.();
                setIsOpen(false);
              }}
            >
              <action.icon className="w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB button */}
      <Button
        size="icon"
        className={cn(
          "w-14 h-14 rounded-full shadow-xl transition-all duration-300",
          isOpen 
            ? "bg-destructive hover:bg-destructive/90 rotate-45" 
            : "bg-primary hover:bg-primary/90"
        )}
        style={{ boxShadow: isOpen ? undefined : '0 4px 20px hsl(var(--primary) / 0.4)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-destructive-foreground" />
        ) : (
          <Plus className="w-6 h-6 text-primary-foreground" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
