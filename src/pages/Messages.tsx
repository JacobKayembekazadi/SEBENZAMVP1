
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Send } from "lucide-react";

const Messages = () => {
  const conversations = [
    { id: 1, name: "Sarah Johnson", avatar: "/placeholder.svg", preview: "About the Westfield case...", unread: 2, time: "10:30 AM", online: true },
    { id: 2, name: "Michael Chen", avatar: "/placeholder.svg", preview: "Contract review completed", unread: 0, time: "Yesterday", online: false },
    { id: 3, name: "Amanda Rodriguez", avatar: "/placeholder.svg", preview: "When can we schedule the meeting?", unread: 0, time: "Yesterday", online: true },
    { id: 4, name: "Robert Williams", avatar: "/placeholder.svg", preview: "Documents received, thank you!", unread: 0, time: "Apr 10", online: false },
    { id: 5, name: "Jennifer Thompson", avatar: "/placeholder.svg", preview: "Please call me when available", unread: 1, time: "Apr 9", online: false },
  ];

  return (
    <DashboardLayout title="Messages">
      <div className="flex h-[calc(100vh-130px)]">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col bg-white rounded-l-lg">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Conversations</h2>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus size={16} />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Search messages..." className="pl-9" />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.map((chat) => (
              <div 
                key={chat.id} 
                className={`p-3 hover:bg-muted/50 cursor-pointer border-b ${chat.unread > 0 ? 'bg-muted/30' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{chat.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="font-medium truncate">{chat.name}</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{chat.time}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground truncate">{chat.preview}</p>
                      {chat.unread > 0 && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">{chat.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Main chat */}
        <div className="flex-1 flex flex-col bg-white rounded-r-lg">
          {/* Chat header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg" alt="Sarah Johnson" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">Sarah Johnson</h3>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">View Profile</Button>
            </div>
          </div>
          
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-4">
              <div className="flex flex-col max-w-[75%]">
                <div className="bg-muted p-3 rounded-lg">
                  <p>Hi Jessica, I wanted to check in about the Westfield case. Do you have the updated documents ready?</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">10:20 AM</span>
              </div>
              
              <div className="flex flex-col items-end ml-auto max-w-[75%]">
                <div className="bg-primary text-white p-3 rounded-lg">
                  <p>Hi Sarah, yes I just finished reviewing them. I'll send them over in about an hour after my meeting.</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">10:25 AM</span>
              </div>
              
              <div className="flex flex-col max-w-[75%]">
                <div className="bg-muted p-3 rounded-lg">
                  <p>Perfect, thank you! I also wanted to discuss the upcoming deposition scheduled for next week.</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">10:30 AM</span>
              </div>
            </div>
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center gap-2">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button className="h-10 w-10 p-0">
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
