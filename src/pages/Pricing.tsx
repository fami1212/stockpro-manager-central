import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, X, ArrowLeft, Sparkles, Zap, Crown, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoImg from '@/assets/logo.png';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: string[];
  allowed_modules: string[];
  has_ai_access: boolean;
  has_full_ai: boolean;
  max_products: number | null;
  max_sales: number | null;
  sort_order: number;
}

const planIcons: Record<string, React.ReactNode> = {
  trial: <Leaf className="w-6 h-6" />,
  basique: <Zap className="w-6 h-6" />,
  pro: <Sparkles className="w-6 h-6" />,
  premium: <Crown className="w-6 h-6" />,
};

const planColors: Record<string, string> = {
  trial: 'border-muted',
  basique: 'border-info/50',
  pro: 'border-primary/50',
  premium: 'border-warning/50',
};

const planHighlight: Record<string, boolean> = {
  trial: false,
  basique: false,
  pro: true,
  premium: false,
};

const allModules = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'stock', label: 'Gestion de stock' },
  { id: 'sales', label: 'Ventes' },
  { id: 'clients', label: 'Clients' },
  { id: 'purchases', label: 'Achats' },
  { id: 'suppliers', label: 'Fournisseurs' },
  { id: 'invoices', label: 'Factures' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'returns', label: 'Retours produits' },
  { id: 'export', label: 'Export de données' },
  { id: 'reports', label: 'Rapports intelligents' },
  { id: 'settings', label: 'Paramètres' },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (data) {
        setPlans(data.map((p: any) => ({
          ...p,
          features: Array.isArray(p.features) ? p.features : [],
          allowed_modules: Array.isArray(p.allowed_modules) ? p.allowed_modules : [],
        })));
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="StockPlant" className="w-8 h-8" />
            <span className="text-xl font-bold text-foreground">StockPlant</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <Button size="sm" onClick={() => navigate('/login')}>
              Se connecter
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Des solutions adaptées à chaque taille d'entreprise. Commencez avec un essai gratuit, puis évoluez selon vos besoins.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-muted rounded-full p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                billing === 'monthly' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                billing === 'yearly' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annuel
              <Badge variant="secondary" className="ml-2 text-[10px]">-17%</Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map(plan => {
            const isHighlighted = planHighlight[plan.name];
            const price = billing === 'monthly' ? plan.price_monthly : Math.round(plan.price_yearly / 12);

            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col transition-all hover:shadow-lg",
                  planColors[plan.name] || 'border-border',
                  isHighlighted && "border-2 shadow-lg scale-[1.02]"
                )}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md">
                      Populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={cn(
                    "mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                    plan.name === 'trial' && "bg-muted text-muted-foreground",
                    plan.name === 'basique' && "bg-info/10 text-info",
                    plan.name === 'pro' && "bg-primary/10 text-primary",
                    plan.name === 'premium' && "bg-warning/10 text-warning",
                  )}>
                    {planIcons[plan.name] || <Zap className="w-6 h-6" />}
                  </div>
                  <CardTitle className="text-lg">{plan.display_name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    {plan.price_monthly === 0 ? (
                      <div className="text-3xl font-bold text-foreground">Gratuit</div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-foreground">
                          {formatPrice(price)}
                          <span className="text-sm font-normal text-muted-foreground ml-1">XOF/mois</span>
                        </div>
                        {billing === 'yearly' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatPrice(plan.price_yearly)} XOF/an
                          </p>
                        )}
                      </>
                    )}
                    {plan.name === 'trial' && (
                      <p className="text-xs text-muted-foreground mt-1">Période d'essai de 4 jours</p>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{f}</span>
                      </div>
                    ))}
                    {plan.max_products !== null && (
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{plan.max_products} produits max</span>
                      </div>
                    )}
                    {plan.max_sales !== null && (
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{plan.max_sales} ventes max</span>
                      </div>
                    )}
                    {plan.max_products === null && plan.name !== 'trial' && (
                      <div className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">Produits illimités</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={isHighlighted ? 'default' : 'outline'}
                    onClick={() => navigate('/register')}
                  >
                    {plan.name === 'trial' ? 'Essai gratuit' : 'Commencer'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Modules comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Comparaison détaillée des modules
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Module</th>
                  {plans.map(p => (
                    <th key={p.id} className="text-center py-3 px-4 text-sm font-medium text-foreground">
                      {p.display_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allModules.map(m => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-4 text-sm text-foreground">{m.label}</td>
                    {plans.map(p => (
                      <td key={p.id} className="text-center py-2.5 px-4">
                        {p.allowed_modules.includes(m.id) ? (
                          <Check className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-4 text-sm text-foreground">IA basique</td>
                  {plans.map(p => (
                    <td key={p.id} className="text-center py-2.5 px-4">
                      {p.has_ai_access ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-muted/30">
                  <td className="py-2.5 px-4 text-sm text-foreground">IA avancée</td>
                  {plans.map(p => (
                    <td key={p.id} className="text-center py-2.5 px-4">
                      {p.has_full_ai ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-12 bg-muted/30 rounded-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-3">Prêt à commencer ?</h2>
          <p className="text-muted-foreground mb-6">Essayez StockPlant gratuitement pendant 4 jours, sans engagement.</p>
          <Button size="lg" onClick={() => navigate('/register')}>
            Démarrer l'essai gratuit
          </Button>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} StockPlant. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
