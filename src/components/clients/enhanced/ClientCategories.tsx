import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Client } from '@/lib/store';

interface ClientCategoriesProps {
  client: Client;
  onUpdate: (categories: string[]) => void;
}

const categoryColors: Record<string, string> = {
  'Corporate': 'bg-blue-500',
  'Individual': 'bg-green-500',
  'Non-Profit': 'bg-purple-500',
  'Government': 'bg-orange-500',
  'Startup': 'bg-pink-500',
  'Enterprise': 'bg-indigo-500',
  'Small Business': 'bg-yellow-500',
  'VIP': 'bg-red-500',
};

export function ClientCategories({ client, onUpdate }: ClientCategoriesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory && !client.categories.includes(newCategory)) {
      onUpdate([...client.categories, newCategory]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    onUpdate(client.categories.filter(c => c !== category));
  };

  const getColorClass = (category: string) => {
    return categoryColors[category] || 'bg-gray-500';
  };

  return (
    <div className="space-y-2">
      <Label>Categories</Label>
      <div className="flex flex-wrap gap-2">
        {client.categories.map((category) => (
          <Badge
            key={category}
            className={`${getColorClass(category)} text-white hover:opacity-80`}
          >
            {category}
            <button
              onClick={() => handleRemoveCategory(category)}
              className="ml-1 hover:text-gray-200"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <Label>Add Category</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Category name"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCategory();
                      setIsOpen(false);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    handleAddCategory();
                    setIsOpen(false);
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Suggestions</Label>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(categoryColors)
                    .filter(cat => !client.categories.includes(cat))
                    .map(cat => (
                      <Badge
                        key={cat}
                        variant="outline"
                        className="cursor-pointer text-xs"
                        onClick={() => {
                          onUpdate([...client.categories, cat]);
                          setIsOpen(false);
                        }}
                      >
                        {cat}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
} 