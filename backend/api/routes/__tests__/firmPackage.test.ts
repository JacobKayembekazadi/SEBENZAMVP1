import express from 'express';
import request from 'supertest';
import firmPackageRouter from '../firmPackage'; // Adjust path as necessary

// Mock middleware
// IMPORTANT: The paths in jest.mock must match the exact relative path used in firmPackage.ts
// If firmPackage.ts uses '../middleware/auth', then that's what we use here.
jest.mock('../../middleware/auth', () => ({ // Adjusted path assuming firmPackage.ts is in routes/ and middleware is in middleware/
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      firmId: 'firm_abc_123', // Ensure this firmId matches mock data in firmPackage.ts for some tests
      permissions: ['firm:view_subscription', 'firm:manage_billing'] // Provide all needed permissions
    };
    next();
  }
}));

jest.mock('../../middleware/rbac', () => ({ // Adjusted path
  checkPermission: (permission: string) => (req: any, res: any, next: any) => {
    // For testing, we can assume the user always has the permission
    // or add more sophisticated logic if needed (e.g., check req.user.permissions)
    next();
  }
}));

const app = express();
app.use(express.json());
// Mount the router at the path it's expected to be used in the actual application
// This should match how it's integrated in your main server file (e.g., app.use('/api/firm', firmPackageRouter))
app.use('/api/firm', firmPackageRouter);

describe('Firm Package API - /api/firm', () => {
  describe('GET /api/firm/subscription', () => {
    it('should return 200 OK and subscription details for the mock user\'s firm', async () => {
      const response = await request(app)
        .get('/api/firm/subscription')
        .set('Accept', 'application/json'); // Good practice to set Accept header

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // Check for some fields from the mockSubscription in firmPackage.ts
      expect(response.body.data.id).toBe('sub_firm123_pro');
      expect(response.body.data.firmId).toBe('firm_abc_123');
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.currentPlan).toBeDefined();
      expect(response.body.data.currentPlan.name).toBe('Pro Plan');
      expect(response.body.data.seats).toBe(10);
    });

    it('should return 403 if user firmId does not match subscription firmId (if mock data had a different firmId)', async () => {
        // Temporarily override the mock to simulate a user from a different firm
        jest.requireMock('../../middleware/auth').authenticateToken = (req: any, res: any, next: any) => {
            req.user = { id: 'other-user', firmId: 'other_firm_789', permissions: ['firm:view_subscription'] };
            next();
        };

        const response = await request(app)
            .get('/api/firm/subscription')
            .set('Accept', 'application/json');

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('Forbidden');

        // Restore the original mock for other tests
        jest.requireMock('../../middleware/auth').authenticateToken = (req: any, res: any, next: any) => {
            req.user = { id: 'test-user-id', firmId: 'firm_abc_123', permissions: ['firm:view_subscription', 'firm:manage_billing'] };
            next();
        };
    });
  });

  describe('GET /api/firm/subscription/usage', () => {
    it('should return 200 OK and usage details', async () => {
      const response = await request(app)
        .get('/api/firm/subscription/usage')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.firmId).toBe('firm_abc_123');
      expect(response.body.data.activeUsers).toBeDefined();
      expect(response.body.data.storageUsedGB).toBeDefined();
    });
  });

  describe('POST /api/firm/subscription/upgrade', () => {
    it('should return 200 OK and a success message for upgrade attempt', async () => {
      const upgradePayload = {
        newPlanId: 'plan_enterprise_monthly',
        seats: 20,
        isAnnual: false,
      };
      const response = await request(app)
        .post('/api/firm/subscription/upgrade')
        .send(upgradePayload)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Subscription upgrade initiated successfully');
      expect(response.body.data).toEqual(upgradePayload);
    });
  });

  describe('GET /api/firm/invoices', () => {
    it('should return 200 OK and a list of invoices', async () => {
      const response = await request(app)
        .get('/api/firm/invoices')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // Check if it returns the mock invoices for firm_abc_123
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].firmId).toBe('firm_abc_123');
    });
  });

  describe('GET /api/firm/invoices/:id', () => {
    it('should return 200 OK and a single invoice', async () => {
      const testInvoiceId = 'inv_platform_A123XYZ'; // From mockInvoices in firmPackage.ts
      const response = await request(app)
        .get(`/api/firm/invoices/${testInvoiceId}`)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(testInvoiceId);
      expect(response.body.data.firmId).toBe('firm_abc_123');
    });

    it('should return 404 if invoice not found', async () => {
      const response = await request(app)
        .get('/api/firm/invoices/non_existent_id')
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/firm/invoices/:id/download', () => {
    it('should return 200 OK and a mock PDF response', async () => {
      const testInvoiceId = 'inv_platform_A123XYZ';
      const response = await request(app)
        .get(`/api/firm/invoices/${testInvoiceId}/download`);
        // No need to set 'Accept' for file download typically

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toEqual('application/pdf');
      expect(response.headers['content-disposition']).toContain(`invoice-SEBENZA-2024-001.pdf`);
      expect(response.text).toContain('Mock PDF for invoice SEBENZA-2024-001');
    });

     it('should return 404 if invoice for download not found', async () => {
      const response = await request(app)
        .get('/api/firm/invoices/non_existent_id/download');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/firm/payment-methods', () => {
    it('should return 200 OK and a list of payment methods', async () => {
      const response = await request(app)
        .get('/api/firm/payment-methods')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // Add more tests for POST, PUT, DELETE payment methods if desired,
  // focusing on status codes and mock success messages for now.
});
