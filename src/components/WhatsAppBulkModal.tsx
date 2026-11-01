import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, MessageCircle, Clock, AlertTriangle, Check, SkipForward, Send, Loader2 } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { COUNTRY_CODES } from '@/lib/phone';
import { prepareWhatsAppQueue, whatsappLink, WhatsAppClient } from '@/lib/whatsappQueue';
import { buildRecipients, summarizeResults } from '@/lib/whatsappBulk';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface Props { open: boolean; onClose: () => void; clients: WhatsAppClient[] }
interface Template { name: string; status: string; language: string }

export function WhatsAppBulkModal({ open, onClose, clients }: Props) {
  const { status, hasAccess, request, loading, refresh } = useFeatureAccess();
  const [reqMsg, setReqMsg] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual' | null>(null);
  // Automatic mode
  const [templates, setTemplates] = useState<Template[]>([]);
  const [template, setTemplate] = useState('');
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState<{ sent: number; failed: number; failedNames: string[] } | null>(null);
  // Manual mode
  const [message, setMessage] = useState('');
  const [code, setCode] = useState('221');
  const [queue, setQueue] = useState<ReturnType<typeof prepareWhatsAppQueue>['valid']>([]);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [opened, setOpened] = useState(false);
  const { valid, invalid } = useMemo(() => prepareWhatsAppQueue(clients, code), [clients, code]);

  useEffect(() => {
    if (!open) return;
    void refresh();
    setSummary(null);
    setMode(null);
    supabase.functions.invoke('whatsapp-templates', { body: { action: 'list' } }).then(({ data, error }) => {
      if (error) return; // manual fallback stays available
      const approved = ((data?.data || []) as Template[]).filter((t) => t.status === 'APPROVED');
      setTemplates(approved);
      if (approved.length) setTemplate(approved[0].name);
    });
  }, [open, refresh]);

  const current = queue[index];
  const openWhatsApp = () => {
    if (!current) return;
    window.open(whatsappLink(current.number, message, current.name), '_blank', 'noopener,noreferrer');
    setOpened(true);
  };
  const next = (sent: boolean) => {
    if (sent) setConfirmed((n) => n + 1);
    setIndex((n) => n + 1);
    setOpened(false);
  };

  const sendAll = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-bulk-send', {
        body: { template, language: 'fr', recipients: buildRecipients(valid) },
      });
      if (error) {
        const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
        toast.error(`Envoi impossible : ${details}`);
      } else {
        const s = summarizeResults(data?.results || []);
        setSummary(s);
        toast.success(`${s.sent} message(s) envoyé(s)${s.failed ? `, ${s.failed} en échec` : ''}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Envoi impossible');
    } finally {
      setSending(false);
    }
  };

  return <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary" />Message groupé WhatsApp</DialogTitle>
        <DialogDescription>Premium + · Envoyez à tous vos clients d’un seul coup, sans faire un à un.</DialogDescription>
      </DialogHeader>
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : !hasAccess ? <div className="space-y-4">
        {status === 'pending' ? <p className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4" />Demande en attente de validation.</p> : <>
          {status === 'rejected' && <p className="text-sm text-destructive">Accès refusé ou retiré. Vous pouvez refaire une demande.</p>}
          <Textarea aria-label="Message pour l’administrateur" placeholder="Message pour l’administrateur (optionnel)" value={reqMsg} maxLength={500} onChange={(e) => setReqMsg(e.target.value)} />
          <Button disabled={requesting} className="w-full" onClick={async () => {
            setRequesting(true);
            try { await request(reqMsg); toast.success('Demande envoyée'); } catch (e) { toast.error(e instanceof Error ? e.message : 'Demande impossible'); } finally { setRequesting(false); }
          }}>Demander l’accès Premium +</Button>
        </>
      </div> : summary ? <div className="space-y-3">
        <p className="font-medium">Envoi terminé : {summary.sent} envoyé(s), {summary.failed} en échec.</p>
        {summary.failedNames.length > 0 && <div className="text-sm text-destructive space-y-1">
          <p className="flex gap-1 items-center"><AlertTriangle className="h-4 w-4" />Échecs :</p>
          {summary.failedNames.map((n) => <p key={n} className="break-words">{n}</p>)}
        </div>}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setSummary(null)}>Nouvel envoi</Button>
          <Button className="flex-1" onClick={onClose}>Terminé</Button>
        </div>
      </div> : !mode ? <div className="space-y-3">
        <div className="flex flex-wrap gap-2"><Badge variant="secondary">{valid.length} numéros distincts prêts</Badge>{invalid.length > 0 && <Badge variant="destructive">{invalid.length} sans numéro valide</Badge>}</div>
        <Button className="w-full gap-2" disabled={sending || templates.length === 0} onClick={sendAll}>
          {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi en cours…</> : <><Send className="h-4 w-4" />Envoyer automatiquement à {valid.length} client(s)</>}
        </Button>
        <p className="text-xs text-muted-foreground">
          {templates.length === 0
            ? 'Aucun modèle approuvé pour le moment : l’administrateur doit en créer un, puis attendre la validation de Meta (jusqu’à 48 h).'
            : `Envoi réel via le modèle « ${template} » depuis le numéro WhatsApp Business de l’application.`}
        </p>
        {templates.length > 1 && <div className="space-y-1">
          <Label htmlFor="bulk-template">Modèle d’envoi</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger id="bulk-template"><SelectValue /></SelectTrigger>
            <SelectContent>{templates.map((t) => <SelectItem key={t.name} value={t.name}>{t.name} ({t.language})</SelectItem>)}</SelectContent>
          </Select>
        </div>}
        <div className="relative py-1 text-center"><span className="text-xs text-muted-foreground">ou</span></div>
        <Button variant="outline" className="w-full gap-2" onClick={() => setMode('manual')}><MessageCircle className="h-4 w-4" />Mode manuel (WhatsApp sur mon téléphone)</Button>
      </div> : mode === 'auto' ? <div className="space-y-3">
        <div className="flex flex-wrap gap-2"><Badge variant="secondary">{valid.length} numéros distincts prêts</Badge></div>
        {templates.length === 0 ? <p className="text-sm text-muted-foreground">Aucun modèle approuvé. Utilisez le mode manuel en attendant.</p> : <>
          <Button className="w-full gap-2" disabled={sending} onClick={sendAll}>{sending ? <><Loader2 className="h-4 w-4 animate-spin" />Envoi en cours…</> : <><Send className="h-4 w-4" />Envoyer à {valid.length} client(s)</>}</Button>
        </>}
        <Button variant="outline" className="w-full" onClick={() => setMode(null)}>Retour</Button>
      </div> : <div className="space-y-4">
        {!started ? <>
          <Label>Indicatif des numéros locaux</Label>
          <Select value={code} onValueChange={setCode}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRY_CODES.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}</SelectContent></Select>
          <div className="flex flex-wrap gap-2"><Badge variant="secondary">{valid.length} numéros distincts prêts</Badge>{invalid.length > 0 && <Badge variant="destructive">{invalid.length} sans numéro valide</Badge>}</div>
          {invalid.length > 0 && <div className="text-sm text-destructive space-y-1"><p className="flex gap-1 items-center"><AlertTriangle className="h-4 w-4" />Clients exclus : numéro manquant ou invalide</p>{invalid.map((c) => <p key={c.id}>{c.name} — {c.phone || 'Sans téléphone'}</p>)}</div>}
          <Label htmlFor="bulk-message">Message</Label>
          <Textarea id="bulk-message" rows={5} maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Bonjour {nom}, …" />
          <p className="text-xs text-muted-foreground">{message.length}/1000</p>
          <Button className="w-full" disabled={!message.trim() || !valid.length} onClick={() => { setQueue(valid); setIndex(0); setConfirmed(0); setOpened(false); setStarted(true); }}>Préparer {valid.length} messages</Button>
          <Button variant="ghost" className="w-full" onClick={() => setMode(null)}>Retour</Button>
        </> : current ? <>
          <p className="text-sm text-muted-foreground">Client {index + 1} sur {queue.length} · {confirmed} envois confirmés par vous</p>
          <h3 className="font-semibold break-words">{current.name}</h3><p className="text-sm">+{current.number}</p>
          <p className="whitespace-pre-wrap break-words border-l-2 border-primary pl-3 text-sm">{message.replace(/\{nom\}/gi, current.name)}</p>
          <Button className="w-full gap-2" onClick={openWhatsApp}><MessageCircle className="h-4 w-4" />Ouvrir WhatsApp avec le message prêt</Button>
          <p className="text-xs text-muted-foreground">Le message s'ouvre dans WhatsApp (application ou Web). Appuyez sur Envoyer là-bas, puis revenez ici.</p>
          <div className="flex gap-2"><Button className="flex-1 gap-2" disabled={!opened} onClick={() => next(true)}><Check className="h-4 w-4" />J’ai envoyé</Button><Button variant="outline" className="gap-2" onClick={() => next(false)}><SkipForward className="h-4 w-4" />Passer</Button></div>
        </> : <><p>{confirmed} envois confirmés par vous · {queue.length - confirmed} clients passés</p><Button variant="outline" onClick={() => setStarted(false)}>Nouveau message</Button></>}
      </div>}
    </DialogContent>
  </Dialog>;
}
