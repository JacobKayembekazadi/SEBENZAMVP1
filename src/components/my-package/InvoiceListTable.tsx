import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

// --- Data Types ---
interface PlatformInvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
}

interface PlatformInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  currency: 'USD';
  totalAmount: number;
  paymentLink?: string;
  pdfDownloadLink?: string;
  lineItems: PlatformInvoiceItem[];
}

// --- API Fetching Function ---
const fetchInvoices = async (): Promise<PlatformInvoice[]> => {
  const res = await fetch('/api/firm/invoices');
  if (!res.ok) throw new Error('Failed to fetch invoices');
  const data = await res.json();
  return data.data; // Assuming backend wraps in { success: true, data: ... }
};

// --- Helper for Placeholder Alert ---
const FeatureNotImplementedAlert = ({ trigger }: { trigger: React.ReactNode }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Feature Not Implemented</AlertDialogTitle>
        <AlertDialogDescription>
          This feature is currently under development. Please check back later.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction>OK</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch (e) {
    return 'Invalid Date';
  }
};

const formatCurrency = (amountCents?: number, currency: string = 'USD') => {
  if (amountCents === undefined || amountCents === null) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amountCents / 100);
};

export function InvoiceListTable() {
  const { data: invoices, isLoading, error } = useQuery<PlatformInvoice[], Error>({
    queryKey: ['firmInvoices'],
    queryFn: fetchInvoices,
  });

  if (error) {
    return (
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-700">Error Loading Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Failed to load billing history. Please try refreshing the page.
            If the issue persists, please contact support.
          </p>
          {error.message && <p className="text-xs text-red-500 mt-2">Details: {error.message}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        )}
        {invoices && invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell><Badge variant={invoice.status === 'paid' ? 'success' : (invoice.status === 'open' ? 'warning' : 'secondary')}>{invoice.status.toUpperCase()}</Badge></TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {invoice.paymentLink && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer" title="View Invoice Details">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <FeatureNotImplementedAlert trigger={
                      <Button variant="outline" size="sm" title="Download PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                    } />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : !isLoading && <p>No invoices found.</p>}
         {isLoading && !invoices && <p>Loading invoices...</p>}
      </CardContent>
    </Card>
  );
}
