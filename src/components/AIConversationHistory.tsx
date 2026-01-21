import { useState, useEffect } from 'react';
import { useAIConversations } from '@/hooks/useAIConversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Trash2, 
  Clock,
  ChevronRight,
  History
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  chartType?: string | null;
  createdAt?: Date;
}

interface AIConversationHistoryProps {
  onSelectConversation: (conversationId: string, messages: Message[]) => void;
  onNewConversation: () => void;
  currentConversationId: string | null;
}

export function AIConversationHistory({ 
  onSelectConversation, 
  onNewConversation,
  currentConversationId 
}: AIConversationHistoryProps) {
  const { 
    conversations, 
    isLoading, 
    loadMessages, 
    deleteConversation,
    setCurrentConversationId 
  } = useAIConversations();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = async (conversationId: string) => {
    setLoadingConversationId(conversationId);
    try {
      const messages = await loadMessages(conversationId);
      setCurrentConversationId(conversationId);
      onSelectConversation(conversationId, messages);
      setIsOpen(false);
    } finally {
      setLoadingConversationId(null);
    }
  };

  const handleNewConversation = () => {
    onNewConversation();
    setIsOpen(false);
  };

  const handleDeleteConversation = async () => {
    if (deleteId) {
      await deleteConversation(deleteId);
      setDeleteId(null);
      if (currentConversationId === deleteId) {
        onNewConversation();
      }
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <History className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-full sm:max-w-md">
          <SheetHeader className="space-y-4">
            <SheetTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Historique des conversations
            </SheetTitle>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleNewConversation}>
                <Plus className="h-4 w-4 mr-1" />
                Nouvelle
              </Button>
            </div>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-180px)] mt-4 pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aucune conversation</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleNewConversation}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Démarrer une conversation
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <Card 
                    key={conversation.id}
                    className={cn(
                      'transition-all hover:shadow-md cursor-pointer group',
                      currentConversationId === conversation.id && 'border-primary bg-accent/50'
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10 shrink-0">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </div>
                        
                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => handleSelectConversation(conversation.id)}
                        >
                          <h4 className="font-medium text-sm truncate">
                            {conversation.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(conversation.updatedAt, { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {loadingConversationId === conversation.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleSelectConversation(conversation.id)}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(conversation.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Supprimer la conversation"
        description="Cette action est irréversible. Tous les messages seront supprimés."
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConversation}
        variant="destructive"
      />
    </>
  );
}
