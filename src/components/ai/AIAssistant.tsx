
import React, { useState } from 'react';
import { MessageSquare, X, Send, List, FileText, Brain, FileSearch, FileEdit, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hello! I'm your legal assistant. How can I help you today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState("");

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages([...messages, { text: inputValue, isUser: true }]);
    setInputValue("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I'm processing your request. As an AI assistant, I can help with document drafting, case research, and more.", 
        isUser: false 
      }]);
    }, 1000);
  };

  const handleQuickAction = (prompt: string) => {
    setMessages([...messages, { text: prompt, isUser: true }]);
    
    // Simulate AI response
    setTimeout(() => {
      let response = "I'm processing your request.";
      
      if (prompt.includes("summarize")) {
        response = "Today you have 3 active cases, 2 pending client meetings, and 1 document awaiting review. Your billable hours are at 85% of your monthly target.";
      } else if (prompt.includes("draft")) {
        response = "I can help draft a document. What type of document do you need? (Contract, Letter, Motion, etc.)";
      } else if (prompt.includes("research")) {
        response = "I'll help with case research. Please provide the case name or key issues you'd like me to research.";
      }
      
      setMessages(prev => [...prev, { text: response, isUser: false }]);
    }, 1000);
  };

  const suggestedPrompts = [
    { text: "Summarize today's priorities", icon: <List size={14} className="mr-1" /> },
    { text: "Draft a document", icon: <FileEdit size={14} className="mr-1" /> },
    { text: "Research case precedents", icon: <FileSearch size={14} className="mr-1" /> },
    { text: "Analyze contract clauses", icon: <FileText size={14} className="mr-1" /> },
    { text: "Generate invoice", icon: <Receipt size={14} className="mr-1" /> },
    { text: "Summarize deposition", icon: <Brain size={14} className="mr-1" /> }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 md:w-96 shadow-lg border border-gray-200">
          <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare size={18} className="text-accent" />
              Legal Assistant
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleOpen} className="h-8 w-8">
              <X size={18} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="w-full grid grid-cols-3 rounded-none">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat">
                <div className="h-64 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          msg.isUser 
                            ? 'bg-accent text-white' 
                            : 'bg-secondary-light text-primary'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="actions">
                <div className="p-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="text-xs h-auto py-2 flex justify-start" onClick={() => handleQuickAction("Draft a document")}>
                    <FileEdit size={16} className="mr-2" />
                    Draft Document
                  </Button>
                  <Button variant="outline" className="text-xs h-auto py-2 flex justify-start" onClick={() => handleQuickAction("Summarize today's priorities")}>
                    <List size={16} className="mr-2" />
                    Summarize Day
                  </Button>
                  <Button variant="outline" className="text-xs h-auto py-2 flex justify-start" onClick={() => handleQuickAction("Research case precedents")}>
                    <FileSearch size={16} className="mr-2" />
                    Research Case
                  </Button>
                  <Button variant="outline" className="text-xs h-auto py-2 flex justify-start" onClick={() => handleQuickAction("Analyze contract")}>
                    <FileText size={16} className="mr-2" />
                    Analyze Contract
                  </Button>
                  <Button variant="outline" className="text-xs h-auto py-2 flex justify-start" onClick={() => handleQuickAction("Generate invoice")}>
                    <Receipt size={16} className="mr-2" />
                    Generate Invoice
                  </Button>
                  <Button variant="outline" className="text-xs h-auto py-2 flex justify-start" onClick={() => handleQuickAction("Explain this page")}>
                    <Brain size={16} className="mr-2" />
                    Explain Page
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="docs">
                <div className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">Quick access to AI-assisted document tools:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" className="text-xs justify-start">
                      <FileEdit size={16} className="mr-2" />
                      Draft Client Agreement
                    </Button>
                    <Button variant="outline" className="text-xs justify-start">
                      <FileEdit size={16} className="mr-2" />
                      Create Settlement Proposal
                    </Button>
                    <Button variant="outline" className="text-xs justify-start">
                      <FileEdit size={16} className="mr-2" />
                      Generate Case Summary
                    </Button>
                    <Button variant="outline" className="text-xs justify-start">
                      <FileEdit size={16} className="mr-2" />
                      Draft Legal Brief
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="p-3 border-t border-gray-100">
              <p className="text-xs text-muted-foreground mb-2">Suggested prompts:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="bg-secondary-light text-xs px-2 py-1 rounded-full text-primary hover:bg-gray-200 transition-colors flex items-center"
                    onClick={() => setInputValue(prompt.text)}
                  >
                    {prompt.icon}
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" className="bg-accent hover:bg-accent-hover">
                <Send size={16} />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          onClick={toggleOpen} 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg bg-accent hover:bg-accent-hover"
        >
          <MessageSquare size={20} />
        </Button>
      )}
    </div>
  );
}
