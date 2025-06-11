import { render, screen, within } from '@testing-library/react';
import { SubscriptionDetailsCard } from '../SubscriptionDetailsCard'; // Adjust path as necessary
import '@testing-library/jest-dom'; // For .toBeInTheDocument() etc.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock @tanstack/react-query
// We need to mock the whole module, then provide specific implementations for useQuery
jest.mock('@tanstack/react-query', () => {
  const originalModule = jest.requireActual('@tanstack/react-query');
  return {
    ...originalModule,
    useQuery: jest.fn(),
  };
});

// Helper to access the mocked useQuery
const mockUseQuery = jest.requireMock('@tanstack/react-query').useQuery;

// It's good practice to wrap components that use react-query hooks with QueryClientProvider
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Set staleTime to Infinity to prevent refetches during tests if not desired
        staleTime: Infinity,
        // Disable retries for tests to make them run faster and avoid flakiness
        retry: false,
      },
    },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('SubscriptionDetailsCard Component', () => {
  afterEach(() => {
    // Clear all mock implementations after each test
    mockUseQuery.mockReset();
  });

  test('renders loading state correctly', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(
      <AllTheProviders>
        <SubscriptionDetailsCard />
      </AllTheProviders>
    );

    // Check for skeleton elements. The exact number and structure might depend on your Skeleton implementation.
    // Here, we check if at least one common pattern of skeleton is present.
    const skeletons = screen.getAllByRole('generic', { name: '' }); // Skeleton often doesn't have a specific role or name
    // A more robust way would be to add data-testid="loading-skeleton" to your Skeleton components
    // For now, let's assume skeletons are rendered and check for a title placeholder
    expect(screen.getByRole('heading', { name: '' })).toBeInTheDocument(); // Title skeleton
    // Check for placeholder text if any, or absence of data
    expect(screen.queryByText('Plan:')).not.toBeInTheDocument();
  });

  test('renders error state correctly', () => {
    const errorMessage = 'Failed to fetch subscription details';
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error(errorMessage), // Pass an actual Error object
    });

    render(
      <AllTheProviders>
        <SubscriptionDetailsCard />
      </AllTheProviders>
    );

    expect(screen.getByText(`Could not load subscription details: ${errorMessage}`)).toBeInTheDocument();
  });

  test('renders subscription data correctly when fetched', () => {
    const mockSubscriptionData = {
      id: 'sub_123',
      firmId: 'firm_abc',
      currentPlan: {
        id: 'plan_pro',
        name: 'Pro Plan Deluxe',
        pricePerUserPerMonth: 79,
        pricePerUserPerYear: 850,
        features: ['Feature A', 'Feature B', 'Unlimited Widgets'],
        storageLimitGB: 1000,
        userLimit: 50,
      },
      status: 'active' as 'active' | 'trial' | 'past_due' | 'canceled',
      startDate: '2023-01-15T00:00:00Z',
      nextBillingDate: '2024-09-15T00:00:00Z',
      isAnnualPlan: false,
      autoRenew: true,
      seats: 12,
    };

    mockUseQuery.mockReturnValue({
      data: mockSubscriptionData,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <AllTheProviders>
        <SubscriptionDetailsCard />
      </AllTheProviders>
    );

    // Check for plan name in the title
    expect(screen.getByRole('heading', { name: mockSubscriptionData.currentPlan.name })).toBeInTheDocument();

    // Check for status badge
    const statusBadge = screen.getByText(mockSubscriptionData.status.toUpperCase());
    expect(statusBadge).toBeInTheDocument();

    // Check for specific data points
    expect(screen.getByText((content, element) => element?.textContent === `Plan: ${mockSubscriptionData.currentPlan.name} (Monthly)`)).toBeInTheDocument();
    expect(screen.getByText((content, element) => element?.textContent === `Seats: ${mockSubscriptionData.seats} licensed users`)).toBeInTheDocument();
    expect(screen.getByText('Next Billing Date:')).toBeInTheDocument();
    expect(screen.getByText('September 15, 2024')).toBeInTheDocument(); // Formatted date
    expect(screen.getByText('Auto-renews:')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();

    // Check for features
    expect(screen.getByText('Features:')).toBeInTheDocument();
    mockSubscriptionData.currentPlan.features.forEach(feature => {
      expect(screen.getByText(feature)).toBeInTheDocument();
    });

    // Check for price - this requires careful matching due to formatting
    // Example: $948.00 / month (for 12 users * $79/month)
    const expectedPriceString = `$${(mockSubscriptionData.currentPlan.pricePerUserPerMonth * mockSubscriptionData.seats).toFixed(2)}`;
    // Using a function with text content matching to be more robust
    const priceElement = screen.getByText((content, node) => {
        const hasText = (node: Element) => node.textContent?.includes(expectedPriceString) && node.textContent?.includes('/ month');
        const nodeHasText = hasText(node);
        const childrenDontHaveText = Array.from(node.children).every(
            (child) => !hasText(child as Element)
        );
        return nodeHasText && childrenDontHaveText;
    });
    expect(priceElement).toBeInTheDocument();


    // Check for the "Upgrade Plan" button
    expect(screen.getByRole('button', { name: 'Upgrade Plan' })).toBeInTheDocument();
  });
});
