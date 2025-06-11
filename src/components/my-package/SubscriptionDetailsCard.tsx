import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

// --- Data Types ---
interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerUserPerMonth: number;
  pricePerUserPerYear: number;
  features: string[];
  storageLimitGB: number;
  userLimit: number;
}

interface Subscription {
  id: string;
  firmId: string;
  currentPlan: SubscriptionPlan;
  status: 'active' | 'trial' | 'past_due' | 'canceled';
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  isAnnualPlan: boolean;
  autoRenew: boolean;
  paymentMethodId?: string;
  seats: number;
}

// --- API Fetching Function ---
const fetchSubscription = async (): Promise<Subscription> => {
  const res = await fetch('/api/firm/subscription');
  if (!res.ok) throw new Error('Failed to fetch subscription details');
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


export function SubscriptionDetailsCard() {
  const { data: subscription, isLoading, error } = useQuery<Subscription, Error>({
    queryKey: ['firmSubscription'],
    queryFn: fetchSubscription,
  });

  if (error) {
    return (
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-700">Error Loading Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Failed to load subscription details. Please try refreshing the page.
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
        <CardTitle>{subscription?.currentPlan?.name || <Skeleton className="h-8 w-1/2" />}</CardTitle>
        <CardDescription>
          {subscription ? `Status: ` : <Skeleton className="h-4 w-1/4 mt-1" />}
          {subscription && <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>{subscription.status.toUpperCase()}</Badge>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </>
        )}
        {subscription && (
          <>
            <p><strong>Plan:</strong> {subscription.currentPlan.name} ({subscription.isAnnualPlan ? 'Annual' : 'Monthly'})</p>
            <p><strong>Seats:</strong> {subscription.seats} licensed users</p>
            <p><strong>Price:</strong> {formatCurrency(subscription.isAnnualPlan ? subscription.currentPlan.pricePerUserPerYear * subscription.seats : subscription.currentPlan.pricePerUserPerMonth * subscription.seats, 'USD')} / {subscription.isAnnualPlan ? 'year' : 'month'}</p>
            <p><strong>Next Billing Date:</strong> {formatDate(subscription.nextBillingDate)}</p>
            <p><strong>Auto-renews:</strong> {subscription.autoRenew ? 'Yes' : 'No'}</p>
            <p className="font-semibold mt-2">Features:</p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              {subscription.currentPlan.features.map(feature => <li key={feature}>{feature}</li>)}
            </ul>
          </>
        )}
      </CardContent>
      <CardFooter>
        <FeatureNotImplementedAlert trigger={<Button>Upgrade Plan</Button>} />
      </CardFooter>
    </Card>
  );
}
