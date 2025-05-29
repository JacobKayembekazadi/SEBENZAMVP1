import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Target, Flag, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (milestone: any) => void;
  milestone?: any;
  caseId: string;
  availableTasks?: any[];
}

export function MilestoneDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  milestone, 
  caseId, 
  availableTasks = [] 
}: MilestoneDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: milestone?.title || '',
    description: milestone?.description || '',
    targetDate: milestone?.targetDate ? new Date(milestone.targetDate) : undefined,
    status: milestone?.status || 'upcoming',
    associatedTasks: milestone?.tasks || [],
    priority: milestone?.priority || 'medium',
    completionCriteria: milestone?.completionCriteria || '',
    dependencies: milestone?.dependencies || []
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Milestone title is required.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.targetDate) {
      toast({
        title: "Validation Error",
        description: "Target date is required.",
        variant: "destructive"
      });
      return;
    }

    const milestoneData = {
      id: milestone?.id || Date.now().toString(),
      ...formData,
      caseId,
      createdDate: milestone?.createdDate || new Date().toISOString(),
      targetDate: formData.targetDate.toISOString()
    };

    onSave(milestoneData);
    onOpenChange(false);
    
    toast({
      title: milestone ? "Milestone Updated" : "Milestone Created",
      description: `Milestone "${formData.title}" has been ${milestone ? 'updated' : 'created'} successfully.`
    });
  };

  const handleTaskToggle = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      associatedTasks: prev.associatedTasks.includes(taskId)
        ? prev.associatedTasks.filter(id => id !== taskId)
        : [...prev.associatedTasks, taskId]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target size={20} />
            {milestone ? 'Edit Milestone' : 'Add New Milestone'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Milestone Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter milestone title..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the milestone..."
                rows={3}
              />
            </div>
          </div>

          {/* Target Date and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Target Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.targetDate ? formData.targetDate.toLocaleDateString() : "Select target date..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.targetDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, targetDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Status</Label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="upcoming">Upcoming</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
          </div>

          {/* Priority and Completion Criteria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <Label>Completion Criteria</Label>
              <Input
                value={formData.completionCriteria}
                onChange={(e) => setFormData(prev => ({ ...prev, completionCriteria: e.target.value }))}
                placeholder="e.g., All documents reviewed"
              />
            </div>
          </div>

          {/* Associated Tasks */}
          {availableTasks.length > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Associated Tasks</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-4 space-y-2">
                {availableTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.associatedTasks.includes(task.id)}
                      onCheckedChange={() => handleTaskToggle(task.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {task.assignee}
                        </Badge>
                        <Badge className={`text-xs ${task.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                {formData.associatedTasks.length} task(s) selected
              </p>
            </div>
          )}

          {/* Dependencies */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Dependencies</Label>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">This milestone depends on:</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Contract review completion</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Client approval received</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Regulatory filing submitted</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Milestone Preview</Label>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{formData.title || 'Milestone Title'}</h4>
                <Badge className={getStatusColor(formData.status)}>
                  {formData.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {formData.description || 'Milestone description will appear here'}
              </p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Target: {formData.targetDate?.toLocaleDateString() || 'No date set'}</span>
                <span>Priority: {formData.priority}</span>
                <span>Tasks: {formData.associatedTasks.length}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {milestone ? 'Update Milestone' : 'Create Milestone'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 