import React, { useState } from 'react';
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
  Settings,
  Palette,
  Upload,
  Plus,
  Trash2,
  DollarSign,
  Globe,
  Bell,
  Calendar,
  Repeat,
  AlertTriangle,
  Image,
  Type,
  Paperclip,
  Clock,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReminderSetting {
  id: string;
  enabled: boolean;
  days: number;
  type: 'before' | 'after';
  message: string;
}

export interface InvoiceSettingsData {
  // Template Customization
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  
  // Column Customization
  descriptionLabel: string;
  quantityLabel: string;
  rateLabel: string;
  customColumns: Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'date';
    enabled: boolean;
  }>;
  
  // Localization
  currency: string;
  currencySymbol: string;
  language: string;
  dateFormat: string;
  
  // Email Attachments
  attachPdfCopy: boolean;
  emailTemplate: string;
  
  // Offline/Auto-save
  autoSaveInterval: number;
  offlineMode: boolean;
  
  // Reminders
  reminders: ReminderSetting[];
  defaultReminderEnabled: boolean;
  
  // Overdue Settings
  overdueColor: string;
  showOverdueDays: boolean;
  
  // Late Fees
  chargeLateFeesEnabled: boolean;
  lateFeeType: 'fixed' | 'percentage';
  lateFeeAmount: number;
  lateFeeGracePeriod: number;
  
  // Recurring Invoices
  recurringEnabled: boolean;
  defaultRecurringInterval: string;
  recurringIntervals: Array<{
    label: string;
    value: string;
    days: number;
  }>;
}

interface InvoiceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: InvoiceSettingsData) => void;
  currentSettings?: InvoiceSettingsData;
}

const DEFAULT_SETTINGS: InvoiceSettingsData = {
  logo: '',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  fontFamily: 'Inter',
  fontSize: 14,
  
  descriptionLabel: 'Description',
  quantityLabel: 'Quantity',
  rateLabel: 'Rate',
  customColumns: [
    { id: 'weight', label: 'Weight', type: 'number', enabled: false },
    { id: 'dimensions', label: 'Dimensions', type: 'text', enabled: false },
    { id: 'category', label: 'Category', type: 'text', enabled: false },
    { id: 'notes', label: 'Notes', type: 'text', enabled: false }
  ],
  
  currency: 'USD',
  currencySymbol: '$',
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  
  attachPdfCopy: true,
  emailTemplate: 'default',
  
  autoSaveInterval: 30,
  offlineMode: true,
  
  reminders: [
    { id: '1', enabled: true, days: 5, type: 'before', message: 'Payment reminder: Invoice #{invoice_number} is due in 5 days' },
    { id: '2', enabled: true, days: 0, type: 'after', message: 'Payment overdue: Invoice #{invoice_number} was due today' },
    { id: '3', enabled: false, days: 7, type: 'after', message: 'Second notice: Invoice #{invoice_number} is 7 days overdue' }
  ],
  defaultReminderEnabled: true,
  
  overdueColor: '#dc2626',
  showOverdueDays: true,
  
  chargeLateFeesEnabled: false,
  lateFeeType: 'percentage',
  lateFeeAmount: 5,
  lateFeeGracePeriod: 3,
  
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
};

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
];

const LANGUAGE_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'af', name: 'Afrikaans' }
];

const FONT_OPTIONS = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'
];

export function InvoiceSettings({ open, onOpenChange, onSave, currentSettings }: InvoiceSettingsProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [settings, setSettings] = useState<InvoiceSettingsData>(currentSettings || DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleReminderChange = (id: string, field: keyof ReminderSetting, value: any) => {
    setSettings(prev => ({
      ...prev,
      reminders: prev.reminders.map(reminder =>
        reminder.id === id ? { ...reminder, [field]: value } : reminder
      )
    }));
  };

  const addReminder = () => {
    const newReminder: ReminderSetting = {
      id: Date.now().toString(),
      enabled: true,
      days: 1,
      type: 'before',
      message: 'Custom reminder message'
    };
    setSettings(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder]
    }));
  };

  const removeReminder = (id: string) => {
    setSettings(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== id)
    }));
  };

  const handleCustomColumnChange = (id: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      customColumns: prev.customColumns.map(col =>
        col.id === id ? { ...col, [field]: value } : col
      )
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
      toast({
        title: "Logo Uploaded",
        description: "Logo has been uploaded successfully.",
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(settings);
      onOpenChange(false);
      toast({
        title: "Settings Saved",
        description: "Invoice settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings size={20} />
            Invoice Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="localization">Localization</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image size={18} />
                    Logo & Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-4">
                      {settings.logo && (
                        <img src={settings.logo} alt="Logo" className="w-16 h-16 object-contain border rounded" />
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Upload size={16} className="mr-2" />
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Type size={18} />
                    Typography
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select value={settings.fontFamily} onValueChange={(value) => handleInputChange('fontFamily', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map(font => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Input
                      type="number"
                      value={settings.fontSize}
                      onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value))}
                      min="8"
                      max="24"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Column Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Description Column Label</Label>
                    <Input
                      value={settings.descriptionLabel}
                      onChange={(e) => handleInputChange('descriptionLabel', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity Column Label</Label>
                    <Input
                      value={settings.quantityLabel}
                      onChange={(e) => handleInputChange('quantityLabel', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate Column Label</Label>
                    <Input
                      value={settings.rateLabel}
                      onChange={(e) => handleInputChange('rateLabel', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Additional Columns</Label>
                  {settings.customColumns.map((column) => (
                    <div key={column.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Checkbox
                        checked={column.enabled}
                        onCheckedChange={(checked) => handleCustomColumnChange(column.id, 'enabled', checked)}
                      />
                      <Input
                        value={column.label}
                        onChange={(e) => handleCustomColumnChange(column.id, 'label', e.target.value)}
                        className="flex-1"
                      />
                      <Select value={column.type} onValueChange={(value) => handleCustomColumnChange(column.id, 'type', value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Localization Tab */}
          <TabsContent value="localization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign size={18} />
                    Currency Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={settings.currency} 
                      onValueChange={(value) => {
                        const currency = CURRENCY_OPTIONS.find(c => c.code === value);
                        handleInputChange('currency', value);
                        if (currency) {
                          handleInputChange('currencySymbol', currency.symbol);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.name} ({currency.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency Symbol</Label>
                    <Input
                      value={settings.currencySymbol}
                      onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe size={18} />
                    Language & Format
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paperclip size={18} />
                  Email Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={settings.attachPdfCopy}
                    onCheckedChange={(checked) => handleInputChange('attachPdfCopy', checked)}
                  />
                  <Label>Automatically attach PDF copy when sending invoices via email</Label>
                </div>

                <div className="space-y-2">
                  <Label>Email Template</Label>
                  <Select value={settings.emailTemplate} onValueChange={(value) => handleInputChange('emailTemplate', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Template</SelectItem>
                      <SelectItem value="professional">Professional Template</SelectItem>
                      <SelectItem value="friendly">Friendly Template</SelectItem>
                      <SelectItem value="formal">Formal Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Changes will apply to all new invoices. Existing invoices will retain their current settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offline Tab */}
          <TabsContent value="offline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock size={18} />
                  Offline & Auto-save Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={settings.offlineMode}
                    onCheckedChange={(checked) => handleInputChange('offlineMode', checked)}
                  />
                  <Label>Enable offline mode (continue working during power outages)</Label>
                </div>

                <div className="space-y-2">
                  <Label>Auto-save interval (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.autoSaveInterval}
                    onChange={(e) => handleInputChange('autoSaveInterval', parseInt(e.target.value))}
                    min="5"
                    max="300"
                  />
                  <p className="text-sm text-gray-500">
                    Invoices will be automatically saved every {settings.autoSaveInterval} seconds
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Offline Features:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Continue working on invoices during power outages</li>
                    <li>• Automatic local storage backup</li>
                    <li>• Resume from where you left off</li>
                    <li>• Sync when connection is restored</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={18} />
                    Automatic Reminders
                  </div>
                  <Button onClick={addReminder} size="sm">
                    <Plus size={16} className="mr-2" />
                    Add Reminder
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={settings.defaultReminderEnabled}
                    onCheckedChange={(checked) => handleInputChange('defaultReminderEnabled', checked)}
                  />
                  <Label>Enable automatic reminders for all invoices</Label>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Enabled</TableHead>
                      <TableHead className="w-24">Days</TableHead>
                      <TableHead className="w-32">Timing</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settings.reminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell>
                          <Checkbox
                            checked={reminder.enabled}
                            onCheckedChange={(checked) => handleReminderChange(reminder.id, 'enabled', checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={reminder.days}
                            onChange={(e) => handleReminderChange(reminder.id, 'days', parseInt(e.target.value))}
                            min="0"
                            max="365"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={reminder.type} 
                            onValueChange={(value) => handleReminderChange(reminder.id, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="before">Before due date</SelectItem>
                              <SelectItem value="after">After due date</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={reminder.message}
                            onChange={(e) => handleReminderChange(reminder.id, 'message', e.target.value)}
                            placeholder="Reminder message..."
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeReminder(reminder.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overdue Tab */}
          <TabsContent value="overdue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Overdue Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Overdue Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={settings.overdueColor}
                        onChange={(e) => handleInputChange('overdueColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.overdueColor}
                        onChange={(e) => handleInputChange('overdueColor', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.showOverdueDays}
                      onCheckedChange={(checked) => handleInputChange('showOverdueDays', checked)}
                    />
                    <Label>Show number of overdue days</Label>
                  </div>

                  <div className="p-4 bg-orange-50 border rounded-lg">
                    <h4 className="font-medium mb-2">Preview:</h4>
                    <div className="flex items-center gap-2">
                      <Badge style={{ backgroundColor: settings.overdueColor, color: 'white' }}>
                        Overdue {settings.showOverdueDays ? '15 days' : ''}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard size={18} />
                    Late Fees
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={settings.chargeLateFeesEnabled}
                      onCheckedChange={(checked) => handleInputChange('chargeLateFeesEnabled', checked)}
                    />
                    <Label>Charge late fees for overdue invoices</Label>
                  </div>

                  {settings.chargeLateFeesEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Late Fee Type</Label>
                        <Select value={settings.lateFeeType} onValueChange={(value) => handleInputChange('lateFeeType', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                            <SelectItem value="percentage">Percentage of Invoice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Late Fee Amount {settings.lateFeeType === 'percentage' ? '(%)' : `(${settings.currencySymbol})`}
                        </Label>
                        <Input
                          type="number"
                          value={settings.lateFeeAmount}
                          onChange={(e) => handleInputChange('lateFeeAmount', parseFloat(e.target.value))}
                          min="0"
                          step={settings.lateFeeType === 'percentage' ? '0.1' : '1'}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Grace Period (days)</Label>
                        <Input
                          type="number"
                          value={settings.lateFeeGracePeriod}
                          onChange={(e) => handleInputChange('lateFeeGracePeriod', parseInt(e.target.value))}
                          min="0"
                          max="30"
                        />
                        <p className="text-sm text-gray-500">
                          Late fees will be applied {settings.lateFeeGracePeriod} days after the due date
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recurring Tab */}
          <TabsContent value="recurring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Repeat size={18} />
                  Retainer/Subscription Invoices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={settings.recurringEnabled}
                    onCheckedChange={(checked) => handleInputChange('recurringEnabled', checked)}
                  />
                  <Label>Enable recurring invoices for retainer/subscription clients</Label>
                </div>

                <div className="space-y-2">
                  <Label>Default Recurring Interval</Label>
                  <Select 
                    value={settings.defaultRecurringInterval} 
                    onValueChange={(value) => handleInputChange('defaultRecurringInterval', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.recurringIntervals.map(interval => (
                        <SelectItem key={interval.value} value={interval.value}>
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-blue-50 border rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Recurring Invoice Types:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                    {settings.recurringIntervals.map(interval => (
                      <div key={interval.value} className="flex justify-between">
                        <span>{interval.label}:</span>
                        <span>Every {interval.days} days</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-green-50 border rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Features:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Automatic invoice generation based on schedule</li>
                    <li>• Support for weekly, bi-weekly, monthly, quarterly, and custom intervals</li>
                    <li>• Client-specific recurring settings</li>
                    <li>• Email notifications for recurring invoices</li>
                    <li>• Easy management of subscription billing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 