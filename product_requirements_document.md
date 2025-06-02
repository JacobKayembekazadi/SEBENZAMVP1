# Product Requirements Document: My Package Page

## 1. Feature Name: My Package

**Feature Type:** Self-Service Subscription Management Portal  
**Target Release:** Q2 2024  
**Priority:** High  
**Stakeholders:** Law Firm Administrators, Partners, Billing Managers  

---

## 2. Problem Statement

Currently, law firms subscribing to Sebenza System lack a centralized, self-service portal to view and manage their subscription details, billing history, and current usage. This leads to:

* **Lack of transparency** regarding their active plan, associated costs, and billing cycles
* **Increased reliance on Sebenza's support team** for basic billing inquiries (e.g., "What's my current plan?", "Can I get a copy of last month's invoice?", "How do I update my payment information?")
* **Difficulty for firms to proactively monitor their usage** against plan limits (if applicable), potentially leading to unexpected overage charges or underutilization of their subscription
* **Inefficient payment method updates** and management, requiring manual intervention
* **Poor customer experience** due to lack of self-service capabilities

This impacts our clients' satisfaction, increases operational overhead for Sebenza's support team, and can create unnecessary friction in the client-vendor relationship.

### Context from Current Architecture

Based on the existing Sebenza System architecture, we need to distinguish between:
- **Law Firm's Clients**: Individuals and entities that the law firm represents (managed within the existing Client entity)
- **Sebenza's Customers**: Law firms that subscribe to the Sebenza platform (new FirmAccount entity)

The "My Package" feature serves the latter group - law firms managing their Sebenza subscription.

---

## 3. User Stories

### Primary User Stories

**As a Firm Administrator (Sebenza subscriber)**, I want to **view my firm's current Sebenza subscription plan and its key features and limits** so I know exactly what capabilities we have and what we are paying for.

**As a Billing Manager (Sebenza subscriber)**, I want to **see my firm's next billing date and the total amount due** so I can anticipate and plan for upcoming payments without surprises.

**As a Firm Partner (Sebenza subscriber)**, I want to **monitor our firm's usage of Sebenza (e.g., active users, storage used)** against our subscription limits so I can ensure we are operating efficiently within our plan or identify if an upgrade is needed.

**As a Firm Administrator (Sebenza subscriber)**, I want to **access and download all past invoices issued by Sebenza to our firm** so I can maintain accurate financial records and reconcile payments.

**As a Billing Manager (Sebenza subscriber)**, I want to be able to **securely update our firm's payment method** (e.g., credit card details) without contacting Sebenza support, so our recurring payments are not interrupted.

**As a Firm Administrator (Sebenza subscriber)**, I want to **understand the breakdown of our subscription charges** (e.g., base fee, per-user charges) so I can easily explain and justify the expense to other stakeholders within the firm.

### Secondary User Stories

**As a Firm Partner**, I want to **receive proactive notifications about usage approaching limits** so I can make informed decisions about plan upgrades before service interruptions occur.

**As a Billing Manager**, I want to **view payment history and failed payment attempts** so I can track our payment reliability and address any issues promptly.

**As a Firm Administrator**, I want to **see upcoming feature releases and plan benefits** so I can maximize our investment in Sebenza and keep the team informed of new capabilities.

---

## 4. Functional Requirements

### 4.1 Subscription Overview Display

**REQ-001: Current Plan Information**
- Display firm's active subscription plan name (e.g., "Sebenza Premium Plan")
- Show subscription status: "Active", "Trialing", "Past Due", "Cancelled", "Suspended"
- List key features included in the current plan
- Display billing cycle: "Monthly", "Annually", "Custom"
- Show subscription start date and next billing date
- Display estimated total amount due for upcoming cycle

**REQ-002: Plan Feature Matrix**
- Present a clear comparison of current plan features vs. other available plans
- Highlight features that are included, limited, or unavailable in current plan
- Show upgrade path benefits for higher-tier plans

**REQ-003: Subscription Timeline**
- Display subscription history including plan changes, upgrades, downgrades
- Show trial periods, renewals, and any service modifications
- Include effective dates for all subscription changes

### 4.2 Usage Monitoring

**REQ-004: User Management Metrics**
- Display current number of active Sebenza users vs. plan limit
- Show user breakdown by role (Admin, Attorney, Paralegal, Assistant, Billing)
- Visual indicators (progress bars, warning icons) for usage approaching limits
- Last updated timestamp for usage data

**REQ-005: Storage Utilization**
- Display total document storage used (in GB) vs. plan limit
- Breakdown by storage type: documents, case files, system backups
- Visual indicators for storage nearing capacity
- Trend indicators showing month-over-month storage growth

**REQ-006: Feature Usage Metrics** (if applicable to pricing model)
- Number of active cases vs. plan limit
- Client portal user count vs. limit
- API calls or integrations usage vs. limits
- Time tracking entries or billable hours (if relevant to plan)

**REQ-007: Usage Alerts**
- Automated notifications when usage reaches 80% and 95% of limits
- Grace period information before overage charges apply
- Clear call-to-action for plan upgrades when limits are approached

### 4.3 Billing History Access

**REQ-008: Invoice List Display**
- Paginated list of all past Sebenza platform invoices (distinct from client invoices)
- Display: invoice number, issue date, due date, total amount, paid amount, status
- Status indicators: "Paid", "Pending", "Past Due", "Voided", "Refunded"
- Search and filter capabilities by date range, amount, or status

**REQ-009: Invoice Download**
- One-click PDF download for each invoice
- Bulk download option for multiple invoices
- Invoice PDFs include firm branding and detailed line items
- Download tracking for audit purposes

**REQ-010: Payment History**
- Complete payment transaction history
- Payment method used for each transaction
- Failed payment attempts with failure reasons
- Refund and credit information

### 4.4 Payment Method Management

**REQ-011: Current Payment Method Display**
- Masked display of primary payment method (e.g., "Visa ending in 1234")
- Expiration date and card type
- Last successful payment date
- Backup payment method information (if configured)

**REQ-012: Secure Payment Method Updates**
- Integration with PCI-compliant payment gateway (Stripe Elements)
- Real-time card validation and formatting
- Support for multiple card types and ACH payments
- Secure tokenization - no raw card data stored by Sebenza

**REQ-013: Payment Method Verification**
- Automatic verification charge for new payment methods
- Confirmation email sent upon successful updates
- Rollback capability if verification fails
- Audit trail of all payment method changes

### 4.5 User Access Control

**REQ-014: Role-Based Access**
- Restrict access to users with Admin, Partner, and Billing roles only
- Granular permissions within the page (e.g., view-only vs. edit capabilities)
- Session timeout for sensitive billing information
- Multi-factor authentication for payment method changes

**REQ-015: Firm Boundary Enforcement**
- Users can only access their own firm's subscription data
- Strict data isolation between different law firm accounts
- Cross-firm data leakage prevention

### 4.6 Data Consistency & Real-time Updates

**REQ-016: Data Synchronization**
- Real-time sync with payment gateway for billing status
- Hourly updates for usage metrics
- Immediate updates for critical changes (payment failures, suspensions)
- Cache invalidation strategies for stale data

**REQ-017: Error Handling**
- Graceful degradation when external services are unavailable
- Clear error messages for payment gateway failures
- Retry mechanisms for transient failures
- Fallback to cached data when appropriate

---

## 5. Non-Functional Requirements

### 5.1 Security

**SEC-001: PCI DSS Compliance**
- Leverage PCI DSS Level 1 certified payment gateway (Stripe/Braintree)
- No raw payment card data stored or processed by Sebenza
- Secure tokenization for all payment method references
- Regular security assessments and compliance audits

**SEC-002: Access Control**
- Strict Role-Based Access Control (RBAC) enforcement
- Multi-factor authentication for sensitive operations
- Session management with automatic timeout
- IP allowlisting capability for enhanced security

**SEC-003: Data Encryption**
- TLS 1.3 for all client-server communication
- AES-256 encryption for sensitive data at rest
- Encrypted audit logs for all billing-related activities
- Secure key management practices

**SEC-004: Audit & Compliance**
- Comprehensive audit trails for all user actions
- GDPR and CCPA compliance for firm data processing
- Data retention policies aligned with legal requirements
- Regular penetration testing and vulnerability assessments

### 5.2 Performance

**PERF-001: Page Load Performance**
- Initial page load within 3 seconds for typical firm account
- Core subscription information visible within 2 seconds
- Progressive loading for secondary information
- Optimized for 95th percentile response times

**PERF-002: Invoice Management Performance**
- Invoice list loading within 2 seconds (with pagination)
- PDF generation and download initiation within 1 second
- Bulk operations completion within 30 seconds
- Efficient caching for frequently accessed invoices

**PERF-003: Real-time Updates**
- Usage metrics updated within 1 hour of actual usage
- Payment status updates within 5 minutes of gateway notification
- Critical alerts (payment failures) within 1 minute
- Background processing for non-critical updates

### 5.3 Reliability

**REL-001: Service Availability**
- 99.9% uptime SLA for the My Package page
- Graceful degradation during partial service outages
- Health monitoring and alerting
- Disaster recovery procedures

**REL-002: Data Integrity**
- Consistent billing data across all systems
- Automated reconciliation with payment gateway
- Conflict resolution for data discrepancies
- Regular data validation checks

### 5.4 Usability & User Experience

**UX-001: User Interface Design**
- Clean, intuitive interface requiring minimal training
- Responsive design for desktop and mobile devices
- Consistent with existing Sebenza UI patterns
- Progressive disclosure for complex information

**UX-002: Error Handling & Messaging**
- Clear, actionable error messages
- User-friendly language avoiding technical jargon
- Contextual help and guidance
- Recovery suggestions for common issues

### 5.5 Accessibility

**ACC-001: WCAG Compliance**
- WCAG 2.1 AA compliance for all page elements
- Screen reader compatibility
- Keyboard navigation support
- Color contrast and visual accessibility standards

---

## 6. Technical Architecture

### 6.1 New Data Models

Based on the existing Sebenza architecture, the following new entities are required:

```typescript
interface FirmAccount {
  id: string;
  firmName: string;
  firmType: 'solo' | 'partnership' | 'corporation' | 'llc';
  primaryContactId: string;     // Reference to User
  billingContactId: string;     // Reference to User
  subscriptionId: string;       // Reference to Subscription
  status: 'active' | 'suspended' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface Subscription {
  id: string;
  firmAccountId: string;        // Foreign key to FirmAccount
  planId: string;              // Foreign key to SubscriptionPlan
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'suspended';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  billingCycle: 'monthly' | 'annually';
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethodId: string;      // Token from payment gateway
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionPlan {
  id: string;
  name: string;                // e.g., "Sebenza Premium"
  description: string;
  price: number;               // Base price
  currency: string;
  billingInterval: 'month' | 'year';
  features: {
    maxUsers: number;
    storageLimit: number;      // in GB
    maxCases?: number;
    apiCallLimit?: number;
    supportLevel: 'basic' | 'premium' | 'enterprise';
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PlatformInvoice {
  id: string;
  firmAccountId: string;       // Foreign key to FirmAccount
  subscriptionId: string;      // Foreign key to Subscription
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  status: 'draft' | 'sent' | 'paid' | 'past_due' | 'voided';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  currency: string;
  paymentMethodId?: string;
  externalInvoiceId: string;   // Reference in payment gateway
  downloadUrl?: string;
  lineItems: PlatformInvoiceLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface PlatformInvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}
```

### 6.2 Service Architecture Extensions

**New/Extended Services:**

1. **Firm Billing Service** (Extension of existing Billing Service)
   - Subscription management operations
   - Usage tracking and limit enforcement
   - Invoice generation and delivery
   - Payment method management

2. **Subscription Management Integration**
   - Stripe Billing or similar platform integration
   - Webhook handling for payment events
   - Real-time subscription status updates

3. **Usage Analytics Service**
   - Real-time usage tracking
   - Limit monitoring and alerting
   - Usage forecasting and recommendations

### 6.3 API Endpoints

```
# Subscription Management
GET    /api/firm/subscription           # Get current subscription details
GET    /api/firm/subscription/usage    # Get current usage metrics
POST   /api/firm/subscription/upgrade  # Initiate subscription upgrade

# Billing & Invoices
GET    /api/firm/invoices              # List platform invoices
GET    /api/firm/invoices/:id          # Get specific invoice
GET    /api/firm/invoices/:id/download # Download invoice PDF

# Payment Methods
GET    /api/firm/payment-methods       # Get current payment methods
POST   /api/firm/payment-methods       # Add new payment method
PUT    /api/firm/payment-methods/:id   # Update payment method
DELETE /api/firm/payment-methods/:id   # Remove payment method

# Usage & Analytics
GET    /api/firm/usage/current         # Current usage metrics
GET    /api/firm/usage/history         # Historical usage data
GET    /api/firm/usage/alerts          # Usage alert settings
```

---

## 7. Out of Scope (for MVP)

**Feature Exclusions:**

- **Direct Plan Change/Upgrade/Downgrade**: Ability for firms to directly modify their subscription plan through the interface (handled via support for MVP)
- **Direct One-Time Payment**: Manual payment for past due invoices directly on the page
- **Advanced Usage Analytics**: Granular trending data, per-user analytics, custom reporting
- **Custom Billing Cycles**: Support for non-standard billing arrangements
- **Discount Code Management**: Display or management of promotional codes
- **Multi-Firm Account Management**: Single user managing multiple law firm subscriptions
- **Integrated Support Ticketing**: Embedded billing support tools
- **Advanced Notifications**: Complex notification rules, SMS alerts, custom notification preferences
- **Invoice Customization**: Ability to modify invoice templates or branding
- **Dunning Management**: Automated payment retry logic and collection workflows

**Technical Exclusions:**

- Advanced caching strategies beyond basic Redis implementation
- Real-time collaboration features for billing information
- Advanced audit log analysis and reporting tools
- Integration with accounting software beyond basic invoice export

---

## 8. Success Metrics

### 8.1 Primary KPIs

**Support Ticket Reduction**
- **Metric**: Number of billing-related support tickets per month
- **Target**: 20% reduction within 3 months post-launch
- **Measurement**: Track tickets categorized as "billing inquiry", "payment method", "invoice request"

**Self-Service Adoption**
- **Metric**: Percentage of eligible users accessing My Package page monthly
- **Target**: 70% of Firm Admins/Partners/Billing Managers access quarterly
- **Measurement**: Unique user analytics with role-based segmentation

**Payment Method Self-Service Rate**
- **Metric**: Percentage of payment method updates handled via self-service
- **Target**: 80% self-service rate within 6 months
- **Measurement**: Compare self-service updates vs. support-assisted updates

### 8.2 Secondary KPIs

**Customer Satisfaction**
- **Metric**: CSAT score for billing experience
- **Target**: 0.5 point increase on 5-point scale
- **Measurement**: Post-interaction surveys and quarterly NPS surveys

**Page Engagement**
- **Metric**: Average time spent on My Package page, bounce rate
- **Target**: Average session duration >3 minutes, bounce rate <20%
- **Measurement**: Google Analytics and internal tracking

**Feature Utilization**
- **Metric**: Usage rates for key features (invoice downloads, usage monitoring)
- **Target**: 60% of active users use invoice download, 40% regularly check usage
- **Measurement**: Feature-specific analytics and user behavior tracking

### 8.3 Technical Metrics

**Performance Metrics**
- **Metric**: Page load times, API response times
- **Target**: 95th percentile load time <3 seconds
- **Measurement**: APM tools and synthetic monitoring

**Reliability Metrics**
- **Metric**: Uptime, error rates
- **Target**: 99.9% uptime, <1% error rate
- **Measurement**: Infrastructure monitoring and error tracking

**Security Metrics**
- **Metric**: Security incidents, failed authentication attempts
- **Target**: Zero security breaches, <5% failed auth rate
- **Measurement**: Security monitoring tools and audit logs

---

## 9. Implementation Plan

### 9.1 Development Phases

**Phase 1: Foundation (Weeks 1-4)**
- New data model implementation
- Basic subscription information display
- User access control and security framework
- Payment gateway integration setup

**Phase 2: Core Features (Weeks 5-8)**
- Usage monitoring and display
- Invoice history and download functionality
- Basic payment method management
- Error handling and validation

**Phase 3: Enhancement (Weeks 9-12)**
- Advanced UI/UX polish
- Performance optimization
- Comprehensive testing and security review
- Documentation and training materials

**Phase 4: Launch Preparation (Weeks 13-14)**
- Production deployment preparation
- User acceptance testing
- Support team training
- Go-live and monitoring setup

### 9.2 Dependencies

**External Dependencies:**
- Payment gateway (Stripe) account setup and configuration
- Legal review of terms and billing practices
- Compliance assessment for PCI DSS requirements

**Internal Dependencies:**
- User authentication system updates for role-based access
- Database schema migrations for new entities
- Integration with existing billing workflows
- Support team process documentation updates

### 9.3 Risk Mitigation

**Technical Risks:**
- Payment gateway integration complexity → Early prototype and testing
- Data migration challenges → Comprehensive testing environment
- Performance issues with large datasets → Load testing and optimization

**Business Risks:**
- User adoption resistance → User research and feedback loops
- Support ticket increase during transition → Gradual rollout and training
- Security vulnerabilities → Security review at each phase

---

## 10. Acceptance Criteria

### 10.1 Functional Acceptance

✅ **Subscription Overview**
- [ ] Current plan details display correctly for all subscription types
- [ ] Next billing date and amount calculation is accurate
- [ ] Subscription status updates reflect real-time gateway data

✅ **Usage Monitoring**
- [ ] User count displays correctly and updates within 1 hour
- [ ] Storage usage calculation matches actual system usage
- [ ] Visual indicators accurately represent usage percentages

✅ **Billing History**
- [ ] All historical invoices are accessible and downloadable
- [ ] Invoice PDFs generate successfully and contain accurate data
- [ ] Search and filtering functions work correctly

✅ **Payment Methods**
- [ ] Current payment method displays securely (masked)
- [ ] Payment method updates complete successfully via gateway
- [ ] Failed update attempts provide clear error messages

### 10.2 Non-Functional Acceptance

✅ **Performance**
- [ ] Page loads in <3 seconds for 95% of requests
- [ ] Invoice downloads initiate in <1 second
- [ ] API responses average <500ms

✅ **Security**
- [ ] All financial data transmission is encrypted
- [ ] Role-based access controls function correctly
- [ ] Payment gateway integration passes security review

✅ **Usability**
- [ ] Users can complete key tasks without training
- [ ] Error messages are clear and actionable
- [ ] Mobile experience is fully functional

---

## 11. Appendices

### 11.1 Wireframes and Mockups
*[To be attached separately]*

### 11.2 API Documentation
*[Detailed API specifications to be provided during development]*

### 11.3 Security Assessment
*[Security review checklist and compliance documentation]*

### 11.4 User Research Findings
*[User interviews and feedback that informed requirements]*

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Next Review**: [30 days from creation]  
**Approvals Required**: Product Manager, Engineering Lead, Security Team, Legal Team 