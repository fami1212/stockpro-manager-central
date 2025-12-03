import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  UserCheck, 
  FileText, 
  Settings,
  AlertTriangle,
  Tag,
  PackageX,
  Download,
  Bell
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';

interface BottomNavigationProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export const BottomNavigation = ({ activePage, onPageChange }: BottomNavigationProps) => {
  const { products, sales, clients } = useApp();
  const { purchaseOrders } = usePurchaseOrders();

  // Calculs dynamiques
  const lowStockCount = products.filter(p => p.stock <= p.alert_threshold && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const pendingOrdersCount = purchaseOrders.filter(order => order.status === 'En cours').length;
  const draftSalesCount = sales.filter(sale => sale.status === 'Brouillon').length;
  const todayRevenue = sales
    .filter(sale => new Date(sale.date).toDateString() === new Date().toDateString())
    .reduce((acc, sale) => acc + sale.total, 0);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Accueil',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'sales',
      label: 'Ventes',
      icon: ShoppingCart,
      badge: draftSalesCount > 0 ? draftSalesCount : null
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: Package,
      badge: (lowStockCount + outOfStockCount) > 0 ? lowStockCount + outOfStockCount : null,
      isAlert: outOfStockCount > 0
    },
    {
      id: 'purchases',
      label: 'Achats',
      icon: Truck,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null
    },
    {
      id: 'promotions',
      label: 'Promos',
      icon: Tag,
      badge: null
    },
    {
      id: 'suppliers',
      label: 'Fournisseurs',
      icon: Users,
      badge: null
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: UserCheck,
      badge: null
    },
    {
      id: 'returns',
      label: 'Retours',
      icon: PackageX,
      badge: null
    },
    {
      id: 'reminders',
      label: 'Relances',
      icon: Bell,
      badge: null
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      badge: null
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: FileText,
      badge: null
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-md border-t border-blue-200/20 z-50 shadow-lg">
      {/* Stats en haut */}
      <div className="px-4 py-2 border-b border-blue-200/20">
        <div className="flex justify-between items-center text-white text-xs">
          <span>Aujourd'hui: {todayRevenue.toLocaleString()} CFA</span>
          <span>{sales.filter(sale => new Date(sale.date).toDateString() === new Date().toDateString()).length} ventes</span>
        </div>
      </div>
      
      {/* Navigation scrollable */}
      <div className="flex overflow-x-auto scrollbar-hide px-2 py-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[75px] p-2 rounded-xl transition-all duration-300 relative mx-1",
              activePage === item.id
                ? "bg-white/20 text-white shadow-lg scale-105 backdrop-blur-md"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            )}
          >
            <div className="relative">
              <item.icon className={cn(
                "w-5 h-5 mb-1 transition-all duration-300",
                activePage === item.id ? "text-white scale-110" : "text-blue-200"
              )} />
              {item.badge && (
                <span 
                  className={cn(
                    "absolute -top-2 -right-2 text-xs text-white px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center leading-none shadow-md",
                    item.isAlert ? "bg-red-500 animate-pulse" : "bg-orange-500"
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className={cn(
              "text-xs font-medium truncate w-full text-center transition-all duration-300",
              activePage === item.id ? "text-white font-semibold" : "text-blue-100"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};