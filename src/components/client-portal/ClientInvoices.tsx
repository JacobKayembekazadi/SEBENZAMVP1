import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, CreditCard, Download, Eye, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  caseId?: string;
  caseName?: string;
}

interface ClientInvoicesProps {
  clientData: ClientData;
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    number: 'INV-2024-001',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    amount: 2500.00,
    status: 'pending',
    description: 'Legal consultation and document review',
    caseId: 'case_1',
    caseName: 'Contract Review'
  },
  {
    id: 'inv_002',
    number: 'INV-2024-002',
    date: '2024-01-01',
    dueDate: '2024-02-01',
    amount: 1800.00,
    status: 'paid',
    description: 'Litigation support services',
    caseId: 'case_2',
    caseName: 'Employment Dispute'
  },
  {
    id: 'inv_003',
    number: 'INV-2023-089',
    date: '2023-12-15',
    dueDate: '2024-01-15',
    amount: 3200.00,
    status: 'overdue',
    description: 'Corporate restructuring consultation',
    caseId: 'case_3',
    caseName: 'Business Acquisition'
  }
];

export function ClientInvoices({ clientData }: ClientInvoicesProps) {
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    setIsPaymentProcessing(true);
    setSelectedInvoice(invoice);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful",
        description: `Payment of ${formatCurrency(invoice.amount)} has been processed successfully.`,
      });

      // In a real app, this would update the invoice status
      // and redirect to a payment confirmation page
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPaymentProcessing(false);
      setSelectedInvoice(null);
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast({
      title: "Download Started",
      description: `Downloading invoice ${invoice.number}...`,
    });
    // In a real app, this would trigger a PDF download
  };

  const handleViewInvoice = (invoice: Invoice) => {
    toast({
      title: "Opening Invoice",
      description: `Opening invoice ${invoice.number} in a new window...`,
    });
    // In a real app, this would open the invoice in a modal or new tab
  };

  const getTotalAmount = () => {
    return mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  };

  const getPendingAmount = () => {
    return mockInvoices
      .filter(invoice => invoice.status === 'pending' || invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{mockInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalAmount())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar size={24} className="text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(getPendingAmount())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>
                      {invoice.caseName && (
                        <span className="text-sm text-gray-600">{invoice.caseName}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={invoice.description}>
                        {invoice.description}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download size={16} className="mr-1" />
                          Download
                        </Button>
                        {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                          <Button
                            size="sm"
                            onClick={() => handlePayInvoice(invoice)}
                            disabled={isPaymentProcessing && selectedInvoice?.id === invoice.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <CreditCard size={16} className="mr-1" />
                            {isPaymentProcessing && selectedInvoice?.id === invoice.id ? 'Processing...' : 'Pay Now'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Notice */}
      {mockInvoices.some(inv => inv.status === 'pending' || inv.status === 'overdue') && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <CreditCard size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">Secure Online Payments</h3>
                <p className="text-sm text-blue-700 mt-1">
                  You can pay your invoices securely online using credit card, debit card, or bank transfer. 
                  All payments are processed through our secure payment gateway and you'll receive an email confirmation.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>Accepted Payment Methods:</strong> Visa, MasterCard, American Express, Discover, Bank Transfer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 