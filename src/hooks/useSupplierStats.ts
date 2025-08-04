import { useMemo } from 'react'
import { usePurchaseOrders } from './usePurchaseOrders'
import { useSuppliers } from './useSuppliers'

export function useSupplierStats() {
  const { purchaseOrders } = usePurchaseOrders()
  const { suppliers } = useSuppliers()

  const supplierStats = useMemo(() => {
    return suppliers.map(supplier => {
      // Filtrer les commandes pour ce fournisseur
      const supplierOrders = purchaseOrders.filter(order => order.supplier_id === supplier.id)
      
      // Calculer les statistiques
      const totalAmount = supplierOrders.reduce((sum, order) => sum + order.total, 0)
      const totalOrders = supplierOrders.length
      
      // Trouver la dernière commande
      const lastOrder = supplierOrders.length > 0 
        ? supplierOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null

      return {
        ...supplier,
        calculatedTotalAmount: totalAmount,
        calculatedTotalOrders: totalOrders,
        calculatedLastOrder: lastOrder?.date || null
      }
    })
  }, [suppliers, purchaseOrders])

  return { suppliers: supplierStats }
}