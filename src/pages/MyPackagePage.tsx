import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  HardDrive, 
  Check, 
  AlertTriangle, 
  Crown,
  Settings,
  TrendingUp,
  Shield,
  FileText,
  BarChart3
} from 'lucide-react';

// TypeScript interfaces for the subscription data
interface SubscriptionPlan {
  name: string;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'suspended';
  billingCycle: 'monthly' | 'annually';
  price: number;
  currency: string;
  nextBillingDate: Date;
  startDate: Date;
  features: string[];
}

interface UsageMetrics {
  activeUsers: {
    current: number;
    limit: number;
  };
  storage: {
    used: number; // in GB
    limit: number; // in GB
  };
  activeCases?: {
    current: number;
    limit: number;
  };
  clientPortalUsers?: {
    current: number;
    limit: number;
  };
}

// Dummy data for demonstration
const dummySubscription: SubscriptionPlan = {
  name: 'Sebenza Premium',
  status: 'active',
  billingCycle: 'monthly',
  price: 299,
  currency: 'USD',
  nextBillingDate: new Date('2024-10-26'),
  startDate: new Date('2023-10-26'),
  features: [
    'Unlimited Users',
    '1TB Storage',
    'Advanced Reporting',
    'Client Portal Access',
    'Priority Support',
    'Custom Integrations',
    'AI Legal Assistant',
    'Automated Workflows'
  ]
};

const dummyUsage: UsageMetrics = {
  activeUsers: {
    current: 15,
    limit: 20
  },
  storage: {
    used: 450,
    limit: 1000
  },
  activeCases: {
    current: 87,
    limit: 100
  },
  clientPortalUsers: {
    current: 42,
    limit: 50
  }
};

const MyPackagePage: React.FC = () => {
  // Helper functions
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageTextColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Calculate usage percentages
  const userUsagePercentage = calculateUsagePercentage(dummyUsage.activeUsers.current, dummyUsage.activeUsers.limit);
  const storageUsagePercentage = calculateUsagePercentage(dummyUsage.storage.used, dummyUsage.storage.limit);
  const caseUsagePercentage = dummyUsage.activeCases ? calculateUsagePercentage(dummyUsage.activeCases.current, dummyUsage.activeCases.limit) : 0;
  const portalUsagePercentage = dummyUsage.clientPortalUsers ? calculateUsagePercentage(dummyUsage.clientPortalUsers.current, dummyUsage.clientPortalUsers.limit) : 0;

  return (
    <DashboardLayout 
      title="My Sebenza Subscription" 
      description="Manage your subscription plan, billing, and usage"
    >
        {/* Usage Alert if approaching limits */}
        {(userUsagePercentage >= 80 || storageUsagePercentage >= 80) && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You're approaching your plan limits. Consider upgrading to avoid service interruptions.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subscription Overview Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Crown className="h-6 w-6 text-yellow-500" />
                      {dummySubscription.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Your current subscription plan
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(dummySubscription.status)}>
                    {dummySubscription.status.charAt(0).toUpperCase() + dummySubscription.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Billing Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Billing Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(dummySubscription.price, dummySubscription.currency)}
                          <span className="text-sm font-normal text-gray-600">/{dummySubscription.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Next Billing Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(dummySubscription.nextBillingDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(dummySubscription.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Shield className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Billing Cycle</p>
                        <p className="text-lg font-semibold text-gray-900 capitalize">
                          {dummySubscription.billingCycle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dummySubscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Manage Plan
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View Invoices
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Update Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Total Users</span>
                    <span className="text-2xl font-bold text-blue-600">{dummyUsage.activeUsers.current}</span>
                  </div>
                  <p className="text-xs text-gray-600">Active this month</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Storage Used</span>
                    <span className="text-2xl font-bold text-purple-600">{dummyUsage.storage.used} GB</span>
                  </div>
                  <p className="text-xs text-gray-600">Of {dummyUsage.storage.limit} GB total</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Active Cases</span>
                    <span className="text-2xl font-bold text-green-600">{dummyUsage.activeCases?.current || 0}</span>
                  </div>
                  <p className="text-xs text-gray-600">Currently managing</p>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full" variant="default">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Monitoring Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Monitoring</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Users Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Users
                </CardTitle>
                <CardDescription>
                  Monitor your team's usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold">{dummyUsage.activeUsers.current}</span>
                    <span className="text-sm text-gray-600">of {dummyUsage.activeUsers.limit} users</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full ${getUsageColor(userUsagePercentage)} transition-all duration-300`}
                      style={{ width: `${userUsagePercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${getUsageTextColor(userUsagePercentage)}`}>
                      {userUsagePercentage}% used
                    </span>
                    <span className="text-sm text-gray-600">
                      {dummyUsage.activeUsers.limit - dummyUsage.activeUsers.current} available
                    </span>
                  </div>

                  {userUsagePercentage >= 80 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertDescription className="text-sm text-yellow-800">
                        You're approaching your user limit. Add more seats to your plan.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Storage Usage Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Storage Usage
                </CardTitle>
                <CardDescription>
                  Track your document storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold">{dummyUsage.storage.used} GB</span>
                    <span className="text-sm text-gray-600">of {dummyUsage.storage.limit} GB</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full ${getUsageColor(storageUsagePercentage)} transition-all duration-300`}
                      style={{ width: `${storageUsagePercentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${getUsageTextColor(storageUsagePercentage)}`}>
                      {storageUsagePercentage}% used
                    </span>
                    <span className="text-sm text-gray-600">
                      {dummyUsage.storage.limit - dummyUsage.storage.used} GB available
                    </span>
                  </div>

                  {storageUsagePercentage >= 80 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertDescription className="text-sm text-yellow-800">
                        Storage is running low. Consider upgrading or cleaning up old files.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Cases Card */}
            {dummyUsage.activeCases && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Active Cases
                  </CardTitle>
                  <CardDescription>
                    Current case management capacity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-bold">{dummyUsage.activeCases.current}</span>
                      <span className="text-sm text-gray-600">of {dummyUsage.activeCases.limit} cases</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full ${getUsageColor(caseUsagePercentage)} transition-all duration-300`}
                        style={{ width: `${caseUsagePercentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${getUsageTextColor(caseUsagePercentage)}`}>
                        {caseUsagePercentage}% used
                      </span>
                      <span className="text-sm text-gray-600">
                        {dummyUsage.activeCases.limit - dummyUsage.activeCases.current} available
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Portal Users Card */}
            {dummyUsage.clientPortalUsers && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Portal Users
                  </CardTitle>
                  <CardDescription>
                    External client access accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-bold">{dummyUsage.clientPortalUsers.current}</span>
                      <span className="text-sm text-gray-600">of {dummyUsage.clientPortalUsers.limit} users</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full ${getUsageColor(portalUsagePercentage)} transition-all duration-300`}
                        style={{ width: `${portalUsagePercentage}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${getUsageTextColor(portalUsagePercentage)}`}>
                        {portalUsagePercentage}% used
                      </span>
                      <span className="text-sm text-gray-600">
                        {dummyUsage.clientPortalUsers.limit - dummyUsage.clientPortalUsers.current} available
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Last Updated Notice */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Usage data last updated: {new Date().toLocaleString('en-US', { 
            dateStyle: 'medium', 
            timeStyle: 'short' 
          })}
        </div>
    </DashboardLayout>
  );
};

export default MyPackagePage; 