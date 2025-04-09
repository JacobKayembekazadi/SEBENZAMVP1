
import React, { useState } from 'react';
import { MessageSquare, X, Send, ArrowUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

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

  const suggestedPrompts = [
    "Summarize deposition",
    "Draft NDA agreement",
    "Analyze contract clauses",
    "Research case precedents"
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
            <div className="p-3 border-t border-gray-100">
              <p className="text-xs text-muted-foreground mb-2">Suggested prompts:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="bg-secondary-light text-xs px-2 py-1 rounded-full text-primary hover:bg-gray-200 transition-colors"
                    onClick={() => setInputValue(prompt)}
                  >
                    {prompt}
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
