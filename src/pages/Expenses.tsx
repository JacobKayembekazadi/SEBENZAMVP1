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
// Calendar components removed - using HTML date inputs instead
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Upload, 
  Download, 
  FileText, 
  Receipt as ReceiptIcon,
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
  Copy,
  Mail,
  Printer,
  FileCheck,
  History,
  Archive,
  Send,
  MoreVertical
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
  isArchived?: boolean;
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

// Mock expenses for demonstration - moved outside component to avoid hoisting issues
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
    updatedAt: new Date(),
    isArchived: false
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
    updatedAt: new Date(),
    isArchived: false
  }
];

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [convertingExpense, setConvertingExpense] = useState<Expense | null>(null);
  const [emailingExpense, setEmailingExpense] = useState<Expense | null>(null);
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
    client: 'none',
    case: 'none',
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

  // Email Form State
  const [emailForm, setEmailForm] = useState({
    to: '',
    cc: '',
    subject: '',
    message: '',
    includeAttachments: true
  });

  // Convert Form State
  const [convertForm, setConvertForm] = useState({
    invoiceNumber: '',
    dueDate: new Date(),
    notes: '',
    includeDescription: true
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
      client: expenseForm.client === 'none' ? undefined : expenseForm.client,
      case: expenseForm.case === 'none' ? undefined : expenseForm.case,
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
      client: 'none',
      case: 'none',
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
      client: expense.client || 'none',
      case: expense.case || 'none',
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

  // Import CSV with real functionality
  const handleCSVImport = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Import Failed",
            description: "CSV file must contain at least a header row and one data row.",
            variant: "destructive"
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const requiredFields = ['title', 'amount', 'date', 'category'];
        const missingFields = requiredFields.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          toast({
            title: "Import Failed",
            description: `Missing required columns: ${missingFields.join(', ')}. Expected columns: title, amount, date, category, description, vendor, client, case, billable.`,
            variant: "destructive"
          });
          return;
        }

        const importedExpenses: Expense[] = [];
        let successCount = 0;
        let errorCount = 0;

        for (let i = 1; i < lines.length; i++) {
          try {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
            const rowData: { [key: string]: string } = {};
            
            headers.forEach((header, index) => {
              rowData[header] = values[index] || '';
            });

            const amount = parseFloat(rowData.amount);
            if (isNaN(amount)) {
              errorCount++;
              continue;
            }

            const date = new Date(rowData.date);
            if (isNaN(date.getTime())) {
              errorCount++;
              continue;
            }

            const tax = parseFloat(rowData.tax) || 15;
            const taxAmount = calculateTax(amount, tax);
            const totalAmount = amount + taxAmount;

            const newExpense: Expense = {
              id: `imported-${Date.now()}-${i}`,
              title: rowData.title,
              description: rowData.description || '',
              amount,
              currency: rowData.currency || 'ZAR',
              date,
              category: rowData.category,
              client: rowData.client || '',
              case: rowData.case || '',
              isBillable: rowData.billable?.toLowerCase() === 'true' || rowData.billable === '1',
              tax,
              taxAmount,
              totalAmount,
              attachments: [],
              isRecurring: false,
              vendor: rowData.vendor || '',
              paymentMethod: rowData.paymentmethod || 'credit_card',
              status: 'pending',
              createdBy: 'CSV Import',
              createdAt: new Date(),
              updatedAt: new Date(),
              isArchived: false
            };

            importedExpenses.push(newExpense);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }

        if (importedExpenses.length > 0) {
          setExpenses(prev => [...prev, ...importedExpenses]);
          toast({
            title: "Import Successful",
            description: `Imported ${successCount} expenses successfully. ${errorCount > 0 ? `${errorCount} rows had errors and were skipped.` : ''}`
          });
        } else {
          toast({
            title: "Import Failed",
            description: "No valid expense data could be imported from the CSV file.",
            variant: "destructive"
          });
        }
        
        setShowImportDialog(false);
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to parse CSV file. Please check the file format.",
          variant: "destructive"
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Import Failed",
        description: "Failed to read the CSV file.",
        variant: "destructive"
      });
    };

    reader.readAsText(file);
  };

  // Export functions with real file generation
  const exportExpenses = (format: 'excel' | 'pdf' | 'csv', dateRange?: { from: Date; to: Date }) => {
    let expensesToExport = expenses;
    
    if (dateRange) {
      expensesToExport = expenses.filter(expense => 
        expense.date >= dateRange.from && expense.date <= dateRange.to
      );
    }

    if (expensesToExport.length === 0) {
      toast({
        title: "Export Failed",
        description: "No expenses found for the selected criteria.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (format === 'csv') {
        exportToCSV(expensesToExport);
      } else if (format === 'excel') {
        exportToExcel(expensesToExport);
      } else if (format === 'pdf') {
        exportToPDF(expensesToExport);
      }

      toast({
        title: "Export Successful",
        description: `Exported ${expensesToExport.length} expenses as ${format.toUpperCase()}.`
      });
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate export file. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Export to CSV
  const exportToCSV = (expensesToExport: Expense[]) => {
    const headers = [
      'ID', 'Title', 'Description', 'Amount', 'Currency', 'Date', 'Category', 
      'Client', 'Case', 'Billable', 'Tax Rate', 'Tax Amount', 'Total Amount', 
      'Vendor', 'Payment Method', 'Status', 'Created By', 'Created Date'
    ];
    
    const csvRows = [
      headers.join(','),
      ...expensesToExport.map(expense => [
        expense.id,
        `"${expense.title}"`,
        `"${expense.description}"`,
        expense.amount,
        expense.currency,
        expense.date.toISOString().split('T')[0],
        `"${expense.category}"`,
        `"${expense.client || ''}"`,
        `"${expense.case || ''}"`,
        expense.isBillable ? 'true' : 'false',
        expense.tax,
        expense.taxAmount,
        expense.totalAmount,
        `"${expense.vendor}"`,
        expense.paymentMethod,
        expense.status,
        `"${expense.createdBy}"`,
        expense.createdAt.toISOString().split('T')[0]
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel (HTML table format)
  const exportToExcel = (expensesToExport: Expense[]) => {
    const htmlTable = `
      <table border="1" style="border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f0f0f0; font-weight: bold;">
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Currency</th>
            <th>Date</th>
            <th>Category</th>
            <th>Client</th>
            <th>Case</th>
            <th>Billable</th>
            <th>Tax Rate</th>
            <th>Tax Amount</th>
            <th>Total Amount</th>
            <th>Vendor</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>Created By</th>
            <th>Created Date</th>
          </tr>
        </thead>
        <tbody>
          ${expensesToExport.map(expense => `
            <tr>
              <td>${expense.id}</td>
              <td>${expense.title}</td>
              <td>${expense.description}</td>
              <td>${expense.amount}</td>
              <td>${expense.currency}</td>
              <td>${expense.date.toLocaleDateString()}</td>
              <td>${expense.category}</td>
              <td>${expense.client || ''}</td>
              <td>${expense.case || ''}</td>
              <td>${expense.isBillable ? 'Yes' : 'No'}</td>
              <td>${expense.tax}%</td>
              <td>${expense.taxAmount}</td>
              <td>${expense.totalAmount}</td>
              <td>${expense.vendor}</td>
              <td>${expense.paymentMethod}</td>
              <td>${expense.status}</td>
              <td>${expense.createdBy}</td>
              <td>${expense.createdAt.toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (HTML content)
  const exportToPDF = (expensesToExport: Expense[]) => {
    const totalAmount = expensesToExport.reduce((sum, exp) => sum + exp.totalAmount, 0);
    const totalTax = expensesToExport.reduce((sum, exp) => sum + exp.taxAmount, 0);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { background-color: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .total-row { background-color: #e8f4f8; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Expense Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Expenses:</strong> ${expensesToExport.length}</p>
          <p><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
          <p><strong>Total Tax:</strong> ${formatCurrency(totalTax)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${expensesToExport.map(expense => `
              <tr>
                <td>${expense.date.toLocaleDateString()}</td>
                <td>${expense.title}</td>
                <td>${expense.category}</td>
                <td>${expense.client || 'N/A'}</td>
                <td>${formatCurrency(expense.amount, expense.currency)}</td>
                <td>${formatCurrency(expense.taxAmount, expense.currency)}</td>
                <td>${formatCurrency(expense.totalAmount, expense.currency)}</td>
                <td style="color: ${expense.status === 'approved' ? 'green' : expense.status === 'rejected' ? 'red' : 'orange'}">
                  ${expense.status.toUpperCase()}
                </td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="6" style="text-align: right;"><strong>TOTAL:</strong></td>
              <td><strong>${formatCurrency(totalAmount)}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated by the Sebenza Law Firm Management System</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_report_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bank connection functions
  const connectBank = (bankData: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    accountType: string;
    balance?: number;
    currency: string;
  }) => {
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
  }, [expenses.length]);

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

  // Delete expense with confirmation
  const confirmDeleteExpense = (expense: Expense) => {
    setDeletingExpense(expense);
    setShowDeleteDialog(true);
  };

  const deleteExpense = () => {
    if (!deletingExpense) return;
    
    setExpenses(prev => prev.filter(exp => exp.id !== deletingExpense.id));
    toast({
      title: "Expense Deleted",
      description: "Expense has been deleted successfully."
    });
    setShowDeleteDialog(false);
    setDeletingExpense(null);
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

  const confirmBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  const bulkDelete = () => {
    setExpenses(prev => prev.filter(exp => !selectedExpenses.includes(exp.id)));
    setSelectedExpenses([]);
    setShowBulkDeleteDialog(false);
    toast({
      title: "Bulk Delete Complete",
      description: "Selected expenses have been deleted."
    });
  };

  // Convert expense to invoice
  const convertToInvoice = (expense: Expense) => {
    setConvertingExpense(expense);
    setConvertForm({
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: '',
      includeDescription: true
    });
    setShowConvertDialog(true);
  };

  const handleConvertToInvoice = () => {
    if (!convertingExpense) return;
    
    // In a real app, this would create an actual invoice
    toast({
      title: "Invoice Created",
      description: `Invoice ${convertForm.invoiceNumber} has been created from expense "${convertingExpense.title}".`
    });
    setShowConvertDialog(false);
    setConvertingExpense(null);
  };

  // Email expense
  const emailExpense = (expense: Expense) => {
    setEmailingExpense(expense);
    setEmailForm({
      to: expense.client ? `${expense.client.toLowerCase().replace(' ', '.')}@example.com` : '',
      cc: '',
      subject: `Expense Report: ${expense.title}`,
      message: `Dear ${expense.client || 'Client'},\n\nPlease find attached the expense report for: ${expense.title}\n\nAmount: ${formatCurrency(expense.totalAmount, expense.currency)}\nDate: ${expense.date.toLocaleDateString()}\n\nBest regards,\nYour Law Firm`,
      includeAttachments: true
    });
    setShowEmailDialog(true);
  };

  const handleSendEmail = () => {
    if (!emailingExpense) return;
    
    // In a real app, this would send an actual email
    toast({
      title: "Email Sent",
      description: `Expense report has been sent to ${emailForm.to}.`
    });
    setShowEmailDialog(false);
    setEmailingExpense(null);
  };

  // Print expense
  const printExpense = (expense: Expense) => {
    // In a real app, this would open a print dialog
    toast({
      title: "Print Initiated",
      description: `Expense "${expense.title}" has been sent to printer.`
    });
  };

  // Archive expense
  const archiveExpense = (expense: Expense) => {
    setExpenses(prev => prev.map(exp => 
      exp.id === expense.id 
        ? { ...exp, isArchived: !exp.isArchived }
        : exp
    ));
    toast({
      title: expense.isArchived ? "Expense Unarchived" : "Expense Archived",
      description: expense.isArchived ? "Expense has been restored." : "Expense has been archived."
    });
  };

  // View expense history
  const viewExpenseHistory = (expense: Expense) => {
    setViewingExpense(expense);
    setShowHistoryDialog(true);
  };

  // Download PDF
  const downloadPDF = (expense: Expense) => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "PDF Generated",
      description: `Expense report PDF for "${expense.title}" has been downloaded.`
    });
  };

  // Download sample CSV template
  const downloadSampleCSV = () => {
    const sampleData = [
      'title,amount,date,category,description,vendor,client,case,billable,tax,currency,paymentmethod',
      '"Office Supplies",450.00,2024-01-15,"Office Supplies","Printer ink and paper","Office Depot","ABC Corp","Contract Review",true,15,ZAR,credit_card',
      '"Client Lunch",1200.00,2024-01-14,"Meals & Entertainment","Business lunch with executives","The Restaurant","ABC Corp","",false,15,ZAR,credit_card',
      '"Software License",2500.00,2024-01-13,"Software & Subscriptions","Annual subscription","TechSoft Inc","","",false,15,ZAR,bank_transfer'
    ];

    const csvContent = sampleData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'expense_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template Downloaded",
      description: "Sample CSV template has been downloaded to help you format your data."
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
                        onClick={confirmBulkDelete}
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
                                  <MoreVertical size={14} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => viewExpense(expense)}>
                                  <Eye size={14} className="mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => duplicateExpense(expense)}>
                                  <Copy size={14} className="mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => convertToInvoice(expense)}>
                                  <FileCheck size={14} className="mr-2" />
                                  Convert to Invoice
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {expense.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem onClick={() => updateExpenseStatus(expense.id, 'approved')}>
                                      <FileCheck size={14} className="mr-2" />
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
                                <DropdownMenuItem onClick={() => emailExpense(expense)}>
                                  <Mail size={14} className="mr-2" />
                                  Email to Client
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => printExpense(expense)}>
                                  <Printer size={14} className="mr-2" />
                                  Print
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => downloadPDF(expense)}>
                                  <Download size={14} className="mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => viewExpenseHistory(expense)}>
                                  <History size={14} className="mr-2" />
                                  View History
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => archiveExpense(expense)}>
                                  <Archive size={14} className="mr-2" />
                                  {expense.isArchived ? 'Unarchive' : 'Archive'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => confirmDeleteExpense(expense)}
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
                  <Input
                    type="date"
                    value={expenseForm.date.toISOString().split('T')[0]}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, date: new Date(e.target.value) }))}
                  />
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
                      <SelectItem value="none">No Client</SelectItem>
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
                      <SelectItem value="none">No Case</SelectItem>
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
                        aria-label="Upload receipt file"
                        title="Upload receipt file"
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
                      <Input
                        type="date"
                        value={expenseForm.recurringEndDate?.toISOString().split('T')[0] || ''}
                        onChange={(e) => setExpenseForm(prev => ({ 
                          ...prev, 
                          recurringEndDate: e.target.value ? new Date(e.target.value) : undefined 
                        }))}
                      />
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileUp size={20} />
                Import Expenses from CSV
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Instructions */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Your CSV file must include the following required columns:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <div><strong>Required:</strong> title, amount, date, category</div>
                  <div><strong>Optional:</strong> description, vendor, client, case, billable, tax, currency, paymentmethod</div>
                </div>
                <p className="text-sm text-blue-600 mt-3">
                  <strong>Date format:</strong> YYYY-MM-DD or MM/DD/YYYY<br/>
                  <strong>Billable:</strong> true/false or 1/0<br/>
                  <strong>Amount:</strong> Numbers only (e.g., 123.45)
                </p>
              </div>

              {/* Sample Download */}
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Need a template?</p>
                  <p className="text-sm text-gray-600">Download a sample CSV file to get started</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadSampleCSV()}
                >
                  <Download size={16} className="mr-2" />
                  Download Sample
                </Button>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Database className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => csvInputRef.current?.click()}
                    >
                      <FileUp size={16} className="mr-2" />
                      Select CSV File
                    </Button>
                    <input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => handleCSVImport(e.target.files)}
                      aria-label="Upload CSV file"
                      title="Upload CSV file"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Choose a CSV file to import your expense data
                  </p>
                </div>
              </div>

              {/* Import Notes */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>• All imported expenses will have a status of "Pending"</p>
                <p>• Invalid rows will be skipped and reported</p>
                <p>• Tax calculations will be applied automatically</p>
                <p>• The import process will validate all data before adding to your expenses</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileDown size={20} />
                Export Expenses
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Export Summary */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Export Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                  <div>
                    <p><strong>Total Expenses:</strong> {filteredExpenses.length}</p>
                    <p><strong>Total Amount:</strong> {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0))}</p>
                  </div>
                  <div>
                    <p><strong>Pending:</strong> {filteredExpenses.filter(e => e.status === 'pending').length}</p>
                    <p><strong>Approved:</strong> {filteredExpenses.filter(e => e.status === 'approved').length}</p>
                  </div>
                </div>
              </div>

              {/* Export Format Selection */}
              <div>
                <Label className="text-base font-medium">Choose Export Format</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Card className="cursor-pointer hover:bg-gray-50" onClick={() => exportExpenses('csv')}>
                    <CardContent className="p-4 text-center">
                      <FileText size={24} className="mx-auto mb-2 text-blue-600" />
                      <p className="font-medium">CSV</p>
                      <p className="text-xs text-gray-600">Spreadsheet data</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-gray-50" onClick={() => exportExpenses('excel')}>
                    <CardContent className="p-4 text-center">
                      <Database size={24} className="mx-auto mb-2 text-green-600" />
                      <p className="font-medium">Excel</p>
                      <p className="text-xs text-gray-600">Formatted table</p>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-gray-50" onClick={() => exportExpenses('pdf')}>
                    <CardContent className="p-4 text-center">
                      <FileText size={24} className="mx-auto mb-2 text-red-600" />
                      <p className="font-medium">PDF Report</p>
                      <p className="text-xs text-gray-600">Professional report</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Quick Export Options */}
              <div>
                <Label className="text-base font-medium">Quick Export Options</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center"
                    onClick={() => exportExpenses('excel', { 
                      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
                      to: new Date() 
                    })}
                  >
                    <FileDown size={20} className="mb-2" />
                    <span className="font-medium">This Month</span>
                    <span className="text-xs text-gray-600">
                      {new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString()} - {new Date().toLocaleDateString()}
                    </span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center"
                    onClick={() => exportExpenses('excel', { 
                      from: new Date(new Date().getFullYear(), 0, 1), 
                      to: new Date() 
                    })}
                  >
                    <FileDown size={20} className="mb-2" />
                    <span className="font-medium">This Year</span>
                    <span className="text-xs text-gray-600">
                      {new Date().getFullYear()} Annual Report
                    </span>
                  </Button>
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Export Options</Label>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Current filters will be applied to the export</p>
                  <p>• All expense data including receipts and attachments metadata</p>
                  <p>• File will be automatically downloaded to your Downloads folder</p>
                  <p>• Export includes full audit trail and timestamps</p>
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Need a custom date range?</p>
                    <p className="text-sm text-gray-600">Use the filters above, then export</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter size={16} className="mr-2" />
                    Set Filters
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the expense "{deletingExpense?.title}"? 
                This action cannot be undone and will permanently remove the expense from your records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteExpense} className="bg-red-600 hover:bg-red-700">
                Delete Expense
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Expenses</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedExpenses.length} selected expense(s)? 
                This action cannot be undone and will permanently remove all selected expenses from your records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={bulkDelete} className="bg-red-600 hover:bg-red-700">
                Delete {selectedExpenses.length} Expense(s)
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Convert to Invoice Dialog */}
        <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck size={20} />
                Convert Expense to Invoice
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Converting Expense</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {convertingExpense?.title} - {formatCurrency(convertingExpense?.totalAmount, convertingExpense?.currency)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input
                    value={convertForm.invoiceNumber}
                    onChange={(e) => setConvertForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="INV-2024-0001"
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={convertForm.dueDate.toISOString().split('T')[0]}
                    onChange={(e) => setConvertForm(prev => ({ ...prev, dueDate: new Date(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={convertForm.includeDescription}
                  onCheckedChange={(checked) => setConvertForm(prev => ({ ...prev, includeDescription: !!checked }))}
                />
                <Label>Include expense description in invoice</Label>
              </div>

              <div>
                <Label>Invoice Notes</Label>
                <Textarea
                  value={convertForm.notes}
                  onChange={(e) => setConvertForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the invoice..."
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConvertToInvoice}>
                  Create Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Email Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail size={20} />
                Email Expense Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>To</Label>
                  <Input
                    value={emailForm.to}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <Label>CC (Optional)</Label>
                  <Input
                    value={emailForm.cc}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, cc: e.target.value }))}
                    placeholder="manager@yourfirm.com"
                  />
                </div>
              </div>

              <div>
                <Label>Subject</Label>
                <Input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Expense Report"
                />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  placeholder="Email message..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={emailForm.includeAttachments}
                  onCheckedChange={(checked) => setEmailForm(prev => ({ ...prev, includeAttachments: !!checked }))}
                />
                <Label>Include expense attachments</Label>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail}>
                  <Send size={16} className="mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History size={20} />
                Expense History
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{viewingExpense?.title}</h4>
                <p className="text-sm text-gray-600">{formatCurrency(viewingExpense?.totalAmount, viewingExpense?.currency)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus size={14} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Expense Created</p>
                    <p className="text-sm text-gray-600">Created by {viewingExpense?.createdBy}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {viewingExpense?.createdAt.toLocaleString()}
                  </div>
                </div>

                {viewingExpense?.status === 'approved' && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FileCheck size={14} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Expense Approved</p>
                      <p className="text-sm text-gray-600">Approved by {viewingExpense?.approvedBy || 'System'}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {viewingExpense?.updatedAt.toLocaleString()}
                    </div>
                  </div>
                )}

                {viewingExpense?.status === 'paid' && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <CreditCard size={14} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Payment Processed</p>
                      <p className="text-sm text-gray-600">Payment completed</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {viewingExpense?.updatedAt.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;
