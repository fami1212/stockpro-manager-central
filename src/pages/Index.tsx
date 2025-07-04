
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { StockModule } from '@/components/StockModule';
import { SalesModule } from '@/components/SalesModule';
import { ClientsModule } from '@/components/ClientsModule';
import { PurchasesModule } from '@/components/PurchasesModule';
import { SuppliersModule } from '@/components/SuppliersModule';
import { ReportsModule } from '@/components/ReportsModule';
import { SettingsModule } from '@/components/SettingsModule';
import { cn } from '@/lib/utils';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockModule />;
      case 'sales':
        return <SalesModule />;
      case 'purchases':
        return <PurchasesModule />;
      case 'clients':
        return <ClientsModule />;
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

  const getModuleTitle = () => {
    const titles = {
      dashboard: 'Tableau de Bord',
      stock: 'Gestion de Stock',
      sales: 'Gestion des Ventes',
      purchases: 'Gestion des Achats',
      clients: 'Gestion des Clients',
      suppliers: 'Gestion des Fournisseurs',
      reports: 'Rapports & Analyses',
      settings: 'Paramètres'
    };
    return titles[activeModule as keyof typeof titles] || 'StockPro Manager';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      
      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        // Desktop: account for sidebar
        "lg:pl-72",
        // Mobile: account for top header and bottom nav
        "pt-14 pb-20 lg:pt-0 lg:pb-0"
      )}>
        <div className="px-4 py-6 lg:px-8">
          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {getModuleTitle()}
            </h1>
            <p className="text-gray-600 mt-2 text-sm lg:text-base">
              Votre solution complète de gestion d'entreprise
            </p>
          </header>
          
          {/* Module Content */}
          <div className="w-full">
            {renderActiveModule()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
