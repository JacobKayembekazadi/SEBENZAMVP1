import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, DollarSign, User, Plus, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface Case {
  id: string;
  title: string;
  caseNumber?: string;
  description?: string;
  status: string;
  priority: string;
  practiceArea?: string;
  openedDate: Date;
  closedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  budget: number;
  expenses: number;
  assignedAttorneys?: string[];
  clientId?: string;
  client: string;
  phase?: string;
  progress: number;
  clientCanView?: boolean;
  clientCanComment?: boolean;
  courtInfo?: {
    courtName: string;
    judgeAssigned: string;
    caseNumber: string;
  };
  opposingCounsel?: string;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface EditCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  case: Case | null;
  onCaseUpdated?: (updatedCase: Case) => void;
}

export function EditCaseDialog({ open, onOpenChange, case: caseData, onCaseUpdated }: EditCaseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [formData, setFormData] = useState({
    title: '',
    caseNumber: '',
    description: '',
    status: 'active',
    priority: 'medium',
    practiceArea: '',
    openedDate: '',
    closedDate: '',
    estimatedHours: 0,
    actualHours: 0,
    budget: 0,
    expenses: 0,
    assignedAttorneys: [] as string[],
    clientId: '',
    client: '',
    phase: '',
    progress: 0,
    clientCanView: false,
    clientCanComment: false,
    courtInfo: {
      courtName: '',
      judgeAssigned: '',
      caseNumber: ''
    },
    opposingCounsel: '',
    notes: '',
    tags: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAttorney, setNewAttorney] = useState('');
  const [newTag, setNewTag] = useState('');

  // Available options
  const practiceAreas = [
    'Corporate', 'Litigation', 'Estate', 'IP', 'Contracts', 
    'Family', 'Criminal', 'Immigration', 'Real Estate', 'Tax'
  ];

  const phases = [
    'Discovery', 'Investigation', 'Negotiation', 'Mediation', 
    'Trial Preparation', 'Trial', 'Appeals', 'Settlement'
  ];

  const availableAttorneys = [
    'John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Davis', 
    'Robert Wilson', 'Emily Brown', 'David Miller', 'Lisa Anderson'
  ];

  // Pre-populate form when case changes
  useEffect(() => {
    if (caseData && open) {
      setFormData({
        title: caseData.title || '',
        caseNumber: caseData.caseNumber || '',
        description: caseData.description || '',
        status: caseData.status || 'active',
        priority: caseData.priority || 'medium',
        practiceArea: caseData.practiceArea || '',
        openedDate: caseData.openedDate ? new Date(caseData.openedDate).toISOString().split('T')[0] : '',
        closedDate: caseData.closedDate ? new Date(caseData.closedDate).toISOString().split('T')[0] : '',
        estimatedHours: caseData.estimatedHours || 0,
        actualHours: caseData.actualHours || 0,
        budget: caseData.budget || 0,
        expenses: caseData.expenses || 0,
        assignedAttorneys: caseData.assignedAttorneys || [],
        clientId: caseData.clientId || '',
        client: caseData.client || '',
        phase: caseData.phase || '',
        progress: caseData.progress || 0,
        clientCanView: caseData.clientCanView || false,
        clientCanComment: caseData.clientCanComment || false,
        courtInfo: {
          courtName: caseData.courtInfo?.courtName || '',
          judgeAssigned: caseData.courtInfo?.judgeAssigned || '',
          caseNumber: caseData.courtInfo?.caseNumber || ''
        },
        opposingCounsel: caseData.opposingCounsel || '',
        notes: caseData.notes || '',
        tags: caseData.tags || []
      });
      setErrors({});
      setActiveTab('basic');
    }
  }, [caseData, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Case title is required';
    if (!formData.practiceArea) newErrors.practiceArea = 'Practice area is required';
    if (!formData.clientId && !formData.client) newErrors.client = 'Client is required';
    if (!formData.openedDate) newErrors.openedDate = 'Start date is required';
    if (formData.budget < 0) newErrors.budget = 'Budget cannot be negative';
    if (formData.estimatedHours < 0) newErrors.estimatedHours = 'Estimated hours cannot be negative';
    if (formData.progress < 0 || formData.progress > 100) newErrors.progress = 'Progress must be between 0 and 100';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddAttorney = () => {
    if (newAttorney.trim() && !formData.assignedAttorneys.includes(newAttorney.trim())) {
      setFormData(prev => ({
        ...prev,
        assignedAttorneys: [...prev.assignedAttorneys, newAttorney.trim()]
      }));
      setNewAttorney('');
    }
  };

  const handleRemoveAttorney = (attorney: string) => {
    setFormData(prev => ({
      ...prev,
      assignedAttorneys: prev.assignedAttorneys.filter(a => a !== attorney)
    }));
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

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async () => {
    if (!caseData || !validateForm()) return;

    setIsSubmitting(true);
    try {
      // In a real app, you would call the API here
      // const updatedCase = await casesApi.update(caseData.id, formData);
      
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedCase: Case = {
        ...caseData,
        ...formData,
        id: caseData.id,
        createdAt: caseData.createdAt,
        updatedAt: new Date(),
        openedDate: new Date(formData.openedDate),
        closedDate: formData.closedDate ? new Date(formData.closedDate) : undefined,
      } as Case;

      onCaseUpdated?.(updatedCase);
      onOpenChange(false);
      
      toast({
        title: "Case Updated",
        description: `${formData.title} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!caseData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Edit Case: {caseData.title}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="budget">Budget & Timeline</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <div className="mt-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Case Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Case Title</Label>
                      <Input
                        id="title"
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
                        value={formData.caseNumber}
                        onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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

                    <div className="space-y-2">
                      <Label htmlFor="practiceArea">Practice Area</Label>
                      <Select value={formData.practiceArea} onValueChange={(value) => handleInputChange('practiceArea', value)}>
                        <SelectTrigger className={errors.practiceArea ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select practice area" />
                        </SelectTrigger>
                        <SelectContent>
                          {practiceAreas.map((area) => (
                            <SelectItem key={area} value={area}>{area}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.practiceArea && (
                        <p className="text-sm text-red-500">{errors.practiceArea}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="client">Client</Label>
                      <Input
                        id="client"
                        value={formData.client}
                        onChange={(e) => handleInputChange('client', e.target.value)}
                        className={errors.client ? 'border-red-500' : ''}
                      />
                      {errors.client && (
                        <p className="text-sm text-red-500">{errors.client}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phase">Phase</Label>
                      <Select value={formData.phase} onValueChange={(value) => handleInputChange('phase', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select phase" />
                        </SelectTrigger>
                        <SelectContent>
                          {phases.map((phase) => (
                            <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Progress ({formData.progress}%)</Label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                        className={errors.progress ? 'border-red-500' : ''}
                      />
                      <Progress value={formData.progress} className="w-full" />
                      {errors.progress && (
                        <p className="text-sm text-red-500">{errors.progress}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assigned Attorneys
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={newAttorney} onValueChange={setNewAttorney}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select attorney to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAttorneys
                          .filter(attorney => !formData.assignedAttorneys.includes(attorney))
                          .map((attorney) => (
                            <SelectItem key={attorney} value={attorney}>{attorney}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddAttorney} disabled={!newAttorney}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.assignedAttorneys.map((attorney) => (
                      <Badge key={attorney} variant="secondary" className="flex items-center gap-1">
                        {attorney}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveAttorney(attorney)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Court Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="courtName">Court Name</Label>
                      <Input
                        id="courtName"
                        value={formData.courtInfo.courtName}
                        onChange={(e) => handleInputChange('courtInfo.courtName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="judgeAssigned">Judge Assigned</Label>
                      <Input
                        id="judgeAssigned"
                        value={formData.courtInfo.judgeAssigned}
                        onChange={(e) => handleInputChange('courtInfo.judgeAssigned', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courtCaseNumber">Court Case Number</Label>
                    <Input
                      id="courtCaseNumber"
                      value={formData.courtInfo.caseNumber}
                      onChange={(e) => handleInputChange('courtInfo.caseNumber', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="opposingCounsel">Opposing Counsel</Label>
                    <Input
                      id="opposingCounsel"
                      value={formData.opposingCounsel}
                      onChange={(e) => handleInputChange('opposingCounsel', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} disabled={!newTag.trim()}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget & Financial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Total Budget</Label>
                      <Input
                        id="budget"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                        className={errors.budget ? 'border-red-500' : ''}
                      />
                      {errors.budget && (
                        <p className="text-sm text-red-500">{errors.budget}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expenses">Current Expenses</Label>
                      <Input
                        id="expenses"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.expenses}
                        onChange={(e) => handleInputChange('expenses', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Budget Overview</Label>
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between">
                        <span>Total Budget:</span>
                        <span className="font-medium">${formData.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Expenses:</span>
                        <span className="text-red-600">${formData.expenses.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Remaining:</span>
                        <span className={`font-bold ${formData.budget - formData.expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${(formData.budget - formData.expenses).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedHours">Estimated Hours</Label>
                      <Input
                        id="estimatedHours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.estimatedHours}
                        onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                        className={errors.estimatedHours ? 'border-red-500' : ''}
                      />
                      {errors.estimatedHours && (
                        <p className="text-sm text-red-500">{errors.estimatedHours}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="actualHours">Actual Hours</Label>
                      <Input
                        id="actualHours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={formData.actualHours}
                        onChange={(e) => handleInputChange('actualHours', parseFloat(e.target.value) || 0)}
                        disabled
                      />
                      <p className="text-xs text-gray-500">This is calculated from time entries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openedDate">Start Date</Label>
                      <Input
                        id="openedDate"
                        type="date"
                        value={formData.openedDate}
                        onChange={(e) => handleInputChange('openedDate', e.target.value)}
                        className={errors.openedDate ? 'border-red-500' : ''}
                      />
                      {errors.openedDate && (
                        <p className="text-sm text-red-500">{errors.openedDate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="closedDate">End Date (Optional)</Label>
                      <Input
                        id="closedDate"
                        type="date"
                        value={formData.closedDate}
                        onChange={(e) => handleInputChange('closedDate', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Access & Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="clientCanView"
                        checked={formData.clientCanView}
                        onCheckedChange={(checked) => handleInputChange('clientCanView', checked)}
                      />
                      <Label htmlFor="clientCanView">Client can view this case</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="clientCanComment"
                        checked={formData.clientCanComment}
                        onCheckedChange={(checked) => handleInputChange('clientCanComment', checked)}
                      />
                      <Label htmlFor="clientCanComment">Client can add comments</Label>
                    </div>
                  </div>

                  {formData.clientCanView && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        When enabled, clients will be able to view case details, progress, and updates through their portal.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      placeholder="Add any internal notes or comments about this case..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Case'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 