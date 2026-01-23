import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  UserCheck, 
  FileText, 
  Settings,
  Tag,
  PackageX,
  Download,
  Receipt
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'manager' | 'user';

interface ModulePermissions {
  dashboard: boolean;
  stock: boolean;
  sales: boolean;
  clients: boolean;
  purchases: boolean;
  suppliers: boolean;
  promotions: boolean;
  returns: boolean;
  export: boolean;
  invoices: boolean;
  reports: boolean;
  settings: boolean;
  admin: boolean;
}

interface BottomNavigationProps {
  activePage: string;
  onPageChange: (page: string) => void;
  userRole?: AppRole;
  permissions?: ModulePermissions;
}

export const BottomNavigation = ({ activePage, onPageChange, userRole = 'user', permissions }: BottomNavigationProps) => {
  const { products, sales } = useApp();
  const { purchaseOrders } = usePurchaseOrders();
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);

  useEffect(() => {
    const fetchUnpaidCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('status', 'Payée');

      setUnpaidInvoicesCount(count || 0);
    };

    fetchUnpaidCount();
  }, []);

  const lowStockCount = products.filter(p => p.stock <= p.alert_threshold && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const pendingOrdersCount = purchaseOrders.filter(order => order.status === 'En cours').length;
  const draftSalesCount = sales.filter(sale => sale.status === 'Brouillon').length;

  const menuItems = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard, badge: null, isAlert: false },
    { id: 'sales', label: 'Ventes', icon: ShoppingCart, badge: draftSalesCount > 0 ? draftSalesCount : null, isAlert: false },
    { id: 'invoices', label: 'Factures', icon: Receipt, badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : null, isAlert: unpaidInvoicesCount > 0 },
    { id: 'stock', label: 'Stock', icon: Package, badge: (lowStockCount + outOfStockCount) > 0 ? lowStockCount + outOfStockCount : null, isAlert: outOfStockCount > 0 },
    { id: 'purchases', label: 'Achats', icon: Truck, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, isAlert: false },
    { id: 'promotions', label: 'Promos', icon: Tag, badge: null, isAlert: false },
    { id: 'suppliers', label: 'Fourn.', icon: Users, badge: null, isAlert: false },
    { id: 'clients', label: 'Clients', icon: UserCheck, badge: null, isAlert: false },
    { id: 'returns', label: 'Retours', icon: PackageX, badge: null, isAlert: false },
    { id: 'export', label: 'Export', icon: Download, badge: null, isAlert: false },
    { id: 'reports', label: 'Rapports', icon: FileText, badge: null, isAlert: false },
    { id: 'settings', label: 'Config', icon: Settings, badge: null, isAlert: false }
  ];

  // Filter menu items based on permissions (from database) or fallback to role-based
  const visibleMenuItems = menuItems.filter(item => {
    if (permissions) {
      return permissions[item.id as keyof ModulePermissions] ?? false;
    }
    // Fallback: admin sees all, others see basics
    if (userRole === 'admin') return true;
    return ['dashboard', 'sales', 'stock', 'clients', 'settings'].includes(item.id);
  });

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      {/* Navigation content */}
      <div className="relative flex overflow-x-auto scrollbar-hide px-1 py-2 gap-0.5">
        {visibleMenuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] px-2 py-1.5 rounded-xl transition-all duration-200 relative shrink-0",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive && "scale-110"
                )} />
                {item.badge && (
                  <span 
                    className={cn(
                      "absolute -top-1.5 -right-1.5 text-[10px] text-white px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full font-semibold",
                      item.isAlert ? "bg-destructive" : "bg-orange-500"
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-0.5 truncate max-w-full",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
