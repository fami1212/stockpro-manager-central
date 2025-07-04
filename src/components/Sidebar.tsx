
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
  X,
  Home
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Sidebar = ({ activeModule, setActiveModule }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home, shortLabel: 'Accueil' },
    { id: 'stock', label: 'Gestion Stock', icon: Box, shortLabel: 'Stock' },
    { id: 'sales', label: 'Ventes', icon: Cart, shortLabel: 'Ventes' },
    { id: 'purchases', label: 'Achats', icon: ShoppingBag, shortLabel: 'Achats' },
    { id: 'clients', label: 'Clients', icon: Users, shortLabel: 'Clients' },
    { id: 'suppliers', label: 'Fournisseurs', icon: Truck, shortLabel: 'Fournisseurs' },
    { id: 'reports', label: 'Rapports', icon: FileText, shortLabel: 'Rapports' },
    { id: 'settings', label: 'Paramètres', icon: Settings, shortLabel: 'Config' },
  ];

  const handleMenuClick = (itemId: string) => {
    setActiveModule(itemId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar - Modern Design */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-72">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 shadow-lg">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  StockPro
                </h2>
                <p className="text-xs text-gray-500 font-medium">Manager Pro</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-2">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={cn(
                      "group flex w-full items-center gap-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                      isActive 
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"
                      )} 
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
          
          {/* User Profile - Prepared for Backend */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@stockpro.com</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full" title="En ligne" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-600">StockPro</h2>
            </div>
          </div>
          
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={cn(
        "lg:hidden fixed top-14 left-0 right-0 bottom-0 z-40 bg-white transform transition-transform duration-300 ease-out",
        isMobileOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="p-4 space-y-2 max-h-full overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-x-4 rounded-xl px-4 py-4 text-left transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200" 
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className={cn(
                  "h-6 w-6 shrink-0",
                  isActive ? "text-blue-600" : "text-gray-400"
                )} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
          
          {/* Mobile User Profile */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@stockpro.com</p>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium truncate w-full text-center">
                  {item.shortLabel}
                </span>
                {isActive && (
                  <div className="w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
