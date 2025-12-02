import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
  template_type: string;
  created_at: string;
  updated_at: string;
}

export const useEmailTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching email templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const addTemplate = async (templateData: Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      // If setting as default, unset other defaults
      if (templateData.is_default) {
        await supabase
          .from('email_templates')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('template_type', templateData.template_type);
      }

      const { data, error } = await supabase
        .from('email_templates')
        .insert({ ...templateData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Modèle créé',
        description: 'Le modèle d\'email a été créé avec succès.'
      });

      await fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error adding email template:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le modèle d\'email.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<EmailTemplate>) => {
    if (!user) return false;

    try {
      // If setting as default, unset other defaults
      if (templateData.is_default) {
        await supabase
          .from('email_templates')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('template_type', templateData.template_type || 'invoice');
      }

      const { error } = await supabase
        .from('email_templates')
        .update(templateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Modèle mis à jour',
        description: 'Le modèle d\'email a été mis à jour avec succès.'
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error updating email template:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le modèle d\'email.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Modèle supprimé',
        description: 'Le modèle d\'email a été supprimé.'
      });

      await fetchTemplates();
      return true;
    } catch (error) {
      console.error('Error deleting email template:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le modèle d\'email.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const getDefaultTemplate = () => {
    return templates.find(t => t.is_default && t.template_type === 'invoice');
  };

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getDefaultTemplate,
    refetch: fetchTemplates
  };
};
