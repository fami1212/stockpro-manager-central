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
  products: Product[];
  clients: Client[];
  categories: Category[];
  loading: boolean;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addClient: (client: any) => Promise<void>;
  addCategory: (category: any) => Promise<void>;
  refetchProducts: () => Promise<void>;
  refetchCategories: () => Promise<void>;
  refetchClients: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    products,
    loading: productsLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: refetchProducts
  } = useProducts();

  const {
    categories,
    loading: categoriesLoading,
    addCategory,
    refetch: refetchCategories
  } = useCategories();

  const {
    clients,
    loading: clientsLoading,
    addClient,
    refetch: refetchClients
  } = useClients();

  const loading = productsLoading || categoriesLoading || clientsLoading;

  const value = {
    products: products || [],
    clients: clients || [],
    categories: categories || [],
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addClient,
    addCategory,
    refetchProducts,
    refetchCategories,
    refetchClients
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
