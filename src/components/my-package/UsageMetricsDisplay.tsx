import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

// --- Data Types ---
interface SubscriptionUsage {
  firmId: string;
  activeUsers: number;
  totalUsers: number;
  storageUsedGB: number;
  storageLimitGB: number;
  casesCount?: number;
  clientsCount?: number;
  documentsCount?: number;
  dataFetchedAt: string;
}

// --- API Fetching Function ---
const fetchUsage = async (): Promise<SubscriptionUsage> => {
  const res = await fetch('/api/firm/subscription/usage');
  if (!res.ok) throw new Error('Failed to fetch usage details');
  const data = await res.json();
  return data.data; // Assuming backend wraps in { success: true, data: ... }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMMM d, yyyy');
  } catch (e) {
    return 'Invalid Date';
  }
};

export function UsageMetricsDisplay() {
  const { data: usage, isLoading, error } = useQuery<SubscriptionUsage, Error>({
    queryKey: ['firmUsage'],
    queryFn: fetchUsage,
  });

  if (error) {
     return (
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-700">Error Loading Usage Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">
            Failed to load usage metrics. Please try refreshing the page.
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
        <CardTitle>Current Usage</CardTitle>
        {usage && <CardDescription>Data as of {formatDate(usage.dataFetchedAt)}</CardDescription>}
        {isLoading && !usage && <Skeleton className="h-4 w-1/3 mt-1" />}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-full" />
            </div>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </>
        )}
        {usage && (
          <>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Active Users</span>
                <span className="text-sm font-medium">{usage.activeUsers} / {usage.totalUsers}</span>
              </div>
              <Progress value={(usage.activeUsers / usage.totalUsers) * 100} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Storage Used</span>
                <span className="text-sm font-medium">{usage.storageUsedGB.toFixed(2)} GB / {usage.storageLimitGB} GB</span>
              </div>
              <Progress value={(usage.storageUsedGB / usage.storageLimitGB) * 100} className="w-full" />
            </div>
            {usage.casesCount !== undefined && <p><strong>Cases:</strong> {usage.casesCount.toLocaleString()}</p>}
            {usage.clientsCount !== undefined && <p><strong>Clients:</strong> {usage.clientsCount.toLocaleString()}</p>}
            {usage.documentsCount !== undefined && <p><strong>Documents:</strong> {usage.documentsCount.toLocaleString()}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
