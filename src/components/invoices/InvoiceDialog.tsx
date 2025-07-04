import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  FileText, 
  Upload,
  Eye,
  Settings,
  Calendar,
  DollarSign,
  Percent,
  MapPin,
  Paperclip,
  CreditCard,
  PenTool,
  Save,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface PaymentScheduleItem {
  id: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid';
}

interface InvoiceFormData {
  number: string;
  clientId: string;
  clientName: string;
  caseId?: string;
  caseName?: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
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
  attachments: string[];
  paymentSchedule: PaymentScheduleItem[];
  shippingAddress?: string;
  customFields: Record<string, any>;
  bankingDetails?: string;
}

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: any;
  onSave: (invoiceData: InvoiceFormData) => void;
}

const TEMPLATE_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Clean and formal design' },
  { value: 'modern', label: 'Modern', description: 'Contemporary minimalist style' },
  { value: 'corporate', label: 'Corporate', description: 'Business-focused layout' },
  { value: 'creative', label: 'Creative', description: 'Stylish and unique design' },
  { value: 'simple', label: 'Simple', description: 'Basic no-frills template' }
];

const CUSTOM_FIELD_OPTIONS = [
  { key: 'item', label: 'Item/Service', defaultValue: 'Description' },
  { key: 'quantity', label: 'Qty/Hours', defaultValue: 'Quantity' },
  { key: 'rate', label: 'Rate/Price', defaultValue: 'Rate' },
  { key: 'weight', label: 'Weight', defaultValue: 'Weight' },
  { key: 'dimensions', label: 'Dimensions', defaultValue: 'Dimensions' },
  { key: 'category', label: 'Category', defaultValue: 'Category' }
];

export function InvoiceDialog({ open, onOpenChange, invoice, onSave }: InvoiceDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const [formData, setFormData] = useState<InvoiceFormData>({
    number: '',
    clientId: '',
    clientName: '',
    caseId: '',
    caseName: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    items: [
      { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
    ],
    taxRate: 8.5,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    subtotal: 0,
    total: 0,
    notes: '',
    terms: 'Payment is due within 30 days of the invoice date.',
    template: 'professional',
    hasESignature: false,
    attachments: [],
    paymentSchedule: [],
    shippingAddress: '',
    customFields: {
      itemLabel: 'Description',
      quantityLabel: 'Quantity',
      rateLabel: 'Rate',
      showBankingDetails: false,
      showWeight: false
    },
    bankingDetails: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save functionality for drafts
  useEffect(() => {
    if (!autoSaveEnabled || !open) return;

    const interval = setInterval(() => {
      if (formData.status === 'draft' && formData.number) {
        console.log('Auto-saving draft invoice...');
        // In real app, save to localStorage or backend
        localStorage.setItem(`invoice_draft_${formData.number}`, JSON.stringify(formData));
        toast({
          title: "Draft Auto-Saved",
          description: "Your invoice draft has been automatically saved.",
        });
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [formData, autoSaveEnabled, open]);

  // Load existing invoice data
  useEffect(() => {
    if (invoice && open) {
      setFormData({
        ...invoice,
        customFields: invoice.customFields || {
          itemLabel: 'Description',
          quantityLabel: 'Quantity',
          rateLabel: 'Rate',
          showBankingDetails: false,
          showWeight: false
        }
      });
    } else if (!invoice && open) {
      // Reset to default for new invoice
      setFormData({
        number: '',
        clientId: '',
        clientName: '',
        caseId: '',
        caseName: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        items: [
          { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
        ],
        taxRate: 8.5,
        taxAmount: 0,
        discountRate: 0,
        discountAmount: 0,
        subtotal: 0,
        total: 0,
        notes: '',
        terms: 'Payment is due within 30 days of the invoice date.',
        template: 'professional',
        hasESignature: false,
        attachments: [],
        paymentSchedule: [],
        shippingAddress: '',
        customFields: {
          itemLabel: 'Description',
          quantityLabel: 'Quantity',
          rateLabel: 'Rate',
          showBankingDetails: false,
          showWeight: false
        },
        bankingDetails: ''
      });
      
      // Check for auto-saved draft only for new invoices
      const savedDraft = localStorage.getItem('invoice_draft_latest');
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setFormData(draftData);
          toast({
            title: "Draft Restored",
            description: "Your previous draft has been restored.",
          });
        } catch (error) {
          console.warn('Failed to restore draft');
        }
      }
    }
  }, [invoice, open]);

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = (subtotal * formData.discountRate) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = (discountedSubtotal * formData.taxRate) / 100;
    const total = discountedSubtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      total
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxRate, formData.discountRate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const addPaymentScheduleItem = () => {
    const newScheduleItem: PaymentScheduleItem = {
      id: Date.now().toString(),
      dueDate: formData.dueDate,
      amount: 0,
      status: 'pending'
    };
    setFormData(prev => ({
      ...prev,
      paymentSchedule: [...prev.paymentSchedule, newScheduleItem]
    }));
  };

  const removePaymentScheduleItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.filter(item => item.id !== id)
    }));
  };

  const handlePaymentScheduleChange = (id: string, field: keyof PaymentScheduleItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      paymentSchedule: prev.paymentSchedule.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleCustomFieldChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value
      }
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...fileNames]
      }));
      toast({
        title: "Files Attached",
        description: `${fileNames.length} file(s) attached to invoice.`,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.number.trim()) newErrors.number = 'Invoice number is required';
    if (!formData.clientName.trim()) newErrors.clientName = 'Client is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';
    if (formData.items.some(item => !item.description.trim())) {
      newErrors.items = 'All items must have a description';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const saveData = {
        ...formData,
        status,
        lastModified: new Date().toISOString()
      };

      // Clear auto-saved draft
      localStorage.removeItem(`invoice_draft_${formData.number}`);

      onSave(saveData);
      onOpenChange(false);
      
      toast({
        title: status === 'draft' ? "Invoice Saved" : "Invoice Sent",
        description: status === 'draft' 
          ? "Invoice saved as draft successfully." 
          : "Invoice sent to client successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText size={20} />
            {invoice ? 'Edit Invoice' : 'Create Invoice'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items & Pricing</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="customization">Customize</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Invoice Number *</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      className={errors.number ? 'border-red-500' : ''}
                    />
                    {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Invoice Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client & Case Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      className={errors.clientName ? 'border-red-500' : ''}
                    />
                    {errors.clientName && <p className="text-sm text-red-500">{errors.clientName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caseName">Case Name (Optional)</Label>
                    <Input
                      id="caseName"
                      value={formData.caseName}
                      onChange={(e) => handleInputChange('caseName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">Shipping Address (Optional)</Label>
                    <Textarea
                      id="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                      placeholder="Enter shipping address..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Items & Pricing Tab */}
          <TabsContent value="items" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Invoice Items
                  <Button onClick={addItem} size="sm">
                    <Plus size={16} className="mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{formData.customFields.itemLabel}</TableHead>
                      <TableHead className="w-24">{formData.customFields.quantityLabel}</TableHead>
                      <TableHead className="w-32">{formData.customFields.rateLabel}</TableHead>
                      <TableHead className="w-32">Amount</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Enter description..."
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={formData.items.length === 1}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {errors.items && <p className="text-sm text-red-500 mt-2">{errors.items}</p>}
              </CardContent>
            </Card>

            {/* Tax and Discount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Label htmlFor="discountRate" className="flex items-center gap-2">
                      <Percent size={16} />
                      Discount Rate (%)
                    </Label>
                    <Input
                      id="discountRate"
                      type="number"
                      value={formData.discountRate}
                      onChange={(e) => handleInputChange('discountRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <p className="text-sm text-gray-500">
                      Discount: {formatCurrency(formData.discountAmount)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate" className="flex items-center gap-2">
                      <DollarSign size={16} />
                      Tax Rate (%)
                    </Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <p className="text-sm text-gray-500">
                      Tax: {formatCurrency(formData.taxAmount)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Label className="font-medium">Invoice Total</Label>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(formData.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(formData.discountAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(formData.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-1">
                        <span>Total:</span>
                        <span>{formatCurrency(formData.total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choose Invoice Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TEMPLATE_OPTIONS.map((template) => (
                    <Card
                      key={template.value}
                      className={`cursor-pointer transition-all ${
                        formData.template === template.value
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleInputChange('template', template.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="w-full h-32 bg-gray-200 rounded mb-3 flex items-center justify-center">
                          <Eye size={24} className="text-gray-400" />
                        </div>
                        <h3 className="font-medium">{template.label}</h3>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customization Tab */}
          <TabsContent value="customization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customize Column Labels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CUSTOM_FIELD_OPTIONS.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={field.key}>{field.label} Column Title</Label>
                      <Input
                        id={field.key}
                        value={formData.customFields[`${field.key}Label`] || field.defaultValue}
                        onChange={(e) => handleCustomFieldChange(`${field.key}Label`, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showBankingDetails"
                      checked={formData.customFields.showBankingDetails}
                      onCheckedChange={(checked) => handleCustomFieldChange('showBankingDetails', checked)}
                    />
                    <Label htmlFor="showBankingDetails">
                      Show banking details on invoice
                    </Label>
                  </div>

                  {formData.customFields.showBankingDetails && (
                    <div className="space-y-2">
                      <Label htmlFor="bankingDetails">Banking Details</Label>
                      <Textarea
                        id="bankingDetails"
                        value={formData.bankingDetails}
                        onChange={(e) => handleInputChange('bankingDetails', e.target.value)}
                        placeholder="Enter banking details for client payments..."
                        rows={4}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showWeight"
                      checked={formData.customFields.showWeight}
                      onCheckedChange={(checked) => handleCustomFieldChange('showWeight', checked)}
                    />
                    <Label htmlFor="showWeight">
                      Add weight column to items
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PenTool size={18} />
                    E-Signature Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasESignature"
                      checked={formData.hasESignature}
                      onCheckedChange={(checked) => handleInputChange('hasESignature', checked)}
                    />
                    <Label htmlFor="hasESignature">
                      Require client e-signature
                    </Label>
                  </div>
                  
                  {formData.hasESignature && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Client will be required to digitally sign this invoice before it's considered accepted.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Paperclip size={18} />
                    Attachments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      aria-label="Upload invoice attachments"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="w-full"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Files
                    </Button>
                  </div>
                  
                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Attached Files:</Label>
                      {formData.attachments.map((filename, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{filename}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                attachments: prev.attachments.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} />
                    Payment Schedule
                  </div>
                  <Button onClick={addPaymentScheduleItem} size="sm">
                    <Plus size={16} className="mr-2" />
                    Add Schedule
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.paymentSchedule.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No payment schedule set. Payment is due by the due date.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.paymentSchedule.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <Input
                              type="date"
                              value={schedule.dueDate}
                              onChange={(e) => handlePaymentScheduleChange(schedule.id, 'dueDate', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={schedule.amount}
                              onChange={(e) => handlePaymentScheduleChange(schedule.id, 'amount', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant={schedule.status === 'paid' ? 'default' : 'secondary'}>
                              {schedule.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePaymentScheduleItem(schedule.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Add any additional notes for the client..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.terms}
                    onChange={(e) => handleInputChange('terms', e.target.value)}
                    placeholder="Enter payment terms and conditions..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-8">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                    <p className="text-lg text-gray-600">{formData.number}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="font-semibold mb-2">Bill To:</h3>
                      <p className="font-medium">{formData.clientName}</p>
                      {formData.caseName && <p className="text-gray-600">Case: {formData.caseName}</p>}
                      {formData.shippingAddress && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">Shipping Address:</p>
                          <p className="text-sm">{formData.shippingAddress}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p><strong>Date:</strong> {formData.date}</p>
                      <p><strong>Due Date:</strong> {formData.dueDate}</p>
                      <p><strong>Template:</strong> {TEMPLATE_OPTIONS.find(t => t.value === formData.template)?.label}</p>
                    </div>
                  </div>

                  <Table className="mb-6">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{formData.customFields.itemLabel}</TableHead>
                        <TableHead>{formData.customFields.quantityLabel}</TableHead>
                        <TableHead>{formData.customFields.rateLabel}</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.rate)}</TableCell>
                          <TableCell>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="text-right mb-6">
                    <div className="space-y-1">
                      <p>Subtotal: {formatCurrency(formData.subtotal)}</p>
                      {formData.discountAmount > 0 && (
                        <p>Discount ({formData.discountRate}%): -{formatCurrency(formData.discountAmount)}</p>
                      )}
                      {formData.taxAmount > 0 && (
                        <p>Tax ({formData.taxRate}%): {formatCurrency(formData.taxAmount)}</p>
                      )}
                      <p className="text-xl font-bold border-t pt-2">
                        Total: {formatCurrency(formData.total)}
                      </p>
                    </div>
                  </div>

                  {formData.terms && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
                      <p className="text-sm text-gray-600">{formData.terms}</p>
                    </div>
                  )}

                  {formData.notes && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Notes:</h4>
                      <p className="text-sm text-gray-600">{formData.notes}</p>
                    </div>
                  )}

                  {formData.customFields.showBankingDetails && formData.bankingDetails && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Banking Details:</h4>
                      <p className="text-sm text-gray-600">{formData.bankingDetails}</p>
                    </div>
                  )}

                  {formData.hasESignature && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600">
                        ✓ This invoice requires client e-signature
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoSave"
              checked={autoSaveEnabled}
              onCheckedChange={(checked) => setAutoSaveEnabled(checked === true)}
            />
            <Label htmlFor="autoSave" className="text-sm">
              Auto-save drafts
            </Label>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              variant="outline"
            >
              <Save size={16} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button
              onClick={() => handleSave('sent')}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send size={16} className="mr-2" />
              {isSaving ? 'Sending...' : 'Save & Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 