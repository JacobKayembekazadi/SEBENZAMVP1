import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Client } from '@/lib/store';
import { format } from 'date-fns';

interface ClientOverviewProps {
  client: Client;
  totalCases?: number;
  activeCases?: number;
}

export function ClientOverview({ client, totalCases = 0, activeCases = 0 }: ClientOverviewProps) {
  const getPriorityColor = (priority: Client['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusIcon = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'prospective':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const calculateClientHealth = () => {
    // Calculate a health score based on various factors
    let score = 100;
    
    // Deduct points for overdue payments
    const overduePayments = client.metrics.paymentHistory.filter(p => p.status === 'overdue').length;
    score -= overduePayments * 10;
    
    // Deduct points for inactivity
    const daysSinceLastPayment = client.metrics.lastPayment 
      ? Math.floor((new Date().getTime() - new Date(client.metrics.lastPayment).getTime()) / (1000 * 60 * 60 * 24))
      : 365;
    if (daysSinceLastPayment > 180) score -= 20;
    else if (daysSinceLastPayment > 90) score -= 10;
    
    // Add points for high value
    if (client.metrics.totalBilling > 50000) score += 10;
    
    return Math.max(0, Math.min(100, score));
  };

  const clientHealth = calculateClientHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status and Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(client.status)}
            <span className="text-sm font-medium capitalize">{client.status}</span>
          </div>
          <Badge className={getPriorityColor(client.priority)}>
            {client.priority} priority
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total Billing</span>
            </div>
            <p className="text-2xl font-bold">
              ${client.metrics.totalBilling.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-xs">Active Cases</span>
            </div>
            <p className="text-2xl font-bold">
              {activeCases} / {totalCases}
            </p>
          </div>
        </div>

        {/* Client Since */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Client Since</span>
          </div>
          <p className="text-sm font-medium">
            {format(new Date(client.metrics.clientSince), 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Average Case Value */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Average Case Value</span>
          </div>
          <p className="text-lg font-semibold">
            ${client.metrics.averageCaseValue.toLocaleString()}
          </p>
        </div>

        {/* Last Payment */}
        {client.metrics.lastPayment && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Last Payment</span>
            </div>
            <p className="text-sm font-medium">
              {format(new Date(client.metrics.lastPayment), 'MMM d, yyyy')}
            </p>
          </div>
        )}

        {/* Client Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Client Health</span>
            <span className="text-sm text-muted-foreground">{clientHealth}%</span>
          </div>
          <Progress value={clientHealth} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {clientHealth >= 80 ? 'Excellent' : 
             clientHealth >= 60 ? 'Good' : 
             clientHealth >= 40 ? 'Needs Attention' : 'At Risk'}
          </p>
        </div>

        {/* Communication Preferences */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Communication</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Preferred Method</span>
              <span className="capitalize">{client.communicationPreferences.preferredMethod}</span>
            </div>
            {client.communicationPreferences.preferredTime && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Best Time</span>
                <span>{client.communicationPreferences.preferredTime}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Language</span>
              <span>{client.communicationPreferences.language}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 