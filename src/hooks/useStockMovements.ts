
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface StockMovement {
  id: string;
  user_id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment' | 'return' | 'sale' | 'purchase';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason: string;
  reference?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  products?: {
    name: string;
    reference: string;
  };
}

export function useStockMovements() {
  const { user } = useAuth();
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchStockMovements();
  }, [user]);

  const fetchStockMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products(name, reference)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure the data matches our interface
      const typedData = (data || []).map(movement => ({
        ...movement,
        type: movement.type as StockMovement['type']
      })) as StockMovement[];
      
      setStockMovements(typedData);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les mouvements de stock',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addStockMovement = async (movementData: {
    product_id: string;
    type: 'in' | 'out' | 'adjustment' | 'return';
    quantity: number;
    reason: string;
    reference?: string;
    notes?: string;
  }) => {
    try {
      // Get current product stock and alert threshold
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock, alert_threshold')
        .eq('id', movementData.product_id)
        .eq('user_id', user?.id)
        .single();

      if (productError) throw productError;

      const previousStock = product.stock;
      let newStock = previousStock;

      // Calculate new stock based on movement type
      switch (movementData.type) {
        case 'in':
        case 'return':
          newStock = previousStock + movementData.quantity;
          break;
        case 'out':
          newStock = Math.max(0, previousStock - movementData.quantity);
          break;
        case 'adjustment':
          newStock = movementData.quantity; // For adjustments, quantity is the new stock level
          break;
      }

      // Insert stock movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          user_id: user?.id,
          product_id: movementData.product_id,
          type: movementData.type,
          quantity: movementData.type === 'adjustment' ? 
            Math.abs(newStock - previousStock) : movementData.quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          reason: movementData.reason,
          reference: movementData.reference,
          notes: movementData.notes,
          created_by: user?.id
        }]);

      if (movementError) throw movementError;

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          status: newStock <= 0 ? 'Rupture' : newStock <= (product.alert_threshold || 5) ? 'Stock bas' : 'En stock'
        })
        .eq('id', movementData.product_id)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      await fetchStockMovements();
      toast({
        title: 'Mouvement enregistré',
        description: 'Le mouvement de stock a été enregistré avec succès.'
      });

    } catch (error) {
      console.error('Error adding stock movement:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le mouvement de stock',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    stockMovements,
    loading,
    addStockMovement,
    refetch: fetchStockMovements
  };
}
