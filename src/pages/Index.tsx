
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
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');

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
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar activePage={activeModule} onPageChange={setActiveModule} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Hidden on mobile */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">StockPro Manager</h1>
              <p className="text-sm text-gray-600">Tableau de bord intelligent - Données personnalisées</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
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
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveModule()}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation activePage={activeModule} onPageChange={setActiveModule} />
    </div>
  );
};

export default Index;
