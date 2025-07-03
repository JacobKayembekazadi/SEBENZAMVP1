// API Service Layer for Sebenza System
import { 
  Client, 
  Case, 
  TimeEntry, 
  User, 
  Document, 
  Invoice,
  Expense,
  CreateClient,
  UpdateClient,
  CreateCase,
  UpdateCase,
  CreateTimeEntry,
  UpdateTimeEntry,
  CreateInvoice,
  UpdateInvoice,
  CreateExpense,
  UpdateExpense
} from './schemas';

// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Auth token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// Response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    defaultHeaders.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(
        result.message || `HTTP error! status: ${response.status}`,
        response.status,
        result.errors
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`API Error (${endpoint}):`, error);
    throw new ApiError('Network error occurred');
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data) {
      setAuthToken(response.data.token);
      return response.data;
    }
    
    throw new ApiError(response.message || 'Login failed');
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data) {
      setAuthToken(response.data.token);
      return response.data;
    }
    
    throw new ApiError(response.message || 'Registration failed');
  },

  logout: async (): Promise<void> => {
    await apiRequest('/auth/logout', { method: 'POST' });
    setAuthToken(null);
  },

  refreshToken: async (): Promise<{ user: User; token: string }> => {
    const response = await apiRequest<{ user: User; token: string }>('/auth/refresh', {
      method: 'POST',
    });
    
    if (response.success && response.data) {
      setAuthToken(response.data.token);
      return response.data;
    }
    
    throw new ApiError(response.message || 'Token refresh failed');
  },
};

// Clients API
export const clientsApi = {
  getAll: async (params?: { 
    status?: string; 
    search?: string; 
    page?: number; 
    limit?: number; 
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ clients: Client[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const response = await apiRequest<{ clients: Client[]; pagination: any }>(`/clients${query ? `?${query}` : ''}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch clients');
  },

  getById: async (id: string): Promise<Client> => {
    const response = await apiRequest<Client>(`/clients/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch client');
  },

  create: async (client: CreateClient): Promise<Client> => {
    const response = await apiRequest<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to create client');
  },

  update: async (id: string, updates: UpdateClient): Promise<Client> => {
    const response = await apiRequest<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to update client');
  },

  delete: async (id: string): Promise<void> => {
    const response = await apiRequest(`/clients/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new ApiError(response.message || 'Failed to delete client');
    }
  },
};

// Cases API
export const casesApi = {
  getAll: async (params?: { 
    status?: string; 
    practiceArea?: string;
    priority?: string;
    clientId?: string;
    search?: string; 
    page?: number; 
    limit?: number; 
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ cases: Case[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const response = await apiRequest<{ cases: Case[]; pagination: any }>(`/cases${query ? `?${query}` : ''}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch cases');
  },

  getById: async (id: string): Promise<Case> => {
    const response = await apiRequest<Case>(`/cases/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch case');
  },

  create: async (caseData: CreateCase): Promise<Case> => {
    const response = await apiRequest<Case>('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to create case');
  },

  update: async (id: string, updates: UpdateCase): Promise<Case> => {
    const response = await apiRequest<Case>(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to update case');
  },

  delete: async (id: string): Promise<void> => {
    const response = await apiRequest(`/cases/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new ApiError(response.message || 'Failed to delete case');
    }
  },

  getTimeEntries: async (id: string): Promise<TimeEntry[]> => {
    const response = await apiRequest<TimeEntry[]>(`/cases/${id}/time-entries`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch case time entries');
  },
};

// Time Entries API
export const timeEntriesApi = {
  getAll: async (params?: { 
    caseId?: string;
    userId?: string;
    status?: string;
    billable?: boolean;
    startDate?: string;
    endDate?: string;
    page?: number; 
    limit?: number; 
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ timeEntries: TimeEntry[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const response = await apiRequest<{ timeEntries: TimeEntry[]; pagination: any }>(`/time-entries${query ? `?${query}` : ''}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch time entries');
  },

  getById: async (id: string): Promise<TimeEntry> => {
    const response = await apiRequest<TimeEntry>(`/time-entries/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch time entry');
  },

  create: async (timeEntry: CreateTimeEntry): Promise<TimeEntry> => {
    const response = await apiRequest<TimeEntry>('/time-entries', {
      method: 'POST',
      body: JSON.stringify(timeEntry),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to create time entry');
  },

  update: async (id: string, updates: UpdateTimeEntry): Promise<TimeEntry> => {
    const response = await apiRequest<TimeEntry>(`/time-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to update time entry');
  },

  delete: async (id: string): Promise<void> => {
    const response = await apiRequest(`/time-entries/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new ApiError(response.message || 'Failed to delete time entry');
    }
  },

  bulkUpdate: async (timeEntryIds: string[], status: string): Promise<{ updatedCount: number }> => {
    const response = await apiRequest<{ updatedCount: number }>('/time-entries/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ timeEntryIds, status }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }

    throw new ApiError(response.message || 'Failed to bulk update time entries');
  },
};

// Documents API
export const documentsApi = {
  getAll: async (params?: { 
    type?: string;
    caseId?: string;
    clientId?: string;
    search?: string;
    isConfidential?: boolean;
    page?: number; 
    limit?: number; 
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ documents: Document[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const response = await apiRequest<{ documents: Document[]; pagination: any }>(`/documents${query ? `?${query}` : ''}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch documents');
  },

  getById: async (id: string): Promise<Document> => {
    const response = await apiRequest<Document>(`/documents/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch document');
  },

  upload: async (file: File, metadata: {
    name?: string;
    type: string;
    caseId?: string;
    clientId?: string;
    tags?: string[];
    isConfidential?: boolean;
  }): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new ApiError(result.message || 'Failed to upload document', response.status);
    }

    if (result.success && result.data) {
      return result.data;
    }
    
    throw new ApiError(result.message || 'Failed to upload document');
  },

  update: async (id: string, updates: {
    name?: string;
    type?: string;
    tags?: string[];
    isConfidential?: boolean;
  }): Promise<Document> => {
    const response = await apiRequest<Document>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to update document');
  },

  delete: async (id: string): Promise<void> => {
    const response = await apiRequest(`/documents/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new ApiError(response.message || 'Failed to delete document');
    }
  },

  download: async (id: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });

    if (!response.ok) {
      throw new ApiError('Failed to download document', response.status);
    }

    return response.blob();
  },
};

// Invoices API
export const invoicesApi = {
  getAll: async (params?: { 
    status?: string;
    clientId?: string;
    caseId?: string;
    search?: string;
    page?: number; 
    limit?: number; 
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ invoices: Invoice[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const response = await apiRequest<{ invoices: Invoice[]; pagination: any }>(`/invoices${query ? `?${query}` : ''}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch invoices');
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await apiRequest<Invoice>(`/invoices/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch invoice');
  },

  create: async (invoice: CreateInvoice): Promise<Invoice> => {
    const response = await apiRequest<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to create invoice');
  },

  update: async (id: string, updates: UpdateInvoice): Promise<Invoice> => {
    const response = await apiRequest<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to update invoice');
  },

  delete: async (id: string): Promise<void> => {
    const response = await apiRequest(`/invoices/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new ApiError(response.message || 'Failed to delete invoice');
    }
  },

  send: async (id: string): Promise<void> => {
    const response = await apiRequest(`/invoices/${id}/send`, {
      method: 'POST',
    });
    
    if (!response.success) {
      throw new ApiError(response.message || 'Failed to send invoice');
    }
  },

  markPaid: async (id: string, paidAmount: number): Promise<void> => {
    const response = await apiRequest(`/invoices/${id}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify({ paidAmount }),
    });
    
    if (!response.success) {
      throw new ApiError(response.message || 'Failed to mark invoice as paid');
    }
  },
};

// Expenses API
export const expensesApi = {
  getAll: async (params?: { 
    status?: string;
    category?: string;
    clientId?: string;
    caseId?: string;
    createdBy?: string;
    isBillable?: boolean;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number; 
    limit?: number; 
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ expenses: Expense[]; pagination: any }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    const response = await apiRequest<{ expenses: Expense[]; pagination: any }>(`/expenses${query ? `?${query}` : ''}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch expenses');
  },

  getById: async (id: string): Promise<Expense> => {
    const response = await apiRequest<Expense>(`/expenses/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch expense');
  },

  create: async (expense: CreateExpense): Promise<Expense> => {
    const response = await apiRequest<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to create expense');
  },

  update: async (id: string, updates: UpdateExpense): Promise<Expense> => {
    const response = await apiRequest<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to update expense');
  },

  delete: async (id: string): Promise<void> => {
    const response = await apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new ApiError(response.message || 'Failed to delete expense');
    }
  },

  bulkUpdate: async (expenseIds: string[], status: string): Promise<{ updatedCount: number }> => {
    const response = await apiRequest<{ updatedCount: number }>('/expenses/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ expenseIds, status }),
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to bulk update expenses');
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiRequest<string[]>('/expenses/categories');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new ApiError(response.message || 'Failed to fetch expense categories');
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  clients: clientsApi,
  cases: casesApi,
  timeEntries: timeEntriesApi,
  documents: documentsApi,
  invoices: invoicesApi,
  expenses: expensesApi,
};

export default api; 