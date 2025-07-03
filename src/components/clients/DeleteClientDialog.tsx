import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/lib/store';

interface DeleteClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onClientDeleted?: (clientId: string) => void;
}

export function DeleteClientDialog({ open, onOpenChange, client, onClientDeleted }: DeleteClientDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  
  const expectedConfirmation = client ? `${client.firstName} ${client.lastName}` : '';
  const isConfirmationValid = confirmationText.trim() === expectedConfirmation;

  const handleDelete = async () => {
    if (!client || !isConfirmationValid) return;

    setIsDeleting(true);
    try {
      // In a real app, you would call the API here
      // await clientsApi.delete(client.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClientDeleted?.(client.id);
      onOpenChange(false);
      setConfirmationText('');
      
      toast({
        title: "Client Deleted",
        description: `${client.firstName} ${client.lastName} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setConfirmationText('');
    onOpenChange(false);
  };

  if (!client) return null;

  // Check if client has associated data that would be affected
  const hasActiveCases = client.activity?.some(activity => 
    activity.type === 'case' || activity.description.toLowerCase().includes('case')
  );
  const hasDocuments = client.documents?.length > 0;
  const hasPaymentHistory = client.metrics?.paymentHistory?.length > 0;
  const hasRelatedClients = client.relatedClients?.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Client
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              You are about to permanently delete{' '}
              <span className="font-semibold">{client.firstName} {client.lastName}</span>
              {client.company && ` from ${client.company}`}.
            </p>
            
            {/* Warning about associated data */}
            {(hasActiveCases || hasDocuments || hasPaymentHistory || hasRelatedClients) && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Warning:</strong> This client has associated data:
                  <ul className="mt-2 space-y-1 text-sm">
                    {hasActiveCases && <li>• Active cases or case history</li>}
                    {hasDocuments && <li>• {client.documents.length} document(s)</li>}
                    {hasPaymentHistory && <li>• Payment history ({client.metrics.paymentHistory.length} transaction(s))</li>}
                    {hasRelatedClients && <li>• {client.relatedClients.length} related client(s)</li>}
                  </ul>
                  <p className="mt-2 text-sm">
                    All associated data will be permanently deleted and cannot be recovered.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirmation" className="text-sm font-medium">
                To confirm deletion, type the client's full name:
              </Label>
              <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded font-mono">
                {expectedConfirmation}
              </div>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type the client's full name"
                className={confirmationText && !isConfirmationValid ? 'border-red-500' : ''}
              />
              {confirmationText && !isConfirmationValid && (
                <p className="text-xs text-red-500">
                  The name doesn't match. Please type exactly: {expectedConfirmation}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              'Deleting...'
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Client
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 