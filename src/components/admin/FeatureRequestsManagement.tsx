import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function FeatureRequestsManagement() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('feature_requests').select('*').order('created_at', { ascending: false });
    const ids = (data || []).map((r: any) => r.user_id);
    const { data: profiles } = ids.length ? await supabase.from('profiles').select('id, email, first_name, last_name, company').in('id', ids) : { data: [] as any[] };
    const byId = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
    setRows((data || []).map((r: any) => ({ ...r, profile: byId[r.user_id] })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await (supabase as any).from('feature_requests').update({ status, processed_by: user?.id, processed_at: new Date().toISOString() }).eq('id', id);
    if (error) toast.error(error.message); else { toast.success(status === 'approved' ? 'Accès activé' : 'Demande refusée'); load(); }
  };

  const badge = (s: string) => s === 'approved' ? <Badge>Validée</Badge> : s === 'rejected' ? <Badge variant="destructive">Refusée</Badge> : <Badge variant="secondary">En attente</Badge>;

  return (
    <Card>
      <CardHeader><CardTitle>Demandes Premium + (WhatsApp en masse)</CardTitle></CardHeader>
      <CardContent>
        {loading ? <p>Chargement…</p> : rows.length === 0 ? <p className="text-muted-foreground">Aucune demande.</p> : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Utilisateur</TableHead><TableHead>Message</TableHead><TableHead>Date</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell><p className="font-medium">{r.profile?.first_name} {r.profile?.last_name}</p><p className="text-xs text-muted-foreground">{r.profile?.email} {r.profile?.company ? `· ${r.profile.company}` : ''}</p></TableCell>
                    <TableCell className="max-w-xs text-sm">{r.message || '-'}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{badge(r.status)}</TableCell>
                    <TableCell className="space-x-2 whitespace-nowrap">
                      {r.status !== 'approved' && <Button size="sm" onClick={() => decide(r.id, 'approved')}>Valider</Button>}
                      {r.status !== 'rejected' && <Button size="sm" variant="outline" onClick={() => decide(r.id, 'rejected')}>{r.status === 'approved' ? 'Retirer' : 'Refuser'}</Button>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
