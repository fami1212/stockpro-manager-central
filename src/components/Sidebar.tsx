
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Box, 
  Users, 
  ShoppingCartIcon as Cart,
  Settings,
  FileText,
  ShoppingBag,
  Truck,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Sidebar = ({ activeModule, setActiveModule }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const handleMenuClick = (itemId: string) => {
    setActiveModule(itemId);
    setIsMobileOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg h-screen transition-transform duration-300 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-600">StockPro</h2>
          <p className="text-sm text-gray-500">Manager</p>
        </div>
        
        <nav className="mt-6 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "w-full flex items-center px-4 py-3 mb-1 text-left rounded-lg hover:bg-blue-50 transition-colors",
                  activeModule === item.id 
                    ? "bg-blue-100 text-blue-700 font-medium border-r-4 border-blue-700" 
                    : "text-gray-600 hover:text-blue-700"
                )}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="absolute bottom-6 left-4 right-4">
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
              <p className="text-xs text-gray-500 truncate">Administrateur</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
