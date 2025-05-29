import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

// Case form data interface
interface CaseFormData {
  title: string;
  caseNumber?: string;
  clientId: string;
  practiceArea: string;
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAttorneys: string[];
  opposingCounsel?: string;
  courtInfo?: {
    courtName: string;
    judgeAssigned?: string;
    caseNumber?: string;
  };
  budget?: number;
  estimatedHours?: number;
  description?: string;
  notes?: string;
}

interface CaseFormProps {
  initialData?: Partial<CaseFormData>;
  onSubmit: (data: CaseFormData) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  clients?: Array<{ id: string; firstName: string; lastName: string; company?: string }>;
  attorneys?: Array<{ id: string; firstName: string; lastName: string }>;
}

export function CaseForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  submitButtonText = 'Save Case',
  clients = [],
  attorneys = []
}: CaseFormProps) {
  const [formData, setFormData] = useState<CaseFormData>({
    title: '',
    caseNumber: '',
    clientId: '',
    practiceArea: 'Corporate',
    status: 'active',
    priority: 'medium',
    assignedAttorneys: [],
    opposingCounsel: '',
    courtInfo: {
      courtName: '',
      judgeAssigned: '',
      caseNumber: '',
    },
    budget: undefined,
    estimatedHours: undefined,
    description: '',
    notes: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const practiceAreas = [
    'Corporate', 'Litigation', 'Estate', 'IP', 'Contracts', 
    'Family', 'Criminal', 'Immigration', 'Real Estate', 'Tax'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Case title is required';
    }
    if (!formData.clientId) {
      newErrors.clientId = 'Client selection is required';
    }
    if (formData.assignedAttorneys.length === 0) {
      newErrors.assignedAttorneys = 'At least one attorney must be assigned';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting case form:', error);
    }
  };

  const handleInputChange = (field: keyof CaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCourtInfoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      courtInfo: { ...prev.courtInfo, [field]: value }
    }));
  };

  const handleAttorneyToggle = (attorneyId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assignedAttorneys: checked 
        ? [...prev.assignedAttorneys, attorneyId]
        : prev.assignedAttorneys.filter(id => id !== attorneyId)
    }));
    
    if (errors.assignedAttorneys) {
      setErrors(prev => ({ ...prev, assignedAttorneys: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Case' : 'Create New Case'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                placeholder="Enter case title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                placeholder="Enter case number"
                value={formData.caseNumber}
                onChange={(e) => handleInputChange('caseNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Client *</Label>
              <Select 
                value={formData.clientId} 
                onValueChange={(value) => handleInputChange('clientId', value)}
              >
                <SelectTrigger className={errors.clientId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                      {client.company && ` (${client.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-red-500">{errors.clientId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="practiceArea">Practice Area</Label>
              <Select 
                value={formData.practiceArea} 
                onValueChange={(value) => handleInputChange('practiceArea', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select practice area" />
                </SelectTrigger>
                <SelectContent>
                  {practiceAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assigned Attorneys */}
          <div className="space-y-4">
            <Label>Assigned Attorneys *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attorneys.map((attorney) => (
                <div key={attorney.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`attorney-${attorney.id}`}
                    checked={formData.assignedAttorneys.includes(attorney.id)}
                    onCheckedChange={(checked) => handleAttorneyToggle(attorney.id, checked as boolean)}
                  />
                  <Label htmlFor={`attorney-${attorney.id}`} className="text-sm">
                    {attorney.firstName} {attorney.lastName}
                  </Label>
                </div>
              ))}
            </div>
            {errors.assignedAttorneys && (
              <p className="text-sm text-red-500">{errors.assignedAttorneys}</p>
            )}
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Enter budget amount"
                value={formData.budget || ''}
                onChange={(e) => handleInputChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                placeholder="Enter estimated hours"
                value={formData.estimatedHours || ''}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="opposingCounsel">Opposing Counsel</Label>
            <Input
              id="opposingCounsel"
              placeholder="Enter opposing counsel name"
              value={formData.opposingCounsel}
              onChange={(e) => handleInputChange('opposingCounsel', e.target.value)}
            />
          </div>

          {/* Court Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Court Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="courtName">Court Name</Label>
                <Input
                  id="courtName"
                  placeholder="Enter court name"
                  value={formData.courtInfo?.courtName || ''}
                  onChange={(e) => handleCourtInfoChange('courtName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="judgeAssigned">Judge Assigned</Label>
                <Input
                  id="judgeAssigned"
                  placeholder="Enter judge name"
                  value={formData.courtInfo?.judgeAssigned || ''}
                  onChange={(e) => handleCourtInfoChange('judgeAssigned', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Case Description</Label>
            <Textarea
              id="description"
              placeholder="Enter case description..."
              className="resize-none"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes..."
              className="resize-none"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Saving...' : submitButtonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 