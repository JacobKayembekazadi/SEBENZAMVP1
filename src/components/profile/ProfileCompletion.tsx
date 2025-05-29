import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  firmName: string;
  role: string;
  barNumber: string;
  jurisdiction: string;
  specializations: string[];
  hourlyRate: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  bio: string;
  profilePhoto: string;
}

interface ProfileCompletionProps {
  isOpen: boolean;
  initialData?: Partial<ProfileData>;
  onComplete: (data: ProfileData) => void;
  onSkip: () => void;
}

const practiceAreas = [
  'Corporate Law', 'Litigation', 'Estate Planning', 'Intellectual Property',
  'Contract Law', 'Family Law', 'Criminal Law', 'Immigration Law',
  'Real Estate Law', 'Tax Law', 'Employment Law', 'Personal Injury'
];

export function ProfileCompletion({ isOpen, initialData, onComplete, onSkip }: ProfileCompletionProps) {
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    firmName: '',
    role: 'attorney',
    barNumber: '',
    jurisdiction: '',
    specializations: [],
    hourlyRate: 0,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    bio: '',
    profilePhoto: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate completion percentage
  const calculateCompletion = (): number => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'firmName', 'role', 'barNumber', 'jurisdiction'
    ];
    const optionalFields = [
      'specializations', 'hourlyRate', 'address.street', 'address.city', 'address.state', 'address.zipCode', 'bio'
    ];

    let completed = 0;
    let total = requiredFields.length + optionalFields.length;

    // Check required fields
    requiredFields.forEach(field => {
      if (formData[field as keyof ProfileData] && 
          String(formData[field as keyof ProfileData]).trim()) {
        completed++;
      }
    });

    // Check optional fields
    if (formData.specializations.length > 0) completed++;
    if (formData.hourlyRate > 0) completed++;
    if (formData.address.street.trim()) completed++;
    if (formData.address.city.trim()) completed++;
    if (formData.address.state.trim()) completed++;
    if (formData.address.zipCode.trim()) completed++;
    if (formData.bio.trim()) completed++;

    return Math.round((completed / total) * 100);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.firmName.trim()) newErrors.firmName = 'Firm name is required';
    if (!formData.jurisdiction.trim()) newErrors.jurisdiction = 'Jurisdiction is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ProfileData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const completionPercentage = calculateCompletion();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8 shadow-2xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Complete Your Profile
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Help us personalize your experience and ensure all features work optimally.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </Button>
          </div>
          
          {/* Progress Indicator */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Profile Completion
              </span>
              <Badge className={`${
                completionPercentage >= 80 ? 'bg-green-600' : 
                completionPercentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'
              } text-white`}>
                {completionPercentage}%
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
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
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firmName">Firm Name *</Label>
                  <Input
                    id="firmName"
                    value={formData.firmName}
                    onChange={(e) => handleInputChange('firmName', e.target.value)}
                    className={errors.firmName ? 'border-red-500' : ''}
                  />
                  {errors.firmName && <p className="text-sm text-red-500">{errors.firmName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attorney">Attorney</SelectItem>
                      <SelectItem value="paralegal">Paralegal</SelectItem>
                      <SelectItem value="assistant">Legal Assistant</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barNumber">Bar Number</Label>
                  <Input
                    id="barNumber"
                    value={formData.barNumber}
                    onChange={(e) => handleInputChange('barNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction *</Label>
                  <Input
                    id="jurisdiction"
                    placeholder="e.g., California, New York"
                    value={formData.jurisdiction}
                    onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                    className={errors.jurisdiction ? 'border-red-500' : ''}
                  />
                  {errors.jurisdiction && <p className="text-sm text-red-500">{errors.jurisdiction}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate || ''}
                    onChange={(e) => handleInputChange('hourlyRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Practice Areas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Practice Areas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {practiceAreas.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={formData.specializations.includes(area)}
                      onCheckedChange={() => handleSpecializationToggle(area)}
                    />
                    <Label htmlFor={area} className="text-sm">
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Professional Bio</h3>
              <div className="space-y-2">
                <Label htmlFor="bio">Tell us about yourself and your practice</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Describe your experience, expertise, and what makes your practice unique..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onSkip}
                disabled={isSubmitting}
              >
                Skip for Now
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
              >
                {isSubmitting ? 'Saving...' : 'Complete Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 