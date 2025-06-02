# Sebenza System - Software Architecture Documentation

## Table of Contents
1. [High-Level Application Overview](#high-level-application-overview)
2. [System Architecture](#system-architecture)
3. [Key Data Models](#key-data-models)
4. [Authentication & Authorization](#authentication--authorization)
5. [Core Workflows](#core-workflows)
6. [Technology Stack](#technology-stack)
7. [Component Architecture](#component-architecture)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [API Design](#api-design)
10. [Security Architecture](#security-architecture)

---

## High-Level Application Overview

### Purpose and Target Users
Sebenza System is a comprehensive law firm management platform designed specifically for legal professionals to streamline their practice operations. The system provides end-to-end capabilities for managing clients, cases, documents, time tracking, billing, and financial operations.

**Target Users:**
- **Attorneys**: Primary case handlers requiring full access to case management, time tracking, and client communication
- **Paralegals**: Case support staff needing access to document management, research tools, and case updates
- **Administrative Staff**: Billing, scheduling, and client communication management
- **Partners**: Strategic oversight with access to analytics, financial reports, and firm performance metrics
- **Clients**: Limited portal access for case updates, document sharing, and communication

### Core Business Objectives
- **Operational Efficiency**: Streamline case management from intake to closure
- **Financial Management**: Accurate time tracking, billing, and expense management
- **Client Satisfaction**: Transparent communication and secure document sharing
- **Compliance**: Maintain legal and regulatory compliance with audit trails
- **Scalability**: Support firm growth with flexible user management and reporting

---

## System Architecture

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Tier"
        WEB[Web Browser]
        MOBILE[Mobile App]
    end
    
    subgraph "Presentation Tier"
        REACT[React Frontend]
        ROUTER[React Router]
        STATE[State Management]
    end
    
    subgraph "API Gateway"
        GATEWAY[API Gateway/Load Balancer]
    end
    
    subgraph "Application Tier"
        AUTH[Auth Service]
        USER[User Service]
        CASE[Case Service]
        DOC[Document Service]
        TIME[Time Tracking Service]
        BILL[Billing Service]
        REPORT[Reporting Service]
    end
    
    subgraph "Data Tier"
        MAIN_DB[(Main Database)]
        DOC_STORE[(Document Store)]
        CACHE[(Redis Cache)]
        SEARCH[(Search Engine)]
    end
    
    subgraph "External Services"
        EMAIL[Email Service]
        PAY[Payment Gateway]
        ESIGN[E-Signature]
        BANK[Banking APIs]
        AI[AI Services]
    end
    
    WEB --> REACT
    MOBILE --> REACT
    REACT --> ROUTER
    REACT --> STATE
    REACT --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> USER
    GATEWAY --> CASE
    GATEWAY --> DOC
    GATEWAY --> TIME
    GATEWAY --> BILL
    GATEWAY --> REPORT
    
    AUTH --> MAIN_DB
    USER --> MAIN_DB
    CASE --> MAIN_DB
    DOC --> DOC_STORE
    TIME --> MAIN_DB
    BILL --> MAIN_DB
    REPORT --> MAIN_DB
    
    AUTH --> CACHE
    USER --> CACHE
    CASE --> CACHE
    
    DOC --> SEARCH
    CASE --> SEARCH
    
    BILL --> EMAIL
    BILL --> PAY
    DOC --> ESIGN
    BILL --> BANK
    CASE --> AI
```

### Component Overview

| Component | Purpose | Technology |
|-----------|---------|------------|
| **Frontend Application** | User interface and user experience | React 18 + TypeScript |
| **API Gateway** | Request routing, rate limiting, authentication | Express.js/Fastify |
| **Microservices** | Business logic and data processing | Node.js/TypeScript |
| **Database** | Primary data storage | PostgreSQL |
| **Document Storage** | File storage and versioning | AWS S3/MinIO |
| **Cache Layer** | Performance optimization | Redis |
| **Search Engine** | Full-text search capabilities | Elasticsearch |

---

## Key Data Models

### Core Entity Relationships

```mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string firstName
        string lastName
        enum role
        decimal hourlyRate
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    CLIENT {
        string id PK
        string firstName
        string lastName
        string email
        string phone
        string company
        json address
        enum status
        text notes
        datetime createdAt
        datetime updatedAt
    }
    
    CASE {
        string id PK
        string title
        string caseNumber UK
        string clientId FK
        enum practiceArea
        enum status
        enum priority
        date openedDate
        date closedDate
        json assignedAttorneys
        string opposingCounsel
        json courtInfo
        decimal budget
        decimal estimatedHours
        decimal actualHours
        text description
        text notes
        datetime createdAt
        datetime updatedAt
    }
    
    TIME_ENTRY {
        string id PK
        string caseId FK
        string userId FK
        date date
        time startTime
        time endTime
        decimal duration
        text description
        boolean billable
        decimal rate
        decimal amount
        enum status
        datetime createdAt
        datetime updatedAt
    }
    
    DOCUMENT {
        string id PK
        string name
        enum type
        string caseId FK
        string clientId FK
        string fileUrl
        bigint fileSize
        string mimeType
        string uploadedBy FK
        json tags
        boolean isConfidential
        integer version
        string parentDocumentId FK
        datetime createdAt
        datetime updatedAt
    }
    
    INVOICE {
        string id PK
        string invoiceNumber UK
        string clientId FK
        string caseId FK
        date issueDate
        date dueDate
        enum status
        json timeEntries
        json expenses
        decimal subtotal
        decimal taxAmount
        decimal totalAmount
        decimal paidAmount
        string paymentTerms
        text notes
        datetime createdAt
        datetime updatedAt
    }
    
    EXPENSE {
        string id PK
        string title
        text description
        decimal amount
        string currency
        date date
        string category
        string clientId FK
        string caseId FK
        boolean isBillable
        decimal tax
        decimal taxAmount
        decimal totalAmount
        json attachments
        boolean isRecurring
        string recurringFrequency
        date recurringEndDate
        string vendor
        string paymentMethod
        enum status
        string approvedBy FK
        string createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    
    ACCOUNT {
        string id PK
        string code UK
        string name
        enum type
        string category
        decimal balance
        string parentId FK
        boolean isActive
        text description
        datetime createdAt
        datetime updatedAt
    }
    
    CLIENT ||--o{ CASE : "has"
    CASE ||--o{ TIME_ENTRY : "tracks"
    CASE ||--o{ DOCUMENT : "contains"
    CASE ||--o{ INVOICE : "generates"
    CASE ||--o{ EXPENSE : "incurs"
    USER ||--o{ TIME_ENTRY : "creates"
    USER ||--o{ DOCUMENT : "uploads"
    CLIENT ||--o{ DOCUMENT : "owns"
    CLIENT ||--o{ INVOICE : "receives"
    CLIENT ||--o{ EXPENSE : "related"
    ACCOUNT ||--o{ ACCOUNT : "parent-child"
```

### Data Model Details

#### User Entity
```typescript
interface User {
  id: string;                    // Primary key
  email: string;                 // Unique identifier
  firstName: string;
  lastName: string;
  role: 'admin' | 'attorney' | 'paralegal' | 'assistant' | 'billing';
  hourlyRate?: number;           // Optional billing rate
  isActive: boolean;
  profilePhotoUrl?: string;
  permissions: string[];         // Role-based permissions
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Case Entity
```typescript
interface Case {
  id: string;                    // Primary key
  title: string;
  caseNumber?: string;           // Optional case number
  clientId: string;              // Foreign key to Client
  practiceArea: 'Corporate' | 'Litigation' | 'Estate' | 'IP' | 'Contracts' | 
                'Family' | 'Criminal' | 'Immigration' | 'Real Estate' | 'Tax';
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  openedDate: Date;
  closedDate?: Date;
  assignedAttorneys: string[];   // Array of User IDs
  opposingCounsel?: string;
  courtInfo?: {
    courtName: string;
    judgeAssigned?: string;
    caseNumber?: string;
  };
  budget?: number;
  estimatedHours?: number;
  actualHours: number;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Client Entity
```typescript
interface Client {
  id: string;                    // Primary key
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'active' | 'inactive' | 'prospective';
  contactPreferences: {
    email: boolean;
    phone: boolean;
    sms: boolean;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Document Entity
```typescript
interface Document {
  id: string;                    // Primary key
  name: string;
  type: 'contract' | 'pleading' | 'correspondence' | 'evidence' | 
        'invoice' | 'receipt' | 'memo' | 'report' | 'other';
  caseId?: string;               // Optional case association
  clientId?: string;             // Optional client association
  fileUrl: string;               // Storage location
  fileSize: number;              // Size in bytes
  mimeType: string;
  uploadedBy: string;            // User ID
  tags: string[];                // Searchable tags
  isConfidential: boolean;
  version: number;               // Version control
  parentDocumentId?: string;     // For document versions
  checksum: string;              // File integrity
  downloadCount: number;
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Authentication & Authorization

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant D as Database
    participant R as Redis Cache
    
    U->>F: Enter credentials
    F->>A: POST /auth/login
    A->>D: Validate credentials
    D-->>A: User data
    A->>A: Generate JWT + Refresh Token
    A->>R: Store refresh token
    A-->>F: JWT + Refresh Token
    F->>F: Store tokens
    F-->>U: Login success
    
    Note over F,A: For subsequent requests
    F->>A: Request with JWT header
    A->>A: Validate JWT
    A-->>F: Allow/Deny request
    
    Note over F,A: Token refresh flow
    F->>A: POST /auth/refresh
    A->>R: Validate refresh token
    R-->>A: Token valid
    A->>A: Generate new JWT
    A-->>F: New JWT
```

### Authorization Matrix

| Role | Clients | Cases | Documents | Time Tracking | Invoicing | Reports | Admin |
|------|---------|-------|-----------|---------------|-----------|---------|-------|
| **Admin** | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| **Attorney** | CRUD | CRUD (assigned) | CRUD | CRUD (own) | CR | CR | - |
| **Paralegal** | CR | RU (assigned) | CRUD | CRUD (own) | - | R | - |
| **Assistant** | RU | R (assigned) | RU | - | R | R | - |
| **Billing** | R | R | R | R | CRUD | CR | - |
| **Client** | R (own) | R (own) | R (own) | - | R (own) | - | - |

*Legend: C=Create, R=Read, U=Update, D=Delete*

### Role-Based Access Control (RBAC)

```mermaid
graph LR
    subgraph "Roles"
        ADMIN[Admin]
        ATTORNEY[Attorney]
        PARALEGAL[Paralegal]
        ASSISTANT[Assistant]
        BILLING[Billing]
        CLIENT[Client]
    end
    
    subgraph "Permissions"
        CASE_CREATE[case:create]
        CASE_READ[case:read]
        CASE_UPDATE[case:update]
        CASE_DELETE[case:delete]
        CLIENT_MANAGE[client:manage]
        INVOICE_CREATE[invoice:create]
        REPORT_ACCESS[report:access]
        ADMIN_ACCESS[admin:access]
    end
    
    ADMIN --> CASE_CREATE
    ADMIN --> CASE_READ
    ADMIN --> CASE_UPDATE
    ADMIN --> CASE_DELETE
    ADMIN --> CLIENT_MANAGE
    ADMIN --> INVOICE_CREATE
    ADMIN --> REPORT_ACCESS
    ADMIN --> ADMIN_ACCESS
    
    ATTORNEY --> CASE_CREATE
    ATTORNEY --> CASE_READ
    ATTORNEY --> CASE_UPDATE
    ATTORNEY --> CLIENT_MANAGE
    ATTORNEY --> REPORT_ACCESS
    
    PARALEGAL --> CASE_READ
    PARALEGAL --> CASE_UPDATE
    
    BILLING --> INVOICE_CREATE
    BILLING --> REPORT_ACCESS
    
    CLIENT --> CASE_READ
```

---

## Core Workflows

### 1. Client Intake Workflow

```mermaid
flowchart TD
    START([Client Contact]) --> INITIAL[Initial Consultation]
    INITIAL --> CONFLICT[Conflict Check]
    CONFLICT --> CONFLICT_OK{Conflict Free?}
    CONFLICT_OK -->|No| DECLINE[Decline Representation]
    CONFLICT_OK -->|Yes| AGREEMENT[Engagement Agreement]
    AGREEMENT --> SIGNED{Agreement Signed?}
    SIGNED -->|No| FOLLOW_UP[Follow-up Required]
    SIGNED -->|Yes| CREATE_CLIENT[Create Client Record]
    CREATE_CLIENT --> CREATE_CASE[Create Initial Case]
    CREATE_CASE --> ASSIGN[Assign Attorney/Team]
    ASSIGN --> SETUP_BILLING[Setup Billing Terms]
    SETUP_BILLING --> PORTAL[Setup Client Portal]
    PORTAL --> COMPLETE[Intake Complete]
    FOLLOW_UP --> SIGNED
    DECLINE --> END([End Process])
    COMPLETE --> END
```

### 2. Case Management Workflow

```mermaid
flowchart TD
    START([Case Opened]) --> PLAN[Case Planning]
    PLAN --> TASKS[Create Tasks & Milestones]
    TASKS --> ASSIGN_TEAM[Assign Team Members]
    ASSIGN_TEAM --> DISCOVERY[Discovery Phase]
    DISCOVERY --> DOCS[Document Collection]
    DOCS --> RESEARCH[Legal Research]
    RESEARCH --> STRATEGY[Strategy Development]
    STRATEGY --> EXECUTION[Case Execution]
    EXECUTION --> MONITOR[Progress Monitoring]
    MONITOR --> UPDATE{Status Update?}
    UPDATE -->|Continue| EXECUTION
    UPDATE -->|Settlement| SETTLEMENT[Settlement Negotiation]
    UPDATE -->|Trial| TRIAL[Trial Preparation]
    SETTLEMENT --> CLOSE_SETTLE[Close via Settlement]
    TRIAL --> TRIAL_EXEC[Trial Execution]
    TRIAL_EXEC --> VERDICT[Verdict/Judgment]
    VERDICT --> CLOSE_TRIAL[Close via Trial]
    CLOSE_SETTLE --> FINAL_BILL[Final Billing]
    CLOSE_TRIAL --> FINAL_BILL
    FINAL_BILL --> ARCHIVE[Archive Case]
    ARCHIVE --> END([Case Closed])
```

### 3. Document Management Workflow

```mermaid
flowchart TD
    START([Document Request]) --> UPLOAD[Upload Document]
    UPLOAD --> VALIDATE[Validate File Type & Size]
    VALIDATE --> VALID{Valid?}
    VALID -->|No| ERROR[Display Error]
    VALID -->|Yes| SCAN[Virus Scan]
    SCAN --> SAFE{Safe?}
    SAFE -->|No| QUARANTINE[Quarantine File]
    SAFE -->|Yes| METADATA[Extract Metadata]
    METADATA --> CLASSIFY[Auto-Classify]
    CLASSIFY --> MANUAL{Manual Review?}
    MANUAL -->|Yes| REVIEW[Manual Classification]
    MANUAL -->|No| STORE[Store in Repository]
    REVIEW --> STORE
    STORE --> INDEX[Index for Search]
    INDEX --> PERMISSION[Set Permissions]
    PERMISSION --> NOTIFY[Notify Stakeholders]
    NOTIFY --> VERSION[Version Control]
    VERSION --> COMPLETE[Upload Complete]
    ERROR --> END([Process End])
    QUARANTINE --> END
    COMPLETE --> END
```

### 4. Time Tracking & Billing Workflow

```mermaid
flowchart TD
    START([Start Work]) --> TIMER[Start Timer]
    TIMER --> WORK[Perform Work]
    WORK --> STOP{Stop Work?}
    STOP -->|No| WORK
    STOP -->|Yes| STOP_TIMER[Stop Timer]
    STOP_TIMER --> DESCRIBE[Add Description]
    DESCRIBE --> CATEGORIZE[Categorize Work]
    CATEGORIZE --> BILLABLE{Billable?}
    BILLABLE -->|Yes| SET_RATE[Set Billing Rate]
    BILLABLE -->|No| SAVE_NON[Save Non-billable]
    SET_RATE --> SAVE_BILL[Save Billable Entry]
    SAVE_BILL --> SUBMIT[Submit for Approval]
    SAVE_NON --> SUBMIT
    SUBMIT --> REVIEW[Manager Review]
    REVIEW --> APPROVED{Approved?}
    APPROVED -->|No| REVISE[Request Revision]
    APPROVED -->|Yes| INVOICE_READY[Ready for Invoicing]
    REVISE --> DESCRIBE
    INVOICE_READY --> GENERATE[Generate Invoice]
    GENERATE --> SEND[Send to Client]
    SEND --> TRACK[Track Payment]
    TRACK --> END([Process Complete])
```

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | Core UI framework |
| **TypeScript** | 5.5.3 | Type safety and developer experience |
| **Vite** | 5.4.1 | Build tool and development server |
| **React Router** | 6.26.2 | Client-side routing |
| **Tailwind CSS** | 3.4.11 | Utility-first styling |
| **shadcn/ui** | Latest | Component library |
| **React Query** | 5.56.2 | Server state management |
| **React Hook Form** | 7.56.4 | Form handling |
| **Zod** | 3.25.34 | Schema validation |
| **Recharts** | 2.12.7 | Data visualization |
| **Lucide React** | 0.462.0 | Icon library |

### Backend Stack (Recommended)

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js/Fastify** | Web framework |
| **TypeScript** | Type safety |
| **PostgreSQL** | Primary database |
| **Prisma/TypeORM** | ORM |
| **Redis** | Caching and sessions |
| **JWT** | Authentication tokens |
| **Multer** | File upload handling |
| **Nodemailer** | Email sending |
| **Winston** | Logging |
| **Jest** | Testing framework |

### Infrastructure Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Container** | Docker | Application containerization |
| **Orchestration** | Kubernetes | Container orchestration |
| **Database** | PostgreSQL 15+ | Primary data storage |
| **Cache** | Redis 7+ | Caching and session storage |
| **File Storage** | AWS S3/MinIO | Document and file storage |
| **Search** | Elasticsearch 8+ | Full-text search |
| **Message Queue** | RabbitMQ/AWS SQS | Async processing |
| **Monitoring** | Prometheus + Grafana | System monitoring |
| **Logging** | ELK Stack | Centralized logging |

---

## Component Architecture

### Frontend Component Hierarchy

```mermaid
graph TD
    APP[App.tsx] --> ROUTER[Router]
    APP --> PROVIDERS[Providers]
    
    ROUTER --> DASHBOARD[Dashboard]
    ROUTER --> CLIENTS[Clients]
    ROUTER --> CASES[Cases]
    ROUTER --> DOCUMENTS[Documents]
    ROUTER --> TIME[Time Tracking]
    ROUTER --> INVOICES[Invoices]
    ROUTER --> REPORTS[Reports]
    ROUTER --> SETTINGS[Settings]
    
    CASES --> CASE_LIST[CaseList]
    CASES --> CASE_DETAIL[CaseDetailView]
    CASE_DETAIL --> CASE_SUMMARY[Summary Tab]
    CASE_DETAIL --> CASE_TASKS[Tasks Tab]
    CASE_DETAIL --> CASE_DOCS[Documents Tab]
    CASE_DETAIL --> CASE_TIME[Time Tab]
    CASE_DETAIL --> CASE_NOTES[Notes Tab]
    
    PROVIDERS --> AUTH[Auth Provider]
    PROVIDERS --> QUERY[Query Provider]
    PROVIDERS --> THEME[Theme Provider]
    PROVIDERS --> TOAST[Toast Provider]
    
    subgraph "UI Components"
        BUTTON[Button]
        INPUT[Input]
        CARD[Card]
        TABLE[Table]
        FORM[Form]
        DIALOG[Dialog]
    end
    
    subgraph "Layout Components"
        SIDEBAR[Sidebar]
        HEADER[Header]
        MAIN[Main Content]
    end
    
    subgraph "Feature Components"
        TASK_DIALOG[TaskDialog]
        MILESTONE_DIALOG[MilestoneDialog]
        GANTT[GanttChart]
        AI_ASSISTANT[AI Assistant]
    end
```

### State Management Architecture

```mermaid
graph LR
    subgraph "Client State"
        LOCAL[Local State]
        CONTEXT[Context API]
        REDUCER[useReducer]
    end
    
    subgraph "Server State"
        REACT_QUERY[React Query]
        CACHE[Query Cache]
        MUTATIONS[Mutations]
    end
    
    subgraph "Persistent State"
        LOCAL_STORAGE[localStorage]
        SESSION_STORAGE[sessionStorage]
        COOKIES[Cookies]
    end
    
    CONTEXT --> LOCAL
    REDUCER --> CONTEXT
    REACT_QUERY --> CACHE
    MUTATIONS --> REACT_QUERY
    LOCAL_STORAGE --> CONTEXT
    SESSION_STORAGE --> CONTEXT
    COOKIES --> CONTEXT
```

---

## Data Flow Diagrams

### Case Management Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant CS as Case Service
    participant DB as Database
    participant ES as Event System
    participant NS as Notification Service
    
    U->>F: Create New Case
    F->>A: POST /api/cases
    A->>CS: Validate & Process
    CS->>DB: Insert Case Record
    DB-->>CS: Case Created
    CS->>ES: Publish CaseCreated Event
    ES->>NS: Trigger Notifications
    NS->>NS: Send Email to Team
    CS-->>A: Case Response
    A-->>F: Success Response
    F-->>U: Case Created Confirmation
    
    Note over ES,NS: Async Event Processing
    ES->>CS: Update Case Analytics
    ES->>CS: Create Default Tasks
```

### Document Upload Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Gateway
    participant DS as Document Service
    participant S3 as File Storage
    participant VS as Virus Scanner
    participant ES as Search Engine
    participant DB as Database
    
    U->>F: Select File to Upload
    F->>A: POST /api/documents/upload
    A->>DS: Process Upload Request
    DS->>S3: Upload to Temporary Location
    S3-->>DS: Upload Complete
    DS->>VS: Scan for Viruses
    VS-->>DS: Scan Results
    
    alt Virus Found
        DS->>S3: Delete File
        DS-->>F: Upload Failed
    else Clean File
        DS->>S3: Move to Permanent Location
        DS->>DB: Save Document Metadata
        DS->>ES: Index Document Content
        DS-->>F: Upload Success
    end
    
    F-->>U: Upload Result
```

---

## API Design

### RESTful API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/login           # User login
POST   /api/auth/logout          # User logout
POST   /api/auth/refresh         # Refresh token
POST   /api/auth/forgot-password # Password reset request
POST   /api/auth/reset-password  # Password reset confirmation
```

#### Client Management
```
GET    /api/clients              # List clients (with pagination)
GET    /api/clients/:id          # Get specific client
POST   /api/clients              # Create new client
PUT    /api/clients/:id          # Update client
DELETE /api/clients/:id          # Delete client
GET    /api/clients/:id/cases    # Get client's cases
```

#### Case Management
```
GET    /api/cases                # List cases (with filters)
GET    /api/cases/:id            # Get specific case
POST   /api/cases                # Create new case
PUT    /api/cases/:id            # Update case
DELETE /api/cases/:id            # Delete case
GET    /api/cases/:id/documents  # Get case documents
GET    /api/cases/:id/time-entries # Get case time entries
POST   /api/cases/:id/tasks      # Create case task
GET    /api/cases/:id/milestones # Get case milestones
```

#### Document Management
```
GET    /api/documents            # List documents
GET    /api/documents/:id        # Get document metadata
POST   /api/documents            # Upload document
PUT    /api/documents/:id        # Update document
DELETE /api/documents/:id        # Delete document
GET    /api/documents/:id/download # Download document
POST   /api/documents/:id/share  # Share document
```

#### Time Tracking
```
GET    /api/time-entries         # List time entries
GET    /api/time-entries/:id     # Get specific entry
POST   /api/time-entries         # Create time entry
PUT    /api/time-entries/:id     # Update time entry
DELETE /api/time-entries/:id     # Delete time entry
POST   /api/time-entries/:id/submit # Submit for approval
POST   /api/time-entries/:id/approve # Approve entry
```

### API Response Standards

#### Success Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## Security Architecture

### Security Layers

```mermaid
graph TB
    subgraph "Client Security"
        HTTPS[HTTPS/TLS 1.3]
        CSP[Content Security Policy]
        XSS[XSS Protection]
    end
    
    subgraph "API Security"
        RATE[Rate Limiting]
        CORS[CORS Policy]
        JWT[JWT Validation]
        RBAC[Role-Based Access]
    end
    
    subgraph "Data Security"
        ENCRYPT[Data Encryption]
        HASH[Password Hashing]
        BACKUP[Encrypted Backups]
        AUDIT[Audit Logging]
    end
    
    subgraph "Infrastructure Security"
        FIREWALL[Firewall Rules]
        VPN[VPN Access]
        MONITORING[Security Monitoring]
        UPDATES[Security Updates]
    end
    
    HTTPS --> RATE
    CSP --> CORS
    XSS --> JWT
    JWT --> ENCRYPT
    RBAC --> HASH
    ENCRYPT --> FIREWALL
    AUDIT --> MONITORING
```

### Data Protection Measures

1. **Encryption at Rest**: All sensitive data encrypted using AES-256
2. **Encryption in Transit**: TLS 1.3 for all communications
3. **Password Security**: Bcrypt hashing with salt rounds
4. **Access Control**: Multi-level authentication and authorization
5. **Audit Trails**: Comprehensive logging of all user actions
6. **Data Backup**: Encrypted, geographically distributed backups
7. **Compliance**: GDPR, HIPAA, and legal industry standard compliance

### Security Monitoring

```mermaid
flowchart TD
    EVENTS[Security Events] --> SIEM[SIEM System]
    SIEM --> ANALYSIS[Real-time Analysis]
    ANALYSIS --> THREAT{Threat Detected?}
    THREAT -->|Yes| ALERT[Generate Alert]
    THREAT -->|No| LOG[Log Event]
    ALERT --> RESPONSE[Incident Response]
    RESPONSE --> MITIGATE[Mitigate Threat]
    MITIGATE --> REVIEW[Post-Incident Review]
    LOG --> ARCHIVE[Archive Logs]
```

---

## Conclusion

The Sebenza System architecture provides a robust, scalable, and secure platform for law firm management. The microservices architecture ensures flexibility and maintainability, while the comprehensive security measures protect sensitive legal data. The React-based frontend provides an intuitive user experience, and the well-defined API enables future integrations and mobile applications.

Key architectural strengths:
- **Scalability**: Microservices architecture supports horizontal scaling
- **Security**: Multi-layered security approach with comprehensive audit trails
- **Maintainability**: Clear separation of concerns and well-documented APIs
- **Extensibility**: Plugin architecture and API-first design enable customization
- **Performance**: Caching strategies and optimized database queries ensure responsiveness

This architecture serves as the foundation for a modern, efficient law firm management system that can adapt to evolving business needs while maintaining the highest standards of security and reliability.
