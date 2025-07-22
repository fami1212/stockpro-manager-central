
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
import { useApp } from '@/contexts/AppContext';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Sidebar = ({ activeModule, setActiveModule }: SidebarProps) => {
  const { products, sales, clients, loading } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Calculer les statistiques dynamiques
  const lowStockCount = products.filter(p => p.status === 'Stock bas' || p.status === 'Rupture').length;
  const pendingSalesCount = sales.filter(s => s.status === 'Brouillon').length;
  const totalClients = clients.length;

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      icon: Home, 
      shortLabel: 'Accueil',
      badge: null
    },
    { 
      id: 'stock', 
      label: 'Gestion Stock', 
      icon: Box, 
      shortLabel: 'Stock',
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-red-500'
    },
    { 
      id: 'sales', 
      label: 'Ventes', 
      icon: Cart, 
      shortLabel: 'Ventes',
      badge: pendingSalesCount > 0 ? pendingSalesCount : null,
      badgeColor: 'bg-blue-500'
    },
    { 
      id: 'purchases', 
      label: 'Achats', 
      icon: ShoppingBag, 
      shortLabel: 'Achats',
      badge: null
    },
    { 
      id: 'clients', 
      label: 'Clients', 
      icon: Users, 
      shortLabel: 'Clients',
      badge: totalClients > 0 ? totalClients : null,
      badgeColor: 'bg-green-500'
    },
    { 
      id: 'suppliers', 
      label: 'Fournisseurs', 
      icon: Truck, 
      shortLabel: 'Fournisseurs',
      badge: null
    },
    { 
      id: 'reports', 
      label: 'Rapports', 
      icon: FileText, 
      shortLabel: 'Rapports',
      badge: null
    },
    { 
      id: 'settings', 
      label: 'Paramètres', 
      icon: Settings, 
      shortLabel: 'Config',
      badge: null
    },
  ];

  const handleMenuClick = (itemId: string) => {
    setActiveModule(itemId);
    setIsMobileOpen(false);
  };

  const renderBadge = (item: any) => {
    if (!item.badge || loading) return null;
    
    return (
      <span className={cn(
        "ml-auto text-xs font-bold text-white rounded-full min-w-[20px] h-5 flex items-center justify-center px-2",
        item.badgeColor || "bg-gray-500"
      )}>
        {item.badge > 99 ? '99+' : item.badge}
      </span>
    );
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
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {renderBadge(item)}
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
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
                <span className="font-medium flex-1">{item.label}</span>
                {renderBadge(item)}
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
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
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 relative",
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                )}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {item.badge && !loading && (
                    <span className={cn(
                      "absolute -top-2 -right-2 text-xs font-bold text-white rounded-full min-w-[16px] h-4 flex items-center justify-center px-1",
                      item.badgeColor || "bg-gray-500"
                    )}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
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
