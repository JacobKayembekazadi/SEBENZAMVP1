# Feature List

This document enumerates every page, component, button, form, link, and interactive element present in the Sebenza application codebase. Use it as a checklist to ensure UI/UX coverage during testing and manual QA.

---

## 1. Application Pages (src/pages)

- **Home / Landing** (`Index`)
- **Dashboard** (`Dashboard`)
- **Calendar** (`Calendar`)
- **Clients**
  - Client List (`Clients`)
  - Client Details (`ClientDetails`)
- **Cases** (`Cases`)
- **Documents** (`Documents`)
- **Invoices** (`Invoices`)
- **Estimates / Quotes** (`Estimates`)
- **Expenses** (`Expenses`)
- **Accounting** (`Accounting`)
- **Reports** (`Reports`)
- **Messages / Communication** (`Messages`)
- **Time Tracking** (`TimeTracking`)
- **Settings** (`Settings`)
- **Client Portal** (`ClientPortal`)
- **Help / Knowledge-base** (`Help`)
- **Package Showcase** (`MyPackagePage`)
- **404 – Not Found** (`NotFound`)

> Each page should be verified for route loading, data fetching, and error boundaries.

---

## 2. Global UI & Navigation

- **Sidebar Navigation** (`layout/Sidebar`)
- **Dashboard Layout Wrapper** (`layout/DashboardLayout`)
- **Global Search Bar** (`GlobalSearchBar`)
- **Top Header / Mobile Hamburger** (`layout` components)
- **Theme Toggle / Dark-mode Switch** (`ui/switch`)
- **Toast Notifications** (`ui/sonner`, `hooks/use-toast`)
- **Error Boundary** (`ui/error-boundary`)

---

## 3. Authentication & Onboarding

- **Login Form** (`auth/LoginForm`)
- **Onboarding Tour** (`onboarding/OnboardingTour`)
- **Welcome Dialog** (`onboarding/WelcomeDialog`)
- **Profile Completion Banner** (`profile/ProfileCompletion`)

---

## 4. Feature Modules & Dialogs (src/components)

### 4.1 Clients
- **Add Client Dialog** (`clients/AddClientDialog`)
- **Client Filters Toolbar** (`clients/ClientFilters`)
- **Client Import CSV** (`clients/ClientImport`)
- **Client Communications**
  - Bulk Email Dialog (`clients/communications/BulkEmailDialog`)
  - Communication Log (`clients/communications/CommunicationLog`)
- **Enhanced Client Tools** (`clients/enhanced/*`)
  - Client Overview, Notes, Tags, Timeline, Categories, Analytics, Relationships, Retention Analysis
- **Client Tasks** (`clients/tasks/TaskManagement`)

### 4.2 Cases
- **Case Detail View** (`cases/CaseDetailView`)
- **Task Dialog** (`cases/TaskDialog`)
- **Milestone Dialog** (`cases/MilestoneDialog`)
- **Gantt Chart** (`cases/GanttChart`)

### 4.3 Calendar & Events
- **Add Event Dialog** (`calendar/AddEventDialog`)

### 4.4 Documents
- **File Grid** (`documents/FileGrid`)
- **File List** (`documents/FileList`)
- **Folders List** (`documents/FoldersList`)
- **Search Toolbar** (`documents/SearchToolbar`)
- **Filters Panel** (`documents/FiltersPanel`)

### 4.5 Invoices & Payments
- **Invoice Dialog** (`invoices/InvoiceDialog`)
- **Payment Dialog** (`invoices/PaymentDialog`)
- **Recurring Invoice Card** (`invoices/RecurringInvoiceCard`)
- **Invoice Settings** (`invoices/InvoiceSettings`)

### 4.6 Dashboard Widgets
- Billing Overview, Recent Clients/Cases, Revenue Chart, Upcoming Events, Case Distribution, Stat Card

### 4.7 Reports
- Case Performance, Client Analytics, Financial Chart, Financial Reports, Staff Utilization, Report Filters

### 4.8 AI Assistant
- **Basic Assistant** (`ai/AIAssistant`)
- **Enhanced Assistant** (`ai/EnhancedAIAssistant`)

---

## 5. Forms & Validation

- **Case Form** (`forms/CaseForm`)
- **Client Form** (`forms/ClientForm`)
- **Reusable Form Components** (all in `ui/form`, plus `hooks/useLocalStorage` for draft persistence)

Each form must be checked for:
1. Field validation (Zod + React Hook Form)
2. Submit ↔ server integration (React Query mutation)
3. Success/error toasts
4. Keyboard accessibility (tab order, ARIA labels)

---

## 6. Common Interactive UI Elements (src/components/ui)

Below is the full list of radix-based UI primitives wrapped by **shadcn/ui**. All expose props like `onClick`, `onChange`, etc., and must be tested in isolation and within feature flows.

Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu, Error Boundary, Form, Hover Card, Input, Input-OTP, Label, Loading States, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable Panels, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner (Toast), Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip.

---

## 7. Buttons & Links (Representative)

Every page features standard CRUD actions; verify the following buttons:

- **Create / New / Add** (e.g., "Add Client", "New Invoice", "Add Event")
- **Edit / Update**
- **Delete / Remove**
- **Save / Submit**
- **Cancel / Close**
- **Filter / Search**
- **Import / Export**
- **Bulk Actions** (Bulk Email, Bulk Delete)
- **Download / View PDF**
- **Next / Previous / Pagination Controls**
- **Login / Logout**
- **Theme Toggle**

Each button should be tested for hover, focus, disabled, loading state, and correct ARIA attributes.

---

## 8. Links & Navigation

- Route links in Sidebar (`<Link to="/clients">` etc.)
- Breadcrumb links inside detail pages
- External links (Help docs, Privacy, Terms)

---

## 9. Miscellaneous Interactive Elements

- **Search inputs with debounce** (GlobalSearchBar, documents/search toolbar)
- **Drag-&-drop (if enabled in File Grid)**
- **Resizable panels** (split-pane layouts)
- **Charts with tooltips and legends (Recharts)**
- **Progress indicators / loaders**

---

## 10. Accessibility & Keyboard Shortcuts

- Page-level skip links
- Dialog close on `Esc`
- Focus trapping inside modal dialogs
- `Cmd/Ctrl + K` command menu (`ui/command`)
- ARIA roles/labels on all UI primitives

---

### ✅ Use this file as a master checklist when writing Cypress/Playwright E2E suites, unit tests, or manual exploratory sessions. 