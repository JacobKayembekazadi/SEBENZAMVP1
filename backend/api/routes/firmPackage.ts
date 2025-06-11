import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { checkPermission } from '../middleware/rbac'; // Assuming this middleware exists and works
import { logger } from '../utils/logger';
import { z, ZodError } from 'zod';

const router = Router();

// --- Zod Schemas for Validation ---
const UpgradeSubscriptionSchema = z.object({
  newPlanId: z.string().min(1, { message: "New plan ID is required." }),
  seats: z.number().int().positive({ message: "Number of seats must be a positive integer." }).optional(),
  isAnnual: z.boolean().optional(),
});

const AddPaymentMethodSchema = z.object({
  paymentMethodToken: z.string().min(1, { message: "Payment method token is required." }),
  isDefault: z.boolean().optional(),
});

const UpdatePaymentMethodSchema = z.object({
  isDefault: z.boolean({ required_error: "isDefault flag is required." }), // Example: making it required for update
  billingAddress: z.object({
    street: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(2).optional(), // Assuming 2-letter state codes
    postalCode: z.string().min(5).optional(),
    country: z.string().min(2).optional(), // Assuming 2-letter country codes
  }).optional(),
});

// Assuming MongoDB ObjectId or similar format. Adjust regex if UUID or other format is used.
// For mock IDs like 'inv_platform_A123XYZ', a simpler string min(1) might be more appropriate.
// Using a more generic string schema for mock IDs for now.
const GenericIdParamsSchema = z.object({
  id: z.string().min(1, { message: "ID parameter is required." }),
});


// --- Validation Middleware ---
export const validateRequest = (schema: z.ZodSchema<any>, type: 'body' | 'params' | 'query') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[type]);
      req[type] = parsed; // Replace original with parsed (and potentially transformed) data
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data.',
            details: e.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
              code: err.code,
            }))
          }
        });
      } else {
        logger.error("Unexpected error during validation", { error: e });
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred during validation.'
          }
        });
      }
    }
  };

// TODO: Define appropriate permissions for these operations, e.g., 'firm:view_subscription', 'firm:manage_billing'
const VIEW_SUBSCRIPTION_PERMISSION = 'firm:view_subscription';
const MANAGE_BILLING_PERMISSION = 'firm:manage_billing';

// Mock Data (based on PRD models)

// --- Subscription Data ---
interface SubscriptionPlan {
  id: string;
  name: string; // e.g., "Basic", "Pro", "Enterprise"
  pricePerUserPerMonth: number;
  pricePerUserPerYear: number; // If annual option available
  features: string[]; // List of features
  storageLimitGB: number;
  userLimit: number;
  caseLimit?: number; // Optional
  clientLimit?: number; // Optional
}

interface Subscription {
  id: string;
  firmId: string;
  currentPlan: SubscriptionPlan;
  status: 'active' | 'trial' | 'past_due' | 'canceled';
  startDate: string; // ISO Date
  endDate?: string; // ISO Date (if applicable)
  nextBillingDate: string; // ISO Date
  isAnnualPlan: boolean;
  autoRenew: boolean;
  paymentMethodId?: string; // Link to a payment method
  seats: number; // Number of purchased seats/licenses
}

const mockProPlan: SubscriptionPlan = {
  id: 'plan_pro_monthly',
  name: 'Pro Plan',
  pricePerUserPerMonth: 79,
  pricePerUserPerYear: 850, // Approx $70.83/month if annual
  features: [
    'Unlimited Cases & Clients',
    'Advanced Document Management',
    'Time Tracking & Billing',
    'Client Portal',
    'Team Collaboration Tools',
    'Advanced Reporting',
    'Workflow Automation (Basic)',
    'Integration Marketplace (Limited)',
  ],
  storageLimitGB: 1000, // 1TB per user or firm? Assuming firm.
  userLimit: 50,
};

const mockSubscription: Subscription = {
  id: 'sub_firm123_pro',
  firmId: 'firm_abc_123', // Should match user's firm
  currentPlan: mockProPlan,
  status: 'active',
  startDate: '2023-05-01T00:00:00Z',
  nextBillingDate: '2024-09-01T00:00:00Z',
  isAnnualPlan: false,
  autoRenew: true,
  paymentMethodId: 'pm_123456789',
  seats: 10,
};

// --- Usage Metrics ---
interface SubscriptionUsage {
  firmId: string;
  activeUsers: number;
  totalUsers: number; // Total licensed seats
  storageUsedGB: number;
  storageLimitGB: number;
  casesCount?: number;
  clientsCount?: number;
  documentsCount?: number;
  dataFetchedAt: string; // ISO Date
}

const mockUsage: SubscriptionUsage = {
  firmId: 'firm_abc_123',
  activeUsers: 8,
  totalUsers: 10,
  storageUsedGB: 250,
  storageLimitGB: mockProPlan.storageLimitGB,
  casesCount: 1200,
  clientsCount: 850,
  documentsCount: 15000,
  dataFetchedAt: new Date().toISOString(),
};

// --- Platform Invoice Data ---
interface PlatformInvoiceItem {
  id: string;
  description: string; // e.g., "Pro Plan - 10 users" or "Additional Storage"
  quantity: number;
  unitAmount: number; // Price per unit in cents
  totalAmount: number; // quantity * unitAmount in cents
  periodStartDate?: string; // ISO Date
  periodEndDate?: string; // ISO Date
}

interface PlatformInvoice {
  id: string; // e.g., "inv_platform_12345"
  firmId: string;
  invoiceNumber: string; // Human-readable invoice number
  issueDate: string; // ISO Date
  dueDate: string; // ISO Date
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  currency: 'USD'; // Assuming USD for now
  subtotalAmount: number; // Sum of all item totalAmounts in cents
  taxAmount: number; // In cents
  totalAmount: number; // subtotal + tax in cents
  amountPaid: number; // In cents
  amountDue: number; // totalAmount - amountPaid in cents
  paymentTerms?: string; // e.g., "Net 30"
  notes?: string;
  lineItems: PlatformInvoiceItem[];
  paymentLink?: string; // Link to Stripe/payment processor invoice page
  pdfDownloadLink?: string; // Link to download PDF (can be generated on demand)
}

const mockInvoices: PlatformInvoice[] = [
  {
    id: 'inv_platform_A123XYZ',
    firmId: 'firm_abc_123',
    invoiceNumber: 'SEBENZA-2024-001',
    issueDate: '2024-08-01T00:00:00Z',
    dueDate: '2024-08-15T00:00:00Z',
    status: 'paid',
    currency: 'USD',
    subtotalAmount: 79000, // 10 users * $79/month * 100 cents
    taxAmount: 0, // Assuming no tax for simplicity
    totalAmount: 79000,
    amountPaid: 79000,
    amountDue: 0,
    paymentTerms: 'Net 15',
    lineItems: [
      {
        id: 'item_1',
        description: `${mockProPlan.name} - ${mockSubscription.seats} users`,
        quantity: mockSubscription.seats,
        unitAmount: mockProPlan.pricePerUserPerMonth * 100,
        totalAmount: mockSubscription.seats * mockProPlan.pricePerUserPerMonth * 100,
        periodStartDate: '2024-08-01T00:00:00Z',
        periodEndDate: '2024-08-31T00:00:00Z',
      },
    ],
    paymentLink: 'https://stripe.com/pay/mock_invoice_A123XYZ',
    pdfDownloadLink: '/api/firm/invoices/inv_platform_A123XYZ/download',
  },
  {
    id: 'inv_platform_B456UVW',
    firmId: 'firm_abc_123',
    invoiceNumber: 'SEBENZA-2024-002',
    issueDate: '2024-07-01T00:00:00Z',
    dueDate: '2024-07-15T00:00:00Z',
    status: 'paid',
    currency: 'USD',
    subtotalAmount: 79000,
    taxAmount: 0,
    totalAmount: 79000,
    amountPaid: 79000,
    amountDue: 0,
    paymentTerms: 'Net 15',
    lineItems: [
      {
        id: 'item_2',
        description: `${mockProPlan.name} - ${mockSubscription.seats} users`,
        quantity: mockSubscription.seats,
        unitAmount: mockProPlan.pricePerUserPerMonth * 100,
        totalAmount: mockSubscription.seats * mockProPlan.pricePerUserPerMonth * 100,
        periodStartDate: '2024-07-01T00:00:00Z',
        periodEndDate: '2024-07-31T00:00:00Z',
      },
    ],
    paymentLink: 'https://stripe.com/pay/mock_invoice_B456UVW',
    pdfDownloadLink: '/api/firm/invoices/inv_platform_B456UVW/download',
  },
];

// --- Payment Method Data ---
interface PaymentMethod {
  id: string; // e.g., "pm_12345"
  type: 'card' | 'bank_account'; // Could be extended
  isDefault: boolean;
  card?: { // Only if type is 'card'
    brand: string; // e.g., "Visa", "Mastercard"
    last4: string;
    expMonth: number;
    expYear: number;
    nameOnCard?: string;
  };
  bankAccount?: { // Only if type is 'bank_account'
    bankName: string;
    accountHolderName?: string;
    accountType?: 'checking' | 'savings';
    last4: string; // Last 4 digits of account number
  };
  billingAddress?: { // Optional, can be shared or specific to payment method
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_123456789',
    type: 'card',
    isDefault: true,
    card: {
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025,
      nameOnCard: 'John Doe',
    },
    billingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '90210',
        country: 'US',
    }
  },
  {
    id: 'pm_987654321',
    type: 'card',
    isDefault: false,
    card: {
      brand: 'Mastercard',
      last4: '5555',
      expMonth: 8,
      expYear: 2026,
      nameOnCard: 'John Doe',
    },
     billingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '90210',
        country: 'US',
    }
  },
];


// Endpoints

// --- Subscription ---
router.get('/subscription', authenticateToken, checkPermission(VIEW_SUBSCRIPTION_PERMISSION), (req: Request, res: Response) => {
  logger.info(`GET /api/firm/subscription requested by user ${req.user?.id} for firm ${req.user?.firmId}`);
  // In a real app, filter by req.user.firmId
  if (req.user?.firmId !== mockSubscription.firmId) {
    // Note: This specific 403 is outside Zod validation, which is fine.
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden: You do not have access to this firms subscription.' }});
  }
  res.json({ success: true, data: mockSubscription });
});

router.get('/subscription/usage', authenticateToken, checkPermission(VIEW_SUBSCRIPTION_PERMISSION), (req: Request, res: Response) => {
  logger.info(`GET /api/firm/subscription/usage requested by user ${req.user?.id} for firm ${req.user?.firmId}`);
   if (req.user?.firmId !== mockUsage.firmId) {
    // Note: This specific 403 is outside Zod validation, which is fine.
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden: You do not have access to this firms usage data.' }});
  }
  res.json({ success: true, data: mockUsage });
});

router.post(
  '/subscription/upgrade',
  authenticateToken,
  checkPermission(MANAGE_BILLING_PERMISSION),
  validateRequest(UpgradeSubscriptionSchema, 'body'),
  async (req: Request, res: Response) => {
    const { newPlanId, seats, isAnnual } = req.body; // Data is now validated
    logger.info(`POST /api/firm/subscription/upgrade requested by user ${req.user?.id} for firm ${req.user?.firmId}`, { newPlanId, seats, isAnnual });
    try {
    // TODO: Implement actual upgrade logic with Stripe or other payment processor
    // - Validate planId, seats
    // - Create/update Stripe subscription
    // - Update local database record
    // Simulate an async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    // if (Math.random() < 0.3) throw new Error("Simulated payment gateway failure during upgrade.");


    res.json({ success: true, message: 'Subscription upgrade initiated successfully. (Mocked)', data: { newPlanId, seats, isAnnual } });
  } catch (error: any) {
    logger.error('Subscription upgrade failed', { firmId: req.user?.firmId, error: error.message, stack: error.stack });
    res.status(503).json({
      success: false,
      error: {
        code: 'UPGRADE_SERVICE_ERROR',
        message: 'Failed to initiate subscription upgrade. Please try again later or contact support.'
      }
    });
  }
});


// --- Invoices ---
router.get('/invoices', authenticateToken, checkPermission(VIEW_SUBSCRIPTION_PERMISSION), (req: Request, res: Response) => {
  logger.info(`GET /api/firm/invoices requested by user ${req.user?.id} for firm ${req.user?.firmId}`);
  const firmInvoices = mockInvoices.filter(inv => inv.firmId === req.user?.firmId);
  res.json({ success: true, data: firmInvoices });
});

router.get(
  '/invoices/:id',
  authenticateToken,
  checkPermission(VIEW_SUBSCRIPTION_PERMISSION),
  validateRequest(GenericIdParamsSchema, 'params'),
  (req: Request, res: Response) => {
    const { id } = req.params; // ID is now validated by GenericIdParamsSchema
    logger.info(`GET /api/firm/invoices/${id} requested by user ${req.user?.id} for firm ${req.user?.firmId}`);
    const invoice = mockInvoices.find(inv => inv.id === id && inv.firmId === req.user?.firmId);
    if (!invoice) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found or access denied.' }});
    }
    res.json({ success: true, data: invoice });
  }
);

router.get(
  '/invoices/:id/download',
  authenticateToken,
  checkPermission(VIEW_SUBSCRIPTION_PERMISSION),
  validateRequest(GenericIdParamsSchema, 'params'),
  (req: Request, res: Response) => {
    const { id } = req.params; // ID is now validated
    logger.info(`GET /api/firm/invoices/${id}/download requested by user ${req.user?.id} for firm ${req.user?.firmId}`);
    const invoice = mockInvoices.find(inv => inv.id === id && inv.firmId === req.user?.firmId);
  if (!invoice) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found or access denied for download.' }});
  }
  try {
    // TODO: Implement actual PDF generation and streaming
    // For now, we send a mock response.
    // if (Math.random() < 0.3) throw new Error("Simulated PDF generation failure.");
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    res.status(200).send(`Mock PDF for invoice ${invoice.invoiceNumber} (TODO: Implement actual PDF generation)`);
  } catch (error: any) {
    logger.error(`Invoice PDF download failed for invoice ${id}`, { firmId: req.user?.firmId, error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      error: {
        code: 'PDF_GENERATION_ERROR',
        message: 'Could not generate invoice PDF. Please try again later.'
      }
    });
  }
});


// --- Payment Methods ---
router.get('/payment-methods', authenticateToken, checkPermission(MANAGE_BILLING_PERMISSION), (req: Request, res: Response) => {
  logger.info(`GET /api/firm/payment-methods requested by user ${req.user?.id} for firm ${req.user?.firmId}`);
  // In a real app, filter by req.user.firmId and retrieve from a secure vault/payment processor
  res.json({ success: true, data: mockPaymentMethods });
});

router.post(
  '/payment-methods',
  authenticateToken,
  checkPermission(MANAGE_BILLING_PERMISSION),
  validateRequest(AddPaymentMethodSchema, 'body'),
  async (req: Request, res: Response) => {
    const { paymentMethodToken, isDefault } = req.body; // Validated data
    logger.info(`POST /api/firm/payment-methods requested by user ${req.user?.id} for firm ${req.user?.firmId}`, { paymentMethodToken_type: typeof paymentMethodToken, isDefault });
    try {
    // TODO: Implement actual logic with payment processor (e.g., Stripe, Braintree)
    // - Create payment method on processor
    // - Store reference (processor's PM ID) locally, associated with firm
    // - Handle setting default
    // if (Math.random() < 0.3) throw new Error("Simulated payment provider error on add.");
    await new Promise(resolve => setTimeout(resolve, 100));

    res.json({ success: true, message: 'Payment method added successfully. (Mocked)', data: { id: `pm_${new Date().getTime()}`, paymentMethodToken, isDefault } });
  } catch (error: any) {
    logger.error('Add payment method failed', { firmId: req.user?.firmId, error: error.message, stack: error.stack });
    res.status(503).json({
      success: false,
      error: {
        code: 'PAYMENT_SERVICE_ERROR',
        message: 'Could not add payment method. Please try again later or contact support.'
      }
    });
  }
});

router.put(
  '/payment-methods/:id',
  authenticateToken,
  checkPermission(MANAGE_BILLING_PERMISSION),
  validateRequest(GenericIdParamsSchema, 'params'),
  validateRequest(UpdatePaymentMethodSchema, 'body'),
  async (req: Request, res: Response) => { // Changed to async to match other POST/PUT
    const { id } = req.params; // Validated
    const { isDefault, billingAddress } = req.body; // Validated
    logger.info(`PUT /api/firm/payment-methods/${id} requested by user ${req.user?.id} for firm ${req.user?.firmId}`, { isDefault, billingAddress });
    try {
      // TODO: Implement actual update logic with payment processor
      // - Update payment method details (e.g., set as default, update billing address) on processor
      // - Update local record if needed
      // if (Math.random() < 0.3) throw new Error("Simulated payment provider error on update.");
      await new Promise(resolve => setTimeout(resolve, 100));

      const method = mockPaymentMethods.find(pm => pm.id === id);
      if (!method) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payment method not found.' }});
      }
      if (typeof isDefault === 'boolean') method.isDefault = isDefault; // isDefault from validated body
      if (billingAddress) method.billingAddress = billingAddress; // billingAddress from validated body

      res.json({ success: true, message: `Payment method ${id} updated. (Mocked)`, data: method });
    } catch (error: any) {
      logger.error(`Update payment method ${id} failed`, { firmId: req.user?.firmId, error: error.message, stack: error.stack });
      res.status(503).json({
        success: false,
        error: {
          code: 'PAYMENT_SERVICE_ERROR',
          message: 'Could not update payment method. Please try again later or contact support.'
        }
      });
    }
  }
);

router.delete(
  '/payment-methods/:id',
  authenticateToken,
  checkPermission(MANAGE_BILLING_PERMISSION),
  validateRequest(GenericIdParamsSchema, 'params'),
  async (req: Request, res: Response) => { // Changed to async
    const { id } = req.params; // Validated
    logger.info(`DELETE /api/firm/payment-methods/${id} requested by user ${req.user?.id} for firm ${req.user?.firmId}`);
    try {
    // TODO: Implement actual deletion logic with payment processor
    // - Detach/delete payment method from customer on processor
    // - Remove local reference
    // if (Math.random() < 0.3) throw new Error("Simulated payment provider error on delete.");
    await new Promise(resolve => setTimeout(resolve, 100));

    const index = mockPaymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payment method not found.' }});
    }
    // mockPaymentMethods.splice(index, 1); // Uncomment to actually modify mock array for testing session
    res.json({ success: true, message: `Payment method ${id} deleted. (Mocked)` });
  } catch (error: any) {
    logger.error(`Delete payment method ${id} failed`, { firmId: req.user?.firmId, error: error.message, stack: error.stack });
    res.status(503).json({
      success: false,
      error: {
        code: 'PAYMENT_SERVICE_ERROR',
        message: 'Could not delete payment method. Please try again later or contact support.'
      }
    });
  }
});

export default router;
