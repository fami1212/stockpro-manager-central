import { useState } from 'react';
import { Plus, Search, Filter, Package, TrendingUp, TrendingDown, AlertTriangle, Edit, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductForm } from '@/components/ProductForm';
import { StockMovementModal } from '@/components/StockMovementModal';
import { CategoryModal } from '@/components/CategoryModal';
import { UnitModal } from '@/components/UnitModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PaginationControls } from '@/components/PaginationControls';
import { EmptyState } from '@/components/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { usePagination } from '@/hooks/usePagination';

export const StockModule = () => {
  const { state, deleteProduct, deleteCategory, deleteUnit } = useApp();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showUnit, setShowUnit] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('products');
  const [deleteConfirm, setDeleteConfirm] = useState<{ 
    open: boolean; 
    type?: 'product' | 'category' | 'unit';
    id?: string; 
    name?: string 
  }>({ open: false });

  const {
    currentData: paginatedProducts,
    currentPage,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    goToPage
  } = usePagination({
    data: state.products,
    itemsPerPage: 10,
    searchTerm,
    searchFields: ['name', 'reference'],
    filters: { category: selectedCategory }
  });

  const movements = [
    { 
      id: 1, 
      date: '2024-01-15', 
      time: '14:30',
      product: 'iPhone 15 Pro', 
      type: 'Entrée', 
      quantity: 20, 
      reason: 'Approvisionnement',
      user: 'Admin',
      reference: 'BL-001'
    },
    { 
      id: 2, 
      date: '2024-01-15', 
      time: '16:45',
      product: 'Samsung Galaxy S24', 
      type: 'Sortie', 
      quantity: 3, 
      reason: 'Vente',
      user: 'Vendeur 1',
      reference: 'V-002'
    }
  ];

  const lowStockProducts = state.products.filter(p => p.stock <= p.alertThreshold);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowAddProduct(true);
  };

  const handleDelete = (type: 'product' | 'category' | 'unit', id: string, name: string) => {
    setDeleteConfirm({
      open: true,
      type,
      id,
      name
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id && deleteConfirm.type) {
      switch (deleteConfirm.type) {
        case 'product':
          deleteProduct(deleteConfirm.id);
          break;
        case 'category':
          deleteCategory(deleteConfirm.id);
          break;
        case 'unit':
          deleteUnit(deleteConfirm.id);
          break;
      }
    }
    setDeleteConfirm({ open: false });
  };

  const handleCloseProductModal = () => {
    setShowAddProduct(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Gestion du Stock</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <Button onClick={() => setShowMovement(true)} variant="outline" className="w-full sm:w-auto" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Mouvement
          </Button>
          <Button onClick={() => setShowAddProduct(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Total produits</h3>
          <p className="text-2xl lg:text-3xl font-bold text-blue-600">{state.products.length}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Références actives</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Valeur stock</h3>
          <p className="text-2xl lg:text-3xl font-bold text-green-600">€{state.products.reduce((acc, p) => acc + (p.stock * p.buyPrice), 0).toLocaleString()}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Prix d'achat</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Alertes stock</h3>
          <p className="text-2xl lg:text-3xl font-bold text-red-600">{lowStockProducts.length}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Produits en rupture</p>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Catégories</h3>
          <p className="text-2xl lg:text-3xl font-bold text-purple-600">{state.categories.length}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">Actives</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="products" className="text-xs sm:text-sm">Produits</TabsTrigger>
          <TabsTrigger value="movements" className="text-xs sm:text-sm">Mouvements</TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">Catégories</TabsTrigger>
          <TabsTrigger value="units" className="text-xs sm:text-sm">Unités</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-3 lg:space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-4 lg:w-5 h-4 lg:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {state.categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full lg:w-auto" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
            </div>

            {state.products.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Aucun produit en stock"
                description="Commencez par ajouter votre premier produit au catalogue."
                actionText="Ajouter un produit"
                onAction={() => setShowAddProduct(true)}
              />
            ) : paginatedProducts.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Aucun résultat"
                description="Aucun produit ne correspond à vos critères de recherche."
              />
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Produit</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Référence</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Catégorie</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Prix Achat</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Prix Vente</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{product.name}</div>
                            {product.variants.length > 0 && (
                              <div className="text-xs text-gray-500">{product.variants.length} variante(s)</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{product.reference}</td>
                          <td className="py-3 px-4 text-gray-600">{product.category}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${product.stock <= product.alertThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                              {product.stock} {product.unit}
                            </span>
                            {product.stock <= product.alertThreshold && (
                              <AlertTriangle className="w-4 h-4 text-red-500 inline ml-1" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-900">€{product.buyPrice}</td>
                          <td className="py-3 px-4 text-gray-900">€{product.sellPrice}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.status === 'En stock' 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Package className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete('product', product.id, product.name)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                  {paginatedProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                          <p className="text-xs text-gray-500">{product.reference}</p>
                          {product.variants.length > 0 && (
                            <p className="text-xs text-gray-500">{product.variants.length} variante(s)</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'En stock' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Catégorie:</span>
                          <p className="font-medium">{product.category}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <p className={`font-medium ${product.stock <= product.alertThreshold ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.stock} {product.unit}
                            {product.stock <= product.alertThreshold && (
                              <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Prix Achat:</span>
                          <p className="font-medium">€{product.buyPrice}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Prix Vente:</span>
                          <p className="font-medium">€{product.sellPrice}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 pt-2 border-t">
                        <div className="grid grid-cols-3 gap-2">
                          <Button variant="outline" size="sm" className="text-xs" onClick={() => handleEdit(product)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Modifier
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Package className="w-3 h-3 mr-1" />
                            Stock
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 text-xs"
                            onClick={() => handleDelete('product', product.id, product.name)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-6">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={goToPage}
                    hasNextPage={hasNextPage}
                    hasPreviousPage={hasPreviousPage}
                  />
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Historique des mouvements</h3>
              <Button onClick={() => setShowMovement(true)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau mouvement
              </Button>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date/Heure</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Produit</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantité</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Motif</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Référence</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => (
                    <tr key={movement.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        <div>{movement.date}</div>
                        <div className="text-xs text-gray-500">{movement.time}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{movement.product}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {movement.type === 'Entrée' ? (
                            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                          )}
                          <span className={movement.type === 'Entrée' ? 'text-green-600' : 'text-red-600'}>
                            {movement.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{movement.quantity}</td>
                      <td className="py-3 px-4 text-gray-600">{movement.reason}</td>
                      <td className="py-3 px-4 text-gray-600">{movement.user}</td>
                      <td className="py-3 px-4 text-gray-600">{movement.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {movements.map((movement) => (
                <div key={movement.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{movement.product}</h3>
                      <p className="text-xs text-gray-500">{movement.date} - {movement.time}</p>
                    </div>
                    <div className="flex items-center">
                      {movement.type === 'Entrée' ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${movement.type === 'Entrée' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Quantité:</span>
                      <p className="font-medium">{movement.quantity}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Motif:</span>
                      <p className="font-medium">{movement.reason}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Utilisateur:</span>
                      <p className="font-medium">{movement.user}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Référence:</span>
                      <p className="font-medium">{movement.reference}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Gestion des catégories</h3>
              <Button onClick={() => setShowCategory(true)} className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className={`w-4 h-4 rounded-full bg-${category.color}-500 mr-3 flex-shrink-0`}></div>
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{category.name}</h4>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete('category', category.id, category.name)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{category.products} produit(s)</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900">Unités de mesure</h3>
              <Button onClick={() => setShowUnit(true)} className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle unité
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {state.units.map((unit) => (
                <div key={unit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">{unit.name}</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete('unit', unit.id, unit.name)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">Symbole: {unit.symbol}</p>
                  <p className="text-xs text-gray-500">{unit.type}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showAddProduct && (
        <ProductForm 
          product={editingProduct} 
          onClose={handleCloseProductModal} 
        />
      )}

      {showMovement && (
        <StockMovementModal onClose={() => setShowMovement(false)} />
      )}

      {showCategory && (
        <CategoryModal onClose={() => setShowCategory(false)} />
      )}

      {showUnit && (
        <UnitModal onClose={() => setShowUnit(false)} />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        title={`Supprimer ${deleteConfirm.type === 'product' ? 'le produit' : deleteConfirm.type === 'category' ? 'la catégorie' : 'l\'unité'}`}
        description={`Êtes-vous sûr de vouloir supprimer ${deleteConfirm.name} ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
        confirmText="Supprimer"
        variant="destructive"
      />
    </div>
  );
};
