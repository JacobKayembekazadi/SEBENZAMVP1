import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, PlusCircle, Edit, Trash2 } from 'lucide-react';

// --- Data Types ---
interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  isDefault: boolean;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    nameOnCard?: string;
  };
  bankAccount?: {
    bankName: string;
    accountHolderName?: string;
    accountType?: 'checking' | 'savings';
    last4: string;
  };
}

// --- API Fetching Function ---
const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const res = await fetch('/api/firm/payment-methods');
  if (!res.ok) throw new Error('Failed to fetch payment methods');
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

export function PaymentMethodsList() {
  const { data: paymentMethods, isLoading, error } = useQuery<PaymentMethod[], Error>({
    queryKey: ['firmPaymentMethods'],
    queryFn: fetchPaymentMethods,
  });

  if (error) {
    return (
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-700">Error Loading Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Failed to load payment methods. Please try refreshing the page.
            If the issue persists, please contact support.
          </p>
          {error.message && <p className="text-xs text-red-500 mt-2">Details: {error.message}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Your Payment Methods</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        )}
        {paymentMethods && paymentMethods.map(pm => (
          <Card key={pm.id} className="mb-4">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 mr-4 text-gray-500" />
                <div>
                  <p className="font-semibold">
                    {pm.type === 'card' ? `${pm.card?.brand} ending in ${pm.card?.last4}` : `${pm.bankAccount?.bankName} ending in ${pm.bankAccount?.last4}`}
                    {pm.isDefault && <Badge className="ml-2">Default</Badge>}
                  </p>
                  {pm.type === 'card' && <p className="text-sm text-gray-600">Expires {pm.card?.expMonth}/{pm.card?.expYear}</p>}
                </div>
              </div>
              <div className="space-x-2">
                <FeatureNotImplementedAlert trigger={<Button variant="outline" size="sm"><Edit className="mr-1 h-4 w-4" /> Edit</Button>} />
                {!pm.isDefault && (
                  <FeatureNotImplementedAlert
                    trigger={<Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && paymentMethods && paymentMethods.length === 0 && <p>No payment methods saved.</p>}
        {isLoading && !paymentMethods && <p>Loading payment methods...</p>}
      </CardContent>
      <CardFooter>
        <FeatureNotImplementedAlert trigger={
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Payment Method</Button>
        } />
      </CardFooter>
    </Card>
  );
}
