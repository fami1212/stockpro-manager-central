
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, TrendingUp, TrendingDown, RotateCcw, Package } from 'lucide-react';
import { useStockMovements } from '@/hooks/useStockMovements';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function StockMovementHistory() {
  const { stockMovements, loading } = useStockMovements();
  const [filter, setFilter] = useState<string>('all');

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
      case 'purchase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'out':
      case 'sale':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'return':
        return <RotateCcw className="w-4 h-4 text-blue-600" />;
      case 'adjustment':
        return <Package className="w-4 h-4 text-orange-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Entrée';
      case 'out': return 'Sortie';
      case 'adjustment': return 'Ajustement';
      case 'return': return 'Retour';
      case 'sale': return 'Vente';
      case 'purchase': return 'Achat';
      default: return type;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'in':
      case 'purchase':
        return 'text-green-600 bg-green-50';
      case 'out':
      case 'sale':
        return 'text-red-600 bg-red-50';
      case 'return':
        return 'text-blue-600 bg-blue-50';
      case 'adjustment':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredMovements = stockMovements.filter(movement => {
    if (filter === 'all') return true;
    return movement.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Historique des mouvements</h3>
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les mouvements</option>
          <option value="in">Entrées</option>
          <option value="out">Sorties</option>
          <option value="adjustment">Ajustements</option>
          <option value="return">Retours</option>
          <option value="sale">Ventes</option>
          <option value="purchase">Achats</option>
        </select>
      </div>

      {filteredMovements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun mouvement de stock trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMovements.map((movement) => (
            <div key={movement.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getMovementIcon(movement.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {movement.products?.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({movement.products?.reference})
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMovementColor(movement.type)}`}>
                        {getMovementTypeLabel(movement.type)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {movement.reason}
                    </p>
                    
                    {movement.notes && (
                      <p className="text-sm text-gray-500 italic">
                        {movement.notes}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(movement.created_at), 'Pp', { locale: fr })}
                        </span>
                      </div>
                      
                      {movement.reference && (
                        <span className="font-mono">
                          Réf: {movement.reference}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {movement.type === 'out' || movement.type === 'sale' ? '-' : '+'}
                    {movement.quantity}
                  </div>
                  <div className="text-xs text-gray-500">
                    {movement.previous_stock} → {movement.new_stock}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
