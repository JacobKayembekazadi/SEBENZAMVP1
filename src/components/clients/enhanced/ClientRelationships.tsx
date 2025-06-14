import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Link2, 
  Building,
  User,
  X
} from 'lucide-react';
import { Client } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

interface ClientRelationshipsProps {
  client: Client;
  allClients: Client[];
  onUpdate: (relatedClients: string[]) => void;
}

export function ClientRelationships({ client, allClients, onUpdate }: ClientRelationshipsProps) {
  const [isAddingRelationship, setIsAddingRelationship] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const relatedClients = allClients.filter(c => 
    client.relatedClients.includes(c.id)
  );

  const availableClients = allClients.filter(c => 
    c.id !== client.id && 
    !client.relatedClients.includes(c.id) &&
    (c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.company?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddRelationship = (clientId: string) => {
    onUpdate([...client.relatedClients, clientId]);
    setIsAddingRelationship(false);
    setSearchQuery('');
  };

  const handleRemoveRelationship = (clientId: string) => {
    onUpdate(client.relatedClients.filter(id => id !== clientId));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Related Clients
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddingRelationship(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relatedClients.map((relatedClient) => (
            <div
              key={relatedClient.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getInitials(relatedClient.firstName, relatedClient.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {relatedClient.firstName} {relatedClient.lastName}
                    </p>
                    {relatedClient.type === 'business' ? (
                      <Building className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <User className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  {relatedClient.company && (
                    <p className="text-xs text-muted-foreground">
                      {relatedClient.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {relatedClient.status}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveRelationship(relatedClient.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          {relatedClients.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No related clients yet</p>
              <p className="text-xs mt-1">
                Add relationships to track connected clients
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Relationship Dialog */}
      <Dialog open={isAddingRelationship} onOpenChange={setIsAddingRelationship}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Related Client</DialogTitle>
          </DialogHeader>
          <Command>
            <CommandInput
              placeholder="Search clients..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandEmpty>No clients found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {availableClients.map((availableClient) => (
                <CommandItem
                  key={availableClient.id}
                  onSelect={() => handleAddRelationship(availableClient.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(availableClient.firstName, availableClient.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {availableClient.firstName} {availableClient.lastName}
                      </p>
                      {availableClient.company && (
                        <p className="text-xs text-muted-foreground">
                          {availableClient.company}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {availableClient.type}
                    </Badge>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 