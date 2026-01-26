import { useState } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Package, 
  Users, 
  ShoppingCart,
  Settings,
  X,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  critical: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', badge: 'destructive' },
  warning: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', badge: 'secondary' },
  opportunity: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', badge: 'default' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', badge: 'outline' },
} as const;

const CATEGORY_ICONS = {
  stock: Package,
  sales: ShoppingCart,
  clients: Users,
  system: Settings,
} as const;

export function NotificationCenter() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const filteredNotifications = notifications.filter(n => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
    return true;
  });

  const handleViewDetails = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handleFilterChange = (type: 'type' | 'category', value: string) => {
    if (type === 'type') {
      setTypeFilter(value);
    } else {
      setCategoryFilter(value);
    }
    
    const filters: Record<string, unknown> = {};
    if (type === 'type' && value !== 'all') filters.type = value;
    if (type === 'category' && value !== 'all') filters.category = value;
    if (typeFilter !== 'all' && type !== 'type') filters.type = typeFilter;
    if (categoryFilter !== 'all' && type !== 'category') filters.category = categoryFilter;
    
    fetchNotifications(filters as { type?: string; category?: string });
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount} non lues</Badge>
                )}
              </SheetTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Tout marquer lu
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={(v) => handleFilterChange('type', v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="warning">Avertissement</SelectItem>
                  <SelectItem value="opportunity">Opportunité</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={(v) => handleFilterChange('category', v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="sales">Ventes</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-200px)] mt-4 pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Details Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = TYPE_CONFIG[selectedNotification.type];
                    const Icon = config.icon;
                    return <Icon className={cn('h-5 w-5', config.color)} />;
                  })()}
                  <DialogTitle>{selectedNotification.title}</DialogTitle>
                </div>
                <DialogDescription>
                  {formatDistanceToNow(new Date(selectedNotification.created_at), { 
                    addSuffix: true, 
                    locale: fr 
                  })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm text-foreground">{selectedNotification.description}</p>
                
                {selectedNotification.details && Object.keys(selectedNotification.details).length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Détails</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2 text-sm">
                        {Object.entries(selectedNotification.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <dt className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</dt>
                            <dd className="font-medium">{String(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex gap-2">
                  <Badge variant={TYPE_CONFIG[selectedNotification.type].badge as 'default' | 'secondary' | 'destructive' | 'outline'}>
                    {selectedNotification.type}
                  </Badge>
                  <Badge variant="outline">
                    {selectedNotification.category}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (notification: Notification) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete, onViewDetails }: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.info;
  const TypeIcon = config.icon || Info;
  const CategoryIcon = CATEGORY_ICONS[notification.category] || Settings;

  return (
    <Card className={cn(
      'transition-all hover:shadow-md cursor-pointer',
      !notification.is_read && 'border-l-4 border-l-primary bg-accent/30'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-full shrink-0', config.bg)}>
            <TypeIcon className={cn('h-4 w-4', config.color)} />
          </div>
          
          <div className="flex-1 min-w-0" onClick={() => onViewDetails(notification)}>
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                'font-medium text-sm truncate',
                !notification.is_read && 'font-semibold'
              )}>
                {notification.title}
              </h4>
              <CategoryIcon className="h-3 w-3 text-muted-foreground shrink-0" />
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2">
              {notification.description}
            </p>
            
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(notification.created_at), { 
                addSuffix: true, 
                locale: fr 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(notification);
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
