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
  AlertTriangle
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex overflow-x-auto scrollbar-hide px-2 py-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center min-w-[80px] p-2 rounded-lg transition-all duration-200 relative",
              activePage === item.id
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <div className="relative">
              <item.icon className={cn(
                "w-5 h-5 mb-1",
                activePage === item.id ? "text-blue-700" : "text-gray-400"
              )} />
              {item.badge && (
                <span 
                  className={cn(
                    "absolute -top-2 -right-2 text-xs text-white px-1.5 py-0.5 rounded-full font-medium min-w-[18px] text-center leading-none",
                    item.isAlert ? "bg-red-500" : "bg-blue-500"
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium truncate w-full text-center">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};