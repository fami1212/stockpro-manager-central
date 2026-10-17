import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Send, Settings2, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { normalizePhone, COUNTRY_CODES } from '@/lib/phone';
import { toast } from 'sonner';

interface Props { open: boolean; onClose: () => void; clients: any[] }

export function WhatsAppBulkModal({ open, onClose, clients }: Props) {
  const { user } = useAuth();
  const { status, hasAccess, request, loading } = useFeatureAccess();
  const [reqMsg, setReqMsg] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [settings, setSettings] = useState({ phone_number_id: '', access_token: '', display_phone: '', default_country_code: '221', template_name: '', template_language: 'fr' });
  const [hasSettings, setHasSettings] = useState(false);

  useEffect(() => {
    if (!open || !user || !hasAccess) return;
    (supabase as any).from('whatsapp_settings').select('*').eq('user_id', user.id).maybeSingle().then(({ data }: any) => {
      if (data) { setHasSettings(true); setSettings({ ...data, template_name: data.template_name || '', display_phone: data.display_phone || '' }); }
    });
  }, [open, user, hasAccess]);

  const { valid, invalid } = useMemo(() => {
    const withPhone = clients.filter((c) => c.phone);
    const v: any[] = [], inv: any[] = [];
    withPhone.forEach((c) => (normalizePhone(c.phone, settings.default_country_code) ? v : inv).push(c));
    return { valid: v, invalid: inv };
  }, [clients, settings.default_country_code]);

  const saveSettings = async () => {
    if (!settings.phone_number_id.trim() || !settings.access_token.trim()) { toast.error('Identifiant du numéro et clé d\'accès requis'); return; }
    const { error } = await (supabase as any).from('whatsapp_settings').upsert({
      user_id: user!.id,
      phone_number_id: settings.phone_number_id.trim(),
      access_token: settings.access_token.trim(),
      display_phone: settings.display_phone.trim() || null,
      default_country_code: settings.default_country_code,
      template_name: settings.template_name.trim() || null,
      template_language: settings.template_language.trim() || 'fr',
    });
    if (error) toast.error(error.message); else { setHasSettings(true); toast.success('WhatsApp Business enregistré'); }
  };

  const send = async () => {
    if (!message.trim()) return;
    setSending(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-bulk-send', { body: { message } });
      if (error) {
        const ctx: any = (error as any).context;
        let detail = error.message;
        try { detail = (await ctx.json()).error || detail; } catch { /* ignore */ }
        throw new Error(detail);
      }
      setResult(data);
      toast.success(`${data.sent}/${data.total} messages envoyés`);
    } catch (e: any) {
      toast.error(e.message || "Échec de l'envoi");
    } finally { setSending(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary" />Message WhatsApp en masse</DialogTitle>
          <DialogDescription>Fonctionnalité Premium +</DialogDescription>
        </DialogHeader>

        {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : !hasAccess ? (
          <div className="space-y-4">
            {status === 'pending' ? (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted"><Clock className="h-5 w-5" /><p className="text-sm">Votre demande est en cours de traitement par l'administrateur.</p></div>
            ) : (
              <>
                {status === 'rejected' && <p className="text-sm text-destructive">Votre précédente demande a été refusée. Vous pouvez en refaire une.</p>}
                <p className="text-sm text-muted-foreground">Envoyez un message WhatsApp à tous vos clients en un clic. Demandez l'accès : l'administrateur validera votre demande.</p>
                <Textarea placeholder="Message pour l'administrateur (optionnel)" value={reqMsg} maxLength={500} onChange={(e) => setReqMsg(e.target.value)} />
                <Button className="w-full" onClick={async () => { try { await request(reqMsg); toast.success('Demande envoyée'); } catch (e: any) { toast.error(e.message); } }}>
                  Demander l'accès Premium +
                </Button>
              </>
            )}
          </div>
        ) : (
          <Tabs defaultValue={hasSettings ? 'send' : 'settings'}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="send"><Send className="h-4 w-4 mr-1" />Envoyer</TabsTrigger>
              <TabsTrigger value="settings"><Settings2 className="h-4 w-4 mr-1" />Mon WhatsApp</TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="space-y-4">
              {!hasSettings && <p className="text-sm text-destructive">Connectez d'abord votre WhatsApp Business (onglet « Mon WhatsApp »).</p>}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">{valid.length} numéros prêts</Badge>
                {invalid.length > 0 && <Badge variant="destructive">{invalid.length} numéros imprécis</Badge>}
              </div>
              {invalid.length > 0 && (
                <div className="text-xs p-3 rounded-lg bg-destructive/10 space-y-1">
                  <p className="font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Corrigez l'indicatif de ces clients (ex : +221 77…) :</p>
                  {invalid.slice(0, 8).map((c) => <p key={c.id}>{c.name} — {c.phone}</p>)}
                </div>
              )}
              <div>
                <Label>Message</Label>
                <Textarea rows={5} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Bonjour {nom}, profitez de -20% ce week-end !" />
                <p className="text-xs text-muted-foreground mt-1">{'{nom}'} sera remplacé par le nom du client. {message.length}/1000</p>
              </div>
              <Button className="w-full" disabled={!hasSettings || sending || !message.trim() || valid.length === 0} onClick={send}>
                <Send className="h-4 w-4 mr-2" />{sending ? 'Envoi en cours…' : `Envoyer à ${valid.length} clients`}
              </Button>
              {result && (
                <div className="text-sm space-y-1 max-h-48 overflow-y-auto">
                  <p className="font-medium">{result.sent} envoyés, {result.failed} échecs</p>
                  {result.results.filter((r: any) => !r.ok).map((r: any, i: number) => (
                    <p key={i} className="text-xs flex gap-1"><XCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />{r.name} : {r.error}</p>
                  ))}
                  {result.failed === 0 && <p className="text-xs flex gap-1"><CheckCircle2 className="h-3 w-3 text-primary" />Tous les messages sont partis.</p>}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-3">
              <p className="text-xs text-muted-foreground">Infos à copier depuis votre compte Meta (WhatsApp Manager → API Setup). Les messages partiront depuis votre propre numéro WhatsApp Business.</p>
              <div><Label>Numéro WhatsApp affiché</Label><Input value={settings.display_phone} onChange={(e) => setSettings({ ...settings, display_phone: e.target.value })} placeholder="+221 77 000 00 00" /></div>
              <div><Label>Identifiant du numéro (Phone number ID)</Label><Input value={settings.phone_number_id} onChange={(e) => setSettings({ ...settings, phone_number_id: e.target.value })} /></div>
              <div><Label>Clé d'accès (Access token)</Label><Input type="password" value={settings.access_token} onChange={(e) => setSettings({ ...settings, access_token: e.target.value })} /></div>
              <div>
                <Label>Indicatif par défaut de vos clients</Label>
                <Select value={settings.default_country_code} onValueChange={(v) => setSettings({ ...settings, default_country_code: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTRY_CODES.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Modèle de message approuvé (recommandé)</Label><Input value={settings.template_name} onChange={(e) => setSettings({ ...settings, template_name: e.target.value })} placeholder="ex : annonce_clients" /></div>
              <p className="text-xs text-muted-foreground">WhatsApp exige un modèle approuvé par Meta pour écrire à des clients qui ne vous ont pas écrit ces dernières 24h. Le modèle doit contenir une variable {'{{1}}'} qui recevra votre message.</p>
              <Button className="w-full" onClick={saveSettings}>Enregistrer</Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
