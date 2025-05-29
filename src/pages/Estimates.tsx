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
  Mail, 
  Copy, 
  Printer, 
  Archive, 
  Trash2, 
  FileText, 
  Calendar as CalendarIcon,
  DollarSign,
  Receipt,
  History,
  CreditCard,
  Settings,
  Upload,
  PenTool,
  Save,
  Briefcase,
  MapPin,
  FileSignature,
  Palette,
  Type,
  Languages,
  Coins,
  Globe,
  Monitor,
  Wifi,
  WifiOff,
  Clock,
  TrendingUp,
  BarChart3,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface EstimateTemplate {
  id: string;
  name: string;
  logoUrl?: string;
  primaryColor: string;
  fontFamily: string;
  showBankingDetails: boolean;
  customColumns: {
    quantity: string;
    rate: string;
    description: string;
    item: string;
  };
}

interface Estimate {
  id: string;
  estimateNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'draft' | 'pending' | 'accepted' | 'rejected' | 'expired';
  items: EstimateItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes: string;
  terms: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  bankingDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
  };
  templateId: string;
  signatureUrl?: string;
  signedDate?: Date;
  signedBy?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  history: EstimateHistoryEntry[];
  isESignatureEnabled: boolean;
  language: string;
  convertedToInvoice?: boolean;
  convertedToCaseId?: string;
  assignedToCaseId?: string;
  archivedAt?: Date;
}

interface EstimateHistoryEntry {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

const Estimates = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State Management
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [filteredEstimates, setFilteredEstimates] = useState<Estimate[]>([]);
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [showEstimateDialog, setShowEstimateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [viewingEstimate, setViewingEstimate] = useState<Estimate | null>(null);
  const [selectedEstimates, setSelectedEstimates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("estimates");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Form State
  const [estimateForm, setEstimateForm] = useState({
    title: '',
    clientId: '',
    clientName: '',
    clientEmail: '',
    issueDate: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    items: [] as EstimateItem[],
    taxRate: 15,
    notes: '',
    terms: 'Payment is due within 30 days of estimate acceptance.',
    currency: 'ZAR',
    language: 'en',
    templateId: '',
    isESignatureEnabled: true,
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    bankingDetails: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      routingNumber: ''
    }
  });

  // Mock Data
  const clients = ['Clinsmen', 'ABC Corp', 'XYZ Ltd', 'Legal Partners', 'Tech Solutions'];
  const cases = ['Contract Review', 'Litigation Case', 'M&A Transaction', 'Compliance Audit'];
  const currencies = ['ZAR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'zu', name: 'Zulu' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    { code: 'nl', name: 'Dutch' }
  ];

  // Default templates
  const defaultTemplates: EstimateTemplate[] = [
    {
      id: '1',
      name: 'Professional',
      primaryColor: '#2563eb',
      fontFamily: 'Inter',
      showBankingDetails: true,
      customColumns: {
        quantity: 'Quantity',
        rate: 'Rate',
        description: 'Description',
        item: 'Item'
      }
    },
    {
      id: '2',
      name: 'Modern',
      primaryColor: '#059669',
      fontFamily: 'Roboto',
      showBankingDetails: false,
      customColumns: {
        quantity: 'Qty',
        rate: 'Price',
        description: 'Details',
        item: 'Product'
      }
    },
    {
      id: '3',
      name: 'Classic',
      primaryColor: '#dc2626',
      fontFamily: 'Times New Roman',
      showBankingDetails: true,
      customColumns: {
        quantity: 'Weight',
        rate: 'Rate per Unit',
        description: 'Specification',
        item: 'Service'
      }
    },
    {
      id: '4',
      name: 'Minimal',
      primaryColor: '#7c3aed',
      fontFamily: 'Arial',
      showBankingDetails: false,
      customColumns: {
        quantity: 'Amount',
        rate: 'Cost',
        description: 'Description',
        item: 'Item'
      }
    },
    {
      id: '5',
      name: 'Corporate',
      primaryColor: '#ea580c',
      fontFamily: 'Helvetica',
      showBankingDetails: true,
      customColumns: {
        quantity: 'Quantity',
        rate: 'Unit Price',
        description: 'Description',
        item: 'Product/Service'
      }
    }
  ];

  // Mock estimates for demonstration
  const mockEstimates: Estimate[] = [
    {
      id: '1',
      estimateNumber: 'EST-2024-001',
      title: 'Legal Consultation Services',
      clientId: '1',
      clientName: 'ABC Corp',
      clientEmail: 'contact@abccorp.com',
      issueDate: new Date('2024-01-15'),
      expiryDate: new Date('2024-02-15'),
      status: 'pending',
      items: [
        {
          id: '1',
          description: 'Legal consultation hours',
          quantity: 10,
          rate: 500,
          amount: 5000
        }
      ],
      subtotal: 5000,
      taxRate: 15,
      taxAmount: 750,
      total: 5750,
      currency: 'ZAR',
      notes: 'Initial legal consultation for contract review',
      terms: 'Payment due within 30 days of acceptance',
      templateId: '1',
      isESignatureEnabled: true,
      language: 'en',
      createdBy: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        {
          id: '1',
          action: 'created',
          description: 'Estimate created',
          timestamp: new Date(),
          userId: '1',
          userName: 'John Doe'
        }
      ]
    },
    {
      id: '2',
      estimateNumber: 'EST-2024-002',
      title: 'Contract Drafting Services',
      clientId: '2',
      clientName: 'XYZ Ltd',
      clientEmail: 'info@xyzltd.com',
      issueDate: new Date('2024-01-14'),
      expiryDate: new Date('2024-02-14'),
      status: 'accepted',
      items: [
        {
          id: '1',
          description: 'Contract drafting and review',
          quantity: 1,
          rate: 12000,
          amount: 12000
        }
      ],
      subtotal: 12000,
      taxRate: 15,
      taxAmount: 1800,
      total: 13800,
      currency: 'ZAR',
      notes: 'Comprehensive contract drafting service',
      terms: 'Payment due within 30 days of acceptance',
      templateId: '2',
      isESignatureEnabled: true,
      language: 'en',
      signatureUrl: '/signatures/est-002-signature.png',
      signedDate: new Date('2024-01-16'),
      signedBy: 'Jane Smith, XYZ Ltd',
      createdBy: 'Sarah Wilson',
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        {
          id: '1',
          action: 'created',
          description: 'Estimate created',
          timestamp: new Date('2024-01-14'),
          userId: '2',
          userName: 'Sarah Wilson'
        },
        {
          id: '2',
          action: 'signed',
          description: 'Estimate signed by client',
          timestamp: new Date('2024-01-16'),
          userId: '2',
          userName: 'Jane Smith'
        }
      ]
    }
  ];

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate totals
  const calculateTotals = (items: EstimateItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && estimateForm.title) {
      const autoSaveInterval = setInterval(() => {
        const draftData = {
          ...estimateForm,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('estimate_draft', JSON.stringify(draftData));
        console.log('Auto-saved estimate draft');
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [estimateForm, autoSaveEnabled]);

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('estimate_draft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        // Ask user if they want to restore the draft
        if (window.confirm('A draft estimate was found. Would you like to restore it?')) {
          setEstimateForm({
            ...draftData,
            issueDate: new Date(draftData.issueDate),
            expiryDate: new Date(draftData.expiryDate)
          });
          toast({
            title: "Draft Restored",
            description: "Your previous estimate draft has been restored."
          });
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Initialize data
  useEffect(() => {
    if (estimates.length === 0) {
      setEstimates(mockEstimates);
      setTemplates(defaultTemplates);
    }
  }, []);

  // Filter estimates
  useEffect(() => {
    let filtered = estimates;

    if (searchTerm) {
      filtered = filtered.filter(estimate =>
        estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        estimate.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(estimate => estimate.status === statusFilter);
    }

    if (clientFilter !== 'all') {
      filtered = filtered.filter(estimate => estimate.clientName === clientFilter);
    }

    setFilteredEstimates(filtered);
  }, [estimates, searchTerm, statusFilter, clientFilter]);

  return (
    <DashboardLayout title="Estimates & Quotes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Estimates & Quotes</h1>
            <p className="text-gray-600">Create and manage estimates and quotes for your clients</p>
            {isOfflineMode && (
              <div className="flex items-center gap-2 mt-2 text-amber-600">
                <WifiOff size={16} />
                <span className="text-sm">Working offline - changes will sync when connection is restored</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowEstimateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" />
              New Estimate
            </Button>
            <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
              <Palette size={16} className="mr-2" />
              Templates
            </Button>
            <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
              <Settings size={16} className="mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Estimates Tab */}
          <TabsContent value="estimates" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input 
                      placeholder="Search estimates..." 
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
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
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

            {/* Estimate Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Estimates</p>
                      <p className="text-xl font-bold">{filteredEstimates.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={20} className="text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(filteredEstimates.reduce((sum, est) => sum + est.total, 0))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Accepted</p>
                      <p className="text-xl font-bold">
                        {filteredEstimates.filter(e => e.status === 'accepted').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-xl font-bold">
                        {filteredEstimates.filter(e => e.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estimates Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Estimates & Quotes
                  {selectedEstimates.length > 0 && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Bulk Actions ({selectedEstimates.length})
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
                        <Checkbox />
                      </TableHead>
                      <TableHead>Estimate #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEstimates.map((estimate) => (
                      <TableRow key={estimate.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell className="font-medium">{estimate.estimateNumber}</TableCell>
                        <TableCell>{estimate.title}</TableCell>
                        <TableCell>{estimate.clientName}</TableCell>
                        <TableCell>{estimate.issueDate.toLocaleDateString()}</TableCell>
                        <TableCell>{estimate.expiryDate.toLocaleDateString()}</TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(estimate.total, estimate.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(estimate.status)}>
                            {estimate.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit size={14} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy size={14} className="mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Receipt size={14} className="mr-2" />
                                Convert to Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Briefcase size={14} className="mr-2" />
                                Convert to Case
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Briefcase size={14} className="mr-2" />
                                Assign to Case
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Mail size={14} className="mr-2" />
                                Email to Client
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer size={14} className="mr-2" />
                                Print
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download size={14} className="mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <History size={14} className="mr-2" />
                                View History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Archive size={14} className="mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
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

                {filteredEstimates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No estimates found. Create your first estimate to get started.
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
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['pending', 'accepted', 'rejected', 'draft', 'expired'].map(status => {
                      const count = estimates.filter(e => e.status === status).length;
                      const percentage = estimates.length > 0 ? (count / estimates.length) * 100 : 0;
                      
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm capitalize">{status}</span>
                            <span className="text-sm font-medium">{count}</span>
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

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {template.name}
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: template.primaryColor }}
                      ></div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Font: {template.fontFamily}</p>
                    <div className="space-y-2 text-xs">
                      <p><strong>Qty:</strong> {template.customColumns.quantity}</p>
                      <p><strong>Rate:</strong> {template.customColumns.rate}</p>
                      <p><strong>Banking:</strong> {template.showBankingDetails ? 'Shown' : 'Hidden'}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <Edit size={14} className="mr-2" />
                      Customize
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Estimate Dialog */}
        <Dialog open={showEstimateDialog} onOpenChange={setShowEstimateDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText size={20} />
                {editingEstimate ? 'Edit Estimate' : 'Create New Estimate'}
                {autoSaveEnabled && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Save size={14} />
                    Auto-save enabled
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="items">Items & Pricing</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="signature">E-Signature</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Estimate Title *</Label>
                    <Input
                      value={estimateForm.title}
                      onChange={(e) => setEstimateForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter estimate title..."
                    />
                  </div>
                  <div>
                    <Label>Client *</Label>
                    <Select 
                      value={estimateForm.clientName} 
                      onValueChange={(value) => setEstimateForm(prev => ({ 
                        ...prev, 
                        clientName: value,
                        clientEmail: `contact@${value.toLowerCase().replace(/\s+/g, '')}.com` 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client} value={client}>{client}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Issue Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {estimateForm.issueDate.toLocaleDateString()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={estimateForm.issueDate}
                          onSelect={(date) => date && setEstimateForm(prev => ({ ...prev, issueDate: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Expiry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {estimateForm.expiryDate.toLocaleDateString()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={estimateForm.expiryDate}
                          onSelect={(date) => date && setEstimateForm(prev => ({ ...prev, expiryDate: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select 
                      value={estimateForm.currency} 
                      onValueChange={(value) => setEstimateForm(prev => ({ ...prev, currency: value }))}
                    >
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
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <Label className="text-base font-semibold">Shipping Address</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Street Address</Label>
                      <Input
                        value={estimateForm.shippingAddress.street}
                        onChange={(e) => setEstimateForm(prev => ({ 
                          ...prev, 
                          shippingAddress: { ...prev.shippingAddress, street: e.target.value }
                        }))}
                        placeholder="Street address..."
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        value={estimateForm.shippingAddress.city}
                        onChange={(e) => setEstimateForm(prev => ({ 
                          ...prev, 
                          shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                        }))}
                        placeholder="City..."
                      />
                    </div>
                    <div>
                      <Label>State/Province</Label>
                      <Input
                        value={estimateForm.shippingAddress.state}
                        onChange={(e) => setEstimateForm(prev => ({ 
                          ...prev, 
                          shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                        }))}
                        placeholder="State/Province..."
                      />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input
                        value={estimateForm.shippingAddress.postalCode}
                        onChange={(e) => setEstimateForm(prev => ({ 
                          ...prev, 
                          shippingAddress: { ...prev.shippingAddress, postalCode: e.target.value }
                        }))}
                        placeholder="Postal code..."
                      />
                    </div>
                  </div>
                </div>

                {/* Banking Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} />
                    <Label className="text-base font-semibold">Banking Details</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Bank Name</Label>
                      <Input
                        value={estimateForm.bankingDetails.bankName}
                        onChange={(e) => setEstimateForm(prev => ({ 
                          ...prev, 
                          bankingDetails: { ...prev.bankingDetails, bankName: e.target.value }
                        }))}
                        placeholder="Bank name..."
                      />
                    </div>
                    <div>
                      <Label>Account Name</Label>
                      <Input
                        value={estimateForm.bankingDetails.accountName}
                        onChange={(e) => setEstimateForm(prev => ({ 
                          ...prev, 
                          bankingDetails: { ...prev.bankingDetails, accountName: e.target.value }
                        }))}
                        placeholder="Account name..."
                      />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input
                        value={estimateForm.bankingDetails.accountNumber}
                        onChange={(e) => setEstimateForm(prev => ({ 
                          ...prev, 
                          bankingDetails: { ...prev.bankingDetails, accountNumber: e.target.value }
                        }))}
                        placeholder="Account number..."
                      />
                    </div>
                    <div>
                      <Label>Routing Number</Label>
                      <Input
                        value={estimateForm.bankingDetails.routingNumber}
                        onChange={(e) => setEstimateForm(prev => ({ 
                          ...prev, 
                          bankingDetails: { ...prev.bankingDetails, routingNumber: e.target.value }
                        }))}
                        placeholder="Routing number..."
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={estimateForm.notes}
                    onChange={(e) => setEstimateForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </div>

                {/* Terms & Conditions */}
                <div>
                  <Label>Terms & Conditions</Label>
                  <Textarea
                    value={estimateForm.terms}
                    onChange={(e) => setEstimateForm(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Enter terms and conditions..."
                    rows={4}
                  />
                </div>
              </TabsContent>

              {/* Items & Pricing Tab */}
              <TabsContent value="items" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Line Items</h3>
                  <Button onClick={() => {
                    const newItem: EstimateItem = {
                      id: Date.now().toString(),
                      description: '',
                      quantity: 1,
                      rate: 0,
                      amount: 0
                    };
                    setEstimateForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
                  }}>
                    <Plus size={16} className="mr-2" />
                    Add Item
                  </Button>
                </div>

                {/* Items Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estimateForm.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...estimateForm.items];
                              newItems[index].description = e.target.value;
                              setEstimateForm(prev => ({ ...prev, items: newItems }));
                            }}
                            placeholder="Item description..."
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...estimateForm.items];
                              newItems[index].quantity = parseFloat(e.target.value) || 0;
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                              setEstimateForm(prev => ({ ...prev, items: newItems }));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => {
                              const newItems = [...estimateForm.items];
                              newItems[index].rate = parseFloat(e.target.value) || 0;
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                              setEstimateForm(prev => ({ ...prev, items: newItems }));
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(item.amount, estimateForm.currency)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const newItems = estimateForm.items.filter(i => i.id !== item.id);
                              setEstimateForm(prev => ({ ...prev, items: newItems }));
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
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(estimateForm.items.reduce((sum, item) => sum + item.amount, 0), estimateForm.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tax Rate (%):</span>
                    <Input
                      type="number"
                      value={estimateForm.taxRate}
                      onChange={(e) => setEstimateForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                      className="w-24"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Amount:</span>
                    <span>{formatCurrency((estimateForm.items.reduce((sum, item) => sum + item.amount, 0) * estimateForm.taxRate) / 100, estimateForm.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>
                      {formatCurrency(
                        estimateForm.items.reduce((sum, item) => sum + item.amount, 0) + 
                        (estimateForm.items.reduce((sum, item) => sum + item.amount, 0) * estimateForm.taxRate) / 100,
                        estimateForm.currency
                      )}
                    </span>
                  </div>
                </div>
              </TabsContent>

              {/* Template Tab */}
              <TabsContent value="template" className="space-y-6">
                <h3 className="text-lg font-semibold">Choose Template</h3>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map(template => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-all ${
                        estimateForm.templateId === template.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setEstimateForm(prev => ({ ...prev, templateId: template.id }))}
                    >
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          {template.name}
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                            style={{ backgroundColor: template.primaryColor }}
                          ></div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">Font: {template.fontFamily}</p>
                        <div className="space-y-1 text-xs">
                          <p><strong>Qty:</strong> {template.customColumns.quantity}</p>
                          <p><strong>Rate:</strong> {template.customColumns.rate}</p>
                          <p><strong>Banking:</strong> {template.showBankingDetails ? 'Shown' : 'Hidden'}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* E-Signature Tab */}
              <TabsContent value="signature" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSignature size={20} />
                    <h3 className="text-lg font-semibold">E-Signature Settings</h3>
                  </div>
                  <Switch 
                    checked={estimateForm.isESignatureEnabled}
                    onCheckedChange={(checked) => setEstimateForm(prev => ({ ...prev, isESignatureEnabled: checked }))}
                  />
                </div>

                {estimateForm.isESignatureEnabled && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Enable e-signature to allow clients to sign estimates digitally. Once signed, the estimate will be marked as accepted.
                    </p>
                    
                    <Card className="p-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">Signature Requirements</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox defaultChecked />
                            <label className="text-sm">Require client name</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox defaultChecked />
                            <label className="text-sm">Require date of signature</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox />
                            <label className="text-sm">Require IP address tracking</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox />
                            <label className="text-sm">Send confirmation email</label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Language & Localization</h3>
                    <div>
                      <Label>Language</Label>
                      <Select 
                        value={estimateForm.language} 
                        onValueChange={(value) => setEstimateForm(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Auto-save & Offline</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Enable auto-save</label>
                        <Switch 
                          checked={autoSaveEnabled}
                          onCheckedChange={setAutoSaveEnabled}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Offline mode</label>
                        <Switch 
                          checked={isOfflineMode}
                          onCheckedChange={setIsOfflineMode}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      Auto-save creates drafts every 30 seconds. Offline mode allows you to continue working during power outages.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-6">
                <div className="border rounded-lg p-6 bg-white">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">ESTIMATE</h2>
                    <p className="text-gray-600">#{estimateForm.title.replace(/\s+/g, '-').toUpperCase() || 'EST-2024-XXX'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="font-semibold mb-2">From:</h3>
                      <p>Your Company Name</p>
                      <p>123 Business Street</p>
                      <p>City, State 12345</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">To:</h3>
                      <p>{estimateForm.clientName || 'Client Name'}</p>
                      <p>{estimateForm.clientEmail || 'client@email.com'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <strong>Issue Date:</strong>
                      <p>{estimateForm.issueDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <strong>Expiry Date:</strong>
                      <p>{estimateForm.expiryDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <strong>Currency:</strong>
                      <p>{estimateForm.currency}</p>
                    </div>
                  </div>

                  {estimateForm.items.length > 0 && (
                    <Table className="mb-6">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estimateForm.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description || 'Item description'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.rate, estimateForm.currency)}</TableCell>
                            <TableCell>{formatCurrency(item.amount, estimateForm.currency)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {estimateForm.notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p className="text-sm">{estimateForm.notes}</p>
                    </div>
                  )}

                  {estimateForm.terms && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                      <p className="text-sm">{estimateForm.terms}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setShowEstimateDialog(false)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">
                  Save as Draft
                </Button>
                <Button>
                  {editingEstimate ? 'Update Estimate' : 'Create Estimate'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Template Customization Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Customize Templates</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
        <p className="text-gray-600">
                Customize your estimate templates with different colors, fonts, and column names.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <Card key={template.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {template.name}
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-2" />
                          Edit
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Primary Color</Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: template.primaryColor }}
                          ></div>
                          <Input value={template.primaryColor} className="flex-1" />
                        </div>
                      </div>
                      <div>
                        <Label>Font Family</Label>
                        <Select value={template.fontFamily}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Custom Column Names</Label>
                        <Input 
                          placeholder="Quantity column name" 
                          value={template.customColumns.quantity} 
                        />
                        <Input 
                          placeholder="Rate column name" 
                          value={template.customColumns.rate} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Show Banking Details</Label>
                        <Switch checked={template.showBankingDetails} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Estimate Settings</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="general" className="w-full">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="numbering">Numbering</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="offline">Offline & Backup</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Default Currency</Label>
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
                  <div>
                    <Label>Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Default Tax Rate (%)</Label>
                    <Input type="number" defaultValue="15" />
                  </div>
                  <div>
                    <Label>Default Expiry Days</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="numbering" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Estimate Number Format</Label>
                    <Input defaultValue="EST-YYYY-###" placeholder="EST-YYYY-###" />
                    <p className="text-sm text-gray-600 mt-1">
                      Use YYYY for year, MM for month, ### for sequential number
                    </p>
                  </div>
                  <div>
                    <Label>Next Estimate Number</Label>
                    <Input type="number" defaultValue="1" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Email Subject Template</Label>
                    <Input defaultValue="Estimate #{estimate_number} from {company_name}" />
                  </div>
                  <div>
                    <Label>Email Body Template</Label>
                    <Textarea 
                      defaultValue="Dear {client_name},

Please find attached estimate #{estimate_number} for your review.

This estimate is valid until {expiry_date}.

Best regards,
{company_name}"
                      rows={6}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="offline" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Auto-save</Label>
                      <p className="text-sm text-gray-600">Automatically save drafts every 30 seconds</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Offline Mode</Label>
                      <p className="text-sm text-gray-600">Continue working during power outages</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-sync when online</Label>
                      <p className="text-sm text-gray-600">Automatically sync changes when connection is restored</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'expired': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default Estimates;
