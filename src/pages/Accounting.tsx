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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// Calendar components removed - using HTML date inputs instead
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
  Mail
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
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  
  // Dialog states
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReconciliationDialog, setShowReconciliationDialog] = useState(false);
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
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportFilterType, setReportFilterType] = useState<string>('all');
  
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

  // Enhanced CRUD Handlers
  const handleSaveJournalEntry = () => {
    if (editingTransaction) {
      // Update existing entry
      const updatedEntries = journalEntries.map(entry => 
        entry.id === editingTransaction.id 
          ? { ...entry, ...journalForm, lines: journalForm.lines.map((line, idx) => ({ ...line, id: `line-${idx}` })) }
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
        description: journalForm.description,
        reference: journalForm.reference,
        totalDebit: journalForm.lines.reduce((sum, line) => sum + line.debitAmount, 0),
        totalCredit: journalForm.lines.reduce((sum, line) => sum + line.creditAmount, 0),
        status: 'draft',
        createdBy: 'Current User',
        createdAt: new Date(),
        lines: journalForm.lines.map((line, idx) => ({ ...line, id: `line-${idx}` }))
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
  };

  const handleDeleteJournalEntry = (entryId: string) => {
    const updatedEntries = journalEntries.filter(entry => entry.id !== entryId);
    setJournalEntries(updatedEntries);
    toast({
      title: "Success",
      description: "Journal entry deleted successfully!",
    });
  };

  const handleReverseJournalEntry = (entryId: string) => {
    const updatedEntries = journalEntries.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: 'reversed' as const }
        : entry
    );
    setJournalEntries(updatedEntries);
    toast({
      title: "Success",
      description: "Journal entry reversed successfully!",
    });
  };

  const handlePostJournalEntry = (entryId: string) => {
    const updatedEntries = journalEntries.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: 'posted' as const }
        : entry
    );
    setJournalEntries(updatedEntries);
    toast({
      title: "Success",
      description: "Journal entry posted successfully!",
    });
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

  // Account CRUD Handlers
  const handleSaveAccount = () => {
    if (editingAccount) {
      // Update existing account
      const updatedAccounts = accounts.map(account => 
        account.id === editingAccount.id 
          ? { ...account, ...accountForm, balance: account.balance }
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
        code: accountForm.code,
        name: accountForm.name,
        type: accountForm.type,
        category: accountForm.category,
        balance: 0,
        parentId: accountForm.parentId || undefined,
        isActive: true,
        description: accountForm.description
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
    const updatedAccounts = accounts.filter(account => account.id !== accountId);
    setAccounts(updatedAccounts);
    toast({
      title: "Success",
      description: "Account deleted successfully!",
    });
  };

  const handleToggleAccountStatus = (accountId: string) => {
    const updatedAccounts = accounts.map(account => 
      account.id === accountId 
        ? { ...account, isActive: !account.isActive }
        : account
    );
    setAccounts(updatedAccounts);
    toast({
      title: "Success",
      description: "Account status updated successfully!",
    });
  };

  const handleViewAccountLedger = (account: Account) => {
    setSelectedAccount(account);
    setShowAccountLedgerDialog(true);
  };

  const handleViewAccountHistory = (account: Account) => {
    setSelectedAccount(account);
    setShowAccountHistoryDialog(true);
  };

  const handleExportAccounts = (format: 'csv' | 'excel' | 'pdf') => {
    const filteredAccounts = getFilteredAccounts();
    
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
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chart-of-accounts-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    
    toast({
      title: "Success",
      description: `Chart of accounts exported as ${format.toUpperCase()}!`,
    });
    setShowAccountExportDialog(false);
  };

  const handleImportAccounts = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const newAccounts: Account[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= 4) {
            const account: Account = {
              id: Date.now().toString() + i,
              code: values[0].trim(),
              name: values[1].replace(/"/g, '').trim(),
              type: values[2].trim() as Account['type'],
              category: values[3].replace(/"/g, '').trim(),
              balance: parseFloat(values[4]) || 0,
              isActive: values[5]?.trim() !== 'Inactive',
              description: values[6]?.replace(/"/g, '').trim() || ''
            };
            newAccounts.push(account);
          }
        }
        
        setAccounts([...accounts, ...newAccounts]);
        toast({
          title: "Success",
          description: `${newAccounts.length} accounts imported successfully!`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import accounts. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    setShowAccountImportDialog(false);
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
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                                toast({
                                  title: "Entry Details",
                                  description: `${entry.entryNumber}: ${entry.description} - ${formatCurrency(entry.totalDebit)}`,
                                });
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
                                toast({
                                  title: "Print Initiated",
                                  description: "Journal entry print job has been sent to printer.",
                                });
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

            {/* Saved Reports Table */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Reports</CardTitle>
                <p className="text-sm text-gray-600">Manage your custom and scheduled reports</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Last Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports
                      .filter(report => {
                        const matchesSearch = report.name.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                                            report.description.toLowerCase().includes(reportSearchTerm.toLowerCase());
                        const matchesType = reportFilterType === 'all' || report.type === reportFilterType;
                        return matchesSearch && matchesType;
                      })
                      .map((report) => (
                      <TableRow key={report.id}>
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
                              <DropdownMenuItem onClick={() => handleGenerateReport(report)}>
                                <FileText size={14} className="mr-2" />
                                Generate Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
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
                              }}>
                                <Edit size={14} className="mr-2" />
                                Edit Report
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleScheduleReport(report)}>
                                <Clock size={14} className="mr-2" />
                                Schedule
                              </DropdownMenuItem>
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
                
                {reports.length === 0 && (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No Reports Created</h3>
                    <p className="text-gray-600 mb-4">Create your first financial report to get started</p>
                    <Button onClick={() => setShowReportDialog(true)}>
                      <Plus size={16} className="mr-2" />
                      Create Report
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional tabs would be implemented here */}
          
          {/* Journal Entries Tab */}
          <TabsContent value="journal" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Journal Entries</h2>
              <Button onClick={() => setShowJournalDialog(true)}>
                <Plus size={16} className="mr-2" />
                New Journal Entry
              </Button>
            </div>

            {/* Search, Filter & Export Controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-gray-500" />
                  <Input
                    placeholder="Search journal entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="reversed">Reversed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                toast({
                  title: "Export Started",
                  description: "Journal entries are being exported as CSV...",
                });
                setTimeout(() => {
                  toast({
                    title: "Export Complete",
                    description: "journal_entries.csv has been downloaded.",
                  });
                }, 1500);
              }}>
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entry #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Debit</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                        <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.reference}</TableCell>
                        <TableCell>{formatCurrency(entry.totalDebit)}</TableCell>
                        <TableCell>{formatCurrency(entry.totalCredit)}</TableCell>
                        <TableCell>
                          <Badge className={entry.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
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
                                toast({
                                  title: "Entry Details",
                                  description: `${entry.entryNumber}: ${entry.description} - ${formatCurrency(entry.totalDebit)}`,
                                });
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
                                toast({
                                  title: "Print Initiated",
                                  description: "Journal entry print job has been sent to printer.",
                                });
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
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
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
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {account.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{account.category}</TableCell>
                        <TableCell>{formatCurrency(account.balance)}</TableCell>
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
                      <TableCell colSpan={7} className="text-center text-sm text-gray-500">
                        Showing {getFilteredAccounts().length} of {accounts.length} accounts
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
                <Button variant="outline">
                  <Settings size={16} className="mr-2" />
                  Payment Settings
                </Button>
              </div>
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
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                        <TableCell>{payment.date.toLocaleDateString()}</TableCell>
                        <TableCell>{payment.payerName}</TableCell>
                        <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{payment.gateway}</TableCell>
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
                              <DropdownMenuItem>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Receipt size={14} className="mr-2" />
                                Send Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Repeat size={14} className="mr-2" />
                                Refund
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

          {/* Bank Reconciliation Tab */}
          <TabsContent value="reconciliation" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Bank Reconciliation</h2>
              <div className="flex gap-2">
                <Button onClick={() => setShowReconciliationDialog(true)}>
                  <Plus size={16} className="mr-2" />
                  Start Reconciliation
                </Button>
                <Button variant="outline">
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
                      <p className="text-xl font-bold">{formatCurrency(85000)}</p>
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
                      <p className="text-xl font-bold">{formatCurrency(85000)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Difference</p>
                      <p className="text-xl font-bold">{formatCurrency(0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Unreconciled Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Unmatched Bank Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">Deposit - ABC Corp</p>
                        <p className="text-sm text-gray-600">Jan 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{formatCurrency(2500)}</p>
                        <Button size="sm" variant="outline">Match</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">Service Fee</p>
                        <p className="text-sm text-gray-600">Jan 14, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">-{formatCurrency(25)}</p>
                        <Button size="sm" variant="outline">Match</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unmatched Book Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">Check #1001</p>
                        <p className="text-sm text-gray-600">Jan 16, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">-{formatCurrency(500)}</p>
                        <Button size="sm" variant="outline">Match</Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">Wire Transfer</p>
                        <p className="text-sm text-gray-600">Jan 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{formatCurrency(1000)}</p>
                        <Button size="sm" variant="outline">Match</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    <SelectItem value="">None</SelectItem>
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
                  <Label>From Date</Label>
                  <input
                    type="date"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={reportForm.dateRange.from.toISOString().split('T')[0]}
                    onChange={(e) => setReportForm({
                      ...reportForm,
                      dateRange: { ...reportForm.dateRange, from: new Date(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label>To Date</Label>
                  <input
                    type="date"
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
