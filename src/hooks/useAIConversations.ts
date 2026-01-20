import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  chartType?: string | null;
  createdAt?: Date;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export function useAIConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load all conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setConversations(data?.map(c => ({
        id: c.id,
        title: c.title,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at)
      })) || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        chartType: m.chart_type,
        createdAt: new Date(m.created_at)
      })) || [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (title: string = 'Nouvelle conversation'): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title
        })
        .select('id')
        .single();

      if (error) throw error;

      const newConversation: Conversation = {
        id: data.id,
        title,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(data.id);
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
      return null;
    }
  }, [user]);

  // Add a message to the current conversation
  const addMessage = useCallback(async (
    conversationId: string,
    message: Omit<Message, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          chart_type: message.chartType || null
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }, [user]);

  // Update conversation title
  const updateConversationTitle = useCallback(async (
    conversationId: string, 
    title: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, title } : c)
      );

      return true;
    } catch (error) {
      console.error('Error updating conversation:', error);
      return false;
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
      }

      toast.success('Conversation supprimée');
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  }, [currentConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    isLoading,
    loadConversations,
    loadMessages,
    createConversation,
    addMessage,
    updateConversationTitle,
    deleteConversation
  };
}
