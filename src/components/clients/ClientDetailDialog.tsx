import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  Calendar, 
  DollarSign, 
  FileText,
  MessageSquare,
  Activity,
  Star,
  Globe,
  Clock
} from 'lucide-react';
import { Client } from '@/lib/store';
import { format } from 'date-fns';

interface ClientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
}

export function ClientDetailDialog({ open, onOpenChange, client }: ClientDetailDialogProps) {
  if (!client) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return format(new Date(date), 'MMM d, yyyy');
    }
    return format(date, 'MMM d, yyyy');
  };

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'prospective':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Client['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-700">
                {getInitials(client.firstName, client.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span>{client.firstName} {client.lastName}</span>
                <Badge className={getStatusColor(client.status)}>
                  {client.status}
                </Badge>
                <Star className={`h-4 w-4 ${getPriorityColor(client.priority)}`} fill="currentColor" />
              </div>
              {client.company && (
                <p className="text-sm text-gray-500">{client.company}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="categories">Categories & Tags</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="activity">Activity & Notes</TabsTrigger>
          </TabsList>

          <div className="mt-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Client Type</p>
                      <div className="flex items-center gap-2 mt-1">
                        {client.type === 'business' ? (
                          <Building className="h-4 w-4 text-blue-600" />
                        ) : (
                          <User className="h-4 w-4 text-green-600" />
                        )}
                        <span className="capitalize">{client.type}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Priority</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className={`h-4 w-4 ${getPriorityColor(client.priority)}`} fill="currentColor" />
                        <span className="capitalize">{client.priority}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Client Since</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(client.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DollarSign className="h-4 w-4" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Billing</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(client.metrics.totalBilling)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Average Case Value</p>
                      <p className="font-medium">
                        {formatCurrency(client.metrics.averageCaseValue)}
                      </p>
                    </div>
                    {client.metrics.lastPayment && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Payment</p>
                        <p className="text-sm">{formatDate(client.metrics.lastPayment)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Communication */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageSquare className="h-4 w-4" />
                      Communication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Preferred Method</p>
                      <div className="flex items-center gap-2 mt-1">
                        {client.communicationPreferences.preferredMethod === 'email' && (
                          <Mail className="h-4 w-4 text-blue-600" />
                        )}
                        {client.communicationPreferences.preferredMethod === 'phone' && (
                          <Phone className="h-4 w-4 text-green-600" />
                        )}
                        <span className="capitalize">
                          {client.communicationPreferences.preferredMethod}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Language</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span>{client.communicationPreferences.language}</span>
                      </div>
                    </div>
                    {client.communicationPreferences.doNotContact && (
                      <Badge variant="destructive" className="text-xs">
                        Do Not Contact
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Categories and Tags Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Tag className="h-4 w-4" />
                    Categories & Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.categories.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {client.categories.map((category) => (
                          <Badge key={category} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {client.tags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {client.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a 
                          href={`mailto:${client.email}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {client.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a 
                          href={`tel:${client.phone}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {client.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {client.company && (
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p>{client.company}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Categories ({client.categories.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {client.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {client.categories.map((category) => (
                          <Badge key={category} variant="secondary" className="text-sm">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No categories assigned</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags ({client.tags.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {client.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {client.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No tags assigned</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {client.relatedClients.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Related Clients ({client.relatedClients.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {client.relatedClients.map((relatedId) => (
                        <div key={relatedId} className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Client ID: {relatedId}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financial Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Billing</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(client.metrics.totalBilling)}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-gray-500">Average Case Value</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(client.metrics.averageCaseValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Client Since</p>
                      <p className="font-medium">
                        {formatDate(client.metrics.clientSince)}
                      </p>
                    </div>
                    {client.metrics.lastPayment && (
                      <div>
                        <p className="text-sm text-gray-500">Last Payment</p>
                        <p className="font-medium">
                          {formatDate(client.metrics.lastPayment)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {client.metrics.paymentHistory.length > 0 ? (
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {client.metrics.paymentHistory.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{formatCurrency(payment.amount)}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(payment.date)}
                              </p>
                            </div>
                            <Badge 
                              variant={payment.status === 'paid' ? 'default' : 'secondary'}
                              className={
                                payment.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : payment.status === 'overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No payment history available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes ({client.notes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {client.notes.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {client.notes.map((note) => (
                        <div key={note.id} className="border rounded-lg p-3 bg-gray-50">
                          <p className="text-sm">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            By {note.createdBy} on {formatDate(note.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No notes available</p>
                  )}
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Activity ({client.activity.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {client.activity.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {client.activity.map((activity) => (
                        <div key={activity.id} className="flex gap-3 p-2 border-l-2 border-blue-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {activity.type}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(activity.date)}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{activity.description}</p>
                            <p className="text-xs text-gray-500">By {activity.user}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No activity recorded</p>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              {client.documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents ({client.documents.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {client.documents.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{document.name}</p>
                              <p className="text-xs text-gray-500">
                                {document.type} • {formatDate(document.uploadedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}