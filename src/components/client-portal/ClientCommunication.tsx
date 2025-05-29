import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
}

interface ClientCommunicationProps {
  clientData: ClientData;
}

export function ClientCommunication({ clientData }: ClientCommunicationProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Communication</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Communication features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
} 