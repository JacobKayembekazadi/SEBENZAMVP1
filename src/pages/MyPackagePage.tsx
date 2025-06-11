import { Helmet } from 'react-helmet-async';
import { SubscriptionDetailsCard } from '@/components/my-package/SubscriptionDetailsCard';
import { UsageMetricsDisplay } from '@/components/my-package/UsageMetricsDisplay';
import { InvoiceListTable } from '@/components/my-package/InvoiceListTable';
import { PaymentMethodsList } from '@/components/my-package/PaymentMethodsList';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ui/error-boundary'; // Assuming this is the correct path

const queryClient = new QueryClient();

export function MyPackagePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <title>My Package - Sebenza</title>
      </Helmet>
      <ErrorBoundary fallback={<div className="container mx-auto p-8 text-center"><p className="text-red-600 text-lg">We encountered an issue loading the package details. Please try again later.</p></div>}>
        <div className="container mx-auto p-4 md:p-8 space-y-10"> {/* Increased spacing */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-800">My Package</h1> {/* Enhanced title styling */}

          {/* Subscription Overview Section */}
        <section id="subscription-overview" aria-labelledby="subscription-title">
          <h2 id="subscription-title" className="text-2xl font-semibold mb-4 text-gray-700 sr-only">Subscription Overview</h2>
          <SubscriptionDetailsCard />
        </section>

        {/* Usage Monitoring Section */}
        <section id="usage-monitoring" aria-labelledby="usage-title">
          <h2 id="usage-title" className="text-2xl font-semibold mb-4 text-gray-700 sr-only">Usage Monitoring</h2>
          <UsageMetricsDisplay />
        </section>

        {/* Billing History Section */}
        <section id="billing-history" aria-labelledby="billing-title">
          <h2 id="billing-title" className="text-2xl font-semibold mb-4 text-gray-700 sr-only">Billing History</h2>
          <InvoiceListTable />
        </section>

        {/* Payment Methods Section */}
        <section id="payment-methods" aria-labelledby="payment-title">
          <h2 id="payment-title" className="text-2xl font-semibold mb-4 text-gray-700 sr-only">Payment Methods</h2>
          <PaymentMethodsList />
        </section>
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default MyPackagePage;