import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
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
  BarChart3,
  Plus,
  Edit,
  Eye,
  Download,
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
  Search,
  Filter,
  RefreshCw,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Enhanced TypeScript interfaces for comprehensive package management
interface SubscriptionPlan {
  id: string;
  name: string;
  status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'suspended';
  billingCycle: 'monthly' | 'annually';
  price: number;
  currency: string;
  nextBillingDate: Date;
  startDate: Date;
  features: string[];
  limits: {
    users: number;
    storage: number;
    cases: number;
    clientPortalUsers: number;
  };
}

interface AvailablePlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: string[];
  limits: {
    users: number;
    storage: number;
    cases: number;
    clientPortalUsers: number;
  };
  popular?: boolean;
}

interface BillingHistory {
  id: string;
  invoiceNumber: string;
  date: Date;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  downloadUrl?: string;
  paymentMethod: string;
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'annually';
  category: 'storage' | 'users' | 'features' | 'support';
  isActive: boolean;
  quantity: number;
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  bankName?: string;
  accountType?: string;
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

// Enhanced mock data for comprehensive package management
const dummySubscription: SubscriptionPlan = {
  id: 'sub_1',
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
  ],
  limits: {
    users: 20,
    storage: 1000,
    cases: 100,
    clientPortalUsers: 50
  }
};

const mockAvailablePlans: AvailablePlan[] = [
  {
    id: 'plan_basic',
    name: 'Sebenza Basic',
    description: 'Perfect for small law firms just getting started',
    monthlyPrice: 99,
    annualPrice: 990,
    currency: 'USD',
    features: ['5 Users', '100GB Storage', 'Basic Reporting', 'Email Support'],
    limits: { users: 5, storage: 100, cases: 25, clientPortalUsers: 10 }
  },
  {
    id: 'plan_premium',
    name: 'Sebenza Premium',
    description: 'Most popular choice for growing law firms',
    monthlyPrice: 299,
    annualPrice: 2990,
    currency: 'USD',
    features: ['20 Users', '1TB Storage', 'Advanced Reporting', 'Client Portal', 'Priority Support', 'AI Assistant'],
    limits: { users: 20, storage: 1000, cases: 100, clientPortalUsers: 50 },
    popular: true
  },
  {
    id: 'plan_enterprise',
    name: 'Sebenza Enterprise',
    description: 'Comprehensive solution for large law firms',
    monthlyPrice: 599,
    annualPrice: 5990,
    currency: 'USD',
    features: ['Unlimited Users', '10TB Storage', 'Custom Reporting', 'White-label Portal', '24/7 Support', 'Custom Integrations'],
    limits: { users: 999, storage: 10000, cases: 999, clientPortalUsers: 200 }
  }
];

const mockBillingHistory: BillingHistory[] = [
  {
    id: 'inv_001',
    invoiceNumber: 'INV-2024-001',
    date: new Date('2024-01-15'),
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Sebenza Premium - Monthly Subscription',
    downloadUrl: '/invoices/inv_001.pdf',
    paymentMethod: 'Visa ****4242'
  },
  {
    id: 'inv_002',
    invoiceNumber: 'INV-2024-002',
    date: new Date('2024-02-15'),
    amount: 299,
    currency: 'USD',
    status: 'paid',
    description: 'Sebenza Premium - Monthly Subscription',
    downloadUrl: '/invoices/inv_002.pdf',
    paymentMethod: 'Visa ****4242'
  },
  {
    id: 'inv_003',
    invoiceNumber: 'INV-2024-003',
    date: new Date('2024-03-15'),
    amount: 299,
    currency: 'USD',
    status: 'pending',
    description: 'Sebenza Premium - Monthly Subscription',
    paymentMethod: 'Visa ****4242'
  }
];

const mockAddOns: AddOn[] = [
  {
    id: 'addon_storage',
    name: 'Extra Storage',
    description: 'Additional 500GB of document storage',
    price: 49,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'storage',
    isActive: true,
    quantity: 2
  },
  {
    id: 'addon_users',
    name: 'Additional Users',
    description: 'Add 5 more user seats to your plan',
    price: 25,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'users',
    isActive: false,
    quantity: 1
  }
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'credit_card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  },
  {
    id: 'pm_2',
    type: 'bank_account',
    last4: '6789',
    bankName: 'Chase Bank',
    accountType: 'Checking',
    isDefault: false
  }
];

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
  const { toast } = useToast();

  // State Management
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionPlan>(dummySubscription);
  const [availablePlans, setAvailablePlans] = useState<AvailablePlan[]>(mockAvailablePlans);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>(mockBillingHistory);
  const [addOns, setAddOns] = useState<AddOn[]>(mockAddOns);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [usage, setUsage] = useState<UsageMetrics>(dummyUsage);

  // Dialog states
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [showAddOnDialog, setShowAddOnDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showCancelDialog, setCancelDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  // Form states
  const [selectedPlan, setSelectedPlan] = useState<AvailablePlan | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [selectedInvoice, setSelectedInvoice] = useState<BillingHistory | null>(null);
  const [selectedAddOn, setSelectedAddOn] = useState<AddOn | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Search and filter states
  const [billingSearchTerm, setBillingSearchTerm] = useState('');
  const [billingFilterStatus, setBillingFilterStatus] = useState<string>('all');
  const [billingSortBy, setBillingSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [billingSortOrder, setBillingSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk selection states
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [selectAllInvoices, setSelectAllInvoices] = useState(false);

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
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
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

  // CRUD Handlers
  const handleChangePlan = (plan: AvailablePlan) => {
    setSelectedPlan(plan);
    setShowPlanDialog(true);
  };

  const handleSavePlanChange = () => {
    if (!selectedPlan) return;

    try {
      // Simulate API call - PUT /api/subscription/plan
      console.log('PUT /api/subscription/plan', {
        planId: selectedPlan.id,
        billingCycle: selectedBillingCycle
      });

      const newPrice = selectedBillingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;
      const newNextBillingDate = new Date();
      newNextBillingDate.setMonth(newNextBillingDate.getMonth() + (selectedBillingCycle === 'monthly' ? 1 : 12));

      const updatedSubscription: SubscriptionPlan = {
        ...currentSubscription,
        name: selectedPlan.name,
        price: newPrice,
        billingCycle: selectedBillingCycle,
        nextBillingDate: newNextBillingDate,
        limits: selectedPlan.limits,
        features: selectedPlan.features
      };

      setCurrentSubscription(updatedSubscription);
      setShowPlanDialog(false);
      setSelectedPlan(null);

      toast({
        title: "Plan Updated",
        description: `Successfully changed to ${selectedPlan.name} (${selectedBillingCycle}).`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = () => {
    setCancelDialog(true);
  };

  const handleConfirmCancellation = () => {
    try {
      // Simulate API call - DELETE /api/subscription
      console.log('DELETE /api/subscription', { subscriptionId: currentSubscription.id });

      const updatedSubscription: SubscriptionPlan = {
        ...currentSubscription,
        status: 'cancelled'
      };

      setCurrentSubscription(updatedSubscription);
      setCancelDialog(false);

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll continue to have access until the end of your billing period.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAddOn = (addOnId: string) => {
    try {
      // Simulate API call - PUT /api/subscription/addons
      console.log('PUT /api/subscription/addons', { addOnId, action: 'toggle' });

      const updatedAddOns = addOns.map(addon => 
        addon.id === addOnId 
          ? { ...addon, isActive: !addon.isActive }
          : addon
      );

      setAddOns(updatedAddOns);

      const addon = addOns.find(a => a.id === addOnId);
      toast({
        title: addon?.isActive ? "Add-on Deactivated" : "Add-on Activated",
        description: `${addon?.name} has been ${addon?.isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update add-on. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddPaymentMethod = (paymentMethod: Omit<PaymentMethod, 'id'>) => {
    try {
      // Simulate API call - POST /api/payment-methods
      console.log('POST /api/payment-methods', paymentMethod);

      const newPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        id: `pm_${Date.now()}`
      };

      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      setShowPaymentDialog(false);

      toast({
        title: "Payment Method Added",
        description: "Your payment method has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePaymentMethod = (paymentMethodId: string) => {
    try {
      // Simulate API call - DELETE /api/payment-methods/:id
      console.log('DELETE /api/payment-methods', { paymentMethodId });

      const updatedPaymentMethods = paymentMethods.filter(pm => pm.id !== paymentMethodId);
      setPaymentMethods(updatedPaymentMethods);

      toast({
        title: "Payment Method Deleted",
        description: "Payment method has been removed from your account.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefaultPaymentMethod = (paymentMethodId: string) => {
    try {
      // Simulate API call - PUT /api/payment-methods/:id/default
      console.log('PUT /api/payment-methods/default', { paymentMethodId });

      const updatedPaymentMethods = paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId
      }));

      setPaymentMethods(updatedPaymentMethods);

      toast({
        title: "Default Payment Method Updated",
        description: "Your default payment method has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadInvoice = (invoice: BillingHistory) => {
    try {
      // Simulate API call - GET /api/invoices/:id/download
      console.log('GET /api/invoices/download', { invoiceId: invoice.id });

      // Simulate file download
      const link = document.createElement('a');
      link.href = invoice.downloadUrl || '#';
      link.download = `${invoice.invoiceNumber}.pdf`;
      link.click();

      toast({
        title: "Invoice Downloaded",
        description: `Invoice ${invoice.invoiceNumber} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewInvoiceDetails = (invoice: BillingHistory) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleBulkInvoiceAction = (action: 'download' | 'export', invoiceIds: string[]) => {
    try {
      // Simulate API call - POST /api/invoices/bulk
      console.log('POST /api/invoices/bulk', { action, invoiceIds });

      if (action === 'download') {
        // Simulate bulk download
        invoiceIds.forEach(id => {
          const invoice = billingHistory.find(inv => inv.id === id);
          if (invoice) {
            const link = document.createElement('a');
            link.href = invoice.downloadUrl || '#';
            link.download = `${invoice.invoiceNumber}.pdf`;
            link.click();
          }
        });
      } else if (action === 'export') {
        // Simulate CSV export
        const csvContent = billingHistory
          .filter(inv => invoiceIds.includes(inv.id))
          .map(inv => `${inv.invoiceNumber},${inv.date.toISOString()},${inv.amount},${inv.status}`)
          .join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'billing_history.csv';
        link.click();
        URL.revokeObjectURL(url);
      }

      setSelectedInvoiceIds([]);
      setSelectAllInvoices(false);

      toast({
        title: "Bulk Action Completed",
        description: `${action === 'download' ? 'Downloaded' : 'Exported'} ${invoiceIds.length} invoice(s).`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFilteredBillingHistory = () => {
    let filtered = billingHistory;

    // Apply search filter
    if (billingSearchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(billingSearchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(billingSearchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (billingFilterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === billingFilterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[billingSortBy];
      let bValue: any = b[billingSortBy];

      if (billingSortBy === 'date') {
        aValue = a.date.getTime();
        bValue = b.date.getTime();
      }

      if (billingSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Calculate usage percentages
  const userUsagePercentage = calculateUsagePercentage(usage.activeUsers.current, usage.activeUsers.limit);
  const storageUsagePercentage = calculateUsagePercentage(usage.storage.used, usage.storage.limit);
  const caseUsagePercentage = usage.activeCases ? calculateUsagePercentage(usage.activeCases.current, usage.activeCases.limit) : 0;
  const portalUsagePercentage = usage.clientPortalUsers ? calculateUsagePercentage(usage.clientPortalUsers.current, usage.clientPortalUsers.limit) : 0;

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
                      {currentSubscription.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Your current subscription plan
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(currentSubscription.status)}>
                    {currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1)}
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
                          {formatCurrency(currentSubscription.price, currentSubscription.currency)}
                          <span className="text-sm font-normal text-gray-600">/{currentSubscription.billingCycle === 'monthly' ? 'month' : 'year'}</span>
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
                          {formatDate(currentSubscription.nextBillingDate)}
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
                          {formatDate(currentSubscription.startDate)}
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
                          {currentSubscription.billingCycle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Features */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentSubscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowPlanDialog(true)}>
                    <Settings className="h-4 w-4" />
                    Change Plan
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowBillingDialog(true)}>
                    <FileText className="h-4 w-4" />
                    View Invoices
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowPaymentDialog(true)}>
                    <CreditCard className="h-4 w-4" />
                    Payment Methods
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700" onClick={handleCancelSubscription}>
                    <XCircle className="h-4 w-4" />
                    Cancel Plan
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
                    <span className="text-2xl font-bold text-blue-600">{usage.activeUsers.current}</span>
                  </div>
                  <p className="text-xs text-gray-600">Active this month</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Storage Used</span>
                    <span className="text-2xl font-bold text-purple-600">{usage.storage.used} GB</span>
                  </div>
                  <p className="text-xs text-gray-600">Of {usage.storage.limit} GB total</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Active Cases</span>
                    <span className="text-2xl font-bold text-green-600">{usage.activeCases?.current || 0}</span>
                  </div>
                  <p className="text-xs text-gray-600">Currently managing</p>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button className="w-full" variant="default" onClick={() => setShowPlanDialog(true)}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Change Plan
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
                    <span className="text-3xl font-bold">{usage.activeUsers.current}</span>
                    <span className="text-sm text-gray-600">of {usage.activeUsers.limit} users</span>
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
                      {usage.activeUsers.limit - usage.activeUsers.current} available
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
                    <span className="text-3xl font-bold">{usage.storage.used} GB</span>
                    <span className="text-sm text-gray-600">of {usage.storage.limit} GB</span>
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
                      {usage.storage.limit - usage.storage.used} GB available
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
            {usage.activeCases && (
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
                      <span className="text-3xl font-bold">{usage.activeCases.current}</span>
                      <span className="text-sm text-gray-600">of {usage.activeCases.limit} cases</span>
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
                        {usage.activeCases.limit - usage.activeCases.current} available
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Portal Users Card */}
            {usage.clientPortalUsers && (
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
                      <span className="text-3xl font-bold">{usage.clientPortalUsers.current}</span>
                      <span className="text-sm text-gray-600">of {usage.clientPortalUsers.limit} users</span>
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
                        {usage.clientPortalUsers.limit - usage.clientPortalUsers.current} available
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add-ons Management Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add-ons & Extensions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addOns.map((addon) => (
              <Card key={addon.id} className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {addon.name}
                      </CardTitle>
                      <CardDescription>{addon.description}</CardDescription>
                    </div>
                    <Switch
                      checked={addon.isActive}
                      onCheckedChange={() => handleToggleAddOn(addon.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price</span>
                      <span className="font-semibold">
                        {formatCurrency(addon.price, addon.currency)}/{addon.billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantity</span>
                      <span className="font-semibold">{addon.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Category</span>
                      <Badge variant="secondary" className="capitalize">{addon.category}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing History Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Billing History</h2>
            <Button variant="outline" onClick={() => setShowBillingDialog(true)}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Invoices</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search invoices..."
                      value={billingSearchTerm}
                      onChange={(e) => setBillingSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={billingFilterStatus} onValueChange={setBillingFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getFilteredBillingHistory().slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">{formatDate(invoice.date)}</p>
                        <p className="text-sm text-gray-600">{invoice.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(invoice.amount, invoice.currency)}</p>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewInvoiceDetails(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
            <Button onClick={() => setShowPaymentDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {method.type === 'credit_card' ? `${method.brand} ****${method.last4}` : 
                         method.type === 'bank_account' ? `${method.bankName} ****${method.last4}` : 
                         'PayPal Account'}
                      </CardTitle>
                      <CardDescription>
                        {method.type === 'credit_card' ? `Expires ${method.expiryMonth}/${method.expiryYear}` :
                         method.type === 'bank_account' ? `${method.accountType} Account` :
                         'PayPal Payment Method'}
                      </CardDescription>
                    </div>
                    {method.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefaultPaymentMethod(method.id)}>
                        Set as Default
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDeletePaymentMethod(method.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Plan Change Dialog */}
        <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Change Your Plan</DialogTitle>
              <DialogDescription>
                Choose a plan that fits your needs. You can upgrade or downgrade at any time.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex gap-4 justify-center">
                <Button
                  variant={selectedBillingCycle === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setSelectedBillingCycle('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  variant={selectedBillingCycle === 'annually' ? 'default' : 'outline'}
                  onClick={() => setSelectedBillingCycle('annually')}
                >
                  Annual (Save 17%)
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availablePlans.map((plan) => (
                  <Card key={plan.id} className={`cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
                  } ${plan.popular ? 'ring-2 ring-yellow-500' : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </div>
                        {plan.popular && (
                          <Badge className="bg-yellow-100 text-yellow-800">Popular</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <span className="text-3xl font-bold">
                            {formatCurrency(selectedBillingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice, plan.currency)}
                          </span>
                          <span className="text-gray-600">/{selectedBillingCycle === 'monthly' ? 'month' : 'year'}</span>
                        </div>
                        <div className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePlanChange} disabled={!selectedPlan}>
                  {selectedPlan && selectedPlan.id === currentSubscription.id ? 'Update Billing Cycle' : 'Change Plan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Billing History Dialog */}
        <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Billing History</DialogTitle>
              <DialogDescription>
                View and manage all your invoices and billing information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search invoices..."
                      value={billingSearchTerm}
                      onChange={(e) => setBillingSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={billingFilterStatus} onValueChange={setBillingFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedInvoiceIds.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        Bulk Actions ({selectedInvoiceIds.length})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkInvoiceAction('download', selectedInvoiceIds)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkInvoiceAction('export', selectedInvoiceIds)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Export CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAllInvoices}
                        onCheckedChange={(checked) => {
                          setSelectAllInvoices(!!checked);
                          if (checked) {
                            setSelectedInvoiceIds(getFilteredBillingHistory().map(inv => inv.id));
                          } else {
                            setSelectedInvoiceIds([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredBillingHistory().map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedInvoiceIds.includes(invoice.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedInvoiceIds([...selectedInvoiceIds, invoice.id]);
                            } else {
                              setSelectedInvoiceIds(selectedInvoiceIds.filter(id => id !== invoice.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewInvoiceDetails(invoice)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoice Details Dialog */}
        <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Complete information for invoice {selectedInvoice?.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Invoice Number</Label>
                    <p className="text-lg font-semibold">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                    <p className="text-lg font-semibold">{formatDate(selectedInvoice.date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Amount</Label>
                    <p className="text-lg font-semibold">{formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="text-lg font-semibold">{selectedInvoice.description}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Payment Method</Label>
                    <p className="text-lg font-semibold">{selectedInvoice.paymentMethod}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button onClick={() => setShowInvoiceDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Cancel Subscription Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel your subscription? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Your subscription will remain active until {formatDate(currentSubscription.nextBillingDate)}.
                  After this date, you will lose access to all premium features.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setCancelDialog(false)}>
                  Keep Subscription
                </Button>
                <Button variant="destructive" onClick={handleConfirmCancellation}>
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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