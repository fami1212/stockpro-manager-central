import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SubscriptionPlan {
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
  is_active: boolean;
  sort_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trial_start: string;
  trial_end: string;
  subscription_start: string | null;
  subscription_end: string | null;
  payment_method: string;
  plan?: SubscriptionPlan;
}

export function useSubscription() {
  const { user, isAdmin } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch user subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
      }

      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (plansError) {
        console.error('Error fetching plans:', plansError);
      }

      const parsedPlans = (plansData || []).map((p: any) => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : [],
        allowed_modules: Array.isArray(p.allowed_modules) ? p.allowed_modules : [],
      }));

      setPlans(parsedPlans);

      if (subData) {
        const plan = parsedPlans.find((p: any) => p.id === subData.plan_id);
        setSubscription({ ...subData, plan } as UserSubscription);
      } else if (!isAdmin) {
        // No subscription found - create trial
        const trialPlan = parsedPlans.find((p: any) => p.name === 'trial');
        if (trialPlan) {
          const { data: newSub } = await supabase
            .from('user_subscriptions' as any)
            .insert({
              user_id: user.id,
              plan_id: trialPlan.id,
              status: 'trial',
              trial_start: new Date().toISOString(),
              trial_end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            } as any)
            .select()
            .maybeSingle();

          if (newSub) {
            setSubscription({ ...newSub, plan: trialPlan } as UserSubscription);
          }
        }
      }
    } catch (error) {
      console.error('Error in subscription hook:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isTrialExpired = useCallback((): boolean => {
    if (!subscription) return false;
    if (subscription.status === 'active') return false;
    if (subscription.status === 'trial') {
      return new Date(subscription.trial_end) < new Date();
    }
    return subscription.status === 'expired';
  }, [subscription]);

  const isActive = useCallback((): boolean => {
    if (isAdmin) return true;
    if (!subscription) return false;
    if (subscription.status === 'active') return true;
    if (subscription.status === 'trial') {
      return new Date(subscription.trial_end) >= new Date();
    }
    return false;
  }, [subscription, isAdmin]);

  const hasFullAI = useCallback((): boolean => {
    if (isAdmin) return true;
    return subscription?.plan?.has_full_ai || false;
  }, [subscription, isAdmin]);

  const hasAIAccess = useCallback((): boolean => {
    if (isAdmin) return true;
    return subscription?.plan?.has_ai_access || false;
  }, [subscription, isAdmin]);

  const trialDaysRemaining = useCallback((): number => {
    if (!subscription || subscription.status !== 'trial') return 0;
    const end = new Date(subscription.trial_end);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  return {
    subscription,
    plans,
    loading,
    isTrialExpired: isTrialExpired(),
    isActive: isActive(),
    hasFullAI: hasFullAI(),
    hasAIAccess: hasAIAccess(),
    trialDaysRemaining: trialDaysRemaining(),
    refetch: fetchSubscription,
    currentPlanName: subscription?.plan?.name || 'trial',
  };
}
