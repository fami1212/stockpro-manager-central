import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Smartphone, FileUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { parseCSV, parseVCard, ImportedContact } from '@/lib/contactsImport';
import { normalizePhone } from '@/lib/phone';
import { toast } from 'sonner';

interface Props { open: boolean; onClose: () => void; existingPhones: string[] }

export function ImportContactsModal({ open, onClose, existingPhones }: Props) {
  const { user } = useAuth();
  const { refetchClients } = useApp();
  const [contacts, setContacts] = useState<(ImportedContact & { selected: boolean })[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickerSupported = typeof navigator !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window;
  const known = new Set(existingPhones.map((p) => normalizePhone(p) || p.replace(/\D/g, '')));

  const load = (list: ImportedContact[]) => {
    const seen = new Set<string>();
    const cleaned = list.filter((c) => {
      const k = normalizePhone(c.phone) || (c.phone || '').replace(/\D/g, '');
      if (!k || seen.has(k)) return !k && !!c.name;
      seen.add(k);
      return true;
    }).map((c) => ({ ...c, selected: !known.has(normalizePhone(c.phone) || (c.phone || '').replace(/\D/g, '')) }));
    setContacts(cleaned);
    if (!cleaned.length) toast.error('Aucun contact trouvé');
  };

  const pickFromPhone = async () => {
    try {
      const res = await (navigator as any).contacts.select(['name', 'tel', 'email'], { multiple: true });
      load(res.map((r: any) => ({ name: r.name?.[0] || r.tel?.[0] || '', phone: r.tel?.[0] || null, email: r.email?.[0] || null })));
    } catch { /* cancelled */ }
  };

  const onFile = async (f: File) => {
    const text = await f.text();
    try { load(/BEGIN:VCARD/i.test(text) ? parseVCard(text) : parseCSV(text)); } catch { toast.error('Fichier contacts illisible.'); }
  };

  const save = async () => {
    if (!user || saving) return;
    const rows = contacts.filter((c) => c.selected).map((c) => ({
      user_id: user.id, name: c.name.trim().slice(0, 100) || 'Sans nom', phone: c.phone?.slice(0, 30) || null, email: c.email?.slice(0, 255) || null, status: 'Actif',
    }));
    if (!rows.length) return;
    setSaving(true);
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await supabase.from('clients').insert(rows.slice(i, i + 200) as any);
      if (error) { toast.error(error.message); setSaving(false); return; }
    }
    await refetchClients?.();
    toast.success(`${rows.length} clients importés`);
    setSaving(false); setContacts([]); onClose();
  };

  const allSelected = contacts.length > 0 && contacts.every((c) => c.selected);
  const count = contacts.filter((c) => c.selected).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importer mes clients</DialogTitle>
          <DialogDescription>Depuis les contacts du téléphone ou un fichier (.vcf, .csv).</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {pickerSupported && (
            <Button variant="outline" onClick={pickFromPhone}><Smartphone className="h-4 w-4 mr-2" />Choisir dans mes contacts</Button>
          )}
          <Button variant="outline" onClick={() => fileRef.current?.click()}><FileUp className="h-4 w-4 mr-2" />Importer un fichier contacts</Button>
          <input ref={fileRef} type="file" accept=".vcf,.csv,text/vcard,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <p className="text-xs text-muted-foreground">
            Pour récupérer <b>tous</b> vos contacts : {pickerSupported ? 'dans la liste, utilisez « Tout sélectionner », ou ' : ''}
            exportez-les depuis l'app Contacts du téléphone (Android : Contacts → Exporter en .vcf ; iPhone : icloud.com → Contacts → Exporter vCard), puis importez le fichier ici.
          </p>
        </div>
        {contacts.length > 0 && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox checked={allSelected} onCheckedChange={(v) => setContacts(contacts.map((c) => ({ ...c, selected: !!v })))} />
              Tout sélectionner ({contacts.length})
            </label>
            <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
              {contacts.map((c, i) => (
                <label key={i} className="flex items-center gap-2 p-2 text-sm">
                  <Checkbox checked={c.selected} onCheckedChange={(v) => setContacts(contacts.map((x, j) => (j === i ? { ...x, selected: !!v } : x)))} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.phone}</span>
                </label>
              ))}
            </div>
            <Button className="w-full" disabled={!count || saving} onClick={save}>{saving ? 'Import…' : `Importer ${count} clients`}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
