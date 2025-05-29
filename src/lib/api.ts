// API Service Layer for Sebenza System
import { 
  Client, 
  Case, 
  TimeEntry, 
  User, 
  Document, 
  Invoice,
  CreateClient,
  UpdateClient,
  CreateCase,
  UpdateCase,
  CreateTimeEntry,
  UpdateTimeEntry
} from './schemas';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const API_TIMEOUT = 10000; // 10 seconds

// Response wrapper type
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
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
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || `Request failed with status ${response.status}`,
        response.status,
        errorData?.errors
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout');
    }
    
    throw new ApiError('Network error occurred');
  }
}

// Client API
export const clientsApi = {
  getAll: async (params?: { 
    status?: string; 
    search?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<{ clients: Client[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const query = searchParams.toString();
    return apiRequest(`/clients${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<Client> => {
    return apiRequest(`/clients/${id}`);
  },

  create: async (client: CreateClient): Promise<Client> => {
    return apiRequest('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  },

  update: async (id: string, updates: UpdateClient): Promise<Client> => {
    return apiRequest(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/clients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cases API
export const casesApi = {
  getAll: async (params?: { 
    status?: string; 
    practiceArea?: string;
    clientId?: string;
    assignedTo?: string;
    search?: string; 
    page?: number; 
    limit?: number; 
  }): Promise<{ cases: Case[]; total: number }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return apiRequest(`/cases${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<Case> => {
    return apiRequest(`/cases/${id}`);
  },

  create: async (caseData: CreateCase): Promise<Case> => {
    return apiRequest('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  },

  update: async (id: string, updates: UpdateCase): Promise<Case> => {
    return apiRequest(`/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/cases/${id}`, {
      method: 'DELETE',
    });
  },
};

// Time Entries API
export const timeEntriesApi = {
  getAll: async (params?: { 
    caseId?: string;
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number; 
    limit?: number; 
  }): Promise<{ timeEntries: TimeEntry[]; total: number }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return apiRequest(`/time-entries${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<TimeEntry> => {
    return apiRequest(`/time-entries/${id}`);
  },

  create: async (timeEntry: CreateTimeEntry): Promise<TimeEntry> => {
    return apiRequest('/time-entries', {
      method: 'POST',
      body: JSON.stringify(timeEntry),
    });
  },

  update: async (id: string, updates: UpdateTimeEntry): Promise<TimeEntry> => {
    return apiRequest(`/time-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/time-entries/${id}`, {
      method: 'DELETE',
    });
  },

  submit: async (id: string): Promise<TimeEntry> => {
    return apiRequest(`/time-entries/${id}/submit`, {
      method: 'POST',
    });
  },

  approve: async (id: string): Promise<TimeEntry> => {
    return apiRequest(`/time-entries/${id}/approve`, {
      method: 'POST',
    });
  },
};

// Documents API
export const documentsApi = {
  getAll: async (params?: { 
    caseId?: string;
    clientId?: string;
    type?: string;
    search?: string;
    page?: number; 
    limit?: number; 
  }): Promise<{ documents: Document[]; total: number }> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return apiRequest(`/documents${query ? `?${query}` : ''}`);
  },

  getById: async (id: string): Promise<Document> => {
    return apiRequest(`/documents/${id}`);
  },

  upload: async (file: File, metadata: {
    name: string;
    type: string;
    caseId?: string;
    clientId?: string;
    tags?: string[];
    isConfidential?: boolean;
  }): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return apiRequest('/documents', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },

  update: async (id: string, updates: Partial<Document>): Promise<Document> => {
    return apiRequest(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  download: async (id: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new ApiError(`Download failed with status ${response.status}`);
    }

    return response.blob();
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    return apiRequest('/users');
  },

  getById: async (id: string): Promise<User> => {
    return apiRequest(`/users/${id}`);
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest('/users/me');
  },

  update: async (id: string, updates: Partial<User>): Promise<User> => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};

// Authentication API
export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<{
    user: User;
    token: string;
    refreshToken: string;
  }> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<void> => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  refreshToken: async (refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
  }> => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  resetPassword: async (email: string): Promise<void> => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// Reports API
export const reportsApi = {
  getDashboardStats: async (): Promise<{
    totalRevenue: number;
    activeClients: number;
    activeCases: number;
    billableHours: number;
    revenueGrowth: number;
    newClientsThisMonth: number;
    casesClosedThisMonth: number;
    averageHourlyRate: number;
  }> => {
    return apiRequest('/reports/dashboard');
  },

  getTimeReport: async (params: {
    startDate: string;
    endDate: string;
    userId?: string;
    caseId?: string;
  }): Promise<{
    totalHours: number;
    billableHours: number;
    totalAmount: number;
    entries: TimeEntry[];
  }> => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/reports/time?${searchParams.toString()}`);
  },

  getFinancialReport: async (params: {
    startDate: string;
    endDate: string;
    practiceArea?: string;
  }): Promise<{
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
    invoicesSent: number;
    invoicesPaid: number;
    outstandingAmount: number;
  }> => {
    const searchParams = new URLSearchParams(params);
    return apiRequest(`/reports/financial?${searchParams.toString()}`);
  },
};

// Mock data service (fallback when API is not available)
export const mockDataService = {
  isEnabled: !process.env.REACT_APP_API_BASE_URL,
  
  generateMockClients: (): Client[] => [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      phone: '(555) 123-4567',
      company: 'Smith Industries',
      status: 'active',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      phone: '(555) 987-6543',
      status: 'active',
      createdAt: new Date('2024-02-01'),
    },
  ],

  generateMockCases: (): Case[] => [
    {
      id: '1',
      title: 'Contract Negotiation - Smith Industries',
      caseNumber: 'CASE-2024-001',
      clientId: '1',
      practiceArea: 'Corporate',
      status: 'active',
      priority: 'high',
      openedDate: new Date('2024-01-20'),
      assignedAttorneys: ['1'],
      budget: 50000,
      estimatedHours: 120,
      actualHours: 45,
      description: 'Contract negotiation for major acquisition',
    },
    {
      id: '2',
      title: 'Employment Dispute Resolution',
      caseNumber: 'CASE-2024-002',
      clientId: '2',
      practiceArea: 'Litigation',
      status: 'active',
      priority: 'medium',
      openedDate: new Date('2024-02-05'),
      assignedAttorneys: ['2'],
      budget: 25000,
      estimatedHours: 60,
      actualHours: 18,
      description: 'Employment dispute mediation and resolution',
    },
  ],
}; 