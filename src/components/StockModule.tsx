
import { useState } from 'react';
import { Plus, Search, Filter, Package, TrendingUp, TrendingDown, AlertTriangle, Edit, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductFormModal } from '@/components/ProductFormModal';
import { StockMovementModal } from '@/components/StockMovementModal';
import { CategoryModal } from '@/components/CategoryModal';
import { UnitModal } from '@/components/UnitModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const StockModule = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showMovement, setShowMovement] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showUnit, setShowUnit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('products');

  const categories = [
    { id: 1, name: 'Électronique', color: 'blue', products: 15 },
    { id: 2, name: 'Alimentaire', color: 'green', products: 8 },
    { id: 3, name: 'Fournitures', color: 'purple', products: 12 },
    { id: 4, name: 'Vêtements', color: 'orange', products: 6 },
  ];

  const units = [
    { id: 1, name: 'Pièce', symbol: 'pcs', type: 'Unité' },
    { id: 2, name: 'Kilogramme', symbol: 'kg', type: 'Poids' },
    { id: 3, name: 'Litre', symbol: 'L', type: 'Volume' },
    { id: 4, name: 'Pack', symbol: 'pack', type: 'Groupé' },
  ];

  const products = [
    { 
      id: 1, 
      name: 'iPhone 15 Pro', 
      reference: 'IPH15P-128', 
      category: 'Électronique', 
      stock: 25, 
      alertThreshold: 5,
      buyPrice: 850, 
      sellPrice: 999, 
      unit: 'pcs',
      barcode: '1234567890123',
      status: 'En stock',
      variants: [
        { color: 'Noir', size: '128GB', stock: 15 },
        { color: 'Blanc', size: '128GB', stock: 10 }
      ]
    },
    { 
      id: 2, 
      name: 'Samsung Galaxy S24', 
      reference: 'SGS24-256', 
      category: 'Électronique', 
      stock: 2, 
      alertThreshold: 5,
      buyPrice: 650, 
      sellPrice: 799, 
      unit: 'pcs',
      barcode: '2345678901234',
      status: 'Stock bas',
      variants: []
    },
    { 
      id: 3, 
      name: 'MacBook Air M2', 
      reference: 'MBA-M2-13', 
      category: 'Électronique', 
      stock: 15, 
      alertThreshold: 3,
      buyPrice: 999, 
      sellPrice: 1199, 
      unit: 'pcs',
      barcode: '3456789012345',
      status: 'En stock',
      variants: []
    },
  ];

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
    },
    { 
      id: 3, 
      date: '2024-01-14', 
      time: '10:15',
      product: 'MacBook Air M2', 
      type: 'Sortie', 
      quantity: 1, 
      reason: 'Perte/Casse',
      user: 'Magasinier',
      reference: 'PERTE-001'
    },
  ];

  const lowStockProducts = products.filter(p => p.stock <= p.alertThreshold);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion du Stock</h2>
        <div className="flex space-x-2">
          <Button onClick={() => setShowMovement(true)} variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Mouvement
          </Button>
          <Button onClick={() => setShowAddProduct(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total produits</h3>
          <p className="text-3xl font-bold text-blue-600">{products.length}</p>
          <p className="text-sm text-gray-500 mt-1">Références actives</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Valeur stock</h3>
          <p className="text-3xl font-bold text-green-600">€{products.reduce((acc, p) => acc + (p.stock * p.buyPrice), 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Prix d'achat</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Alertes stock</h3>
          <p className="text-3xl font-bold text-red-600">{lowStockProducts.length}</p>
          <p className="text-sm text-gray-500 mt-1">Produits en rupture</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Catégories</h3>
          <p className="text-3xl font-bold text-purple-600">{categories.length}</p>
          <p className="text-sm text-gray-500 mt-1">Actives</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="units">Unités</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex space-x-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtrer
              </Button>
            </div>

            <div className="overflow-x-auto">
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
                  {filteredProducts.map((product) => (
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
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Package className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Historique des mouvements</h3>
              <Button onClick={() => setShowMovement(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau mouvement
              </Button>
            </div>

            <div className="overflow-x-auto">
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
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Gestion des catégories</h3>
              <Button onClick={() => setShowCategory(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full bg-${category.color}-500 mr-3`}></div>
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{category.products} produit(s)</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Unités de mesure</h3>
              <Button onClick={() => setShowUnit(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle unité
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {units.map((unit) => (
                <div key={unit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{unit.name}</h4>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Symbole: {unit.symbol}</p>
                  <p className="text-xs text-gray-500">{unit.type}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {showAddProduct && (
        <ProductFormModal onClose={() => setShowAddProduct(false)} />
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
    </div>
  );
};
