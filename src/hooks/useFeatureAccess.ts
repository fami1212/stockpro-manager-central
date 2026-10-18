import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type FeatureStatus = 'none' | 'pending' | 'approved' | 'rejected';

export function useFeatureAccess(feature = 'whatsapp_bulk') {
  const { user, isAdmin } = useAuth();
  const [status, setStatus] = useState<FeatureStatus>('none');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setStatus('none'); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('feature_requests')
      .select('status')
      .eq('user_id', user.id)
      .eq('feature', feature)
      .maybeSingle();
    setStatus(error ? 'none' : (data?.status as FeatureStatus) || 'none');
    setLoading(false);
  }, [user, feature]);

  useEffect(() => {
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const request = async (message: string) => {
    if (!user) throw new Error("Veuillez vous reconnecter.");
    const payload = { user_id: user.id, feature, status: 'pending', message: message.slice(0, 500) || null, processed_by: null, processed_at: null, admin_notes: null };
    const q = status === 'rejected'
      ? (supabase as any).from('feature_requests').update(payload).eq('user_id', user.id).eq('feature', feature)
      : (supabase as any).from('feature_requests').insert(payload);
    const { error } = await q;
    if (error) throw error;
    await refresh();
  };

  return { status, loading, hasAccess: status === 'approved' || !!isAdmin, request, refresh };
}
