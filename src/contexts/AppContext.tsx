
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useProducts, useCategories, useClients, useSales, useUnits } from '@/hooks/useSupabaseData';
import { useSuppliers } from '@/hooks/useSuppliers';

export interface Product {
  id: string;
  name: string;
  reference: string;
  category: string;
  stock: number;
  alert_threshold: number;
  buy_price: number;
  sell_price: number;
  unit: string;
  barcode: string;
  status: 'En stock' | 'Stock bas' | 'Rupture';
  variants: { color: string; size: string; stock: number }[];
  // Alias pour la compatibilité
  alertThreshold: number;
  buyPrice: number;
  sellPrice: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  total_orders: number;
  total_amount: number;
  last_order: string;
  status: 'Actif' | 'Inactif';
  // Alias pour la compatibilité
  totalOrders: number;
  totalAmount: number;
  lastOrder: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  total_orders: number;
  total_amount: number;
  last_order: string;
  status: 'Actif' | 'Inactif';
}

export interface Sale {
  id: string;
  reference: string;
  client: string;
  client_id: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Brouillon' | 'Confirmée' | 'Livrée' | 'Annulée';
  payment_method: string;
  // Alias pour la compatibilité
  paymentMethod: string;
}

export interface SaleItem {
  id: string;
  product: string;
  product_id: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  products: number;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  type: string;
}

interface AppContextType {
  // Data
  products: Product[];
  clients: Client[];
  categories: Category[];
  sales: Sale[];
  units: Unit[];
  suppliers: Supplier[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Product actions
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Client actions
  addClient: (client: any) => Promise<void>;
  
  // Category actions
  addCategory: (category: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Unit actions
  addUnit: (unit: any) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  
  // Sale actions
  addSale: (sale: any) => Promise<void>;
  updateSale: (id: string, sale: any) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  
  // Supplier actions
  addSupplier: (supplier: any) => Promise<void>;
  updateSupplier: (id: string, supplier: any) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // Refetch functions
  refetchProducts: () => Promise<void>;
  refetchCategories: () => Promise<void>;
  refetchClients: () => Promise<void>;
  refetchSuppliers: () => Promise<void>;
  
  // Legacy state access for compatibility
  state: {
    products: Product[];
    clients: Client[];
    categories: Category[];
    sales: Sale[];
    units: Unit[];
    suppliers: Supplier[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Wrap hooks in try-catch to handle initialization errors
  const productsHook = useProducts();
  const categoriesHook = useCategories();
  const clientsHook = useClients();
  const salesHook = useSales();
  const suppliersHook = useSuppliers();
  const unitsHook = useUnits();

  const {
    products: rawProducts,
    loading: productsLoading,
    addProduct: addProductRaw,
    updateProduct: updateProductRaw,
    deleteProduct,
    refetch: refetchProducts
  } = productsHook;

  const {
    categories: rawCategories,
    loading: categoriesLoading,
    addCategory,
    deleteCategory: deleteCategoryRaw,
    refetch: refetchCategories
  } = categoriesHook;

  const {
    clients: rawClients,
    loading: clientsLoading,
    addClient,
    refetch: refetchClients
  } = clientsHook;

  const {
    sales: rawSales,
    loading: salesLoading,
    addSale: addSaleRaw,
    updateSale: updateSaleRaw,
    deleteSale
  } = salesHook;

  const {
    suppliers: rawSuppliers,
    loading: suppliersLoading,
    addSupplier: addSupplierRaw,
    updateSupplier: updateSupplierRaw,
    deleteSupplier: deleteSupplierRaw,
    refetch: refetchSuppliers
  } = suppliersHook;

  const {
    units: rawUnits,
    loading: unitsLoading,
    addUnit: addUnitRaw,
    deleteUnit: deleteUnitRaw
  } = unitsHook;

  const loading = productsLoading || categoriesLoading || clientsLoading || salesLoading || suppliersLoading || unitsLoading;

  // Initialize the context once all data is loaded
  useEffect(() => {
    if (!loading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [loading, isInitialized]);

  // Transform Supabase data to match interface
  const products: Product[] = (rawProducts || []).map(p => ({
    ...p,
    category: p.categories?.name || '',
    unit: p.units?.symbol || '',
    variants: p.product_variants || [],
    // Alias pour la compatibilité
    alertThreshold: p.alert_threshold || 0,
    buyPrice: p.buy_price || 0,
    sellPrice: p.sell_price || 0
  }));

  const clients: Client[] = (rawClients || []).map(c => ({
    ...c,
    // Alias pour la compatibilité
    totalOrders: c.total_orders || 0,
    totalAmount: c.total_amount || 0,
    lastOrder: c.last_order || ''
  }));

  const categories: Category[] = (rawCategories || []).map(c => ({
    ...c,
    products: products.filter(p => p.category === c.name).length
  }));

  const sales: Sale[] = (rawSales || []).map(s => ({
    ...s,
    client: s.clients?.name || '',
    client_id: s.client_id || '',
    items: (s.sale_items || []).map((item: any) => ({
      id: item.id,
      product: item.products?.name || '',
      product_id: item.product_id || '',
      price: item.price,
      quantity: item.quantity,
      discount: item.discount || 0,
      total: item.total
    })),
    // Alias pour la compatibilité
    paymentMethod: s.payment_method || ''
  }));

  const suppliers: Supplier[] = (rawSuppliers || []).map(s => ({
    ...s,
    // Ensure all required properties are present
    total_orders: s.total_orders || 0,
    total_amount: s.total_amount || 0,
    last_order: s.last_order || null
  }));

  const units: Unit[] = (rawUnits || []).map(u => ({
    ...u
  }));

  // Wrapper functions to match interface
  const addProduct = async (productData: any): Promise<void> => {
    try {
      await addProductRaw(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: any): Promise<void> => {
    try {
      await updateProductRaw(id, productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const addSale = async (saleData: any): Promise<void> => {
    try {
      await addSaleRaw(saleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sale');
      throw err;
    }
  };

  const updateSale = async (id: string, saleData: any): Promise<void> => {
    try {
      await updateSaleRaw(id, saleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sale');
      throw err;
    }
  };

  const addSupplier = async (supplierData: any): Promise<void> => {
    try {
      await addSupplierRaw(supplierData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add supplier');
      throw err;
    }
  };

  const updateSupplier = async (id: string, supplierData: any): Promise<void> => {
    try {
      await updateSupplierRaw(id, supplierData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update supplier');
      throw err;
    }
  };

  const deleteSupplier = async (id: string): Promise<void> => {
    try {
      await deleteSupplierRaw(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete supplier');
      throw err;
    }
  };

  const addUnit = async (unitData: any): Promise<void> => {
    try {
      await addUnitRaw(unitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add unit');
      throw err;
    }
  };

  // Implemented functions for missing actions
  const deleteCategory = async (id: string) => {
    try {
      await deleteCategoryRaw(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  };

  const deleteUnit = async (id: string) => {
    try {
      await deleteUnitRaw(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete unit');
      throw err;
    }
  };

  const state = {
    products,
    clients,
    categories,
    sales,
    units,
    suppliers
  };

  const value = {
    products,
    clients,
    categories,
    sales,
    units,
    suppliers,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addClient,
    addCategory,
    deleteCategory,
    addUnit,
    deleteUnit,
    addSale,
    updateSale,
    deleteSale,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    refetchProducts,
    refetchCategories,
    refetchClients,
    refetchSuppliers,
    state
  };

  // Don't render children until context is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
