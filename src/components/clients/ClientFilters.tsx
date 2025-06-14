import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface ClientFilters {
  categories: string[];
  tags: string[];
  priority: string[];
  status: string[];
  type: string[];
}

interface ClientFiltersProps {
  filters: ClientFilters;
  onFiltersChange: (filters: ClientFilters) => void;
  availableCategories: string[];
  availableTags: string[];
}

export function ClientFilters({
  filters,
  onFiltersChange,
  availableCategories,
  availableTags,
}: ClientFiltersProps) {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked
      ? [...filters.tags, tag]
      : filters.tags.filter(t => t !== tag);
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const newPriority = checked
      ? [...filters.priority, priority]
      : filters.priority.filter(p => p !== priority);
    onFiltersChange({ ...filters, priority: newPriority });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handleTypeChange = (type: string, checked: boolean) => {
    const newType = checked
      ? [...filters.type, type]
      : filters.type.filter(t => t !== type);
    onFiltersChange({ ...filters, type: newType });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      tags: [],
      priority: [],
      status: [],
      type: [],
    });
  };

  const activeFiltersCount = 
    filters.categories.length +
    filters.tags.length +
    filters.priority.length +
    filters.status.length +
    filters.type.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client Type */}
        <div className="space-y-3">
          <Label>Client Type</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-individual"
                checked={filters.type.includes('individual')}
                onCheckedChange={(checked) => handleTypeChange('individual', checked as boolean)}
              />
              <Label htmlFor="type-individual" className="text-sm font-normal cursor-pointer">
                Individual
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="type-business"
                checked={filters.type.includes('business')}
                onCheckedChange={(checked) => handleTypeChange('business', checked as boolean)}
              />
              <Label htmlFor="type-business" className="text-sm font-normal cursor-pointer">
                Business
              </Label>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <Label>Status</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-active"
                checked={filters.status.includes('active')}
                onCheckedChange={(checked) => handleStatusChange('active', checked as boolean)}
              />
              <Label htmlFor="status-active" className="text-sm font-normal cursor-pointer">
                Active
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-inactive"
                checked={filters.status.includes('inactive')}
                onCheckedChange={(checked) => handleStatusChange('inactive', checked as boolean)}
              />
              <Label htmlFor="status-inactive" className="text-sm font-normal cursor-pointer">
                Inactive
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-prospective"
                checked={filters.status.includes('prospective')}
                onCheckedChange={(checked) => handleStatusChange('prospective', checked as boolean)}
              />
              <Label htmlFor="status-prospective" className="text-sm font-normal cursor-pointer">
                Prospective
              </Label>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-3">
          <Label>Priority</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="priority-high"
                checked={filters.priority.includes('high')}
                onCheckedChange={(checked) => handlePriorityChange('high', checked as boolean)}
              />
              <Label htmlFor="priority-high" className="text-sm font-normal cursor-pointer">
                High Priority
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="priority-medium"
                checked={filters.priority.includes('medium')}
                onCheckedChange={(checked) => handlePriorityChange('medium', checked as boolean)}
              />
              <Label htmlFor="priority-medium" className="text-sm font-normal cursor-pointer">
                Medium Priority
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="priority-low"
                checked={filters.priority.includes('low')}
                onCheckedChange={(checked) => handlePriorityChange('low', checked as boolean)}
              />
              <Label htmlFor="priority-low" className="text-sm font-normal cursor-pointer">
                Low Priority
              </Label>
            </div>
          </div>
        </div>

        {/* Categories */}
        {availableCategories.length > 0 && (
          <div className="space-y-3">
            <Label>Categories</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableCategories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`category-${category}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableTags.map(tag => (
                <div key={tag} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag}`}
                    checked={filters.tags.includes(tag)}
                    onCheckedChange={(checked) => handleTagChange(tag, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`tag-${tag}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {tag}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 