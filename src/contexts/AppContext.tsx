
import React, { createContext, useContext, ReactNode } from 'react';
import { useProducts, useCategories, useClients } from '@/hooks/useSupabaseData';

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
  
  // Loading states
  loading: boolean;
  
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
  deleteUnit: (id: string) => Promise<void>;
  
  // Sale actions
  addSale: (sale: any) => Promise<void>;
  updateSale: (sale: any) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  
  // Refetch functions
  refetchProducts: () => Promise<void>;
  refetchCategories: () => Promise<void>;
  refetchClients: () => Promise<void>;
  
  // Legacy state access for compatibility
  state: {
    products: Product[];
    clients: Client[];
    categories: Category[];
    sales: Sale[];
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    products: rawProducts,
    loading: productsLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: refetchProducts
  } = useProducts();

  const {
    categories: rawCategories,
    loading: categoriesLoading,
    addCategory,
    refetch: refetchCategories
  } = useCategories();

  const {
    clients: rawClients,
    loading: clientsLoading,
    addClient,
    refetch: refetchClients
  } = useClients();

  const loading = productsLoading || categoriesLoading || clientsLoading;

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

  // Mock sales data for now
  const sales: Sale[] = [];

  // Mock functions for missing actions
  const deleteCategory = async (id: string) => {
    console.log('Delete category:', id);
  };

  const deleteUnit = async (id: string) => {
    console.log('Delete unit:', id);
  };

  const addSale = async (sale: any) => {
    console.log('Add sale:', sale);
  };

  const updateSale = async (sale: any) => {
    console.log('Update sale:', sale);
  };

  const deleteSale = async (id: string) => {
    console.log('Delete sale:', id);
  };

  const state = {
    products,
    clients,
    categories,
    sales
  };

  const value = {
    products,
    clients,
    categories,
    sales,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addClient,
    addCategory,
    deleteCategory,
    deleteUnit,
    addSale,
    updateSale,
    deleteSale,
    refetchProducts,
    refetchCategories,
    refetchClients,
    state
  };

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
