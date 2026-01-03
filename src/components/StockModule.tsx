
import { useState, useMemo } from 'react';
import { Plus, Package, Search, AlertTriangle, TrendingUp, Edit2, Trash2, BarChart3, Boxes, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductForm } from '@/components/ProductForm';
import { CategoryModal } from '@/components/CategoryModal';
import { UnitModal } from '@/components/UnitModal';
import { EmptyState } from '@/components/EmptyState';
import { StockAlerts } from '@/components/StockAlerts';
import { PaginationControls } from '@/components/PaginationControls';
import { useApp, Product } from '@/contexts/AppContext';
import { usePagination } from '@/hooks/usePagination';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
        <LoadingSpinner size="lg" text="Chargement des produits..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Gestion du Stock</h2>
          <p className="text-sm text-muted-foreground mt-1">Gérez votre inventaire et suivez vos produits</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowCategoryModal(true)} variant="outline" size="sm" className="gap-2">
            Catégories
          </Button>
          <Button onClick={() => setShowUnitModal(true)} variant="outline" size="sm" className="gap-2">
            Unités
          </Button>
          <Button onClick={() => setShowProductForm(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="dashboard-card p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5 lg:w-6 lg:h-6 text-info" />
            </div>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">Total</Badge>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-foreground">{products.length}</p>
          <p className="text-xs lg:text-sm text-muted-foreground mt-1">Produits</p>
        </div>

        <div className="dashboard-card p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-success" />
            </div>
            <Badge className="bg-success/10 text-success hover:bg-success/20 text-xs hidden sm:inline-flex">Valeur</Badge>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-foreground">{totalValue.toLocaleString()}</p>
          <p className="text-xs lg:text-sm text-muted-foreground mt-1">CFA en stock</p>
        </div>

        <div className="dashboard-card p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-warning/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-warning" />
            </div>
            <Badge className="bg-warning/10 text-warning hover:bg-warning/20 text-xs hidden sm:inline-flex">Alerte</Badge>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-foreground">{lowStockCount}</p>
          <p className="text-xs lg:text-sm text-muted-foreground mt-1">Stock bas</p>
        </div>

        <div className="dashboard-card p-4 lg:p-6 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageX className="w-5 h-5 lg:w-6 lg:h-6 text-destructive" />
            </div>
            <Badge variant="destructive" className="text-xs hidden sm:inline-flex">Urgent</Badge>
          </div>
          <p className="text-xl lg:text-3xl font-bold text-foreground">{outOfStockCount}</p>
          <p className="text-xs lg:text-sm text-muted-foreground mt-1">Rupture</p>
        </div>
      </div>

      <StockAlerts />

      {/* Products List */}
      <div className="dashboard-card p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-background">
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
              <SelectTrigger className="w-32 bg-background">
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
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? "Aucun produit ne correspond à vos critères."
                : "Aucun produit enregistré"
              }
            </p>
            <Button onClick={() => setShowProductForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Ajouter un produit
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Produit</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Référence</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Catégorie</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Prix</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Code: {product.barcode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{product.reference}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{product.category}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-foreground font-medium">{product.stock} {product.unit}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="text-foreground font-medium">{product.sell_price.toLocaleString()} CFA</p>
                          <p className="text-muted-foreground">Achat: {product.buy_price.toLocaleString()} CFA</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="secondary"
                          className={`${
                            product.status === 'En stock' 
                              ? 'bg-success/10 text-success'
                              : product.status === 'Stock bas'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {product.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="gap-1.5 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden grid gap-4">
              {paginatedProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="group bg-card border border-border/50 rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.reference}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">{product.category}</Badge>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`ml-2 text-xs ${
                        product.status === 'En stock' 
                          ? 'bg-success/10 text-success'
                          : product.status === 'Stock bas'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {product.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Stock</p>
                      <p className="font-medium text-foreground">{product.stock} {product.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prix vente</p>
                      <p className="font-medium text-primary">{product.sell_price.toLocaleString()} CFA</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 gap-1.5 text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 gap-1.5 text-xs hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
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
