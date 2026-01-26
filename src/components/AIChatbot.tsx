import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { useAIConversations } from '@/hooks/useAIConversations';
import { ChatCharts, detectChartType } from '@/components/ChatCharts';
import { AIConversationHistory } from '@/components/AIConversationHistory';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  chartType?: string | null;
}

const CHAT_URL = `https://frkfrvbwhnvtvywgmvzz.supabase.co/functions/v1/ai-chat`;

const quickQuestions = [
  { icon: TrendingUp, text: "Comment vont mes ventes ?", color: "text-success", chart: 'sales-trend' },
  { icon: Package, text: "Quels produits commander ?", color: "text-warning", chart: 'stock-levels' },
  { icon: Users, text: "Mes meilleurs clients ?", color: "text-primary", chart: 'client-distribution' },
  { icon: BarChart3, text: "Analyse de mes marges", color: "text-purple-500", chart: 'margin-analysis' },
];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { products, sales, clients } = useApp();
  
  const { 
    currentConversationId, 
    setCurrentConversationId,
    createConversation, 
    addMessage,
    updateConversationTitle
  } = useAIConversations();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const prepareBusinessData = () => {
    return {
      products: products.map(p => ({
        name: p.name,
        stock: p.stock || 0,
        alertThreshold: p.alert_threshold || 5,
        sellPrice: p.sell_price || 0,
        buyPrice: p.buy_price || 0,
        category: p.category || 'Sans catégorie'
      })),
      sales: sales.map(s => ({
        total: s.total || 0,
        date: s.date || new Date().toISOString(),
        reference: s.reference
      })),
      clients: clients.map(c => ({
        name: c.name,
        status: c.status || 'Actif',
        totalOrders: c.total_orders || 0,
        totalAmount: c.total_amount || 0,
        lastOrder: c.last_order
      }))
    };
  };

  const streamChat = async (userMessage: string, presetChartType?: string) => {
    const chartType = presetChartType || detectChartType(userMessage);
    
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Create conversation if not exists
    let convId = currentConversationId;
    if (!convId) {
      convId = await createConversation(userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : ''));
    }

    // Save user message
    if (convId) {
      await addMessage(convId, { role: 'user', content: userMessage });
    }

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZya2ZydmJ3aG52dHZ5d2dtdnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTE5NTAsImV4cCI6MjA2ODA2Nzk1MH0.vR2M3Iqws4-g8zPYkZtFCaUX7umYtaxemacc1IwADS8`,
        },
        body: JSON.stringify({
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMessage }],
          data: prepareBusinessData()
        }),
      });

      if (resp.status === 429) {
        toast.error("Limite de requêtes atteinte, réessayez dans quelques minutes.");
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast.error("Crédits IA épuisés. Ajoutez des crédits dans les paramètres.");
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error('Erreur de connexion');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantContent = '';
      let streamDone = false;

      setMessages(prev => [...prev, { role: 'assistant', content: '', chartType }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages.length > 0) {
                  newMessages[newMessages.length - 1] = { 
                    role: 'assistant', 
                    content: assistantContent,
                    chartType
                  };
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      if (convId && assistantContent) {
        await addMessage(convId, { role: 'assistant', content: assistantContent, chartType });
        
        // Update conversation title if it's the first exchange
        if (messages.length === 0) {
          await updateConversationTitle(convId, userMessage.slice(0, 50));
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error("Erreur lors de la communication avec l'IA");
      setMessages(prev => prev.filter(m => m.content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
    setInput('');
  };

  const handleQuickQuestion = (question: string, chartType?: string) => {
    if (isLoading) return;
    streamChat(question, chartType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectConversation = (conversationId: string, loadedMessages: Message[]) => {
    setMessages(loadedMessages);
    setCurrentConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  return (
    <>
      {/* Floating button - positioned to avoid conflicts */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 z-40 h-12 w-12 lg:h-14 lg:w-14 rounded-full shadow-lg transition-all hover:scale-110 ${isOpen ? 'scale-0' : 'scale-100'}`}
        style={{ 
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)'
        }}
      >
        <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6" />
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-40 w-[400px] max-w-[calc(100vw-2rem)] shadow-2xl border-primary/20 animate-in slide-in-from-bottom-4">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AIConversationHistory
                  onSelectConversation={handleSelectConversation}
                  onNewConversation={handleNewConversation}
                  currentConversationId={currentConversationId}
                />
                <div className="p-2 rounded-full bg-primary/20">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-1">
                    Assistant IA
                    <Sparkles className="h-4 w-4 text-warning" />
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Analyse avec graphiques interactifs</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleNewConversation}
                  title="Nouvelle conversation"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Bonjour ! Je peux analyser vos données avec des graphiques interactifs.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Questions rapides :</p>
                    {quickQuestions.map((q, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto py-2 px-3"
                        onClick={() => handleQuickQuestion(q.text, q.chart)}
                        disabled={isLoading}
                      >
                        <q.icon className={`h-4 w-4 mr-2 ${q.color}`} />
                        <span className="text-xs">{q.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i}>
                      <div
                        className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="p-1.5 rounded-full bg-primary/10 h-7 w-7 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[85%] text-sm ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.content || (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-xs">Analyse en cours...</span>
                            </div>
                          )}
                        </div>
                        {msg.role === 'user' && (
                          <div className="p-1.5 rounded-full bg-primary h-7 w-7 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {msg.role === 'assistant' && msg.chartType && msg.content && (
                        <div className="ml-9 mr-2">
                          <ChatCharts 
                            chartType={msg.chartType}
                            products={products}
                            sales={sales}
                            clients={clients}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="p-3 border-t bg-muted/30">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button 
                  onClick={handleSend} 
                  size="icon"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Propulsé par Lovable AI • Graphiques en temps réel
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
