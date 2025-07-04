import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Plus, Send, MoreHorizontal, Edit, Trash2, Star, Archive, 
  Reply, Forward, Paperclip, Image, File, Download, Eye, Clock,
  Phone, Video, Settings, Filter, SortAsc, Users, MessageSquare,
  CheckCircle2, AlertTriangle, Info, Calendar, Bell, Shield
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  organization?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  isBlocked?: boolean;
  isStarred?: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  isRead: boolean;
  isStarred: boolean;
  isEdited?: boolean;
  editedAt?: Date;
  replyTo?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface Conversation {
  id: string;
  participants: string[];
  name?: string;
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isStarred: boolean;
  isMuted: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: 'direct' | 'group';
  groupSettings?: {
    description: string;
    adminIds: string[];
    allowMemberInvites: boolean;
  };
}

const Messages = () => {
  const { toast } = useToast();
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for conversations and messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');

  // Dialog states
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [showNewContactDialog, setShowNewContactDialog] = useState(false);
  const [showMessageDetailsDialog, setShowMessageDetailsDialog] = useState(false);
  const [showContactDetailsDialog, setShowContactDetailsDialog] = useState(false);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [showDeleteMessageDialog, setShowDeleteMessageDialog] = useState(false);
  const [showDeleteConversationDialog, setShowDeleteConversationDialog] = useState(false);
  const [showForwardMessageDialog, setShowForwardMessageDialog] = useState(false);

  // Form states
  const [newConversationForm, setNewConversationForm] = useState({
    type: 'direct' as 'direct' | 'group',
    participants: [] as string[],
    name: '',
    description: ''
  });

  const [newContactForm, setNewContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    organization: ''
  });

  // Selected items
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  // Filter states
  const [conversationFilter, setConversationFilter] = useState('all');
  const [messagePriority, setMessagePriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');

  // Mock data initialization
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        organization: 'Johnson & Associates',
        status: 'online',
        isStarred: true
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 234-5678',
        organization: 'Chen Legal Group',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000)
      },
      {
        id: '3',
        name: 'Amanda Rodriguez',
        email: 'amanda.rodriguez@email.com',
        phone: '+1 (555) 345-6789',
        organization: 'Rodriguez Law Firm',
        status: 'away'
      }
    ];

    const mockConversations: Conversation[] = [
      {
        id: 'conv1',
        participants: ['1', 'current-user'],
        unreadCount: 2,
        isArchived: false,
        isStarred: true,
        isMuted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'direct'
      },
      {
        id: 'conv2',
        participants: ['2', 'current-user'],
        unreadCount: 0,
        isArchived: false,
        isStarred: false,
        isMuted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'direct'
      }
    ];

    const mockMessages: Message[] = [
      {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: '1',
        content: 'Hi Jessica, I wanted to check in about the Westfield case. Do you have the updated documents ready?',
        timestamp: new Date(Date.now() - 600000),
        type: 'text',
        isRead: true,
        isStarred: false,
        priority: 'normal'
      },
      {
        id: 'msg2',
        conversationId: 'conv1',
        senderId: 'current-user',
        content: 'Hi Sarah, yes I just finished reviewing them. I\'ll send them over in about an hour after my meeting.',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        isRead: true,
        isStarred: false,
        priority: 'normal'
      }
    ];

    setContacts(mockContacts);
    setConversations(mockConversations);
    setMessages(mockMessages);
    setSelectedConversation('conv1');
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // CRUD Operations

  // Create new conversation
  const handleCreateConversation = () => {
    if (newConversationForm.participants.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one participant.",
        variant: "destructive"
      });
      return;
    }

    const newConversation: Conversation = {
      id: `conv${Date.now()}`,
      participants: [...newConversationForm.participants, 'current-user'],
      name: newConversationForm.type === 'group' ? newConversationForm.name : undefined,
      unreadCount: 0,
      isArchived: false,
      isStarred: false,
      isMuted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: newConversationForm.type,
      groupSettings: newConversationForm.type === 'group' ? {
        description: newConversationForm.description,
        adminIds: ['current-user'],
        allowMemberInvites: true
      } : undefined
    };

    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation.id);
    setShowNewConversationDialog(false);
    setNewConversationForm({ type: 'direct', participants: [], name: '', description: '' });

    toast({
      title: "Success",
      description: "New conversation created successfully!"
    });
  };

  // Send message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `msg${Date.now()}`,
      conversationId: selectedConversation,
      senderId: 'current-user',
      content: messageInput,
      timestamp: new Date(),
      type: 'text',
      isRead: true,
      isStarred: false,
      priority: messagePriority,
      replyTo: replyToMessage?.id
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    setReplyToMessage(null);
    setMessagePriority('normal');

    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, updatedAt: new Date(), lastMessage: newMessage }
        : conv
    ));

    toast({
      title: "Message sent",
      description: "Your message has been delivered."
    });
  };

  // Edit message
  const handleEditMessage = (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent, isEdited: true, editedAt: new Date() }
        : msg
    ));

    toast({
      title: "Message updated",
      description: "Your message has been edited successfully."
    });
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    setShowDeleteMessageDialog(false);
    setSelectedMessage(null);

    toast({
      title: "Message deleted",
      description: "The message has been removed from the conversation."
    });
  };

  // Star/unstar message
  const handleToggleMessageStar = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  // Archive conversation
  const handleArchiveConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, isArchived: !conv.isArchived } : conv
    ));

    toast({
      title: "Conversation archived",
      description: "The conversation has been moved to the archive."
    });
  };

  // Delete conversation
  const handleDeleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    setMessages(prev => prev.filter(msg => msg.conversationId !== conversationId));
    setSelectedConversation(null);
    setShowDeleteConversationDialog(false);

    toast({
      title: "Conversation deleted",
      description: "The conversation and all messages have been permanently deleted."
    });
  };

  // Add new contact
  const handleAddContact = () => {
    if (!newContactForm.name || !newContactForm.email) {
      toast({
        title: "Error",
        description: "Name and email are required fields.",
        variant: "destructive"
      });
      return;
    }

    const newContact: Contact = {
      id: `contact${Date.now()}`,
      name: newContactForm.name,
      email: newContactForm.email,
      phone: newContactForm.phone,
      organization: newContactForm.organization,
      status: 'offline'
    };

    setContacts(prev => [...prev, newContact]);
    setShowNewContactDialog(false);
    setNewContactForm({ name: '', email: '', phone: '', organization: '' });

    toast({
      title: "Contact added",
      description: "New contact has been added successfully!"
    });
  };

  // Mark messages as read
  const handleMarkAsRead = (conversationId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.conversationId === conversationId ? { ...msg, isRead: true } : msg
    ));
    
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  // Filter functions
  const getFilteredConversations = () => {
    let filtered = conversations;

    if (conversationFilter === 'unread') {
      filtered = filtered.filter(conv => conv.unreadCount > 0);
    } else if (conversationFilter === 'starred') {
      filtered = filtered.filter(conv => conv.isStarred);
    } else if (conversationFilter === 'archived') {
      filtered = filtered.filter(conv => conv.isArchived);
    } else if (conversationFilter === 'all') {
      filtered = filtered.filter(conv => !conv.isArchived);
    }

    if (searchTerm) {
      filtered = filtered.filter(conv => {
        const participant = contacts.find(c => conv.participants.includes(c.id));
        return participant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               conv.name?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  };

  const getConversationMessages = () => {
    let filtered = messages.filter(msg => msg.conversationId === selectedConversation);

    if (messageSearchTerm) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(messageSearchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const getContactName = (contactId: string) => {
    return contacts.find(c => c.id === contactId)?.name || 'Unknown';
  };

  const getContactAvatar = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact?.avatar || `/placeholder.svg`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const selectedConversationContact = selectedConversationData?.participants.find(p => p !== 'current-user');
  const conversationContactData = contacts.find(c => c.id === selectedConversationContact);

  return (
    <DashboardLayout title="Messages">
      <div className="flex h-[calc(100vh-130px)] gap-4">
        {/* Sidebar */}
        <div className="w-80 border rounded-lg flex flex-col bg-white">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Messages</h2>
              <div className="flex gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Filter size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setConversationFilter('all')}>
                      All Conversations
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConversationFilter('unread')}>
                      Unread Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConversationFilter('starred')}>
                      Starred
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConversationFilter('archived')}>
                      Archived
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowNewConversationDialog(true)}>
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search conversations..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {getFilteredConversations().map((conversation) => {
              const participant = contacts.find(c => conversation.participants.includes(c.id));
              const displayName = conversation.name || participant?.name || 'Unknown';
              
              return (
                <div 
                  key={conversation.id} 
                  className={`p-3 hover:bg-muted/50 cursor-pointer border-b ${
                    conversation.unreadCount > 0 ? 'bg-muted/30' : ''
                  } ${selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    handleMarkAsRead(conversation.id);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={participant?.avatar || "/placeholder.svg"} alt={displayName} />
                        <AvatarFallback>{displayName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {participant?.status === 'online' && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{displayName}</p>
                          {conversation.isStarred && <Star size={12} className="text-yellow-500" />}
                          {conversation.isMuted && <Bell size={12} className="text-gray-400" />}
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : formatTime(conversation.updatedAt)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Main chat area */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-white rounded-lg border">
            {/* Chat header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={getContactAvatar(selectedConversationContact || '')} alt={conversationContactData?.name} />
                  <AvatarFallback>
                    {conversationContactData?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{conversationContactData?.name || 'Unknown'}</h3>
                  <p className="text-xs text-muted-foreground">
                    {conversationContactData?.status === 'online' ? 'Online' : 
                     conversationContactData?.lastSeen ? `Last seen ${formatTime(conversationContactData.lastSeen)}` : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input 
                    placeholder="Search messages..." 
                    className="pl-9 w-48" 
                    size="sm"
                    value={messageSearchTerm}
                    onChange={(e) => setMessageSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Phone size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video size={16} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setShowContactDetailsDialog(true)}>
                      <Eye size={16} className="mr-2" />
                      View Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchiveConversation(selectedConversation)}>
                      <Archive size={16} className="mr-2" />
                      {selectedConversationData?.isArchived ? 'Unarchive' : 'Archive'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => setShowDeleteConversationDialog(true)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {getConversationMessages().map((message) => {
                  const isOwn = message.senderId === 'current-user';
                  const sender = contacts.find(c => c.id === message.senderId);
                  
                  return (
                    <div key={message.id} className={`flex flex-col ${isOwn ? 'items-end ml-auto' : ''} max-w-[75%]`}>
                      {message.replyTo && (
                        <div className="text-xs text-gray-500 mb-1 px-3">
                          Replying to: {messages.find(m => m.id === message.replyTo)?.content.substring(0, 50)}...
                        </div>
                      )}
                      <div className="group relative">
                        <div className={`p-3 rounded-lg ${
                          isOwn ? 'bg-primary text-white' : 'bg-white border'
                        } ${message.priority === 'high' ? 'border-l-4 border-l-orange-500' : ''}
                        ${message.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}`}>
                          <p>{message.content}</p>
                          {message.isEdited && (
                            <span className="text-xs opacity-70 italic"> (edited)</span>
                          )}
                        </div>
                        
                        {/* Message actions */}
                        <div className="absolute top-0 right-0 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-white border shadow-sm">
                                <MoreHorizontal size={12} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setReplyToMessage(message)}>
                                <Reply size={16} className="mr-2" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setShowForwardMessageDialog(true)}>
                                <Forward size={16} className="mr-2" />
                                Forward
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleMessageStar(message.id)}>
                                <Star size={16} className={`mr-2 ${message.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                {message.isStarred ? 'Unstar' : 'Star'}
                              </DropdownMenuItem>
                              {isOwn && (
                                <>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedMessage(message);
                                    // Open edit dialog (would need to implement)
                                  }}>
                                    <Edit size={16} className="mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedMessage(message);
                                      setShowDeleteMessageDialog(true);
                                    }}
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.isStarred && <Star size={10} className="text-yellow-500" />}
                        {isOwn && (
                          <CheckCircle2 size={10} className={message.isRead ? 'text-blue-500' : 'text-gray-400'} />
                        )}
                        {message.priority !== 'normal' && (
                          <Badge variant={message.priority === 'urgent' ? 'destructive' : 'secondary'} className="text-xs py-0">
                            {message.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Reply preview */}
            {replyToMessage && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Reply size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-600">
                      Replying to: {replyToMessage.content.substring(0, 50)}...
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setReplyToMessage(null)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
            
            {/* Input area */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Select value={messagePriority} onValueChange={(value: any) => setMessagePriority(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => setShowAttachmentDialog(true)}>
                  <Paperclip size={16} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Image size={16} />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  ref={messageInputRef}
                  placeholder="Type a message..." 
                  className="flex-1" 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white rounded-lg border">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      
      {/* New Conversation Dialog */}
      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Conversation Type</Label>
              <Select 
                value={newConversationForm.type} 
                onValueChange={(value: 'direct' | 'group') => setNewConversationForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct Message</SelectItem>
                  <SelectItem value="group">Group Conversation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Select Participants</Label>
              <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                {contacts.map(contact => (
                  <div key={contact.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={contact.id}
                      checked={newConversationForm.participants.includes(contact.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewConversationForm(prev => ({
                            ...prev,
                            participants: [...prev.participants, contact.id]
                          }));
                        } else {
                          setNewConversationForm(prev => ({
                            ...prev,
                            participants: prev.participants.filter(p => p !== contact.id)
                          }));
                        }
                      }}
                    />
                    <label htmlFor={contact.id} className="flex items-center gap-2 cursor-pointer">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback className="text-xs">{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{contact.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {newConversationForm.type === 'group' && (
              <>
                <div>
                  <Label>Group Name</Label>
                  <Input
                    value={newConversationForm.name}
                    onChange={(e) => setNewConversationForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter group name"
                  />
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={newConversationForm.description}
                    onChange={(e) => setNewConversationForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter group description"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateConversation}>
                Start Conversation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Contact Dialog */}
      <Dialog open={showNewContactDialog} onOpenChange={setShowNewContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={newContactForm.name}
                onChange={(e) => setNewContactForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newContactForm.email}
                onChange={(e) => setNewContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={newContactForm.phone}
                onChange={(e) => setNewContactForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label>Organization</Label>
              <Input
                value={newContactForm.organization}
                onChange={(e) => setNewContactForm(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Enter organization"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewContactDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddContact}>
                Add Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Message Confirmation */}
      <AlertDialog open={showDeleteMessageDialog} onOpenChange={setShowDeleteMessageDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedMessage && handleDeleteMessage(selectedMessage.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Conversation Confirmation */}
      <AlertDialog open={showDeleteConversationDialog} onOpenChange={setShowDeleteConversationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entire conversation? All messages will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedConversation && handleDeleteConversation(selectedConversation)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Messages;
