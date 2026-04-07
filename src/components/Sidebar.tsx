
import { useState, useEffect } from 'react';
import logoImg from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  UserCheck, 
  FileText, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Tag,
  PackageX,
  Download,
  Receipt,
  Crown,
  Zap,
  Star,
  ArrowUpCircle
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

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

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  userRole?: AppRole;
  permissions?: ModulePermissions;
}

const menuSections = [
  {
    label: 'Principal',
    items: ['dashboard', 'sales', 'stock']
  },
  {
    label: 'Commerce',
    items: ['purchases', 'promotions', 'invoices']
  },
  {
    label: 'Relations',
    items: ['suppliers', 'clients', 'returns']
  },
  {
    label: 'Outils',
    items: ['export', 'reports', 'settings']
  }
];
const UsageBar = ({ label, current, max }: { label: string; current: number; max: number }) => {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isHigh = pct >= 80;
  const isFull = pct >= 100;
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", isFull ? "text-destructive" : isHigh ? "text-warning" : "text-foreground")}>
          {current}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isFull ? "bg-destructive" : isHigh ? "bg-warning" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const Sidebar = ({ activePage, onPageChange, userRole = 'user', permissions }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);
  const { products, sales } = useApp();
  const { purchaseOrders } = usePurchaseOrders();
  const { currentPlanName, allowedModules, subscription } = useSubscription();
  const { isAdmin, signOut } = useAuth();

  const maxProducts = subscription?.plan?.max_products ?? null;
  const maxSales = subscription?.plan?.max_sales ?? null;

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

  const allMenuItems: Record<string, { label: string; icon: any; badge: any }> = {
    dashboard: { label: 'Tableau de bord', icon: LayoutDashboard, badge: null },
    sales: {
      label: 'Ventes',
      icon: ShoppingCart,
      badge: draftSalesCount > 0 ? { count: draftSalesCount, variant: 'info' } : null
    },
    stock: {
      label: 'Stock',
      icon: Package,
      badge: (lowStockCount + outOfStockCount) > 0 ? {
        count: lowStockCount + outOfStockCount,
        variant: outOfStockCount > 0 ? 'destructive' : 'warning'
      } : null
    },
    purchases: {
      label: 'Achats',
      icon: Truck,
      badge: pendingOrdersCount > 0 ? { count: pendingOrdersCount, variant: 'warning' } : null
    },
    promotions: { label: 'Promotions', icon: Tag, badge: null },
    suppliers: { label: 'Fournisseurs', icon: Users, badge: null },
    clients: { label: 'Clients', icon: UserCheck, badge: null },
    returns: { label: 'Retours', icon: PackageX, badge: null },
    invoices: {
      label: 'Factures',
      icon: Receipt,
      badge: unpaidInvoicesCount > 0 ? { count: unpaidInvoicesCount, variant: 'destructive' } : null
    },
    export: { label: 'Export', icon: Download, badge: null },
    reports: { label: 'Rapports', icon: FileText, badge: null },
    settings: { label: 'Paramètres', icon: Settings, badge: null }
  };

  const isItemVisible = (itemId: string) => {
    if (permissions) {
      if (!(permissions[itemId as keyof ModulePermissions] ?? false)) return false;
    } else {
      if (userRole !== 'admin' && !['dashboard', 'sales', 'stock', 'clients', 'settings'].includes(itemId)) return false;
    }
    if (!isAdmin && allowedModules.length > 0) {
      return allowedModules.includes(itemId);
    }
    return true;
  };

  const planConfig: Record<string, { label: string; icon: any; className: string }> = {
    trial: { label: 'Essai', icon: Zap, className: 'bg-warning/15 text-warning border-warning/30' },
    basique: { label: 'Basique', icon: Star, className: 'bg-info/15 text-info border-info/30' },
    pro: { label: 'Pro', icon: Zap, className: 'bg-primary/15 text-primary border-primary/30' },
    premium: { label: 'Premium', icon: Crown, className: 'bg-accent/15 text-accent border-accent/30' }
  };

  const currentPlan = planConfig[currentPlanName || 'trial'] || planConfig.trial;

  const todaySales = sales.filter(sale => new Date(sale.date).toDateString() === new Date().toDateString());
  const todayRevenue = todaySales.reduce((acc, sale) => acc + sale.total, 0);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const MenuButton = ({ itemId }: { itemId: string }) => {
    const item = allMenuItems[itemId];
    if (!item) return null;
    const isActive = activePage === itemId;
    const Icon = item.icon;

    const button = (
      <button
        onClick={() => onPageChange(itemId)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className={cn("w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200", isActive && "scale-110")} />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium truncate">{item.label}</span>
            {item.badge && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none",
                item.badge.variant === 'destructive' && "bg-destructive text-destructive-foreground",
                item.badge.variant === 'warning' && "bg-warning text-warning-foreground",
                item.badge.variant === 'info' && "bg-info text-info-foreground"
              )}>
                {item.badge.count > 99 ? '99+' : item.badge.count}
              </span>
            )}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-destructive ring-2 ring-card" />
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.badge && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1">{item.badge.count}</Badge>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col h-full",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}>
        {/* Header */}
        <div className={cn("p-4 flex items-center flex-shrink-0", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                <img src={logoImg} alt="StockPlant" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground leading-tight">StockPlant</h1>
                <p className="text-[11px] text-muted-foreground">Gestion intelligente</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="StockPlant" className="w-7 h-7 object-contain" />
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        {!collapsed && (
          <div className="px-4 pb-3 flex-shrink-0">
            <div className="bg-muted/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Chiffre du jour</span>
                <span className="font-semibold text-success">{todayRevenue.toLocaleString()} CFA</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Ventes du jour</span>
                <span className="font-semibold text-info">{todaySales.length}</span>
              </div>
              {(lowStockCount + outOfStockCount) > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                    Alertes stock
                  </span>
                  <span className="font-semibold text-destructive">{lowStockCount + outOfStockCount}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Separator className="mx-4 w-auto" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {menuSections.map((section) => {
            const visibleItems = section.items.filter(isItemVisible);
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label}>
                {!collapsed && (
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1.5">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((itemId) => (
                    <MenuButton key={itemId} itemId={itemId} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Collapse button when collapsed */}
        {collapsed && (
          <div className="px-3 pb-2 flex-shrink-0">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="w-full h-9 text-muted-foreground hover:text-foreground">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Développer</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-border flex-shrink-0 space-y-2">
          {/* Plan Badge */}
          {!collapsed && !isAdmin && currentPlanName && (
            <div className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium", currentPlan.className)}>
              <currentPlan.icon className="w-3.5 h-3.5" />
              <span>Plan {currentPlan.label}</span>
            </div>
          )}
          {collapsed && !isAdmin && currentPlanName && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className={cn("flex items-center justify-center py-2 rounded-xl border", currentPlan.className)}>
                  <currentPlan.icon className="w-3.5 h-3.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">Plan {currentPlan.label}</TooltipContent>
            </Tooltip>
          )}

          {/* Usage Progress */}
          {!collapsed && !isAdmin && (
            <div className="px-2 text-[11px] space-y-2">
              {maxProducts !== null && (
                <UsageBar label="Produits" current={products.length} max={maxProducts} />
              )}
              {maxSales !== null && (
                <UsageBar label="Ventes" current={sales.length} max={maxSales} />
              )}
              {maxProducts === null && maxSales === null && (
                <div className="text-muted-foreground text-center py-1">Illimité ✨</div>
              )}
            </div>
          )}

          {/* Logout */}
          {!collapsed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          ) : (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="w-full h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Déconnexion</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
