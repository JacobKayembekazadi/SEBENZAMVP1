import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Users, 
  Eye, 
  Send, 
  X, 
  FileText,
  Calendar,
  Clock
} from 'lucide-react';
import { Client } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

interface BulkEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: Client[];
  selectedClientIds?: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'newsletter' | 'update' | 'reminder' | 'marketing';
}

const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Monthly Newsletter',
    subject: 'Your Monthly Legal Update',
    content: `Dear {{firstName}},

We hope this message finds you well. Here's your monthly update from our firm:

{{content}}

Best regards,
{{senderName}}
{{firmName}}`,
    category: 'newsletter'
  },
  {
    id: '2',
    name: 'Case Update',
    subject: 'Update on Your Case',
    content: `Dear {{firstName}} {{lastName}},

We wanted to provide you with an update on your case:

{{content}}

If you have any questions, please don't hesitate to contact us.

Best regards,
{{senderName}}`,
    category: 'update'
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    subject: 'Upcoming Appointment Reminder',
    content: `Dear {{firstName}},

This is a friendly reminder about your upcoming appointment:

Date: {{appointmentDate}}
Time: {{appointmentTime}}
Location: {{location}}

{{content}}

Please confirm your attendance by replying to this email.

Best regards,
{{senderName}}`,
    category: 'reminder'
  }
];

export function BulkEmailDialog({ open, onOpenChange, clients, selectedClientIds = [] }: BulkEmailDialogProps) {
  const { toast } = useToast();
  const [selectedClients, setSelectedClients] = useState<string[]>(selectedClientIds);
  const [emailData, setEmailData] = useState({
    subject: '',
    content: '',
    senderName: 'John Attorney',
    firmName: 'Legal Firm LLC'
  });
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewClient, setPreviewClient] = useState<Client | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const handleClientToggle = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c.id));
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content
    }));
  };

  const renderEmailPreview = (client: Client) => {
    if (!client) return '';
    
    let content = emailData.content;
    content = content.replace(/{{firstName}}/g, client.firstName);
    content = content.replace(/{{lastName}}/g, client.lastName);
    content = content.replace(/{{senderName}}/g, emailData.senderName);
    content = content.replace(/{{firmName}}/g, emailData.firmName);
    content = content.replace(/{{email}}/g, client.email || '');
    content = content.replace(/{{company}}/g, client.company || '');
    
    return content;
  };

  const handleSendEmail = () => {
    if (selectedClients.length === 0) {
      toast({
        title: 'No Recipients',
        description: 'Please select at least one client to send the email.',
        variant: 'destructive'
      });
      return;
    }

    if (!emailData.subject.trim() || !emailData.content.trim()) {
      toast({
        title: 'Missing Content',
        description: 'Please provide both subject and content for the email.',
        variant: 'destructive'
      });
      return;
    }

    // In a real app, this would send the actual emails
    const action = isScheduled ? 'scheduled' : 'sent';
    const timing = isScheduled ? ` for ${scheduledDate} at ${scheduledTime}` : '';
    
    toast({
      title: `Email ${action}`,
      description: `Email ${action} to ${selectedClients.length} client(s)${timing}.`,
    });

    // Reset form
    setEmailData({ subject: '', content: '', senderName: 'John Attorney', firmName: 'Legal Firm LLC' });
    setSelectedClients([]);
    setSelectedTemplate(null);
    setPreviewClient(null);
    setIsScheduled(false);
    setScheduledDate('');
    setScheduledTime('');
    onOpenChange(false);
  };

  const selectedClientsData = clients.filter(c => selectedClients.includes(c.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Email to Clients
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="compose" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="recipients">Recipients ({selectedClients.length})</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 h-[500px]">
            <TabsContent value="compose" className="h-full space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="sender">Sender Name</Label>
                    <Input
                      id="sender"
                      value={emailData.senderName}
                      onChange={(e) => setEmailData(prev => ({ ...prev, senderName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    value={emailData.content}
                    onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your email content... Use {{firstName}}, {{lastName}}, {{company}} for personalization"
                    className="h-[300px]"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Available variables: {{firstName}}, {{lastName}}, {{email}}, {{company}}, {{senderName}}, {{firmName}}
                  </div>
                </div>

                {/* Scheduling Options */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedule"
                      checked={isScheduled}
                      onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                    />
                    <Label htmlFor="schedule" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Schedule for later
                    </Label>
                  </div>
                  
                  {isScheduled && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recipients" className="h-full">
              <div className="space-y-4 h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Select Recipients</h3>
                  <Button variant="outline" onClick={handleSelectAll}>
                    {selectedClients.length === clients.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {clients.map(client => (
                      <div
                        key={client.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedClients.includes(client.id)}
                            onCheckedChange={() => handleClientToggle(client.id)}
                          />
                          <div>
                            <div className="font-medium">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {client.email} {client.company && `• ${client.company}`}
                            </div>
                          </div>
                        </div>
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {selectedClients.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">Selected Recipients:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedClientsData.map(client => (
                        <Badge key={client.id} variant="secondary" className="gap-1">
                          {client.firstName} {client.lastName}
                          <button
                            onClick={() => handleClientToggle(client.id)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="h-full">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Templates</h3>
                <div className="grid gap-4">
                  {emailTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-accent/50 ${
                        selectedTemplate?.id === template.id ? 'border-primary bg-accent/20' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">{template.name}</span>
                            <Badge variant="outline">{template.category}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Subject: {template.subject}
                          </div>
                          <div className="text-sm">
                            {template.content.substring(0, 150)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="h-full">
              <div className="space-y-4 h-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Email Preview</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="preview-client">Preview for:</Label>
                    <select
                      id="preview-client"
                      className="border rounded px-2 py-1"
                      value={previewClient?.id || ''}
                      onChange={(e) => {
                        const client = clients.find(c => c.id === e.target.value);
                        setPreviewClient(client || null);
                      }}
                    >
                      <option value="">Select client...</option>
                      {selectedClientsData.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {previewClient ? (
                  <div className="border rounded-lg p-4 space-y-3 bg-background">
                    <div className="border-b pb-2">
                      <div className="text-sm text-muted-foreground">To: {previewClient.email}</div>
                      <div className="font-medium">Subject: {emailData.subject}</div>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {renderEmailPreview(previewClient)}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a client to preview the email</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} className="flex items-center gap-2">
            {isScheduled ? <Calendar className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {isScheduled ? 'Schedule Email' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 