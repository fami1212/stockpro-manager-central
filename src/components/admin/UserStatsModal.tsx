import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, ShoppingCart, MessageSquare, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
}

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

interface UserSalesStats {
  totalSales: number;
  totalAmount: number;
  commission: number;
  lastSale: string | null;
  salesByMonth: { month: string; count: number; amount: number }[];
}

export function UserStatsModal({ open, onOpenChange, userId, userName, userEmail, userPhone }: UserStatsModalProps) {
  const [stats, setStats] = useState<UserSalesStats | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'whatsapp' | 'email'>('email');

  useEffect(() => {
    if (open && userId) {
      fetchUserStats();
      fetchUserProfile();
    }
  }, [open, userId]);

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      
      // Fetch user's sales without over-restrictive status filter
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching sales:', error);
        throw error;
      }

      console.log(`Found ${sales?.length || 0} sales for user ${userId}`, sales);

      // Calculate statistics
      const totalSales = sales?.length || 0;
      const totalAmount = sales?.reduce((sum: number, sale: any) => {
        const saleTotal = Number(sale.total) || 0;
        return sum + saleTotal;
      }, 0) || 0;
      const commission = totalAmount * 0.05; // 5% commission
      
      // Get last sale
      const lastSale = sales?.length > 0 
        ? sales.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null;

      // Group by month for trends
      const salesByMonth = sales?.reduce((acc: any[], sale: any) => {
        const saleDate = new Date(sale.date);
        const month = format(saleDate, 'MMM yyyy', { locale: fr });
        const saleAmount = Number(sale.total) || 0;
        
        const existing = acc.find(item => item.month === month);
        if (existing) {
          existing.count += 1;
          existing.amount += saleAmount;
        } else {
          acc.push({ month, count: 1, amount: saleAmount });
        }
        return acc;
      }, []) || [];

      const statsData = {
        totalSales,
        totalAmount,
        commission,
        lastSale,
        salesByMonth: salesByMonth.slice(-6) // Last 6 months
      };

      console.log('Calculated stats:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques utilisateur',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCommissionMessage = () => {
    if (!stats) return '';
    
    const formattedCommission = stats.commission.toLocaleString();
    const formattedTotal = stats.totalAmount.toLocaleString();
    
    return `Bonjour ${userName},

Nous espérons que vous vous portez bien et que notre plateforme StockPro Manager continue de répondre à vos besoins.

📊 Vos statistiques de vente :
• Total des ventes : ${stats.totalSales} transactions
• Chiffre d'affaires total : ${formattedTotal} CFA
• Commission StockPro (5%) : ${formattedCommission} CFA

💰 Commission à régler :
Selon nos calculs, votre commission s'élève à ${formattedCommission} CFA pour l'utilisation de notre plateforme.

📱 Pour effectuer le paiement :
• Mobile Money : [Numéro à spécifier]
• Virement bancaire : [Coordonnées à spécifier]
• Référence : COMMISSION-${userId.slice(0, 8)}

Merci de votre confiance et de votre partenariat avec StockPro Manager.

Cordialement,
L'équipe StockPro Manager`;
  };

  const sendMessage = (overrideType?: 'whatsapp' | 'email') => {
    const channel = overrideType ?? messageType;
    const messageContent = message || generateCommissionMessage();
    const actualUserEmail = (userProfile?.email || userEmail || '').trim();
    const actualUserPhone = (userProfile?.phone || userPhone || '').toString().trim();

    const normalizeInternationalPhone = (input: string): string | null => {
      if (!input) return null;
      const trimmed = input.trim();
      if (trimmed.startsWith('+')) {
        const digits = trimmed.slice(1).replace(/\D/g, '');
        return digits.length >= 8 && digits.length <= 15 ? digits : null;
      }
      let digits = trimmed.replace(/\D/g, '');
      if (digits.startsWith('00')) digits = digits.slice(2);
      if (digits.length >= 8 && digits.length <= 15) return digits;
      return null;
    };

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    const openInNewTab = (url: string) => {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    const openSelf = (url: string) => {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_self';
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    if (channel === 'whatsapp') {
      const intl = normalizeInternationalPhone(actualUserPhone);
      const encoded = encodeURIComponent(messageContent);

      // Prefer deep-link on mobile (opens native app), fallback to Web WhatsApp
      if (isMobile) {
        const appUrl = intl
          ? `whatsapp://send?phone=${intl}&text=${encoded}`
          : `whatsapp://send?text=${encoded}`;
        // Try opening the app, then fallback to web after a short delay
        openSelf(appUrl);
        setTimeout(() => {
          const webUrl = intl
            ? `https://web.whatsapp.com/send?phone=${intl}&text=${encoded}`
            : `https://web.whatsapp.com/send?text=${encoded}`;
          openInNewTab(webUrl);
        }, 1200);
      } else {
        // Desktop: open Web WhatsApp in new tab (api.whatsapp.com is often blocked)
        const webUrl = intl
          ? `https://web.whatsapp.com/send?phone=${intl}&text=${encoded}`
          : `https://web.whatsapp.com/send?text=${encoded}`;
        openInNewTab(webUrl);
      }

      if (!intl) {
        toast({
          title: 'Attention',
          description: "Numéro invalide ou manquant. Ouverture d'un message WhatsApp sans destinataire.",
          variant: 'destructive',
        });
      }
    } else {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(actualUserEmail);
      if (!isValidEmail) {
        toast({ title: 'Erreur', description: "Email indisponible pour cet utilisateur", variant: 'destructive' });
        return;
      }
      const emailUrl = `mailto:${actualUserEmail}?subject=${encodeURIComponent('Commission StockPro Manager')}&body=${encodeURIComponent(messageContent)}`;
      // Open in new tab to avoid iframe navigation issues
      openInNewTab(emailUrl);
    }

    toast({
      title: 'Action lancée',
      description: `${channel === 'whatsapp' ? 'WhatsApp' : 'Email'} ouvert avec le message (selon votre appareil).`,
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chargement</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            Chargement des statistiques...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Statistiques de {userName}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="commission">Commission & Message</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ventes</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSales || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    transactions réalisées
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(stats?.totalAmount || 0).toLocaleString()} CFA</div>
                  <p className="text-xs text-muted-foreground">
                    montant total des ventes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commission (5%)</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{(stats?.commission || 0).toLocaleString()} CFA</div>
                  <p className="text-xs text-muted-foreground">
                    commission à percevoir
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dernière Vente</CardTitle>
                  <Badge variant="outline">
                    {stats?.lastSale ? format(new Date(stats.lastSale), 'dd/MM/yyyy', { locale: fr }) : 'Aucune'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {stats?.lastSale ? 'Vente récente' : 'Pas de vente enregistrée'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sales by Month */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Ventes (6 derniers mois)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.salesByMonth.map((monthData, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{monthData.month}</span>
                      <div className="text-right">
                        <div className="text-sm">{monthData.count} ventes</div>
                        <div className="text-xs text-muted-foreground">{monthData.amount.toLocaleString()} CFA</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="commission" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Commission et Facturation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">{(stats?.commission || 0).toLocaleString()} CFA</div>
                    <div className="text-sm text-muted-foreground">Commission à facturer</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">{(stats?.totalAmount || 0).toLocaleString()} CFA</div>
                    <div className="text-sm text-muted-foreground">Chiffre d'affaires total</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold">5%</div>
                    <div className="text-sm text-muted-foreground">Taux de commission</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Type de message</Label>
                  <Tabs value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                    <TabsList>
                      <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </TabsTrigger>
                      <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        WhatsApp
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message personnalisé (optionnel)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={generateCommissionMessage()}
                      rows={10}
                      className="min-h-[200px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Laissez vide pour utiliser le message automatique de commission
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button onClick={() => sendMessage('email')} className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer via Email
                    </Button>
                    <Button onClick={() => sendMessage('whatsapp')} variant="secondary" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Envoyer via WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}