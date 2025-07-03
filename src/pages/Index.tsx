
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-0 min-w-0">
        <div className="p-4 lg:p-6">
          <header className="mb-6 lg:mb-8 pt-12 lg:pt-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">StockPro Manager</h1>
            <p className="text-gray-600 mt-2 text-sm lg:text-base">Votre solution complète de gestion d'entreprise</p>
          </header>
          
          <div className="w-full overflow-x-hidden">
            {renderActiveModule()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
