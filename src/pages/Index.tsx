import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Dashboard } from '@/components/Dashboard';
import { Sidebar } from '@/components/Sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { StockModule } from '@/components/StockModule';
import { SalesModule } from '@/components/SalesModule';
import { ClientsModule } from '@/components/ClientsModule';
import { PurchasesModule } from '@/components/PurchasesModule';
import { SuppliersModule } from '@/components/SuppliersModule';
import { ReportsModule } from '@/components/ReportsModule';
import { SettingsModule } from '@/components/SettingsModule';
import { PromotionsModule } from '@/components/PromotionsModule';
import { ReturnsModule } from '@/components/ReturnsModule';
import { ExportModule } from '@/components/ExportModule';
import { UnpaidInvoicesDashboard } from '@/components/UnpaidInvoicesDashboard';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { ThemeFloatingButton } from '@/components/ThemeFloatingButton';
import { AIChatbot } from '@/components/AIChatbot';
import { SmartAlerts } from '@/components/SmartAlerts';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Shield } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Index = () => {
  const { user, signOut } = useAuth();
  const { role, canAccess, permissions, loading: roleLoading } = useUserRole();
  const [activeModule, setActiveModule] = useState('dashboard');

  // Redirect to allowed module if current is not accessible
  useEffect(() => {
    if (!roleLoading && !canAccess(activeModule)) {
      setActiveModule('dashboard');
    }
  }, [activeModule, canAccess, roleLoading]);

  const handleNewSale = () => setActiveModule('sales');
  const handleNewProduct = () => setActiveModule('stock');
  const handleNewClient = () => setActiveModule('clients');

  const handleModuleChange = (module: string) => {
    if (canAccess(module)) {
      setActiveModule(module);
    }
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const renderActiveModule = () => {
    // Check permission before rendering
    if (!canAccess(activeModule) && activeModule !== 'dashboard') {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p className="text-muted-foreground max-w-md">
            Vous n'avez pas les permissions nécessaires pour accéder à ce module.
            Contactez votre administrateur pour plus d'informations.
          </p>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockModule onNavigateToPurchases={() => setActiveModule('purchases')} />;
      case 'sales':
        return <SalesModule />;
      case 'clients':
        return <ClientsModule />;
      case 'purchases':
        return <PurchasesModule />;
      case 'suppliers':
        return <SuppliersModule />;
      case 'promotions':
        return <PromotionsModule />;
      case 'returns':
        return <ReturnsModule />;
      case 'export':
        return <ExportModule />;
      case 'invoices':
        return <UnpaidInvoicesDashboard />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        <Sidebar activePage={activeModule} onPageChange={handleModuleChange} userRole={role} permissions={permissions} />
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Hidden on mobile */}
        <header className="hidden lg:flex bg-card border-b border-border px-6 py-4 flex-shrink-0 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">StockPro Manager</h1>
            <p className="text-sm text-muted-foreground">Tableau de bord intelligent</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
              <Badge variant="outline" className="capitalize">
                {role}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </header>

        {/* Main Content - Only this scrolls */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6 pb-28 lg:pb-6">
          <div className="max-w-7xl mx-auto animate-fade-in" key={activeModule}>
            {renderActiveModule()}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation activePage={activeModule} onPageChange={handleModuleChange} userRole={role} permissions={permissions} />
      
      {/* Floating Action Button - Mobile only */}
      <FloatingActionButton
        onNewSale={handleNewSale}
        onNewProduct={handleNewProduct}
        onNewClient={handleNewClient}
      />
      
      {/* Theme Floating Button - Always visible */}
      <ThemeFloatingButton />
      
      {/* Smart AI Alerts */}
      <SmartAlerts />
      
      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default Index;
