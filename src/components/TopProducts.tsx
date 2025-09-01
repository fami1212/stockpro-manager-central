
import { useApp } from '@/contexts/AppContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { FunctionalSaleModal } from '@/components/FunctionalSaleModal';

export const TopProducts = () => {
  const { products, sales } = useApp();
  const [showSaleModal, setShowSaleModal] = useState(false);
  
  // Écouter l'événement global pour ouvrir le modal
  useEffect(() => {
    const handleOpenSaleModal = () => setShowSaleModal(true);
    window.addEventListener('openSaleModal', handleOpenSaleModal);
    return () => window.removeEventListener('openSaleModal', handleOpenSaleModal);
  }, []);
  
  // Calculer les produits les plus vendus basé sur les vraies données
  const topProducts = products.map(product => {
    const productSales = sales.filter(sale => 
      sale.items.some(item => item.product_id === product.id)
    );
    
    const totalQuantity = productSales.reduce((acc, sale) => {
      const item = sale.items.find(item => item.product_id === product.id);
      return acc + (item ? item.quantity : 0);
    }, 0);
    
    const totalRevenue = productSales.reduce((acc, sale) => {
      const item = sale.items.find(item => item.product_id === product.id);
      return acc + (item ? item.total : 0);
    }, 0);
    
    return {
      name: product.name,
      sales: totalQuantity,
      revenue: totalRevenue
    };
  })
  .filter(product => product.sales > 0)
  .sort((a, b) => b.sales - a.sales)
  .slice(0, 5);

  const handleViewReports = () => {
    // Navigate to reports section
    const reportsTab = document.querySelector('[value="reports"]') as HTMLElement;
    if (reportsTab) {
      reportsTab.click();
    }
  };

  return (
    <>
      <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Produits les plus vendus</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSaleModal(true)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Nouvelle vente
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewReports}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Eye className="w-4 h-4 mr-1" />
              Voir rapport
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} ventes</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600 ml-2">
                  {product.revenue.toLocaleString()} CFA
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune vente enregistrée</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowSaleModal(true)}
              >
                Créer votre première vente
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {showSaleModal && (
        <FunctionalSaleModal onClose={() => setShowSaleModal(false)} />
      )}
    </>
  );
};
