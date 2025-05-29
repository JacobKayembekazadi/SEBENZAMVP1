import { z } from "zod";

// User and Authentication Schemas
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "attorney", "paralegal", "assistant", "billing"]),
  hourlyRate: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Client Schemas
export const clientSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  company: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default("US"),
  }).optional(),
  status: z.enum(["active", "inactive", "prospective"]),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Case Schemas
export const caseSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Case title is required"),
  caseNumber: z.string().optional(),
  clientId: z.string(),
  practiceArea: z.enum([
    "Corporate", "Litigation", "Estate", "IP", "Contracts", 
    "Family", "Criminal", "Immigration", "Real Estate", "Tax"
  ]),
  status: z.enum(["active", "pending", "closed", "on_hold"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  openedDate: z.date(),
  closedDate: z.date().optional(),
  assignedAttorneys: z.array(z.string()),
  opposingCounsel: z.string().optional(),
  courtInfo: z.object({
    courtName: z.string(),
    judgeAssigned: z.string().optional(),
    caseNumber: z.string().optional(),
  }).optional(),
  budget: z.number().positive().optional(),
  estimatedHours: z.number().positive().optional(),
  actualHours: z.number().default(0),
  description: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Time Entry Schemas
export const timeEntrySchema = z.object({
  id: z.string(),
  caseId: z.string(),
  userId: z.string(),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  duration: z.number().positive(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  billable: z.boolean().default(true),
  rate: z.number().positive(),
  amount: z.number().positive(),
  status: z.enum(["draft", "submitted", "approved", "billed"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Document Schemas
export const documentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Document name is required"),
  type: z.enum([
    "contract", "pleading", "correspondence", "evidence", 
    "invoice", "receipt", "memo", "report", "other"
  ]),
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  fileUrl: z.string().url(),
  fileSize: z.number().positive(),
  mimeType: z.string(),
  uploadedBy: z.string(),
  tags: z.array(z.string()).default([]),
  isConfidential: z.boolean().default(false),
  version: z.number().default(1),
  parentDocumentId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Invoice Schemas
export const invoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  clientId: z.string(),
  caseId: z.string().optional(),
  issueDate: z.date(),
  dueDate: z.date(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  timeEntries: z.array(z.string()),
  expenses: z.array(z.string()),
  subtotal: z.number(),
  taxAmount: z.number().default(0),
  totalAmount: z.number(),
  paidAmount: z.number().default(0),
  paymentTerms: z.string().default("Net 30"),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Form Schemas for Create/Update operations
export const createClientSchema = clientSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateClientSchema = createClientSchema.partial();

export const createCaseSchema = caseSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  actualHours: true 
});

export const updateCaseSchema = createCaseSchema.partial();

export const createTimeEntrySchema = timeEntrySchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  amount: true,
  duration: true 
});

export const updateTimeEntrySchema = createTimeEntrySchema.partial();

// Search and Filter Schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["all", "cases", "clients", "documents", "invoices"]).default("all"),
  filters: z.object({
    practiceArea: z.array(z.string()).optional(),
    status: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.date(),
      end: z.date(),
    }).optional(),
    assignedTo: z.array(z.string()).optional(),
  }).optional(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type Client = z.infer<typeof clientSchema>;
export type Case = z.infer<typeof caseSchema>;
export type TimeEntry = z.infer<typeof timeEntrySchema>;
export type Document = z.infer<typeof documentSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type CreateClient = z.infer<typeof createClientSchema>;
export type UpdateClient = z.infer<typeof updateClientSchema>;
export type CreateCase = z.infer<typeof createCaseSchema>;
export type UpdateCase = z.infer<typeof updateCaseSchema>;
export type CreateTimeEntry = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntry = z.infer<typeof updateTimeEntrySchema>;
export type SearchParams = z.infer<typeof searchSchema>; 