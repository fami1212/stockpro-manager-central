import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { whatsappLink } from '@/lib/whatsappQueue';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface SendRow { id: string; client_name: string; phone: string; template_name: string; status: string; error_message: string | null; created_at: string; user_email?: string | null }

export function WhatsappSendsManagement() {
  const [rows, setRows] = useState<SendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from('whatsapp_sends')
      .select('id, client_name, phone, template_name, status, error_message, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(500);
    const ids = [...new Set((data || []).map((r: any) => r.user_id))] as string[];
    const { data: profiles } = ids.length ? await supabase.from('profiles').select('id, email').in('id', ids) : { data: [] as any[] };
    const byId = Object.fromEntries((profiles || []).map((p: any) => [p.id, p.email]));
    setRows((data || []).map((r: any) => ({ ...r, user_email: byId[r.user_id] ?? null })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.client_name, r.phone, r.template_name, r.user_email].some((v) => (v || '').toLowerCase().includes(q)));
  }, [rows, search]);

  const statusBadge = (s: string) =>
    s === 'sent' ? <Badge>Envoyé</Badge> : <Badge variant="destructive">Échec</Badge>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Historique des envois WhatsApp</CardTitle>
        <div className="flex items-center gap-2">
          <Input aria-label="Rechercher un envoi" placeholder="Client, numéro, modèle…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" />Actualiser</Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p>Chargement…</p> : filtered.length === 0 ? <p className="text-muted-foreground">Aucun envoi enregistré.</p> : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Client</TableHead><TableHead>Numéro</TableHead><TableHead>Modèle</TableHead><TableHead>Expéditeur</TableHead><TableHead>Statut</TableHead><TableHead>WhatsApp</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="whitespace-nowrap">{new Date(r.created_at).toLocaleString('fr-FR')}</TableCell>
                    <TableCell className="font-medium">{r.client_name}</TableCell>
                    <TableCell className="whitespace-nowrap">+{r.phone}</TableCell>
                    <TableCell>{r.template_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.user_email || '-'}</TableCell>
                    <TableCell>{statusBadge(r.status)}{r.error_message && <p className="text-xs text-muted-foreground max-w-[200px] truncate" title={r.error_message}>{r.error_message}</p>}</TableCell>
                    <TableCell>
                      <a href={whatsappLink(r.phone, '', r.client_name)} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir WhatsApp avec ${r.client_name}`}>
                        <Button size="sm" variant="outline"><ExternalLink className="h-4 w-4" />Ouvrir</Button>
                      </a>
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
