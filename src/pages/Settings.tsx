import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  CreditCard,
  Building2,
  Puzzle,
  Mail,
  Briefcase,
  HelpCircle,
  Plus,
  Settings as SettingsIcon,
  Check,
  X,
  Eye,
  EyeOff,
  Copy,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreHorizontal,
  Key,
  Link,
  Globe,
  Shield,
  Bell,
  User,
  Zap,
  DollarSign,
  FileText,
  Send,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ExternalLink,
  Wallet,
  Database,
  Code,
  Smartphone,
  Monitor,
  Calendar,
  MessageSquare,
  Target,
  BarChart3,
  Receipt
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("payment-gateways");
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // State for different sections
  const [paymentGateways, setPaymentGateways] = useState([
    {
      id: '1',
      name: 'Stripe',
      type: 'stripe',
      isConnected: true,
      isActive: true,
      publicKey: 'pk_test_***************',
      secretKey: '••••••••••••••••',
      webhookUrl: 'https://yourdomain.com/stripe/webhook',
      supportedMethods: ['Credit Card', 'Debit Card', 'Apple Pay', 'Google Pay'],
      fees: '2.9% + R2.50',
      currency: 'ZAR',
      testMode: true
    },
    {
      id: '2',
      name: 'PayPal',
      type: 'paypal',
      isConnected: false,
      isActive: false,
      clientId: '',
      clientSecret: '',
      webhookUrl: '',
      supportedMethods: ['PayPal Balance', 'Credit Card', 'Bank Transfer'],
      fees: '3.4% + R2.50',
      currency: 'ZAR',
      testMode: false
    },
    {
      id: '3',
      name: 'PayFast',
      type: 'payfast',
      isConnected: false,
      isActive: false,
      merchantId: '',
      merchantKey: '',
      webhookUrl: '',
      supportedMethods: ['Credit Card', 'EFT', 'Instant EFT'],
      fees: '2.85% + R2.00',
      currency: 'ZAR',
      testMode: false
    }
  ]);

  const [bankAccounts, setBankAccounts] = useState([
    {
      id: '1',
      bankName: 'First National Bank',
      accountName: 'Law Firm Trust Account',
      accountNumber: '••••••••••7891',
      branchCode: '250655',
      accountType: 'Business Cheque',
      isConnected: true,
      lastSync: new Date('2024-01-16T10:30:00'),
      balance: 125750.50,
      status: 'active'
    },
    {
      id: '2',
      bankName: 'Standard Bank',
      accountName: 'Operating Account',
      accountNumber: '••••••••••3456',
      branchCode: '051001',
      accountType: 'Business Current',
      isConnected: false,
      lastSync: null,
      balance: 0,
      status: 'pending'
    }
  ]);

  const [integrations, setIntegrations] = useState([
    {
      id: '1',
      name: 'Microsoft 365',
      category: 'Productivity',
      description: 'Sync calendars, emails, and documents with Microsoft Office suite',
      icon: '📧',
      isConnected: true,
      isActive: true,
      plan: 'Business Premium',
      features: ['Email', 'Calendar', 'OneDrive', 'Teams'],
      lastSync: new Date(),
      price: 'R189/month'
    },
    {
      id: '2',
      name: 'DocuSign',
      category: 'Document Management',
      description: 'Electronic signature integration for contracts and legal documents',
      icon: '✍️',
      isConnected: false,
      isActive: false,
      plan: 'Standard',
      features: ['E-Signatures', 'Document Templates', 'Audit Trail'],
      lastSync: null,
      price: 'R299/month'
    },
    {
      id: '3',
      name: 'QuickBooks',
      category: 'Accounting',
      description: 'Sync financial data and automate bookkeeping processes',
      icon: '📊',
      isConnected: true,
      isActive: true,
      plan: 'Plus',
      features: ['Financial Sync', 'Tax Reporting', 'Invoice Integration'],
      lastSync: new Date(),
      price: 'R399/month'
    },
    {
      id: '4',
      name: 'Slack',
      category: 'Communication',
      description: 'Team communication and case collaboration platform',
      icon: '💬',
      isConnected: false,
      isActive: false,
      plan: 'Pro',
      features: ['Team Chat', 'File Sharing', 'Video Calls'],
      lastSync: null,
      price: 'R149/month'
    }
  ]);

  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: '1',
      name: 'Invoice Reminder',
      subject: 'Payment Reminder: Invoice #{invoice_number}',
      type: 'invoice',
      isActive: true,
      lastUsed: new Date('2024-01-15'),
      usage: 45,
      body: `Dear {client_name},

This is a friendly reminder that Invoice #{invoice_number} for {amount} is now due.

Payment Details:
- Invoice Date: {invoice_date}
- Due Date: {due_date}
- Amount: {amount}

Please process payment at your earliest convenience.

Best regards,
{firm_name}`
    },
    {
      id: '2',
      name: 'Welcome New Client',
      subject: 'Welcome to {firm_name} - Getting Started',
      type: 'client',
      isActive: true,
      lastUsed: new Date('2024-01-14'),
      usage: 23,
      body: `Dear {client_name},

Welcome to {firm_name}! We're excited to work with you.

Your client portal is now ready:
- Portal URL: {portal_url}
- Username: {client_email}
- Temporary Password: {temp_password}

Our team will be in touch soon to discuss your case.

Best regards,
{attorney_name}`
    },
    {
      id: '3',
      name: 'Case Update Notification',
      subject: 'Case Update: {case_name}',
      type: 'case',
      isActive: true,
      lastUsed: new Date('2024-01-13'),
      usage: 67,
      body: `Dear {client_name},

We have an update regarding your case: {case_name}

Update Details:
{update_details}

Next Steps:
{next_steps}

Please don't hesitate to contact us if you have any questions.

Best regards,
{attorney_name}`
    }
  ]);

  const [services, setServices] = useState([
    {
      id: '1',
      name: 'Legal Consultation',
      description: 'Initial consultation and legal advice',
      price: 500,
      unit: 'hour',
      category: 'Consultation',
      isActive: true,
      usage: 45,
      defaultTax: 15
    },
    {
      id: '2',
      name: 'Contract Drafting',
      description: 'Professional contract preparation and review',
      price: 1200,
      unit: 'document',
      category: 'Documentation',
      isActive: true,
      usage: 32,
      defaultTax: 15
    },
    {
      id: '3',
      name: 'Court Representation',
      description: 'Legal representation in court proceedings',
      price: 800,
      unit: 'appearance',
      category: 'Litigation',
      isActive: true,
      usage: 18,
      defaultTax: 15
    }
  ]);

  const [supportTickets, setSupportTickets] = useState([
    {
      id: '1',
      title: 'Payment gateway integration issue',
      description: 'Unable to connect Stripe payment gateway. Getting API key error.',
      priority: 'high',
      status: 'in-progress',
      category: 'Payment',
      createdAt: new Date('2024-01-15T14:30:00'),
      updatedAt: new Date('2024-01-16T09:15:00'),
      assignee: 'Support Team',
      responses: 3
    },
    {
      id: '2',
      title: 'Email template formatting',
      description: 'Invoice reminder emails are not formatting properly with client variables.',
      priority: 'medium',
      status: 'open',
      category: 'Email',
      createdAt: new Date('2024-01-14T11:20:00'),
      updatedAt: new Date('2024-01-14T11:20:00'),
      assignee: 'Unassigned',
      responses: 0
    },
    {
      id: '3',
      title: 'Bank reconciliation sync',
      description: 'Transactions are not syncing properly from FNB business account.',
      priority: 'low',
      status: 'resolved',
      category: 'Banking',
      createdAt: new Date('2024-01-10T16:45:00'),
      updatedAt: new Date('2024-01-12T10:30:00'),
      assignee: 'Technical Support',
      responses: 5
    }
  ]);

  // Dialog states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
      case 'disconnected':
      case 'open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className={`transition-colors ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Settings & Configuration
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your system settings, integrations, and preferences
            </p>
          </div>
          <Button variant="outline">
            <SettingsIcon size={16} className="mr-2" />
            System Status
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="payment-gateways">Payment Gateways</TabsTrigger>
            <TabsTrigger value="bank-accounts">Connect Bank</TabsTrigger>
            <TabsTrigger value="integrations">Add-ons & Integrations</TabsTrigger>
            <TabsTrigger value="email-templates">Email & Templates</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="support">Support Tickets</TabsTrigger>
          </TabsList>

          {/* Payment Gateways Tab */}
          <TabsContent value="payment-gateways" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment Gateways</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Configure payment processors and manage transaction fees</p>
              </div>
              <Button onClick={() => setShowPaymentDialog(true)}>
                <Plus size={16} className="mr-2" />
                Add Gateway
              </Button>
            </div>

            <div className="grid gap-6">
              {paymentGateways.map((gateway) => (
                <Card key={gateway.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          gateway.type === 'stripe' ? 'bg-purple-100 dark:bg-purple-900/30' :
                          gateway.type === 'paypal' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-green-100 dark:bg-green-900/30'
                        }`}>
                          <CreditCard size={24} className={`${
                            gateway.type === 'stripe' ? 'text-purple-600' :
                            gateway.type === 'paypal' ? 'text-blue-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {gateway.name}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Transaction fees: {gateway.fees}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(gateway.isConnected ? 'connected' : 'disconnected')}>
                          {gateway.isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                        <Switch checked={gateway.isActive} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit size={14} className="mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key size={14} className="mr-2" />
                              API Keys
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 size={14} className="mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 size={14} className="mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-gray-500">Supported Methods</Label>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {gateway.supportedMethods.slice(0, 2).join(', ')}
                          {gateway.supportedMethods.length > 2 && ` +${gateway.supportedMethods.length - 2} more`}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Currency</Label>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{gateway.currency}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Mode</Label>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {gateway.testMode ? 'Test Mode' : 'Live Mode'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Status</Label>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {gateway.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>

                    {gateway.isConnected && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Key size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-500">Public Key:</span>
                          <span className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {gateway.publicKey}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Copy size={12} />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-500">Webhook URL:</span>
                          <span className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {gateway.webhookUrl}
                          </span>
                          <Button variant="ghost" size="sm">
                            <Copy size={12} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bank Accounts Tab */}
          <TabsContent value="bank-accounts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Bank Account Connections</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Connect and manage your bank accounts for automated reconciliation</p>
              </div>
              <Button onClick={() => setShowBankDialog(true)}>
                <Plus size={16} className="mr-2" />
                Connect Bank
              </Button>
            </div>

            <div className="grid gap-6">
              {bankAccounts.map((account) => (
                <Card key={account.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Building2 size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {account.bankName}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {account.accountName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(account.status)}>
                          {account.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <RefreshCw size={14} className="mr-2" />
                              Sync Now
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye size={14} className="mr-2" />
                              View Transactions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit size={14} className="mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 size={14} className="mr-2" />
                              Disconnect
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Account Number</Label>
                        <p className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {account.accountNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Branch Code</Label>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {account.branchCode}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Account Type</Label>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {account.accountType}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Balance</Label>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(account.balance)}
                        </p>
                      </div>
                    </div>

                    {account.lastSync && (
                      <div className="mt-4 text-sm text-gray-500">
                        Last synced: {account.lastSync.toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add-ons & Integrations</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Connect with third-party services to enhance your workflow</p>
              </div>
              <Button onClick={() => setShowIntegrationDialog(true)}>
                <Plus size={16} className="mr-2" />
                Browse Integrations
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.map((integration) => (
                <Card key={integration.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {integration.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(integration.isConnected ? 'connected' : 'disconnected')}>
                          {integration.isConnected ? 'Connected' : 'Not Connected'}
                        </Badge>
                        <Switch checked={integration.isActive} />
                      </div>
                    </div>

                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {integration.description}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">Features</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {integration.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <Label className="text-xs text-gray-500">Plan</Label>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {integration.plan} - {integration.price}
                          </p>
                        </div>
                        {integration.lastSync && (
                          <div className="text-right">
                            <Label className="text-xs text-gray-500">Last Sync</Label>
                            <p className="text-xs text-gray-500">
                              {integration.lastSync.toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant={integration.isConnected ? 'outline' : 'default'}>
                        {integration.isConnected ? 'Configure' : 'Connect'}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <ExternalLink size={14} className="mr-1" />
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Email Templates Tab */}
          <TabsContent value="email-templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Email & Templates</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage email templates and automated messaging</p>
              </div>
              <Button onClick={() => setShowTemplateDialog(true)}>
                <Plus size={16} className="mr-2" />
                New Template
              </Button>
            </div>

            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {template.name}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {template.subject}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {template.usage} times
                          </span>
                        </TableCell>
                        <TableCell>
                          {template.lastUsed.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(template.isActive ? 'active' : 'inactive')}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit size={14} className="mr-2" />
                                Edit Template
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy size={14} className="mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send size={14} className="mr-2" />
                                Test Send
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Services & Billing</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage your service offerings and billing rates</p>
              </div>
              <Button onClick={() => setShowServiceDialog(true)}>
                <Plus size={16} className="mr-2" />
                Add Service
              </Button>
            </div>

            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {service.name}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {service.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(service.price)}
                          </span>
                        </TableCell>
                        <TableCell>{service.unit}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {service.usage} times
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(service.isActive ? 'active' : 'inactive')}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit size={14} className="mr-2" />
                                Edit Service
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy size={14} className="mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 size={14} className="mr-2" />
                                Usage Analytics
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Support Tickets</h2>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Track and manage your support requests</p>
              </div>
              <Button onClick={() => setShowTicketDialog(true)}>
                <Plus size={16} className="mr-2" />
                New Ticket
              </Button>
            </div>

            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <span className="font-mono text-sm">#{ticket.id}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {ticket.title}
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {ticket.description.substring(0, 50)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{ticket.updatedAt.toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{ticket.responses} responses</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare size={14} className="mr-2" />
                                Add Response
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle size={14} className="mr-2" />
                                Mark Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
