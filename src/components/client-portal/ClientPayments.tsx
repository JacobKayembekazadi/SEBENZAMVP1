import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
}

interface ClientPaymentsProps {
  clientData: ClientData;
}

export function ClientPayments({ clientData }: ClientPaymentsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Payment history features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
} 