
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
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
  Receipt,
  MoreHorizontal,
  MessageCircle,
  Sparkles,
  X
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

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
  onOpenChatbot?: () => void;
  onOpenAlerts?: () => void;
}

export const BottomNavigation = ({ activePage, onPageChange, userRole = 'user', permissions, onOpenChatbot, onOpenAlerts }: BottomNavigationProps) => {
  const [showMore, setShowMore] = useState(false);
  const { products, sales } = useApp();
  const { purchaseOrders } = usePurchaseOrders();
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);
  const { allowedModules } = useSubscription();
  const { isAdmin } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

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
    { id: 'stock', label: 'Stock', icon: Package, badge: (lowStockCount + outOfStockCount) > 0 ? lowStockCount + outOfStockCount : null, isAlert: outOfStockCount > 0 },
    { id: 'invoices', label: 'Factures', icon: Receipt, badge: unpaidInvoicesCount > 0 ? unpaidInvoicesCount : null, isAlert: unpaidInvoicesCount > 0 },
    { id: 'purchases', label: 'Achats', icon: Truck, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, isAlert: false },
    { id: 'promotions', label: 'Promos', icon: Tag, badge: null, isAlert: false },
    { id: 'suppliers', label: 'Fourn.', icon: Users, badge: null, isAlert: false },
    { id: 'clients', label: 'Clients', icon: UserCheck, badge: null, isAlert: false },
    { id: 'returns', label: 'Retours', icon: PackageX, badge: null, isAlert: false },
    { id: 'export', label: 'Export', icon: Download, badge: null, isAlert: false },
    { id: 'reports', label: 'Rapports', icon: FileText, badge: null, isAlert: false },
    { id: 'settings', label: 'Config', icon: Settings, badge: null, isAlert: false }
  ];

  const visibleMenuItems = menuItems.filter(item => {
    if (permissions) {
      if (!(permissions[item.id as keyof ModulePermissions] ?? false)) return false;
    } else {
      if (userRole !== 'admin' && !['dashboard', 'sales', 'stock', 'clients', 'settings'].includes(item.id)) return false;
    }
    if (!isAdmin && allowedModules.length > 0) {
      return allowedModules.includes(item.id);
    }
    return true;
  });

  // Show first 4 items in main bar, rest in "more" menu
  const mainItems = visibleMenuItems.slice(0, 4);
  const moreItems = visibleMenuItems.slice(4);
  const hasMore = moreItems.length > 0 || onOpenChatbot || onOpenAlerts;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* More menu overlay */}
      {showMore && (
        <>
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10 animate-in fade-in-0 duration-200" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-full left-0 right-0 px-4 pb-3 animate-in slide-in-from-bottom-4 duration-200">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-3">
              <div className="grid grid-cols-4 gap-1">
                {moreItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onPageChange(item.id); setShowMore(false); }}
                      className={cn(
                        "flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all relative",
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <div className="relative">
                        <item.icon className="w-5 h-5" />
                        {item.badge && (
                          <span className={cn(
                            "absolute -top-1.5 -right-2 text-[9px] text-white px-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full font-bold",
                            item.isAlert ? "bg-destructive" : "bg-warning"
                          )}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium mt-1 truncate max-w-full">{item.label}</span>
                    </button>
                  );
                })}
                {/* AI & Alerts shortcuts */}
                {onOpenChatbot && (
                  <button
                    onClick={() => { onOpenChatbot(); setShowMore(false); }}
                    className="flex flex-col items-center justify-center py-3 px-1 rounded-xl text-muted-foreground hover:bg-muted transition-all"
                  >
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-medium mt-1">Assistant</span>
                  </button>
                )}
                {onOpenAlerts && (
                  <button
                    onClick={() => { onOpenAlerts(); setShowMore(false); }}
                    className="flex flex-col items-center justify-center py-3 px-1 rounded-xl text-muted-foreground hover:bg-muted transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-warning" />
                    <span className="text-[10px] font-medium mt-1">Alertes IA</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main navigation bar */}
      <div className="bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-lg">
        <div className="flex items-stretch justify-around px-2 py-1.5 max-w-md mx-auto">
          {mainItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-2 rounded-2xl transition-all duration-200 relative mx-0.5",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground active:scale-95"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                  {item.badge && (
                    <span className={cn(
                      "absolute -top-1.5 -right-2 text-[9px] text-white px-1 min-w-[14px] h-3.5 flex items-center justify-center rounded-full font-bold ring-2 ring-card",
                      item.isAlert ? "bg-destructive" : "bg-warning"
                    )}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  "text-[10px] mt-0.5 truncate",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More button */}
          {hasMore && (
            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 rounded-2xl transition-all duration-200 mx-0.5",
                showMore
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground active:scale-95"
              )}
            >
              {showMore ? <X className="w-5 h-5" /> : <MoreHorizontal className="w-5 h-5" />}
              <span className="text-[10px] font-medium mt-0.5">Plus</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
