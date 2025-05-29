import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Repeat, Calendar, DollarSign, Edit } from 'lucide-react';

interface RecurringInvoiceCardProps {
  invoice: {
    id: string;
    number: string;
    clientName: string;
    total: number;
    recurringInterval?: string;
    recurringNextDate?: string;
    status: string;
  };
  onEdit?: (id: string) => void;
  onPause?: (id: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

export function RecurringInvoiceCard({ 
  invoice, 
  onEdit, 
  onPause, 
  formatCurrency, 
  formatDate 
}: RecurringInvoiceCardProps) {
  const getIntervalLabel = (interval: string) => {
    switch (interval) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'semiannually': return 'Semi-annually';
      case 'annually': return 'Annually';
      default: return interval;
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat size={16} className="text-blue-500" />
            {invoice.number}
          </div>
          <Badge variant="secondary" className="text-xs">
            {getIntervalLabel(invoice.recurringInterval || '')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Client:</span>
            <span className="font-medium">{invoice.clientName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">{formatCurrency(invoice.total)}</span>
          </div>
          {invoice.recurringNextDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Calendar size={12} />
                Next Due:
              </span>
              <span className="font-medium text-blue-600">
                {formatDate(invoice.recurringNextDate)}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(invoice.id)}
            className="flex-1"
          >
            <Edit size={14} className="mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPause?.(invoice.id)}
            className="flex-1"
          >
            Pause
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 