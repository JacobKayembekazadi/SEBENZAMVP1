import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, User, Building, MapPin, CreditCard, FileText, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientData {
  // Basic Information
  type: 'individual' | 'business';
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  
  // Billing Address
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Shipping Address (optional)
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Business Information (if applicable)
  businessInfo?: {
    taxId: string;
    industry: string;
    website?: string;
    employees?: number;
  };
  
  // Client Portal Access
  portalAccess: {
    enabled: boolean;
    username?: string;
    sendWelcomeEmail: boolean;
  };
  
  // Additional Information
  notes?: string;
  referralSource?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded?: (client: ClientData) => void;
}

export function AddClientDialog({ open, onOpenChange, onClientAdded }: AddClientDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  
  const [formData, setFormData] = useState<ClientData>({
    type: 'individual',
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    businessInfo: {
      taxId: '',
      industry: '',
      website: '',
      employees: 0,
    },
    portalAccess: {
      enabled: true,
      username: '',
      sendWelcomeEmail: true,
    },
    notes: '',
    referralSource: '',
    priority: 'medium',
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (formData.type === 'business' && !formData.companyName?.trim()) {
      newErrors.companyName = 'Company name is required for business clients';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Address validation
    if (!formData.billingAddress.street.trim()) newErrors.billingStreet = 'Billing street address is required';
    if (!formData.billingAddress.city.trim()) newErrors.billingCity = 'Billing city is required';
    if (!formData.billingAddress.state.trim()) newErrors.billingState = 'Billing state is required';
    if (!formData.billingAddress.zipCode.trim()) newErrors.billingZip = 'Billing ZIP code is required';

    // Portal access validation
    if (formData.portalAccess.enabled && !formData.portalAccess.username?.trim()) {
      newErrors.portalUsername = 'Username is required for portal access';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ClientData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Auto-generate username if enabled
    if (field === 'email' && formData.portalAccess.enabled) {
      setFormData(prev => ({
        ...prev,
        portalAccess: {
          ...prev.portalAccess,
          username: value.split('@')[0].toLowerCase()
        }
      }));
    }

    // Copy billing to shipping if same address
    if (field.startsWith('billingAddress') && sameAsBilling) {
      const addressField = field.replace('billingAddress.', '');
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [addressField]: value
        }
      }));
    }

    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: { ...prev.billingAddress }
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success
      toast({
        title: "Client Added Successfully",
        description: `${formData.firstName} ${formData.lastName} has been added to your client list.`,
      });

      onClientAdded?.(formData);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        type: 'individual',
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        billingAddress: { street: '', city: '', state: '', zipCode: '', country: 'United States' },
        shippingAddress: { street: '', city: '', state: '', zipCode: '', country: 'United States' },
        businessInfo: { taxId: '', industry: '', website: '', employees: 0 },
        portalAccess: { enabled: true, username: '', sendWelcomeEmail: true },
        notes: '',
        referralSource: '',
        priority: 'medium',
        tags: [],
      });
      setActiveTab('basic');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User size={20} />
            Add New Client
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="portal">Portal & Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User size={18} />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Client Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Client Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Company Name (if business) */}
                {formData.type === 'business' && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={errors.companyName ? 'border-red-500' : ''}
                    />
                    {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
                  </div>
                )}

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin size={18} />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Billing Address */}
                <div className="space-y-4">
                  <h3 className="font-medium text-base">Billing Address</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingStreet">Street Address *</Label>
                      <Input
                        id="billingStreet"
                        value={formData.billingAddress.street}
                        onChange={(e) => handleInputChange('billingAddress.street', e.target.value)}
                        className={errors.billingStreet ? 'border-red-500' : ''}
                      />
                      {errors.billingStreet && <p className="text-sm text-red-500">{errors.billingStreet}</p>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingCity">City *</Label>
                        <Input
                          id="billingCity"
                          value={formData.billingAddress.city}
                          onChange={(e) => handleInputChange('billingAddress.city', e.target.value)}
                          className={errors.billingCity ? 'border-red-500' : ''}
                        />
                        {errors.billingCity && <p className="text-sm text-red-500">{errors.billingCity}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billingState">State *</Label>
                        <Input
                          id="billingState"
                          value={formData.billingAddress.state}
                          onChange={(e) => handleInputChange('billingAddress.state', e.target.value)}
                          className={errors.billingState ? 'border-red-500' : ''}
                        />
                        {errors.billingState && <p className="text-sm text-red-500">{errors.billingState}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billingZip">ZIP Code *</Label>
                        <Input
                          id="billingZip"
                          value={formData.billingAddress.zipCode}
                          onChange={(e) => handleInputChange('billingAddress.zipCode', e.target.value)}
                          className={errors.billingZip ? 'border-red-500' : ''}
                        />
                        {errors.billingZip && <p className="text-sm text-red-500">{errors.billingZip}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingCountry">Country</Label>
                      <Input
                        id="billingCountry"
                        value={formData.billingAddress.country}
                        onChange={(e) => handleInputChange('billingAddress.country', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-base">Shipping Address</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAsBilling"
                        checked={sameAsBilling}
                        onCheckedChange={handleSameAsBillingChange}
                      />
                      <Label htmlFor="sameAsBilling" className="text-sm">
                        Same as billing address
                      </Label>
                    </div>
                  </div>

                  {!sameAsBilling && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingStreet">Street Address</Label>
                        <Input
                          id="shippingStreet"
                          value={formData.shippingAddress.street}
                          onChange={(e) => handleInputChange('shippingAddress.street', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="shippingCity">City</Label>
                          <Input
                            id="shippingCity"
                            value={formData.shippingAddress.city}
                            onChange={(e) => handleInputChange('shippingAddress.city', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="shippingState">State</Label>
                          <Input
                            id="shippingState"
                            value={formData.shippingAddress.state}
                            onChange={(e) => handleInputChange('shippingAddress.state', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="shippingZip">ZIP Code</Label>
                          <Input
                            id="shippingZip"
                            value={formData.shippingAddress.zipCode}
                            onChange={(e) => handleInputChange('shippingAddress.zipCode', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shippingCountry">Country</Label>
                        <Input
                          id="shippingCountry"
                          value={formData.shippingAddress.country}
                          onChange={(e) => handleInputChange('shippingAddress.country', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            {formData.type === 'business' ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building size={18} />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / EIN</Label>
                      <Input
                        id="taxId"
                        value={formData.businessInfo?.taxId}
                        onChange={(e) => handleInputChange('businessInfo.taxId', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.businessInfo?.industry}
                        onChange={(e) => handleInputChange('businessInfo.industry', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.businessInfo?.website}
                        onChange={(e) => handleInputChange('businessInfo.website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employees">Number of Employees</Label>
                      <Input
                        id="employees"
                        type="number"
                        value={formData.businessInfo?.employees}
                        onChange={(e) => handleInputChange('businessInfo.employees', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Business Information</h3>
                  <p className="text-gray-500">
                    Business information is only available for business clients. 
                    Switch to "Business" client type to access these fields.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portal" className="space-y-6">
            {/* Portal Access */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard size={18} />
                  Client Portal Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="portalEnabled"
                    checked={formData.portalAccess.enabled}
                    onCheckedChange={(checked) => handleInputChange('portalAccess.enabled', checked)}
                  />
                  <Label htmlFor="portalEnabled" className="text-sm">
                    Enable client portal access
                  </Label>
                </div>

                {formData.portalAccess.enabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                    <div className="space-y-2">
                      <Label htmlFor="portalUsername">Portal Username *</Label>
                      <Input
                        id="portalUsername"
                        value={formData.portalAccess.username}
                        onChange={(e) => handleInputChange('portalAccess.username', e.target.value)}
                        className={errors.portalUsername ? 'border-red-500' : ''}
                        placeholder="Username for client portal login"
                      />
                      {errors.portalUsername && <p className="text-sm text-red-500">{errors.portalUsername}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sendWelcomeEmail"
                        checked={formData.portalAccess.sendWelcomeEmail}
                        onCheckedChange={(checked) => handleInputChange('portalAccess.sendWelcomeEmail', checked)}
                      />
                      <Label htmlFor="sendWelcomeEmail" className="text-sm">
                        Send welcome email with login instructions
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText size={18} />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referralSource">Referral Source</Label>
                  <Input
                    id="referralSource"
                    value={formData.referralSource}
                    onChange={(e) => handleInputChange('referralSource', e.target.value)}
                    placeholder="How did they find you?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional notes about this client..."
                    rows={4}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Client Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
                  </div>
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <div className="flex gap-2">
            {activeTab !== 'basic' && (
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ['basic', 'addresses', 'business', 'portal'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                }}
              >
                Previous
              </Button>
            )}
            
            {activeTab !== 'portal' ? (
              <Button
                onClick={() => {
                  const tabs = ['basic', 'addresses', 'business', 'portal'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
              >
                {isSubmitting ? 'Creating...' : 'Create Client'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 