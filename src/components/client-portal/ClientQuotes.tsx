import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
}

interface ClientQuotesProps {
  clientData: ClientData;
}

export function ClientQuotes({ clientData }: ClientQuotesProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Quotes & Estimates</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator size={20} />
            Service Quotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Quotes and estimates features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
} 