import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  Plus,
  Search,
  Filter,
  FileText,
  Video,
  Clock
} from 'lucide-react';
import { Client } from '@/lib/store';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CommunicationEntry {
  id: string;
  clientId: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'video' | 'document';
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  date: Date;
  duration?: number; // in minutes
  participants: string[];
  attachments?: { name: string; url: string }[];
  followUpRequired: boolean;
  followUpDate?: Date;
  status: 'completed' | 'scheduled' | 'cancelled';
}

interface CommunicationLogProps {
  client: Client;
  onAddCommunication: (entry: Omit<CommunicationEntry, 'id' | 'date'>) => void;
}

const mockCommunications: CommunicationEntry[] = [
  {
    id: '1',
    clientId: '1',
    type: 'email',
    direction: 'outbound',
    subject: 'Case Update - Contract Review',
    content: 'Dear John, I wanted to update you on the progress of your contract review...',
    date: new Date('2024-01-15T10:30:00'),
    participants: ['John Attorney', 'John Doe'],
    followUpRequired: false,
    status: 'completed'
  },
  {
    id: '2',
    clientId: '1',
    type: 'phone',
    direction: 'inbound',
    subject: 'Follow-up questions about contract terms',
    content: 'Client called to clarify several terms in the contract. Discussed pricing structure and delivery timeline.',
    date: new Date('2024-01-12T14:15:00'),
    duration: 25,
    participants: ['John Attorney', 'John Doe'],
    followUpRequired: true,
    followUpDate: new Date('2024-01-20T10:00:00'),
    status: 'completed'
  },
  {
    id: '3',
    clientId: '1',
    type: 'meeting',
    direction: 'outbound',
    subject: 'Initial Consultation',
    content: 'Initial meeting to discuss legal needs and establish attorney-client relationship.',
    date: new Date('2024-01-10T09:00:00'),
    duration: 60,
    participants: ['John Attorney', 'Jane Paralegal', 'John Doe'],
    followUpRequired: true,
    followUpDate: new Date('2024-01-15T10:00:00'),
    status: 'completed'
  }
];

export function CommunicationLog({ client, onAddCommunication }: CommunicationLogProps) {
  const [communications, setCommunications] = useState<CommunicationEntry[]>(
    mockCommunications.filter(c => c.clientId === client.id)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    type: 'email' as CommunicationEntry['type'],
    direction: 'outbound' as CommunicationEntry['direction'],
    subject: '',
    content: '',
    duration: undefined as number | undefined,
    participants: ['John Attorney'],
    followUpRequired: false,
    followUpDate: undefined as Date | undefined,
    status: 'completed' as CommunicationEntry['status']
  });

  const communicationIcons = {
    email: Mail,
    phone: Phone,
    meeting: Calendar,
    note: MessageSquare,
    video: Video,
    document: FileText,
  };

  const communicationColors = {
    email: 'bg-blue-100 text-blue-800',
    phone: 'bg-green-100 text-green-800',
    meeting: 'bg-purple-100 text-purple-800',
    note: 'bg-gray-100 text-gray-800',
    video: 'bg-orange-100 text-orange-800',
    document: 'bg-yellow-100 text-yellow-800',
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = searchTerm === '' || 
      comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || comm.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleAddEntry = () => {
    const entry: CommunicationEntry = {
      id: String(Date.now()),
      clientId: client.id,
      date: new Date(),
      ...newEntry
    };
    
    setCommunications(prev => [entry, ...prev]);
    onAddCommunication(newEntry);
    
    // Reset form
    setNewEntry({
      type: 'email',
      direction: 'outbound',
      subject: '',
      content: '',
      duration: undefined,
      participants: ['John Attorney'],
      followUpRequired: false,
      followUpDate: undefined,
      status: 'completed'
    });
    
    setIsAddDialogOpen(false);
  };

  const upcomingFollowUps = communications.filter(c => 
    c.followUpRequired && 
    c.followUpDate && 
    c.followUpDate > new Date()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communication Log
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Communication Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newEntry.type}
                      onValueChange={(value) => setNewEntry(prev => ({ ...prev, type: value as CommunicationEntry['type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="video">Video Call</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Direction</Label>
                    <Select
                      value={newEntry.direction}
                      onValueChange={(value) => setNewEntry(prev => ({ ...prev, direction: value as CommunicationEntry['direction'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outbound">Outbound</SelectItem>
                        <SelectItem value="inbound">Inbound</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={newEntry.subject}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief subject or title"
                  />
                </div>
                
                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Detailed description of the communication"
                    className="h-24"
                  />
                </div>
                
                {(newEntry.type === 'phone' || newEntry.type === 'meeting' || newEntry.type === 'video') && (
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={newEntry.duration || ''}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, duration: parseInt(e.target.value) || undefined }))}
                      placeholder="Duration in minutes"
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="followUp"
                    checked={newEntry.followUpRequired}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                  />
                  <Label htmlFor="followUp">Follow-up required</Label>
                </div>
                
                {newEntry.followUpRequired && (
                  <div>
                    <Label>Follow-up Date</Label>
                    <Input
                      type="datetime-local"
                      onChange={(e) => setNewEntry(prev => ({ 
                        ...prev, 
                        followUpDate: e.target.value ? new Date(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEntry}>
                    Add Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setFilterType('all')}>All</TabsTrigger>
              <TabsTrigger value="email" onClick={() => setFilterType('email')}>Email</TabsTrigger>
              <TabsTrigger value="phone" onClick={() => setFilterType('phone')}>Calls</TabsTrigger>
              <TabsTrigger value="meeting" onClick={() => setFilterType('meeting')}>Meetings</TabsTrigger>
              <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredCommunications.map((comm) => {
                  const Icon = communicationIcons[comm.type];
                  const colorClass = communicationColors[comm.type];
                  
                  return (
                    <div key={comm.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={colorClass}>
                            <Icon className="h-3 w-3 mr-1" />
                            {comm.type}
                          </Badge>
                          <Badge variant={comm.direction === 'inbound' ? 'destructive' : 'default'}>
                            {comm.direction}
                          </Badge>
                          {comm.followUpRequired && (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Follow-up
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(comm.date, 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-medium">{comm.subject}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{comm.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                          Participants: {comm.participants.join(', ')}
                          {comm.duration && ` • Duration: ${comm.duration} min`}
                        </div>
                        {comm.followUpDate && (
                          <div>
                            Follow-up: {format(comm.followUpDate, 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {filteredCommunications.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No communications found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="follow-ups" className="space-y-0">
            <div className="space-y-3">
              <h4 className="font-medium">Upcoming Follow-ups</h4>
              {upcomingFollowUps.length > 0 ? (
                <div className="space-y-2">
                  {upcomingFollowUps.map((comm) => (
                    <div key={comm.id} className="border rounded-lg p-3 bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{comm.subject}</span>
                          <p className="text-sm text-muted-foreground">{comm.content}</p>
                        </div>
                        <Badge variant="outline">
                          {comm.followUpDate && format(comm.followUpDate, 'MMM d')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming follow-ups</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 