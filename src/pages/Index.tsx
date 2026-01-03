
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
import { Button } from '@/components/ui/button';
import { LogOut, User, Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleNewSale = () => setActiveModule('sales');
  const handleNewProduct = () => setActiveModule('stock');
  const handleNewClient = () => setActiveModule('clients');

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockModule />;
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
        <Sidebar activePage={activeModule} onPageChange={setActiveModule} />
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header - Hidden on mobile */}
        <header className="hidden lg:block bg-card border-b border-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">StockPro Manager</h1>
              <p className="text-sm text-muted-foreground">Tableau de bord intelligent</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
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
      <BottomNavigation activePage={activeModule} onPageChange={setActiveModule} />
      
      {/* Floating Action Button - Mobile only */}
      <FloatingActionButton
        onNewSale={handleNewSale}
        onNewProduct={handleNewProduct}
        onNewClient={handleNewClient}
      />
    </div>
  );
};

export default Index;
