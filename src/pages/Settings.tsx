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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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
  Receipt,
  Activity,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Save,
  TestTube,
  ArrowUpDown,
  MousePointer,
  Calculator
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Enhanced interfaces for CRUD operations
interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'payfast' | 'other';
  isConnected: boolean;
  isActive: boolean;
  publicKey: string;
  secretKey: string;
  webhookUrl: string;
  supportedMethods: string[];
  fees: string;
  currency: string;
  testMode: boolean;
  configuration?: {
    [key: string]: any;
  };
  analytics?: {
    totalTransactions: number;
    successRate: number;
    averageAmount: number;
    monthlyVolume: number;
    lastTransaction: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  isConnected: boolean;
  lastSync: Date | null;
  balance: number;
  status: 'active' | 'pending' | 'inactive' | 'error';
  apiCredentials?: {
    clientId: string;
    clientSecret: string;
    accessToken?: string;
  };
  syncSettings?: {
    autoSync: boolean;
    syncFrequency: 'daily' | 'weekly' | 'manual';
    lastSyncStatus: 'success' | 'failed' | 'pending';
  };
}

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  database: {
    status: 'online' | 'offline' | 'slow';
    responseTime: number;
    connections: number;
    uptime: number;
  };
  api: {
    status: 'online' | 'offline' | 'degraded';
    responseTime: number;
    requestsPerMinute: number;
    errorRate: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  services: {
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: number;
    lastCheck: Date;
  }[];
  lastUpdated: Date;
}

interface Integration {
  id: string;
  name: string;
  category: 'Productivity' | 'Document Management' | 'Accounting' | 'Communication' | 'CRM' | 'Security' | 'Analytics' | 'Other';
  description: string;
  icon: string;
  isConnected: boolean;
  isActive: boolean;
  plan: string;
  features: string[];
  lastSync: Date | null;
  price: string;
  provider: string;
  version: string;
  apiCredentials?: {
    clientId: string;
    clientSecret: string;
    accessToken?: string;
    refreshToken?: string;
  };
  webhookUrl?: string;
  configuration?: {
    [key: string]: any;
  };
  syncSettings?: {
    autoSync: boolean;
    syncFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
    lastSyncStatus: 'success' | 'failed' | 'pending';
  };
  usage?: {
    totalRequests: number;
    successRate: number;
    monthlyUsage: number;
    lastUsed: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  isActive: boolean;
  usage: number;
  defaultTax: number;
  analytics?: {
    totalRevenue: number;
    totalUsage: number;
    averagePrice: number;
    monthlyGrowth: number;
    lastUsed: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: 'invoice' | 'client' | 'case' | 'payment' | 'reminder' | 'welcome' | 'notification' | 'marketing' | 'custom';
  category: 'transactional' | 'marketing' | 'system' | 'legal';
  isActive: boolean;
  lastUsed: Date;
  usage: number;
  body: string;
  variables: string[];
  sender?: {
    name: string;
    email: string;
  };
  settings?: {
    autoSend: boolean;
    schedule?: {
      enabled: boolean;
      frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
      time?: string;
      daysOfWeek?: number[];
    };
    attachments?: string[];
    priority: 'low' | 'normal' | 'high';
  };
  analytics?: {
    totalSent: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    lastSent: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  category: string;
  assignee: string;
  responses: number;
  createdAt: Date;
  updatedAt: Date;
  analytics?: {
    responseTimeAvg: number; // in hours
    resolutionTimeAvg: number; // in hours
    satisfactionRate: number; // percentage
  };
}

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("payment-gateways");
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // System Status State
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    overall: 'healthy',
    database: {
      status: 'online',
      responseTime: 45,
      connections: 12,
      uptime: 99.9
    },
    api: {
      status: 'online',
      responseTime: 120,
      requestsPerMinute: 450,
      errorRate: 0.02
    },
    storage: {
      used: 45.6,
      total: 100,
      percentage: 45.6
    },
    memory: {
      used: 8.2,
      total: 16,
      percentage: 51.25
    },
    services: [
      { name: 'Authentication Service', status: 'running', uptime: 99.8, lastCheck: new Date() },
      { name: 'Payment Processing', status: 'running', uptime: 99.5, lastCheck: new Date() },
      { name: 'Email Service', status: 'running', uptime: 98.9, lastCheck: new Date() },
      { name: 'File Storage', status: 'running', uptime: 99.9, lastCheck: new Date() },
      { name: 'Backup Service', status: 'running', uptime: 99.2, lastCheck: new Date() }
    ],
    lastUpdated: new Date()
  });

  // State for different sections
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([
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
      testMode: true,
      configuration: {
        captureMethod: 'automatic',
        paymentMethodTypes: ['card', 'apple_pay', 'google_pay'],
        statementDescriptor: 'LAW FIRM',
        receiptEmail: true
      },
      analytics: {
        totalTransactions: 1245,
        successRate: 98.5,
        averageAmount: 2500,
        monthlyVolume: 125000,
        lastTransaction: new Date('2024-01-16T14:30:00')
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: '2',
      name: 'PayPal',
      type: 'paypal',
      isConnected: false,
      isActive: false,
      publicKey: '',
      secretKey: '',
      webhookUrl: '',
      supportedMethods: ['PayPal Balance', 'Credit Card', 'Bank Transfer'],
      fees: '3.4% + R2.50',
      currency: 'ZAR',
      testMode: false,
      configuration: {},
      analytics: {
        totalTransactions: 0,
        successRate: 0,
        averageAmount: 0,
        monthlyVolume: 0,
        lastTransaction: new Date()
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'PayFast',
      type: 'payfast',
      isConnected: false,
      isActive: false,
      publicKey: '',
      secretKey: '',
      webhookUrl: '',
      supportedMethods: ['Credit Card', 'EFT', 'Instant EFT'],
      fees: '2.85% + R2.00',
      currency: 'ZAR',
      testMode: false,
      configuration: {},
      analytics: {
        totalTransactions: 0,
        successRate: 0,
        averageAmount: 0,
        monthlyVolume: 0,
        lastTransaction: new Date()
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
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
      status: 'active',
      apiCredentials: {
        clientId: 'fnb_client_123',
        clientSecret: '••••••••••••••••',
        accessToken: 'access_token_123'
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        lastSyncStatus: 'success'
      }
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
      status: 'pending',
      syncSettings: {
        autoSync: false,
        syncFrequency: 'manual',
        lastSyncStatus: 'pending'
      }
    }
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
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
      lastSync: new Date('2024-01-16T10:30:00'),
      price: 'R189/month',
      provider: 'Microsoft Corporation',
      version: '2024.1',
      apiCredentials: {
        clientId: 'ms365_client_123',
        clientSecret: '••••••••••••••••',
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_123'
      },
      webhookUrl: 'https://yourdomain.com/ms365/webhook',
      configuration: {
        syncCalendar: true,
        syncEmail: true,
        syncFiles: true,
        autoCreateMeetings: true
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'hourly',
        lastSyncStatus: 'success'
      },
      usage: {
        totalRequests: 15420,
        successRate: 99.2,
        monthlyUsage: 2340,
        lastUsed: new Date('2024-01-16T14:20:00')
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-16')
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
      price: 'R299/month',
      provider: 'DocuSign Inc.',
      version: '2024.2',
      syncSettings: {
        autoSync: false,
        syncFrequency: 'manual',
        lastSyncStatus: 'pending'
      },
      usage: {
        totalRequests: 0,
        successRate: 0,
        monthlyUsage: 0,
        lastUsed: new Date()
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
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
      lastSync: new Date('2024-01-16T08:00:00'),
      price: 'R399/month',
      provider: 'Intuit Inc.',
      version: '2024.1',
      apiCredentials: {
        clientId: 'qb_client_456',
        clientSecret: '••••••••••••••••',
        accessToken: 'access_token_456'
      },
      webhookUrl: 'https://yourdomain.com/quickbooks/webhook',
      configuration: {
        syncInvoices: true,
        syncPayments: true,
        syncExpenses: true,
        autoCreateClients: true
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        lastSyncStatus: 'success'
      },
      usage: {
        totalRequests: 8750,
        successRate: 98.8,
        monthlyUsage: 1250,
        lastUsed: new Date('2024-01-16T08:00:00')
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-16')
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
      price: 'R149/month',
      provider: 'Slack Technologies',
      version: '2024.1',
      syncSettings: {
        autoSync: false,
        syncFrequency: 'manual',
        lastSyncStatus: 'pending'
      },
      usage: {
        totalRequests: 0,
        successRate: 0,
        monthlyUsage: 0,
        lastUsed: new Date()
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '5',
      name: 'Salesforce',
      category: 'CRM',
      description: 'Customer relationship management and client tracking',
      icon: '🏢',
      isConnected: true,
      isActive: false,
      plan: 'Professional',
      features: ['Contact Management', 'Lead Tracking', 'Opportunity Management'],
      lastSync: new Date('2024-01-15T16:30:00'),
      price: 'R450/month',
      provider: 'Salesforce Inc.',
      version: '2024.3',
      apiCredentials: {
        clientId: 'sf_client_789',
        clientSecret: '••••••••••••••••',
        accessToken: 'access_token_789'
      },
      webhookUrl: 'https://yourdomain.com/salesforce/webhook',
      configuration: {
        syncContacts: true,
        syncLeads: true,
        autoCreateOpportunities: false
      },
      syncSettings: {
        autoSync: true,
        syncFrequency: 'daily',
        lastSyncStatus: 'success'
      },
      usage: {
        totalRequests: 5420,
        successRate: 97.5,
        monthlyUsage: 890,
        lastUsed: new Date('2024-01-15T16:30:00')
      },
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '6',
      name: 'Zoom',
      category: 'Communication',
      description: 'Video conferencing and virtual meeting platform',
      icon: '📹',
      isConnected: false,
      isActive: false,
      plan: 'Business',
      features: ['Video Meetings', 'Screen Sharing', 'Recording'],
      lastSync: null,
      price: 'R199/month',
      provider: 'Zoom Video Communications',
      version: '2024.1',
      syncSettings: {
        autoSync: false,
        syncFrequency: 'manual',
        lastSyncStatus: 'pending'
      },
      usage: {
        totalRequests: 0,
        successRate: 0,
        monthlyUsage: 0,
        lastUsed: new Date()
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]);

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Invoice Reminder',
      subject: 'Payment Reminder: Invoice #{invoice_number}',
      type: 'invoice',
      category: 'transactional',
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
{firm_name}`,
      variables: ['client_name', 'invoice_number', 'amount', 'invoice_date', 'due_date', 'firm_name'],
      sender: {
        name: 'Billing Department',
        email: 'billing@lawfirm.com'
      },
      settings: {
        autoSend: true,
        schedule: {
          enabled: true,
          frequency: 'daily',
          time: '09:00'
        },
        priority: 'normal'
      },
      analytics: {
        totalSent: 245,
        openRate: 78.2,
        clickRate: 34.5,
        bounceRate: 2.1,
        lastSent: new Date('2024-01-15T09:00:00')
      },
      createdBy: 'Admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Welcome New Client',
      subject: 'Welcome to {firm_name} - Getting Started',
      type: 'welcome',
      category: 'transactional',
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
{attorney_name}`,
      variables: ['client_name', 'firm_name', 'portal_url', 'client_email', 'temp_password', 'attorney_name'],
      sender: {
        name: 'Client Services',
        email: 'welcome@lawfirm.com'
      },
      settings: {
        autoSend: true,
        schedule: {
          enabled: false,
          frequency: 'immediate'
        },
        priority: 'high'
      },
      analytics: {
        totalSent: 89,
        openRate: 92.1,
        clickRate: 67.8,
        bounceRate: 1.2,
        lastSent: new Date('2024-01-14T15:30:00')
      },
      createdBy: 'Admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-14')
    },
    {
      id: '3',
      name: 'Case Update Notification',
      subject: 'Case Update: {case_name}',
      type: 'case',
      category: 'transactional',
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
{attorney_name}`,
      variables: ['client_name', 'case_name', 'update_details', 'next_steps', 'attorney_name'],
      sender: {
        name: 'Legal Team',
        email: 'updates@lawfirm.com'
      },
      settings: {
        autoSend: false,
        schedule: {
          enabled: false,
          frequency: 'immediate'
        },
        priority: 'normal'
      },
      analytics: {
        totalSent: 156,
        openRate: 85.7,
        clickRate: 23.4,
        bounceRate: 1.8,
        lastSent: new Date('2024-01-13T11:45:00')
      },
      createdBy: 'Legal Team',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-13')
    },
    {
      id: '4',
      name: 'Payment Confirmation',
      subject: 'Payment Received - Thank You!',
      type: 'payment',
      category: 'transactional',
      isActive: true,
      lastUsed: new Date('2024-01-16'),
      usage: 123,
      body: `Dear {client_name},

Thank you for your payment! We have successfully received your payment for Invoice #{invoice_number}.

Payment Details:
- Amount Paid: {payment_amount}
- Payment Date: {payment_date}
- Payment Method: {payment_method}
- Transaction ID: {transaction_id}

Your account has been updated accordingly.

Best regards,
{firm_name}`,
      variables: ['client_name', 'invoice_number', 'payment_amount', 'payment_date', 'payment_method', 'transaction_id', 'firm_name'],
      sender: {
        name: 'Billing Department',
        email: 'billing@lawfirm.com'
      },
      settings: {
        autoSend: true,
        schedule: {
          enabled: false,
          frequency: 'immediate'
        },
        priority: 'normal'
      },
      analytics: {
        totalSent: 312,
        openRate: 89.4,
        clickRate: 12.3,
        bounceRate: 0.9,
        lastSent: new Date('2024-01-16T14:22:00')
      },
      createdBy: 'Admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: '5',
      name: 'Appointment Reminder',
      subject: 'Reminder: Upcoming Appointment - {appointment_date}',
      type: 'reminder',
      category: 'transactional',
      isActive: true,
      lastUsed: new Date('2024-01-12'),
      usage: 89,
      body: `Dear {client_name},

This is a reminder about your upcoming appointment:

Appointment Details:
- Date: {appointment_date}
- Time: {appointment_time}
- Location: {appointment_location}
- Attorney: {attorney_name}
- Purpose: {appointment_purpose}

Please arrive 15 minutes early and bring any relevant documents.

If you need to reschedule, please contact us at least 24 hours in advance.

Best regards,
{firm_name}`,
      variables: ['client_name', 'appointment_date', 'appointment_time', 'appointment_location', 'attorney_name', 'appointment_purpose', 'firm_name'],
      sender: {
        name: 'Appointment Scheduler',
        email: 'appointments@lawfirm.com'
      },
      settings: {
        autoSend: true,
        schedule: {
          enabled: true,
          frequency: 'daily',
          time: '08:00'
        },
        priority: 'high'
      },
      analytics: {
        totalSent: 178,
        openRate: 94.2,
        clickRate: 45.6,
        bounceRate: 1.1,
        lastSent: new Date('2024-01-12T08:00:00')
      },
      createdBy: 'Admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: '6',
      name: 'Monthly Newsletter',
      subject: 'Legal Updates & Firm News - {month} {year}',
      type: 'marketing',
      category: 'marketing',
      isActive: false,
      lastUsed: new Date('2024-01-01'),
      usage: 12,
      body: `Dear {client_name},

Welcome to our monthly newsletter! Here are the latest legal updates and firm news:

Legal Updates:
{legal_updates}

Firm News:
{firm_news}

Upcoming Events:
{upcoming_events}

Best regards,
{firm_name} Team`,
      variables: ['client_name', 'month', 'year', 'legal_updates', 'firm_news', 'upcoming_events', 'firm_name'],
      sender: {
        name: 'Marketing Team',
        email: 'newsletter@lawfirm.com'
      },
      settings: {
        autoSend: true,
        schedule: {
          enabled: true,
          frequency: 'monthly',
          time: '10:00'
        },
        priority: 'low'
      },
      analytics: {
        totalSent: 1240,
        openRate: 42.3,
        clickRate: 8.7,
        bounceRate: 3.2,
        lastSent: new Date('2024-01-01T10:00:00')
      },
      createdBy: 'Marketing Team',
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-01')
    }
  ]);

  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Legal Consultation',
      description: 'Initial consultation and legal advice',
      price: 500,
      unit: 'hour',
      category: 'Consultation',
      isActive: true,
      usage: 45,
      defaultTax: 15,
      analytics: {
        totalRevenue: 22500,
        totalUsage: 45,
        averagePrice: 500,
        monthlyGrowth: 8.5,
        lastUsed: new Date('2024-01-15')
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15')
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
      defaultTax: 15,
      analytics: {
        totalRevenue: 38400,
        totalUsage: 32,
        averagePrice: 1200,
        monthlyGrowth: 12.3,
        lastUsed: new Date('2024-01-14')
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-14')
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
      defaultTax: 15,
      analytics: {
        totalRevenue: 14400,
        totalUsage: 18,
        averagePrice: 800,
        monthlyGrowth: 5.2,
        lastUsed: new Date('2024-01-12')
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-12')
    }
  ]);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      title: 'Payment gateway integration issue',
      description: 'Unable to connect Stripe payment gateway. Getting API key error.',
      priority: 'high',
      status: 'in-progress',
      category: 'Payment',
      assignee: 'Support Team',
      responses: 3,
      createdAt: new Date('2024-01-15T14:30:00'),
      updatedAt: new Date('2024-01-16T09:15:00'),
      analytics: {
        responseTimeAvg: 0,
        resolutionTimeAvg: 0,
        satisfactionRate: 0
      }
    },
    {
      id: '2',
      title: 'Email template formatting',
      description: 'Invoice reminder emails are not formatting properly with client variables.',
      priority: 'medium',
      status: 'open',
      category: 'Email',
      assignee: 'Unassigned',
      responses: 0,
      createdAt: new Date('2024-01-14T11:20:00'),
      updatedAt: new Date('2024-01-14T11:20:00'),
      analytics: {
        responseTimeAvg: 0,
        resolutionTimeAvg: 0,
        satisfactionRate: 0
      }
    },
    {
      id: '3',
      title: 'Bank reconciliation sync',
      description: 'Transactions are not syncing properly from FNB business account.',
      priority: 'low',
      status: 'resolved',
      category: 'Banking',
      assignee: 'Technical Support',
      responses: 5,
      createdAt: new Date('2024-01-10T16:45:00'),
      updatedAt: new Date('2024-01-12T10:30:00'),
      analytics: {
        responseTimeAvg: 0,
        resolutionTimeAvg: 0,
        satisfactionRate: 0
      }
    }
  ]);

  // Dialog states
  const [showSystemStatusDialog, setShowSystemStatusDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);

  
  // Payment Gateway Dialog States
  const [showGatewayConfigDialog, setShowGatewayConfigDialog] = useState(false);
  const [showGatewayApiKeysDialog, setShowGatewayApiKeysDialog] = useState(false);
  const [showGatewayAnalyticsDialog, setShowGatewayAnalyticsDialog] = useState(false);
  const [showGatewayRemoveDialog, setShowGatewayRemoveDialog] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  
  // Bank Account Dialog States
  const [showBankConfigDialog, setShowBankConfigDialog] = useState(false);
  const [showBankSyncDialog, setShowBankSyncDialog] = useState(false);
  const [showBankRemoveDialog, setShowBankRemoveDialog] = useState(false);
  const [showBankEditDialog, setShowBankEditDialog] = useState(false);
  const [showBankDisconnectDialog, setShowBankDisconnectDialog] = useState(false);
  const [showBankTransactionsDialog, setShowBankTransactionsDialog] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [bankTransactions, setBankTransactions] = useState<any[]>([]);
  
  // Integration Dialog States
  const [showIntegrationConfigDialog, setShowIntegrationConfigDialog] = useState(false);
  const [showIntegrationDetailsDialog, setShowIntegrationDetailsDialog] = useState(false);
  const [showIntegrationRemoveDialog, setShowIntegrationRemoveDialog] = useState(false);
  const [showIntegrationDisconnectDialog, setShowIntegrationDisconnectDialog] = useState(false);
  const [showIntegrationUsageDialog, setShowIntegrationUsageDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  
  // Integration Search and Filter States
  const [integrationSearchTerm, setIntegrationSearchTerm] = useState('');
  const [integrationFilterCategory, setIntegrationFilterCategory] = useState<string>('all');
  const [integrationFilterStatus, setIntegrationFilterStatus] = useState<string>('all');
  
  // Email Template Dialog States
  const [showTemplateDetailsDialog, setShowTemplateDetailsDialog] = useState(false);
  const [showTemplateAnalyticsDialog, setShowTemplateAnalyticsDialog] = useState(false);
  const [showTemplatePreviewDialog, setShowTemplatePreviewDialog] = useState(false);
  const [showTemplateTestDialog, setShowTemplateTestDialog] = useState(false);
  const [showTemplateDeleteDialog, setShowTemplateDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  
  // Email Template Search and Filter States
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [templateFilterType, setTemplateFilterType] = useState<string>('all');
  const [templateFilterCategory, setTemplateFilterCategory] = useState<string>('all');
  const [templateFilterStatus, setTemplateFilterStatus] = useState<string>('all');
  
  // Service Dialog States
  const [showServiceEditDialog, setShowServiceEditDialog] = useState(false);
  const [showServiceAnalyticsDialog, setShowServiceAnalyticsDialog] = useState(false);
  const [showServiceDeleteDialog, setShowServiceDeleteDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form States
  const [gatewayForm, setGatewayForm] = useState({
    name: '',
    type: 'stripe' as PaymentGateway['type'],
    publicKey: '',
    secretKey: '',
    webhookUrl: '',
    fees: '',
    currency: 'ZAR',
    testMode: true,
    supportedMethods: [] as string[],
    configuration: {}
  });
  
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchCode: '',
    accountType: 'Business Cheque',
    clientId: '',
    clientSecret: '',
    autoSync: true,
    syncFrequency: 'daily' as BankAccount['syncSettings']['syncFrequency']
  });
  
  const [integrationForm, setIntegrationForm] = useState({
    name: '',
    category: 'Other' as Integration['category'],
    description: '',
    icon: '',
    plan: '',
    price: '',
    provider: '',
    version: '',
    features: [] as string[],
    clientId: '',
    clientSecret: '',
    webhookUrl: '',
    autoSync: true,
    syncFrequency: 'daily' as Integration['syncSettings']['syncFrequency'],
    configuration: {} as { [key: string]: any }
  });
  
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: 0,
    unit: '',
    category: '',
    isActive: true,
    defaultTax: 15
  });

  // Ticket Dialog States
  const [showTicketEditDialog, setShowTicketEditDialog] = useState(false);
  const [showTicketDetailsDialog, setShowTicketDetailsDialog] = useState(false);
  const [showTicketDeleteDialog, setShowTicketDeleteDialog] = useState(false);
  const [showTicketAnalyticsDialog, setShowTicketAnalyticsDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);

  // Ticket Form State
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as SupportTicket['priority'],
    status: 'open' as SupportTicket['status'],
    category: '',
    assignee: '',
  });

  // System Status CRUD Handlers
  const handleSystemStatusRefresh = async () => {
    try {
      toast({
        title: "Refreshing System Status",
        description: "Checking all system components...",
      });
      
      // Simulate API call to refresh system status
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update system status with fresh data
      setSystemStatus(prev => ({
        ...prev,
        lastUpdated: new Date(),
        database: {
          ...prev.database,
          responseTime: Math.random() * 100 + 20,
          connections: Math.floor(Math.random() * 20) + 5
        },
        api: {
          ...prev.api,
          responseTime: Math.random() * 200 + 50,
          requestsPerMinute: Math.floor(Math.random() * 500) + 200
        }
      }));
      
      toast({
        title: "System Status Updated",
        description: "All system components have been checked successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh system status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewSystemStatus = () => {
    setShowSystemStatusDialog(true);
  };

  // Payment Gateway CRUD Handlers
  const handleSaveGateway = async () => {
    try {
      if (!gatewayForm.name || !gatewayForm.type) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const gatewayData: PaymentGateway = {
        id: editingGateway?.id || `gateway_${Date.now()}`,
        name: gatewayForm.name,
        type: gatewayForm.type,
        publicKey: gatewayForm.publicKey,
        secretKey: gatewayForm.secretKey,
        webhookUrl: gatewayForm.webhookUrl,
        fees: gatewayForm.fees,
        currency: gatewayForm.currency,
        testMode: gatewayForm.testMode,
        supportedMethods: gatewayForm.supportedMethods,
        isConnected: gatewayForm.publicKey && gatewayForm.secretKey ? true : false,
        isActive: false,
        configuration: gatewayForm.configuration,
        analytics: editingGateway?.analytics || {
          totalTransactions: 0,
          successRate: 0,
          averageAmount: 0,
          monthlyVolume: 0,
          lastTransaction: new Date()
        },
        createdAt: editingGateway?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (editingGateway) {
        // Update existing gateway
        setPaymentGateways(prev => prev.map(g => 
          g.id === editingGateway.id ? gatewayData : g
        ));
        toast({
          title: "Gateway Updated",
          description: `${gatewayData.name} has been updated successfully.`,
        });
      } else {
        // Create new gateway
        setPaymentGateways(prev => [...prev, gatewayData]);
        toast({
          title: "Gateway Added",
          description: `${gatewayData.name} has been added successfully.`,
        });
      }

      setShowPaymentDialog(false);
      setEditingGateway(null);
      setGatewayForm({
        name: '',
        type: 'stripe',
        publicKey: '',
        secretKey: '',
        webhookUrl: '',
        fees: '',
        currency: 'ZAR',
        testMode: true,
        supportedMethods: [],
        configuration: {}
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save gateway. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleConfigureGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setEditingGateway(gateway);
    setGatewayForm({
      name: gateway.name,
      type: gateway.type,
      publicKey: gateway.publicKey,
      secretKey: gateway.secretKey,
      webhookUrl: gateway.webhookUrl,
      fees: gateway.fees,
      currency: gateway.currency,
      testMode: gateway.testMode,
      supportedMethods: gateway.supportedMethods,
      configuration: gateway.configuration || {}
    });
    setShowGatewayConfigDialog(true);
  };

  const handleGatewayApiKeys = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setShowGatewayApiKeysDialog(true);
  };

  const handleGatewayAnalytics = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setShowGatewayAnalyticsDialog(true);
  };

  const handleRemoveGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setShowGatewayRemoveDialog(true);
  };

  const handleConfirmRemoveGateway = async () => {
    if (!selectedGateway) return;

    try {
      setPaymentGateways(prev => prev.filter(g => g.id !== selectedGateway.id));
      
      toast({
        title: "Gateway Removed",
        description: `${selectedGateway.name} has been removed successfully.`,
      });
      
      setShowGatewayRemoveDialog(false);
      setSelectedGateway(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove gateway. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleGateway = async (gatewayId: string) => {
    try {
      setPaymentGateways(prev => prev.map(g => 
        g.id === gatewayId ? { ...g, isActive: !g.isActive } : g
      ));
      
      const gateway = paymentGateways.find(g => g.id === gatewayId);
      toast({
        title: "Gateway Updated",
        description: `${gateway?.name} has been ${gateway?.isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update gateway status.",
        variant: "destructive"
      });
    }
  };

  const handleTestGateway = async (gateway: PaymentGateway) => {
    try {
      toast({
        title: "Testing Gateway",
        description: `Testing connection to ${gateway.name}...`,
      });
      
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isSuccess = Math.random() > 0.2; // 80% success rate
      
      if (isSuccess) {
        toast({
          title: "Test Successful",
          description: `${gateway.name} is configured correctly and ready to process payments.`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: `${gateway.name} configuration has issues. Please check your API keys.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test gateway connection.",
        variant: "destructive"
      });
    }
  };

  // Bank Account CRUD Handlers
  const handleSaveBankAccount = async () => {
    try {
      if (!bankForm.bankName || !bankForm.accountName || !bankForm.accountNumber) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const bankData: BankAccount = {
        id: editingBankAccount?.id || `bank_${Date.now()}`,
        bankName: bankForm.bankName,
        accountName: bankForm.accountName,
        accountNumber: bankForm.accountNumber,
        branchCode: bankForm.branchCode,
        accountType: bankForm.accountType,
        isConnected: bankForm.clientId && bankForm.clientSecret ? true : false,
        lastSync: null,
        balance: 0,
        status: 'pending',
        apiCredentials: {
          clientId: bankForm.clientId,
          clientSecret: bankForm.clientSecret
        },
        syncSettings: {
          autoSync: bankForm.autoSync,
          syncFrequency: bankForm.syncFrequency,
          lastSyncStatus: 'pending'
        }
      };

      if (editingBankAccount) {
        // Update existing bank account
        setBankAccounts(prev => prev.map(b => 
          b.id === editingBankAccount.id ? bankData : b
        ));
        toast({
          title: "Bank Account Updated",
          description: `${bankData.bankName} account has been updated successfully.`,
        });
      } else {
        // Create new bank account
        setBankAccounts(prev => [...prev, bankData]);
        toast({
          title: "Bank Account Added",
          description: `${bankData.bankName} account has been added successfully.`,
        });
      }

      setShowBankDialog(false);
      setEditingBankAccount(null);
      setBankForm({
        bankName: '',
        accountName: '',
        accountNumber: '',
        branchCode: '',
        accountType: 'Business Cheque',
        clientId: '',
        clientSecret: '',
        autoSync: true,
        syncFrequency: 'daily'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bank account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSyncBankAccount = async (bankAccount: BankAccount) => {
    try {
      toast({
        title: "Syncing Bank Account",
        description: `Syncing transactions from ${bankAccount.bankName}...`,
      });
      
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Update bank account with sync results
      setBankAccounts(prev => prev.map(b => 
        b.id === bankAccount.id ? {
          ...b,
          lastSync: new Date(),
          syncSettings: {
            ...b.syncSettings,
            lastSyncStatus: 'success'
          }
        } : b
      ));
      
      toast({
        title: "Sync Completed",
        description: `Successfully synced ${Math.floor(Math.random() * 50) + 10} transactions.`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync bank account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewBankTransactions = (bankAccount: BankAccount) => {
    // Mock transaction data for demonstration
    const mockTransactions = [
      {
        id: '1',
        date: new Date('2024-01-16T10:30:00'),
        description: 'Client Payment - Invoice #INV-2024-001',
        amount: 2500.00,
        type: 'credit',
        balance: 125750.50,
        reference: 'TXN-001-2024',
        status: 'completed'
      },
      {
        id: '2',
        date: new Date('2024-01-15T14:22:00'),
        description: 'Office Rent Payment',
        amount: -8500.00,
        type: 'debit',
        balance: 123250.50,
        reference: 'TXN-002-2024',
        status: 'completed'
      },
      {
        id: '3',
        date: new Date('2024-01-14T09:15:00'),
        description: 'Client Payment - Invoice #INV-2024-002',
        amount: 1800.00,
        type: 'credit',
        balance: 131750.50,
        reference: 'TXN-003-2024',
        status: 'completed'
      },
      {
        id: '4',
        date: new Date('2024-01-13T16:45:00'),
        description: 'Professional Services Fee',
        amount: -450.00,
        type: 'debit',
        balance: 129950.50,
        reference: 'TXN-004-2024',
        status: 'completed'
      },
      {
        id: '5',
        date: new Date('2024-01-12T11:30:00'),
        description: 'Client Payment - Invoice #INV-2024-003',
        amount: 3200.00,
        type: 'credit',
        balance: 130400.50,
        reference: 'TXN-005-2024',
        status: 'completed'
      }
    ];

    setSelectedBankAccount(bankAccount);
    setBankTransactions(mockTransactions);
    setShowBankTransactionsDialog(true);
  };

  const handleConfigureBankAccount = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setEditingBankAccount(bankAccount);
    setBankForm({
      bankName: bankAccount.bankName,
      accountName: bankAccount.accountName,
      accountNumber: bankAccount.accountNumber,
      branchCode: bankAccount.branchCode,
      accountType: bankAccount.accountType,
      clientId: bankAccount.apiCredentials?.clientId || '',
      clientSecret: bankAccount.apiCredentials?.clientSecret || '',
      autoSync: bankAccount.syncSettings?.autoSync || false,
      syncFrequency: bankAccount.syncSettings?.syncFrequency || 'daily'
    });
    setShowBankConfigDialog(true);
  };

  const handleRemoveBankAccount = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setShowBankRemoveDialog(true);
  };

  const handleConfirmRemoveBankAccount = async () => {
    if (!selectedBankAccount) return;

    try {
      setBankAccounts(prev => prev.filter(b => b.id !== selectedBankAccount.id));
      
      toast({
        title: "Bank Account Removed",
        description: `${selectedBankAccount.bankName} account has been removed successfully.`,
      });
      
      setShowBankRemoveDialog(false);
      setSelectedBankAccount(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove bank account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditBankDetails = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setEditingBankAccount(bankAccount);
    setBankForm({
      bankName: bankAccount.bankName,
      accountName: bankAccount.accountName,
      accountNumber: bankAccount.accountNumber,
      branchCode: bankAccount.branchCode,
      accountType: bankAccount.accountType,
      clientId: bankAccount.apiCredentials?.clientId || '',
      clientSecret: bankAccount.apiCredentials?.clientSecret || '',
      autoSync: bankAccount.syncSettings?.autoSync || false,
      syncFrequency: bankAccount.syncSettings?.syncFrequency || 'daily'
    });
    setShowBankEditDialog(true);
  };

  const handleSaveBankDetails = async () => {
    if (!editingBankAccount) return;

    try {
      const updatedAccount: BankAccount = {
        ...editingBankAccount,
        bankName: bankForm.bankName,
        accountName: bankForm.accountName,
        accountNumber: bankForm.accountNumber,
        branchCode: bankForm.branchCode,
        accountType: bankForm.accountType,
        apiCredentials: {
          clientId: bankForm.clientId,
          clientSecret: bankForm.clientSecret,
          accessToken: editingBankAccount.apiCredentials?.accessToken
        },
        syncSettings: {
          autoSync: bankForm.autoSync,
          syncFrequency: bankForm.syncFrequency,
          lastSyncStatus: editingBankAccount.syncSettings?.lastSyncStatus || 'pending'
        }
      };

      setBankAccounts(prev => prev.map(b => 
        b.id === editingBankAccount.id ? updatedAccount : b
      ));

      toast({
        title: "Bank Details Updated",
        description: `${bankForm.bankName} account details have been updated successfully.`,
      });

      setShowBankEditDialog(false);
      setEditingBankAccount(null);
      setBankForm({
        bankName: '',
        accountName: '',
        accountNumber: '',
        branchCode: '',
        accountType: 'Business Cheque',
        clientId: '',
        clientSecret: '',
        autoSync: true,
        syncFrequency: 'daily'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bank account details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectBankAccount = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setShowBankDisconnectDialog(true);
  };

  const handleConfirmDisconnectBankAccount = async () => {
    if (!selectedBankAccount) return;

    try {
      setBankAccounts(prev => prev.map(b => 
        b.id === selectedBankAccount.id ? {
          ...b,
          isConnected: false,
          status: 'inactive' as const,
          lastSync: null,
          apiCredentials: undefined,
          syncSettings: {
            ...b.syncSettings,
            autoSync: false,
            lastSyncStatus: 'pending' as const
          }
        } : b
      ));

      toast({
        title: "Bank Account Disconnected",
        description: `${selectedBankAccount.bankName} has been disconnected successfully.`,
      });

      setShowBankDisconnectDialog(false);
      setSelectedBankAccount(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect bank account. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Integration CRUD Handlers
  const handleSaveIntegration = async () => {
    try {
      if (!integrationForm.name || !integrationForm.category) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const integrationData: Integration = {
        id: editingIntegration?.id || `integration_${Date.now()}`,
        name: integrationForm.name,
        category: integrationForm.category,
        description: integrationForm.description,
        icon: integrationForm.icon,
        plan: integrationForm.plan,
        price: integrationForm.price,
        provider: integrationForm.provider,
        version: integrationForm.version,
        features: integrationForm.features,
        isConnected: integrationForm.clientId && integrationForm.clientSecret ? true : false,
        isActive: false,
        lastSync: null,
        apiCredentials: integrationForm.clientId && integrationForm.clientSecret ? {
          clientId: integrationForm.clientId,
          clientSecret: integrationForm.clientSecret
        } : undefined,
        webhookUrl: integrationForm.webhookUrl,
        configuration: integrationForm.configuration,
        syncSettings: {
          autoSync: integrationForm.autoSync,
          syncFrequency: integrationForm.syncFrequency,
          lastSyncStatus: 'pending'
        },
        usage: editingIntegration?.usage || {
          totalRequests: 0,
          successRate: 0,
          monthlyUsage: 0,
          lastUsed: new Date()
        },
        createdAt: editingIntegration?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (editingIntegration) {
        // Update existing integration
        setIntegrations(prev => prev.map(i => 
          i.id === editingIntegration.id ? integrationData : i
        ));
        toast({
          title: "Integration Updated",
          description: `${integrationData.name} has been updated successfully.`,
        });
      } else {
        // Create new integration
        setIntegrations(prev => [...prev, integrationData]);
        toast({
          title: "Integration Added",
          description: `${integrationData.name} has been added successfully.`,
        });
      }

      setShowIntegrationDialog(false);
      setEditingIntegration(null);
      resetIntegrationForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetIntegrationForm = () => {
    setIntegrationForm({
      name: '',
      category: 'Other',
      description: '',
      icon: '',
      plan: '',
      price: '',
      provider: '',
      version: '',
      features: [],
      clientId: '',
      clientSecret: '',
      webhookUrl: '',
      autoSync: true,
      syncFrequency: 'daily',
      configuration: {}
    });
  };

  const handleConnectIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setEditingIntegration(integration);
    setIntegrationForm({
      name: integration.name,
      category: integration.category,
      description: integration.description,
      icon: integration.icon,
      plan: integration.plan,
      price: integration.price,
      provider: integration.provider,
      version: integration.version,
      features: integration.features,
      clientId: integration.apiCredentials?.clientId || '',
      clientSecret: integration.apiCredentials?.clientSecret || '',
      webhookUrl: integration.webhookUrl || '',
      autoSync: integration.syncSettings?.autoSync || true,
      syncFrequency: integration.syncSettings?.syncFrequency || 'daily',
      configuration: integration.configuration || {}
    });
    setShowIntegrationConfigDialog(true);
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setEditingIntegration(integration);
    setIntegrationForm({
      name: integration.name,
      category: integration.category,
      description: integration.description,
      icon: integration.icon,
      plan: integration.plan,
      price: integration.price,
      provider: integration.provider,
      version: integration.version,
      features: integration.features,
      clientId: integration.apiCredentials?.clientId || '',
      clientSecret: integration.apiCredentials?.clientSecret || '',
      webhookUrl: integration.webhookUrl || '',
      autoSync: integration.syncSettings?.autoSync || true,
      syncFrequency: integration.syncSettings?.syncFrequency || 'daily',
      configuration: integration.configuration || {}
    });
    setShowIntegrationConfigDialog(true);
  };

  const handleViewIntegrationDetails = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowIntegrationDetailsDialog(true);
  };

  const handleViewIntegrationUsage = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowIntegrationUsageDialog(true);
  };

  const handleSyncIntegration = async (integration: Integration) => {
    try {
      toast({
        title: "Syncing Integration",
        description: `Syncing data from ${integration.name}...`,
      });
      
      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update integration with sync results
      setIntegrations(prev => prev.map(i => 
        i.id === integration.id ? {
          ...i,
          lastSync: new Date(),
          syncSettings: {
            ...i.syncSettings,
            lastSyncStatus: 'success'
          },
          usage: {
            ...i.usage,
            totalRequests: (i.usage?.totalRequests || 0) + Math.floor(Math.random() * 50) + 10,
            lastUsed: new Date()
          }
        } : i
      ));
      
      toast({
        title: "Sync Completed",
        description: `Successfully synced data from ${integration.name}.`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleIntegration = async (integrationId: string) => {
    try {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId ? { ...i, isActive: !i.isActive } : i
      ));
      
      const integration = integrations.find(i => i.id === integrationId);
      toast({
        title: `Integration ${integration?.isActive ? 'Deactivated' : 'Activated'}`,
        description: `${integration?.name} has been ${integration?.isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle integration status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowIntegrationDisconnectDialog(true);
  };

  const handleConfirmDisconnectIntegration = async () => {
    if (!selectedIntegration) return;

    try {
      setIntegrations(prev => prev.map(i => 
        i.id === selectedIntegration.id ? {
          ...i,
          isConnected: false,
          isActive: false,
          lastSync: null,
          apiCredentials: undefined,
          syncSettings: {
            ...i.syncSettings,
            autoSync: false,
            lastSyncStatus: 'pending'
          }
        } : i
      ));

      toast({
        title: "Integration Disconnected",
        description: `${selectedIntegration.name} has been disconnected successfully.`,
      });

      setShowIntegrationDisconnectDialog(false);
      setSelectedIntegration(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveIntegration = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowIntegrationRemoveDialog(true);
  };

  const handleConfirmRemoveIntegration = async () => {
    if (!selectedIntegration) return;

    try {
      setIntegrations(prev => prev.filter(i => i.id !== selectedIntegration.id));
      
      toast({
        title: "Integration Removed",
        description: `${selectedIntegration.name} has been removed successfully.`,
      });
      
      setShowIntegrationRemoveDialog(false);
      setSelectedIntegration(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove integration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getFilteredIntegrations = () => {
    return integrations.filter(integration => {
      const matchesSearch = integration.name.toLowerCase().includes(integrationSearchTerm.toLowerCase()) ||
                           integration.description.toLowerCase().includes(integrationSearchTerm.toLowerCase()) ||
                           integration.provider.toLowerCase().includes(integrationSearchTerm.toLowerCase());
      
      const matchesCategory = integrationFilterCategory === 'all' || integration.category === integrationFilterCategory;
      
      const matchesStatus = integrationFilterStatus === 'all' ||
                           (integrationFilterStatus === 'connected' && integration.isConnected) ||
                           (integrationFilterStatus === 'disconnected' && !integration.isConnected) ||
                           (integrationFilterStatus === 'active' && integration.isActive) ||
                           (integrationFilterStatus === 'inactive' && !integration.isActive);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

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

  // Email Template CRUD Handlers
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    type: 'custom' as EmailTemplate['type'],
    category: 'transactional' as EmailTemplate['category'],
    body: '',
    variables: [] as string[],
    senderName: '',
    senderEmail: '',
    autoSend: false,
    scheduleEnabled: false,
    scheduleFrequency: 'immediate' as EmailTemplate['settings']['schedule']['frequency'],
    scheduleTime: '',
    priority: 'normal' as EmailTemplate['settings']['priority'],
    attachments: [] as string[]
  });

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      type: 'custom',
      category: 'transactional',
      body: '',
      variables: [],
      senderName: '',
      senderEmail: '',
      autoSend: false,
      scheduleEnabled: false,
      scheduleFrequency: 'immediate',
      scheduleTime: '',
      priority: 'normal',
      attachments: []
    });
  };

  const handleSaveTemplate = async () => {
    try {
      if (!templateForm.name || !templateForm.subject || !templateForm.body) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (name, subject, body).",
          variant: "destructive"
        });
        return;
      }

      const templateData: EmailTemplate = {
        id: editingTemplate?.id || `template_${Date.now()}`,
        name: templateForm.name,
        subject: templateForm.subject,
        type: templateForm.type,
        category: templateForm.category,
        body: templateForm.body,
        variables: templateForm.variables,
        isActive: editingTemplate?.isActive ?? true,
        lastUsed: editingTemplate?.lastUsed || new Date(),
        usage: editingTemplate?.usage || 0,
        sender: {
          name: templateForm.senderName || 'Law Firm',
          email: templateForm.senderEmail || 'noreply@lawfirm.com'
        },
        settings: {
          autoSend: templateForm.autoSend,
          schedule: {
            enabled: templateForm.scheduleEnabled,
            frequency: templateForm.scheduleFrequency,
            time: templateForm.scheduleTime || undefined
          },
          priority: templateForm.priority,
          attachments: templateForm.attachments
        },
        analytics: editingTemplate?.analytics || {
          totalSent: 0,
          openRate: 0,
          clickRate: 0,
          bounceRate: 0,
          lastSent: new Date()
        },
        createdBy: 'Current User',
        createdAt: editingTemplate?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (editingTemplate) {
        // Update existing template
        setEmailTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? templateData : t
        ));
        toast({
          title: "Template Updated",
          description: `${templateData.name} has been updated successfully.`,
        });
      } else {
        // Create new template
        setEmailTemplates(prev => [...prev, templateData]);
        toast({
          title: "Template Created",
          description: `${templateData.name} has been created successfully.`,
        });
      }

      setShowTemplateDialog(false);
      setEditingTemplate(null);
      resetTemplateForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      type: template.type,
      category: template.category,
      body: template.body,
      variables: template.variables,
      senderName: template.sender?.name || '',
      senderEmail: template.sender?.email || '',
      autoSend: template.settings?.autoSend || false,
      scheduleEnabled: template.settings?.schedule?.enabled || false,
      scheduleFrequency: template.settings?.schedule?.frequency || 'immediate',
      scheduleTime: template.settings?.schedule?.time || '',
      priority: template.settings?.priority || 'normal',
      attachments: template.settings?.attachments || []
    });
    setShowTemplateDialog(true);
  };

  const handleViewTemplateDetails = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDetailsDialog(true);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplatePreviewDialog(true);
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicatedTemplate: EmailTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      usage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      analytics: {
        totalSent: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        lastSent: new Date()
      }
    };

    setEmailTemplates(prev => [...prev, duplicatedTemplate]);
    toast({
      title: "Template Duplicated",
      description: `${duplicatedTemplate.name} has been created successfully.`,
    });
  };

  const handleTestSendTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateTestDialog(true);
  };

  const handleConfirmTestSend = async (email: string) => {
    try {
      if (!selectedTemplate) return;

      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Test Email Sent",
        description: `Test email sent to ${email} successfully.`,
      });

      setShowTemplateTestDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleTemplate = async (templateId: string) => {
    try {
      setEmailTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, isActive: !template.isActive, updatedAt: new Date() }
          : template
      ));

      const template = emailTemplates.find(t => t.id === templateId);
      toast({
        title: "Template Updated",
        description: `${template?.name} has been ${template?.isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDeleteDialog(true);
  };

  const handleConfirmDeleteTemplate = async () => {
    try {
      if (!selectedTemplate) return;

      setEmailTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
      
      toast({
        title: "Template Deleted",
        description: `${selectedTemplate.name} has been deleted successfully.`,
      });

      setShowTemplateDeleteDialog(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewTemplateAnalytics = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateAnalyticsDialog(true);
  };

  const handleScheduleTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      type: template.type,
      category: template.category,
      body: template.body,
      variables: template.variables,
      senderName: template.sender?.name || '',
      senderEmail: template.sender?.email || '',
      autoSend: template.settings?.autoSend || false,
      scheduleEnabled: template.settings?.schedule?.enabled || false,
      scheduleFrequency: template.settings?.schedule?.frequency || 'immediate',
      scheduleTime: template.settings?.schedule?.time || '',
      priority: template.settings?.priority || 'normal',
      attachments: template.settings?.attachments || []
    });
    toast({
      title: "Schedule Template",
      description: `Scheduling functionality for ${template.name} will be available soon.`,
    });
  };

  const getFilteredTemplates = () => {
    return emailTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
                           template.subject.toLowerCase().includes(templateSearchTerm.toLowerCase());
      const matchesType = templateFilterType === 'all' || template.type === templateFilterType;
      const matchesCategory = templateFilterCategory === 'all' || template.category === templateFilterCategory;
      const matchesStatus = templateFilterStatus === 'all' || 
                           (templateFilterStatus === 'active' && template.isActive) ||
                           (templateFilterStatus === 'inactive' && !template.isActive);
      
      return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });
  };

  // Service CRUD Handlers
  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      price: 0,
      unit: '',
      category: '',
      isActive: true,
      defaultTax: 15
    });
  };

  const handleSaveService = async () => {
    try {
      if (!serviceForm.name || !serviceForm.description || serviceForm.price <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields with valid values.",
          variant: "destructive"
        });
        return;
      }

      const serviceData: Service = {
        id: editingService?.id || `service_${Date.now()}`,
        name: serviceForm.name,
        description: serviceForm.description,
        price: serviceForm.price,
        unit: serviceForm.unit,
        category: serviceForm.category,
        isActive: serviceForm.isActive,
        defaultTax: serviceForm.defaultTax,
        usage: editingService?.usage || 0,
        analytics: editingService?.analytics || {
          totalRevenue: 0,
          totalUsage: 0,
          averagePrice: serviceForm.price,
          monthlyGrowth: 0,
          lastUsed: new Date()
        },
        createdAt: editingService?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (editingService) {
        setServices(prev => prev.map(service => 
          service.id === editingService.id ? serviceData : service
        ));
        toast({
          title: "Service Updated",
          description: `${serviceData.name} has been updated successfully.`,
        });
      } else {
        setServices(prev => [...prev, serviceData]);
        toast({
          title: "Service Created",
          description: `${serviceData.name} has been created successfully.`,
        });
      }

      setShowServiceDialog(false);
      setShowServiceEditDialog(false);
      setEditingService(null);
      resetServiceForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price,
      unit: service.unit,
      category: service.category,
      isActive: service.isActive,
      defaultTax: service.defaultTax
    });
    setShowServiceEditDialog(true);
  };

  const handleDuplicateService = (service: Service) => {
    setEditingService(null);
    setServiceForm({
      name: `${service.name} (Copy)`,
      description: service.description,
      price: service.price,
      unit: service.unit,
      category: service.category,
      isActive: service.isActive,
      defaultTax: service.defaultTax
    });
    setShowServiceEditDialog(true);
  };

  const handleDeleteService = (service: Service) => {
    setSelectedService(service);
    setShowServiceDeleteDialog(true);
  };

  const handleConfirmDeleteService = async () => {
    if (!selectedService) return;

    try {
      setServices(prev => prev.filter(service => service.id !== selectedService.id));
      
      toast({
        title: "Service Deleted",
        description: `${selectedService.name} has been deleted successfully.`,
      });
      
      setShowServiceDeleteDialog(false);
      setSelectedService(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewServiceAnalytics = (service: Service) => {
    setSelectedService(service);
    setShowServiceAnalyticsDialog(true);
  };

  const handleToggleService = async (serviceId: string) => {
    try {
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: !service.isActive, updatedAt: new Date() }
          : service
      ));
      
      const service = services.find(s => s.id === serviceId);
      toast({
        title: "Service Updated",
        description: `${service?.name} has been ${service?.isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service status. Please try again.",
        variant: "destructive"
      });
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
          <Button variant="outline" onClick={handleViewSystemStatus}>
            <Activity size={16} className="mr-2" />
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
                        <Switch 
                          checked={gateway.isActive} 
                          onCheckedChange={() => handleToggleGateway(gateway.id)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleConfigureGateway(gateway)}>
                              <Edit size={14} className="mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGatewayApiKeys(gateway)}>
                              <Key size={14} className="mr-2" />
                              API Keys
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGatewayAnalytics(gateway)}>
                              <BarChart3 size={14} className="mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTestGateway(gateway)}>
                              <TestTube size={14} className="mr-2" />
                              Test Connection
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleRemoveGateway(gateway)}
                            >
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
                            <DropdownMenuItem onClick={() => handleSyncBankAccount(account)}>
                              <RefreshCw size={14} className="mr-2" />
                              Sync Now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewBankTransactions(account)}>
                              <Eye size={14} className="mr-2" />
                              View Transactions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleConfigureBankAccount(account)}>
                              <Edit size={14} className="mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleRemoveBankAccount(account)}
                            >
                              <Trash2 size={14} className="mr-2" />
                              Remove
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditBankDetails(account)}>
                              <Edit size={14} className="mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleDisconnectBankAccount(account)}
                            >
                              <Link size={14} className="mr-2" />
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
                Add Integration
              </Button>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search integrations..."
                    value={integrationSearchTerm}
                    onChange={(e) => setIntegrationSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={integrationFilterCategory} onValueChange={setIntegrationFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="Document Management">Document Management</SelectItem>
                    <SelectItem value="Accounting">Accounting</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={integrationFilterStatus} onValueChange={setIntegrationFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getFilteredIntegrations().map((integration) => (
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
                        <Switch 
                          checked={integration.isActive} 
                          onCheckedChange={() => handleToggleIntegration(integration.id)}
                          disabled={!integration.isConnected}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleViewIntegrationDetails(integration)}>
                              <Eye size={14} className="mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {integration.isConnected && (
                              <>
                                <DropdownMenuItem onClick={() => handleSyncIntegration(integration)}>
                                  <RefreshCw size={14} className="mr-2" />
                                  Sync Now
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleConfigureIntegration(integration)}>
                                  <Settings size={14} className="mr-2" />
                                  Configure
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewIntegrationUsage(integration)}>
                                  <BarChart3 size={14} className="mr-2" />
                                  View Usage
                                </DropdownMenuItem>
                              </>
                            )}
                            {!integration.isConnected && (
                              <DropdownMenuItem onClick={() => handleConnectIntegration(integration)}>
                                <Link size={14} className="mr-2" />
                                Connect
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {integration.isConnected && (
                              <DropdownMenuItem 
                                className="text-orange-600" 
                                onClick={() => handleDisconnectIntegration(integration)}
                              >
                                <Link size={14} className="mr-2" />
                                Disconnect
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600" 
                              onClick={() => handleRemoveIntegration(integration)}
                            >
                              <Trash2 size={14} className="mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Plan & Pricing</Label>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {integration.plan} - {integration.price}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Provider</Label>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {integration.provider}
                          </p>
                        </div>
                      </div>

                        {integration.lastSync && (
                        <div>
                            <Label className="text-xs text-gray-500">Last Sync</Label>
                            <p className="text-xs text-gray-500">
                            {integration.lastSync.toLocaleString()}
                            </p>
                          </div>
                        )}

                      {integration.usage && integration.isConnected && (
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <Label className="text-xs text-gray-500">Success Rate</Label>
                            <p className={`text-sm font-medium ${integration.usage.successRate > 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {integration.usage.successRate.toFixed(1)}%
                            </p>
                      </div>
                          <div>
                            <Label className="text-xs text-gray-500">Monthly Usage</Label>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {integration.usage.monthlyUsage.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant={integration.isConnected ? 'outline' : 'default'}
                        onClick={() => integration.isConnected ? handleConfigureIntegration(integration) : handleConnectIntegration(integration)}
                      >
                        {integration.isConnected ? 'Configure' : 'Connect'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleViewIntegrationDetails(integration)}>
                        <ExternalLink size={14} className="mr-1" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {getFilteredIntegrations().length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  No integrations found
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {integrationSearchTerm || integrationFilterCategory !== 'all' || integrationFilterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Add your first integration to get started'
                  }
                </p>
              </div>
            )}
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

            {/* Search and Filter Controls */}
            <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search templates by name, subject, or type..."
                        value={templateSearchTerm}
                        onChange={(e) => setTemplateSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={templateFilterType} onValueChange={setTemplateFilterType}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="case">Case</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={templateFilterCategory} onValueChange={setTemplateFilterCategory}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={templateFilterStatus} onValueChange={setTemplateFilterStatus}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates List */}
            <div className="grid gap-4">
              {getFilteredTemplates().length === 0 ? (
                <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardContent className="p-8 text-center">
                    <Mail size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      No templates found
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
                      {templateSearchTerm || templateFilterType !== 'all' || templateFilterCategory !== 'all' || templateFilterStatus !== 'all' 
                        ? 'No templates match your current filters.' 
                        : 'Get started by creating your first email template.'}
                    </p>
                    <Button onClick={() => setShowTemplateDialog(true)}>
                      <Plus size={16} className="mr-2" />
                      Create Template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                getFilteredTemplates().map((template) => (
                  <Card key={template.id} className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            template.category === 'transactional' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            template.category === 'marketing' ? 'bg-purple-100 dark:bg-purple-900/30' :
                            template.category === 'system' ? 'bg-green-100 dark:bg-green-900/30' :
                            'bg-orange-100 dark:bg-orange-900/30'
                          }`}>
                            <Mail size={24} className={`${
                              template.category === 'transactional' ? 'text-blue-600' :
                              template.category === 'marketing' ? 'text-purple-600' :
                              template.category === 'system' ? 'text-green-600' :
                              'text-orange-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {template.name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {template.subject}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(template.isActive ? 'active' : 'inactive')}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Switch 
                            checked={template.isActive} 
                            onCheckedChange={() => handleToggleTemplate(template.id)}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleViewTemplateDetails(template)}>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                                <FileText size={14} className="mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                <Edit size={14} className="mr-2" />
                                Edit Template
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                                <Copy size={14} className="mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTestSendTemplate(template)}>
                                <Send size={14} className="mr-2" />
                                Test Send
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleScheduleTemplate(template)}>
                                <Calendar size={14} className="mr-2" />
                                Schedule
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewTemplateAnalytics(template)}>
                                <BarChart3 size={14} className="mr-2" />
                                Analytics
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => handleDeleteTemplate(template)}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <Label className="text-xs text-gray-500">Type</Label>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Badge variant="outline">{template.type}</Badge>
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Category</Label>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Badge variant="outline">{template.category}</Badge>
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Usage</Label>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {template.usage} times
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Last Used</Label>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {template.lastUsed.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Priority</Label>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <Badge className={getPriorityColor(template.settings?.priority || 'normal')}>
                              {template.settings?.priority || 'Normal'}
                            </Badge>
                          </p>
                        </div>
                      </div>

                      {template.analytics && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <Label className="text-xs text-gray-500">Total Sent</Label>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {template.analytics.totalSent.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Open Rate</Label>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {template.analytics.openRate.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Click Rate</Label>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {template.analytics.clickRate.toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Bounce Rate</Label>
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {template.analytics.bounceRate.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}

                      {template.settings?.schedule?.enabled && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-blue-600" />
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              Scheduled: {template.settings.schedule.frequency}
                              {template.settings.schedule.time && ` at ${template.settings.schedule.time}`}
                            </span>
                          </div>
                        </div>
                      )}
              </CardContent>
            </Card>
                ))
              )}
            </div>
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
                              <DropdownMenuItem onClick={() => handleEditService(service)}>
                                <Edit size={14} className="mr-2" />
                                Edit Service
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateService(service)}>
                                <Copy size={14} className="mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewServiceAnalytics(service)}>
                                <BarChart3 size={14} className="mr-2" />
                                Usage Analytics
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteService(service)} className="text-red-600">
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
              <Button onClick={() => {
                setEditingTicket(null);
                setTicketForm({
                  title: '',
                  description: '',
                  priority: 'medium',
                  status: 'open',
                  category: '',
                  assignee: '',
                });
                setShowTicketEditDialog(true);
              }}>
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
                              <DropdownMenuItem onClick={() => {
                                setSelectedTicket(ticket);
                                setShowTicketDetailsDialog(true);
                              }}>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingTicket(ticket);
                                setTicketForm({
                                  title: ticket.title,
                                  description: ticket.description,
                                  priority: ticket.priority,
                                  status: ticket.status,
                                  category: ticket.category,
                                  assignee: ticket.assignee,
                                });
                                setShowTicketEditDialog(true);
                              }}>
                                <Edit size={14} className="mr-2" />
                                Edit Ticket
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingTicket(null);
                                setTicketForm({
                                  title: `${ticket.title} (Copy)`,
                                  description: ticket.description,
                                  priority: ticket.priority,
                                  status: 'open',
                                  category: ticket.category,
                                  assignee: ticket.assignee,
                                });
                                setShowTicketEditDialog(true);
                              }}>
                                <Copy size={14} className="mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTicket(ticket);
                                setShowTicketAnalyticsDialog(true);
                              }}>
                                <BarChart3 size={14} className="mr-2" />
                                Analytics
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedTicket(ticket);
                                setShowTicketDeleteDialog(true);
                              }} className="text-red-600">
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
        </Tabs>
      </div>

      {/* System Status Dialog */}
      <Dialog open={showSystemStatusDialog} onOpenChange={setShowSystemStatusDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity size={20} />
              System Status Dashboard
            </DialogTitle>
            <DialogDescription>
              Monitor system health and performance metrics
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  systemStatus.overall === 'healthy' ? 'bg-green-500' :
                  systemStatus.overall === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-lg font-semibold">
                  System Status: {systemStatus.overall.charAt(0).toUpperCase() + systemStatus.overall.slice(1)}
                </span>
              </div>
              <Button onClick={handleSystemStatusRefresh} variant="outline" size="sm">
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={16} className="text-blue-500" />
                    <span className="font-medium">Database</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <Badge className={getStatusColor(systemStatus.database.status)}>
                        {systemStatus.database.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Response Time</span>
                      <span className="text-sm">{systemStatus.database.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Connections</span>
                      <span className="text-sm">{systemStatus.database.connections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Uptime</span>
                      <span className="text-sm">{systemStatus.database.uptime}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Server size={16} className="text-green-500" />
                    <span className="font-medium">API</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <Badge className={getStatusColor(systemStatus.api.status)}>
                        {systemStatus.api.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Response Time</span>
                      <span className="text-sm">{systemStatus.api.responseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Requests/min</span>
                      <span className="text-sm">{systemStatus.api.requestsPerMinute}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Error Rate</span>
                      <span className="text-sm">{systemStatus.api.errorRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive size={16} className="text-purple-500" />
                    <span className="font-medium">Storage</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Used</span>
                      <span className="text-sm">{systemStatus.storage.used}GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-sm">{systemStatus.storage.total}GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Usage</span>
                      <span className="text-sm">{systemStatus.storage.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${systemStatus.storage.percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MemoryStick size={16} className="text-orange-500" />
                    <span className="font-medium">Memory</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Used</span>
                      <span className="text-sm">{systemStatus.memory.used}GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total</span>
                      <span className="text-sm">{systemStatus.memory.total}GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Usage</span>
                      <span className="text-sm">{systemStatus.memory.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${systemStatus.memory.percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services Status */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Services</h3>
              <div className="space-y-2">
                {systemStatus.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'running' ? 'bg-green-500' :
                        service.status === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        Uptime: {service.uptime}%
                      </span>
                      <span className="text-sm text-gray-500">
                        Last Check: {service.lastCheck.toLocaleTimeString()}
                      </span>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              Last updated: {systemStatus.lastUpdated.toLocaleString()}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Configuration Dialog */}
      <Dialog open={showGatewayConfigDialog} onOpenChange={setShowGatewayConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Payment Gateway</DialogTitle>
            <DialogDescription>
              Set up and configure your payment gateway settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gateway-name">Gateway Name</Label>
                <Input
                  id="gateway-name"
                  value={gatewayForm.name}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Stripe Production"
                />
              </div>
              <div>
                <Label htmlFor="gateway-type">Gateway Type</Label>
                <Select value={gatewayForm.type} onValueChange={(value) => setGatewayForm(prev => ({ ...prev, type: value as PaymentGateway['type'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gateway type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="payfast">PayFast</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="public-key">Public Key</Label>
                <Input
                  id="public-key"
                  value={gatewayForm.publicKey}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, publicKey: e.target.value }))}
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <Label htmlFor="secret-key">Secret Key</Label>
                <Input
                  id="secret-key"
                  type="password"
                  value={gatewayForm.secretKey}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, secretKey: e.target.value }))}
                  placeholder="sk_test_..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                value={gatewayForm.webhookUrl}
                onChange={(e) => setGatewayForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://yourdomain.com/webhook"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fees">Transaction Fees</Label>
                <Input
                  id="fees"
                  value={gatewayForm.fees}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, fees: e.target.value }))}
                  placeholder="2.9% + R2.50"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={gatewayForm.currency} onValueChange={(value) => setGatewayForm(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZAR">ZAR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="test-mode" 
                checked={gatewayForm.testMode}
                onCheckedChange={(checked) => setGatewayForm(prev => ({ ...prev, testMode: checked as boolean }))}
              />
              <Label htmlFor="test-mode">Enable Test Mode</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowGatewayConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGateway}>
                <Save size={16} className="mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Gateway API Keys Dialog */}
      <Dialog open={showGatewayApiKeysDialog} onOpenChange={setShowGatewayApiKeysDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Keys - {selectedGateway?.name}</DialogTitle>
            <DialogDescription>
              Manage API keys and authentication credentials
            </DialogDescription>
          </DialogHeader>
          
          {selectedGateway && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="font-medium text-yellow-800">Security Notice</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Keep your API keys secure. Never share them publicly or commit them to version control.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Public Key (Publishable)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={selectedGateway.publicKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm">
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Secret Key (Private)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={selectedGateway.secretKey}
                      type="password"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm">
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Webhook URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={selectedGateway.webhookUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm">
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowGatewayApiKeysDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => handleConfigureGateway(selectedGateway)}>
                  <Edit size={16} className="mr-2" />
                  Edit Keys
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Analytics Dialog */}
      <Dialog open={showGatewayAnalyticsDialog} onOpenChange={setShowGatewayAnalyticsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Analytics - {selectedGateway?.name}</DialogTitle>
            <DialogDescription>
              View transaction analytics and performance metrics
            </DialogDescription>
          </DialogHeader>
          
          {selectedGateway?.analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt size={16} className="text-blue-500" />
                      <span className="font-medium">Total Transactions</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedGateway.analytics.totalTransactions.toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className="text-green-500" />
                      <span className="font-medium">Success Rate</span>
                    </div>
                    <p className="text-2xl font-bold">{selectedGateway.analytics.successRate}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={16} className="text-purple-500" />
                      <span className="font-medium">Average Amount</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(selectedGateway.analytics.averageAmount)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 size={16} className="text-orange-500" />
                      <span className="font-medium">Monthly Volume</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(selectedGateway.analytics.monthlyVolume)}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Last Transaction</span>
                    <span className="text-sm text-gray-500">
                      {selectedGateway.analytics.lastTransaction.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Gateway Status</span>
                    <Badge className={getStatusColor(selectedGateway.isActive ? 'active' : 'inactive')}>
                      {selectedGateway.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Connection Status</span>
                    <Badge className={getStatusColor(selectedGateway.isConnected ? 'connected' : 'disconnected')}>
                      {selectedGateway.isConnected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowGatewayAnalyticsDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => handleTestGateway(selectedGateway)}>
                  <TestTube size={16} className="mr-2" />
                  Test Gateway
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Gateway Remove Confirmation Dialog */}
      <Dialog open={showGatewayRemoveDialog} onOpenChange={setShowGatewayRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Payment Gateway</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this payment gateway?
            </DialogDescription>
          </DialogHeader>
          
          {selectedGateway && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  Removing <strong>{selectedGateway.name}</strong> will permanently delete all configuration data. 
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowGatewayRemoveDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmRemoveGateway}>
                  <Trash2 size={16} className="mr-2" />
                  Remove Gateway
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Payment Gateway Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Payment Gateway</DialogTitle>
            <DialogDescription>
              Add a new payment gateway to accept payments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-gateway-name">Gateway Name</Label>
                <Input
                  id="new-gateway-name"
                  value={gatewayForm.name}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Stripe Production"
                />
              </div>
              <div>
                <Label htmlFor="new-gateway-type">Gateway Type</Label>
                <Select value={gatewayForm.type} onValueChange={(value) => setGatewayForm(prev => ({ ...prev, type: value as PaymentGateway['type'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gateway type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="payfast">PayFast</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-public-key">Public Key</Label>
                <Input
                  id="new-public-key"
                  value={gatewayForm.publicKey}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, publicKey: e.target.value }))}
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <Label htmlFor="new-secret-key">Secret Key</Label>
                <Input
                  id="new-secret-key"
                  type="password"
                  value={gatewayForm.secretKey}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, secretKey: e.target.value }))}
                  placeholder="sk_test_..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-webhook-url">Webhook URL</Label>
              <Input
                id="new-webhook-url"
                value={gatewayForm.webhookUrl}
                onChange={(e) => setGatewayForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                placeholder="https://yourdomain.com/webhook"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-fees">Transaction Fees</Label>
                <Input
                  id="new-fees"
                  value={gatewayForm.fees}
                  onChange={(e) => setGatewayForm(prev => ({ ...prev, fees: e.target.value }))}
                  placeholder="2.9% + R2.50"
                />
              </div>
              <div>
                <Label htmlFor="new-currency">Currency</Label>
                <Select value={gatewayForm.currency} onValueChange={(value) => setGatewayForm(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ZAR">ZAR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="new-test-mode" 
                checked={gatewayForm.testMode}
                onCheckedChange={(checked) => setGatewayForm(prev => ({ ...prev, testMode: checked as boolean }))}
              />
              <Label htmlFor="new-test-mode">Enable Test Mode</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGateway}>
                <Plus size={16} className="mr-2" />
                Add Gateway
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Account Configuration Dialog */}
      <Dialog open={showBankConfigDialog} onOpenChange={setShowBankConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Bank Account</DialogTitle>
            <DialogDescription>
              Set up bank account connection and sync settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input
                  id="bank-name"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., First National Bank"
                />
              </div>
              <div>
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="e.g., Law Firm Trust Account"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account-number">Account Number</Label>
                <Input
                  id="account-number"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="••••••••••1234"
                />
              </div>
              <div>
                <Label htmlFor="branch-code">Branch Code</Label>
                <Input
                  id="branch-code"
                  value={bankForm.branchCode}
                  onChange={(e) => setBankForm(prev => ({ ...prev, branchCode: e.target.value }))}
                  placeholder="250655"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="account-type">Account Type</Label>
              <Select value={bankForm.accountType} onValueChange={(value) => setBankForm(prev => ({ ...prev, accountType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business Cheque">Business Cheque</SelectItem>
                  <SelectItem value="Business Current">Business Current</SelectItem>
                  <SelectItem value="Business Savings">Business Savings</SelectItem>
                  <SelectItem value="Trust Account">Trust Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">API Credentials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input
                    id="client-id"
                    value={bankForm.clientId}
                    onChange={(e) => setBankForm(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="Your bank API client ID"
                  />
                </div>
                <div>
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <Input
                    id="client-secret"
                    type="password"
                    value={bankForm.clientSecret}
                    onChange={(e) => setBankForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                    placeholder="Your bank API client secret"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Sync Settings</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-sync" 
                  checked={bankForm.autoSync}
                  onCheckedChange={(checked) => setBankForm(prev => ({ ...prev, autoSync: checked as boolean }))}
                />
                <Label htmlFor="auto-sync">Enable Automatic Sync</Label>
              </div>
              <div>
                <Label htmlFor="sync-frequency">Sync Frequency</Label>
                <Select value={bankForm.syncFrequency} onValueChange={(value) => setBankForm(prev => ({ ...prev, syncFrequency: value as BankAccount['syncSettings']['syncFrequency'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sync frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBankConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBankAccount}>
                <Save size={16} className="mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect Bank Account</DialogTitle>
            <DialogDescription>
              Add a new bank account for automated reconciliation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-bank-name">Bank Name</Label>
                <Input
                  id="new-bank-name"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., First National Bank"
                />
              </div>
              <div>
                <Label htmlFor="new-account-name">Account Name</Label>
                <Input
                  id="new-account-name"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="e.g., Law Firm Trust Account"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-account-number">Account Number</Label>
                <Input
                  id="new-account-number"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="••••••••••1234"
                />
              </div>
              <div>
                <Label htmlFor="new-branch-code">Branch Code</Label>
                <Input
                  id="new-branch-code"
                  value={bankForm.branchCode}
                  onChange={(e) => setBankForm(prev => ({ ...prev, branchCode: e.target.value }))}
                  placeholder="250655"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-account-type">Account Type</Label>
              <Select value={bankForm.accountType} onValueChange={(value) => setBankForm(prev => ({ ...prev, accountType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business Cheque">Business Cheque</SelectItem>
                  <SelectItem value="Business Current">Business Current</SelectItem>
                  <SelectItem value="Business Savings">Business Savings</SelectItem>
                  <SelectItem value="Trust Account">Trust Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">API Credentials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-client-id">Client ID</Label>
                  <Input
                    id="new-client-id"
                    value={bankForm.clientId}
                    onChange={(e) => setBankForm(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="Your bank API client ID"
                  />
                </div>
                <div>
                  <Label htmlFor="new-client-secret">Client Secret</Label>
                  <Input
                    id="new-client-secret"
                    type="password"
                    value={bankForm.clientSecret}
                    onChange={(e) => setBankForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                    placeholder="Your bank API client secret"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Sync Settings</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="new-auto-sync" 
                  checked={bankForm.autoSync}
                  onCheckedChange={(checked) => setBankForm(prev => ({ ...prev, autoSync: checked as boolean }))}
                />
                <Label htmlFor="new-auto-sync">Enable Automatic Sync</Label>
              </div>
              <div>
                <Label htmlFor="new-sync-frequency">Sync Frequency</Label>
                <Select value={bankForm.syncFrequency} onValueChange={(value) => setBankForm(prev => ({ ...prev, syncFrequency: value as BankAccount['syncSettings']['syncFrequency'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sync frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBankDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBankAccount}>
                <Plus size={16} className="mr-2" />
                Connect Bank Account
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Account Remove Confirmation Dialog */}
      <Dialog open={showBankRemoveDialog} onOpenChange={setShowBankRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Bank Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this bank account connection?
            </DialogDescription>
          </DialogHeader>
          
          {selectedBankAccount && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  Removing <strong>{selectedBankAccount.bankName}</strong> will permanently delete all sync settings and connection data. 
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBankRemoveDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmRemoveBankAccount}>
                  <Trash2 size={16} className="mr-2" />
                  Remove Bank Account
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bank Account Edit Details Dialog */}
      <Dialog open={showBankEditDialog} onOpenChange={setShowBankEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bank Account Details</DialogTitle>
            <DialogDescription>
              Update the details for this bank account connection
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-bank-name">Bank Name</Label>
                <Input
                  id="edit-bank-name"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., First National Bank"
                />
              </div>
              <div>
                <Label htmlFor="edit-account-name">Account Name</Label>
                <Input
                  id="edit-account-name"
                  value={bankForm.accountName}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="e.g., Law Firm Trust Account"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-account-number">Account Number</Label>
                <Input
                  id="edit-account-number"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="••••••••••1234"
                />
              </div>
              <div>
                <Label htmlFor="edit-branch-code">Branch Code</Label>
                <Input
                  id="edit-branch-code"
                  value={bankForm.branchCode}
                  onChange={(e) => setBankForm(prev => ({ ...prev, branchCode: e.target.value }))}
                  placeholder="250655"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-account-type">Account Type</Label>
              <Select value={bankForm.accountType} onValueChange={(value) => setBankForm(prev => ({ ...prev, accountType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Business Cheque">Business Cheque</SelectItem>
                  <SelectItem value="Business Current">Business Current</SelectItem>
                  <SelectItem value="Business Savings">Business Savings</SelectItem>
                  <SelectItem value="Trust Account">Trust Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">API Credentials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-client-id">Client ID</Label>
                  <Input
                    id="edit-client-id"
                    value={bankForm.clientId}
                    onChange={(e) => setBankForm(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="Your bank API client ID"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-client-secret">Client Secret</Label>
                  <Input
                    id="edit-client-secret"
                    type="password"
                    value={bankForm.clientSecret}
                    onChange={(e) => setBankForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                    placeholder="Your bank API client secret"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Sync Settings</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-auto-sync" 
                  checked={bankForm.autoSync}
                  onCheckedChange={(checked) => setBankForm(prev => ({ ...prev, autoSync: checked as boolean }))}
                />
                <Label htmlFor="edit-auto-sync">Enable Automatic Sync</Label>
              </div>
              <div>
                <Label htmlFor="edit-sync-frequency">Sync Frequency</Label>
                <Select value={bankForm.syncFrequency} onValueChange={(value) => setBankForm(prev => ({ ...prev, syncFrequency: value as BankAccount['syncSettings']['syncFrequency'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sync frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBankEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBankDetails}>
                <Save size={16} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Account Disconnect Confirmation Dialog */}
      <Dialog open={showBankDisconnectDialog} onOpenChange={setShowBankDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Bank Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this bank account?
            </DialogDescription>
          </DialogHeader>
          
          {selectedBankAccount && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-orange-600" />
                  <span className="font-medium text-orange-800">Disconnect Account</span>
                </div>
                <p className="text-sm text-orange-700">
                  Disconnecting <strong>{selectedBankAccount.bankName}</strong> will stop automatic syncing and disable API access. 
                  You can reconnect later by updating the API credentials.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBankDisconnectDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmDisconnectBankAccount}>
                  <Link size={16} className="mr-2" />
                  Disconnect Account
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bank Transactions Dialog */}
      <Dialog open={showBankTransactionsDialog} onOpenChange={setShowBankTransactionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bank Transactions</DialogTitle>
            <DialogDescription>
              {selectedBankAccount && `Recent transactions for ${selectedBankAccount.bankName}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedBankAccount && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Account</Label>
                    <p className="font-medium">{selectedBankAccount.accountName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Account Number</Label>
                    <p className="font-mono text-sm">{selectedBankAccount.accountNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Current Balance</Label>
                    <p className="font-bold text-green-600">{formatCurrency(selectedBankAccount.balance)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Last Sync</Label>
                    <p className="text-sm">{selectedBankAccount.lastSync?.toLocaleString() || 'Never'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bankTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.reference}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                          {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {bankTransactions.length} recent transactions
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download size={14} className="mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => selectedBankAccount && handleSyncBankAccount(selectedBankAccount)}>
                  <RefreshCw size={14} className="mr-2" />
                  Sync Now
                </Button>
              </div>
            </div>
                     </div>
         </DialogContent>
       </Dialog>

      {/* Integration Add/Edit Dialog */}
      <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIntegration ? 'Edit Integration' : 'Add New Integration'}</DialogTitle>
            <DialogDescription>
              {editingIntegration ? 'Update the integration details' : 'Add a new third-party integration to enhance your workflow'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="integration-name">Integration Name *</Label>
                <Input
                  id="integration-name"
                  value={integrationForm.name}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Microsoft 365"
                />
              </div>
              <div>
                <Label htmlFor="integration-category">Category *</Label>
                <Select value={integrationForm.category} onValueChange={(value) => setIntegrationForm(prev => ({ ...prev, category: value as Integration['category'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                    <SelectItem value="Document Management">Document Management</SelectItem>
                    <SelectItem value="Accounting">Accounting</SelectItem>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="CRM">CRM</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Analytics">Analytics</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="integration-description">Description</Label>
              <Textarea
                id="integration-description"
                value={integrationForm.description}
                onChange={(e) => setIntegrationForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this integration does..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="integration-icon">Icon (Emoji)</Label>
                <Input
                  id="integration-icon"
                  value={integrationForm.icon}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="📧"
                />
              </div>
              <div>
                <Label htmlFor="integration-provider">Provider</Label>
                <Input
                  id="integration-provider"
                  value={integrationForm.provider}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, provider: e.target.value }))}
                  placeholder="e.g., Microsoft Corporation"
                />
              </div>
              <div>
                <Label htmlFor="integration-version">Version</Label>
                <Input
                  id="integration-version"
                  value={integrationForm.version}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="e.g., 2024.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="integration-plan">Plan</Label>
                <Input
                  id="integration-plan"
                  value={integrationForm.plan}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, plan: e.target.value }))}
                  placeholder="e.g., Business Premium"
                />
              </div>
              <div>
                <Label htmlFor="integration-price">Price</Label>
                <Input
                  id="integration-price"
                  value={integrationForm.price}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g., R189/month"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="integration-features">Features (comma-separated)</Label>
              <Input
                id="integration-features"
                value={integrationForm.features.join(', ')}
                onChange={(e) => setIntegrationForm(prev => ({ ...prev, features: e.target.value.split(',').map(f => f.trim()).filter(f => f) }))}
                placeholder="e.g., Email, Calendar, OneDrive, Teams"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">API Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="integration-client-id">Client ID</Label>
                  <Input
                    id="integration-client-id"
                    value={integrationForm.clientId}
                    onChange={(e) => setIntegrationForm(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="Your API client ID"
                  />
                </div>
                <div>
                  <Label htmlFor="integration-client-secret">Client Secret</Label>
                  <Input
                    id="integration-client-secret"
                    type="password"
                    value={integrationForm.clientSecret}
                    onChange={(e) => setIntegrationForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                    placeholder="Your API client secret"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="integration-webhook">Webhook URL</Label>
                <Input
                  id="integration-webhook"
                  value={integrationForm.webhookUrl}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://yourdomain.com/webhooks/integration"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Sync Settings</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="integration-auto-sync" 
                  checked={integrationForm.autoSync}
                  onCheckedChange={(checked) => setIntegrationForm(prev => ({ ...prev, autoSync: checked as boolean }))}
                />
                <Label htmlFor="integration-auto-sync">Enable Automatic Sync</Label>
              </div>
              <div>
                <Label htmlFor="integration-sync-frequency">Sync Frequency</Label>
                <Select value={integrationForm.syncFrequency} onValueChange={(value) => setIntegrationForm(prev => ({ ...prev, syncFrequency: value as Integration['syncSettings']['syncFrequency'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sync frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveIntegration}>
                <Save size={16} className="mr-2" />
                {editingIntegration ? 'Update Integration' : 'Add Integration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Integration Configuration Dialog */}
      <Dialog open={showIntegrationConfigDialog} onOpenChange={setShowIntegrationConfigDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Update API credentials and sync settings for this integration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">API Credentials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="config-client-id">Client ID</Label>
                  <Input
                    id="config-client-id"
                    value={integrationForm.clientId}
                    onChange={(e) => setIntegrationForm(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="Your API client ID"
                  />
                </div>
                <div>
                  <Label htmlFor="config-client-secret">Client Secret</Label>
                  <Input
                    id="config-client-secret"
                    type="password"
                    value={integrationForm.clientSecret}
                    onChange={(e) => setIntegrationForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                    placeholder="Your API client secret"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="config-webhook">Webhook URL</Label>
                <Input
                  id="config-webhook"
                  value={integrationForm.webhookUrl}
                  onChange={(e) => setIntegrationForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://yourdomain.com/webhooks/integration"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Sync Settings</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="config-auto-sync" 
                  checked={integrationForm.autoSync}
                  onCheckedChange={(checked) => setIntegrationForm(prev => ({ ...prev, autoSync: checked as boolean }))}
                />
                <Label htmlFor="config-auto-sync">Enable Automatic Sync</Label>
              </div>
              <div>
                <Label htmlFor="config-sync-frequency">Sync Frequency</Label>
                <Select value={integrationForm.syncFrequency} onValueChange={(value) => setIntegrationForm(prev => ({ ...prev, syncFrequency: value as Integration['syncSettings']['syncFrequency'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sync frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowIntegrationConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveIntegration}>
                <Save size={16} className="mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Integration Details Dialog */}
      <Dialog open={showIntegrationDetailsDialog} onOpenChange={setShowIntegrationDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Integration Details</DialogTitle>
            <DialogDescription>
              {selectedIntegration && `Complete information for ${selectedIntegration.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl">{selectedIntegration.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedIntegration.name}</h3>
                    <p className="text-gray-600">{selectedIntegration.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Category</Label>
                    <p className="font-medium">{selectedIntegration.category}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Provider</Label>
                    <p className="font-medium">{selectedIntegration.provider}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Version</Label>
                    <p className="font-medium">{selectedIntegration.version}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Plan</Label>
                    <p className="font-medium">{selectedIntegration.plan} - {selectedIntegration.price}</p>
                  </div>
                </div>
              </div>

              {/* Connection Status */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Connection Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Connected:</span>
                      <Badge className={getStatusColor(selectedIntegration.isConnected ? 'connected' : 'disconnected')}>
                        {selectedIntegration.isConnected ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <Badge className={getStatusColor(selectedIntegration.isActive ? 'active' : 'inactive')}>
                        {selectedIntegration.isActive ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sync:</span>
                      <span className="text-sm text-gray-600">
                        {selectedIntegration.lastSync ? selectedIntegration.lastSync.toLocaleString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sync Status:</span>
                      <Badge className={getStatusColor(selectedIntegration.syncSettings?.lastSyncStatus || 'pending')}>
                        {selectedIntegration.syncSettings?.lastSyncStatus || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Sync Settings</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Auto Sync:</span>
                      <span>{selectedIntegration.syncSettings?.autoSync ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frequency:</span>
                      <span className="capitalize">{selectedIntegration.syncSettings?.syncFrequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Webhook:</span>
                      <span className="text-sm text-gray-600">
                        {selectedIntegration.webhookUrl ? 'Configured' : 'Not configured'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium mb-3">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedIntegration.features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Usage Statistics */}
              {selectedIntegration.usage && selectedIntegration.isConnected && (
                <div>
                  <h4 className="font-medium mb-3">Usage Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Total Requests</Label>
                      <p className="text-lg font-semibold">{selectedIntegration.usage.totalRequests.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Success Rate</Label>
                      <p className={`text-lg font-semibold ${selectedIntegration.usage.successRate > 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedIntegration.usage.successRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Monthly Usage</Label>
                      <p className="text-lg font-semibold">{selectedIntegration.usage.monthlyUsage.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Label className="text-xs text-gray-500">Last Used</Label>
                      <p className="text-sm text-gray-600">{selectedIntegration.usage.lastUsed.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-xs text-gray-500">Created</Label>
                  <p className="text-sm">{selectedIntegration.createdAt.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Updated</Label>
                  <p className="text-sm">{selectedIntegration.updatedAt.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Integration Usage Dialog */}
      <Dialog open={showIntegrationUsageDialog} onOpenChange={setShowIntegrationUsageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Usage Analytics</DialogTitle>
            <DialogDescription>
              {selectedIntegration && `Detailed usage statistics for ${selectedIntegration.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration?.usage && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={20} className="text-blue-600" />
                    <h4 className="font-medium">Total Requests</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedIntegration.usage.totalRequests.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">All-time API calls</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={20} className="text-green-600" />
                    <h4 className="font-medium">Success Rate</h4>
                  </div>
                  <p className={`text-2xl font-bold ${selectedIntegration.usage.successRate > 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedIntegration.usage.successRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">API call success rate</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={20} className="text-purple-600" />
                    <h4 className="font-medium">Monthly Usage</h4>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedIntegration.usage.monthlyUsage.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Requests this month</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={20} className="text-orange-600" />
                    <h4 className="font-medium">Last Activity</h4>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    {selectedIntegration.usage.lastUsed.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Most recent API call</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Usage Insights</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Average daily requests:</span>
                    <span className="font-medium">
                      {Math.round(selectedIntegration.usage.monthlyUsage / 30).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed requests:</span>
                    <span className="font-medium text-red-600">
                      {Math.round(selectedIntegration.usage.totalRequests * (100 - selectedIntegration.usage.successRate) / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Integration health:</span>
                    <Badge className={getStatusColor(selectedIntegration.usage.successRate > 95 ? 'active' : 'inactive')}>
                      {selectedIntegration.usage.successRate > 95 ? 'Excellent' : selectedIntegration.usage.successRate > 90 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Integration Disconnect Dialog */}
      <Dialog open={showIntegrationDisconnectDialog} onOpenChange={setShowIntegrationDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this integration?
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-orange-600" />
                  <span className="font-medium text-orange-800">Disconnect Integration</span>
                </div>
                <p className="text-sm text-orange-700">
                  Disconnecting <strong>{selectedIntegration.name}</strong> will stop all automatic syncing and disable API access. 
                  You can reconnect later by updating the API credentials.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowIntegrationDisconnectDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmDisconnectIntegration}>
                  <Link size={16} className="mr-2" />
                  Disconnect Integration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Integration Remove Dialog */}
      <Dialog open={showIntegrationRemoveDialog} onOpenChange={setShowIntegrationRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently remove this integration?
            </DialogDescription>
          </DialogHeader>
          
          {selectedIntegration && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  Removing <strong>{selectedIntegration.name}</strong> will permanently delete all configuration data, 
                  API credentials, and usage history. This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowIntegrationRemoveDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmRemoveIntegration}>
                  <Trash2 size={16} className="mr-2" />
                  Remove Integration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Template Create/Edit Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Email Template' : 'Create New Email Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Update your email template settings and content.' : 'Create a new email template for automated messaging.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name *</Label>
                <Input
                  id="template-name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <Label htmlFor="template-subject">Email Subject *</Label>
                <Input
                  id="template-subject"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-type">Template Type</Label>
                <Select value={templateForm.type} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, type: value as EmailTemplate['type'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="case">Case</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select value={templateForm.category} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value as EmailTemplate['category'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sender Information */}
            <div>
              <Label className="text-base font-medium">Sender Information</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="sender-name">Sender Name</Label>
                  <Input
                    id="sender-name"
                    value={templateForm.senderName}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, senderName: e.target.value }))}
                    placeholder="Law Firm Name"
                  />
                </div>
                <div>
                  <Label htmlFor="sender-email">Sender Email</Label>
                  <Input
                    id="sender-email"
                    type="email"
                    value={templateForm.senderEmail}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, senderEmail: e.target.value }))}
                    placeholder="noreply@lawfirm.com"
                  />
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div>
              <Label htmlFor="template-body">Email Body *</Label>
              <Textarea
                id="template-body"
                value={templateForm.body}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Enter your email template content here..."
                rows={10}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-2">
                Use variables like {'{client_name}'}, {'{case_name}'}, {'{amount}'} to personalize emails.
              </p>
            </div>

            {/* Settings */}
            <div>
              <Label className="text-base font-medium">Email Settings</Label>
              <div className="space-y-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-send"
                    checked={templateForm.autoSend}
                    onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, autoSend: checked }))}
                  />
                  <Label htmlFor="auto-send">Enable automatic sending</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={templateForm.priority} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, priority: value as EmailTemplate['settings']['priority'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="schedule-frequency">Schedule Frequency</Label>
                    <Select value={templateForm.scheduleFrequency} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, scheduleFrequency: value as EmailTemplate['settings']['schedule']['frequency'] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {templateForm.scheduleFrequency !== 'immediate' && (
                  <div>
                    <Label htmlFor="schedule-time">Schedule Time</Label>
                    <Input
                      id="schedule-time"
                      type="time"
                      value={templateForm.scheduleTime}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, scheduleTime: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save size={16} className="mr-2" />
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Details Dialog */}
      <Dialog open={showTemplateDetailsDialog} onOpenChange={setShowTemplateDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template Details</DialogTitle>
            <DialogDescription>
              {selectedTemplate && `Complete information for ${selectedTemplate.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Template Name</Label>
                    <p className="font-medium">{selectedTemplate.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Subject</Label>
                    <p className="font-medium">{selectedTemplate.subject}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Type</Label>
                    <Badge variant="outline">{selectedTemplate.type}</Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Category</Label>
                    <Badge variant="outline">{selectedTemplate.category}</Badge>
                  </div>
                </div>
              </div>

              {/* Sender Information */}
              {selectedTemplate.sender && (
                <div>
                  <h4 className="font-medium mb-3">Sender Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Sender Name</Label>
                      <p>{selectedTemplate.sender.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Sender Email</Label>
                      <p>{selectedTemplate.sender.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Body */}
              <div>
                <h4 className="font-medium mb-3">Email Content</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{selectedTemplate.body}</pre>
                </div>
              </div>

              {/* Variables */}
              {selectedTemplate.variables.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Available Variables</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.variables.map((variable, index) => (
                      <Badge key={index} variant="secondary">
                        {'{' + variable + '}'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings */}
              {selectedTemplate.settings && (
                <div>
                  <h4 className="font-medium mb-3">Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Auto Send</Label>
                      <p>{selectedTemplate.settings.autoSend ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Priority</Label>
                      <Badge className={getPriorityColor(selectedTemplate.settings.priority)}>
                        {selectedTemplate.settings.priority}
                      </Badge>
                    </div>
                    {selectedTemplate.settings.schedule && (
                      <>
                        <div>
                          <Label className="text-xs text-gray-500">Schedule</Label>
                          <p>{selectedTemplate.settings.schedule.enabled ? 'Enabled' : 'Disabled'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Frequency</Label>
                          <p>{selectedTemplate.settings.schedule.frequency}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Usage Statistics */}
              <div>
                <h4 className="font-medium mb-3">Usage Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Total Usage</Label>
                    <p className="font-medium">{selectedTemplate.usage} times</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Last Used</Label>
                    <p>{selectedTemplate.lastUsed.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <Badge className={getStatusColor(selectedTemplate.isActive ? 'active' : 'inactive')}>
                      {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Created By</Label>
                    <p>{selectedTemplate.createdBy}</p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-xs text-gray-500">Created</Label>
                  <p className="text-sm">{selectedTemplate.createdAt.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Updated</Label>
                  <p className="text-sm">{selectedTemplate.updatedAt.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={showTemplatePreviewDialog} onOpenChange={setShowTemplatePreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              {selectedTemplate && `Preview of ${selectedTemplate.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="mb-4">
                  <Label className="text-xs text-gray-500">From</Label>
                  <p className="font-medium">
                    {selectedTemplate.sender?.name || 'Law Firm'} &lt;{selectedTemplate.sender?.email || 'noreply@lawfirm.com'}&gt;
                  </p>
                </div>
                <div className="mb-4">
                  <Label className="text-xs text-gray-500">Subject</Label>
                  <p className="font-medium">{selectedTemplate.subject}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Body</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded border">
                    <pre className="whitespace-pre-wrap text-sm">{selectedTemplate.body}</pre>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowTemplatePreviewDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => handleTestSendTemplate(selectedTemplate)}>
                  <Send size={16} className="mr-2" />
                  Test Send
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Test Send Dialog */}
      <Dialog open={showTemplateTestDialog} onOpenChange={setShowTemplateTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Send Email</DialogTitle>
            <DialogDescription>
              {selectedTemplate && `Send a test email using ${selectedTemplate.name}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="Enter email address to send test"
                defaultValue=""
              />
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-blue-600" />
                <span className="font-medium text-blue-800">Test Email</span>
              </div>
              <p className="text-sm text-blue-700">
                This will send a test email with sample data to verify the template formatting and delivery.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTemplateTestDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const email = (document.getElementById('test-email') as HTMLInputElement)?.value;
                if (email) handleConfirmTestSend(email);
              }}>
                <Send size={16} className="mr-2" />
                Send Test Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Analytics Dialog */}
      <Dialog open={showTemplateAnalyticsDialog} onOpenChange={setShowTemplateAnalyticsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template Analytics</DialogTitle>
            <DialogDescription>
              {selectedTemplate && `Detailed analytics for ${selectedTemplate.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate?.analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail size={20} className="text-blue-600" />
                    <h4 className="font-medium">Total Sent</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedTemplate.analytics.totalSent.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Emails delivered</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={20} className="text-green-600" />
                    <h4 className="font-medium">Open Rate</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedTemplate.analytics.openRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Recipients who opened</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointer size={20} className="text-purple-600" />
                    <h4 className="font-medium">Click Rate</h4>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedTemplate.analytics.clickRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Recipients who clicked</p>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} className="text-red-600" />
                    <h4 className="font-medium">Bounce Rate</h4>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {selectedTemplate.analytics.bounceRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Emails that bounced</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Performance Insights</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Successful deliveries:</span>
                    <span className="font-medium text-green-600">
                      {Math.round(selectedTemplate.analytics.totalSent * (100 - selectedTemplate.analytics.bounceRate) / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total opens:</span>
                    <span className="font-medium">
                      {Math.round(selectedTemplate.analytics.totalSent * selectedTemplate.analytics.openRate / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total clicks:</span>
                    <span className="font-medium">
                      {Math.round(selectedTemplate.analytics.totalSent * selectedTemplate.analytics.clickRate / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last sent:</span>
                    <span className="font-medium">
                      {selectedTemplate.analytics.lastSent.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Template Delete Dialog */}
      <Dialog open={showTemplateDeleteDialog} onOpenChange={setShowTemplateDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this email template?
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  Deleting <strong>{selectedTemplate.name}</strong> will permanently remove the template and all its settings. 
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowTemplateDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmDeleteTemplate}>
                  <Trash2 size={16} className="mr-2" />
                  Delete Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Edit Dialog */}
      <Dialog open={showServiceEditDialog} onOpenChange={setShowServiceEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Update service information' : 'Create a new service offering'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <Label htmlFor="service-category">Category</Label>
                <Input
                  id="service-category"
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="service-description">Description</Label>
              <Input
                id="service-description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this service"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="service-price">Price</Label>
                <Input
                  id="service-price"
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="service-unit">Unit</Label>
                <Input
                  id="service-unit"
                  value={serviceForm.unit}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="hour, document, etc."
                />
              </div>
              <div>
                <Label htmlFor="service-tax">Default Tax (%)</Label>
                <Input
                  id="service-tax"
                  type="number"
                  value={serviceForm.defaultTax}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, defaultTax: parseFloat(e.target.value) || 0 }))}
                  placeholder="15"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="service-active"
                checked={serviceForm.isActive}
                onChange={(e) => setServiceForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
                aria-label="Mark service as active"
              />
              <Label htmlFor="service-active">Active Service</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowServiceEditDialog(false);
                setEditingService(null);
                resetServiceForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveService}>
                {editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Analytics Dialog */}
      <Dialog open={showServiceAnalyticsDialog} onOpenChange={setShowServiceAnalyticsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Service Analytics</DialogTitle>
            <DialogDescription>
              {selectedService && `Usage analytics for ${selectedService.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedService?.analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={20} className="text-blue-600" />
                    <h4 className="font-medium">Total Revenue</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedService.analytics.totalRevenue)}
                  </p>
                  <p className="text-sm text-gray-600">Generated revenue</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={20} className="text-green-600" />
                    <h4 className="font-medium">Total Usage</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedService.analytics.totalUsage}
                  </p>
                  <p className="text-sm text-gray-600">Times used</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={20} className="text-purple-600" />
                    <h4 className="font-medium">Monthly Growth</h4>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedService.analytics.monthlyGrowth.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Growth rate</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator size={20} className="text-orange-600" />
                    <h4 className="font-medium">Average Price</h4>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(selectedService.analytics.averagePrice)}
                  </p>
                  <p className="text-sm text-gray-600">Per unit</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Service Insights</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service category:</span>
                    <span className="font-medium">{selectedService.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current price:</span>
                    <span className="font-medium">{formatCurrency(selectedService.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Default tax rate:</span>
                    <span className="font-medium">{selectedService.defaultTax}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${selectedService.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedService.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last used:</span>
                    <span className="font-medium">
                      {selectedService.analytics.lastUsed.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Delete Dialog */}
      <Dialog open={showServiceDeleteDialog} onOpenChange={setShowServiceDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service?
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  Deleting <strong>{selectedService.name}</strong> will permanently remove the service and all its data. 
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowServiceDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmDeleteService}>
                  <Trash2 size={16} className="mr-2" />
                  Delete Service
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Dialog (for Add button) */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service offering for your business
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-service-name">Service Name</Label>
                <Input
                  id="new-service-name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <Label htmlFor="new-service-category">Category</Label>
                <Input
                  id="new-service-category"
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-service-description">Description</Label>
              <Input
                id="new-service-description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this service"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new-service-price">Price</Label>
                <Input
                  id="new-service-price"
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="new-service-unit">Unit</Label>
                <Input
                  id="new-service-unit"
                  value={serviceForm.unit}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="hour, document, etc."
                />
              </div>
              <div>
                <Label htmlFor="new-service-tax">Default Tax (%)</Label>
                <Input
                  id="new-service-tax"
                  type="number"
                  value={serviceForm.defaultTax}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, defaultTax: parseFloat(e.target.value) || 0 }))}
                  placeholder="15"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="new-service-active"
                checked={serviceForm.isActive}
                onChange={(e) => setServiceForm(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
                aria-label="Mark service as active"
              />
              <Label htmlFor="new-service-active">Active Service</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowServiceDialog(false);
                resetServiceForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSaveService}>
                Create Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Edit Dialog */}
      <Dialog open={showTicketEditDialog} onOpenChange={setShowTicketEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTicket ? 'Edit Support Ticket' : 'Create New Support Ticket'}</DialogTitle>
            <DialogDescription>
              {editingTicket ? 'Update the details for this support ticket' : 'Fill in the details for your new support ticket'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-ticket-title">Ticket Title</Label>
                <Input
                  id="edit-ticket-title"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter ticket title"
                />
              </div>
              <div>
                <Label htmlFor="edit-ticket-category">Category</Label>
                <Input
                  id="edit-ticket-category"
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Enter category"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-ticket-description">Description</Label>
              <Textarea
                id="edit-ticket-description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter ticket description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-ticket-priority">Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value as SupportTicket['priority'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-ticket-status">Status</Label>
                <Select value={ticketForm.status} onValueChange={(value) => setTicketForm(prev => ({ ...prev, status: value as SupportTicket['status'] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-ticket-assignee">Assignee</Label>
              <Input
                id="edit-ticket-assignee"
                value={ticketForm.assignee}
                onChange={(e) => setTicketForm(prev => ({ ...prev, assignee: e.target.value }))}
                placeholder="Enter assignee email"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTicketEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                if (editingTicket) {
                  // Update existing ticket
                  const updatedTicket = { 
                    ...editingTicket, 
                    ...ticketForm,
                    updatedAt: new Date()
                  };
                  setSupportTickets(prev => prev.map(ticket => 
                    ticket.id === editingTicket.id ? updatedTicket : ticket
                  ));
                } else {
                  // Create new ticket
                  const newTicket: SupportTicket = {
                    id: (supportTickets.length + 1).toString(),
                    title: ticketForm.title,
                    description: ticketForm.description,
                    priority: ticketForm.priority,
                    status: ticketForm.status,
                    category: ticketForm.category,
                    assignee: ticketForm.assignee,
                    responses: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    analytics: {
                      responseTimeAvg: 0,
                      resolutionTimeAvg: 0,
                      satisfactionRate: 0
                    }
                  };
                  setSupportTickets(prev => [...prev, newTicket]);
                }
                setShowTicketEditDialog(false);
                setEditingTicket(null);
                setTicketForm({
                  title: '',
                  description: '',
                  priority: 'medium' as SupportTicket['priority'],
                  status: 'open' as SupportTicket['status'],
                  category: '',
                  assignee: '',
                });
              }}>
                <Save size={16} className="mr-2" />
                {editingTicket ? 'Save Changes' : 'Create Ticket'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={showTicketDetailsDialog} onOpenChange={setShowTicketDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              {selectedTicket && `Complete information for ticket #${selectedTicket.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Ticket Title</Label>
                    <p className="font-medium">{selectedTicket.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Category</Label>
                    <p className="font-medium">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Priority</Label>
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium mb-3">Description</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{selectedTicket.description}</pre>
                </div>
              </div>

              {/* Analytics */}
              {selectedTicket.analytics && (
                <div>
                  <h4 className="font-medium mb-3">Analytics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Average Response Time</Label>
                      <p className="font-medium">{selectedTicket.analytics.responseTimeAvg} hours</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Average Resolution Time</Label>
                      <p className="font-medium">{selectedTicket.analytics.resolutionTimeAvg} hours</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Satisfaction Rate</Label>
                      <p className="font-medium">{selectedTicket.analytics.satisfactionRate}%</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Assignee */}
              <div>
                <h4 className="font-medium mb-3">Assignee</h4>
                <p>{selectedTicket.assignee}</p>
              </div>

              {/* Responses */}
              <div>
                <h4 className="font-medium mb-3">Responses</h4>
                <p>{selectedTicket.responses}</p>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-xs text-gray-500">Created</Label>
                  <p className="text-sm">{selectedTicket.createdAt.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Updated</Label>
                  <p className="text-sm">{selectedTicket.updatedAt.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket Delete Dialog */}
      <Dialog open={showTicketDeleteDialog} onOpenChange={setShowTicketDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this support ticket?
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="font-medium text-red-800">Warning</span>
                </div>
                <p className="text-sm text-red-700">
                  Deleting <strong>{selectedTicket.title}</strong> will permanently remove the ticket and all its data. 
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowTicketDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => {
                  setSupportTickets(prev => prev.filter(ticket => ticket.id !== selectedTicket.id));
                  setShowTicketDeleteDialog(false);
                  setSelectedTicket(null);
                }}>
                  <Trash2 size={16} className="mr-2" />
                  Delete Ticket
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket Analytics Dialog */}
      <Dialog open={showTicketAnalyticsDialog} onOpenChange={setShowTicketAnalyticsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ticket Analytics</DialogTitle>
            <DialogDescription>
              {selectedTicket && `Detailed analytics for ticket #${selectedTicket.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket?.analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={20} className="text-blue-600" />
                    <h4 className="font-medium">Total Responses</h4>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedTicket.responses}
                  </p>
                  <p className="text-sm text-gray-600">Total responses</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <h4 className="font-medium">Resolved Responses</h4>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedTicket.responses - selectedTicket.analytics.responseTimeAvg}
                  </p>
                  <p className="text-sm text-gray-600">Responses resolved without delay</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={20} className="text-purple-600" />
                    <h4 className="font-medium">Average Response Time</h4>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedTicket.analytics.responseTimeAvg.toFixed(1)} hours
                  </p>
                  <p className="text-sm text-gray-600">Average time to respond</p>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} className="text-orange-600" />
                    <h4 className="font-medium">Average Resolution Time</h4>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedTicket.analytics.resolutionTimeAvg.toFixed(1)} hours
                  </p>
                  <p className="text-sm text-gray-600">Average time to resolve</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} className="text-red-600" />
                    <h4 className="font-medium">Unresolved Responses</h4>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {selectedTicket.responses - selectedTicket.analytics.responseTimeAvg - selectedTicket.analytics.resolutionTimeAvg}
                  </p>
                  <p className="text-sm text-gray-600">Responses delayed</p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} className="text-yellow-600" />
                    <h4 className="font-medium">Unsatisfied Responses</h4>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {selectedTicket.analytics.satisfactionRate < 100 ? selectedTicket.analytics.satisfactionRate : 100}%
                  </p>
                  <p className="text-sm text-gray-600">Responses not meeting expectations</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
