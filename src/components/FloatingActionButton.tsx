import { useState } from 'react';
import { Plus, ShoppingCart, Package, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full shadow-lg transition-all duration-200",
              isOpen 
                ? "bg-destructive hover:bg-destructive/90 rotate-45" 
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {isOpen ? (
              <X className="w-5 h-5 text-destructive-foreground" />
            ) : (
              <Plus className="w-5 h-5 text-primary-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" className="w-48 mb-2">
          <DropdownMenuItem onClick={() => { onNewSale?.(); setIsOpen(false); }} className="gap-3 py-2.5">
            <ShoppingCart className="w-4 h-4 text-success" />
            <span>Nouvelle vente</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { onNewProduct?.(); setIsOpen(false); }} className="gap-3 py-2.5">
            <Package className="w-4 h-4 text-info" />
            <span>Nouveau produit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { onNewClient?.(); setIsOpen(false); }} className="gap-3 py-2.5">
            <Users className="w-4 h-4 text-accent-foreground" />
            <span>Nouveau client</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
