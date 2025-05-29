import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderClosed } from 'lucide-react';

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  cases: Array<{ id: string; title: string; status: string }>;
}

interface ClientCasesProps {
  clientData: ClientData;
}

export function ClientCases({ clientData }: ClientCasesProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Cases</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderClosed size={20} />
            Case Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Case management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
} 