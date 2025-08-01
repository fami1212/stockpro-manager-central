
import { useState, useMemo } from 'react';
import { Plus, Package, Search, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductForm } from '@/components/ProductForm';
import { CategoryModal } from '@/components/CategoryModal';
import { UnitModal } from '@/components/UnitModal';
import { EmptyState } from '@/components/EmptyState';
import { MetricCard } from '@/components/MetricCard';
import { StockAlerts } from '@/components/StockAlerts';
import { PaginationControls } from '@/components/PaginationControls';
import { useApp, Product } from '@/contexts/AppContext';
import { usePagination } from '@/hooks/usePagination';

export const StockModule = () => {
  const { products, categories, units, deleteProduct, loading, initialized } = useApp();
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const {
    currentData: paginatedProducts,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    goToPage
  } = usePagination({
    data: filteredProducts,
    itemsPerPage: 10
  });

  const totalValue = products.reduce((sum, product) => sum + (product.stock * product.sell_price), 0);
  const lowStockCount = products.filter(p => p.status === 'Stock bas').length;
  const outOfStockCount = products.filter(p => p.status === 'Rupture').length;

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await deleteProduct(id);
    }
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setSelectedProduct(undefined);
  };

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Gestion du Stock</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setShowCategoryModal(true)} variant="outline" size="sm">
            Catégories
          </Button>
          <Button onClick={() => setShowUnitModal(true)} variant="outline" size="sm">
            Unités
          </Button>
          <Button onClick={() => setShowProductForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total produits"
          value={products.length.toString()}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Valeur du stock"
          value={`€${totalValue.toLocaleString()}`}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Stock bas"
          value={lowStockCount.toString()}
          icon={AlertTriangle}
          color="yellow"
        />
        <MetricCard
          title="Rupture"
          value={outOfStockCount.toString()}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <StockAlerts />

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="En stock">En stock</SelectItem>
                <SelectItem value="Stock bas">Stock bas</SelectItem>
                <SelectItem value="Rupture">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {paginatedProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucun produit trouvé"
            description={searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
              ? "Aucun produit ne correspond à vos critères de recherche."
              : "Commencez par ajouter votre premier produit."
            }
            actionText="Ajouter un produit"
            onAction={() => setShowProductForm(true)}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Produit</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Référence</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Catégorie</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Prix</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">Code: {product.barcode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{product.reference}</td>
                      <td className="py-3 px-4 text-gray-600">{product.category}</td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900">{product.stock} {product.unit}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="text-gray-900">Vente: €{product.sell_price}</p>
                          <p className="text-gray-500">Achat: €{product.buy_price}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'En stock' 
                            ? 'bg-green-100 text-green-700'
                            : product.status === 'Stock bas'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={10}
              onPageChange={goToPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
            />
          </>
        )}
      </div>

      {showProductForm && (
        <ProductForm
          product={selectedProduct}
          onClose={handleCloseProductForm}
        />
      )}

      {showCategoryModal && (
        <CategoryModal onClose={() => setShowCategoryModal(false)} />
      )}

      {showUnitModal && (
        <UnitModal onClose={() => setShowUnitModal(false)} />
      )}
    </div>
  );
};
