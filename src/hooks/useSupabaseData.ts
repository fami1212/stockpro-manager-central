import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export function useProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchProducts()
  }, [user])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, color),
          units(name, symbol),
          product_variants(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData: any) => {
    try {
      console.log('Adding product with data:', productData);
      
      // Laisser reference vide pour que le trigger le génère automatiquement
      const cleanProductData = {
        name: productData.name,
        category_id: productData.category_id,
        unit_id: productData.unit_id,
        stock: productData.stock || 0,
        alert_threshold: productData.alert_threshold || 5,
        buy_price: productData.buy_price || 0,
        sell_price: productData.sell_price || 0,
        status: productData.status || 'En stock',
        user_id: user?.id
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert([cleanProductData])
        .select(`
          *,
          categories(name, color),
          units(name, symbol),
          product_variants(*)
        `)
        .single()

      if (error) {
        console.error('Product insert error:', error);
        throw error;
      }
      
      console.log('Product created successfully:', data);
      await fetchProducts()
      toast({ title: 'Produit ajouté', description: `${productData.name} a été ajouté avec succès.` })
      return data
    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le produit',
        variant: 'destructive'
      })
      throw error
    }
  }

  const updateProduct = async (id: string, productData: any) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      
      await fetchProducts()
      toast({ title: 'Produit modifié', description: 'Le produit a été modifié avec succès.' })
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le produit',
        variant: 'destructive'
      })
      throw error
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      // Vérifier d'abord s'il y a des ventes liées
      const { data: saleItems, error: saleItemsError } = await supabase
        .from('sale_items')
        .select('id')
        .eq('product_id', id)
        .limit(1)

      if (saleItemsError) throw saleItemsError

      if (saleItems && saleItems.length > 0) {
        toast({
          title: 'Suppression impossible',
          description: 'Ce produit est utilisé dans des ventes et ne peut pas être supprimé',
          variant: 'destructive'
        })
        return
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      
      await fetchProducts()
      toast({ title: 'Produit supprimé', description: 'Le produit a été supprimé.' })
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le produit',
        variant: 'destructive'
      })
      throw error
    }
  }

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  }
}

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchCategories()
  }, [user])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (categoryData: any) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ ...categoryData, user_id: user?.id }])

      if (error) throw error
      
      await fetchCategories()
      toast({ title: 'Catégorie ajoutée', description: `${categoryData.name} a été ajoutée avec succès.` })
    } catch (error) {
      console.error('Error adding category:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la catégorie',
        variant: 'destructive'
      })
      throw error
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      
      await fetchCategories()
      toast({ title: 'Catégorie supprimée', description: 'La catégorie a été supprimée.' })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la catégorie',
        variant: 'destructive'
      })
      throw error
    }
  }

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    refetch: fetchCategories
  }
}

export function useClients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchClients()
  }, [user])

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const addClient = async (clientData: any) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, user_id: user?.id }])
        .select()
        .single()

      if (error) throw error
      
      await fetchClients()
      toast({ title: 'Client ajouté', description: `${clientData.name} a été ajouté avec succès.` })
      return data
    } catch (error) {
      console.error('Error adding client:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le client',
        variant: 'destructive'
      })
      throw error
    }
  }

  return {
    clients,
    loading,
    addClient,
    refetch: fetchClients
  }
}

export function useSales() {
  const { user } = useAuth()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchSales()
  }, [user])

  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          clients(name),
          sale_items(*, products(name))
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSale = async (saleData: any) => {
    try {
      console.log('Adding sale with data:', saleData);
      
      // Prepare sale data for database
      const dbSaleData = {
        reference: saleData.reference,
        client_id: saleData.client_id,
        date: saleData.date,
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        tax: saleData.tax,
        total: saleData.total,
        status: saleData.status,
        payment_method: saleData.payment_method,
        user_id: user?.id
      };

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([dbSaleData])
        .select()
        .single()

      if (saleError) {
        console.error('Sale insert error:', saleError);
        throw saleError;
      }

      // Add sale items and update stock automatically
      if (saleData.items && saleData.items.length > 0) {
        const saleItems = saleData.items.map((item: any) => ({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
          total: item.total
        }))

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems)

        if (itemsError) {
          console.error('Sale items insert error:', itemsError);
          throw itemsError;
        }

        // Create stock movements for each sold item
        for (const item of saleData.items) {
          // Get current product stock
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .eq('user_id', user?.id)
            .single();

          if (productError) {
            console.error('Error fetching product stock:', productError);
            continue;
          }

          const previousStock = product.stock;
          const newStock = Math.max(0, previousStock - item.quantity);

          // Update product stock
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              stock: newStock,
              status: newStock <= 0 ? 'Rupture' : 'En stock'
            })
            .eq('id', item.product_id)
            .eq('user_id', user?.id);

          if (updateError) {
            console.error('Error updating product stock:', updateError);
            continue;
          }

          // Create stock movement record
          const { error: movementError } = await supabase
            .from('stock_movements')
            .insert([{
              user_id: user?.id,
              product_id: item.product_id,
              type: 'sale',
              quantity: item.quantity,
              previous_stock: previousStock,
              new_stock: newStock,
              reason: 'Vente',
              reference: sale.reference,
              created_by: user?.id
            }]);

          if (movementError) {
            console.error('Error creating stock movement:', movementError);
          }
        }
      }
      
      await fetchSales()
      toast({ title: 'Vente ajoutée', description: `${saleData.reference} a été ajoutée avec succès.` })
      return sale
    } catch (error) {
      console.error('Error adding sale:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la vente',
        variant: 'destructive'
      })
      throw error
    }
  }

  const updateSale = async (id: string, saleData: any) => {
    try {
      const dbSaleData = {
        reference: saleData.reference,
        client_id: saleData.client_id,
        date: saleData.date,
        subtotal: saleData.subtotal,
        discount: saleData.discount,
        tax: saleData.tax,
        total: saleData.total,
        status: saleData.status,
        payment_method: saleData.payment_method
      };

      const { error } = await supabase
        .from('sales')
        .update(dbSaleData)
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      
      await fetchSales()
      toast({ title: 'Vente modifiée', description: 'La vente a été modifiée avec succès.' })
    } catch (error) {
      console.error('Error updating sale:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la vente',
        variant: 'destructive'
      })
      throw error
    }
  }

  const deleteSale = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      
      await fetchSales()
      toast({ title: 'Vente supprimée', description: 'La vente a été supprimée.' })
    } catch (error) {
      console.error('Error deleting sale:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la vente',
        variant: 'destructive'
      })
      throw error
    }
  }

  return {
    sales,
    loading,
    addSale,
    updateSale,
    deleteSale,
    refetch: fetchSales
  }
}

export function useUnits() {
  const { user } = useAuth()
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchUnits()
  }, [user])

  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .eq('user_id', user?.id)
        .order('name')

      if (error) throw error
      setUnits(data || [])
    } catch (error) {
      console.error('Error fetching units:', error)
    } finally {
      setLoading(false)
    }
  }

  const addUnit = async (unitData: any) => {
    try {
      const { error } = await supabase
        .from('units')
        .insert([{ ...unitData, user_id: user?.id }])

      if (error) throw error
      
      await fetchUnits()
      toast({ title: 'Unité ajoutée', description: `${unitData.name} a été ajoutée avec succès.` })
    } catch (error) {
      console.error('Error adding unit:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter l\'unité',
        variant: 'destructive'
      })
      throw error
    }
  }

  const deleteUnit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      
      await fetchUnits()
      toast({ title: 'Unité supprimée', description: 'L\'unité a été supprimée.' })
    } catch (error) {
      console.error('Error deleting unit:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'unité',
        variant: 'destructive'
      })
      throw error
    }
  }

  return {
    units,
    loading,
    addUnit,
    deleteUnit,
    refetch: fetchUnits
  }
}
