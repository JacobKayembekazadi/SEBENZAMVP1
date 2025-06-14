import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, X } from 'lucide-react';
import { Client } from '@/lib/store';

interface ClientTagsProps {
  client: Client;
  onUpdate: (tags: string[]) => void;
  allTags?: string[]; // All tags used across all clients
}

export function ClientTags({ client, onUpdate, allTags = [] }: ClientTagsProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = allTags.filter(
    tag => 
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !client.tags.includes(tag)
  );

  const handleAddTag = (tag: string) => {
    if (tag && !client.tags.includes(tag)) {
      onUpdate([...client.tags, tag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    onUpdate(client.tags.filter(t => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      handleAddTag(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Tags
      </Label>
      <div className="flex flex-wrap gap-2">
        {client.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Add tags..."
          className="pr-20"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleAddTag(inputValue)}
          className="absolute right-1 top-1 h-7"
          disabled={!inputValue}
        >
          Add
        </Button>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
            {suggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion}
                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground text-sm"
                onClick={() => handleAddTag(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 