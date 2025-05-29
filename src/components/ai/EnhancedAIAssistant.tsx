import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, List, FileText, Brain, FileSearch, FileEdit, Receipt, User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'document' | 'analysis' | 'suggestion';
  metadata?: {
    documentName?: string;
    caseReference?: string;
    confidence?: number;
  };
}

interface AIContext {
  currentPage?: string;
  selectedCases?: string[];
  selectedClients?: string[];
  activeFilters?: Record<string, any>;
}

export function EnhancedAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Hello! I'm your legal AI assistant. I can help with document analysis, case research, time tracking, and much more. How can I assist you today?", 
      isUser: false, 
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<AIContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Update context when opening
      setContext({
        currentPage: window.location.pathname,
        // You could add more context here based on current app state
      });
    }
  };

  const addMessage = (text: string, isUser: boolean, type: Message['type'] = 'text', metadata?: Message['metadata']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      type,
      metadata
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Add user message
    addMessage(inputValue, true);
    const userMessage = inputValue;
    setInputValue("");
    setIsTyping(true);
    
    // Simulate AI response with more sophisticated logic
    setTimeout(() => {
      const response = generateAIResponse(userMessage, context);
      addMessage(response.text, false, response.type, response.metadata);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Variable delay for realism
  };

  const generateAIResponse = (userMessage: string, context: AIContext): { text: string; type: Message['type']; metadata?: Message['metadata'] } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Case management queries
    if (lowerMessage.includes('case') && (lowerMessage.includes('create') || lowerMessage.includes('new'))) {
      return {
        text: "I can help you create a new case. I'll need some basic information:\n\n1. Case title\n2. Client name\n3. Practice area\n4. Initial description\n\nWould you like me to guide you through this process step by step?",
        type: 'suggestion'
      };
    }
    
    if (lowerMessage.includes('summarize') || lowerMessage.includes('summary')) {
      if (context.currentPage?.includes('dashboard')) {
        return {
          text: "Based on your current dashboard, here's today's summary:\n\n📊 **Cases**: 3 active cases requiring attention\n⏰ **Deadlines**: 2 upcoming this week\n💰 **Billing**: $4,250 in unbilled time\n📅 **Calendar**: 4 meetings scheduled today\n\n**Priority Actions:**\n- Review documents for Smith v. Jones case\n- Submit billing for completed matters\n- Prepare for 2 PM client meeting",
        type: 'analysis',
        metadata: { confidence: 0.85 }
      };
      } else {
        return {
          text: "I can provide summaries for cases, documents, or your daily activities. What would you like me to summarize?",
          type: 'text'
        };
      }
    }
    
    if (lowerMessage.includes('draft') || lowerMessage.includes('document')) {
      return {
        text: "I can help draft various legal documents:\n\n📄 **Contracts**: Service agreements, NDAs, employment contracts\n📋 **Pleadings**: Motions, complaints, answers\n📝 **Correspondence**: Client letters, demand letters\n📊 **Internal**: Memos, case summaries, research notes\n\nWhat type of document would you like to draft?",
        type: 'suggestion'
      };
    }
    
    if (lowerMessage.includes('research') || lowerMessage.includes('precedent')) {
      return {
        text: "I can assist with legal research including:\n\n⚖️ **Case Law**: Finding relevant precedents and citations\n📚 **Statutes**: Identifying applicable laws and regulations\n🔍 **Analysis**: Comparing similar cases and outcomes\n📈 **Trends**: Recent developments in your practice areas\n\nWhat specific legal issue would you like me to research?",
        type: 'analysis',
        metadata: { confidence: 0.90 }
      };
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('billing') || lowerMessage.includes('hours')) {
      return {
        text: "I can help with time tracking and billing:\n\n⏱️ **Quick Entry**: Log time with natural language\n📊 **Analysis**: Review your billing patterns\n💡 **Suggestions**: Optimize your time tracking\n📄 **Reports**: Generate billing summaries\n\nExample: 'Log 2 hours for case research on Smith matter' - would you like to try this?",
        type: 'suggestion'
      };
    }
    
    if (lowerMessage.includes('analyze') || lowerMessage.includes('review')) {
      return {
        text: "I can analyze various aspects of your practice:\n\n📄 **Documents**: Contract review, risk assessment\n📊 **Cases**: Success patterns, time allocation\n💰 **Financial**: Revenue trends, profitability\n⚖️ **Legal**: Compliance, deadline management\n\nWhat would you like me to analyze?",
        type: 'analysis'
      };
    }
    
    // Default responses
    const defaultResponses = [
      "I'm here to help with your legal practice. You can ask me about cases, clients, documents, billing, or research. What would you like assistance with?",
      "I can help streamline your workflow. Try asking me to draft documents, analyze cases, or track time. What's your priority right now?",
      "Feel free to ask me about case management, document review, legal research, or administrative tasks. How can I assist you today?"
    ];
    
    return {
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      type: 'text'
    };
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    // Auto-submit the quick action
    setTimeout(() => {
      const event = new Event('submit') as any;
      handleSendMessage(event);
    }, 100);
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const suggestedPrompts = [
    { text: "Summarize today's priorities", icon: <List size={14} className="mr-1" />, category: "productivity" },
    { text: "Draft a client agreement", icon: <FileEdit size={14} className="mr-1" />, category: "documents" },
    { text: "Research case precedents", icon: <FileSearch size={14} className="mr-1" />, category: "research" },
    { text: "Analyze contract risks", icon: <FileText size={14} className="mr-1" />, category: "analysis" },
    { text: "Log billable time", icon: <Receipt size={14} className="mr-1" />, category: "billing" },
    { text: "Review case strategy", icon: <Brain size={14} className="mr-1" />, category: "strategy" }
  ];

  const quickActions = [
    { title: "New Case", description: "Create a new case file", action: "Help me create a new case" },
    { title: "Draft Document", description: "Generate legal documents", action: "I need to draft a legal document" },
    { title: "Time Entry", description: "Log billable hours", action: "Help me log my time for today" },
    { title: "Research", description: "Legal research assistance", action: "I need help with legal research" },
    { title: "Case Review", description: "Analyze case status", action: "Review my active cases" },
    { title: "Client Update", description: "Prepare client communication", action: "Help me draft a client update" }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50" data-tour="ai-assistant">
      {isOpen ? (
        <Card className="w-80 md:w-96 shadow-xl border border-gray-200 max-h-[600px] flex flex-col">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between flex-shrink-0">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              Legal AI Assistant
              <Badge variant="secondary" className="text-xs">Enhanced</Badge>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-8 w-8">
              <X size={18} />
            </Button>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="chat" className="w-full flex-1 flex flex-col">
              <TabsList className="w-full grid grid-cols-3 rounded-none flex-shrink-0">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="actions">Quick Actions</TabsTrigger>
                <TabsTrigger value="tools">AI Tools</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-lg text-sm ${
                            msg.isUser 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="p-3">
                            <div className="flex items-start gap-2 mb-1">
                              {msg.isUser ? <User size={14} /> : <Bot size={14} />}
                              <div className="flex-1">
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                                {msg.metadata?.confidence && (
                                  <Badge variant="outline" className="text-xs mt-2">
                                    Confidence: {Math.round(msg.metadata.confidence * 100)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {!msg.isUser && (
                            <div className="px-3 pb-2 flex items-center gap-2 border-t border-gray-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => copyMessage(msg.text)}
                              >
                                <Copy size={12} className="mr-1" />
                                Copy
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <ThumbsUp size={12} />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2">
                                <ThumbsDown size={12} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 max-w-[85%]">
                          <div className="flex items-center gap-2">
                            <Bot size={14} />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-3 border-t border-gray-100 flex-shrink-0">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Suggested prompts:</p>
                    <div className="flex flex-wrap gap-1">
                      {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => setInputValue(prompt.text)}
                        >
                          {prompt.icon}
                          {prompt.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="flex-1 p-4">
                <div className="grid grid-cols-1 gap-3">
                  {quickActions.map((action, idx) => (
                    <Card key={idx} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleQuickAction(action.action)}>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tools" className="flex-1 p-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">AI-Powered Tools</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <Button variant="outline" className="text-xs justify-start h-auto py-2" onClick={() => handleQuickAction("Analyze my practice performance")}>
                        <Brain size={16} className="mr-2" />
                        <div className="text-left">
                          <div>Practice Analytics</div>
                          <div className="text-gray-500">AI insights on your firm</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="text-xs justify-start h-auto py-2" onClick={() => handleQuickAction("Help me with document automation")}>
                        <FileEdit size={16} className="mr-2" />
                        <div className="text-left">
                          <div>Document Automation</div>
                          <div className="text-gray-500">Smart template generation</div>
                        </div>
                      </Button>
                      <Button variant="outline" className="text-xs justify-start h-auto py-2" onClick={() => handleQuickAction("Predict case outcomes")}>
                        <FileSearch size={16} className="mr-2" />
                        <div className="text-left">
                          <div>Predictive Analysis</div>
                          <div className="text-gray-500">Case outcome predictions</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="p-3 pt-0 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your legal practice..."
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                disabled={isTyping || !inputValue.trim()}
              >
                <Send size={16} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          onClick={toggleOpen} 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare size={20} />
        </Button>
      )}
    </div>
  );
} 