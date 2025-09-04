
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { RealSubscriptionsManagement } from '@/components/admin/RealSubscriptionsManagement';
import { AdminStats } from '@/components/admin/AdminStats';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { AdminRoute } from '@/components/AdminRoute';
import { CreateAdminButton } from '@/components/CreateAdminButton';
import { Settings, Users, CreditCard, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Administration</h1>
                <p className="text-muted-foreground mt-2">
                  Gérez les utilisateurs, abonnements et paramètres de StockPro Manager
                </p>
              </div>
              <CreateAdminButton />
            </div>
          </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Abonnements
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="subscriptions">
            <RealSubscriptionsManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
}
