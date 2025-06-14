import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { useAppState, Client } from '@/lib/store';
import { ClientOverview } from '@/components/clients/enhanced/ClientOverview';
import { ClientCategories } from '@/components/clients/enhanced/ClientCategories';
import { ClientTags } from '@/components/clients/enhanced/ClientTags';
import { ClientTimeline } from '@/components/clients/enhanced/ClientTimeline';
import { ClientNotes } from '@/components/clients/enhanced/ClientNotes';
import { ClientAnalytics } from '@/components/clients/enhanced/ClientAnalytics';
import { ClientRelationships } from '@/components/clients/enhanced/ClientRelationships';
import { useToast } from '@/hooks/use-toast';

// Mock enhanced client data
const mockEnhancedClient: Client = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  company: 'Acme Corporation',
  type: 'business',
  status: 'active',
  createdAt: new Date('2023-01-15'),
  categories: ['Corporate', 'VIP'],
  tags: ['technology', 'high-value', 'long-term'],
  priority: 'high',
  relatedClients: ['2', '3'],
  notes: [
    {
      id: '1',
      content: 'Initial consultation went well. Client is interested in our full service package.',
      createdAt: new Date('2023-01-15'),
      createdBy: 'John Attorney',
    },
    {
      id: '2',
      content: 'Follow-up meeting scheduled for next week to discuss contract details.',
      createdAt: new Date('2023-01-20'),
      createdBy: 'John Attorney',
    },
  ],
  metrics: {
    totalBilling: 125000,
    averageCaseValue: 25000,
    clientSince: new Date('2023-01-15'),
    lastPayment: new Date('2024-01-10'),
    paymentHistory: [
      { date: new Date('2023-02-15'), amount: 15000, status: 'paid' },
      { date: new Date('2023-04-20'), amount: 25000, status: 'paid' },
      { date: new Date('2023-06-10'), amount: 20000, status: 'paid' },
      { date: new Date('2023-08-15'), amount: 30000, status: 'paid' },
      { date: new Date('2023-10-20'), amount: 15000, status: 'paid' },
      { date: new Date('2023-12-15'), amount: 20000, status: 'paid' },
    ],
  },
  communicationPreferences: {
    preferredMethod: 'email',
    preferredTime: '9:00 AM - 5:00 PM',
    doNotContact: false,
    language: 'English',
  },
  documents: [
    {
      id: '1',
      name: 'Service Agreement.pdf',
      type: 'contract',
      uploadedAt: new Date('2023-01-20'),
      url: '#',
    },
    {
      id: '2',
      name: 'Case Brief - Q2 2023.docx',
      type: 'brief',
      uploadedAt: new Date('2023-04-15'),
      url: '#',
    },
  ],
  activity: [
    {
      id: '1',
      type: 'meeting',
      description: 'Initial consultation meeting',
      date: new Date('2023-01-15'),
      user: 'John Attorney',
    },
    {
      id: '2',
      type: 'document',
      description: 'Service agreement signed',
      date: new Date('2023-01-20'),
      user: 'System',
    },
    {
      id: '3',
      type: 'payment',
      description: 'Payment received - $15,000',
      date: new Date('2023-02-15'),
      user: 'System',
    },
    {
      id: '4',
      type: 'email',
      description: 'Sent case update email',
      date: new Date('2023-03-10'),
      user: 'Jane Paralegal',
    },
    {
      id: '5',
      type: 'call',
      description: 'Follow-up call regarding new case',
      date: new Date('2023-05-20'),
      user: 'John Attorney',
    },
  ],
};

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state, dispatch } = useAppState();
  const { clients, user } = state;
  
  // In a real app, you would fetch the client from the API
  const [client, setClient] = useState<Client>(mockEnhancedClient);

  const handleUpdateCategories = (categories: string[]) => {
    dispatch({ type: 'UPDATE_CLIENT_CATEGORIES', payload: { id: client.id, categories } });
    setClient({ ...client, categories });
    toast({
      title: 'Categories Updated',
      description: 'Client categories have been updated successfully.',
    });
  };

  const handleUpdateTags = (tags: string[]) => {
    dispatch({ type: 'UPDATE_CLIENT_TAGS', payload: { id: client.id, tags } });
    setClient({ ...client, tags });
    toast({
      title: 'Tags Updated',
      description: 'Client tags have been updated successfully.',
    });
  };

  const handleUpdateRelationships = (relatedClients: string[]) => {
    dispatch({ type: 'UPDATE_CLIENT_RELATIONSHIPS', payload: { id: client.id, relatedClients } });
    setClient({ ...client, relatedClients });
    toast({
      title: 'Relationships Updated',
      description: 'Client relationships have been updated successfully.',
    });
  };

  const handleAddNote = (note: { content: string }) => {
    const newNote: Client['notes'][0] = {
      id: String(Date.now()),
      content: note.content,
      createdAt: new Date(),
      createdBy: user?.firstName + ' ' + user?.lastName || 'Unknown User',
    };
    
    dispatch({ type: 'ADD_CLIENT_NOTE', payload: { clientId: client.id, note: newNote } });
    setClient({ ...client, notes: [...client.notes, newNote] });
    
    // Also add to activity
    const activity: Client['activity'][0] = {
      id: String(Date.now()),
      type: 'note',
      description: 'Added a new note',
      date: new Date(),
      user: newNote.createdBy,
    };
    
    dispatch({ type: 'ADD_CLIENT_ACTIVITY', payload: { clientId: client.id, activity } });
    setClient(prev => ({ ...prev, activity: [...prev.activity, activity] }));
    
    toast({
      title: 'Note Added',
      description: 'Your note has been added successfully.',
    });
  };

  // Get all unique tags from all clients for suggestions
  const allTags = Array.from(new Set(clients.flatMap(c => c.tags || []))) as string[];

  return (
    <DashboardLayout 
      title={`${client.firstName} ${client.lastName}`}
      description="View and manage client information"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/clients')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Overview and Quick Info */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <ClientOverview 
            client={client} 
            totalCases={5}
            activeCases={3}
          />
          <div className="space-y-4">
            <ClientCategories 
              client={client} 
              onUpdate={handleUpdateCategories} 
            />
            <ClientTags 
              client={client} 
              onUpdate={handleUpdateTags}
              allTags={allTags}
            />
          </div>
        </div>

        {/* Middle Column - Timeline and Notes */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <ClientTimeline client={client} />
          <ClientNotes 
            client={client}
            currentUser={user?.firstName + ' ' + user?.lastName || 'Unknown User'}
            onAddNote={handleAddNote}
          />
        </div>

        {/* Right Column - Analytics and Relationships */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <ClientAnalytics client={client} />
          <ClientRelationships 
            client={client}
            allClients={clients}
            onUpdate={handleUpdateRelationships}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetails; 