import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { MessageSquareText, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Template { name: string; status: string; language: string; category?: string; components?: { type: string; text?: string }[] }

const LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en_US', label: 'Anglais' },
  { code: 'ar', label: 'Arabe' },
  { code: 'pt_BR', label: 'Portugais' },
];

export function WhatsappTemplatesManagement() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('fr');
  const [category, setCategory] = useState('MARKETING');
  const [body, setBody] = useState('');
  const [example, setExample] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('whatsapp-templates', { body: { action: 'list' } });
    if (error) {
      const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
      toast.error(details || 'Lecture des modèles impossible');
    } else {
      setRows(data?.data || []);
    }
    setLoading(false);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const create = async () => {
    setCreating(true);
    const { error } = await supabase.functions.invoke('whatsapp-templates', {
      body: { action: 'create', name: name.trim(), language, category, body: body.trim(), example: example.trim() || 'Awa' },
    });
    if (error) {
      const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
      toast.error(`Création refusée : ${details}`);
    } else {
      toast.success('Modèle envoyé à Meta — en attente de validation (jusqu’à 48 h)');
      setName(''); setBody(''); setExample('');
      load();
    }
    setCreating(false);
  };

  const remove = async (tpl: string) => {
    const { error } = await supabase.functions.invoke('whatsapp-templates', { body: { action: 'delete', name: tpl } });
    if (error) {
      const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
      toast.error(`Suppression refusée : ${details}`);
    } else { toast.success('Modèle supprimé'); load(); }
  };

  const statusBadge = (s: string) =>
    s === 'APPROVED' ? <Badge>Approuvé</Badge> : s === 'REJECTED' ? <Badge variant="destructive">Refusé</Badge> : <Badge variant="secondary">En revue</Badge>;

  const canCreate = /^[a-z0-9_]+$/.test(name.trim()) && body.trim().length >= 10;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-primary" />Modèles WhatsApp</CardTitle>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" />Actualiser</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="tpl-name">Nom du modèle (minuscules, _ uniquement)</Label>
            <Input id="tpl-name" placeholder="offre_speciale" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Langue</Label>
                <Select value={language} onValueChange={setLanguage}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="space-y-1"><Label>Catégorie</Label>
                <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MARKETING">Marketing</SelectItem><SelectItem value="UTILITY">Utilitaire</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="space-y-1"><Label htmlFor="tpl-body">Message — utilisez {'{{1}}'} pour le nom du client</Label>
              <Textarea id="tpl-body" rows={4} maxLength={1024} placeholder="Bonjour {{1}}, découvrez nos nouveautés en boutique cette semaine." value={body} onChange={(e) => setBody(e.target.value)} />
              <p className="text-xs text-muted-foreground">{body.length}/1024</p>
            </div>
            <div className="space-y-1"><Label htmlFor="tpl-example">Exemple de nom (pour la validation Meta)</Label>
              <Input id="tpl-example" placeholder="Awa" value={example} onChange={(e) => setExample(e.target.value)} maxLength={60} />
            </div>
            <Button disabled={!canCreate || creating} onClick={create}>{creating ? 'Envoi…' : 'Créer le modèle'}</Button>
            <p className="text-xs text-muted-foreground">Chaque modèle est relu par Meta avant de pouvoir être envoyé (jusqu’à 48 h).</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Modèles existants</p>
            {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : rows.length === 0 ? <p className="text-sm text-muted-foreground">Aucun modèle.</p> : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Statut</TableHead><TableHead>Langue</TableHead><TableHead>Aperçu</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {rows.map((t) => (
                      <TableRow key={t.name}>
                        <TableCell className="font-medium break-all">{t.name}</TableCell>
                        <TableCell>{statusBadge(t.status)}</TableCell>
                        <TableCell>{t.language}</TableCell>
                        <TableCell className="max-w-xs text-xs text-muted-foreground">{t.components?.find((c) => c.type === 'BODY')?.text || '-'}</TableCell>
                        <TableCell><Button size="sm" variant="ghost" aria-label={`Supprimer ${t.name}`} onClick={() => remove(t.name)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
