import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Copy, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function CreateAdminButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    planId: '',
  });
  const { toast } = useToast();

  // Auto-generate password based on name
  const generatedPassword = useMemo(() => {
    const first = formData.firstName.trim();
    const last = formData.lastName.trim();
    if (!first || !last) return '';
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    return `${capitalize(first)}${capitalize(last)}Stock@24`;
  }, [formData.firstName, formData.lastName]);

  useEffect(() => {
    if (!open) return;
    const fetchPlans = async () => {
      const { data } = await supabase
        .from('subscription_plans' as any)
        .select('id, name, display_name')
        .eq('is_active', true)
        .order('sort_order');
      if (data) setPlans(data);
    };
    fetchPlans();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          ...formData,
          password: generatedPassword,
        }
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error);

      toast({
        title: "Succès",
        description: `Compte créé ! Mot de passe : ${generatedPassword}`,
      });

      setOpen(false);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        role: 'user',
        planId: '',
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du compte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyPassword = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      toast({ title: "Copié", description: "Mot de passe copié dans le presse-papier" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Créer un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Créer un compte utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          {/* Auto-generated password display */}
          <div>
            <Label>Mot de passe (auto-généré)</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={generatedPassword}
                readOnly
                className="bg-muted font-mono text-sm"
                placeholder="Remplissez prénom et nom..."
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={copyPassword} disabled={!generatedPassword}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {generatedPassword && (
              <p className="text-xs text-muted-foreground mt-1">
                Format : PrénomNomStock@24
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="company">Entreprise</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rôle</Label>
              <Select value={formData.role} onValueChange={(v) => handleInputChange('role', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan d'abonnement</Label>
              <Select value={formData.planId} onValueChange={(v) => handleInputChange('planId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !generatedPassword}>
            {loading ? 'Création...' : 'Créer le compte'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
