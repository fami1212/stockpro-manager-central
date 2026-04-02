import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star, Clock, Package } from 'lucide-react';
import { useSubscription, SubscriptionPlan } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function SubscriptionWall() {
  const { plans, trialDaysRemaining, subscription } = useSubscription();
  const { user, signOut } = useAuth();
  const [requesting, setRequesting] = useState<string | null>(null);

  const planIcons: Record<string, any> = {
    trial: Clock,
    basique: Package,
    pro: Zap,
    premium: Crown,
  };

  const planColors: Record<string, string> = {
    basique: 'border-green-500 shadow-green-100',
    pro: 'border-blue-500 shadow-blue-100',
    premium: 'border-amber-500 shadow-amber-100',
  };

  const handleRequestPlan = async (plan: SubscriptionPlan) => {
    if (!user) return;
    setRequesting(plan.id);

    try {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Demande d\'abonnement',
        description: `Demande de passage au plan ${plan.display_name}`,
        type: 'info',
        category: 'subscription',
        details: {
          plan_name: plan.name,
          plan_id: plan.id,
          user_email: user.email,
          requested_at: new Date().toISOString(),
        },
      });

      toast.success(`Demande envoyée pour le plan ${plan.display_name}. L'administrateur sera notifié.`);
    } catch (error) {
      console.error('Error requesting plan:', error);
      toast.error('Erreur lors de la demande');
    } finally {
      setRequesting(null);
    }
  };

  const displayPlans = plans.filter(p => p.name !== 'trial');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Star className="h-8 w-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-foreground">
              Votre période d'essai est terminée
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {trialDaysRemaining > 0
              ? `Il vous reste ${trialDaysRemaining} jour(s) d'essai. Choisissez un plan pour continuer.`
              : 'Choisissez un plan pour continuer à utiliser StockPlant.'}
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {displayPlans.map((plan) => {
            const Icon = planIcons[plan.name] || Zap;
            const isPopular = plan.name === 'pro';

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg border-2 ${planColors[plan.name] || 'border-border'}`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAIRE
                  </div>
                )}
                {plan.name === 'premium' && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    COMPLET
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>

                  <div className="mt-4">
                    {plan.price_monthly > 0 ? (
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-foreground">
                          {plan.price_monthly.toLocaleString('fr-FR')} <span className="text-lg font-normal text-muted-foreground">{plan.currency}/mois</span>
                        </p>
                        {plan.price_yearly > 0 && (
                          <p className="text-sm text-muted-foreground">
                            ou {plan.price_yearly.toLocaleString('fr-FR')} {plan.currency}/an
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xl font-semibold text-muted-foreground">
                        Contactez l'administrateur
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {(plan.features as string[]).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                    {!plan.has_ai_access && (
                      <li className="flex items-start gap-3 opacity-50">
                        <span className="h-5 w-5 mt-0.5 flex-shrink-0 text-center">✕</span>
                        <span className="text-sm">Accès IA</span>
                      </li>
                    )}
                    {plan.has_ai_access && !plan.has_full_ai && (
                      <li className="flex items-start gap-3 opacity-50">
                        <span className="h-5 w-5 mt-0.5 flex-shrink-0 text-center">✕</span>
                        <span className="text-sm">IA complète (analyses avancées)</span>
                      </li>
                    )}
                  </ul>

                  <Button
                    className="w-full mt-4"
                    variant={isPopular ? 'default' : 'outline'}
                    size="lg"
                    disabled={requesting === plan.id}
                    onClick={() => handleRequestPlan(plan)}
                  >
                    {requesting === plan.id ? 'Envoi...' : `Choisir ${plan.display_name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Besoin d'aide ? Contactez votre administrateur pour activer votre abonnement.
          </p>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}