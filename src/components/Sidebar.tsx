
import { useState, useEffect } from 'react';
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
  Receipt
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar = ({ activePage, onPageChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);
  const { products, sales, clients } = useApp();
  const { purchaseOrders } = usePurchaseOrders();

  // Fetch unpaid invoices count
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

  // Calculs dynamiques
  const lowStockCount = products.filter(p => p.stock <= p.alert_threshold && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const pendingOrdersCount = purchaseOrders.filter(order => order.status === 'En cours').length;
  const draftSalesCount = sales.filter(sale => sale.status === 'Brouillon').length;
  const activeClientsCount = clients.filter(client => client.status === 'Actif').length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'sales',
      label: 'Ventes',
      icon: ShoppingCart,
      badge: draftSalesCount > 0 ? { count: draftSalesCount, color: 'bg-blue-500', tooltip: 'Brouillons en attente' } : null
    },
    {
      id: 'stock',
      label: 'Stock',
      icon: Package,
      badge: (lowStockCount + outOfStockCount) > 0 ? { 
        count: lowStockCount + outOfStockCount, 
        color: outOfStockCount > 0 ? 'bg-red-500' : 'bg-yellow-500',
        tooltip: outOfStockCount > 0 ? 'Produits en rupture' : 'Stock faible'
      } : null
    },
    {
      id: 'purchases',
      label: 'Achats',
      icon: Truck,
      badge: pendingOrdersCount > 0 ? { count: pendingOrdersCount, color: 'bg-orange-500', tooltip: 'Commandes en attente' } : null
    },
    {
      id: 'promotions',
      label: 'Promotions',
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
      badge: activeClientsCount > 99 ? { count: '99+', color: 'bg-green-500', tooltip: 'Clients actifs' } : null
    },
    {
      id: 'returns',
      label: 'Retours',
      icon: PackageX,
      badge: null
    },
    {
      id: 'invoices',
      label: 'Factures',
      icon: Receipt,
      badge: unpaidInvoicesCount > 0 ? { count: unpaidInvoicesCount, color: 'bg-red-500', tooltip: 'Factures impayées' } : null
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

  const handleLogout = async () => {
    try {
      // TODO: Implement logout when available
      console.log('Logout clicked');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold text-gray-900">StockPro</h1>
            <p className="text-xs text-gray-500">Gestion intelligente</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Chiffre du jour</span>
              <span className="font-medium text-green-600">
                {sales
                  .filter(sale => new Date(sale.date).toDateString() === new Date().toDateString())
                  .reduce((acc, sale) => acc + sale.total, 0)
                  .toLocaleString()} CFA
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Ventes du jour</span>
              <span className="font-medium text-blue-600">
                {sales.filter(sale => new Date(sale.date).toDateString() === new Date().toDateString()).length}
              </span>
            </div>
            {(lowStockCount + outOfStockCount) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                  Alertes stock
                </span>
                <span className="font-medium text-red-600">{lowStockCount + outOfStockCount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onPageChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200",
                  activePage === item.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  activePage === item.id ? "text-blue-700" : "text-gray-400"
                )} />
                {!collapsed && (
                  <>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <span 
                        className={cn(
                          "text-xs text-white px-2 py-0.5 rounded-full font-medium min-w-[20px] text-center",
                          item.badge.color
                        )}
                        title={item.badge.tooltip}
                      >
                        {item.badge.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="mb-3 text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Produits:</span>
              <span className="font-medium">{products.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Clients actifs:</span>
              <span className="font-medium">{activeClientsCount}</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50",
            collapsed && "px-2"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="ml-2">Déconnexion</span>}
        </Button>
      </div>
    </div>
  );
};
