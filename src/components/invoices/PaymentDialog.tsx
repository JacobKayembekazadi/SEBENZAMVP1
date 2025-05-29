import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentData {
  amount: number;
  method: string;
  reference: string;
  date: string;
  notes: string;
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
  onPaymentAdded: (paymentData: PaymentData) => void;
}

export function PaymentDialog({ open, onOpenChange, invoice, onPaymentAdded }: PaymentDialogProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    method: 'credit_card',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const remainingAmount = invoice ? invoice.total - invoice.paidAmount : 0;

  const handleInputChange = (field: keyof PaymentData, value: any) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentData.amount || paymentData.amount <= 0) {
      newErrors.amount = 'Payment amount must be greater than 0';
    } else if (paymentData.amount > remainingAmount) {
      newErrors.amount = `Payment amount cannot exceed remaining balance of ${formatCurrency(remainingAmount)}`;
    }

    if (!paymentData.method) newErrors.method = 'Payment method is required';
    if (!paymentData.date) newErrors.date = 'Payment date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onPaymentAdded(paymentData);
      onOpenChange(false);
      
      // Reset form
      setPaymentData({
        amount: 0,
        method: 'credit_card',
        reference: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      toast({
        title: "Payment Added",
        description: `Payment of ${formatCurrency(paymentData.amount)} has been recorded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      cash: 'Cash',
      wire_transfer: 'Wire Transfer',
      ach: 'ACH Transfer',
      other: 'Other'
    };
    return methods[method] || method;
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CreditCard size={20} />
            Add Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice:</span>
                <span className="font-medium">{invoice.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Client:</span>
                <span className="font-medium">{invoice.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 font-medium">Remaining Balance:</span>
                <span className="font-bold text-lg">{formatCurrency(remainingAmount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <DollarSign size={16} />
                  Payment Amount *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  min="0"
                  max={remainingAmount}
                  step="0.01"
                  placeholder="0.00"
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('amount', remainingAmount)}
                  >
                    Pay Full Amount
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange('amount', remainingAmount / 2)}
                  >
                    Pay Half
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method *</Label>
                <Select value={paymentData.method} onValueChange={(value) => handleInputChange('method', value)}>
                  <SelectTrigger className={errors.method ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                    <SelectItem value="ach">ACH Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.method && <p className="text-sm text-red-500">{errors.method}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Payment Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number (Optional)</Label>
                <Input
                  id="reference"
                  value={paymentData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  placeholder="Transaction ID, check number, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText size={16} />
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={paymentData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes about this payment..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payment Method:</span>
                  <span className="font-medium">{getPaymentMethodLabel(paymentData.method)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Amount:</span>
                  <span className="font-medium">{formatCurrency(paymentData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining After Payment:</span>
                  <span className="font-medium">{formatCurrency(remainingAmount - paymentData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t pt-2">
                  <span>New Status:</span>
                  <span className={
                    remainingAmount - paymentData.amount <= 0 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }>
                    {remainingAmount - paymentData.amount <= 0 ? 'Paid in Full' : 'Partially Paid'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !paymentData.amount}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {isProcessing ? 'Processing...' : 'Add Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 