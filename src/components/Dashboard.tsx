
import { useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { SalesChart } from '@/components/SalesChart';
import { StockAlerts } from '@/components/StockAlerts';
import { TopProducts } from '@/components/TopProducts';
import { SmartDashboard } from '@/components/SmartDashboard';
import { AIAssistant } from '@/components/AIAssistant';
import { PredictiveAnalytics } from '@/components/PredictiveAnalytics';
import { IntelligentReports } from '@/components/IntelligentReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, BarChart3, FileText } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Tabs pour organiser les vues */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="smart">
            <Brain className="w-4 h-4 mr-2" />
            Smart Dashboard
          </TabsTrigger>
          <TabsTrigger value="ai-assistant">
            <Brain className="w-4 h-4 mr-2" />
            Assistant IA
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <TrendingUp className="w-4 h-4 mr-2" />
            Prédictions
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Rapports IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 lg:space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricCard
              title="Chiffre d'affaires"
              value="€45,231"
              change="+12.5%"
              changeType="positive"
              description="Ce mois"
            />
            <MetricCard
              title="Ventes totales"
              value="1,234"
              change="+8.2%"
              changeType="positive"
              description="Ce mois"
            />
            <MetricCard
              title="Produits en stock"
              value="856"
              change="-2.4%"
              changeType="negative"
              description="Articles"
            />
            <MetricCard
              title="Clients actifs"
              value="342"
              change="+15.3%"
              changeType="positive"
              description="Ce mois"
            />
          </div>

          {/* Charts and Alerts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            <SalesChart />
            <StockAlerts />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            <TopProducts />
            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100 space-y-1 sm:space-y-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nouvelle vente #1234</p>
                    <p className="text-xs text-gray-500">Client: Marie Dupont</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium self-start">€234.50</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100 space-y-1 sm:space-y-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Stock ajouté</p>
                    <p className="text-xs text-gray-500">Produit: iPhone 15</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium self-start">+50 unités</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 space-y-1 sm:space-y-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nouveau client</p>
                    <p className="text-xs text-gray-500">Pierre Martin</p>
                  </div>
                  <span className="text-sm text-gray-600 self-start">Il y a 2h</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="smart">
          <SmartDashboard />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIAssistant />
        </TabsContent>

        <TabsContent value="predictions">
          <PredictiveAnalytics />
        </TabsContent>

        <TabsContent value="reports">
          <IntelligentReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};
