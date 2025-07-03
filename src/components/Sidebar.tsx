
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Box, 
  Users, 
  ShoppingCartIcon as Cart,
  Settings,
  FileText,
  ShoppingBag,
  Truck
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Sidebar = ({ activeModule, setActiveModule }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart },
    { id: 'stock', label: 'Stock', icon: Box },
    { id: 'sales', label: 'Ventes', icon: Cart },
    { id: 'purchases', label: 'Achats', icon: ShoppingBag },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
    { id: 'reports', label: 'Rapports', icon: FileText },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-600">StockPro</h2>
        <p className="text-sm text-gray-500">Manager</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                "w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors",
                activeModule === item.id 
                  ? "bg-blue-100 text-blue-700 border-r-4 border-blue-700" 
                  : "text-gray-600 hover:text-blue-700"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-6 left-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
        </div>
      </div>
    </div>
  );
};
