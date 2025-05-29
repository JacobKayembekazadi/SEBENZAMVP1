import React, { useState, useRef, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  Calendar as CalendarIcon,
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
  Trash2
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

const Accounting = () => {
  const { toast } = useToast();
  
  // State Management
  const [activeTab, setActiveTab] = useState("dashboard");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  
  // Dialog states
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReconciliationDialog, setShowReconciliationDialog] = useState(false);
  
  // Form states
  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    type: 'asset' as const,
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

  // Mock Data for demonstration
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

  // Initialize data
  useEffect(() => {
    if (accounts.length === 0) {
      setAccounts(mockAccounts);
      setJournalEntries(mockJournalEntries);
      setPayments(mockPayments);
    }
  }, []);

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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab("journal")}>
                    <BookOpen size={24} />
                    <span className="mt-2">Journal Entry</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab("reports")}>
                    <BarChart3 size={24} />
                    <span className="mt-2">Financial Reports</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab("payments")}>
                    <CreditCard size={24} />
                    <span className="mt-2">Process Payment</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => setActiveTab("reconciliation")}>
                    <CheckCircle size={24} />
                    <span className="mt-2">Bank Reconciliation</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.slice(0, 5).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date.toLocaleDateString()}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.lines[0]?.accountName}</TableCell>
                        <TableCell>{formatCurrency(entry.totalDebit)}</TableCell>
                        <TableCell>
                          <Badge className={entry.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Financial Reports</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <Printer size={16} className="mr-2" />
                  Print
                </Button>
              </div>
            </div>

            {/* Report Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <BarChart3 size={48} className="mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Balance Sheet</h3>
                  <p className="text-sm text-gray-600">Assets, Liabilities & Equity</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp size={48} className="mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Profit & Loss</h3>
                  <p className="text-sm text-gray-600">Revenue & Expenses</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Activity size={48} className="mx-auto mb-4 text-purple-600" />
                  <h3 className="font-semibold mb-2">Cash Flow</h3>
                  <p className="text-sm text-gray-600">Operating, Investing & Financing</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <BookOpen size={48} className="mx-auto mb-4 text-orange-600" />
                  <h3 className="font-semibold mb-2">General Ledger</h3>
                  <p className="text-sm text-gray-600">All Account Transactions</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Calculator size={48} className="mx-auto mb-4 text-red-600" />
                  <h3 className="font-semibold mb-2">Trial Balance</h3>
                  <p className="text-sm text-gray-600">Debit & Credit Balances</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Receipt size={48} className="mx-auto mb-4 text-teal-600" />
                  <h3 className="font-semibold mb-2">Sales Tax Summary</h3>
                  <p className="text-sm text-gray-600">Tax Collected & Paid</p>
                </CardContent>
              </Card>
            </div>

            {/* Sample Balance Sheet */}
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <p className="text-sm text-gray-600">As of {new Date().toLocaleDateString()}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Assets */}
                  <div>
                    <h3 className="font-semibold mb-4 text-lg">ASSETS</h3>
                    <div className="space-y-2">
                      <h4 className="font-medium">Current Assets</h4>
                      {accounts.filter(a => a.type === 'asset' && a.category === 'Current Assets').map(account => (
                        <div key={account.id} className="flex justify-between pl-4">
                          <span>{account.name}</span>
                          <span>{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                      <h4 className="font-medium mt-4">Fixed Assets</h4>
                      {accounts.filter(a => a.type === 'asset' && a.category === 'Fixed Assets').map(account => (
                        <div key={account.id} className="flex justify-between pl-4">
                          <span>{account.name}</span>
                          <span>{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-semibold flex justify-between">
                        <span>Total Assets</span>
                        <span>{formatCurrency(metrics.totalAssets)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities & Equity */}
                  <div>
                    <h3 className="font-semibold mb-4 text-lg">LIABILITIES & EQUITY</h3>
                    <div className="space-y-2">
                      <h4 className="font-medium">Current Liabilities</h4>
                      {accounts.filter(a => a.type === 'liability').map(account => (
                        <div key={account.id} className="flex justify-between pl-4">
                          <span>{account.name}</span>
                          <span>{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                      <h4 className="font-medium mt-4">Equity</h4>
                      {accounts.filter(a => a.type === 'equity').map(account => (
                        <div key={account.id} className="flex justify-between pl-4">
                          <span>{account.name}</span>
                          <span>{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 font-semibold flex justify-between">
                        <span>Total Liabilities & Equity</span>
                        <span>{formatCurrency(metrics.totalLiabilities + metrics.totalEquity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                              <DropdownMenuItem>
                                <Eye size={14} className="mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit size={14} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer size={14} className="mr-2" />
                                Print
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
              <h2 className="text-2xl font-bold">Chart of Accounts</h2>
              <Button onClick={() => setShowAccountDialog(true)}>
                <Plus size={16} className="mr-2" />
                New Account
              </Button>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
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
                              <DropdownMenuItem>
                                <Edit size={14} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye size={14} className="mr-2" />
                                View Ledger
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity size={14} className="mr-2" />
                                Account History
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
        {/* New Account Dialog */}
        <Dialog open={showAccountDialog} onOpenChange={setShowAccountDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
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
                    onValueChange={(value: any) => setAccountForm(prev => ({ ...prev, type: value }))}
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
                <Button>Create Account</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Journal Entry Dialog */}
        <Dialog open={showJournalDialog} onOpenChange={setShowJournalDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {journalForm.date.toLocaleDateString()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={journalForm.date}
                        onSelect={(date) => date && setJournalForm(prev => ({ ...prev, date }))}
                      />
                    </PopoverContent>
                  </Popover>
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
                <Button variant="outline">Save as Draft</Button>
                <Button>Post Entry</Button>
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
