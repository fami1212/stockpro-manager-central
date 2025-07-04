
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Product {
  id: number;
  name: string;
  reference: string;
  category: string;
  stock: number;
  alertThreshold: number;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  barcode: string;
  status: 'En stock' | 'Stock bas' | 'Rupture';
  variants: { color: string; size: string; stock: number }[];
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalAmount: number;
  lastOrder: string;
  status: 'Actif' | 'Inactif';
}

export interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalAmount: number;
  lastOrder: string;
  status: 'Actif' | 'Inactif';
}

export interface Sale {
  id: number;
  reference: string;
  client: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Brouillon' | 'Confirmée' | 'Livrée' | 'Annulée';
  paymentMethod: string;
}

export interface SaleItem {
  id: number;
  product: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  products: number;
}

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  type: string;
}

interface AppState {
  products: Product[];
  clients: Client[];
  suppliers: Supplier[];
  sales: Sale[];
  categories: Category[];
  units: Unit[];
  loading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: number }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: number }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: number }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'UPDATE_SALE'; payload: Sale }
  | { type: 'DELETE_SALE'; payload: number }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: number }
  | { type: 'ADD_UNIT'; payload: Unit }
  | { type: 'UPDATE_UNIT'; payload: Unit }
  | { type: 'DELETE_UNIT'; payload: number };

const initialState: AppState = {
  products: [
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
    }
  ],
  clients: [
    {
      id: 1,
      name: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      phone: '06 12 34 56 78',
      address: '123 Rue de la Paix, 75001 Paris',
      totalOrders: 8,
      totalAmount: 2340,
      lastOrder: '2024-01-15',
      status: 'Actif'
    }
  ],
  suppliers: [
    {
      id: 1,
      name: 'TechDistrib',
      contact: 'Jean Dubois',
      email: 'jean@techdistrib.com',
      phone: '01 23 45 67 89',
      address: '45 Rue de la Tech, 75001 Paris',
      totalOrders: 15,
      totalAmount: 45600,
      lastOrder: '2024-01-15',
      status: 'Actif'
    }
  ],
  sales: [],
  categories: [
    { id: 1, name: 'Électronique', color: 'blue', products: 15 },
    { id: 2, name: 'Alimentaire', color: 'green', products: 8 },
    { id: 3, name: 'Fournitures', color: 'purple', products: 12 },
    { id: 4, name: 'Vêtements', color: 'orange', products: 6 }
  ],
  units: [
    { id: 1, name: 'Pièce', symbol: 'pcs', type: 'Unité' },
    { id: 2, name: 'Kilogramme', symbol: 'kg', type: 'Poids' },
    { id: 3, name: 'Litre', symbol: 'L', type: 'Volume' },
    { id: 4, name: 'Pack', symbol: 'pack', type: 'Groupé' }
  ],
  loading: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p)
      };
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload)
      };
    
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c)
      };
    
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(c => c.id !== action.payload)
      };
    
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s)
      };
    
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter(s => s.id !== action.payload)
      };
    
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map(s => s.id === action.payload.id ? action.payload : s)
      };
    
    case 'DELETE_SALE':
      return {
        ...state,
        sales: state.sales.filter(s => s.id !== action.payload)
      };
    
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c)
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload)
      };
    
    case 'ADD_UNIT':
      return { ...state, units: [...state.units, action.payload] };
    
    case 'UPDATE_UNIT':
      return {
        ...state,
        units: state.units.map(u => u.id === action.payload.id ? action.payload : u)
      };
    
    case 'DELETE_UNIT':
      return {
        ...state,
        units: state.units.filter(u => u.id !== action.payload)
      };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: number) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: number) => void;
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (sale: Sale) => void;
  deleteSale: (id: number) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: number) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (unit: Unit) => void;
  deleteUnit: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now() };
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    toast({ title: 'Produit ajouté', description: `${product.name} a été ajouté avec succès.` });
  };

  const updateProduct = (product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
    toast({ title: 'Produit modifié', description: `${product.name} a été modifié avec succès.` });
  };

  const deleteProduct = (id: number) => {
    const product = state.products.find(p => p.id === id);
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
    toast({ title: 'Produit supprimé', description: `${product?.name || 'Le produit'} a été supprimé.` });
  };

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: Date.now() };
    dispatch({ type: 'ADD_CLIENT', payload: newClient });
    toast({ title: 'Client ajouté', description: `${client.name} a été ajouté avec succès.` });
  };

  const updateClient = (client: Client) => {
    dispatch({ type: 'UPDATE_CLIENT', payload: client });
    toast({ title: 'Client modifié', description: `${client.name} a été modifié avec succès.` });
  };

  const deleteClient = (id: number) => {
    const client = state.clients.find(c => c.id === id);
    dispatch({ type: 'DELETE_CLIENT', payload: id });
    toast({ title: 'Client supprimé', description: `${client?.name || 'Le client'} a été supprimé.` });
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplier, id: Date.now() };
    dispatch({ type: 'ADD_SUPPLIER', payload: newSupplier });
    toast({ title: 'Fournisseur ajouté', description: `${supplier.name} a été ajouté avec succès.` });
  };

  const updateSupplier = (supplier: Supplier) => {
    dispatch({ type: 'UPDATE_SUPPLIER', payload: supplier });
    toast({ title: 'Fournisseur modifié', description: `${supplier.name} a été modifié avec succès.` });
  };

  const deleteSupplier = (id: number) => {
    const supplier = state.suppliers.find(s => s.id === id);
    dispatch({ type: 'DELETE_SUPPLIER', payload: id });
    toast({ title: 'Fournisseur supprimé', description: `${supplier?.name || 'Le fournisseur'} a été supprimé.` });
  };

  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = { ...sale, id: Date.now() };
    dispatch({ type: 'ADD_SALE', payload: newSale });
    toast({ title: 'Vente enregistrée', description: `Vente ${sale.reference} enregistrée avec succès.` });
  };

  const updateSale = (sale: Sale) => {
    dispatch({ type: 'UPDATE_SALE', payload: sale });
    toast({ title: 'Vente modifiée', description: `Vente ${sale.reference} modifiée avec succès.` });
  };

  const deleteSale = (id: number) => {
    const sale = state.sales.find(s => s.id === id);
    dispatch({ type: 'DELETE_SALE', payload: id });
    toast({ title: 'Vente supprimée', description: `Vente ${sale?.reference || ''} supprimée.` });
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: Date.now() };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    toast({ title: 'Catégorie ajoutée', description: `${category.name} a été ajoutée avec succès.` });
  };

  const updateCategory = (category: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
    toast({ title: 'Catégorie modifiée', description: `${category.name} a été modifiée avec succès.` });
  };

  const deleteCategory = (id: number) => {
    const category = state.categories.find(c => c.id === id);
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
    toast({ title: 'Catégorie supprimée', description: `${category?.name || 'La catégorie'} a été supprimée.` });
  };

  const addUnit = (unit: Omit<Unit, 'id'>) => {
    const newUnit = { ...unit, id: Date.now() };
    dispatch({ type: 'ADD_UNIT', payload: newUnit });
    toast({ title: 'Unité ajoutée', description: `${unit.name} a été ajoutée avec succès.` });
  };

  const updateUnit = (unit: Unit) => {
    dispatch({ type: 'UPDATE_UNIT', payload: unit });
    toast({ title: 'Unité modifiée', description: `${unit.name} a été modifiée avec succès.` });
  };

  const deleteUnit = (id: number) => {
    const unit = state.units.find(u => u.id === id);
    dispatch({ type: 'DELETE_UNIT', payload: id });
    toast({ title: 'Unité supprimée', description: `${unit?.name || 'L\'unité'} a été supprimée.` });
  };

  const value = {
    state,
    dispatch,
    addProduct,
    updateProduct,
    deleteProduct,
    addClient,
    updateClient,
    deleteClient,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addSale,
    updateSale,
    deleteSale,
    addCategory,
    updateCategory,
    deleteCategory,
    addUnit,
    updateUnit,
    deleteUnit
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
