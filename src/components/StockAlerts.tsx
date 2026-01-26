import { useApp } from '@/contexts/AppContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StockAlertsProps {
  onNavigateToPurchases?: () => void;
}

export const StockAlerts = ({ onNavigateToPurchases }: StockAlertsProps) => {
  const { products } = useApp();
  
  // Calculer les produits avec stock bas dynamiquement
  const lowStockProducts = products.filter(product => 
    product.stock <= product.alert_threshold
  ).slice(0, 5); // Limiter à 5 alertes

  if (lowStockProducts.length === 0) {
    return (
      <Card className="border-success/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="w-5 h-5 text-success" />
            Alertes Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">Aucune alerte de stock bas</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Tous vos produits ont un stock suffisant</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <CardTitle className="text-base">Alertes Stock Bas</CardTitle>
          <Badge variant="destructive" className="ml-auto">
            {lowStockProducts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lowStockProducts.map((product) => (
          <div 
            key={product.id} 
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-destructive/5 rounded-lg border-l-4 border-destructive space-y-2 sm:space-y-0"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                Seuil: {product.alert_threshold} • Ref: {product.reference}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-sm font-bold text-destructive">{product.stock} restant</span>
              <p className="text-xs text-destructive/80">Stock critique!</p>
            </div>
          </div>
        ))}
        
        <Button 
          className="w-full mt-4" 
          onClick={onNavigateToPurchases}
        >
          Gérer les réapprovisionnements
        </Button>
      </CardContent>
    </Card>
  );
};
