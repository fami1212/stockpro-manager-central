
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { StockModule } from '@/components/StockModule';
import { SalesModule } from '@/components/SalesModule';
import { ClientsModule } from '@/components/ClientsModule';

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
      case 'clients':
        return <ClientsModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">StockPro Manager</h1>
            <p className="text-gray-600 mt-2">Votre solution complète de gestion d'entreprise</p>
          </header>
          {renderActiveModule()}
        </div>
      </main>
    </div>
  );
};

export default Index;
