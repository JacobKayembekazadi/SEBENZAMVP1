import React, { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Download, 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Printer, 
  FileText, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calculator,
  CreditCard,
  Building2,
  Banknote,
  Receipt,
  FileCheck,
  Shuffle,
  Filter,
  Settings,
  Upload,
  Wallet,
  Activity,
  Target,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Layers,
  Repeat,
  Trash2,
  Mail,
  ArrowUpDown,
  XCircle,
  Copy,
  Archive
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Interfaces
interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  balance: number;
  parentId?: string;
  isActive: boolean;
  description?: string;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  description: string;
  reference?: string;
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: string;
  createdAt: Date;
  lines: JournalEntryLine[];
}

interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
}

interface Payment {
  id: string;
  paymentNumber: string;
  date: Date;
  amount: number;
  currency: string;
  paymentMethod: string;
  payerName: string;
  payerEmail: string;
  description: string;
  invoiceId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  gateway: string;
  fees: number;
  netAmount: number;
}

interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  balance: number;
  reconciled: boolean;
  matchedEntryId?: string;
}

interface BankReconciliation {
  id: string;
  reconciliationNumber: string;
  bankAccount: string;
  statementDate: Date;
  openingBalance: number;
  closingBalance: number;
  bookBalance: number;
  difference: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  bankTransactions: BankTransaction[];
  unmatchedBookEntries: JournalEntry[];
}

interface FinancialReport {
  id: string;
  name: string;
  type: 'balance_sheet' | 'profit_loss' | 'cash_flow' | 'trial_balance' | 'general_ledger' | 'tax_summary' | 'custom';
  description: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  parameters: {
    accounts: string[];
    includeInactive: boolean;
    groupBy: 'account' | 'category' | 'month' | 'quarter';
    comparison: 'none' | 'previous_period' | 'previous_year';
    format: 'summary' | 'detailed';
  };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    recipients: string[];
    nextRun?: Date;
  };
  createdBy: string;
  createdAt: Date;
  lastGenerated?: Date;
  status: 'draft' | 'active' | 'archived';
}

interface ReportTemplate {
  id: string;
  name: string;
  type: FinancialReport['type'];
  description: string;
  defaultParameters: FinancialReport['parameters'];
  isSystem: boolean;
}

// Mock Data for demonstration - moved outside component to avoid useEffect dependency issues
const mockAccounts: Account[] = [
  { id: '1', code: '1000', name: 'Cash and Cash Equivalents', type: 'asset', category: 'Current Assets', balance: 85000, isActive: true },
  { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset', category: 'Current Assets', balance: 45000, isActive: true },
  { id: '3', code: '1200', name: 'Office Equipment', type: 'asset', category: 'Fixed Assets', balance: 25000, isActive: true },
  { id: '4', code: '2000', name: 'Accounts Payable', type: 'liability', category: 'Current Liabilities', balance: 15000, isActive: true },
  { id: '5', code: '3000', name: 'Retained Earnings', type: 'equity', category: 'Equity', balance: 75000, isActive: true },
  { id: '6', code: '4000', name: 'Legal Service Revenue', type: 'revenue', category: 'Operating Revenue', balance: 125000, isActive: true },
  { id: '7', code: '5000', name: 'Office Rent', type: 'expense', category: 'Operating Expenses', balance: 24000, isActive: true },
  { id: '8', code: '5100', name: 'Professional Development', type: 'expense', category: 'Operating Expenses', balance: 8000, isActive: true }
];

const mockJournalEntries: JournalEntry[] = [
  {
    id: '1',
    entryNumber: 'JE-2024-001',
    date: new Date('2024-01-15'),
    description: 'Client payment received',
    reference: 'INV-001',
    totalDebit: 5000,
    totalCredit: 5000,
    status: 'posted',
    createdBy: 'John Doe',
    createdAt: new Date(),
    lines: [
      { id: '1', accountId: '1', accountCode: '1000', accountName: 'Cash', description: 'Payment received', debitAmount: 5000, creditAmount: 0 },
      { id: '2', accountId: '2', accountCode: '1100', accountName: 'Accounts Receivable', description: 'Invoice payment', debitAmount: 0, creditAmount: 5000 }
    ]
  }
];

const mockBankTransactions: BankTransaction[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    description: 'Deposit - ABC Corp',
    amount: 2500,
    type: 'credit',
    balance: 87500,
    reconciled: false
  },
  {
    id: '2',
    date: new Date('2024-01-14'),
    description: 'Service Fee',
    amount: 25,
    type: 'debit',
    balance: 85000,
    reconciled: false
  },
  {
    id: '3',
    date: new Date('2024-01-13'),
    description: 'Wire Transfer Out',
    amount: 1000,
    type: 'debit',
    balance: 85025,
    reconciled: false
  }
];

const mockReconciliations: BankReconciliation[] = [
  {
    id: '1',
    reconciliationNumber: 'REC-2024-001',
    bankAccount: 'Cash and Cash Equivalents',
    statementDate: new Date('2024-01-31'),
    openingBalance: 85000,
    closingBalance: 87500,
    bookBalance: 85000,
    difference: 2500,
    status: 'in_progress',
    createdBy: 'John Doe',
    createdAt: new Date(),
    bankTransactions: mockBankTransactions,
    unmatchedBookEntries: []
  }
];

const mockReports: FinancialReport[] = [
  {
    id: '1',
    name: 'Monthly Balance Sheet',
    type: 'balance_sheet',
    description: 'Comprehensive balance sheet for monthly review',
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31')
    },
    parameters: {
      accounts: ['1', '2', '3', '4', '5'],
      includeInactive: false,
      groupBy: 'category',
      comparison: 'previous_period',
      format: 'detailed'
    },
    schedule: {
      enabled: true,
      frequency: 'monthly',
      recipients: ['finance@company.com', 'ceo@company.com'],
      nextRun: new Date('2024-02-01')
    },
    createdBy: 'John Doe',
    createdAt: new Date('2024-01-01'),
    lastGenerated: new Date('2024-01-31'),
    status: 'active'
  },
  {
    id: '2',
    name: 'Profit & Loss Statement',
    type: 'profit_loss',
    description: 'Monthly profit and loss analysis',
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31')
    },
    parameters: {
      accounts: ['6', '7', '8'],
      includeInactive: false,
      groupBy: 'account',
      comparison: 'previous_year',
      format: 'summary'
    },
    schedule: {
      enabled: true,
      frequency: 'monthly',
      recipients: ['finance@company.com'],
      nextRun: new Date('2024-02-01')
    },
    createdBy: 'Jane Smith',
    createdAt: new Date('2024-01-01'),
    lastGenerated: new Date('2024-01-31'),
    status: 'active'
  },
  {
    id: '3',
    name: 'Cash Flow Analysis',
    type: 'cash_flow',
    description: 'Weekly cash flow monitoring',
    dateRange: {
      from: new Date('2024-01-22'),
      to: new Date('2024-01-28')
    },
    parameters: {
      accounts: ['1'],
      includeInactive: false,
      groupBy: 'month',
      comparison: 'none',
      format: 'detailed'
    },
    createdBy: 'John Doe',
    createdAt: new Date('2024-01-22'),
    lastGenerated: new Date('2024-01-28'),
    status: 'draft'
  }
];

const mockReportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Standard Balance Sheet',
    type: 'balance_sheet',
    description: 'Standard balance sheet template with all asset, liability, and equity accounts',
    defaultParameters: {
      accounts: [],
      includeInactive: false,
      groupBy: 'category',
      comparison: 'none',
      format: 'detailed'
    },
    isSystem: true
  },
  {
    id: '2',
    name: 'Executive P&L Summary',
    type: 'profit_loss',
    description: 'High-level profit and loss summary for executive reporting',
    defaultParameters: {
      accounts: [],
      includeInactive: false,
      groupBy: 'category',
      comparison: 'previous_period',
      format: 'summary'
    },
    isSystem: true
  },
  {
    id: '3',
    name: 'Cash Flow Forecast',
    type: 'cash_flow',
    description: 'Detailed cash flow analysis with forecasting',
    defaultParameters: {
      accounts: [],
      includeInactive: false,
      groupBy: 'month',
      comparison: 'previous_year',
      format: 'detailed'
    },
    isSystem: false
  }
];

const mockPayments: Payment[] = [
  {
    id: '1',
    paymentNumber: 'PAY-2024-001',
    date: new Date('2024-01-15'),
    amount: 2500,
    currency: 'ZAR',
    paymentMethod: 'Credit Card',
    payerName: 'ABC Corp',
    payerEmail: 'finance@abccorp.com',
    description: 'Legal consultation fee',
    invoiceId: 'INV-001',
    status: 'completed',
    transactionId: 'txn_abc123',
    gateway: 'Stripe',
    fees: 75,
    netAmount: 2425
  }
];

const Accounting = () => {
  const { toast } = useToast();
  
  // State Management
  const [activeTab, setActiveTab] = useState("dashboard");
    const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(mockBankTransactions);
  const [reports, setReports] = useState<FinancialReport[]>(mockReports);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(mockReportTemplates);
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  // Dialog states
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReconciliationDialog, setShowReconciliationDialog] = useState(false);
  const [showImportStatementDialog, setShowImportStatementDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [reconciliations, setReconciliations] = useState<BankReconciliation[]>(mockReconciliations);
  const [selectedReconciliation, setSelectedReconciliation] = useState<BankReconciliation | null>(null);
  const [selectedBankTransaction, setSelectedBankTransaction] = useState<BankTransaction | null>(null);
  const [selectedBookEntry, setSelectedBookEntry] = useState<JournalEntry | null>(null);
  const [reconciliationForm, setReconciliationForm] = useState({
    bankAccount: '',
    statementDate: '',
    openingBalance: '',
    closingBalance: '',
    statementFile: null as File | null
  });
  const [showQuickTransactionDialog, setShowQuickTransactionDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showExpenseTrackingDialog, setShowExpenseTrackingDialog] = useState(false);
  const [showInvoicePaymentDialog, setShowInvoicePaymentDialog] = useState(false);
  const [showTaxCalculatorDialog, setShowTaxCalculatorDialog] = useState(false);
  const [showAuditTrailDialog, setShowAuditTrailDialog] = useState(false);
  
  // Financial Reports dialog states
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showReportScheduleDialog, setShowReportScheduleDialog] = useState(false);
  const [showReportPreviewDialog, setShowReportPreviewDialog] = useState(false);
  const [showReportTemplateDialog, setShowReportTemplateDialog] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<FinancialReport['type'] | null>(null);
  const [editingReport, setEditingReport] = useState<FinancialReport | null>(null);
  const [generatedReportData, setGeneratedReportData] = useState<any>(null);
  
  // Additional states for enhanced functionality
  const [editingTransaction, setEditingTransaction] = useState<JournalEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Enhanced Report Management States
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [selectAllReports, setSelectAllReports] = useState(false);
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportFilterType, setReportFilterType] = useState<string>('all');
  const [reportFilterStatus, setReportFilterStatus] = useState<'all' | 'draft' | 'active' | 'archived'>('all');
  const [reportSortBy, setReportSortBy] = useState<'name' | 'type' | 'created' | 'lastGenerated'>('name');
  const [reportSortOrder, setReportSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [showReportDetailsDialog, setShowReportDetailsDialog] = useState(false);
  const [showReportExportDialog, setShowReportExportDialog] = useState(false);
  const [showReportDuplicateDialog, setShowReportDuplicateDialog] = useState(false);
  const [showReportHistoryDialog, setShowReportHistoryDialog] = useState(false);
  
  // Enhanced Journal Entry Management States
  const [selectedJournalIds, setSelectedJournalIds] = useState<string[]>([]);
  const [selectAllJournals, setSelectAllJournals] = useState(false);
  const [showJournalDetailsDialog, setShowJournalDetailsDialog] = useState(false);
  const [showJournalPrintDialog, setShowJournalPrintDialog] = useState(false);
  const [showReverseEntryDialog, setShowReverseEntryDialog] = useState(false);
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | null>(null);
  const [journalSearchTerm, setJournalSearchTerm] = useState('');
  const [journalFilterStatus, setJournalFilterStatus] = useState<'all' | 'draft' | 'posted' | 'reversed'>('all');
  const [journalSortBy, setJournalSortBy] = useState<'date' | 'amount' | 'entry'>('date');
  const [journalSortOrder, setJournalSortOrder] = useState<'asc' | 'desc'>('desc');

  // Enhanced Payment Management States
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [selectAllPayments, setSelectAllPayments] = useState(false);
  const [showPaymentDetailsDialog, setShowPaymentDetailsDialog] = useState(false);
  const [showPaymentSettingsDialog, setShowPaymentSettingsDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all');
  const [paymentFilterGateway, setPaymentFilterGateway] = useState<'all' | 'stripe' | 'paypal' | 'bank'>('all');
  const [paymentSortBy, setPaymentSortBy] = useState<'date' | 'amount' | 'payer'>('date');
  const [paymentSortOrder, setPaymentSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Form states
  const [accountForm, setAccountForm] = useState<{
    code: string;
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    category: string;
    parentId: string;
    description: string;
  }>({
    code: '',
    name: '',
    type: 'asset',
    category: '',
    parentId: '',
    description: ''
  });
  
  const [journalForm, setJournalForm] = useState({
    date: new Date(),
    description: '',
    reference: '',
    lines: [] as Omit<JournalEntryLine, 'id'>[]
  });

  const [reportForm, setReportForm] = useState<{
    name: string;
    type: FinancialReport['type'];
    description: string;
    dateRange: {
      from: Date;
      to: Date;
    };
    parameters: {
      accounts: string[];
      includeInactive: boolean;
      groupBy: 'account' | 'category' | 'month' | 'quarter';
      comparison: 'none' | 'previous_period' | 'previous_year';
      format: 'summary' | 'detailed';
    };
    schedule: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
      recipients: string[];
    };
  }>({
    name: '',
    type: 'balance_sheet',
    description: '',
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    },
    parameters: {
      accounts: [],
      includeInactive: false,
      groupBy: 'account',
      comparison: 'none',
      format: 'summary'
    },
    schedule: {
      enabled: false,
      frequency: 'monthly',
      recipients: []
    }
  });

  const [paymentForm, setPaymentForm] = useState<{
    amount: string;
    currency: string;
    paymentMethod: string;
    payerName: string;
    payerEmail: string;
    description: string;
    invoiceId: string;
    gateway: string;
    reference: string;
  }>({
    amount: '',
    currency: 'ZAR',
    paymentMethod: 'credit_card',
    payerName: '',
    payerEmail: '',
    description: '',
    invoiceId: '',
    gateway: 'stripe',
    reference: ''
  });

  const [paymentSettings, setPaymentSettings] = useState<{
    stripe: {
      enabled: boolean;
      publicKey: string;
      secretKey: string;
      webhookSecret: string;
    };
    paypal: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
      environment: 'sandbox' | 'production';
    };
    bank: {
      enabled: boolean;
      accountName: string;
      accountNumber: string;
      bankName: string;
      branchCode: string;
    };
    fees: {
      creditCard: number;
      bankTransfer: number;
      paypal: number;
    };
    currency: {
      default: string;
      supported: string[];
    };
  }>({
    stripe: {
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookSecret: ''
    },
    paypal: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      environment: 'sandbox'
    },
    bank: {
      enabled: false,
      accountName: '',
      accountNumber: '',
      bankName: '',
      branchCode: ''
    },
    fees: {
      creditCard: 2.9,
      bankTransfer: 0,
      paypal: 3.4
    },
    currency: {
      default: 'ZAR',
      supported: ['ZAR', 'USD', 'EUR', 'GBP']
    }
  });

  // Add after the existing state declarations
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [selectAllAccounts, setSelectAllAccounts] = useState(false);

  // Initialize data
  useEffect(() => {
    if (accounts.length === 0) {
      setAccounts(mockAccounts);
      setJournalEntries(mockJournalEntries);
      setPayments(mockPayments);
    }
  }, [accounts.length]);

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate financial metrics
  const calculateMetrics = () => {
    const assets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0);
    const liabilities = accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0);
    const equity = accounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + a.balance, 0);
    const revenue = accounts.filter(a => a.type === 'revenue').reduce((sum, a) => sum + a.balance, 0);
    const expenses = accounts.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.balance, 0);
    
    return {
      totalAssets: assets,
      totalLiabilities: liabilities,
      totalEquity: equity,
      totalRevenue: revenue,
      totalExpenses: expenses,
      netIncome: revenue - expenses,
      workingCapital: assets - liabilities
    };
  };

  const metrics = calculateMetrics();

  // Enhanced Journal Entry CRUD Handlers
  const handleSaveJournalEntry = () => {
    // Form validation
    if (!journalForm.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Journal entry description is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (journalForm.lines.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one journal entry line is required.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate each line
    for (let i = 0; i < journalForm.lines.length; i++) {
      const line = journalForm.lines[i];
      if (!line.accountId) {
        toast({
          title: "Validation Error",
          description: `Line ${i + 1}: Please select an account.`,
          variant: "destructive",
        });
        return;
      }
      if (!line.description.trim()) {
        toast({
          title: "Validation Error",
          description: `Line ${i + 1}: Line description is required.`,
          variant: "destructive",
        });
        return;
      }
      if (line.debitAmount === 0 && line.creditAmount === 0) {
        toast({
          title: "Validation Error",
          description: `Line ${i + 1}: Either debit or credit amount must be greater than zero.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Check if debits equal credits
    const totalDebits = journalForm.lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredits = journalForm.lines.reduce((sum, line) => sum + line.creditAmount, 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      toast({
        title: "Validation Error",
        description: "Total debits must equal total credits.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingTransaction) {
        // Update existing entry
        const updatedEntries = journalEntries.map(entry => 
          entry.id === editingTransaction.id 
            ? { 
                ...entry, 
                date: journalForm.date,
                description: journalForm.description.trim(),
                reference: journalForm.reference.trim(),
                totalDebit: totalDebits,
                totalCredit: totalCredits,
                lines: journalForm.lines.map((line, idx) => ({ 
                  ...line, 
                  id: `${editingTransaction.id}-line-${idx}`,
                  description: line.description.trim()
                }))
              }
            : entry
        );
        setJournalEntries(updatedEntries);
        toast({
          title: "Success",
          description: "Journal entry updated successfully!",
        });
      } else {
        // Create new entry
        const newEntry: JournalEntry = {
          id: Date.now().toString(),
          entryNumber: `JE-2024-${String(journalEntries.length + 1).padStart(3, '0')}`,
          date: journalForm.date,
          description: journalForm.description.trim(),
          reference: journalForm.reference.trim(),
          totalDebit: totalDebits,
          totalCredit: totalCredits,
          status: 'draft',
          createdBy: 'Current User',
          createdAt: new Date(),
          lines: journalForm.lines.map((line, idx) => ({ 
            ...line, 
            id: `${Date.now()}-line-${idx}`,
            description: line.description.trim()
          }))
        };
        setJournalEntries([...journalEntries, newEntry]);
        toast({
          title: "Success",
          description: "Journal entry created successfully!",
        });
      }
      
      // Reset form and close dialog
      setJournalForm({
        date: new Date(),
        description: '',
        reference: '',
        lines: []
      });
      setEditingTransaction(null);
      setShowJournalDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJournalEntry = (entryId: string) => {
    const entry = journalEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Check if entry is posted
    if (entry.status === 'posted') {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete a posted journal entry. Please reverse the entry instead.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm(`Are you sure you want to delete journal entry "${entry.entryNumber}"?`)) {
      try {
        const updatedEntries = journalEntries.filter(e => e.id !== entryId);
        setJournalEntries(updatedEntries);
        toast({
          title: "Success",
          description: "Journal entry deleted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete journal entry. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReverseJournalEntry = (entryId: string) => {
    const entry = journalEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    if (entry.status === 'reversed') {
      toast({
        title: "Already Reversed",
        description: "This journal entry has already been reversed.",
        variant: "destructive",
      });
      return;
    }
    
    if (entry.status !== 'posted') {
      toast({
        title: "Cannot Reverse",
        description: "Only posted journal entries can be reversed.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm(`Are you sure you want to reverse journal entry "${entry.entryNumber}"?`)) {
      try {
        // Mark original entry as reversed
        const updatedEntries = journalEntries.map(e => 
          e.id === entryId 
            ? { ...e, status: 'reversed' as const }
            : e
        );
        
        // Create reversing entry
        const reversingEntry: JournalEntry = {
          id: Date.now().toString(),
          entryNumber: `JE-2024-${String(journalEntries.length + 1).padStart(3, '0')}`,
          date: new Date(),
          description: `REVERSAL: ${entry.description}`,
          reference: `REV-${entry.entryNumber}`,
          totalDebit: entry.totalCredit,
          totalCredit: entry.totalDebit,
          status: 'posted',
          createdBy: 'Current User',
          createdAt: new Date(),
          lines: entry.lines.map((line, idx) => ({
            ...line,
            id: `${Date.now()}-rev-line-${idx}`,
            description: `REVERSAL: ${line.description}`,
            debitAmount: line.creditAmount,
            creditAmount: line.debitAmount
          }))
        };
        
        setJournalEntries([...updatedEntries, reversingEntry]);
        toast({
          title: "Success",
          description: "Journal entry reversed successfully! Reversing entry created.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reverse journal entry. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePostJournalEntry = (entryId: string) => {
    const entry = journalEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    if (entry.status !== 'draft') {
      toast({
        title: "Cannot Post",
        description: "Only draft journal entries can be posted.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate entry before posting
    if (Math.abs(entry.totalDebit - entry.totalCredit) > 0.01) {
      toast({
        title: "Cannot Post",
        description: "Total debits must equal total credits before posting.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm(`Are you sure you want to post journal entry "${entry.entryNumber}"?`)) {
      try {
        const updatedEntries = journalEntries.map(e => 
          e.id === entryId 
            ? { ...e, status: 'posted' as const }
            : e
        );
        setJournalEntries(updatedEntries);
        toast({
          title: "Success",
          description: "Journal entry posted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to post journal entry. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // View Journal Entry Details
  const handleViewJournalDetails = (entry: JournalEntry) => {
    setSelectedJournalEntry(entry);
    setShowJournalDetailsDialog(true);
  };

  // Edit Journal Entry
  const handleEditJournalEntry = (entry: JournalEntry) => {
    if (entry.status === 'posted') {
      toast({
        title: "Cannot Edit",
        description: "Cannot edit a posted journal entry. Please reverse the entry to make changes.",
        variant: "destructive",
      });
      return;
    }
    
    setEditingTransaction(entry);
    setJournalForm({
      date: entry.date,
      description: entry.description,
      reference: entry.reference || '',
      lines: entry.lines.map(line => ({
        accountId: line.accountId,
        accountCode: line.accountCode,
        accountName: line.accountName,
        description: line.description,
        debitAmount: line.debitAmount,
        creditAmount: line.creditAmount
      }))
    });
    setShowJournalDialog(true);
  };

  // Print Journal Entry
  const handlePrintJournalEntry = (entry: JournalEntry) => {
    setSelectedJournalEntry(entry);
    setShowJournalPrintDialog(true);
  };

  // Bulk Journal Operations
  const handleBulkJournalAction = (action: 'post' | 'delete' | 'export', entryIds: string[]) => {
    if (entryIds.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select journal entries to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }
    
    const confirmMessage = `Are you sure you want to ${action} ${entryIds.length} journal entries?`;
    if (!confirm(confirmMessage)) return;
    
    try {
      let updatedEntries = [...journalEntries];
      
      switch (action) {
        case 'post':
          const cannotPost = journalEntries.filter(entry => 
            entryIds.includes(entry.id) && entry.status !== 'draft'
          );
          
          if (cannotPost.length > 0) {
            toast({
              title: "Cannot Post",
              description: `${cannotPost.length} entries cannot be posted (not in draft status).`,
              variant: "destructive",
            });
            return;
          }
          
          updatedEntries = journalEntries.map(entry => 
            entryIds.includes(entry.id) && entry.status === 'draft'
              ? { ...entry, status: 'posted' as const }
              : entry
          );
          break;
          
        case 'delete':
          const cannotDelete = journalEntries.filter(entry => 
            entryIds.includes(entry.id) && entry.status === 'posted'
          );
          
          if (cannotDelete.length > 0) {
            toast({
              title: "Cannot Delete",
              description: `${cannotDelete.length} entries cannot be deleted (already posted).`,
              variant: "destructive",
            });
            return;
          }
          
          updatedEntries = journalEntries.filter(entry => 
            !entryIds.includes(entry.id) || entry.status === 'posted'
          );
          break;
          
        case 'export':
          const entriesToExport = journalEntries.filter(entry => entryIds.includes(entry.id));
          const csvContent = [
            ['Entry Number', 'Date', 'Description', 'Reference', 'Debit', 'Credit', 'Status'].join(','),
            ...entriesToExport.map(entry => [
              entry.entryNumber,
              entry.date.toLocaleDateString(),
              `"${entry.description}"`,
              `"${entry.reference || ''}"`,
              entry.totalDebit,
              entry.totalCredit,
              entry.status
            ].join(','))
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `journal-entries-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          toast({
            title: "Success",
            description: `${entryIds.length} journal entries exported successfully!`,
          });
          return;
      }
      
      setJournalEntries(updatedEntries);
      setSelectedJournalIds([]);
      setSelectAllJournals(false);
      
      toast({
        title: "Success",
        description: `${entryIds.length} journal entries ${action}ed successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter and sort journal entries
  const getFilteredJournalEntries = () => {
    let filtered = journalEntries.filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(journalSearchTerm.toLowerCase()) ||
                           entry.entryNumber.toLowerCase().includes(journalSearchTerm.toLowerCase()) ||
                           entry.reference?.toLowerCase().includes(journalSearchTerm.toLowerCase()) ||
                           entry.lines.some(line => line.accountName.toLowerCase().includes(journalSearchTerm.toLowerCase()));
      const matchesStatus = journalFilterStatus === 'all' || entry.status === journalFilterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // Sort entries
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (journalSortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.totalDebit;
          bValue = b.totalDebit;
          break;
        case 'entry':
          aValue = a.entryNumber;
          bValue = b.entryNumber;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return journalSortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return journalSortOrder === 'asc' ? 
        (aValue as number) - (bValue as number) : 
        (bValue as number) - (aValue as number);
    });

    return filtered;
  };

  // Enhanced Payment CRUD Handlers
  const handleSavePayment = () => {
    // Form validation
    if (!paymentForm.amount.trim() || parseFloat(paymentForm.amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Payment amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentForm.payerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Payer name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentForm.payerEmail.trim() || !paymentForm.payerEmail.includes('@')) {
      toast({
        title: "Validation Error",
        description: "Valid payer email is required.",
        variant: "destructive",
      });
      return;
    }

    if (!paymentForm.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Payment description is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const amount = parseFloat(paymentForm.amount);
      const fees = amount * (paymentSettings.fees.creditCard / 100);
      const netAmount = amount - fees;

      if (editingPayment) {
        // Update existing payment
        const updatedPayments = payments.map(payment => 
          payment.id === editingPayment.id 
            ? { 
                ...payment, 
                amount,
                currency: paymentForm.currency,
                paymentMethod: paymentForm.paymentMethod,
                payerName: paymentForm.payerName.trim(),
                payerEmail: paymentForm.payerEmail.trim(),
                description: paymentForm.description.trim(),
                invoiceId: paymentForm.invoiceId || undefined,
                gateway: paymentForm.gateway,
                fees,
                netAmount
              }
            : payment
        );
        setPayments(updatedPayments);
        toast({
          title: "Success",
          description: "Payment updated successfully!",
        });
      } else {
        // Create new payment
        const newPayment: Payment = {
          id: Date.now().toString(),
          paymentNumber: `PAY-2024-${String(payments.length + 1).padStart(3, '0')}`,
          date: new Date(),
          amount,
          currency: paymentForm.currency,
          paymentMethod: paymentForm.paymentMethod,
          payerName: paymentForm.payerName.trim(),
          payerEmail: paymentForm.payerEmail.trim(),
          description: paymentForm.description.trim(),
          invoiceId: paymentForm.invoiceId || undefined,
          status: 'pending',
          transactionId: `txn_${Date.now()}`,
          gateway: paymentForm.gateway,
          fees,
          netAmount
        };
        setPayments([...payments, newPayment]);
        toast({
          title: "Success",
          description: "Payment processed successfully!",
        });
      }

      // Reset form and close dialog
      setPaymentForm({
        amount: '',
        currency: 'ZAR',
        paymentMethod: 'credit_card',
        payerName: '',
        payerEmail: '',
        description: '',
        invoiceId: '',
        gateway: 'stripe',
        reference: ''
      });
      setEditingPayment(null);
      setShowPaymentDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetailsDialog(true);
  };

  const handleEditPayment = (payment: Payment) => {
    if (payment.status === 'completed' || payment.status === 'refunded') {
      toast({
        title: "Cannot Edit",
        description: "Cannot edit completed or refunded payments.",
        variant: "destructive",
      });
      return;
    }

    setEditingPayment(payment);
    setPaymentForm({
      amount: payment.amount.toString(),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      payerName: payment.payerName,
      payerEmail: payment.payerEmail,
      description: payment.description,
      invoiceId: payment.invoiceId || '',
      gateway: payment.gateway,
      reference: ''
    });
    setShowPaymentDialog(true);
  };

  const handleRefundPayment = (payment: Payment) => {
    if (payment.status !== 'completed') {
      toast({
        title: "Cannot Refund",
        description: "Only completed payments can be refunded.",
        variant: "destructive",
      });
      return;
    }

    setSelectedPayment(payment);
    setShowRefundDialog(true);
  };

  const handleProcessRefund = (paymentId: string, refundAmount: number, reason: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    if (refundAmount > payment.amount) {
      toast({
        title: "Invalid Amount",
        description: "Refund amount cannot exceed original payment amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create refund payment entry
      const refundPayment: Payment = {
        id: Date.now().toString(),
        paymentNumber: `REF-${payment.paymentNumber}`,
        date: new Date(),
        amount: -refundAmount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        payerName: payment.payerName,
        payerEmail: payment.payerEmail,
        description: `REFUND: ${reason}`,
        invoiceId: payment.invoiceId,
        status: 'refunded',
        transactionId: `ref_${Date.now()}`,
        gateway: payment.gateway,
        fees: 0,
        netAmount: -refundAmount
      };

      // Update original payment status if full refund
      const updatedPayments = payments.map(p => 
        p.id === paymentId 
          ? { ...p, status: refundAmount === payment.amount ? 'refunded' as const : 'completed' as const }
          : p
      );

      setPayments([...updatedPayments, refundPayment]);
      toast({
        title: "Success",
        description: `Refund of ${formatCurrency(refundAmount)} processed successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceiptDialog(true);
  };

  const handleActualSendReceipt = (paymentId: string, email: string) => {
    try {
      // Simulate sending receipt
      toast({
        title: "Receipt Sent",
        description: `Payment receipt has been sent to ${email}`,
      });
      setShowReceiptDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkPaymentAction = (action: 'complete' | 'cancel' | 'export', paymentIds: string[]) => {
    if (paymentIds.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select payments to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${paymentIds.length} payment(s)?`;
    if (!confirm(confirmMessage)) return;

    try {
      let updatedPayments = [...payments];

      switch (action) {
        case 'complete':
          const cannotComplete = payments.filter(payment => 
            paymentIds.includes(payment.id) && payment.status !== 'pending'
          );

          if (cannotComplete.length > 0) {
            toast({
              title: "Cannot Complete",
              description: `${cannotComplete.length} payments cannot be completed (not pending).`,
              variant: "destructive",
            });
            return;
          }

          updatedPayments = payments.map(payment => 
            paymentIds.includes(payment.id) && payment.status === 'pending'
              ? { ...payment, status: 'completed' as const }
              : payment
          );
          break;

        case 'cancel':
          const cannotCancel = payments.filter(payment => 
            paymentIds.includes(payment.id) && (payment.status === 'completed' || payment.status === 'refunded')
          );

          if (cannotCancel.length > 0) {
            toast({
              title: "Cannot Cancel",
              description: `${cannotCancel.length} payments cannot be cancelled (already completed/refunded).`,
              variant: "destructive",
            });
            return;
          }

          updatedPayments = payments.map(payment => 
            paymentIds.includes(payment.id) && payment.status !== 'completed' && payment.status !== 'refunded'
              ? { ...payment, status: 'failed' as const }
              : payment
          );
          break;

        case 'export':
          const paymentsToExport = payments.filter(payment => paymentIds.includes(payment.id));
          const csvContent = [
            ['Payment Number', 'Date', 'Payer', 'Amount', 'Currency', 'Method', 'Gateway', 'Status'].join(','),
            ...paymentsToExport.map(payment => [
              payment.paymentNumber,
              payment.date.toLocaleDateString(),
              `"${payment.payerName}"`,
              payment.amount,
              payment.currency,
              payment.paymentMethod,
              payment.gateway,
              payment.status
            ].join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          toast({
            title: "Success",
            description: `${paymentIds.length} payments exported successfully!`,
          });
          return;
      }

      setPayments(updatedPayments);
      setSelectedPaymentIds([]);
      setSelectAllPayments(false);

      toast({
        title: "Success",
        description: `${paymentIds.length} payments ${action}d successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSavePaymentSettings = () => {
    try {
      // In a real app, this would save to backend
      toast({
        title: "Success",
        description: "Payment settings saved successfully!",
      });
      setShowPaymentSettingsDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save payment settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter and sort payments
  const getFilteredPayments = () => {
    let filtered = payments.filter(payment => {
      const matchesSearch = payment.paymentNumber.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
                           payment.payerName.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
                           payment.payerEmail.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
                           payment.description.toLowerCase().includes(paymentSearchTerm.toLowerCase());
      const matchesStatus = paymentFilterStatus === 'all' || payment.status === paymentFilterStatus;
      const matchesGateway = paymentFilterGateway === 'all' || payment.gateway.toLowerCase() === paymentFilterGateway;

      return matchesSearch && matchesStatus && matchesGateway;
    });

    // Sort payments
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (paymentSortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'payer':
          aValue = a.payerName;
          bValue = b.payerName;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return paymentSortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return paymentSortOrder === 'asc' ? 
        (aValue as number) - (bValue as number) : 
        (bValue as number) - (aValue as number);
    });

    return filtered;
  };

  // Financial Reports CRUD Handlers
  const handleSaveReport = () => {
    if (editingReport) {
      // Update existing report
      const updatedReports = reports.map(report => 
        report.id === editingReport.id 
          ? { 
              ...report, 
              ...reportForm,
              lastGenerated: undefined // Reset generation status on edit
            }
          : report
      );
      setReports(updatedReports);
      toast({
        title: "Success",
        description: "Report updated successfully!",
      });
    } else {
      // Create new report
      const newReport: FinancialReport = {
        id: Date.now().toString(),
        name: reportForm.name,
        type: reportForm.type,
        description: reportForm.description,
        dateRange: reportForm.dateRange,
        parameters: reportForm.parameters,
        schedule: reportForm.schedule.enabled ? reportForm.schedule : undefined,
        createdBy: 'Current User',
        createdAt: new Date(),
        status: 'draft'
      };
      setReports([...reports, newReport]);
      toast({
        title: "Success",
        description: "Report created successfully!",
      });
    }
    
    // Reset form and close dialog
    setReportForm({
      name: '',
      type: 'balance_sheet',
      description: '',
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date()
      },
      parameters: {
        accounts: [],
        includeInactive: false,
        groupBy: 'account',
        comparison: 'none',
        format: 'summary'
      },
      schedule: {
        enabled: false,
        frequency: 'monthly',
        recipients: []
      }
    });
    setEditingReport(null);
    setShowReportDialog(false);
  };

  const handleDeleteReport = (reportId: string) => {
    const updatedReports = reports.filter(report => report.id !== reportId);
    setReports(updatedReports);
    toast({
      title: "Success",
      description: "Report deleted successfully!",
    });
  };

  const handleGenerateReport = (report: FinancialReport) => {
    // Simulate report generation
    const reportData = generateReportData(report);
    setGeneratedReportData(reportData);
    
    // Update report with generation timestamp
    const updatedReports = reports.map(r => 
      r.id === report.id 
        ? { ...r, lastGenerated: new Date(), status: 'active' as const }
        : r
    );
    setReports(updatedReports);
    
    setShowReportPreviewDialog(true);
    toast({
      title: "Success",
      description: `${report.name} generated successfully!`,
    });
  };

  const handleScheduleReport = (report: FinancialReport) => {
    setEditingReport(report);
    setReportForm({
      name: report.name,
      type: report.type,
      description: report.description,
      dateRange: report.dateRange,
      parameters: report.parameters,
      schedule: report.schedule || {
        enabled: false,
        frequency: 'monthly',
        recipients: []
      }
    });
    setShowReportScheduleDialog(true);
  };

  const handleExportReport = (report: FinancialReport, format: 'pdf' | 'excel' | 'csv') => {
    toast({
      title: "Export Started",
      description: `${report.name} is being exported as ${format.toUpperCase()}...`,
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${report.name}.${format} has been downloaded.`,
      });
    }, 2000);
  };

  const generateReportData = (report: FinancialReport) => {
    // Generate mock report data based on report type
    switch (report.type) {
      case 'balance_sheet':
        return {
          title: 'Balance Sheet',
          period: `${report.dateRange.from.toLocaleDateString()} - ${report.dateRange.to.toLocaleDateString()}`,
          sections: {
            assets: accounts.filter(a => a.type === 'asset'),
            liabilities: accounts.filter(a => a.type === 'liability'),
            equity: accounts.filter(a => a.type === 'equity')
          },
          totals: {
            totalAssets: metrics.totalAssets,
            totalLiabilities: metrics.totalLiabilities,
            totalEquity: metrics.totalEquity
          }
        };
      case 'profit_loss':
        return {
          title: 'Profit & Loss Statement',
          period: `${report.dateRange.from.toLocaleDateString()} - ${report.dateRange.to.toLocaleDateString()}`,
          sections: {
            revenue: accounts.filter(a => a.type === 'revenue'),
            expenses: accounts.filter(a => a.type === 'expense')
          },
          totals: {
            totalRevenue: metrics.totalRevenue,
            totalExpenses: metrics.totalExpenses,
            netIncome: metrics.netIncome
          }
        };
      case 'trial_balance':
        return {
          title: 'Trial Balance',
          period: `As of ${report.dateRange.to.toLocaleDateString()}`,
          accounts: accounts.map(account => ({
            ...account,
            debitBalance: account.type === 'asset' || account.type === 'expense' ? account.balance : 0,
            creditBalance: account.type === 'liability' || account.type === 'equity' || account.type === 'revenue' ? account.balance : 0
          })),
          totals: {
            totalDebits: accounts.filter(a => a.type === 'asset' || a.type === 'expense').reduce((sum, a) => sum + a.balance, 0),
            totalCredits: accounts.filter(a => a.type === 'liability' || a.type === 'equity' || a.type === 'revenue').reduce((sum, a) => sum + a.balance, 0)
          }
        };
      default:
        return {
          title: report.name,
          period: `${report.dateRange.from.toLocaleDateString()} - ${report.dateRange.to.toLocaleDateString()}`,
          data: 'Report data would be generated here'
        };
    }
  };

  // Enhanced Report CRUD Handlers
  const handleViewReportDetails = (report: FinancialReport) => {
    setSelectedReport(report);
    setShowReportDetailsDialog(true);
  };

  const handleEditReport = (report: FinancialReport) => {
    setEditingReport(report);
    setReportForm({
      name: report.name,
      type: report.type,
      description: report.description,
      dateRange: report.dateRange,
      parameters: report.parameters,
      schedule: report.schedule || {
        enabled: false,
        frequency: 'monthly',
        recipients: []
      }
    });
    setShowReportDialog(true);
  };

  const handleDuplicateReport = (report: FinancialReport) => {
    const duplicatedReport: FinancialReport = {
      ...report,
      id: Date.now().toString(),
      name: `${report.name} (Copy)`,
      createdBy: 'Current User',
      createdAt: new Date(),
      lastGenerated: undefined,
      status: 'draft'
    };
    setReports([...reports, duplicatedReport]);
    toast({
      title: "Success",
      description: "Report duplicated successfully!",
    });
  };

  const handleArchiveReport = (reportId: string) => {
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'archived' as const }
        : report
    );
    setReports(updatedReports);
    toast({
      title: "Success",
      description: "Report archived successfully!",
    });
  };

  const handleActivateReport = (reportId: string) => {
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'active' as const }
        : report
    );
    setReports(updatedReports);
    toast({
      title: "Success",
      description: "Report activated successfully!",
    });
  };

  const handleBulkReportAction = (action: 'generate' | 'archive' | 'activate' | 'delete' | 'export', reportIds: string[]) => {
    try {
      let updatedReports = [...reports];

      switch (action) {
        case 'generate':
          reportIds.forEach(id => {
            const report = reports.find(r => r.id === id);
            if (report) {
              handleGenerateReport(report);
            }
          });
          break;

        case 'archive':
          updatedReports = reports.map(report => 
            reportIds.includes(report.id) 
              ? { ...report, status: 'archived' as const }
              : report
          );
          break;

        case 'activate':
          updatedReports = reports.map(report => 
            reportIds.includes(report.id) 
              ? { ...report, status: 'active' as const }
              : report
          );
          break;

        case 'delete':
          updatedReports = reports.filter(report => !reportIds.includes(report.id));
          break;

        case 'export':
          const reportsToExport = reports.filter(report => reportIds.includes(report.id));
          const csvContent = [
            ['Name', 'Type', 'Status', 'Created', 'Last Generated', 'Created By'].join(','),
            ...reportsToExport.map(report => [
              `"${report.name}"`,
              report.type,
              report.status,
              report.createdAt.toLocaleDateString(),
              report.lastGenerated ? report.lastGenerated.toLocaleDateString() : 'Never',
              `"${report.createdBy}"`
            ].join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          toast({
            title: "Success",
            description: `${reportIds.length} reports exported successfully!`,
          });
          return;
      }

      if (action === 'archive' || action === 'activate' || action === 'delete') {
        setReports(updatedReports);
        setSelectedReportIds([]);
        setSelectAllReports(false);

        toast({
          title: "Success",
          description: `${reportIds.length} reports ${action}d successfully!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateReportFromTemplate = (template: ReportTemplate) => {
    setReportForm({
      name: template.name,
      type: template.type,
      description: template.description,
      dateRange: {
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date()
      },
      parameters: template.defaultParameters,
      schedule: {
        enabled: false,
        frequency: 'monthly',
        recipients: []
      }
    });
    setShowReportDialog(true);
  };

  const handleSaveReportTemplate = (template: Omit<ReportTemplate, 'id'>) => {
    const newTemplate: ReportTemplate = {
      ...template,
      id: Date.now().toString(),
      isSystem: false
    };
    setReportTemplates([...reportTemplates, newTemplate]);
    toast({
      title: "Success",
      description: "Report template saved successfully!",
    });
  };

  const handleDeleteReportTemplate = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (template?.isSystem) {
      toast({
        title: "Error",
        description: "Cannot delete system templates.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedTemplates = reportTemplates.filter(t => t.id !== templateId);
    setReportTemplates(updatedTemplates);
    toast({
      title: "Success",
      description: "Report template deleted successfully!",
    });
  };

  // Filter and sort reports
  const getFilteredReports = () => {
    let filtered = reports.filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                           report.createdBy.toLowerCase().includes(reportSearchTerm.toLowerCase());
      const matchesType = reportFilterType === 'all' || report.type === reportFilterType;
      const matchesStatus = reportFilterStatus === 'all' || report.status === reportFilterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort reports
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (reportSortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'lastGenerated':
          aValue = a.lastGenerated ? new Date(a.lastGenerated).getTime() : 0;
          bValue = b.lastGenerated ? new Date(b.lastGenerated).getTime() : 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return reportSortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return reportSortOrder === 'asc' ? 
        (aValue as number) - (bValue as number) : 
        (bValue as number) - (aValue as number);
    });

    return filtered;
  };

  // Account CRUD Handlers
  const handleSaveAccount = () => {
    // Form validation
    if (!accountForm.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Account code is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!accountForm.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Account name is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!accountForm.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Account category is required.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for duplicate account codes
    const existingAccount = accounts.find(a => 
      a.code.toLowerCase() === accountForm.code.trim().toLowerCase() && 
      a.id !== editingAccount?.id
    );
    
    if (existingAccount) {
      toast({
        title: "Validation Error",
        description: "Account code already exists. Please use a different code.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingAccount) {
        // Update existing account
        const updatedAccounts = accounts.map(account => 
          account.id === editingAccount.id 
            ? { 
                ...account, 
                code: accountForm.code.trim(),
                name: accountForm.name.trim(),
                type: accountForm.type,
                category: accountForm.category.trim(),
                parentId: accountForm.parentId === 'none' ? undefined : accountForm.parentId || undefined,
                description: accountForm.description.trim()
              }
            : account
        );
        setAccounts(updatedAccounts);
        toast({
          title: "Success",
          description: "Account updated successfully!",
        });
      } else {
        // Create new account
        const newAccount: Account = {
          id: Date.now().toString(),
          code: accountForm.code.trim(),
          name: accountForm.name.trim(),
          type: accountForm.type,
          category: accountForm.category.trim(),
          balance: 0,
          parentId: accountForm.parentId === 'none' ? undefined : accountForm.parentId || undefined,
          isActive: true,
          description: accountForm.description.trim()
        };
        setAccounts([...accounts, newAccount]);
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      }
      
      // Reset form and close dialog
      setAccountForm({
        code: '',
        name: '',
        type: 'asset',
        category: '',
        parentId: '',
        description: ''
      });
      setEditingAccount(null);
      setShowAccountDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setAccountForm({
      code: account.code,
      name: account.name,
      type: account.type,
      category: account.category,
      parentId: account.parentId || '',
      description: account.description || ''
    });
    setShowAccountDialog(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;
    
    // Check if account has child accounts
    const childAccounts = accounts.filter(a => a.parentId === accountId);
    if (childAccounts.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete account with child accounts. Please remove or reassign child accounts first.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if account has transactions (in a real app, you'd check against journal entries)
    const hasTransactions = journalEntries.some(entry => 
      entry.lines.some(line => line.accountId === accountId)
    );
    
    if (hasTransactions) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete account with existing transactions. Consider deactivating the account instead.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm(`Are you sure you want to delete account "${account.code} - ${account.name}"?`)) {
      try {
        const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
        setAccounts(updatedAccounts);
        toast({
          title: "Success",
          description: "Account deleted successfully!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleAccountStatus = (accountId: string) => {
    try {
      const updatedAccounts = accounts.map(account => 
        account.id === accountId 
          ? { ...account, isActive: !account.isActive }
          : account
      );
      setAccounts(updatedAccounts);
      
      const account = accounts.find(a => a.id === accountId);
      toast({
        title: "Success",
        description: `Account ${account?.isActive ? 'deactivated' : 'activated'} successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update account status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewAccountLedger = (account: Account) => {
    setSelectedAccount(account);
    setShowAccountLedgerDialog(true);
  };

  const handleViewAccountHistory = (account: Account) => {
    setSelectedAccount(account);
    setShowAccountHistoryDialog(true);
  };

  const handleBulkAccountAction = (action: 'activate' | 'deactivate' | 'delete', accountIds: string[]) => {
    if (accountIds.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select accounts to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }
    
    const confirmMessage = `Are you sure you want to ${action} ${accountIds.length} account(s)?`;
    if (!confirm(confirmMessage)) return;
    
    try {
      let updatedAccounts = [...accounts];
      
      switch (action) {
        case 'activate':
          updatedAccounts = accounts.map(account => 
            accountIds.includes(account.id) 
              ? { ...account, isActive: true }
              : account
          );
          break;
        case 'deactivate':
          updatedAccounts = accounts.map(account => 
            accountIds.includes(account.id) 
              ? { ...account, isActive: false }
              : account
          );
          break;
        case 'delete':
          // Check for accounts with transactions or child accounts
          const cannotDelete = accounts.filter(account => 
            accountIds.includes(account.id) && (
              accounts.some(a => a.parentId === account.id) ||
              journalEntries.some(entry => 
                entry.lines.some(line => line.accountId === account.id)
              )
            )
          );
          
          if (cannotDelete.length > 0) {
            toast({
              title: "Cannot Delete",
              description: `${cannotDelete.length} account(s) cannot be deleted due to existing transactions or child accounts.`,
              variant: "destructive",
            });
            return;
          }
          
          updatedAccounts = accounts.filter(account => !accountIds.includes(account.id));
          break;
      }
      
      setAccounts(updatedAccounts);
      toast({
        title: "Success",
        description: `${accountIds.length} account(s) ${action}d successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Enhanced export functionality
  const handleExportAccounts = (format: 'csv' | 'excel' | 'pdf') => {
    const filteredAccounts = getFilteredAccounts();
    
    if (filteredAccounts.length === 0) {
      toast({
        title: "No Data",
        description: "No accounts to export based on current filters.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (format === 'csv') {
        const csvContent = [
          ['Code', 'Name', 'Type', 'Category', 'Balance', 'Status', 'Description'].join(','),
          ...filteredAccounts.map(account => [
            account.code,
            `"${account.name}"`,
            account.type,
            `"${account.category}"`,
            account.balance,
            account.isActive ? 'Active' : 'Inactive',
            `"${account.description || ''}"`
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chart-of-accounts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Success",
        description: `${filteredAccounts.length} accounts exported as ${format.toUpperCase()}!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export accounts. Please try again.",
        variant: "destructive",
      });
    }
    
    setShowAccountExportDialog(false);
  };

  // Enhanced import functionality
  const handleImportAccounts = (file: File) => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Error",
            description: "File appears to be empty or invalid.",
            variant: "destructive",
          });
          return;
        }
        
        const headers = lines[0].split(',');
        const newAccounts: Account[] = [];
        const errors: string[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          
          if (values.length < 4) {
            errors.push(`Line ${i + 1}: Insufficient data`);
            continue;
          }
          
          const code = values[0]?.trim();
          const name = values[1]?.replace(/"/g, '').trim();
          const type = values[2]?.trim() as Account['type'];
          const category = values[3]?.replace(/"/g, '').trim();
          
          if (!code || !name || !type || !category) {
            errors.push(`Line ${i + 1}: Missing required fields`);
            continue;
          }
          
          if (!['asset', 'liability', 'equity', 'revenue', 'expense'].includes(type)) {
            errors.push(`Line ${i + 1}: Invalid account type`);
            continue;
          }
          
          // Check for duplicate codes
          if (accounts.some(a => a.code.toLowerCase() === code.toLowerCase()) ||
              newAccounts.some(a => a.code.toLowerCase() === code.toLowerCase())) {
            errors.push(`Line ${i + 1}: Duplicate account code`);
            continue;
          }
          
          const account: Account = {
            id: Date.now().toString() + i,
            code,
            name,
            type,
            category,
            balance: parseFloat(values[4]) || 0,
            isActive: values[5]?.trim() !== 'Inactive',
            description: values[6]?.replace(/"/g, '').trim() || ''
          };
          newAccounts.push(account);
        }
        
        if (errors.length > 0) {
          toast({
            title: "Import Warnings",
            description: `${errors.length} error(s) found. ${newAccounts.length} accounts will be imported.`,
          });
        }
        
        if (newAccounts.length > 0) {
          setAccounts([...accounts, ...newAccounts]);
          toast({
            title: "Success",
            description: `${newAccounts.length} accounts imported successfully!`,
          });
        } else {
          toast({
            title: "Error",
            description: "No valid accounts found to import.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import accounts. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read the file.",
        variant: "destructive",
      });
    };
    
    reader.readAsText(file);
    setShowAccountImportDialog(false);
  };

  // Bank Reconciliation CRUD Handlers
  const handleStartReconciliation = () => {
    if (!reconciliationForm.bankAccount || !reconciliationForm.statementDate || 
        !reconciliationForm.openingBalance || !reconciliationForm.closingBalance) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newReconciliation: BankReconciliation = {
      id: Date.now().toString(),
      reconciliationNumber: `REC-${new Date().getFullYear()}-${String(reconciliations.length + 1).padStart(3, '0')}`,
      bankAccount: reconciliationForm.bankAccount,
      statementDate: new Date(reconciliationForm.statementDate),
      openingBalance: parseFloat(reconciliationForm.openingBalance),
      closingBalance: parseFloat(reconciliationForm.closingBalance),
      bookBalance: 85000, // This would come from the actual book balance
      difference: parseFloat(reconciliationForm.closingBalance) - 85000,
      status: 'in_progress',
      createdBy: 'Current User',
      createdAt: new Date(),
      bankTransactions: [],
      unmatchedBookEntries: []
    };

    // Simulate POST request
    setReconciliations([newReconciliation, ...reconciliations]);
    setSelectedReconciliation(newReconciliation);
    
    toast({
      title: "Success",
      description: "Bank reconciliation started successfully!",
    });

    setShowReconciliationDialog(false);
    setReconciliationForm({
      bankAccount: '',
      statementDate: '',
      openingBalance: '',
      closingBalance: '',
      statementFile: null
    });
  };

  const handleImportBankStatement = (file: File) => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    // Simulate file parsing and data import
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        
        // Simple CSV parsing (Date, Description, Amount, Type)
        const importedTransactions: BankTransaction[] = [];
        
        for (let i = 1; i < lines.length; i++) { // Skip header
          const line = lines[i].trim();
          if (line) {
            const [date, description, amount, type] = line.split(',');
            if (date && description && amount && type) {
              importedTransactions.push({
                id: `imported-${Date.now()}-${i}`,
                date: new Date(date.trim()),
                description: description.trim(),
                amount: Math.abs(parseFloat(amount.trim())),
                type: type.trim().toLowerCase() as 'debit' | 'credit',
                balance: 0, // Would be calculated
                reconciled: false
              });
            }
          }
        }

        setBankTransactions([...bankTransactions, ...importedTransactions]);
        
        toast({
          title: "Success",
          description: `Imported ${importedTransactions.length} bank transactions successfully!`,
        });

        setShowImportStatementDialog(false);
      } catch (error) {
        toast({
          title: "Import Error",
          description: "Failed to parse the bank statement file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  };

  const handleMatchTransaction = (bankTransaction: BankTransaction, bookEntry: JournalEntry) => {
    // Simulate PUT request to match transactions
    const updatedBankTransactions = bankTransactions.map(bt => 
      bt.id === bankTransaction.id 
        ? { ...bt, reconciled: true, matchedEntryId: bookEntry.id }
        : bt
    );

    const updatedJournalEntries = journalEntries.map(je =>
      je.id === bookEntry.id
        ? { ...je, status: 'posted' as const }
        : je
    );

    setBankTransactions(updatedBankTransactions);
    setJournalEntries(updatedJournalEntries);

    toast({
      title: "Success",
      description: "Transactions matched successfully!",
    });

    setShowMatchDialog(false);
    setSelectedBankTransaction(null);
    setSelectedBookEntry(null);
  };

  const handleUnmatchTransaction = (bankTransaction: BankTransaction) => {
    // Simulate PUT request to unmatch transaction
    const updatedBankTransactions = bankTransactions.map(bt => 
      bt.id === bankTransaction.id 
        ? { ...bt, reconciled: false, matchedEntryId: undefined }
        : bt
    );

    setBankTransactions(updatedBankTransactions);

    toast({
      title: "Success",
      description: "Transaction unmatched successfully!",
    });
  };

  const handleCompleteReconciliation = (reconciliationId: string) => {
    const updatedReconciliations = reconciliations.map(rec => 
      rec.id === reconciliationId 
        ? { ...rec, status: 'completed' as const, completedAt: new Date() }
        : rec
    );

    setReconciliations(updatedReconciliations);

    toast({
      title: "Success",
      description: "Bank reconciliation completed successfully!",
    });
  };

  const handleDeleteReconciliation = (reconciliationId: string) => {
    // Simulate DELETE request
    setReconciliations(reconciliations.filter(rec => rec.id !== reconciliationId));

    toast({
      title: "Success",
      description: "Bank reconciliation deleted successfully!",
    });
  };

  const handleCancelReconciliation = (reconciliationId: string) => {
    const updatedReconciliations = reconciliations.map(rec => 
      rec.id === reconciliationId 
        ? { ...rec, status: 'cancelled' as const }
        : rec
    );

    setReconciliations(updatedReconciliations);

    toast({
      title: "Success",
      description: "Bank reconciliation cancelled successfully!",
    });
  };

  const getUnmatchedBankTransactions = () => {
    return bankTransactions.filter(bt => !bt.reconciled);
  };

  const getUnmatchedBookEntries = () => {
    return journalEntries.filter(je => 
      !bankTransactions.some(bt => bt.matchedEntryId === je.id)
    );
  };

  // Filter and sort accounts
  const getFilteredAccounts = () => {
    let filtered = accounts.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
                           account.code.toLowerCase().includes(accountSearchTerm.toLowerCase()) ||
                           account.category.toLowerCase().includes(accountSearchTerm.toLowerCase());
      const matchesType = accountFilterType === 'all' || account.type === accountFilterType;
      const matchesStatus = accountFilterStatus === 'all' || 
                           (accountFilterStatus === 'active' && account.isActive) ||
                           (accountFilterStatus === 'inactive' && !account.isActive);
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort accounts
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (accountSortBy) {
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'balance':
          aValue = a.balance;
          bValue = b.balance;
          break;
        default:
          aValue = a.code;
          bValue = b.code;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return accountSortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return accountSortOrder === 'asc' ? 
        (aValue as number) - (bValue as number) : 
        (bValue as number) - (aValue as number);
    });

    return filtered;
  };

  // Chart of Accounts states
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountSearchTerm, setAccountSearchTerm] = useState('');
  const [accountFilterType, setAccountFilterType] = useState<'all' | 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'>('all');
  const [accountFilterStatus, setAccountFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAccountLedgerDialog, setShowAccountLedgerDialog] = useState(false);
  const [showAccountHistoryDialog, setShowAccountHistoryDialog] = useState(false);
  const [showAccountImportDialog, setShowAccountImportDialog] = useState(false);
  const [showAccountExportDialog, setShowAccountExportDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountSortBy, setAccountSortBy] = useState<'code' | 'name' | 'type' | 'balance'>('code');
  const [accountSortOrder, setAccountSortOrder] = useState<'asc' | 'desc'>('asc');

  return (
    <DashboardLayout title="Accounting">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Accounting</h1>
            <p className="text-gray-600">Comprehensive financial management and reporting</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowJournalDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              New Journal Entry
            </Button>
            <Button variant="outline" onClick={() => setShowAccountDialog(true)}>
              <Building2 size={16} className="mr-2" />
              New Account
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
            <TabsTrigger value="journal">Journal Entries</TabsTrigger>
            <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reconciliation">Bank Reconciliation</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Assets</p>
                      <p className="text-xl font-bold">{formatCurrency(metrics.totalAssets)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Liabilities</p>
                      <p className="text-xl font-bold">{formatCurrency(metrics.totalLiabilities)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Net Income</p>
                      <p className="text-xl font-bold">{formatCurrency(metrics.netIncome)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Working Capital</p>
                      <p className="text-xl font-bold">{formatCurrency(metrics.workingCapital)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setShowJournalDialog(true)}>
                    <BookOpen size={24} />
                    <span className="mt-2 text-xs">Journal Entry</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab("reports")}>
                    <BarChart3 size={24} />
                    <span className="mt-2 text-xs">Financial Reports</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setShowPaymentDialog(true)}>
                    <CreditCard size={24} />
                    <span className="mt-2 text-xs">Process Payment</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setShowReconciliationDialog(true)}>
                    <CheckCircle size={24} />
                    <span className="mt-2 text-xs">Bank Reconciliation</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setShowQuickTransactionDialog(true)}>
                    <Shuffle size={24} />
                    <span className="mt-2 text-xs">Quick Transaction</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setShowBudgetDialog(true)}>
                    <Target size={24} />
                    <span className="mt-2 text-xs">Budget Planning</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setShowExpenseTrackingDialog(true)}>
                    <Receipt size={24} />
                    <span className="mt-2 text-xs">Expense Tracking</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setShowInvoicePaymentDialog(true)}>
                    <FileCheck size={24} />
                    <span className="mt-2 text-xs">Invoice Payment</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setShowTaxCalculatorDialog(true)}>
                    <Calculator size={24} />
                    <span className="mt-2 text-xs">Tax Calculator</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setShowAuditTrailDialog(true)}>
                    <Activity size={24} />
                    <span className="mt-2 text-xs">Audit Trail</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity with Enhanced Controls */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <p className="text-sm text-gray-600">Latest financial entries with full management</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <Search size={16} className="text-gray-500" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-48"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="posted">Posted</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="reversed">Reversed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setShowJournalDialog(true)}>
                      <Plus size={16} className="mr-2" />
                      New Entry
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setSortBy('date');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Entry #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setSortBy('amount');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setSortBy('status');
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries
                      .filter(entry => {
                        const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
                        return matchesSearch && matchesStatus;
                      })
                      .sort((a, b) => {
                        switch (sortBy) {
                          case 'date':
                            return sortOrder === 'asc' 
                              ? new Date(a.date).getTime() - new Date(b.date).getTime()
                              : new Date(b.date).getTime() - new Date(a.date).getTime();
                          case 'amount':
                            return sortOrder === 'asc' 
                              ? a.totalDebit - b.totalDebit
                              : b.totalDebit - a.totalDebit;
                          case 'status':
                            return sortOrder === 'asc' 
                              ? a.status.localeCompare(b.status)
                              : b.status.localeCompare(a.status);
                          default:
                            return 0;
                        }
                      })
                      .slice(0, 10)
                      .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.lines[0]?.accountName}</TableCell>
                        <TableCell>{formatCurrency(entry.totalDebit)}</TableCell>
                        <TableCell>
                          <Badge className={entry.status === 'posted' ? 'bg-green-100 text-green-800' : 
                                          entry.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-red-100 text-red-800'}>
                            {entry.status}
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
                              <DropdownMenuItem onClick={() => {
                                handleViewJournalDetails(entry);
                              }}>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setEditingTransaction(entry);
                                setJournalForm({
                                  date: entry.date,
                                  description: entry.description,
                                  reference: entry.reference || '',
                                  lines: entry.lines.map(line => ({
                                    accountId: line.accountId,
                                    accountCode: line.accountCode,
                                    accountName: line.accountName,
                                    description: line.description,
                                    debitAmount: line.debitAmount,
                                    creditAmount: line.creditAmount
                                  }))
                                });
                                setShowJournalDialog(true);
                              }}>
                                <Edit size={14} className="mr-2" />
                                Edit Entry
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                handlePrintJournalEntry(entry);
                              }}>
                                <Printer size={14} className="mr-2" />
                                Print Entry
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {entry.status === 'posted' && (
                                <DropdownMenuItem onClick={() => handleReverseJournalEntry(entry.id)}>
                                  <Shuffle size={14} className="mr-2" />
                                  Reverse Entry
                                </DropdownMenuItem>
                              )}
                              {entry.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handlePostJournalEntry(entry.id)}>
                                  <CheckCircle size={14} className="mr-2" />
                                  Post Entry
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this journal entry?')) {
                                    handleDeleteJournalEntry(entry.id);
                                  }
                                }}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete Entry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {Math.min(10, journalEntries.length)} of {journalEntries.length} entries
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("journal")}>
                    View All Entries
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Financial Reports</h2>
                <p className="text-gray-600">Create, manage, and schedule comprehensive financial reports</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowReportTemplateDialog(true)}>
                  <Layers size={16} className="mr-2" />
                  Templates
                </Button>
                <Button onClick={() => setShowReportDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" />
                  New Report
                </Button>
              </div>
            </div>

            {/* Report Management Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Search size={16} className="text-gray-500" />
                      <Input
                        placeholder="Search reports..."
                        value={reportSearchTerm}
                        onChange={(e) => setReportSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                    <Select value={reportFilterType} onValueChange={setReportFilterType}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Reports</SelectItem>
                        <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                        <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                        <SelectItem value="cash_flow">Cash Flow</SelectItem>
                        <SelectItem value="trial_balance">Trial Balance</SelectItem>
                        <SelectItem value="general_ledger">General Ledger</SelectItem>
                        <SelectItem value="tax_summary">Tax Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Export All
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings size={16} className="mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Report Generation */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Report Generation</CardTitle>
                <p className="text-sm text-gray-600">Generate standard reports instantly</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { type: 'balance_sheet', icon: BarChart3, title: 'Balance Sheet', color: 'blue' },
                    { type: 'profit_loss', icon: TrendingUp, title: 'Profit & Loss', color: 'green' },
                    { type: 'cash_flow', icon: Activity, title: 'Cash Flow', color: 'purple' },
                    { type: 'trial_balance', icon: Calculator, title: 'Trial Balance', color: 'red' },
                    { type: 'general_ledger', icon: BookOpen, title: 'General Ledger', color: 'orange' },
                    { type: 'tax_summary', icon: Receipt, title: 'Tax Summary', color: 'teal' }
                  ].map((reportType) => (
                    <Card 
                      key={reportType.type}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
                      onClick={() => {
                        setSelectedReportType(reportType.type as FinancialReport['type']);
                        const quickReport: FinancialReport = {
                          id: `quick-${Date.now()}`,
                          name: `${reportType.title} - ${new Date().toLocaleDateString()}`,
                          type: reportType.type as FinancialReport['type'],
                          description: `Quick generated ${reportType.title}`,
                          dateRange: {
                            from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            to: new Date()
                          },
                          parameters: {
                            accounts: [],
                            includeInactive: false,
                            groupBy: 'account',
                            comparison: 'none',
                            format: 'summary'
                          },
                          createdBy: 'Current User',
                          createdAt: new Date(),
                          status: 'active'
                        };
                        handleGenerateReport(quickReport);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <reportType.icon size={32} className={`mx-auto mb-2 text-${reportType.color}-600`} />
                        <h4 className="font-semibold text-sm">{reportType.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">Generate Now</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Reports Table with Full CRUD */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Financial Reports</CardTitle>
                    <p className="text-sm text-gray-600">Manage your custom and scheduled reports</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedReportIds.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal size={16} className="mr-2" />
                            Actions ({selectedReportIds.length})
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleBulkReportAction('generate', selectedReportIds)}>
                            <FileText size={16} className="mr-2" />
                            Generate Reports
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkReportAction('activate', selectedReportIds)}>
                            <CheckCircle size={16} className="mr-2" />
                            Activate Reports
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkReportAction('archive', selectedReportIds)}>
                            <Archive size={16} className="mr-2" />
                            Archive Reports
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkReportAction('export', selectedReportIds)}>
                            <Download size={16} className="mr-2" />
                            Export List
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${selectedReportIds.length} reports?`)) {
                                handleBulkReportAction('delete', selectedReportIds);
                              }
                            }}
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete Reports
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <Button onClick={() => setShowReportDialog(true)}>
                      <Plus size={16} className="mr-2" />
                      Create Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Enhanced Search, Filter & Sort Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search reports by name, description, or creator..."
                        value={reportSearchTerm}
                        onChange={(e) => setReportSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={reportFilterType} onValueChange={setReportFilterType}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                        <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                        <SelectItem value="cash_flow">Cash Flow</SelectItem>
                        <SelectItem value="trial_balance">Trial Balance</SelectItem>
                        <SelectItem value="general_ledger">General Ledger</SelectItem>
                        <SelectItem value="tax_summary">Tax Summary</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={reportFilterStatus} onValueChange={(value) => setReportFilterStatus(value as typeof reportFilterStatus)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReportSortOrder(reportSortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      <ArrowUpDown size={16} className="mr-2" />
                      {reportSortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectAllReports}
                          onCheckedChange={(checked) => {
                            setSelectAllReports(!!checked);
                            const filteredReports = getFilteredReports();
                            setSelectedReportIds(checked ? filteredReports.map(r => r.id) : []);
                          }}
                        />
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => setReportSortBy('name')}>
                          Report Name
                          {reportSortBy === 'name' && <ArrowUpDown size={14} className="ml-2" />}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => setReportSortBy('type')}>
                          Type
                          {reportSortBy === 'type' && <ArrowUpDown size={14} className="ml-2" />}
                        </Button>
                      </TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => setReportSortBy('lastGenerated')}>
                          Last Generated
                          {reportSortBy === 'lastGenerated' && <ArrowUpDown size={14} className="ml-2" />}
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredReports().map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedReportIds.includes(report.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedReportIds([...selectedReportIds, report.id]);
                              } else {
                                setSelectedReportIds(selectedReportIds.filter(id => id !== report.id));
                                setSelectAllReports(false);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{report.name}</p>
                            <p className="text-sm text-gray-600">{report.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {report.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {report.dateRange.from.toLocaleDateString()} - {report.dateRange.to.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {report.schedule?.enabled ? (
                            <Badge className="bg-green-100 text-green-800">
                              {report.schedule.frequency}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Manual</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {report.lastGenerated ? report.lastGenerated.toLocaleString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            report.status === 'active' ? 'bg-green-100 text-green-800' :
                            report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {report.status}
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
                              <DropdownMenuItem onClick={() => handleViewReportDetails(report)}>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleGenerateReport(report)}>
                                <FileText size={14} className="mr-2" />
                                Generate Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditReport(report)}>
                                <Edit size={14} className="mr-2" />
                                Edit Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateReport(report)}>
                                <Copy size={14} className="mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleScheduleReport(report)}>
                                <Clock size={14} className="mr-2" />
                                Schedule
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {report.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleActivateReport(report.id)}>
                                  <CheckCircle size={14} className="mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {report.status === 'active' && (
                                <DropdownMenuItem onClick={() => handleArchiveReport(report.id)}>
                                  <Archive size={14} className="mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleExportReport(report, 'pdf')}>
                                <Download size={14} className="mr-2" />
                                Export PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportReport(report, 'excel')}>
                                <Download size={14} className="mr-2" />
                                Export Excel
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportReport(report, 'csv')}>
                                <Download size={14} className="mr-2" />
                                Export CSV
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this report?')) {
                                    handleDeleteReport(report.id);
                                  }
                                }}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {getFilteredReports().length === 0 && (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">
                      {reportSearchTerm || reportFilterType !== 'all' || reportFilterStatus !== 'all' 
                        ? 'No Reports Found' 
                        : 'No Reports Created'
                      }
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {reportSearchTerm || reportFilterType !== 'all' || reportFilterStatus !== 'all'
                        ? 'Try adjusting your search or filter criteria'
                        : 'Create your first financial report to get started'
                      }
                    </p>
                    {!(reportSearchTerm || reportFilterType !== 'all' || reportFilterStatus !== 'all') && (
                      <Button onClick={() => setShowReportDialog(true)}>
                        <Plus size={16} className="mr-2" />
                        Create Report
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional tabs would be implemented here */}
          
          {/* Journal Entries Tab */}
          <TabsContent value="journal" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Journal Entries</h2>
                <p className="text-sm text-gray-600">Manage and track all financial journal entries</p>
              </div>
              <Button onClick={() => setShowJournalDialog(true)}>
                <Plus size={16} className="mr-2" />
                New Journal Entry
              </Button>
            </div>

            {/* Enhanced Search, Filter & Export Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search by entry number, description, reference, or account..."
                        value={journalSearchTerm}
                        onChange={(e) => setJournalSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={journalFilterStatus} onValueChange={(value) => setJournalFilterStatus(value as typeof journalFilterStatus)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="posted">Posted</SelectItem>
                        <SelectItem value="reversed">Reversed</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedJournalIds.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkJournalAction('export', selectedJournalIds)}
                      >
                        <Download size={16} className="mr-2" />
                        Export ({selectedJournalIds.length})
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Journal Entry Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Entries</p>
                      <p className="text-xl font-bold">{journalEntries.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Posted</p>
                      <p className="text-xl font-bold">{journalEntries.filter(e => e.status === 'posted').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Draft</p>
                      <p className="text-xl font-bold">{journalEntries.filter(e => e.status === 'draft').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shuffle size={20} className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Reversed</p>
                      <p className="text-xl font-bold">{journalEntries.filter(e => e.status === 'reversed').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Journal Entries Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Journal Entries</CardTitle>
                    <p className="text-sm text-gray-600">All financial journal entries with full CRUD operations</p>
                  </div>
                  {selectedJournalIds.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkJournalAction('post', selectedJournalIds)}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Post ({selectedJournalIds.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkJournalAction('delete', selectedJournalIds)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete ({selectedJournalIds.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectAllJournals}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectAllJournals(isChecked);
                            if (isChecked) {
                              setSelectedJournalIds(getFilteredJournalEntries().map(e => e.id));
                            } else {
                              setSelectedJournalIds([]);
                            }
                          }}
                          aria-label="Select all journal entries"
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setJournalSortBy('entry');
                          setJournalSortOrder(journalSortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Entry # {journalSortBy === 'entry' && (journalSortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setJournalSortBy('date');
                          setJournalSortOrder(journalSortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Date {journalSortBy === 'date' && (journalSortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setJournalSortBy('amount');
                          setJournalSortOrder(journalSortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Amount {journalSortBy === 'amount' && (journalSortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredJournalEntries().map((entry) => (
                      <TableRow key={entry.id} className={selectedJournalIds.includes(entry.id) ? 'bg-blue-50' : ''}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedJournalIds.includes(entry.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedJournalIds([...selectedJournalIds, entry.id]);
                              } else {
                                setSelectedJournalIds(selectedJournalIds.filter(id => id !== entry.id));
                                setSelectAllJournals(false);
                              }
                            }}
                            aria-label={`Select journal entry ${entry.entryNumber}`}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                        <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{entry.description}</div>
                            <div className="text-sm text-gray-600">{entry.lines.length} line(s)</div>
                          </div>
                        </TableCell>
                        <TableCell>{entry.reference || '-'}</TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(entry.totalDebit)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            entry.status === 'posted' ? 'bg-green-100 text-green-800' : 
                            entry.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }>
                            {entry.status}
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
                              <DropdownMenuItem onClick={() => handleViewJournalDetails(entry)}>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditJournalEntry(entry)}>
                                <Edit size={14} className="mr-2" />
                                Edit Entry
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePrintJournalEntry(entry)}>
                                <Printer size={14} className="mr-2" />
                                Print Entry
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {entry.status === 'posted' && (
                                <DropdownMenuItem onClick={() => handleReverseJournalEntry(entry.id)}>
                                  <Shuffle size={14} className="mr-2" />
                                  Reverse Entry
                                </DropdownMenuItem>
                              )}
                              {entry.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handlePostJournalEntry(entry.id)}>
                                  <CheckCircle size={14} className="mr-2" />
                                  Post Entry
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteJournalEntry(entry.id)}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete Entry
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-gray-500">
                        Showing {getFilteredJournalEntries().length} of {journalEntries.length} entries
                        {selectedJournalIds.length > 0 && ` • ${selectedJournalIds.length} selected`}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chart of Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Chart of Accounts</h2>
                <p className="text-sm text-gray-600">Manage your organization's chart of accounts</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAccountImportDialog(true)}>
                  <Upload size={16} className="mr-2" />
                  Import
                </Button>
                <Button variant="outline" onClick={() => setShowAccountExportDialog(true)}>
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
                <Button onClick={() => setShowAccountDialog(true)}>
                  <Plus size={16} className="mr-2" />
                  New Account
                </Button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search accounts by name, code, or category..."
                        value={accountSearchTerm}
                        onChange={(e) => setAccountSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={accountFilterType} onValueChange={(value) => setAccountFilterType(value as typeof accountFilterType)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Account Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="asset">Assets</SelectItem>
                        <SelectItem value="liability">Liabilities</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expenses</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={accountFilterStatus} onValueChange={(value) => setAccountFilterStatus(value as typeof accountFilterStatus)}>
                      <SelectTrigger className="w-32">
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

            {/* Accounts Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Assets</p>
                      <p className="text-xl font-bold">{accounts.filter(a => a.type === 'asset').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Liabilities</p>
                      <p className="text-xl font-bold">{accounts.filter(a => a.type === 'liability').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Wallet size={20} className="text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Equity</p>
                      <p className="text-xl font-bold">{accounts.filter(a => a.type === 'equity').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Revenue</p>
                      <p className="text-xl font-bold">{accounts.filter(a => a.type === 'revenue').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={20} className="text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Expenses</p>
                      <p className="text-xl font-bold">{accounts.filter(a => a.type === 'expense').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Accounts Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Chart of Accounts</CardTitle>
                    <p className="text-sm text-gray-600">Manage your organization's accounts</p>
                  </div>
                  {selectedAccountIds.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAccountAction('activate', selectedAccountIds)}
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Activate ({selectedAccountIds.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAccountAction('deactivate', selectedAccountIds)}
                      >
                        <AlertCircle size={16} className="mr-2" />
                        Deactivate ({selectedAccountIds.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAccountAction('delete', selectedAccountIds)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete ({selectedAccountIds.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectAllAccounts}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectAllAccounts(isChecked);
                            if (isChecked) {
                              setSelectedAccountIds(getFilteredAccounts().map(a => a.id));
                            } else {
                              setSelectedAccountIds([]);
                            }
                          }}
                          aria-label="Select all accounts"
                          className="rounded"
                        />
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setAccountSortBy('code');
                          setAccountSortOrder(accountSortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Code {accountSortBy === 'code' && (accountSortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setAccountSortBy('name');
                          setAccountSortOrder(accountSortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Account Name {accountSortBy === 'name' && (accountSortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setAccountSortBy('type');
                          setAccountSortOrder(accountSortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Type {accountSortBy === 'type' && (accountSortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setAccountSortBy('balance');
                          setAccountSortOrder(accountSortOrder === 'asc' ? 'desc' : 'asc');
                        }}
                      >
                        Balance {accountSortBy === 'balance' && (accountSortOrder === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredAccounts().map((account) => (
                      <TableRow key={account.id} className={selectedAccountIds.includes(account.id) ? 'bg-blue-50' : ''}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedAccountIds.includes(account.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccountIds([...selectedAccountIds, account.id]);
                              } else {
                                setSelectedAccountIds(selectedAccountIds.filter(id => id !== account.id));
                                setSelectAllAccounts(false);
                              }
                            }}
                            aria-label={`Select account ${account.name}`}
                            className="rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{account.name}</div>
                            {account.description && (
                              <div className="text-sm text-gray-600">{account.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {account.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{account.category}</TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(account.balance)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {account.isActive ? 'Active' : 'Inactive'}
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
                              <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                                <Edit size={14} className="mr-2" />
                                Edit Account
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewAccountLedger(account)}>
                                <Eye size={14} className="mr-2" />
                                View Ledger
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewAccountHistory(account)}>
                                <Activity size={14} className="mr-2" />
                                Account History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleToggleAccountStatus(account.id)}>
                                <Activity size={14} className="mr-2" />
                                {account.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteAccount(account.id)}
                                className="text-red-600"
                              >
                                <Trash2 size={14} className="mr-2" />
                                Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-sm text-gray-500">
                        Showing {getFilteredAccounts().length} of {accounts.length} accounts
                        {selectedAccountIds.length > 0 && ` • ${selectedAccountIds.length} selected`}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payment Management</h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowPaymentDialog(true)}>
                  <Plus size={16} className="mr-2" />
                  Process Payment
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentSettingsDialog(true)}>
                  <Settings size={16} className="mr-2" />
                  Payment Settings
                </Button>
              </div>
            </div>

            {/* Search, Filter & Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-gray-500" />
                    <Input
                      placeholder="Search payments..."
                      value={paymentSearchTerm}
                      onChange={(e) => setPaymentSearchTerm(e.target.value)}
                      className="w-80"
                    />
                  </div>
                  <Select value={paymentFilterStatus} onValueChange={(value) => setPaymentFilterStatus(value as typeof paymentFilterStatus)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={paymentFilterGateway} onValueChange={(value) => setPaymentFilterGateway(value as typeof paymentFilterGateway)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gateways</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Select value={paymentSortBy} onValueChange={(value) => setPaymentSortBy(value as typeof paymentSortBy)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="payer">Payer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentSortOrder(paymentSortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <ArrowUpDown size={14} />
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedPaymentIds.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedPaymentIds.length} payment(s) selected
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleBulkPaymentAction('complete', selectedPaymentIds)}
                    disabled={selectedPaymentIds.length === 0}
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkPaymentAction('cancel', selectedPaymentIds)}
                    disabled={selectedPaymentIds.length === 0}
                  >
                    <XCircle size={14} className="mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkPaymentAction('export', selectedPaymentIds)}
                    disabled={selectedPaymentIds.length === 0}
                  >
                    <Download size={14} className="mr-1" />
                    Export
                  </Button>
                </div>
              )}
            </div>

            {/* Payment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Payments</p>
                      <p className="text-xl font-bold">{formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-xl font-bold">{payments.filter(p => p.status === 'completed').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-xl font-bold">{payments.filter(p => p.status === 'pending').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Banknote size={20} className="text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Processing Fees</p>
                      <p className="text-xl font-bold">{formatCurrency(payments.reduce((sum, p) => sum + p.fees, 0))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Online Payment Gateway Setup */}
            <Card>
              <CardHeader>
                <CardTitle>Accept Online Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
                    <CardContent className="p-4 text-center">
                      <CreditCard size={32} className="mx-auto mb-2 text-blue-600" />
                      <h4 className="font-semibold">Stripe</h4>
                      <p className="text-sm text-gray-600 mb-4">Accept credit cards, bank transfers</p>
                      <Button variant="outline" size="sm">Configure</Button>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-dashed border-green-300 bg-green-50">
                    <CardContent className="p-4 text-center">
                      <Wallet size={32} className="mx-auto mb-2 text-green-600" />
                      <h4 className="font-semibold">PayPal</h4>
                      <p className="text-sm text-gray-600 mb-4">PayPal & digital wallets</p>
                      <Button variant="outline" size="sm">Configure</Button>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
                    <CardContent className="p-4 text-center">
                      <Building2 size={32} className="mx-auto mb-2 text-purple-600" />
                      <h4 className="font-semibold">Bank Transfer</h4>
                      <p className="text-sm text-gray-600 mb-4">Direct bank payments</p>
                      <Button variant="outline" size="sm">Configure</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Payment History ({getFilteredPayments().length} of {payments.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const csvContent = [
                          ['Payment Number', 'Date', 'Payer', 'Amount', 'Currency', 'Method', 'Gateway', 'Status', 'Fees'].join(','),
                          ...getFilteredPayments().map(payment => [
                            payment.paymentNumber,
                            payment.date.toLocaleDateString(),
                            `"${payment.payerName}"`,
                            payment.amount,
                            payment.currency,
                            payment.paymentMethod,
                            payment.gateway,
                            payment.status,
                            payment.fees
                          ].join(','))
                        ].join('\n');
                        
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      }}
                    >
                      <Download size={14} className="mr-1" />
                      Export All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectAllPayments}
                          onChange={(e) => {
                            setSelectAllPayments(e.target.checked);
                            if (e.target.checked) {
                              setSelectedPaymentIds(getFilteredPayments().map(p => p.id));
                            } else {
                              setSelectedPaymentIds([]);
                            }
                          }}
                          className="rounded"
                          aria-label="Select all payments"
                        />
                      </TableHead>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredPayments().map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedPaymentIds.includes(payment.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPaymentIds([...selectedPaymentIds, payment.id]);
                              } else {
                                setSelectedPaymentIds(selectedPaymentIds.filter(id => id !== payment.id));
                              }
                            }}
                            className="rounded"
                            aria-label={`Select payment ${payment.paymentNumber}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                        <TableCell>{payment.date.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.payerName}</div>
                            <div className="text-sm text-gray-500">{payment.payerEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount, payment.currency)}</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(payment.fees, payment.currency)}</TableCell>
                        <TableCell className="font-medium text-green-600">{formatCurrency(payment.netAmount, payment.currency)}</TableCell>
                        <TableCell className="capitalize">{payment.paymentMethod.replace('_', ' ')}</TableCell>
                        <TableCell className="capitalize">{payment.gateway}</TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status}
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
                              <DropdownMenuItem onClick={() => handleViewPaymentDetails(payment)}>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEditPayment(payment)}
                                disabled={payment.status === 'completed' || payment.status === 'refunded'}
                              >
                                <Edit size={14} className="mr-2" />
                                Edit Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendReceipt(payment)}>
                                <Receipt size={14} className="mr-2" />
                                Send Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRefundPayment(payment)}
                                disabled={payment.status !== 'completed'}
                              >
                                <Repeat size={14} className="mr-2" />
                                Refund
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (payment.status === 'pending') {
                                    const updatedPayments = payments.map(p => 
                                      p.id === payment.id ? { ...p, status: 'completed' as const } : p
                                    );
                                    setPayments(updatedPayments);
                                    toast({
                                      title: "Success",
                                      description: "Payment marked as completed!",
                                    });
                                  }
                                }}
                                disabled={payment.status !== 'pending'}
                              >
                                <CheckCircle size={14} className="mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {getFilteredPayments().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No payments found matching your criteria.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Reconciliation Tab */}
          <TabsContent value="reconciliation" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bank Reconciliation</h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowReconciliationDialog(true)}>
                  <Plus size={16} className="mr-2" />
                  Start Reconciliation
                </Button>
                <Button variant="outline" onClick={() => setShowImportStatementDialog(true)}>
                  <Upload size={16} className="mr-2" />
                  Import Bank Statement
                </Button>
              </div>
            </div>

            {/* Reconciliation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Banknote size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Bank Balance</p>
                      <p className="text-xl font-bold">{formatCurrency(selectedReconciliation?.closingBalance || 87500)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Book Balance</p>
                      <p className="text-xl font-bold">{formatCurrency(selectedReconciliation?.bookBalance || 85000)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className={`text-${selectedReconciliation?.difference === 0 ? 'green' : 'red'}-600`} />
                    <div>
                      <p className="text-sm text-gray-600">Difference</p>
                      <p className="text-xl font-bold">{formatCurrency(selectedReconciliation?.difference || 2500)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Unreconciled Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Unmatched Bank Transactions ({getUnmatchedBankTransactions().length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getUnmatchedBankTransactions().length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No unmatched bank transactions
                      </div>
                    ) : (
                      getUnmatchedBankTransactions().map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-600">{transaction.date.toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedBankTransaction(transaction);
                                setShowMatchDialog(true);
                              }}
                            >
                              Match
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unmatched Book Entries ({getUnmatchedBookEntries().length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getUnmatchedBookEntries().length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No unmatched book entries
                      </div>
                    ) : (
                      getUnmatchedBookEntries().map((entry) => (
                        <div key={entry.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{entry.description}</p>
                            <p className="text-sm text-gray-600">{entry.date.toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${entry.totalDebit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {entry.totalDebit > 0 ? '-' : '+'}{formatCurrency(entry.totalDebit || entry.totalCredit)}
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedBookEntry(entry);
                                setShowMatchDialog(true);
                              }}
                            >
                              Match
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reconciliation History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Reconciliation History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reconciliation #</TableHead>
                      <TableHead>Bank Account</TableHead>
                      <TableHead>Statement Date</TableHead>
                      <TableHead>Bank Balance</TableHead>
                      <TableHead>Book Balance</TableHead>
                      <TableHead>Difference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reconciliations.map((reconciliation) => (
                      <TableRow key={reconciliation.id}>
                        <TableCell className="font-medium">{reconciliation.reconciliationNumber}</TableCell>
                        <TableCell>{reconciliation.bankAccount}</TableCell>
                        <TableCell>{reconciliation.statementDate.toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(reconciliation.closingBalance)}</TableCell>
                        <TableCell>{formatCurrency(reconciliation.bookBalance)}</TableCell>
                        <TableCell className={reconciliation.difference === 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(reconciliation.difference)}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            reconciliation.status === 'completed' ? 'bg-green-100 text-green-800' :
                            reconciliation.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {reconciliation.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem 
                                onClick={() => setSelectedReconciliation(reconciliation)}
                              >
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {reconciliation.status === 'in_progress' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleCompleteReconciliation(reconciliation.id)}
                                  >
                                    <CheckCircle size={14} className="mr-2" />
                                    Mark Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleCancelReconciliation(reconciliation.id)}
                                  >
                                    <XCircle size={14} className="mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteReconciliation(reconciliation.id)}
                                className="text-red-600"
                              >
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
                {reconciliations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No bank reconciliations found. Start your first reconciliation above.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Reconciliation Details */}
            {selectedReconciliation && (
              <Card>
                <CardHeader>
                  <CardTitle>Reconciliation Details - {selectedReconciliation.reconciliationNumber}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matched Transactions */}
                    <div>
                      <h3 className="font-medium mb-3">Matched Transactions</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {bankTransactions.filter(bt => bt.reconciled).map((transaction) => (
                          <div key={transaction.id} className="flex justify-between items-center p-2 bg-green-50 border border-green-200 rounded">
                            <div>
                              <p className="font-medium text-sm">{transaction.description}</p>
                              <p className="text-xs text-gray-600">{transaction.date.toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-sm ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </p>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUnmatchTransaction(transaction)}
                              >
                                Unmatch
                              </Button>
                            </div>
                          </div>
                        ))}
                        {bankTransactions.filter(bt => bt.reconciled).length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            No matched transactions yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reconciliation Summary */}
                    <div>
                      <h3 className="font-medium mb-3">Reconciliation Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Bank Opening Balance:</span>
                          <span className="font-medium">{formatCurrency(selectedReconciliation.openingBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bank Closing Balance:</span>
                          <span className="font-medium">{formatCurrency(selectedReconciliation.closingBalance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Book Balance:</span>
                          <span className="font-medium">{formatCurrency(selectedReconciliation.bookBalance)}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between">
                            <span className="font-medium">Difference:</span>
                            <span className={`font-bold ${selectedReconciliation.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(selectedReconciliation.difference)}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Matched Items:</span>
                          <span className="font-medium">{bankTransactions.filter(bt => bt.reconciled).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unmatched Items:</span>
                          <span className="font-medium">{getUnmatchedBankTransactions().length}</span>
                        </div>
                        {selectedReconciliation.status === 'in_progress' && selectedReconciliation.difference === 0 && (
                          <Button 
                            className="w-full mt-4"
                            onClick={() => handleCompleteReconciliation(selectedReconciliation.id)}
                          >
                            Complete Reconciliation
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
        </Tabs>

        {/* Dialogs */}
        {/* New/Edit Account Dialog */}
        <Dialog open={showAccountDialog} onOpenChange={(open) => {
          setShowAccountDialog(open);
          if (!open) {
            setEditingAccount(null);
            setAccountForm({
              code: '',
              name: '',
              type: 'asset',
              category: '',
              parentId: '',
              description: ''
            });
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? 'Edit Account' : 'Create New Account'}</DialogTitle>
              <DialogDescription>
                {editingAccount ? 'Update the account details below' : 'Create a new account by filling in the required information'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Account Code</Label>
                  <Input
                    value={accountForm.code}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g., 1000"
                  />
                </div>
                <div>
                  <Label>Account Type</Label>
                  <Select 
                    value={accountForm.type} 
                    onValueChange={(value: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense') => setAccountForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asset">Asset</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Account Name</Label>
                <Input
                  value={accountForm.name}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter account name"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  value={accountForm.category}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Current Assets"
                />
              </div>
              <div>
                <Label>Parent Account (Optional)</Label>
                <Select 
                  value={accountForm.parentId} 
                  onValueChange={(value) => setAccountForm(prev => ({ ...prev, parentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {accounts.filter(a => a.id !== editingAccount?.id).map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={accountForm.description}
                  onChange={(e) => setAccountForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAccountDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAccount}>
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New/Edit Journal Entry Dialog */}
        <Dialog open={showJournalDialog} onOpenChange={(open) => {
          setShowJournalDialog(open);
          if (!open) {
            setEditingTransaction(null);
            setJournalForm({
              date: new Date(),
              description: '',
              reference: '',
              lines: []
            });
          }
        }}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? 'Edit Journal Entry' : 'Create Journal Entry'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={journalForm.date.toISOString().split('T')[0]}
                    onChange={(e) => setJournalForm(prev => ({ ...prev, date: new Date(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Reference</Label>
                  <Input
                    value={journalForm.reference}
                    onChange={(e) => setJournalForm(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Optional reference"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={journalForm.description}
                    onChange={(e) => setJournalForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Entry description"
                  />
                </div>
              </div>

              {/* Journal Entry Lines */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Journal Entry Lines</Label>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      const newLine = {
                        accountId: '',
                        accountCode: '',
                        accountName: '',
                        description: '',
                        debitAmount: 0,
                        creditAmount: 0
                      };
                      setJournalForm(prev => ({ ...prev, lines: [...prev.lines, newLine] }));
                    }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Line
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalForm.lines.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Select 
                            value={line.accountId}
                            onValueChange={(value) => {
                              const account = accounts.find(a => a.id === value);
                              const newLines = [...journalForm.lines];
                              newLines[index] = {
                                ...line,
                                accountId: value,
                                accountCode: account?.code || '',
                                accountName: account?.name || ''
                              };
                              setJournalForm(prev => ({ ...prev, lines: newLines }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.code} - {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.description}
                            onChange={(e) => {
                              const newLines = [...journalForm.lines];
                              newLines[index].description = e.target.value;
                              setJournalForm(prev => ({ ...prev, lines: newLines }));
                            }}
                            placeholder="Line description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={line.debitAmount || ''}
                            onChange={(e) => {
                              const newLines = [...journalForm.lines];
                              newLines[index].debitAmount = parseFloat(e.target.value) || 0;
                              newLines[index].creditAmount = 0; // Clear credit when debit is entered
                              setJournalForm(prev => ({ ...prev, lines: newLines }));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={line.creditAmount || ''}
                            onChange={(e) => {
                              const newLines = [...journalForm.lines];
                              newLines[index].creditAmount = parseFloat(e.target.value) || 0;
                              newLines[index].debitAmount = 0; // Clear debit when credit is entered
                              setJournalForm(prev => ({ ...prev, lines: newLines }));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const newLines = journalForm.lines.filter((_, i) => i !== index);
                              setJournalForm(prev => ({ ...prev, lines: newLines }));
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Totals */}
                <div className="flex justify-end mt-4 space-x-8">
                  <div>
                    <strong>Total Debits: {formatCurrency(journalForm.lines.reduce((sum, line) => sum + line.debitAmount, 0))}</strong>
                  </div>
                  <div>
                    <strong>Total Credits: {formatCurrency(journalForm.lines.reduce((sum, line) => sum + line.creditAmount, 0))}</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowJournalDialog(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleSaveJournalEntry}>
                  {editingTransaction ? 'Update Entry' : 'Save as Draft'}
                </Button>
                <Button onClick={() => {
                  handleSaveJournalEntry();
                  // If creating new, also post it
                  if (!editingTransaction) {
                    setTimeout(() => {
                      const latestEntry = journalEntries[journalEntries.length - 1];
                      if (latestEntry) {
                        handlePostJournalEntry(latestEntry.id);
                      }
                    }, 100);
                  }
                }}>
                  {editingTransaction ? 'Update & Post' : 'Post Entry'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Transaction Dialog */}
        <Dialog open={showQuickTransactionDialog} onOpenChange={setShowQuickTransactionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quick Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Transaction Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input placeholder="Transaction description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Account</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Account</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowQuickTransactionDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Success",
                    description: "Quick transaction created successfully!",
                  });
                  setShowQuickTransactionDialog(false);
                }}>Create Transaction</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Budget Planning Dialog */}
        <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Budget Planning & Analysis</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Budget Period Selection */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Budget Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>

              {/* Budget Categories */}
              <div>
                <h3 className="font-semibold mb-4">Budget Allocation</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Budget Amount</TableHead>
                      <TableHead>Actual Spent</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Office Expenses</TableCell>
                      <TableCell>
                        <Input type="number" placeholder="5000.00" className="w-32" />
                      </TableCell>
                      <TableCell className="text-red-600">{formatCurrency(3200)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(1800)}</TableCell>
                      <TableCell className="text-green-600">64%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Professional Services</TableCell>
                      <TableCell>
                        <Input type="number" placeholder="10000.00" className="w-32" />
                      </TableCell>
                      <TableCell className="text-red-600">{formatCurrency(12000)}</TableCell>
                      <TableCell className="text-red-600">-{formatCurrency(2000)}</TableCell>
                      <TableCell className="text-red-600">120%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Marketing</TableCell>
                      <TableCell>
                        <Input type="number" placeholder="3000.00" className="w-32" />
                      </TableCell>
                      <TableCell className="text-red-600">{formatCurrency(2100)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(900)}</TableCell>
                      <TableCell className="text-green-600">70%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>Cancel</Button>
                <Button variant="outline">Save Draft</Button>
                <Button onClick={() => {
                  toast({
                    title: "Success",
                    description: "Budget plan saved successfully!",
                  });
                  setShowBudgetDialog(false);
                }}>Save Budget</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Expense Tracking Dialog */}
        <Dialog open={showExpenseTrackingDialog} onOpenChange={setShowExpenseTrackingDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Advanced Expense Tracking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expense Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel">Travel & Transport</SelectItem>
                      <SelectItem value="meals">Meals & Entertainment</SelectItem>
                      <SelectItem value="office">Office Supplies</SelectItem>
                      <SelectItem value="professional">Professional Services</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expense Amount</Label>
                  <Input type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor/Supplier</Label>
                  <Input placeholder="Vendor name" />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Expense Description</Label>
                <Textarea placeholder="Detailed description of the expense..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expense Date</Label>
                  <Input type="date" />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="billable" />
                  <Label htmlFor="billable">Billable to Client</Label>
                </div>
              </div>

              <div>
                <Label>Receipt Upload</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600">Drag & drop receipt or click to browse</p>
                  <Input type="file" className="hidden" />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExpenseTrackingDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Success",
                    description: "Expense recorded successfully!",
                  });
                  setShowExpenseTrackingDialog(false);
                }}>Record Expense</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoice Payment Dialog */}
        <Dialog open={showInvoicePaymentDialog} onOpenChange={setShowInvoicePaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Invoice Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Invoice</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose invoice to pay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inv-001">INV-2024-001 - ABC Corp - {formatCurrency(2500)}</SelectItem>
                    <SelectItem value="inv-002">INV-2024-002 - XYZ Ltd - {formatCurrency(4200)}</SelectItem>
                    <SelectItem value="inv-003">INV-2024-003 - DEF Inc - {formatCurrency(1800)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Amount</Label>
                  <Input type="number" step="0.01" placeholder="Payment amount" />
                </div>
                <div>
                  <Label>Payment Date</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bank Account</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Business Account</SelectItem>
                      <SelectItem value="savings">Business Savings</SelectItem>
                      <SelectItem value="petty">Petty Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Payment Notes</Label>
                <Textarea placeholder="Additional payment notes..." />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Payment Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Invoice Amount:</span>
                    <span>{formatCurrency(2500)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Payments:</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding Balance:</span>
                    <span className="font-semibold">{formatCurrency(2500)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInvoicePaymentDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Success",
                    description: "Payment processed successfully!",
                  });
                  setShowInvoicePaymentDialog(false);
                }}>Process Payment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tax Calculator Dialog */}
        <Dialog open={showTaxCalculatorDialog} onOpenChange={setShowTaxCalculatorDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tax Calculator & Planning</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tax Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q1-2024">Q1 2024</SelectItem>
                      <SelectItem value="q2-2024">Q2 2024</SelectItem>
                      <SelectItem value="q3-2024">Q3 2024</SelectItem>
                      <SelectItem value="q4-2024">Q4 2024</SelectItem>
                      <SelectItem value="annual-2024">Annual 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tax Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vat">VAT (15%)</SelectItem>
                      <SelectItem value="income">Income Tax</SelectItem>
                      <SelectItem value="provisional">Provisional Tax</SelectItem>
                      <SelectItem value="uif">UIF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">VAT Calculation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Sales (VAT Inclusive)</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Total Purchases (VAT Inclusive)</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Output VAT (Sales):</span>
                    <span className="font-semibold">{formatCurrency(18750)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Input VAT (Purchases):</span>
                    <span className="font-semibold">{formatCurrency(3250)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">VAT Payable:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(15500)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Income Tax Estimate</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Taxable Income</Label>
                    <Input type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Tax Rate</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="28">28% (Companies)</SelectItem>
                        <SelectItem value="18">18% (0-226,000)</SelectItem>
                        <SelectItem value="26">26% (226,001-353,100)</SelectItem>
                        <SelectItem value="31">31% (353,101-488,700)</SelectItem>
                        <SelectItem value="36">36% (488,701-641,400)</SelectItem>
                        <SelectItem value="39">39% (641,401-817,600)</SelectItem>
                        <SelectItem value="41">41% (817,601-1,731,600)</SelectItem>
                        <SelectItem value="45">45% (1,731,601+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Estimated Tax:</span>
                    <span className="font-bold text-green-600">{formatCurrency(42000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provisional Payments Made:</span>
                    <span>{formatCurrency(38000)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Balance Due:</span>
                    <span className="font-bold text-red-600">{formatCurrency(4000)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowTaxCalculatorDialog(false)}>Close</Button>
                <Button variant="outline">Export Report</Button>
                <Button onClick={() => {
                  toast({
                    title: "Success",
                    description: "Tax calculation saved successfully!",
                  });
                  setShowTaxCalculatorDialog(false);
                }}>Save Calculation</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Audit Trail Dialog */}
        <Dialog open={showAuditTrailDialog} onOpenChange={setShowAuditTrailDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Financial Audit Trail</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Date Range</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>To</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>User</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="john">John Doe</SelectItem>
                      <SelectItem value="jane">Jane Smith</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Action Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="post">Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Record Type</TableHead>
                    <TableHead>Record ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{new Date().toLocaleString()}</TableCell>
                    <TableCell>John Doe</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">Created</Badge>
                    </TableCell>
                    <TableCell>Journal Entry</TableCell>
                    <TableCell>JE-2024-001</TableCell>
                    <TableCell>Client payment received - {formatCurrency(5000)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{new Date(Date.now() - 3600000).toLocaleString()}</TableCell>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">Modified</Badge>
                    </TableCell>
                    <TableCell>Account</TableCell>
                    <TableCell>1000</TableCell>
                    <TableCell>Updated account balance</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{new Date(Date.now() - 7200000).toLocaleString()}</TableCell>
                    <TableCell>John Doe</TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-800">Posted</Badge>
                    </TableCell>
                    <TableCell>Journal Entry</TableCell>
                    <TableCell>JE-2024-002</TableCell>
                    <TableCell>Monthly office rent payment</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Showing 3 of 157 audit entries</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAuditTrailDialog(false)}>Close</Button>
                  <Button variant="outline">
                    <Download size={16} className="mr-2" />
                    Export Audit Log
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Financial Reports Dialogs */}
        
        {/* Create/Edit Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingReport ? 'Edit Report' : 'Create New Financial Report'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Report Name</Label>
                  <Input
                    value={reportForm.name}
                    onChange={(e) => setReportForm({...reportForm, name: e.target.value})}
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <Label>Report Type</Label>
                  <Select value={reportForm.type} onValueChange={(value) => setReportForm({...reportForm, type: value as FinancialReport['type']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                      <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                      <SelectItem value="cash_flow">Cash Flow Statement</SelectItem>
                      <SelectItem value="trial_balance">Trial Balance</SelectItem>
                      <SelectItem value="general_ledger">General Ledger</SelectItem>
                      <SelectItem value="tax_summary">Tax Summary</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  placeholder="Enter report description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-from-date">From Date</Label>
                  <input
                    id="report-from-date"
                    type="date"
                    aria-label="Report start date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={reportForm.dateRange.from.toISOString().split('T')[0]}
                    onChange={(e) => setReportForm({
                      ...reportForm,
                      dateRange: { ...reportForm.dateRange, from: new Date(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="report-to-date">To Date</Label>
                  <input
                    id="report-to-date"
                    type="date"
                    aria-label="Report end date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={reportForm.dateRange.to.toISOString().split('T')[0]}
                    onChange={(e) => setReportForm({
                      ...reportForm,
                      dateRange: { ...reportForm.dateRange, to: new Date(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Report Parameters</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Group By</Label>
                    <Select value={reportForm.parameters.groupBy} onValueChange={(value) => setReportForm({
                      ...reportForm,
                      parameters: { ...reportForm.parameters, groupBy: value as any }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="quarter">Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Format</Label>
                    <Select value={reportForm.parameters.format} onValueChange={(value) => setReportForm({
                      ...reportForm,
                      parameters: { ...reportForm.parameters, format: value as any }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Comparison</Label>
                    <Select value={reportForm.parameters.comparison} onValueChange={(value) => setReportForm({
                      ...reportForm,
                      parameters: { ...reportForm.parameters, comparison: value as any }
                    })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="previous_period">Previous Period</SelectItem>
                        <SelectItem value="previous_year">Previous Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="includeInactive"
                      checked={reportForm.parameters.includeInactive}
                      onChange={(e) => setReportForm({
                        ...reportForm,
                        parameters: { ...reportForm.parameters, includeInactive: e.target.checked }
                      })}
                      className="rounded"
                      aria-label="Include inactive accounts in report"
                    />
                    <Label htmlFor="includeInactive">Include Inactive Accounts</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enableSchedule"
                    checked={reportForm.schedule.enabled}
                    onChange={(e) => setReportForm({
                      ...reportForm,
                      schedule: { ...reportForm.schedule, enabled: e.target.checked }
                    })}
                    className="rounded"
                    aria-label="Enable automatic report scheduling"
                  />
                  <Label htmlFor="enableSchedule" className="font-semibold">Enable Scheduling</Label>
                </div>

                {reportForm.schedule.enabled && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <Label>Frequency</Label>
                      <Select value={reportForm.schedule.frequency} onValueChange={(value) => setReportForm({
                        ...reportForm,
                        schedule: { ...reportForm.schedule, frequency: value as any }
                      })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Email Recipients</Label>
                      <Input
                        placeholder="email1@example.com, email2@example.com"
                        value={reportForm.schedule.recipients.join(', ')}
                        onChange={(e) => setReportForm({
                          ...reportForm,
                          schedule: { 
                            ...reportForm.schedule, 
                            recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                          }
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
                <Button variant="outline" onClick={() => {
                  // Preview report with current settings
                  const previewReport: FinancialReport = {
                    id: 'preview',
                    ...reportForm,
                    createdBy: 'Current User',
                    createdAt: new Date(),
                    status: 'draft'
                  };
                  handleGenerateReport(previewReport);
                }}>
                  <Eye size={16} className="mr-2" />
                  Preview
                </Button>
                <Button onClick={handleSaveReport}>
                  {editingReport ? 'Update Report' : 'Create Report'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Schedule Dialog */}
        <Dialog open={showReportScheduleDialog} onOpenChange={setShowReportScheduleDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Report: {editingReport?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="scheduleEnabled"
                  checked={reportForm.schedule.enabled}
                  onChange={(e) => setReportForm({
                    ...reportForm,
                    schedule: { ...reportForm.schedule, enabled: e.target.checked }
                  })}
                  className="rounded"
                  aria-label="Enable automatic report generation"
                />
                <Label htmlFor="scheduleEnabled" className="font-semibold">Enable Automatic Generation</Label>
              </div>

              {reportForm.schedule.enabled && (
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Frequency</Label>
                      <Select value={reportForm.schedule.frequency} onValueChange={(value) => setReportForm({
                        ...reportForm,
                        schedule: { ...reportForm.schedule, frequency: value as any }
                      })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly (Mondays)</SelectItem>
                          <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
                          <SelectItem value="quarterly">Quarterly (1st of quarter)</SelectItem>
                          <SelectItem value="annually">Annually (1st of year)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Next Run</Label>
                      <Input
                        value={
                          reportForm.schedule.frequency === 'daily' ? 'Tomorrow' :
                          reportForm.schedule.frequency === 'weekly' ? 'Next Monday' :
                          reportForm.schedule.frequency === 'monthly' ? 'Next 1st' :
                          reportForm.schedule.frequency === 'quarterly' ? 'Next Quarter' :
                          'Next Year'
                        }
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Email Recipients</Label>
                    <Textarea
                      placeholder="Enter email addresses separated by commas"
                      value={reportForm.schedule.recipients.join(', ')}
                      onChange={(e) => setReportForm({
                        ...reportForm,
                        schedule: { 
                          ...reportForm.schedule, 
                          recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                        }
                      })}
                      rows={3}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Recipients will receive the report automatically via email
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-2">Email Template Preview</h4>
                    <div className="text-sm text-gray-600">
                      <p><strong>Subject:</strong> Scheduled Report: {editingReport?.name}</p>
                      <p><strong>Body:</strong> Your scheduled financial report is attached. Generated on [date] for period [period].</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReportScheduleDialog(false)}>Cancel</Button>
                <Button onClick={() => {
                  // Update the report with schedule settings
                  if (editingReport) {
                    const updatedReports = reports.map(report => 
                      report.id === editingReport.id 
                        ? { ...report, schedule: reportForm.schedule.enabled ? reportForm.schedule : undefined }
                        : report
                    );
                    setReports(updatedReports);
                    toast({
                      title: "Success",
                      description: reportForm.schedule.enabled ? "Report scheduling enabled!" : "Report scheduling disabled!",
                    });
                  }
                  setShowReportScheduleDialog(false);
                }}>
                  Save Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Preview Dialog */}
        <Dialog open={showReportPreviewDialog} onOpenChange={setShowReportPreviewDialog}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText size={20} />
                Report Preview: {generatedReportData?.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {generatedReportData && (
                <div className="bg-white border rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">{generatedReportData.title}</h2>
                    <p className="text-gray-600">{generatedReportData.period}</p>
                    <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                  </div>

                  {/* Balance Sheet Preview */}
                  {generatedReportData.title === 'Balance Sheet' && (
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h3 className="font-bold text-lg mb-4 border-b pb-2">ASSETS</h3>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Current Assets</h4>
                          {generatedReportData.sections.assets
                            .filter((a: any) => a.category === 'Current Assets')
                            .map((asset: any) => (
                            <div key={asset.id} className="flex justify-between pl-4">
                              <span>{asset.name}</span>
                              <span>{formatCurrency(asset.balance)}</span>
                            </div>
                          ))}
                          <h4 className="font-semibold mt-4">Fixed Assets</h4>
                          {generatedReportData.sections.assets
                            .filter((a: any) => a.category === 'Fixed Assets')
                            .map((asset: any) => (
                            <div key={asset.id} className="flex justify-between pl-4">
                              <span>{asset.name}</span>
                              <span>{formatCurrency(asset.balance)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 font-bold flex justify-between">
                            <span>TOTAL ASSETS</span>
                            <span>{formatCurrency(generatedReportData.totals.totalAssets)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-4 border-b pb-2">LIABILITIES & EQUITY</h3>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Liabilities</h4>
                          {generatedReportData.sections.liabilities.map((liability: any) => (
                            <div key={liability.id} className="flex justify-between pl-4">
                              <span>{liability.name}</span>
                              <span>{formatCurrency(liability.balance)}</span>
                            </div>
                          ))}
                          <h4 className="font-semibold mt-4">Equity</h4>
                          {generatedReportData.sections.equity.map((equity: any) => (
                            <div key={equity.id} className="flex justify-between pl-4">
                              <span>{equity.name}</span>
                              <span>{formatCurrency(equity.balance)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-2 font-bold flex justify-between">
                            <span>TOTAL LIABILITIES & EQUITY</span>
                            <span>{formatCurrency(generatedReportData.totals.totalLiabilities + generatedReportData.totals.totalEquity)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Profit & Loss Preview */}
                  {generatedReportData.title === 'Profit & Loss Statement' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-bold text-lg mb-4 border-b pb-2">REVENUE</h3>
                        {generatedReportData.sections.revenue.map((revenue: any) => (
                          <div key={revenue.id} className="flex justify-between pl-4">
                            <span>{revenue.name}</span>
                            <span>{formatCurrency(revenue.balance)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 font-semibold flex justify-between">
                          <span>Total Revenue</span>
                          <span>{formatCurrency(generatedReportData.totals.totalRevenue)}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-4 border-b pb-2">EXPENSES</h3>
                        {generatedReportData.sections.expenses.map((expense: any) => (
                          <div key={expense.id} className="flex justify-between pl-4">
                            <span>{expense.name}</span>
                            <span>{formatCurrency(expense.balance)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 font-semibold flex justify-between">
                          <span>Total Expenses</span>
                          <span>{formatCurrency(generatedReportData.totals.totalExpenses)}</span>
                        </div>
                      </div>
                      <div className="border-t-2 pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>NET INCOME</span>
                          <span className={generatedReportData.totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(generatedReportData.totals.netIncome)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trial Balance Preview */}
                  {generatedReportData.title === 'Trial Balance' && (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Account Code</TableHead>
                            <TableHead>Account Name</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {generatedReportData.accounts.slice(0, 10).map((account: any) => (
                            <TableRow key={account.id}>
                              <TableCell>{account.code}</TableCell>
                              <TableCell>{account.name}</TableCell>
                              <TableCell className="text-right">
                                {account.debitBalance > 0 ? formatCurrency(account.debitBalance) : '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {account.creditBalance > 0 ? formatCurrency(account.creditBalance) : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={2} className="font-bold">TOTALS</TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(generatedReportData.totals.totalDebits)}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(generatedReportData.totals.totalCredits)}
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Report generated successfully • {new Date().toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowReportPreviewDialog(false)}>Close</Button>
                  <Button variant="outline" onClick={() => handleExportReport(editingReport || {} as FinancialReport, 'pdf')}>
                    <Download size={16} className="mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" onClick={() => handleExportReport(editingReport || {} as FinancialReport, 'excel')}>
                    <Download size={16} className="mr-2" />
                    Export Excel
                  </Button>
                  <Button onClick={() => {
                    toast({
                      title: "Success",
                      description: "Report has been emailed to recipients!",
                    });
                    setShowReportPreviewDialog(false);
                  }}>
                    <Mail size={16} className="mr-2" />
                    Email Report
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Templates Dialog */}
        <Dialog open={showReportTemplateDialog} onOpenChange={setShowReportTemplateDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Report Templates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">Choose from pre-built templates or create custom reports</p>
                <Button variant="outline" size="sm">
                  <Plus size={16} className="mr-2" />
                  Create Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: 'template-1',
                    name: 'Monthly Financial Summary',
                    type: 'balance_sheet',
                    description: 'Complete monthly overview with balance sheet, P&L, and cash flow',
                    isSystem: true,
                    icon: BarChart3,
                    color: 'blue'
                  },
                  {
                    id: 'template-2',
                    name: 'Quarterly Business Review',
                    type: 'profit_loss',
                    description: 'Quarterly performance analysis with comparative data',
                    isSystem: true,
                    icon: TrendingUp,
                    color: 'green'
                  },
                  {
                    id: 'template-3',
                    name: 'Annual Tax Preparation',
                    type: 'tax_summary',
                    description: 'Comprehensive tax summary for annual filing',
                    isSystem: true,
                    icon: Receipt,
                    color: 'red'
                  },
                  {
                    id: 'template-4',
                    name: 'Cash Flow Analysis',
                    type: 'cash_flow',
                    description: 'Detailed cash flow tracking and forecasting',
                    isSystem: true,
                    icon: Activity,
                    color: 'purple'
                  },
                  {
                    id: 'template-5',
                    name: 'Account Reconciliation',
                    type: 'trial_balance',
                    description: 'Monthly account reconciliation and trial balance',
                    isSystem: true,
                    icon: Calculator,
                    color: 'orange'
                  },
                  {
                    id: 'template-6',
                    name: 'Custom Management Report',
                    type: 'custom',
                    description: 'Customizable report for specific management needs',
                    isSystem: false,
                    icon: FileText,
                    color: 'gray'
                  }
                ].map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <template.icon size={32} className={`text-${template.color}-600`} />
                        {template.isSystem && (
                          <Badge variant="outline" className="text-xs">System</Badge>
                        )}
                      </div>
                      <h4 className="font-semibold mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            // Use template to create new report
                            setReportForm({
                              name: `${template.name} - ${new Date().toLocaleDateString()}`,
                              type: template.type as FinancialReport['type'],
                              description: template.description,
                              dateRange: {
                                from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                to: new Date()
                              },
                              parameters: {
                                accounts: [],
                                includeInactive: false,
                                groupBy: 'account',
                                comparison: template.type === 'profit_loss' ? 'previous_period' : 'none',
                                format: 'summary'
                              },
                              schedule: {
                                enabled: false,
                                frequency: 'monthly',
                                recipients: []
                              }
                            });
                            setShowReportTemplateDialog(false);
                            setShowReportDialog(true);
                          }}
                        >
                          Use Template
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowReportTemplateDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Report Details Dialog */}
        <Dialog open={showReportDetailsDialog} onOpenChange={setShowReportDetailsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText size={20} />
                Report Details: {selectedReport?.name}
              </DialogTitle>
              <DialogDescription>
                View comprehensive information about this financial report
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">Report Name</Label>
                        <p className="font-medium">{selectedReport.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Type</Label>
                        <Badge variant="outline">
                          {selectedReport.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Description</Label>
                        <p className="text-sm text-gray-600">{selectedReport.description}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Status</Label>
                        <Badge className={
                          selectedReport.status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedReport.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {selectedReport.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Date & Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-xs text-gray-500">Date Range</Label>
                        <p className="text-sm">
                          {selectedReport.dateRange.from.toLocaleDateString()} - {selectedReport.dateRange.to.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Created</Label>
                        <p className="text-sm">
                          {selectedReport.createdAt.toLocaleDateString()} by {selectedReport.createdBy}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Last Generated</Label>
                        <p className="text-sm">
                          {selectedReport.lastGenerated ? selectedReport.lastGenerated.toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Report Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Group By</Label>
                        <p className="text-sm font-medium capitalize">{selectedReport.parameters.groupBy}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Format</Label>
                        <p className="text-sm font-medium capitalize">{selectedReport.parameters.format}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Comparison</Label>
                        <p className="text-sm font-medium">
                          {selectedReport.parameters.comparison === 'none' ? 'None' :
                           selectedReport.parameters.comparison === 'previous_period' ? 'Previous Period' :
                           'Previous Year'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Include Inactive</Label>
                        <p className="text-sm font-medium">
                          {selectedReport.parameters.includeInactive ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule Information */}
                {selectedReport.schedule?.enabled && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Schedule Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Frequency</Label>
                          <Badge className="bg-green-100 text-green-800">
                            {selectedReport.schedule.frequency}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Next Run</Label>
                          <p className="text-sm">
                            {selectedReport.schedule.nextRun ? selectedReport.schedule.nextRun.toLocaleDateString() : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label className="text-xs text-gray-500">Recipients</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedReport.schedule.recipients.map((email, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {email}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEditReport(selectedReport)}>
                      <Edit size={16} className="mr-2" />
                      Edit Report
                    </Button>
                    <Button variant="outline" onClick={() => handleDuplicateReport(selectedReport)}>
                      <Copy size={16} className="mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateReport(selectedReport)}>
                      <FileText size={16} className="mr-2" />
                      Generate
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowReportDetailsDialog(false)}>
                      Close
                    </Button>
                    <Button onClick={() => handleScheduleReport(selectedReport)}>
                      <Clock size={16} className="mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Account Ledger Dialog */}
        <Dialog open={showAccountLedgerDialog} onOpenChange={setShowAccountLedgerDialog}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Account Ledger - {selectedAccount?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Account: {selectedAccount?.code} - {selectedAccount?.name}</p>
                  <p className="text-sm text-gray-500">Current Balance: {selectedAccount && formatCurrency(selectedAccount.balance)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download size={16} className="mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer size={16} className="mr-2" />
                    Print
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Debit</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Mock ledger entries */}
                      {[
                        { date: '2024-01-01', ref: 'Opening', desc: 'Opening Balance', debit: 0, credit: 0, balance: 25000 },
                        { date: '2024-01-15', ref: 'JE-001', desc: 'Client payment received', debit: 5000, credit: 0, balance: 30000 },
                        { date: '2024-01-20', ref: 'JE-002', desc: 'Office supplies purchase', debit: 0, credit: 500, balance: 29500 },
                        { date: '2024-01-25', ref: 'JE-003', desc: 'Legal fees earned', debit: 3000, credit: 0, balance: 32500 }
                      ].map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.ref}</TableCell>
                          <TableCell>{entry.desc}</TableCell>
                          <TableCell>{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                          <TableCell>{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(entry.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowAccountLedgerDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Account History Dialog */}
        <Dialog open={showAccountHistoryDialog} onOpenChange={setShowAccountHistoryDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Account History - {selectedAccount?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-gray-600">
                <p>Account: {selectedAccount?.code} - {selectedAccount?.name}</p>
                <p className="text-sm">Track all changes and modifications to this account</p>
              </div>

              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Field Changed</TableHead>
                        <TableHead>Old Value</TableHead>
                        <TableHead>New Value</TableHead>
                        <TableHead>User</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Mock history entries */}
                      {[
                        { date: '2024-01-01', action: 'Created', field: 'Account', oldValue: '-', newValue: 'Account created', user: 'Admin' },
                        { date: '2024-01-15', action: 'Modified', field: 'Description', oldValue: '', newValue: 'Updated description', user: 'John Doe' },
                        { date: '2024-01-20', action: 'Modified', field: 'Category', oldValue: 'Assets', newValue: 'Current Assets', user: 'Jane Smith' }
                      ].map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>
                            <Badge variant={entry.action === 'Created' ? 'default' : 'outline'}>
                              {entry.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.field}</TableCell>
                          <TableCell className="text-gray-500">{entry.oldValue}</TableCell>
                          <TableCell>{entry.newValue}</TableCell>
                          <TableCell>{entry.user}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowAccountHistoryDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Account Import Dialog */}
        <Dialog open={showAccountImportDialog} onOpenChange={setShowAccountImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Accounts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-gray-600">
                <p>Import accounts from a CSV file. The file should contain the following columns:</p>
                <ul className="list-disc list-inside mt-2 text-sm">
                  <li>Code (required)</li>
                  <li>Name (required)</li>
                  <li>Type (required): asset, liability, equity, revenue, expense</li>
                  <li>Category (required)</li>
                  <li>Balance (optional)</li>
                  <li>Status (optional): Active/Inactive</li>
                  <li>Description (optional)</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Drop your CSV file here or click to browse</p>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImportAccounts(file);
                    }
                  }}
                  className="hidden"
                  id="account-import"
                />
                <Label htmlFor="account-import" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>Choose File</span>
                  </Button>
                </Label>
              </div>

              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Download Sample CSV
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowAccountImportDialog(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Account Export Dialog */}
        <Dialog open={showAccountExportDialog} onOpenChange={setShowAccountExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Chart of Accounts</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-gray-600">
                <p>Export your chart of accounts in various formats</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Export Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Total Accounts: {getFilteredAccounts().length}</div>
                    <div>Active Accounts: {getFilteredAccounts().filter(a => a.isActive).length}</div>
                    <div>Asset Accounts: {getFilteredAccounts().filter(a => a.type === 'asset').length}</div>
                    <div>Liability Accounts: {getFilteredAccounts().filter(a => a.type === 'liability').length}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">CSV Format</h4>
                    <p className="text-sm text-gray-600">Comma-separated values for spreadsheet applications</p>
                  </div>
                  <Button onClick={() => handleExportAccounts('csv')}>
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Excel Format</h4>
                    <p className="text-sm text-gray-600">Microsoft Excel compatible format</p>
                  </div>
                  <Button onClick={() => handleExportAccounts('excel')}>
                    <Download size={16} className="mr-2" />
                    Export Excel
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">PDF Format</h4>
                    <p className="text-sm text-gray-600">Printable PDF document</p>
                  </div>
                  <Button onClick={() => handleExportAccounts('pdf')}>
                    <Download size={16} className="mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowAccountExportDialog(false)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Journal Entry Details Dialog */}
        <Dialog open={showJournalDetailsDialog} onOpenChange={setShowJournalDetailsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText size={20} />
                Journal Entry Details - {selectedJournalEntry?.entryNumber}
              </DialogTitle>
            </DialogHeader>
            {selectedJournalEntry && (
              <div className="space-y-6">
                {/* Entry Header */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Entry Number</Label>
                    <p className="font-semibold">{selectedJournalEntry.entryNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                    <p className="font-semibold">{selectedJournalEntry.date.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className={
                      selectedJournalEntry.status === 'posted' ? 'bg-green-100 text-green-800' : 
                      selectedJournalEntry.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }>
                      {selectedJournalEntry.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Reference</Label>
                    <p className="font-semibold">{selectedJournalEntry.reference || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="font-semibold">{selectedJournalEntry.description}</p>
                  </div>
                </div>

                {/* Entry Lines */}
                <div>
                  <h4 className="font-semibold mb-4">Journal Entry Lines</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedJournalEntry.lines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell className="font-medium">{line.accountCode}</TableCell>
                          <TableCell>{line.accountName}</TableCell>
                          <TableCell>{line.description}</TableCell>
                          <TableCell className="text-right">
                            {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="font-bold">TOTALS</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(selectedJournalEntry.totalDebit)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(selectedJournalEntry.totalCredit)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>

                {/* Entry Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created By</Label>
                    <p>{selectedJournalEntry.createdBy}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created At</Label>
                    <p>{selectedJournalEntry.createdAt.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowJournalDetailsDialog(false)}>
                    Close
                  </Button>
                  <Button variant="outline" onClick={() => handlePrintJournalEntry(selectedJournalEntry)}>
                    <Printer size={16} className="mr-2" />
                    Print
                  </Button>
                  {selectedJournalEntry.status === 'draft' && (
                    <Button onClick={() => handleEditJournalEntry(selectedJournalEntry)}>
                      <Edit size={16} className="mr-2" />
                      Edit Entry
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Journal Entry Print Dialog */}
        <Dialog open={showJournalPrintDialog} onOpenChange={setShowJournalPrintDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer size={20} />
                Print Journal Entry - {selectedJournalEntry?.entryNumber}
              </DialogTitle>
            </DialogHeader>
            {selectedJournalEntry && (
              <div className="space-y-6">
                {/* Print Preview */}
                <div className="bg-white border-2 border-gray-300 p-8 print:border-0 print:p-0">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">JOURNAL ENTRY</h1>
                    <p className="text-lg font-semibold">{selectedJournalEntry.entryNumber}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <div className="mb-4">
                        <span className="font-semibold">Date: </span>
                        {selectedJournalEntry.date.toLocaleDateString()}
                      </div>
                      <div className="mb-4">
                        <span className="font-semibold">Status: </span>
                        {selectedJournalEntry.status.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <span className="font-semibold">Reference: </span>
                        {selectedJournalEntry.reference || 'N/A'}
                      </div>
                      <div className="mb-4">
                        <span className="font-semibold">Created By: </span>
                        {selectedJournalEntry.createdBy}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="font-semibold">Description: </span>
                    {selectedJournalEntry.description}
                  </div>

                  <table className="w-full border-collapse border border-gray-400 mb-8">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-400 p-2 text-left">Account Code</th>
                        <th className="border border-gray-400 p-2 text-left">Account Name</th>
                        <th className="border border-gray-400 p-2 text-left">Description</th>
                        <th className="border border-gray-400 p-2 text-right">Debit</th>
                        <th className="border border-gray-400 p-2 text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJournalEntry.lines.map((line) => (
                        <tr key={line.id}>
                          <td className="border border-gray-400 p-2 font-medium">{line.accountCode}</td>
                          <td className="border border-gray-400 p-2">{line.accountName}</td>
                          <td className="border border-gray-400 p-2">{line.description}</td>
                          <td className="border border-gray-400 p-2 text-right">
                            {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : '-'}
                          </td>
                          <td className="border border-gray-400 p-2 text-right">
                            {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan={3} className="border border-gray-400 p-2">TOTALS</td>
                        <td className="border border-gray-400 p-2 text-right">
                          {formatCurrency(selectedJournalEntry.totalDebit)}
                        </td>
                        <td className="border border-gray-400 p-2 text-right">
                          {formatCurrency(selectedJournalEntry.totalCredit)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="text-center text-sm text-gray-600">
                    <p>Generated on {new Date().toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 print:hidden">
                  <Button variant="outline" onClick={() => setShowJournalPrintDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    window.print();
                    setShowJournalPrintDialog(false);
                    toast({
                      title: "Print Initiated",
                      description: "Journal entry has been sent to printer.",
                    });
                  }}>
                    <Printer size={16} className="mr-2" />
                    Print Entry
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reverse Entry Confirmation Dialog */}
        <Dialog open={showReverseEntryDialog} onOpenChange={setShowReverseEntryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle size={20} className="text-orange-600" />
                Reverse Journal Entry
              </DialogTitle>
            </DialogHeader>
            {selectedJournalEntry && (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">⚠️ Important Notice</h4>
                  <p className="text-sm text-orange-700">
                    This action will create a reversing journal entry with opposite debits and credits.
                    The original entry will be marked as "reversed" and cannot be undone.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Entry Number:</span>
                    <span>{selectedJournalEntry.entryNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Description:</span>
                    <span>{selectedJournalEntry.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span>{formatCurrency(selectedJournalEntry.totalDebit)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowReverseEntryDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      handleReverseJournalEntry(selectedJournalEntry.id);
                      setShowReverseEntryDialog(false);
                    }}
                  >
                    <Shuffle size={16} className="mr-2" />
                    Reverse Entry
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Process Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPayment ? 'Edit Payment' : 'Process Payment'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount *</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={paymentForm.currency} onValueChange={(value) => setPaymentForm({...paymentForm, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payer Name *</Label>
                  <Input 
                    value={paymentForm.payerName}
                    onChange={(e) => setPaymentForm({...paymentForm, payerName: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Payer Email *</Label>
                  <Input 
                    type="email"
                    value={paymentForm.payerEmail}
                    onChange={(e) => setPaymentForm({...paymentForm, payerEmail: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea 
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                  placeholder="Payment description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Gateway</Label>
                  <Select value={paymentForm.gateway} onValueChange={(value) => setPaymentForm({...paymentForm, gateway: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Invoice ID (Optional)</Label>
                <Input 
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({...paymentForm, invoiceId: e.target.value})}
                  placeholder="INV-001"
                />
              </div>
              <div>
                <Label>Reference (Optional)</Label>
                <Input 
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                  placeholder="Transaction reference..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePayment}>
                  {editingPayment ? 'Update Payment' : 'Process Payment'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Details Dialog */}
        <Dialog open={showPaymentDetailsDialog} onOpenChange={setShowPaymentDetailsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Payment Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Number:</span>
                        <span className="font-medium">{selectedPayment.paymentNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{selectedPayment.date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Fees:</span>
                        <span className="font-medium text-red-600">{formatCurrency(selectedPayment.fees, selectedPayment.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Net Amount:</span>
                        <span className="font-medium text-green-600">{formatCurrency(selectedPayment.netAmount, selectedPayment.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getPaymentStatusColor(selectedPayment.status)}>
                          {selectedPayment.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Payer Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedPayment.payerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedPayment.payerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium capitalize">{selectedPayment.paymentMethod.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gateway:</span>
                        <span className="font-medium capitalize">{selectedPayment.gateway}</span>
                      </div>
                      {selectedPayment.transactionId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-medium">{selectedPayment.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedPayment.description}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPaymentDetailsDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => handleSendReceipt(selectedPayment)}>
                    <Receipt size={16} className="mr-2" />
                    Send Receipt
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Settings Dialog */}
        <Dialog open={showPaymentSettingsDialog} onOpenChange={setShowPaymentSettingsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Payment Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <Tabs defaultValue="gateways" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
                  <TabsTrigger value="fees">Processing Fees</TabsTrigger>
                  <TabsTrigger value="currencies">Currencies</TabsTrigger>
                </TabsList>
                
                <TabsContent value="gateways" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Stripe Configuration</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="stripe-enabled"
                            checked={paymentSettings.stripe.enabled}
                            onCheckedChange={(checked) => setPaymentSettings({
                              ...paymentSettings,
                              stripe: { ...paymentSettings.stripe, enabled: checked as boolean }
                            })}
                          />
                          <Label htmlFor="stripe-enabled">Enable Stripe</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Public Key</Label>
                            <Input 
                              value={paymentSettings.stripe.publicKey}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                stripe: { ...paymentSettings.stripe, publicKey: e.target.value }
                              })}
                              placeholder="pk_..."
                            />
                          </div>
                          <div>
                            <Label>Secret Key</Label>
                            <Input 
                              type="password"
                              value={paymentSettings.stripe.secretKey}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                stripe: { ...paymentSettings.stripe, secretKey: e.target.value }
                              })}
                              placeholder="sk_..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">PayPal Configuration</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="paypal-enabled"
                            checked={paymentSettings.paypal.enabled}
                            onCheckedChange={(checked) => setPaymentSettings({
                              ...paymentSettings,
                              paypal: { ...paymentSettings.paypal, enabled: checked as boolean }
                            })}
                          />
                          <Label htmlFor="paypal-enabled">Enable PayPal</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Client ID</Label>
                            <Input 
                              value={paymentSettings.paypal.clientId}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                paypal: { ...paymentSettings.paypal, clientId: e.target.value }
                              })}
                              placeholder="Client ID..."
                            />
                          </div>
                          <div>
                            <Label>Client Secret</Label>
                            <Input 
                              type="password"
                              value={paymentSettings.paypal.clientSecret}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                paypal: { ...paymentSettings.paypal, clientSecret: e.target.value }
                              })}
                              placeholder="Client Secret..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Bank Transfer Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="bank-enabled"
                            checked={paymentSettings.bank.enabled}
                            onCheckedChange={(checked) => setPaymentSettings({
                              ...paymentSettings,
                              bank: { ...paymentSettings.bank, enabled: checked as boolean }
                            })}
                          />
                          <Label htmlFor="bank-enabled">Enable Bank Transfer</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Account Name</Label>
                            <Input 
                              value={paymentSettings.bank.accountName}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                bank: { ...paymentSettings.bank, accountName: e.target.value }
                              })}
                              placeholder="Account Name..."
                            />
                          </div>
                          <div>
                            <Label>Account Number</Label>
                            <Input 
                              value={paymentSettings.bank.accountNumber}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                bank: { ...paymentSettings.bank, accountNumber: e.target.value }
                              })}
                              placeholder="Account Number..."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Bank Name</Label>
                            <Input 
                              value={paymentSettings.bank.bankName}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                bank: { ...paymentSettings.bank, bankName: e.target.value }
                              })}
                              placeholder="Bank Name..."
                            />
                          </div>
                          <div>
                            <Label>Branch Code</Label>
                            <Input 
                              value={paymentSettings.bank.branchCode}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                bank: { ...paymentSettings.bank, branchCode: e.target.value }
                              })}
                              placeholder="Branch Code..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="fees" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Credit Card Processing Fee (%)</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={paymentSettings.fees.creditCard}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          fees: { ...paymentSettings.fees, creditCard: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="2.9"
                      />
                    </div>
                    <div>
                      <Label>Bank Transfer Fee (%)</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={paymentSettings.fees.bankTransfer}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          fees: { ...paymentSettings.fees, bankTransfer: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>PayPal Processing Fee (%)</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={paymentSettings.fees.paypal}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          fees: { ...paymentSettings.fees, paypal: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="3.4"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="currencies" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Default Currency</Label>
                      <Select 
                        value={paymentSettings.currency.default} 
                        onValueChange={(value) => setPaymentSettings({
                          ...paymentSettings,
                          currency: { ...paymentSettings.currency, default: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Supported Currencies</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['ZAR', 'USD', 'EUR', 'GBP'].map(currency => (
                          <div key={currency} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`currency-${currency}`}
                              checked={paymentSettings.currency.supported.includes(currency)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setPaymentSettings({
                                    ...paymentSettings,
                                    currency: { 
                                      ...paymentSettings.currency, 
                                      supported: [...paymentSettings.currency.supported, currency] 
                                    }
                                  });
                                } else {
                                  setPaymentSettings({
                                    ...paymentSettings,
                                    currency: { 
                                      ...paymentSettings.currency, 
                                      supported: paymentSettings.currency.supported.filter(c => c !== currency) 
                                    }
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`currency-${currency}`}>{currency}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPaymentSettingsDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePaymentSettings}>
                  Save Settings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Refund Dialog */}
        <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Process Refund</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-sm">
                    <strong>Payment:</strong> {selectedPayment.paymentNumber}<br />
                    <strong>Original Amount:</strong> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}<br />
                    <strong>Payer:</strong> {selectedPayment.payerName}
                  </p>
                </div>
                <div>
                  <Label>Refund Amount</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    max={selectedPayment.amount}
                    defaultValue={selectedPayment.amount}
                    id="refund-amount"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Refund Reason</Label>
                  <Textarea 
                    id="refund-reason"
                    placeholder="Reason for refund..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      const refundAmount = parseFloat((document.getElementById('refund-amount') as HTMLInputElement)?.value || '0');
                      const refundReason = (document.getElementById('refund-reason') as HTMLTextAreaElement)?.value || '';
                      
                      if (refundAmount > 0 && refundReason.trim()) {
                        handleProcessRefund(selectedPayment.id, refundAmount, refundReason);
                        setShowRefundDialog(false);
                      } else {
                        toast({
                          title: "Validation Error",
                          description: "Please enter a valid refund amount and reason.",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Process Refund
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Start Reconciliation Dialog */}
        <Dialog open={showReconciliationDialog} onOpenChange={setShowReconciliationDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Bank Reconciliation</DialogTitle>
              <DialogDescription>
                Begin a new bank reconciliation process by providing the bank statement details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Bank Account</Label>
                <Select 
                  value={reconciliationForm.bankAccount} 
                  onValueChange={(value) => setReconciliationForm(prev => ({ ...prev, bankAccount: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(acc => acc.type === 'asset' && acc.name.toLowerCase().includes('cash')).map(account => (
                      <SelectItem key={account.id} value={account.name}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statement Date</Label>
                <Input 
                  type="date"
                  value={reconciliationForm.statementDate}
                  onChange={(e) => setReconciliationForm(prev => ({ ...prev, statementDate: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Opening Balance</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={reconciliationForm.openingBalance}
                    onChange={(e) => setReconciliationForm(prev => ({ ...prev, openingBalance: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Closing Balance</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={reconciliationForm.closingBalance}
                    onChange={(e) => setReconciliationForm(prev => ({ ...prev, closingBalance: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReconciliationDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStartReconciliation}>
                  Start Reconciliation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Bank Statement Dialog */}
        <Dialog open={showImportStatementDialog} onOpenChange={setShowImportStatementDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Bank Statement</DialogTitle>
              <DialogDescription>
                Upload a CSV file containing bank transactions. Format: Date, Description, Amount, Type
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Bank Statement File</Label>
                <Input 
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setReconciliationForm(prev => ({ ...prev, statementFile: file }));
                    }
                  }}
                />
                <p className="text-sm text-gray-500 mt-1">
                  CSV format: Date, Description, Amount, Type (credit/debit)
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm">
                  <strong>Sample CSV format:</strong><br />
                  Date,Description,Amount,Type<br />
                  2024-01-15,Deposit - ABC Corp,2500,credit<br />
                  2024-01-14,Service Fee,25,debit
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowImportStatementDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (reconciliationForm.statementFile) {
                      handleImportBankStatement(reconciliationForm.statementFile);
                    } else {
                      toast({
                        title: "Error",
                        description: "Please select a file to import.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!reconciliationForm.statementFile}
                >
                  Import Statement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Match Transaction Dialog */}
        <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Match Transactions</DialogTitle>
              <DialogDescription>
                Select transactions to match between bank statement and book entries.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bank Transactions */}
                <div>
                  <h3 className="font-medium mb-2">Bank Transactions</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {getUnmatchedBankTransactions().map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className={`p-2 border rounded cursor-pointer ${
                          selectedBankTransaction?.id === transaction.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedBankTransaction(transaction)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-gray-600">{transaction.date.toLocaleDateString()}</p>
                          </div>
                          <p className={`font-bold text-sm ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Book Entries */}
                <div>
                  <h3 className="font-medium mb-2">Book Entries</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {getUnmatchedBookEntries().map((entry) => (
                      <div 
                        key={entry.id} 
                        className={`p-2 border rounded cursor-pointer ${
                          selectedBookEntry?.id === entry.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedBookEntry(entry)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{entry.description}</p>
                            <p className="text-xs text-gray-600">{entry.date.toLocaleDateString()}</p>
                          </div>
                          <p className={`font-bold text-sm ${entry.totalDebit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {entry.totalDebit > 0 ? '-' : '+'}{formatCurrency(entry.totalDebit || entry.totalCredit)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedBankTransaction && selectedBookEntry && (
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-sm">
                    <strong>Selected Match:</strong><br />
                    Bank: {selectedBankTransaction.description} ({formatCurrency(selectedBankTransaction.amount)})<br />
                    Book: {selectedBookEntry.description} ({formatCurrency(selectedBookEntry.totalDebit || selectedBookEntry.totalCredit)})
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedBankTransaction && selectedBookEntry) {
                      handleMatchTransaction(selectedBankTransaction, selectedBookEntry);
                    } else {
                      toast({
                        title: "Error",
                        description: "Please select both a bank transaction and book entry to match.",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!selectedBankTransaction || !selectedBookEntry}
                >
                  Match Transactions
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Helper function for payment status colors
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'refunded': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default Accounting;
