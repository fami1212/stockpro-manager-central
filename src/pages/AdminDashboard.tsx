import { useState } from 'react';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { RealSubscriptionsManagement } from '@/components/admin/RealSubscriptionsManagement';
import { AdminStats } from '@/components/admin/AdminStats';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { PermissionsManagement } from '@/components/admin/PermissionsManagement';
import { ModulePermissionsManagement } from '@/components/admin/ModulePermissionsManagement';
import { AdvancedAnalytics } from '@/components/admin/AdvancedAnalytics';
import { AuditLogs } from '@/components/admin/AuditLogs';
import { AdminRoute } from '@/components/AdminRoute';
import { CreateAdminButton } from '@/components/CreateAdminButton';
import { Settings, Users, CreditCard, BarChart3, Shield, Activity, TrendingUp, Server, LineChart, GitBranch, Lock, Menu, X, ArrowLeft } from 'lucide-react';
import { SystemHealthMonitoring } from '@/components/admin/SystemHealthMonitoring';
import { PerformanceAnalytics } from '@/components/admin/PerformanceAnalytics';
import { VersionManagement } from '@/components/admin/VersionManagement';
import { CronJobsManagement } from '@/components/admin/CronJobsManagement';
import { ApplicationLogs } from '@/components/admin/ApplicationLogs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { id: 'stats', label: 'Statistiques', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'performance', label: 'Performance', icon: LineChart },
  { id: 'health', label: 'Santé Système', icon: Server },
  { id: 'versions', label: 'Versions', icon: GitBranch },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'modules', label: 'Modules', icon: Lock },
  { id: 'audit', label: 'Audit Logs', icon: Activity },
  { id: 'subscriptions', label: 'Abonnements', icon: CreditCard },
  { id: 'settings', label: 'Paramètres', icon: Settings },
  { id: 'cron', label: 'Cron Jobs', icon: Activity },
  { id: 'logs', label: 'App Logs', icon: Activity },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'performance':
        return <PerformanceAnalytics />;
      case 'health':
        return <SystemHealthMonitoring />;
      case 'versions':
        return <VersionManagement />;
      case 'users':
        return <UsersManagement />;
      case 'permissions':
        return <PermissionsManagement />;
      case 'modules':
        return <ModulePermissionsManagement />;
      case 'audit':
        return <AuditLogs />;
      case 'subscriptions':
        return <RealSubscriptionsManagement />;
      case 'settings':
        return <SystemSettings />;
      case 'cron':
        return <CronJobsManagement />;
      case 'logs':
        return <ApplicationLogs />;
      default:
        return <AdminStats />;
    }
  };

  const activeMenuItem = menuItems.find(item => item.id === activeTab);

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300 lg:relative",
            sidebarOpen ? "w-64" : "w-0 lg:w-16"
          )}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">Admin</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-8 w-8"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Back to App */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-2",
                !sidebarOpen && "justify-center px-2"
              )}
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              {sidebarOpen && <span>Retour à l'app</span>}
            </Button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:ml-0" : "lg:ml-0"
        )}>
          {/* Top Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {activeMenuItem?.label || 'Administration'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gestion StockPro Manager
                </p>
              </div>
            </div>
            <CreateAdminButton />
          </header>

          {/* Page Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </AdminRoute>
  );
}
