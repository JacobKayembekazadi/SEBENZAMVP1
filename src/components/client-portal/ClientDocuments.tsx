import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
}

interface ClientDocumentsProps {
  clientData: ClientData;
}

export function ClientDocuments({ clientData }: ClientDocumentsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Document Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Document management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
} 