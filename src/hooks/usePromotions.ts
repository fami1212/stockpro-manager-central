import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Promotion {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applies_to: 'product' | 'sale' | 'category';
  target_id?: string;
  min_quantity: number;
  min_amount: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data || []);
    } catch (err: any) {
      setError(err);
      toast.error('Erreur lors du chargement des promotions');
    } finally {
      setLoading(false);
    }
  };

  const addPromotion = async (promotion: Omit<Promotion, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('promotions')
        .insert([{ ...promotion, user_id: userData.user.id }])
        .select()
        .single();

      if (error) throw error;
      setPromotions([data, ...promotions]);
      toast.success('Promotion créée avec succès');
      return data;
    } catch (err: any) {
      toast.error('Erreur lors de la création de la promotion');
      throw err;
    }
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>) => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPromotions(promotions.map(p => p.id === id ? data : p));
      toast.success('Promotion mise à jour');
      return data;
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPromotions(promotions.filter(p => p.id !== id));
      toast.success('Promotion supprimée');
    } catch (err: any) {
      toast.error('Erreur lors de la suppression');
      throw err;
    }
  };

  const togglePromotion = async (id: string, isActive: boolean) => {
    return updatePromotion(id, { is_active: isActive });
  };

  const getActivePromotions = () => {
    const now = new Date();
    return promotions.filter(p => {
      if (!p.is_active) return false;
      if (p.start_date && new Date(p.start_date) > now) return false;
      if (p.end_date && new Date(p.end_date) < now) return false;
      return true;
    });
  };

  const getApplicablePromotions = (
    type: 'product' | 'sale' | 'category',
    targetId?: string,
    quantity?: number,
    amount?: number
  ) => {
    return getActivePromotions().filter(p => {
      if (p.applies_to !== type) return false;
      if (targetId && p.target_id && p.target_id !== targetId) return false;
      if (quantity && quantity < p.min_quantity) return false;
      if (amount && amount < p.min_amount) return false;
      return true;
    });
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return {
    promotions,
    loading,
    error,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    refetch: fetchPromotions,
    getActivePromotions,
    getApplicablePromotions
  };
};