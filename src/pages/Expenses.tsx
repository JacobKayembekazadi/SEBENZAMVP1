import React, { useState, useRef } from "react";
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
import { 
  Plus, 
  Upload, 
  Download, 
  FileText, 
  Receipt as ReceiptIcon, 
  Calendar as CalendarIcon,
  DollarSign,
  CreditCard,
  Repeat,
  FileUp,
  FileDown,
  Settings,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Paperclip,
  Building2,
  User,
  FolderOpen,
  Calculator,
  Banknote,
  Database,
  Clock,
  TrendingUp,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  category: string;
  client?: string;
  case?: string;
  isBillable: boolean;
  tax: number;
  taxAmount: number;
  totalAmount: number;
  receipt?: File;
  attachments: File[];
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: Date;
  vendor: string;
  paymentMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BankConnection {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  isConnected: boolean;
  lastSync: Date;
}

const Expenses = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  // State Management
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [bankConnections, setBankConnections] = useState<BankConnection[]>([]);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("expenses");
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  // Form State
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'ZAR',
    date: new Date(),
    category: '',
    client: '',
    case: '',
    isBillable: true,
    tax: 15,
    vendor: '',
    paymentMethod: 'credit_card',
    isRecurring: false,
    recurringFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurringEndDate: undefined as Date | undefined,
    receipt: null as File | null,
    attachments: [] as File[]
  });

  // Mock Data
  const categories = [
    'Office Supplies', 'Travel', 'Meals & Entertainment', 'Professional Services',
    'Software & Subscriptions', 'Marketing', 'Training', 'Equipment', 'Utilities', 'Other'
  ];
  
  const clients = ['Clinsmen', 'ABC Corp', 'XYZ Ltd', 'Legal Partners', 'Tech Solutions'];
  const cases = ['Contract Review', 'Litigation Case', 'M&A Transaction', 'Compliance Audit'];
  const currencies = ['ZAR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];
  const paymentMethods = ['credit_card', 'debit_card', 'cash', 'bank_transfer', 'check', 'petty_cash'];

  // Mock expenses for demonstration
  const mockExpenses: Expense[] = [
    {
      id: '1',
      title: 'Office Supplies',
      description: 'Printer ink and paper',
      amount: 450,
      currency: 'ZAR',
      date: new Date('2024-01-15'),
      category: 'Office Supplies',
      client: 'ABC Corp',
      case: 'Contract Review',
      isBillable: true,
      tax: 15,
      taxAmount: 67.5,
      totalAmount: 517.5,
      attachments: [],
      isRecurring: false,
      vendor: 'Office Depot',
      paymentMethod: 'credit_card',
      status: 'approved',
      createdBy: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Client Lunch',
      description: 'Business lunch with ABC Corp executives',
      amount: 1200,
      currency: 'ZAR',
      date: new Date('2024-01-14'),
      category: 'Meals & Entertainment',
      client: 'ABC Corp',
      isBillable: false,
      tax: 15,
      taxAmount: 180,
      totalAmount: 1380,
      attachments: [],
      isRecurring: false,
      vendor: 'The Restaurant',
      paymentMethod: 'credit_card',
      status: 'pending',
      createdBy: 'Jane Smith',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate tax amount
  const calculateTax = (amount: number, taxRate: number) => {
    return (amount * taxRate) / 100;
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | null, type: 'receipt' | 'attachment') => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (type === 'receipt') {
      setExpenseForm(prev => ({ ...prev, receipt: file }));
      toast({
        title: "Receipt Uploaded",
        description: `Receipt "${file.name}" has been uploaded.`
      });
    } else {
      setExpenseForm(prev => ({ 
        ...prev, 
        attachments: [...prev.attachments, file] 
      }));
      toast({
        title: "Attachment Added",
        description: `File "${file.name}" has been attached.`
      });
    }
  };

  // Save expense
  const saveExpense = () => {
    if (!expenseForm.title || !expenseForm.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and amount.",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(expenseForm.amount);
    const taxAmount = calculateTax(amount, expenseForm.tax);
    const totalAmount = amount + taxAmount;

    const newExpense: Expense = {
      id: editingExpense?.id || Date.now().toString(),
      title: expenseForm.title,
      description: expenseForm.description,
      amount,
      currency: expenseForm.currency,
      date: expenseForm.date,
      category: expenseForm.category,
      client: expenseForm.client,
      case: expenseForm.case,
      isBillable: expenseForm.isBillable,
      tax: expenseForm.tax,
      taxAmount,
      totalAmount,
      receipt: expenseForm.receipt,
      attachments: expenseForm.attachments,
      isRecurring: expenseForm.isRecurring,
      recurringFrequency: expenseForm.isRecurring ? expenseForm.recurringFrequency : undefined,
      recurringEndDate: expenseForm.isRecurring ? expenseForm.recurringEndDate : undefined,
      vendor: expenseForm.vendor,
      paymentMethod: expenseForm.paymentMethod,
      status: 'pending',
      createdBy: 'Current User',
      createdAt: editingExpense?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (editingExpense) {
      setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? newExpense : exp));
      toast({
        title: "Expense Updated",
        description: "Expense has been updated successfully."
      });
    } else {
      setExpenses(prev => [...prev, newExpense]);
      toast({
        title: "Expense Created",
        description: "New expense has been created successfully."
      });
    }

    resetForm();
    setShowExpenseDialog(false);
  };

  // Reset form
  const resetForm = () => {
    setExpenseForm({
      title: '',
      description: '',
      amount: '',
      currency: 'ZAR',
      date: new Date(),
      category: '',
      client: '',
      case: '',
      isBillable: true,
      tax: 15,
      vendor: '',
      paymentMethod: 'credit_card',
      isRecurring: false,
      recurringFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
      recurringEndDate: undefined,
      receipt: null,
      attachments: []
    });
    setEditingExpense(null);
  };

  // Edit expense
  const editExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      title: expense.title,
      description: expense.description,
      amount: expense.amount.toString(),
      currency: expense.currency,
      date: expense.date,
      category: expense.category,
      client: expense.client || '',
      case: expense.case || '',
      isBillable: expense.isBillable,
      tax: expense.tax,
      vendor: expense.vendor,
      paymentMethod: expense.paymentMethod,
      isRecurring: expense.isRecurring,
      recurringFrequency: expense.recurringFrequency || 'monthly',
      recurringEndDate: expense.recurringEndDate,
      receipt: expense.receipt || null,
      attachments: expense.attachments
    });
    setShowExpenseDialog(true);
  };

  // Import CSV
  const handleCSVImport = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'text/csv') {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, you would parse the CSV here
    toast({
      title: "Import Successful",
      description: `Imported expenses from "${file.name}".`
    });
  };

  // Export functions
  const exportExpenses = (format: 'excel' | 'pdf' | 'csv', dateRange?: { from: Date; to: Date }) => {
    let expensesToExport = expenses;
    
    if (dateRange) {
      expensesToExport = expenses.filter(expense => 
        expense.date >= dateRange.from && expense.date <= dateRange.to
      );
    }

    // In a real app, you would generate the actual file here
    toast({
      title: "Export Successful",
      description: `Exported ${expensesToExport.length} expenses as ${format.toUpperCase()}.`
    });
  };

  // Bank connection functions
  const connectBank = (bankData: any) => {
    const newConnection: BankConnection = {
      id: Date.now().toString(),
      bankName: bankData.bankName,
      accountName: bankData.accountName,
      accountNumber: bankData.accountNumber,
      accountType: bankData.accountType,
      balance: bankData.balance || 0,
      currency: bankData.currency,
      isConnected: true,
      lastSync: new Date()
    };

    setBankConnections(prev => [...prev, newConnection]);
    toast({
      title: "Bank Connected",
      description: `Successfully connected to ${bankData.bankName}.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Initialize with mock data
  React.useEffect(() => {
    if (expenses.length === 0) {
      setExpenses(mockExpenses);
    }
  }, []);

  // Filter expenses
  React.useEffect(() => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(expense => expense.status === statusFilter);
    }

    if (clientFilter !== 'all') {
      filtered = filtered.filter(expense => expense.client === clientFilter);
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, statusFilter, clientFilter]);

  // Delete expense
  const deleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    toast({
      title: "Expense Deleted",
      description: "Expense has been deleted successfully."
    });
  };

  // Update expense status
  const updateExpenseStatus = (expenseId: string, status: 'pending' | 'approved' | 'rejected' | 'paid') => {
    setExpenses(prev => prev.map(exp => 
      exp.id === expenseId 
        ? { ...exp, status, approvedBy: status === 'approved' ? 'Current User' : undefined }
        : exp
    ));
    toast({
      title: "Status Updated",
      description: `Expense has been marked as ${status}.`
    });
  };

  // Duplicate expense
  const duplicateExpense = (expense: Expense) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      title: `${expense.title} (Copy)`,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedBy: undefined
    };
    setExpenses(prev => [...prev, newExpense]);
    toast({
      title: "Expense Duplicated",
      description: "Expense has been duplicated successfully."
    });
  };

  // View expense
  const viewExpense = (expense: Expense) => {
    setViewingExpense(expense);
    setShowViewDialog(true);
  };

  // Bulk actions
  const toggleExpenseSelection = (expenseId: string) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId) 
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedExpenses(prev => 
      prev.length === filteredExpenses.length 
        ? []
        : filteredExpenses.map(exp => exp.id)
    );
  };

  const bulkUpdateStatus = (status: 'approved' | 'rejected' | 'paid') => {
    setExpenses(prev => prev.map(exp => 
      selectedExpenses.includes(exp.id)
        ? { ...exp, status, approvedBy: status === 'approved' ? 'Current User' : undefined }
        : exp
    ));
    setSelectedExpenses([]);
    toast({
      title: "Bulk Update Complete",
      description: `${selectedExpenses.length} expenses updated to ${status}.`
    });
  };

  const bulkDelete = () => {
    setExpenses(prev => prev.filter(exp => !selectedExpenses.includes(exp.id)));
    setSelectedExpenses([]);
    toast({
      title: "Bulk Delete Complete",
      description: "Selected expenses have been deleted."
    });
  };

  return (
    <DashboardLayout title="Expense Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Expense Management</h1>
            <p className="text-gray-600">Track and manage business expenses</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                resetForm();
                setShowExpenseDialog(true);
              }} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} className="mr-2" />
              New Expense
            </Button>
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileUp size={16} className="mr-2" />
                  Import
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileDown size={16} className="mr-2" />
                  Export
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input 
                      placeholder="Search expenses..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client} value={client}>{client}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Expense Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Expenses</p>
                      <p className="text-xl font-bold">{formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Billable</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(filteredExpenses.filter(e => e.isBillable).reduce((sum, exp) => sum + exp.totalAmount, 0))}
                      </p>
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
                      <p className="text-xl font-bold">
                        {filteredExpenses.filter(e => e.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calculator size={20} className="text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tax Amount</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.taxAmount, 0))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expenses Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Expense Records
                  {selectedExpenses.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => bulkUpdateStatus('approved')}
                      >
                        Approve Selected ({selectedExpenses.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => bulkUpdateStatus('rejected')}
                      >
                        Reject Selected
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => bulkUpdateStatus('paid')}
                      >
                        Mark as Paid
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={bulkDelete}
                        className="text-red-600 hover:text-red-600"
                      >
                        Delete Selected
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Client/Case</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedExpenses.includes(expense.id)}
                            onCheckedChange={() => toggleExpenseSelection(expense.id)}
                          />
                        </TableCell>
                        <TableCell>{expense.date.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{expense.title}</div>
                            <div className="text-sm text-gray-500">{expense.vendor}</div>
                          </div>
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {expense.client && <div className="font-medium">{expense.client}</div>}
                            {expense.case && <div className="text-gray-500">{expense.case}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(expense.amount, expense.currency)}</TableCell>
                        <TableCell>{formatCurrency(expense.taxAmount, expense.currency)}</TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(expense.totalAmount, expense.currency)}
                        </TableCell>
                        <TableCell>
                          {expense.isBillable ? (
                            <Badge className="bg-green-100 text-green-800">Billable</Badge>
                          ) : (
                            <Badge variant="secondary">Non-billable</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(expense.status)}>
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => editExpense(expense)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => viewExpense(expense)}
                            >
                              <Eye size={14} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1">
                                  <Settings size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => duplicateExpense(expense)}>
                                  <Copy size={14} className="mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {expense.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem onClick={() => updateExpenseStatus(expense.id, 'approved')}>
                                      <Eye size={14} className="mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateExpenseStatus(expense.id, 'rejected')}>
                                      <Trash2 size={14} className="mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {expense.status === 'approved' && (
                                  <DropdownMenuItem onClick={() => updateExpenseStatus(expense.id, 'paid')}>
                                    <CreditCard size={14} className="mr-2" />
                                    Mark as Paid
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => deleteExpense(expense.id)}
                                >
                                  <Trash2 size={14} className="mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredExpenses.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No expenses found. Create your first expense to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expense by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.map(category => {
                      const categoryExpenses = expenses.filter(e => e.category === category);
                      const total = categoryExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
                      const percentage = expenses.length > 0 ? (categoryExpenses.length / expenses.length) * 100 : 0;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">{category}</span>
                            <span className="text-sm font-medium">{formatCurrency(total)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Chart visualization would be implemented here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 size={18} />
                  Bank Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => setShowBankDialog(true)}>
                    <Plus size={16} className="mr-2" />
                    Connect Bank Account
                  </Button>
                  
                  {bankConnections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No bank accounts connected. Connect your bank to automatically import transactions.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {bankConnections.map(connection => (
                        <div key={connection.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{connection.bankName}</h4>
                              <p className="text-sm text-gray-600">{connection.accountName} - {connection.accountNumber}</p>
                              <p className="text-sm text-gray-500">Balance: {formatCurrency(connection.balance, connection.currency)}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className="bg-green-100 text-green-800">Connected</Badge>
                              <Button variant="ghost" size="sm">
                                <Settings size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Expense Dialog */}
        <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ReceiptIcon size={20} />
                {editingExpense ? 'Edit Expense' : 'Create New Expense'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Expense Title *</Label>
                  <Input
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter expense title..."
                  />
                </div>
                <div>
                  <Label>Amount *</Label>
                  <div className="flex">
                    <Select 
                      value={expenseForm.currency} 
                      onValueChange={(value) => setExpenseForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the expense..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expenseForm.date.toLocaleDateString()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={expenseForm.date}
                        onSelect={(date) => date && setExpenseForm(prev => ({ ...prev, date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={expenseForm.category} 
                    onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Input
                    value={expenseForm.vendor}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, vendor: e.target.value }))}
                    placeholder="Vendor name..."
                  />
                </div>
              </div>

              {/* Client & Case Assignment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <Select 
                    value={expenseForm.client} 
                    onValueChange={(value) => setExpenseForm(prev => ({ ...prev, client: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Client</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client} value={client}>{client}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Case</Label>
                  <Select 
                    value={expenseForm.case} 
                    onValueChange={(value) => setExpenseForm(prev => ({ ...prev, case: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select case..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Case</SelectItem>
                      {cases.map(caseItem => (
                        <SelectItem key={caseItem} value={caseItem}>{caseItem}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Billable & Tax */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={expenseForm.isBillable}
                    onCheckedChange={(checked) => setExpenseForm(prev => ({ ...prev, isBillable: !!checked }))}
                  />
                  <Label>Billable to Client</Label>
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={expenseForm.tax}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
                    placeholder="15"
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select 
                    value={expenseForm.paymentMethod} 
                    onValueChange={(value) => setExpenseForm(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="petty_cash">Petty Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Receipt Upload */}
              <div>
                <Label>Receipt</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Receipt
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files, 'receipt')}
                      />
                    </div>
                    {expenseForm.receipt && (
                      <p className="mt-2 text-sm text-gray-600">
                        Uploaded: {expenseForm.receipt.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recurring Expense */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={expenseForm.isRecurring}
                    onCheckedChange={(checked) => setExpenseForm(prev => ({ ...prev, isRecurring: checked }))}
                  />
                  <Label>Make this a recurring expense</Label>
                </div>
                
                {expenseForm.isRecurring && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <Label>Frequency</Label>
                      <Select 
                        value={expenseForm.recurringFrequency} 
                        onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setExpenseForm(prev => ({ ...prev, recurringFrequency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {expenseForm.recurringEndDate?.toLocaleDateString() || 'Select end date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={expenseForm.recurringEndDate}
                            onSelect={(date) => setExpenseForm(prev => ({ ...prev, recurringEndDate: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount Summary */}
              {expenseForm.amount && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>{formatCurrency(parseFloat(expenseForm.amount) || 0, expenseForm.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({expenseForm.tax}%):</span>
                      <span>{formatCurrency(calculateTax(parseFloat(expenseForm.amount) || 0, expenseForm.tax), expenseForm.currency)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(
                          (parseFloat(expenseForm.amount) || 0) + calculateTax(parseFloat(expenseForm.amount) || 0, expenseForm.tax),
                          expenseForm.currency
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={saveExpense}>
                  {editingExpense ? 'Update Expense' : 'Create Expense'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Expenses</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Database className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => csvInputRef.current?.click()}
                    >
                      Select CSV File
                    </Button>
                    <input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => handleCSVImport(e.target.files)}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Upload a CSV file with expense data
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Expenses</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Export Format</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button variant="outline" onClick={() => exportExpenses('excel')}>
                    Excel
                  </Button>
                  <Button variant="outline" onClick={() => exportExpenses('pdf')}>
                    PDF
                  </Button>
                  <Button variant="outline" onClick={() => exportExpenses('csv')}>
                    CSV
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Date Range Export</Label>
                <div className="mt-2 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => exportExpenses('excel', { 
                      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
                      to: new Date() 
                    })}
                  >
                    Export This Month
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => exportExpenses('excel', { 
                      from: new Date(new Date().getFullYear(), 0, 1), 
                      to: new Date() 
                    })}
                  >
                    Export This Year
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bank Connection Dialog */}
        <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Bank Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Bank Name</Label>
                <Input placeholder="e.g., First National Bank" />
              </div>
              <div>
                <Label>Account Name</Label>
                <Input placeholder="Business Account" />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input placeholder="123456789" />
              </div>
              <div>
                <Label>Account Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Currency</Label>
                <Select defaultValue="ZAR">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full"
                onClick={() => {
                  connectBank({
                    bankName: 'First National Bank',
                    accountName: 'Business Account',
                    accountNumber: '123456789',
                    accountType: 'business',
                    currency: 'ZAR'
                  });
                  setShowBankDialog(false);
                }}
              >
                Connect Bank Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Expense Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ReceiptIcon size={20} />
                Expense Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Expense Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <p>{viewingExpense?.title}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p>{formatCurrency(viewingExpense?.amount, viewingExpense?.currency)}</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <p>{viewingExpense?.date.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p>{viewingExpense?.category}</p>
                </div>
                <div>
                  <Label>Client</Label>
                  <p>{viewingExpense?.client}</p>
                </div>
                <div>
                  <Label>Case</Label>
                  <p>{viewingExpense?.case}</p>
                </div>
                <div>
                  <Label>Billable</Label>
                  <p>{viewingExpense?.isBillable ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label>Tax</Label>
                  <p>{formatCurrency(viewingExpense?.taxAmount, viewingExpense?.currency)}</p>
                </div>
                <div>
                  <Label>Total</Label>
                  <p>{formatCurrency(viewingExpense?.totalAmount, viewingExpense?.currency)}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p>{viewingExpense?.status}</p>
                </div>
                <div>
                  <Label>Vendor</Label>
                  <p>{viewingExpense?.vendor}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p>{viewingExpense?.paymentMethod}</p>
                </div>
                <div>
                  <Label>Receipt</Label>
                  <p>{viewingExpense?.receipt?.name}</p>
                </div>
                <div>
                  <Label>Description</Label>
                  <p>{viewingExpense?.description}</p>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <Label>Attachments</Label>
                <div className="space-y-2">
                  {viewingExpense?.attachments.map((attachment, index) => (
                    <p key={index}>{attachment.name}</p>
                  ))}
                </div>
              </div>

              {/* Recurring Information */}
              <div>
                <Label>Recurring</Label>
                <p>{viewingExpense?.isRecurring ? 'Yes' : 'No'}</p>
              </div>
              {viewingExpense?.recurringFrequency && (
                <div>
                  <Label>Recurring Frequency</Label>
                  <p>{viewingExpense?.recurringFrequency}</p>
                </div>
              )}
              {viewingExpense?.recurringEndDate && (
                <div>
                  <Label>Recurring End Date</Label>
                  <p>{viewingExpense?.recurringEndDate.toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
