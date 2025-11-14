import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProductReturn {
  id: string;
  user_id: string;
  sale_id?: string;
  product_id?: string;
  quantity: number;
  reason: string;
  refund_amount: number;
  refund_method?: string;
  status: 'En attente' | 'Approuvé' | 'Rejeté' | 'Remboursé';
  notes?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
}

export const useProductReturns = () => {
  const [returns, setReturns] = useState<ProductReturn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturns(data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des retours');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addReturn = async (returnData: Omit<ProductReturn, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('product_returns')
        .insert([{ ...returnData, user_id: userData.user.id }])
        .select()
        .single();

      if (error) throw error;

      // Update stock if approved
      if (returnData.status === 'Approuvé' && returnData.product_id) {
        const { error: stockError } = await supabase.rpc('adjust_product_stock', {
          p_product_id: returnData.product_id,
          p_quantity: returnData.quantity
        });
        if (stockError) console.error('Stock adjustment error:', stockError);
      }

      setReturns([data, ...returns]);
      toast.success('Retour créé avec succès');
      return data;
    } catch (err: any) {
      toast.error('Erreur lors de la création du retour');
      throw err;
    }
  };

  const updateReturn = async (id: string, updates: Partial<ProductReturn>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const updateData: any = { ...updates };
      if (updates.status === 'Approuvé' || updates.status === 'Remboursé') {
        updateData.processed_at = new Date().toISOString();
        updateData.processed_by = userData.user?.id;
      }

      const { data, error } = await supabase
        .from('product_returns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Adjust stock if status changed to approved
      if (updates.status === 'Approuvé' && data.product_id) {
        const { error: stockError } = await supabase.rpc('adjust_product_stock', {
          p_product_id: data.product_id,
          p_quantity: data.quantity
        });
        if (stockError) console.error('Stock adjustment error:', stockError);
      }

      setReturns(returns.map(r => r.id === id ? data : r));
      toast.success('Retour mis à jour');
      return data;
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour');
      throw err;
    }
  };

  const deleteReturn = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_returns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setReturns(returns.filter(r => r.id !== id));
      toast.success('Retour supprimé');
    } catch (err: any) {
      toast.error('Erreur lors de la suppression');
      throw err;
    }
  };

  const getReturnStats = () => {
    const totalReturns = returns.length;
    const pendingReturns = returns.filter(r => r.status === 'En attente').length;
    const approvedReturns = returns.filter(r => r.status === 'Approuvé').length;
    const totalRefunded = returns
      .filter(r => r.status === 'Remboursé')
      .reduce((sum, r) => sum + Number(r.refund_amount), 0);

    return {
      totalReturns,
      pendingReturns,
      approvedReturns,
      totalRefunded
    };
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  return {
    returns,
    loading,
    addReturn,
    updateReturn,
    deleteReturn,
    refetch: fetchReturns,
    getReturnStats
  };
};
