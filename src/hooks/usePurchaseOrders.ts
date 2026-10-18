
import { useState, useEffect } from 'react'
import { preparePurchase } from '@/lib/purchaseOrderInput'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface PurchaseOrder {
  id: string
  reference: string
  supplier_id: string
  date: string
  expected_date: string
  status: 'En cours' | 'Reçue' | 'Facturée' | 'Annulée'
  total: number
  notes: string
  user_id: string
  created_at: string
  updated_at: string
  supplier?: { name: string }
  purchase_order_items?: any[]
}

export function usePurchaseOrders() {
  const { user } = useAuth()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchPurchaseOrders()
  }, [user])

  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:supplier:suppliers(name),
          purchase_order_items(*, products(name))
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match PurchaseOrder interface
      const transformedData: PurchaseOrder[] = (data || []).map(order => ({
        ...order,
        supplier: order.supplier, // This now contains the supplier name
        status: order.status as 'En cours' | 'Reçue' | 'Facturée' | 'Annulée'
      }))

      setPurchaseOrders(transformedData)
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPurchaseOrder = async (orderData: any) => {
    try {
      if (!user) throw new Error('Veuillez vous reconnecter.');
      const prepared = preparePurchase(orderData);
      const reference = orderData.reference || `PO-${Date.now()}`
      const dbOrderData = {
        reference,
        supplier_id: orderData.supplier_id,
        date: orderData.date || new Date().toISOString().split('T')[0],
        expected_date: prepared.expected_date,
        status: orderData.status || 'En cours',
        total: prepared.total,
        notes: orderData.notes || '',
        user_id: user?.id
      }

      const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .insert([dbOrderData])
        .select(`
          *,
          supplier:suppliers(name),
          purchase_order_items(*, products(name))
        `)
        .single()

      if (orderError) throw orderError

      // Add order items if they exist
      if (prepared.items.length > 0) {
        const orderItems = prepared.items.map((item) => ({
          purchase_order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total
        }))

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(orderItems)

        if (itemsError) {
          await supabase.from('purchase_orders').delete().eq('id', order.id).eq('user_id', user.id);
          throw itemsError;
        }
      }

      await fetchPurchaseOrders()
      toast({
        title: 'Commande créée',
        description: `La commande ${reference} a été créée avec succès.`
      })
      return order
    } catch (error) {
      console.error('Error adding purchase order:', error)
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : (error as { message?: string })?.message || 'Impossible d’ajouter la commande',
        variant: 'destructive'
      })
      throw error
    }
  }

  return {
    purchaseOrders,
    loading,
    addPurchaseOrder,
    refetch: fetchPurchaseOrders
  }
}
