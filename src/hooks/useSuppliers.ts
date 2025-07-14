
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export function useSuppliers() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchSuppliers()
  }, [user])

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSupplier = async (supplierData: any) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert([{ ...supplierData, user_id: user?.id }])

      if (error) throw error
      
      await fetchSuppliers()
      toast({ title: 'Fournisseur ajouté', description: `${supplierData.name} a été ajouté avec succès.` })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le fournisseur',
        variant: 'destructive'
      })
      throw error
    }
  }

  const updateSupplier = async (id: string, supplierData: any) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(supplierData)
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      
      await fetchSuppliers()
      toast({ title: 'Fournisseur modifié', description: 'Le fournisseur a été modifié avec succès.' })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le fournisseur',
        variant: 'destructive'
      })
      throw error
    }
  }

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error
      
      await fetchSuppliers()
      toast({ title: 'Fournisseur supprimé', description: 'Le fournisseur a été supprimé.' })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le fournisseur',
        variant: 'destructive'
      })
      throw error
    }
  }

  return {
    suppliers,
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers
  }
}
