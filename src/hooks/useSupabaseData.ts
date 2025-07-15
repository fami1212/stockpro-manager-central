
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
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...productData, user_id: user?.id }])
        .select()
        .single()

      if (error) throw error
      
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

  return {
    categories,
    loading,
    addCategory,
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
      const { error } = await supabase
        .from('clients')
        .insert([{ ...clientData, user_id: user?.id }])

      if (error) throw error
      
      await fetchClients()
      toast({ title: 'Client ajouté', description: `${clientData.name} a été ajouté avec succès.` })
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
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{ ...saleData, user_id: user?.id }])
        .select()
        .single()

      if (saleError) throw saleError

      // Add sale items
      if (saleData.items && saleData.items.length > 0) {
        const saleItems = saleData.items.map((item: any) => ({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          total: item.total
        }))

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems)

        if (itemsError) throw itemsError
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
      const { error } = await supabase
        .from('sales')
        .update(saleData)
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

  return {
    units,
    loading,
    addUnit,
    refetch: fetchUnits
  }
}
