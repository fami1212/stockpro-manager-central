import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BusinessData {
  products: Array<{
    name: string;
    stock: number;
    alertThreshold: number;
    sellPrice: number;
    buyPrice: number;
    category?: string;
  }>;
  sales: Array<{
    total: number;
    date: string;
    items: Array<{ product: string; quantity: number }>;
  }>;
  clients: Array<{
    name: string;
    status: string;
    totalOrders: number;
    totalAmount: number;
    lastOrder?: string;
  }>;
}

interface AIInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface AIRecommendation {
  title: string;
  action: string;
  priority: 'urgent' | 'high' | 'medium';
}

interface AIRisk {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

interface AIOpportunity {
  title: string;
  description: string;
  potential: 'high' | 'medium' | 'low';
}

interface ComprehensiveAnalysis {
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  risks: AIRisk[];
  opportunities: AIOpportunity[];
  summary: string;
}

interface StockPrediction {
  product: string;
  currentStock: number;
  predictedDemand: number;
  recommendedOrder: number;
  urgency: 'immediate' | 'soon' | 'planned';
  daysUntilStockout: number;
}

interface StockAnalysis {
  predictions: StockPrediction[];
  globalTrend: 'up' | 'stable' | 'down';
  summary: string;
}

interface ClientSegment {
  name: string;
  count: number;
  characteristics: string;
  strategy: string;
}

interface AtRiskClient {
  name: string;
  reason: string;
  action: string;
}

interface VIPClient {
  name: string;
  value: number;
  recommendation: string;
}

interface ClientAnalysis {
  segments: ClientSegment[];
  atRisk: AtRiskClient[];
  vip: VIPClient[];
  summary: string;
}

export const useAIAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [lastStockAnalysis, setLastStockAnalysis] = useState<StockAnalysis | null>(null);
  const [lastClientAnalysis, setLastClientAnalysis] = useState<ClientAnalysis | null>(null);

  const analyzeComprehensive = useCallback(async (data: BusinessData): Promise<ComprehensiveAnalysis | null> => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-business-analysis', {
        body: { type: 'comprehensive', data }
      });

      if (error) throw error;
      
      if (result.error) {
        toast({
          title: 'Erreur IA',
          description: result.error,
          variant: 'destructive'
        });
        return null;
      }

      const analysis = result.data as ComprehensiveAnalysis;
      setLastAnalysis(analysis);
      
      toast({
        title: 'Analyse IA terminée',
        description: 'Insights générés avec succès'
      });

      return analysis;
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de contacter le service IA',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeStock = useCallback(async (data: BusinessData): Promise<StockAnalysis | null> => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-business-analysis', {
        body: { type: 'stock-prediction', data }
      });

      if (error) throw error;
      
      if (result.error) {
        toast({
          title: 'Erreur IA',
          description: result.error,
          variant: 'destructive'
        });
        return null;
      }

      const analysis = result.data as StockAnalysis;
      setLastStockAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('Stock analysis error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'analyser le stock',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeClients = useCallback(async (data: BusinessData): Promise<ClientAnalysis | null> => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('ai-business-analysis', {
        body: { type: 'client-analysis', data }
      });

      if (error) throw error;
      
      if (result.error) {
        toast({
          title: 'Erreur IA',
          description: result.error,
          variant: 'destructive'
        });
        return null;
      }

      const analysis = result.data as ClientAnalysis;
      setLastClientAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error('Client analysis error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'analyser les clients',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    lastAnalysis,
    lastStockAnalysis,
    lastClientAnalysis,
    analyzeComprehensive,
    analyzeStock,
    analyzeClients
  };
};
