import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Download, 
  Upload,
  MoreHorizontal, 
  Edit, 
  Eye, 
  Mail,
  Copy,
  Printer,
  Archive,
  Trash2,
  DollarSign,
  Receipt,
  Calendar,
  FileText,
  Filter,
  History,
  CreditCard,
  Settings
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InvoiceDialog } from "@/components/invoices/InvoiceDialog";
import { PaymentDialog } from "@/components/invoices/PaymentDialog";
import { InvoiceSettings } from "@/components/invoices/InvoiceSettings";
import type { InvoiceSettingsData } from "@/components/invoices/InvoiceSettings";
import { useToast } from "@/hooks/use-toast";
import { RecurringInvoiceCard } from "@/components/invoices/RecurringInvoiceCard";

interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  caseId?: string;
  caseName?: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  amount: number;
  paidAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  notes?: string;
  terms?: string;
  template: string;
  hasESignature: boolean;
  signatureStatus?: 'pending' | 'signed' | 'declined';
  attachments: string[];
  paymentSchedule?: Array<{
    dueDate: string;
    amount: number;
    status: 'pending' | 'paid';
  }>;
  shippingAddress?: string;
  lastModified: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  recurringNextDate?: string;
  history: Array<{
    date: string;
    action: string;
    user: string;
    details: string;
  }>;
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    number: 'INV-2024-001',
    clientId: 'client_1',
    clientName: 'John Doe',
    caseId: 'case_1',
    caseName: 'Contract Review',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    status: 'sent',
    amount: 2500.00,
    paidAmount: 0,
    items: [
      { description: 'Legal consultation', quantity: 10, rate: 200, amount: 2000 },
      { description: 'Document review', quantity: 5, rate: 100, amount: 500 }
    ],
    taxRate: 8.5,
    taxAmount: 212.50,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 2500,
    total: 2712.50,
    notes: 'Payment due within 30 days',
    terms: 'Net 30 payment terms apply',
    template: 'professional',
    hasESignature: true,
    signatureStatus: 'pending',
    attachments: ['contract.pdf'],
    shippingAddress: '123 Main St, City, State 12345',
    lastModified: '2024-01-15T10:30:00Z',
    history: [
      { date: '2024-01-15', action: 'Created', user: 'Admin', details: 'Invoice created for Contract Review case' },
      { date: '2024-01-15', action: 'Sent', user: 'Admin', details: 'Invoice sent to client via email' }
    ]
  },
  {
    id: 'inv_002',
    number: 'INV-2024-002',
    clientId: 'client_2',
    clientName: 'Jane Smith',
    date: '2024-01-10',
    dueDate: '2024-02-10',
    status: 'paid',
    amount: 1800.00,
    paidAmount: 1800.00,
    items: [
      { description: 'Litigation support', quantity: 12, rate: 150, amount: 1800 }
    ],
    taxRate: 8.5,
    taxAmount: 153.00,
    discountRate: 5,
    discountAmount: 90.00,
    subtotal: 1800,
    total: 1863.00,
    template: 'modern',
    hasESignature: false,
    attachments: [],
    lastModified: '2024-01-10T14:20:00Z',
    history: [
      { date: '2024-01-10', action: 'Created', user: 'Admin', details: 'Invoice created' },
      { date: '2024-01-10', action: 'Sent', user: 'Admin', details: 'Invoice sent to client' },
      { date: '2024-01-25', action: 'Payment Received', user: 'System', details: 'Full payment of $1,863.00 received' }
    ]
  },
  {
    id: 'inv_003',
    number: 'DRAFT-2024-003',
    clientId: 'client_3',
    clientName: 'Acme Corporation',
    caseId: 'case_3',
    caseName: 'Business Acquisition',
    date: '2024-01-20',
    dueDate: '2024-02-20',
    status: 'draft',
    amount: 5000.00,
    paidAmount: 0,
    items: [
      { description: 'Due diligence review', quantity: 20, rate: 250, amount: 5000 }
    ],
    taxRate: 8.5,
    taxAmount: 425.00,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 5000,
    total: 5425.00,
    template: 'corporate',
    hasESignature: true,
    signatureStatus: 'pending',
    attachments: [],
    lastModified: '2024-01-20T16:45:00Z',
    history: [
      { date: '2024-01-20', action: 'Created', user: 'Admin', details: 'Draft invoice created - auto-saved due to power interruption' }
    ]
  },
  {
    id: 'inv_004',
    number: 'INV-2024-004',
    clientId: 'client_4',
    clientName: 'Global Tech LLC',
    date: '2023-12-01',
    dueDate: '2023-12-31',
    status: 'overdue',
    amount: 3200.00,
    paidAmount: 1200.00,
    items: [
      { description: 'Monthly retainer fee', quantity: 1, rate: 3200, amount: 3200 }
    ],
    taxRate: 8.5,
    taxAmount: 272.00,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 3200,
    total: 3472.00,
    template: 'professional',
    hasESignature: false,
    attachments: [],
    isRecurring: true,
    recurringInterval: 'monthly',
    recurringNextDate: '2024-02-01',
    lastModified: '2023-12-01T09:00:00Z',
    history: [
      { date: '2023-12-01', action: 'Created', user: 'System', details: 'Recurring invoice generated automatically' },
      { date: '2023-12-01', action: 'Sent', user: 'System', details: 'Invoice sent to client via email' },
      { date: '2024-01-15', action: 'Partial Payment', user: 'Admin', details: 'Partial payment of $1,200.00 received' }
    ]
  },
  {
    id: 'inv_005',
    number: 'INV-2024-005',
    clientId: 'client_5',
    clientName: 'StartupCo',
    date: '2023-11-15',
    dueDate: '2023-12-15',
    status: 'overdue',
    amount: 1500.00,
    paidAmount: 0,
    items: [
      { description: 'Legal consultation', quantity: 6, rate: 250, amount: 1500 }
    ],
    taxRate: 8.5,
    taxAmount: 127.50,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 1500,
    total: 1627.50,
    template: 'simple',
    hasESignature: true,
    signatureStatus: 'signed',
    attachments: [],
    lastModified: '2023-11-15T11:30:00Z',
    history: [
      { date: '2023-11-15', action: 'Created', user: 'Admin', details: 'Invoice created' },
      { date: '2023-11-15', action: 'Sent', user: 'Admin', details: 'Invoice sent to client' },
      { date: '2023-11-20', action: 'Signed', user: 'Client', details: 'Invoice digitally signed by client' }
    ]
  }
];

const Invoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettingsData>({
    // Template Customization
    logo: '',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Inter',
    fontSize: 14,
    
    // Column Customization
    descriptionLabel: 'Description',
    quantityLabel: 'Quantity',
    rateLabel: 'Rate',
    customColumns: [
      { id: 'weight', label: 'Weight', type: 'number', enabled: false },
      { id: 'dimensions', label: 'Dimensions', type: 'text', enabled: false },
      { id: 'category', label: 'Category', type: 'text', enabled: false },
      { id: 'notes', label: 'Notes', type: 'text', enabled: false }
    ],
    
    // Localization
    currency: 'USD',
    currencySymbol: '$',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    
    // Email Attachments
    attachPdfCopy: true,
    emailTemplate: 'default',
    
    // Offline/Auto-save
    autoSaveInterval: 30,
    offlineMode: true,
    
    // Reminders
    reminders: [
      { id: '1', enabled: true, days: 5, type: 'before', message: 'Payment reminder: Invoice #{invoice_number} is due in 5 days' },
      { id: '2', enabled: true, days: 0, type: 'after', message: 'Payment overdue: Invoice #{invoice_number} was due today' },
      { id: '3', enabled: false, days: 7, type: 'after', message: 'Second notice: Invoice #{invoice_number} is 7 days overdue' }
    ],
    defaultReminderEnabled: true,
    
    // Overdue Settings
    overdueColor: '#dc2626',
    showOverdueDays: true,
    
    // Late Fees
    chargeLateFeesEnabled: false,
    lateFeeType: 'percentage',
    lateFeeAmount: 5,
    lateFeeGracePeriod: 3,
    
    // Recurring Invoices
    recurringEnabled: true,
    defaultRecurringInterval: 'monthly',
    recurringIntervals: [
      { label: 'Weekly', value: 'weekly', days: 7 },
      { label: 'Bi-weekly (14 days)', value: 'biweekly', days: 14 },
      { label: 'Monthly (30 days)', value: 'monthly', days: 30 },
      { label: 'Quarterly (90 days)', value: 'quarterly', days: 90 },
      { label: 'Semi-annually (180 days)', value: 'semiannually', days: 180 },
      { label: 'Annually (365 days)', value: 'annually', days: 365 }
    ]
  });

  // Auto-save draft functionality
  useEffect(() => {
    const interval = setInterval(() => {
      // Auto-save any draft invoices
      const drafts = invoices.filter(inv => inv.status === 'draft');
      if (drafts.length > 0) {
        console.log('Auto-saving drafts...', drafts.length);
        // In real app, this would save to backend/localStorage
      }
    }, invoiceSettings.autoSaveInterval * 1000); // Convert to milliseconds

    return () => clearInterval(interval);
  }, [invoices, invoiceSettings.autoSaveInterval]);

  const calculateOverdueDays = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.caseName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOverdueStyle = () => ({
    backgroundColor: invoiceSettings.overdueColor,
    color: 'white'
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'symbol'
    }).format(amount).replace('$', invoiceSettings.currencySymbol);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStatusBadge = (invoice: Invoice) => {
    const status = invoice.status;
    const overdueDays = status === 'overdue' ? calculateOverdueDays(invoice.dueDate) : 0;
    
    if (status === 'overdue') {
      return (
        <Badge 
          style={getOverdueStyle()}
        >
          Overdue {invoiceSettings.showOverdueDays && overdueDays > 0 ? `${overdueDays} days` : ''}
        </Badge>
      );
    }
    
    return (
      <Badge className={getStatusColorClass(status)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
        {invoice.isRecurring && <span className="ml-1">🔄</span>}
      </Badge>
    );
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowCreateDialog(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowCreateDialog(true);
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const newInvoice = {
      ...invoice,
      id: `inv_${Date.now()}`,
      number: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      status: 'draft' as const,
      date: new Date().toISOString().split('T')[0],
      paidAmount: 0,
      signatureStatus: undefined,
      history: [
        { 
          date: new Date().toISOString(), 
          action: 'Duplicated', 
          user: 'Admin', 
          details: `Duplicated from invoice ${invoice.number}` 
        }
      ]
    };
    
    setInvoices(prev => [...prev, newInvoice]);
    toast({
      title: "Invoice Duplicated",
      description: `Created duplicate invoice ${newInvoice.number}`,
    });
  };

  const handleStatusChange = (invoice: Invoice, newStatus: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id 
        ? { 
            ...inv, 
            status: newStatus,
            history: [
              ...inv.history,
              {
                date: new Date().toISOString(),
                action: 'Status Changed',
                user: 'Admin',
                details: `Status changed from ${inv.status} to ${newStatus}`
              }
            ]
          }
        : inv
    ));
    
    toast({
      title: "Status Updated",
      description: `Invoice ${invoice.number} status changed to ${newStatus}`,
    });
  };

  const handleAddPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentDialog(true);
  };

  const handleSendByEmail = (invoice: Invoice) => {
    toast({
      title: "Email Sent",
      description: `Invoice ${invoice.number} has been sent to ${invoice.clientName}`,
    });
    
    // Update status to sent if it was draft
    if (invoice.status === 'draft') {
      handleStatusChange(invoice, 'sent');
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    toast({
      title: "Download Started",
      description: `Downloading invoice ${invoice.number} as PDF...`,
    });
  };

  const handlePrint = (invoice: Invoice) => {
    toast({
      title: "Print Job Sent",
      description: `Invoice ${invoice.number} sent to printer`,
    });
  };

  const handleArchive = (invoice: Invoice) => {
    toast({
      title: "Invoice Archived",
      description: `Invoice ${invoice.number} has been archived`,
    });
  };

  const handleDelete = (invoice: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoice.number}?`)) {
      setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
      toast({
        title: "Invoice Deleted",
        description: `Invoice ${invoice.number} has been deleted`,
        variant: "destructive"
      });
    }
  };

  const handleExportAll = (format: 'excel' | 'pdf' | 'csv') => {
    toast({
      title: "Export Started",
      description: `Exporting all invoices as ${format.toUpperCase()}...`,
    });
  };

  const getTotalStats = () => {
    const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pending = total - paid;
    const overdue = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);

    return { total, paid, pending, overdue };
  };

  const stats = getTotalStats();

  return (
    <DashboardLayout title="Invoices" description="Manage and create invoices for your clients">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search invoices by number, client, or case..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportAll('excel')}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll('pdf')}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportAll('csv')}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            onClick={() => setShowSettingsDialog(true)}
            className="flex items-center gap-2"
          >
            <Settings size={16} />
            Settings
          </Button>
          <Button
            onClick={handleCreateInvoice}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus size={16} />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.overdue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>
                      {invoice.caseName && (
                        <span className="text-sm text-gray-600">{invoice.caseName}</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</TableCell>
                    <TableCell>
                      {renderStatusBadge(invoice)}
                    </TableCell>
                    <TableCell>
                      {invoice.hasESignature && (
                        <Badge variant={invoice.signatureStatus === 'signed' ? 'default' : 'secondary'}>
                          {invoice.signatureStatus || 'Pending'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                            <Edit size={16} className="mr-2" />
                            Edit Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye size={16} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleSendByEmail(invoice)}>
                            <Mail size={16} className="mr-2" />
                            Send by Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateInvoice(invoice)}>
                            <Copy size={16} className="mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                            <Download size={16} className="mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrint(invoice)}>
                            <Printer size={16} className="mr-2" />
                            Print
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAddPayment(invoice)}>
                            <CreditCard size={16} className="mr-2" />
                            Add Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History size={16} className="mr-2" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleArchive(invoice)}>
                            <Archive size={16} className="mr-2" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(invoice)}
                            className="text-red-600"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No invoices found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Change Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Status Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'] as const).map(status => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {invoices.filter(inv => inv.status === status).length}
                </div>
                <div className="text-sm text-gray-500 capitalize">{status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recurring Invoices */}
      {invoiceSettings.recurringEnabled && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recurring Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.filter(inv => inv.isRecurring).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No recurring invoices set up yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {invoices.filter(inv => inv.isRecurring).map((invoice) => (
                  <RecurringInvoiceCard 
                    key={invoice.id} 
                    invoice={invoice}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    onEdit={(id) => {
                      const inv = invoices.find(i => i.id === id);
                      if (inv) handleEditInvoice(inv);
                    }}
                    onPause={(id) => {
                      toast({
                        title: "Recurring Invoice Paused",
                        description: "Recurring invoice has been paused.",
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <InvoiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        invoice={editingInvoice}
        onSave={(invoiceData) => {
          if (editingInvoice) {
            // Update existing invoice
            setInvoices(prev => prev.map(inv => 
              inv.id === editingInvoice.id ? { ...inv, ...invoiceData } : inv
            ));
            toast({
              title: "Invoice Updated",
              description: `Invoice ${invoiceData.number} has been updated successfully.`,
            });
          } else {
            // Create new invoice
            const newInvoice = {
              ...invoiceData,
              id: `inv_${Date.now()}`,
              amount: invoiceData.total,
              paidAmount: 0,
              lastModified: new Date().toISOString(),
              history: [
                {
                  date: new Date().toISOString(),
                  action: 'Created',
                  user: 'Admin',
                  details: 'Invoice created'
                }
              ]
            };
            setInvoices(prev => [...prev, newInvoice]);
            toast({
              title: "Invoice Created",
              description: `Invoice ${invoiceData.number} has been created successfully.`,
            });
          }
        }}
      />

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        invoice={selectedInvoice}
        onPaymentAdded={(paymentData) => {
          if (selectedInvoice) {
            const newPaidAmount = selectedInvoice.paidAmount + paymentData.amount;
            const newStatus = newPaidAmount >= selectedInvoice.total ? 'paid' : 'partial';
            
            setInvoices(prev => prev.map(inv =>
              inv.id === selectedInvoice.id
                ? {
                    ...inv,
                    paidAmount: newPaidAmount,
                    status: newStatus,
                    history: [
                      ...inv.history,
                      {
                        date: new Date().toISOString(),
                        action: 'Payment Added',
                        user: 'Admin',
                        details: `Payment of ${formatCurrency(paymentData.amount)} added`
                      }
                    ]
                  }
                : inv
            ));

            toast({
              title: "Payment Added",
              description: `Payment of ${formatCurrency(paymentData.amount)} added to invoice ${selectedInvoice.number}`,
            });
          }
        }}
      />

      <InvoiceSettings
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        currentSettings={invoiceSettings}
        onSave={(settings) => {
          setInvoiceSettings(settings);
          toast({
            title: "Settings Updated",
            description: "Invoice settings have been updated successfully.",
          });
        }}
      />
    </DashboardLayout>
  );
};

export default Invoices;
