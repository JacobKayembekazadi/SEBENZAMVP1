import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  MessageSquare, 
  FileText, 
  Receipt, 
  Calculator, 
  CreditCard, 
  Clock,
  FolderClosed,
  Settings,
  LogOut,
  Bell,
  Download,
  Upload,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Import components we'll create
import { ClientProfile } from './ClientProfile';
import { ClientCommunication } from './ClientCommunication';
import { ClientDocuments } from './ClientDocuments';
import { ClientInvoices } from './ClientInvoices';
import { ClientQuotes } from './ClientQuotes';
import { ClientPayments } from './ClientPayments';
import { ClientCases } from './ClientCases';

interface ClientData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  type: 'individual' | 'business';
  cases: Array<{ id: string; title: string; status: string }>;
  hasUnreadMessages: number;
  pendingInvoices: number;
  lastLogin: string;
}

interface ClientPortalDashboardProps {
  clientData: ClientData;
  onLogout: () => void;
}

export function ClientPortalDashboard({ clientData, onLogout }: ClientPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getInitials = () => {
    return `${clientData.firstName.charAt(0)}${clientData.lastName.charAt(0)}`.toUpperCase();
  };

  const getQuickStats = () => {
    return {
      activeCases: clientData.cases.filter(c => c.status === 'active').length,
      pendingInvoices: clientData.pendingInvoices,
      unreadMessages: clientData.hasUnreadMessages,
      totalCases: clientData.cases.length
    };
  };

  const stats = getQuickStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Client Portal</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={18} />
                {(stats.unreadMessages > 0 || stats.pendingInvoices > 0) && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.unreadMessages + stats.pendingInvoices}
                  </span>
                )}
              </Button>
              
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="" alt={`${clientData.firstName} ${clientData.lastName}`} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {clientData.firstName} {clientData.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {clientData.companyName || 'Individual Client'}
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" onClick={onLogout} className="text-gray-500 hover:text-gray-700">
                <LogOut size={18} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="communication">Messages</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderClosed size={24} className="text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeCases}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Receipt size={24} className="text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Invoices</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <MessageSquare size={24} className="text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Unread Messages</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock size={24} className="text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Case Updates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {clientData.cases.slice(0, 3).map((case_) => (
                    <div key={case_.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{case_.title}</p>
                        <p className="text-sm text-gray-500">Case #{case_.id}</p>
                      </div>
                      <Badge variant={case_.status === 'active' ? 'default' : 'secondary'}>
                        {case_.status}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('cases')}>
                    View All Cases
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('communication')}
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Send Message to Legal Team
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('documents')}
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Document
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('invoices')}
                  >
                    <Receipt size={16} className="mr-2" />
                    View Invoices
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('payments')}
                  >
                    <CreditCard size={16} className="mr-2" />
                    Payment History
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Pending Items */}
            {(stats.pendingInvoices > 0 || stats.unreadMessages > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-amber-500" />
                    Items Requiring Attention
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.pendingInvoices > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <Receipt size={16} className="text-red-600 mr-2" />
                        <span className="text-red-800">
                          You have {stats.pendingInvoices} pending invoice{stats.pendingInvoices !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button size="sm" onClick={() => setActiveTab('invoices')}>
                        View Invoices
                      </Button>
                    </div>
                  )}
                  {stats.unreadMessages > 0 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center">
                        <MessageSquare size={16} className="text-blue-600 mr-2" />
                        <span className="text-blue-800">
                          You have {stats.unreadMessages} unread message{stats.unreadMessages !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button size="sm" onClick={() => setActiveTab('communication')}>
                        View Messages
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ClientProfile clientData={clientData} />
          </TabsContent>

          {/* Cases Tab */}
          <TabsContent value="cases">
            <ClientCases clientData={clientData} />
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <ClientCommunication clientData={clientData} />
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <ClientDocuments clientData={clientData} />
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <ClientInvoices clientData={clientData} />
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes">
            <ClientQuotes clientData={clientData} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <ClientPayments clientData={clientData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 