import { useMemo } from 'react'
import { useApp } from '@/contexts/AppContext'

export function useClientStats() {
  const { clients, sales } = useApp()

  const clientStats = useMemo(() => {
    return clients.map(client => {
      // Filtrer les ventes pour ce client
      const clientSales = sales.filter(sale => sale.client_id === client.id && sale.status !== 'Brouillon')
      
      // Calculer les statistiques
      const totalAmount = clientSales.reduce((sum, sale) => sum + (sale.total || 0), 0)
      const totalOrders = clientSales.length
      
      // Trouver la dernière commande
      const lastOrder = clientSales.length > 0 
        ? clientSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
        : null

      return {
        ...client,
        calculatedTotalAmount: totalAmount,
        calculatedTotalOrders: totalOrders,
        calculatedLastOrder: lastOrder?.date || null
      }
    })
  }, [clients, sales])

  return { clients: clientStats }
}